import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { QUESTS } from '@/data/quests';
import QuestCard from './QuestCard';
import { ArrowRight, Sparkles, TrendingUp, Flame } from 'lucide-react';

const FeaturedQuests: React.FC = () => {
  const { setActiveView, questsCompletedToday } = useGame();

  // Show 6 featured quests (mix of types)
  const featured = QUESTS.filter(q => !q.premium).slice(0, 6);

  return (
    <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Today's Quests</h2>
          {questsCompletedToday > 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">
              {questsCompletedToday} done
            </span>
          )}
        </div>
        <button
          onClick={() => setActiveView('quests')}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 group"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Quest grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featured.map(quest => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <button
          onClick={() => setActiveView('offers')}
          className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-4 text-left hover:border-emerald-400/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Offer Wall</h3>
              <p className="text-slate-400 text-xs">Earn 150-1500 coins</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => setActiveView('rewards')}
          className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-4 text-left hover:border-pink-400/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Reward Shop</h3>
              <p className="text-slate-400 text-xs">Redeem for cash & prizes</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => setActiveView('leaderboard')}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 text-left hover:border-amber-400/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Leaderboard</h3>
              <p className="text-slate-400 text-xs">Compete for top spots</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default FeaturedQuests;
