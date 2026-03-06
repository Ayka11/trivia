const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const { FieldValue } = admin.firestore;

setGlobalOptions({ maxInstances: 20, region: 'us-central1' });

function requireAuth(request) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }
  return request.auth.uid;
}

function pickRandom(items, count) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function sanitizeQuestion(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    type: data.type,
    packId: data.packId,
    difficulty: data.difficulty,
    tags: data.tags || [],
    prompt: data.prompt,
    answerFormat: data.answerFormat,
    options: data.options || [],
    explanation: data.explanation,
    imageUrl: data.imageUrl || null,
    audioUrl: data.audioUrl || null,
    videoUrl: data.videoUrl || null,
    mediaCaption: data.mediaCaption || null,
    mediaTranscript: data.mediaTranscript || null,
    media: Array.isArray(data.media) ? data.media : [],
    rewardCoins: data.rewardCoins || 0,
    solveTimeTargetSec: data.solveTimeTargetSec || null,
    locale: data.locale || 'en-US',
  };
}

function normalizeAnswer(answerPayload) {
  if (answerPayload === null || answerPayload === undefined) {
    return {};
  }
  if (typeof answerPayload === 'string') {
    return { optionIds: [answerPayload] };
  }
  if (Array.isArray(answerPayload)) {
    return { optionIds: answerPayload.map(String) };
  }

  const normalized = {};
  if (answerPayload.optionId) {
    normalized.optionIds = [String(answerPayload.optionId)];
  } else if (Array.isArray(answerPayload.optionIds)) {
    normalized.optionIds = answerPayload.optionIds.map(String);
  }

  if (typeof answerPayload.text === 'string') {
    normalized.text = answerPayload.text;
  }

  return normalized;
}

function evaluateAnswer(questionData, normalizedAnswer) {
  const format = questionData.answerFormat;
  const correct = questionData.correctAnswer || {};

  if (format === 'single_choice' || format === 'multi_choice') {
    const expected = Array.isArray(correct.optionIds) ? [...correct.optionIds].map(String).sort() : [];
    const received = Array.isArray(normalizedAnswer.optionIds)
      ? [...normalizedAnswer.optionIds].map(String).sort()
      : [];

    const isCorrect = expected.length > 0
      && expected.length === received.length
      && expected.every((v, i) => v === received[i]);

    return { isCorrect };
  }

  if (format === 'text') {
    const expectedText = typeof correct.text === 'string' ? correct.text.trim().toLowerCase() : '';
    const receivedText = typeof normalizedAnswer.text === 'string' ? normalizedAnswer.text.trim().toLowerCase() : '';
    return { isCorrect: expectedText.length > 0 && expectedText === receivedText };
  }

  throw new HttpsError('failed-precondition', `Unsupported answerFormat: ${format}`);
}

function calcSpeedBonus({ scoring, rules, questionData, timeSpentSec }) {
  if (!scoring.speedBonusEnabled) return 0;
  if (!rules.solveTimeTargetEnabled) return 0;

  const target = Number(questionData.solveTimeTargetSec || rules.solveTimeSeconds || 0);
  if (!target || target <= 0) return 0;

  const spent = Number(timeSpentSec || 0);
  if (spent <= 0 || spent > target) return 0;

  const maxBonus = Number(scoring.speedBonusMaxCoins || 0);
  if (maxBonus <= 0) return 0;

  const ratio = Math.max(0, Math.min(1, (target - spent) / target));
  return Math.floor(maxBonus * ratio);
}

