const admin = require('firebase-admin');

function initAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
}

function sanitizeUid(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

async function getLatestSessionForUser(db, uid) {
  const snap = await db
    .collection('sessions')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  return snap.docs[0];
}

function sumLedger(entries) {
  return entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
}

async function runHighValueChecks({ uid, sessionId }) {
  const db = initAdmin();
  const resolvedUid = sanitizeUid(uid);
  if (!resolvedUid) {
    throw new Error('uid is required.');
  }

  let sessionSnap;
  if (sessionId && String(sessionId).trim()) {
    sessionSnap = await db.collection('sessions').doc(String(sessionId).trim()).get();
    if (!sessionSnap.exists) {
      throw new Error(`Session not found: ${sessionId}`);
    }
  } else {
    sessionSnap = await getLatestSessionForUser(db, resolvedUid);
    if (!sessionSnap) {
      throw new Error(`No sessions found for uid: ${resolvedUid}`);
    }
  }

  const sessionData = sessionSnap.data();
  const actualSessionId = sessionSnap.id;

  const failures = [];

  if (sessionData.userId !== resolvedUid) {
    failures.push(`session.userId mismatch: expected ${resolvedUid}, found ${sessionData.userId}`);
  }

  const answers = sessionData.answers || {};
  const answerKeys = Object.keys(answers);
  const finalizedEntries = answerKeys
    .map((qid) => ({ questionId: qid, ...answers[qid] }))
    .filter((entry) => Boolean(entry.finalized));

  const answerCoinsNet = finalizedEntries.reduce(
    (sum, entry) => sum + Number(entry.coinsDelta || 0),
    0,
  );

  const totalsCoinsNet = Number(sessionData.totals?.coinsNet || 0);
  if (totalsCoinsNet !== answerCoinsNet) {
    failures.push(`session.totals.coinsNet=${totalsCoinsNet} but finalized answer sum=${answerCoinsNet}`);
  }

  const ledgerSnap = await db
    .collection('coinLedger')
    .where('userId', '==', resolvedUid)
    .where('refId', '==', actualSessionId)
    .get();

  const ledgerEntries = ledgerSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const ledgerNet = sumLedger(ledgerEntries);

  if (ledgerNet !== answerCoinsNet) {
    failures.push(`coinLedger net=${ledgerNet} but session answer net=${answerCoinsNet}`);
  }

  const duplicateIdempotency = new Set();
  for (const entry of ledgerEntries) {
    const key = entry.idempotencyKey;
    if (!key) {
      failures.push(`coinLedger entry ${entry.id} missing idempotencyKey`);
      continue;
    }
    if (duplicateIdempotency.has(key)) {
      failures.push(`duplicate idempotencyKey found: ${key}`);
    }
    duplicateIdempotency.add(key);
  }

  const userSnap = await db.collection('users').doc(resolvedUid).get();
  if (!userSnap.exists) {
    failures.push('users/{uid} document is missing');
  }

  const balance = userSnap.exists ? Number(userSnap.data().coinsBalance || 0) : null;
  const latestLedgerForUserSnap = await db
    .collection('coinLedger')
    .where('userId', '==', resolvedUid)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  let latestLedgerBalance = null;
  if (!latestLedgerForUserSnap.empty) {
    latestLedgerBalance = Number(latestLedgerForUserSnap.docs[0].data().balanceAfter || 0);
    if (balance !== latestLedgerBalance) {
      failures.push(`users.coinsBalance=${balance} but latest ledger balanceAfter=${latestLedgerBalance}`);
    }
  }

  return {
    ok: failures.length === 0,
    uid: resolvedUid,
    sessionId: actualSessionId,
    checks: {
      sessionExists: true,
      sessionOwnerMatches: sessionData.userId === resolvedUid,
      sessionCoinsNetMatchesAnswers: totalsCoinsNet === answerCoinsNet,
      ledgerMatchesSessionNet: ledgerNet === answerCoinsNet,
      userBalanceMatchesLatestLedger: latestLedgerBalance === null ? null : balance === latestLedgerBalance,
    },
    metrics: {
      sessionCoinsNet: totalsCoinsNet,
      answerCoinsNet,
      ledgerNet,
      ledgerEntries: ledgerEntries.length,
      userBalance: balance,
      latestLedgerBalance,
      finalizedAnswers: finalizedEntries.length,
    },
    failures,
  };
}

module.exports = {
  runHighValueChecks,
};
