import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Gift, Coins, X, Sparkles, Zap } from 'lucide-react';

const MYSTERY_REWARDS = [
  { label: '50 Coins', coins: 50, weight: 30, color: '#94A3B8' },
  { label: '100 Coins', coins: 100, weight: 25, color: '#3B82F6' },
  { label: '150 Coins', coins: 150, weight: 18, color: '#8B5CF6' },
  { label: '200 Coins', coins: 200, weight: 12, color: '#A855F7' },
  { label: '300 Coins', coins: 300, weight: 8, color: '#EC4899' },
  { label: '500 Coins', coins: 500, weight: 5, color: '#F59E0B' },
  { label: '2x Boost!', coins: 0, weight: 2, color: '#10B981', special: 'boost' },
];

const MysteryBox: React.FC = () => {
  const { mysteryBoxOpen, setMysteryBoxOpen, earnCoins } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<typeof MYSTERY_REWARDS[0] | null>(null);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    // Weighted random
    const totalWeight = MYSTERY_REWARDS.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    let selected = MYSTERY_REWARDS[0];
    for (const reward of MYSTERY_REWARDS) {
      random -= reward.weight;
      if (random <= 0) {
        selected = reward;
        break;
      }
    }

    setRotation(prev => prev + 1440 + Math.random() * 720);

    setTimeout(() => {
      setResult(selected);
      setSpinning(false);
      if (selected.coins > 0) {
        earnCoins(selected.coins, `Mystery Box: ${selected.label}`);
      }
    }, 3000);
  };

  useEffect(() => {
    if (mysteryBoxOpen) {
      setResult(null);
      setSpinning(false);
      // Auto-spin on open
      setTimeout(spin, 500);
    }
  }, [mysteryBoxOpen]);

  if (!mysteryBoxOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-400" />
            <span className="text-white font-semibold">Mystery Box</span>
          </div>
          <button onClick={() => setMysteryBoxOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-6">
          {/* Spinning box */}
          <div className="relative w-40 h-40 mx-auto">
            <div
              className={`w-full h-full rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 transition-transform duration-[3000ms] ease-out ${
                spinning ? 'animate-pulse' : ''
              }`}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {result ? (
                <div className="text-center">
                  <Sparkles className="w-10 h-10 text-white mx-auto mb-1" />
                </div>
              ) : (
                <Gift className="w-16 h-16 text-white/80" />
              )}
            </div>

            {/* Glow effect */}
            {spinning && (
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 animate-ping" />
            )}
          </div>

          {/* Result */}
          {result ? (
            <div className="space-y-3 animate-in fade-in duration-500">
              <h3 className="text-white text-xl font-bold">You Won!</h3>
              <div
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-lg font-bold"
                style={{ backgroundColor: result.color + '20', color: result.color }}
              >
                {result.special ? (
                  <><Zap className="w-5 h-5" /> {result.label}</>
                ) : (
                  <><Coins className="w-5 h-5" /> {result.label}</>
                )}
              </div>
              <button
                onClick={() => setMysteryBoxOpen(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                Awesome!
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-white text-lg font-bold">
                {spinning ? 'Opening...' : 'Ready to spin?'}
              </h3>
              <p className="text-slate-400 text-sm">Win 50-500 coins or rare boosts!</p>
            </div>
          )}

          {/* Reward tiers */}
          <div className="grid grid-cols-4 gap-1.5">
            {MYSTERY_REWARDS.slice(0, 4).map((r, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-2 text-center">
                <div className="text-xs font-bold" style={{ color: r.color }}>{r.label.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-500">{r.weight}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MysteryBox;
