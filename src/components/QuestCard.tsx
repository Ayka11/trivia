import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Quest, DIFFICULTY_COLORS } from '@/data/quests';
import {
  Droplets, Dumbbell, BookOpen, Sparkles, Brain, Grid3x3, Eye, Activity,
  Wind, Zap, Heart, Calculator, Timer, Target, Crown, PenLine, ArrowUp,
  GraduationCap, Footprints, Lock, Clock, Coins
} from 'lucide-react';

const iconMap: Record<string, React.FC<any>> = {
  Droplets, Dumbbell, BookOpen, Sparkles, Brain, Grid3x3, Eye, Activity,
  Wind, Zap, Heart, Calculator, Timer, Target, Crown, PenLine, ArrowUp,
  GraduationCap, Footprints,
};

interface QuestCardProps {
  quest: Quest;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
  const { setActiveQuest, getQuestCompletionsToday, user } = useGame();
  const completions = getQuestCompletionsToday(quest.id);
  const isMaxed = completions >= quest.dailyLimit;
  const isLocked = quest.premium && !user.isPremium;
  const IconComponent = iconMap[quest.icon] || Zap;

  return (
    <div
      className={`group relative bg-slate-800/50 border rounded-2xl p-4 transition-all duration-300 hover:shadow-xl ${
        isMaxed
          ? 'border-emerald-500/20 opacity-60'
          : isLocked
          ? 'border-amber-500/20'
          : 'border-white/5 hover:border-purple-500/30 hover:shadow-purple-500/10 hover:-translate-y-1'
      }`}
    >
      {/* Premium badge */}
      {quest.premium && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
          <Crown className="w-3 h-3" />
          PRO
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: quest.color + '20' }}
        >
          <IconComponent className="w-6 h-6" style={{ color: quest.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold text-sm truncate">{quest.title}</h3>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase"
              style={{
                backgroundColor: DIFFICULTY_COLORS[quest.difficulty] + '20',
                color: DIFFICULTY_COLORS[quest.difficulty],
              }}
            >
              {quest.difficulty}
            </span>
          </div>
          <p className="text-slate-400 text-xs line-clamp-1 mb-2">{quest.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 text-xs font-bold">+{quest.coins}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400 text-xs">{quest.timeSeconds}s</span>
              </div>
            </div>

            {isMaxed ? (
              <span className="text-emerald-400 text-xs font-medium">Done today</span>
            ) : isLocked ? (
              <button className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-500/20">
                <Lock className="w-3 h-3" />
                Premium
              </button>
            ) : (
              <button
                onClick={() => setActiveQuest(quest)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-md shadow-purple-500/20 hover:shadow-purple-500/30"
              >
                Start
              </button>
            )}
          </div>

          {/* Completion indicator */}
          {completions > 0 && !isMaxed && (
            <div className="mt-2 flex items-center gap-1">
              <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${(completions / quest.dailyLimit) * 100}%` }}
                />
              </div>
              <span className="text-slate-500 text-[10px]">{completions}/{quest.dailyLimit}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestCard;
