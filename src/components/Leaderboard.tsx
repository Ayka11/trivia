import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { LEADERBOARD_DATA } from '@/data/rewards';
import { Trophy, Flame, Crown, Medal, ChevronUp, Coins } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const { user, totalCoinsEarned, streak, level, isAuthenticated } = useGame();
  const [tab, setTab] = useState<'weekly' | 'alltime'>('weekly');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-slate-500 font-bold text-sm w-5 text-center">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/20';
    if (rank === 2) return 'bg-slate-500/5 border-slate-500/10';
    if (rank === 3) return 'bg-amber-700/5 border-amber-700/10';
    return 'bg-slate-800/30 border-white/5';
  };

  return (
    <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        </div>
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-white/5">
          <button
            onClick={() => setTab('weekly')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'weekly' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTab('alltime')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'alltime' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top 3 Podium */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Top Players</h3>
          {LEADERBOARD_DATA.slice(0, 3).map((player) => (
            <div
              key={player.rank}
              className={`border rounded-2xl p-4 transition-all hover:scale-[1.02] ${getRankBg(player.rank)}`}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(player.rank)}
                <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full border-2 border-white/10" />
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">{player.name}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Coins className="w-3 h-3 text-amber-400" />
                      {player.coins.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {player.streak}d
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">LVL</div>
                  <div className="text-white font-bold">{player.level}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Rankings */}
        <div className="lg:col-span-2">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Rankings</h3>
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-xs text-slate-500 font-medium">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-right">Coins</div>
              <div className="col-span-2 text-right">Streak</div>
              <div className="col-span-2 text-right">Level</div>
            </div>
            {LEADERBOARD_DATA.map((player) => (
              <div
                key={player.rank}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors items-center"
              >
                <div className="col-span-1">{getRankIcon(player.rank)}</div>
                <div className="col-span-5 flex items-center gap-2">
                  <img src={player.avatar} alt={player.name} className="w-7 h-7 rounded-full" />
                  <span className="text-white text-sm font-medium truncate">{player.name}</span>
                </div>
                <div className="col-span-2 text-right text-amber-300 text-sm font-medium">{player.coins.toLocaleString()}</div>
                <div className="col-span-2 text-right text-orange-300 text-sm">{player.streak}d</div>
                <div className="col-span-2 text-right text-purple-300 text-sm font-medium">{player.level}</div>
              </div>
            ))}

            {/* Your position */}
            {isAuthenticated && (
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-purple-500/10 border-t border-purple-500/20 items-center">
                <div className="col-span-1">
                  <ChevronUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="col-span-5 flex items-center gap-2">
                  <img src={user.avatar} alt="You" className="w-7 h-7 rounded-full border border-purple-500/50" />
                  <span className="text-purple-300 text-sm font-bold">You</span>
                </div>
                <div className="col-span-2 text-right text-amber-300 text-sm font-medium">{totalCoinsEarned.toLocaleString()}</div>
                <div className="col-span-2 text-right text-orange-300 text-sm">{streak}d</div>
                <div className="col-span-2 text-right text-purple-300 text-sm font-medium">{level}</div>
              </div>
            )}
          </div>

          {/* Tournament banner */}
          <div className="mt-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold">Weekly Tournament</h4>
                <p className="text-slate-400 text-sm">Top 10 players win bonus coins + PayPal cash! Ends Sunday.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
