import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { QUESTS, QUEST_TYPE_LABELS, QuestType } from '@/data/quests';
import QuestCard from './QuestCard';
import { Sparkles, Filter } from 'lucide-react';

const QuestCatalog: React.FC = () => {
  const { questFilter, setQuestFilter } = useGame();

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Quests' },
    ...Object.entries(QUEST_TYPE_LABELS).map(([key, label]) => ({ key, label })),
  ];

  const filteredQuests = questFilter === 'all'
    ? QUESTS
    : QUESTS.filter(q => q.type === questFilter);

  return (
    <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Daily Quests</h2>
          <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">
            {filteredQuests.length}
          </span>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setQuestFilter(cat.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              questFilter === cat.key
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quest grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuests.map(quest => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    </section>
  );
};

export default QuestCatalog;