exports.startSession = onCall(async (request) => {
  const uid = requireAuth(request);
  const data = request.data || {};

  const modeId = typeof data.modeId === 'string' ? data.modeId : 'standard';
  const packId = typeof data.packId === 'string' ? data.packId : null;
  const difficulty = typeof data.difficulty === 'string' ? data.difficulty : null;
  const questionCount = Math.min(Math.max(Number(data.questionCount || 5), 1), 10);

  const modeRef = db.collection('modes').doc(modeId);
  const modeSnap = await modeRef.get();
  if (!modeSnap.exists) {
    throw new HttpsError('not-found', `Mode not found: ${modeId}`);
  }

  const modeData = modeSnap.data();
  if (!modeData.enabled) {
    throw new HttpsError('failed-precondition', `Mode disabled: ${modeId}`);
  }

  let query = db.collection('questions').where('active', '==', true);
  if (packId) query = query.where('packId', '==', packId);
  if (difficulty) query = query.where('difficulty', '==', difficulty);

  let snap = await query.limit(100).get();

  if (snap.empty) {
    snap = await db.collection('questions').where('active', '==', true).limit(100).get();
  }

  if (snap.empty) {
    throw new HttpsError('failed-precondition', 'No active questions found.');
  }

  const selectedDocs = pickRandom(snap.docs, questionCount);
  const selectedIds = selectedDocs.map((d) => d.id);
  const selectedQuestions = selectedDocs.map(sanitizeQuestion);

  const sessionRef = db.collection('sessions').doc();
  await sessionRef.set({
    userId: uid,
    modeId,
    packId,
    difficulty,
    status: 'active',
    questionIds: selectedIds,
    answers: {},
    totals: {
      correct: 0,
      wrong: 0,
      unanswered: selectedIds.length,
      totalTimeSec: 0,
      hintsUsedCount: 0,
      coinsEarned: 0,
      coinsSpent: 0,
      coinsNet: 0,
    },
    antiCheat: {
      serverValidated: true,
      flags: [],
    },
    startedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    sessionId: sessionRef.id,
    modeId,
    questionCount: selectedQuestions.length,
    questions: selectedQuestions,
  };
});

exports.submitAnswer = onCall(async (request) => {
  const uid = requireAuth(request);
  const data = request.data || {};

  const sessionId = typeof data.sessionId === 'string' ? data.sessionId : '';
  const questionId = typeof data.questionId === 'string' ? data.questionId : '';
  const timeSpentSec = Number(data.timeSpentSec || 0);
  const normalizedAnswer = normalizeAnswer(data.answer);

  if (!sessionId || !questionId) {
    throw new HttpsError('invalid-argument', 'sessionId and questionId are required.');
  }

  const sessionRef = db.collection('sessions').doc(sessionId);

  const result = await db.runTransaction(async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists) {
      throw new HttpsError('not-found', 'Session not found.');
    }

    const session = sessionSnap.data();
    if (session.userId !== uid) {
      throw new HttpsError('permission-denied', 'Cannot submit to another user\'s session.');
    }
    if (session.status !== 'active') {
      throw new HttpsError('failed-precondition', `Session is ${session.status}.`);
    }

    const questionIds = Array.isArray(session.questionIds) ? session.questionIds : [];
    if (!questionIds.includes(questionId)) {
      throw new HttpsError('invalid-argument', 'Question is not part of this session.');
    }

    const modeRef = db.collection('modes').doc(session.modeId);
    const questionRef = db.collection('questions').doc(questionId);

    const [modeSnap, questionSnap, userSnap] = await Promise.all([
      tx.get(modeRef),
      tx.get(questionRef),
      tx.get(db.collection('users').doc(uid)),
    ]);

    if (!modeSnap.exists) {
      throw new HttpsError('failed-precondition', `Mode missing: ${session.modeId}`);
    }
    if (!questionSnap.exists) {
      throw new HttpsError('failed-precondition', `Question missing: ${questionId}`);
    }

    const mode = modeSnap.data();
    const question = questionSnap.data();
    const answers = session.answers || {};
    const prevState = answers[questionId] || { attemptsUsed: 0, finalized: false };

    const attemptLimit = Number(mode.rules?.attemptLimit ?? 1);
    if (prevState.finalized) {
      throw new HttpsError('failed-precondition', 'Question already finalized.');
    }
    if (attemptLimit > 0 && prevState.attemptsUsed >= attemptLimit) {
      throw new HttpsError('failed-precondition', 'Attempt limit reached for this question.');
    }

    const attemptNumber = Number(prevState.attemptsUsed || 0) + 1;
    const { isCorrect } = evaluateAnswer(question, normalizedAnswer);
    const isFinalAttempt = attemptLimit > 0 ? attemptNumber >= attemptLimit : false;
    const finalized = isCorrect || isFinalAttempt;

    const scoring = mode.scoring || {};
    const rules = mode.rules || {};
    let coinsDelta = 0;

    if (isCorrect) {
      const base = Number(scoring.baseCorrectCoins || question.rewardCoins || 0);
      const speedBonus = calcSpeedBonus({ scoring, rules, questionData: question, timeSpentSec });
      coinsDelta = base + speedBonus;
    } else if (finalized) {
      coinsDelta = Number(scoring.wrongAnswerPenaltyCoins || 0);
    }

    answers[questionId] = {
      answer: normalizedAnswer,
      attemptsUsed: attemptNumber,
      isCorrect,
      finalized,
      timeSpentSec,
      coinsDelta,
      answeredAt: FieldValue.serverTimestamp(),
    };

    const allStates = Object.values(answers);
    const finalizedStates = allStates.filter((s) => s.finalized);
    const totalCorrect = finalizedStates.filter((s) => s.isCorrect).length;
    const totalWrong = finalizedStates.filter((s) => !s.isCorrect).length;
    const totalTimeSec = allStates.reduce((sum, s) => sum + Number(s.timeSpentSec || 0), 0);
    const coinsNet = allStates.reduce((sum, s) => sum + Number(s.coinsDelta || 0), 0);
    const unanswered = Math.max(questionIds.length - finalizedStates.length, 0);

    const nextStatus = unanswered === 0 ? 'completed' : 'active';

    tx.update(sessionRef, {
      answers,
      status: nextStatus,
      endedAt: nextStatus === 'completed' ? FieldValue.serverTimestamp() : session.endedAt || null,
      totals: {
        correct: totalCorrect,
        wrong: totalWrong,
        unanswered,
        totalTimeSec,
        hintsUsedCount: 0,
        coinsEarned: allStates.filter((s) => Number(s.coinsDelta || 0) > 0).reduce((sum, s) => sum + Number(s.coinsDelta), 0),
        coinsSpent: Math.abs(allStates.filter((s) => Number(s.coinsDelta || 0) < 0).reduce((sum, s) => sum + Number(s.coinsDelta), 0)),
        coinsNet,
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    let newBalance = null;
    if (coinsDelta !== 0 && finalized) {
      const ledgerId = `${sessionId}_${questionId}_${attemptNumber}`;
      const ledgerRef = db.collection('coinLedger').doc(ledgerId);
      const currentBalance = userSnap.exists ? Number(userSnap.data().coinsBalance || 0) : 0;
      newBalance = currentBalance + coinsDelta;

      if (userSnap.exists) {
        tx.update(userSnap.ref, {
          coinsBalance: newBalance,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        tx.set(db.collection('users').doc(uid), {
          coinsBalance: newBalance,
          xp: 0,
          streakDays: 0,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      tx.set(ledgerRef, {
        userId: uid,
        type: coinsDelta > 0 ? 'reward_correct' : 'wrong_penalty',
        amount: coinsDelta,
        balanceAfter: newBalance,
        refId: sessionId,
        idempotencyKey: ledgerId,
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: false });
    }

    return {
      sessionId,
      questionId,
      isCorrect,
      finalized,
      attemptNumber,
      coinsDelta,
      coinsBalance: newBalance,
      sessionStatus: nextStatus,
      totals: {
        correct: totalCorrect,
        wrong: totalWrong,
        unanswered,
        totalTimeSec,
        coinsNet,
      },
    };
  });

  return result;
});
// --- Coin values for actions ---
const COIN_VALUES = {
  dailyQuest: 10,
  puzzle: 15,
  trivia: 10,
  watchAd: 20,
  affiliateOffer: 200, // min, can be set per-offer
};

// --- Reward costs ---
const REWARD_COSTS = {
  paypal1: 1000,
  coupon: 200,
  mysteryBox: 150,
};

// --- Reward Redemption Endpoint ---
exports.redeemReward = onCall(async (request) => {
  const uid = requireAuth(request);
  const { rewardType } = request.data || {};
  if (!REWARD_COSTS[rewardType]) {
    throw new HttpsError('invalid-argument', 'Invalid reward type.');
  }
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new HttpsError('not-found', 'User not found.');
  const balance = Number(userSnap.data().coinsBalance || 0);
  const cost = REWARD_COSTS[rewardType];
  if (balance < cost) throw new HttpsError('failed-precondition', 'Insufficient coins.');
  // Safeguard: payout only if user generated revenue
  // (MVP: allow, but add checks for abuse in production)
  await userRef.update({ coinsBalance: balance - cost, updatedAt: FieldValue.serverTimestamp() });
  // Log redemption
  await db.collection('rewardRedemptions').add({
    userId: uid,
    rewardType,
    coinsSpent: cost,
    createdAt: FieldValue.serverTimestamp(),
  });
  // TODO: trigger PayPal payout, coupon delivery, or mystery box logic
  return { success: true, rewardType, coinsBalance: balance - cost };
});

// --- Referral System Endpoint ---
exports.referFriend = onCall(async (request) => {
  const uid = requireAuth(request);
  const { referralCode } = request.data || {};
  if (!referralCode) throw new HttpsError('invalid-argument', 'Referral code required.');
  const refUserSnap = await db.collection('users').doc(referralCode).get();
  if (!refUserSnap.exists) throw new HttpsError('not-found', 'Referral user not found.');
  // Prevent self-referral
  if (referralCode === uid) throw new HttpsError('failed-precondition', 'Cannot refer yourself.');
  // Award coins to both users
  const refReward = 200;
  await db.collection('users').doc(uid).update({ coinsBalance: FieldValue.increment(refReward), updatedAt: FieldValue.serverTimestamp() });
  await db.collection('users').doc(referralCode).update({ coinsBalance: FieldValue.increment(refReward), updatedAt: FieldValue.serverTimestamp() });
  await db.collection('referrals').add({
    referrerId: referralCode,
    referredId: uid,
    coinsRewarded: refReward,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { success: true, coinsRewarded: refReward };
});

// --- Leaderboard Endpoint ---
exports.getLeaderboard = onCall(async (request) => {
  const topUsers = await db.collection('users')
    .orderBy('coinsBalance', 'desc')
    .limit(10)
    .get();
  const leaderboard = topUsers.docs.map(doc => ({
    userId: doc.id,
    coinsBalance: doc.data().coinsBalance || 0,
    streakDays: doc.data().streakDays || 0,
  }));
  return { leaderboard };
});
