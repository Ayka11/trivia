import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Zap, Gift, Flame, Trophy, ArrowRight, Coins, Clock, Star } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { setActiveView, streak, questsCompletedToday, dailyBonusClaimed, claimDailyBonus, coins } = useGame();

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.1),transparent_50%)]" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-40 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-purple-300 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Earn real rewards in 30 seconds
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Complete Tiny Quests.{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                Earn Real Cash.
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
              Drink water, solve puzzles, learn new words — each quest takes just 30 seconds. 
              Stack coins and redeem for PayPal cash, gift cards, and exclusive rewards.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveView('quests')}
                className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center gap-2"
              >
                Start Earning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setActiveView('rewards')}
                className="bg-white/5 border border-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Gift className="w-5 h-5 text-pink-400" />
                View Rewards
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>30-90 sec per quest</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>$1 = 1,200 coins</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Star className="w-4 h-4 text-pink-400" />
                <span>20+ daily quests</span>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Preview Cards */}
          <div className="space-y-4">
            {/* Daily Bonus Card */}
            {!dailyBonusClaimed ? (
              <button
                onClick={claimDailyBonus}
                className="w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5 text-left hover:border-amber-400/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Daily Bonus Ready!</h3>
                      <p className="text-amber-300/70 text-sm">Tap to claim {20 + streak * 5} coins</p>
                    </div>
                  </div>
                  <div className="bg-amber-500 text-white font-bold px-4 py-2 rounded-lg text-sm group-hover:bg-amber-400 transition-colors">
                    CLAIM
                  </div>
                </div>
              </button>
            ) : (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Daily Bonus Claimed!</h3>
                    <p className="text-emerald-300/70 text-sm">Come back tomorrow for more</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4 text-center">
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-white">{streak}</div>
                <div className="text-xs text-slate-400">Day Streak</div>
              </div>
              <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4 text-center">
                <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-white">{questsCompletedToday}</div>
                <div className="text-xs text-slate-400">Today</div>
              </div>
              <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4 text-center">
                <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-white">{coins.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Coins</div>
              </div>
            </div>

            {/* Streak Bonus Info */}
            <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4">
              <h4 className="text-white font-semibold text-sm mb-3">Streak Multiplier</h4>
              <div className="flex gap-2">
                {[
                  { days: 3, mult: '1.2x', active: streak >= 3 },
                  { days: 7, mult: '1.5x', active: streak >= 7 },
                  { days: 14, mult: '2x', active: streak >= 14 },
                  { days: 30, mult: '3x', active: streak >= 30 },
                ].map(s => (
                  <div
                    key={s.days}
                    className={`flex-1 text-center p-2 rounded-lg border ${
                      s.active
                        ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                        : 'bg-slate-800/50 border-white/5 text-slate-500'
                    }`}
                  >
                    <div className="text-xs font-bold">{s.mult}</div>
                    <div className="text-[10px] mt-0.5">{s.days}d</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
