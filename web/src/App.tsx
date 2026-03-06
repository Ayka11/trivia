import { useMemo, useState } from 'react';
import './index.css';
import { auth, ensureSignedIn, firebaseConfigError, startSession, submitAnswer } from './firebase';
import { redeemReward, referFriend, getLeaderboard, upgradePremium } from './firebase';
import type { LeaderboardEntry, SessionPayload } from './firebase';

function App() {
    // --- Backend Handlers ---
    async function handleRedeem(rewardType: string, cost: number) {
      if (coins < cost) return;
      setBusy(true);
      setMessage('');
      try {
        const res = await redeemReward(rewardType);
        setMessage(`Redeemed: ${rewardType}`);
        setCoins(res.data.coinsBalance);
      } catch (error) {
        setMessage(`Redeem failed: ${(error as Error).message}`);
      } finally {
        setBusy(false);
      }
    }

    async function handleReferral() {
      if (!referralCode) return;
      setBusy(true);
      setMessage('');
      try {
        const res = await referFriend(referralCode);
        setMessage(`Referral success! +${res.data.coinsRewarded} coins`);
        setCoins((prev) => prev + (res.data.coinsRewarded || 0));
        setReferralCode('');
      } catch (error) {
        setMessage(`Referral failed: ${(error as Error).message}`);
      } finally {
        setBusy(false);
      }
    }

    async function handleLeaderboard() {
      setBusy(true);
      try {
        const res = await getLeaderboard();
        setLeaderboard(res.data.leaderboard || []);
      } catch (error) {
        setMessage(`Leaderboard failed: ${(error as Error).message}`);
      } finally {
        setBusy(false);
      }
    }

    async function handleUpgradePremium() {
      setBusy(true);
      setMessage('');
      try {
        const res = await upgradePremium();
        if (res.data.success) {
          setPremium(true);
          setMessage('Premium upgraded!');
        }
      } catch (error) {
        setMessage(`Upgrade failed: ${(error as Error).message}`);
      } finally {
        setBusy(false);
      }
    }
  const [uid, setUid] = useState<string>('');
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [index, setIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [coins, setCoins] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [premium, setPremium] = useState<boolean>(false);
  const [shareMsg, setShareMsg] = useState<string>('I completed 12 quests today 🔥');

  const question = useMemo(() => {
    if (!session) return null;
    return session.questions[index] ?? null;
  }, [index, session]);

  async function handleSignIn() {
    setBusy(true);
    setMessage('');
    try {
      const user = await ensureSignedIn();
      setUid(user?.uid || '');
      setMessage(`Signed in: ${user?.uid}`);
      // Fetch user coins and premium status (placeholder)
      setCoins(0);
      setPremium(false);
      await handleLeaderboard();
    } catch (error) {
      setMessage(`Sign-in failed: ${(error as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleStartSession() {
    setBusy(true);
    setMessage('');
    try {
      await ensureSignedIn();
      const res = await startSession({
        modeId: 'multimedia_challenge',
        packId: 'multimedia_logic',
        questionCount: 3,
      });
      const payload: SessionPayload = res.data;
      setSession(payload);
      setIndex(0);
      setSelectedOption('');
      setMessage(`Session started: ${payload.sessionId}`);
      setUid(auth?.currentUser?.uid || '');
      // Reset progress bar
      setProgress(0);
    } catch (error) {
      setMessage(`startSession failed: ${(error as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!session || !question || !selectedOption) {
      setMessage('Select an option first.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const res = await submitAnswer({
        sessionId: session.sessionId,
        questionId: question.id,
        answer: { optionId: selectedOption },
        timeSpentSec: 20,
      });
      const data = res.data;

      setMessage(
        `Answer submitted. Correct=${data.isCorrect} | coinsDelta=${data.coinsDelta} | status=${data.sessionStatus}`,
      );
      setCoins((prev) => prev + (data.coinsDelta || 0));
      setProgress((prev) => Math.min(100, prev + 33)); // Example progress
      setSelectedOption('');
      if (index < session.questions.length - 1) {
        setIndex((prev) => prev + 1);
      }
    } catch (error) {
      setMessage(`submitAnswer failed: ${(error as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Reward & Earn: Micro-Quest App</h1>
        {firebaseConfigError && <pre className="msg">{firebaseConfigError}</pre>}
        <div className="user-info">
          <span>UID: {uid || 'not signed in'}</span>
          <span>Coins: <b>{coins}</b></span>
          <span>Premium: {premium ? 'Yes' : 'No'}</span>
        </div>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} />
          <span>{progress}% to next reward</span>
        </div>
        <div className="row">
          <button onClick={handleSignIn} disabled={busy || Boolean(firebaseConfigError)}>Sign In</button>
          <button onClick={handleStartSession} disabled={busy || Boolean(firebaseConfigError)}>Start Quest</button>
        </div>
        {/* Quest Section */}
        {question && (
          <div className="quest-section">
            <h2>Quest {index + 1}: {question.prompt}</h2>
            {/* Timer placeholder */}
            <div className="timer">00:30</div>
            {/* Media display logic */}
            <div className="media-block">
              {/* Single image */}
              {question.imageUrl && (
                <img className="mediaImage" src={question.imageUrl} alt="Quest visual clue" />
              )}
              {/* Single audio */}
              {question.audioUrl && (
                <audio className="mediaAudio" controls src={question.audioUrl}>
                  <track kind="captions" />
                </audio>
              )}
              {/* Single video */}
              {question.videoUrl && (
                <video className="mediaVideo" controls src={question.videoUrl} />
              )}
              {/* Media captions/transcripts */}
              {question.mediaCaption && <p className="mediaCaption">{question.mediaCaption}</p>}
              {question.mediaTranscript && <p className="mediaTranscript">{question.mediaTranscript}</p>}
              {/* Media array */}
              {Array.isArray(question.media) && question.media.length > 0 && question.media.map((item, idx) => {
                if (!item?.url) return null;
                if (item.type === 'audio') {
                  return (
                    <div key={item.url + idx}>
                      <audio className="mediaAudio" controls src={item.url} />
                      {item.transcript && <p className="mediaTranscript">{item.transcript}</p>}
                    </div>
                  );
                }
                if (item.type === 'video') {
                  return (
                    <div key={item.url + idx}>
                      <video className="mediaVideo" controls src={item.url} />
                      {item.transcript && <p className="mediaTranscript">{item.transcript}</p>}
                    </div>
                  );
                }
                // Default to image
                return (
                  <div key={item.url + idx}>
                    <img className="mediaImage" src={item.url} alt={item.altText || 'Quest visual clue'} />
                    {item.caption && <p className="mediaCaption">{item.caption}</p>}
                  </div>
                );
              })}
            </div>
            <div className="options">
              {(question.options || []).map((opt) => (
                <label key={opt.id} className="option">
                  <input
                    type="radio"
                    name="answer"
                    value={opt.id}
                    checked={selectedOption === opt.id}
                    onChange={() => setSelectedOption(opt.id)}
                  />
                  <span>{opt.id}. {opt.text}</span>
                </label>
              ))}
            </div>
            <button onClick={handleSubmitAnswer} disabled={busy || !selectedOption}>Complete Quest</button>
          </div>
        )}
        {/* Rewards Section */}
        <section className="rewards">
          <h2 style={{ color: '#6366f1', marginBottom: '0.5em' }}>🎁 Rewards & Redemption</h2>
          <div style={{ marginBottom: '1em', fontWeight: 500 }}>
            Your Coins: <span style={{ color: '#2563eb', fontWeight: 700 }}>{coins}</span>
          </div>
          <div className="reward-list">
            <div className="reward-item">
              <span>$1 PayPal</span>
              <span style={{ color: '#6366f1', fontWeight: 600 }}>1000 coins</span>
              <button disabled={coins < 1000 || busy} onClick={() => handleRedeem('paypal1', 1000)}>
                Redeem
              </button>
            </div>
            <div className="reward-item">
              <span>Coupon</span>
              <span style={{ color: '#6366f1', fontWeight: 600 }}>200 coins</span>
              <button disabled={coins < 200 || busy} onClick={() => handleRedeem('coupon', 200)}>
                Redeem
              </button>
            </div>
            <div className="reward-item">
              <span>Mystery Box</span>
              <span style={{ color: '#6366f1', fontWeight: 600 }}>150 coins</span>
              <button disabled={coins < 150 || busy} onClick={() => handleRedeem('mysteryBox', 150)}>
                Redeem
              </button>
            </div>
          </div>
          <div style={{ marginTop: '0.7em', fontSize: '0.95em', color: '#64748b' }}>
            Earn coins by completing quests, watching ads, or inviting friends. Redeem for real rewards!
          </div>
        </section>
        {/* Referral Section */}
        <section className="referral">
          <h3>Referral System</h3>
          <input
            type="text"
            placeholder="Enter referral code"
            value={referralCode}
            onChange={e => setReferralCode(e.target.value)}
          />
          <button disabled={!referralCode || busy} onClick={handleReferral}>Submit Referral</button>
          <button>Invite Friends</button>
        </section>
        {/* Leaderboard Section */}
        <section className="leaderboard">
          <h3>Leaderboard</h3>
          <ul>
            {leaderboard.map((user, idx) => (
              <li key={user.userId}>
                #{idx + 1} {user.userId.slice(0, 6)} — {user.coinsBalance} coins
              </li>
            ))}
          </ul>
        </section>
        {/* Premium Membership Section */}
        <section className="premium">
          <h3>Premium Membership</h3>
          <p>$3/month: double coins, no ads, exclusive quests, premium themes</p>
          <button disabled={premium || busy} onClick={handleUpgradePremium}>Upgrade to Premium</button>
        </section>
        {/* Social Sharing Section */}
        <section className="sharing">
          <h3>Share Your Progress</h3>
          <input
            type="text"
            value={shareMsg}
            onChange={e => setShareMsg(e.target.value)}
          />
          <button>Share to TikTok</button>
          <button>Share to Instagram</button>
        </section>
        {message && <pre className="msg">{message}</pre>}
      </section>
    </main>
  );
}

export default App;
