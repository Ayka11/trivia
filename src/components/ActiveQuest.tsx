import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { X, Check, Clock, Coins, Sparkles, ArrowRight } from 'lucide-react';

const ActiveQuest: React.FC = () => {
  const { activeQuest, setActiveQuest, completeQuest } = useGame();
  const [phase, setPhase] = useState<'intro' | 'active' | 'complete'>('intro');
  const [timer, setTimer] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaCorrect, setTriviaCorrect] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [memoryCards, setMemoryCards] = useState<{ id: number; value: string; flipped: boolean; matched: boolean }[]>([]);
  const [memoryFlipped, setMemoryFlipped] = useState<number[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [breathPhase, setBreathPhase] = useState('');

  const quest = activeQuest;

  // Reset state on quest change
  useEffect(() => {
    if (quest) {
      setPhase('intro');
      setTimer(quest.timeSeconds);
      setTriviaIndex(0);
      setTriviaCorrect(0);
      setSelectedAnswer(null);
      setMemoryFlipped([]);
      if (quest.interaction === 'word' && quest.data?.words) {
        setWordIndex(Math.floor(Math.random() * quest.data.words.length));
      }
      if (quest.interaction === 'memory') {
        const symbols = ['A', 'B', 'C', 'D', 'E', 'F'];
        const pairs = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        setMemoryCards(pairs.map((v, i) => ({ id: i, value: v, flipped: false, matched: false })));
      }
    }
  }, [quest]);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'active') return;
    if (timer <= 0) {
      handleComplete();
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, timer]);

  // Meditation breathing
  useEffect(() => {
    if (phase !== 'active' || quest?.interaction !== 'meditation') return;
    const phases = ['Breathe In...', 'Hold...', 'Breathe Out...', 'Hold...'];
    let i = 0;
    setBreathPhase(phases[0]);
    const interval = setInterval(() => {
      i = (i + 1) % phases.length;
      setBreathPhase(phases[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, [phase, quest]);

  const handleComplete = useCallback(() => {
    if (!quest) return;
    setPhase('complete');
    completeQuest(quest.id);
  }, [quest, completeQuest]);

  const handleTriviaAnswer = (answerIdx: number) => {
    if (!quest?.data?.questions || selectedAnswer !== null) return;
    setSelectedAnswer(answerIdx);
    const isCorrect = answerIdx === quest.data.questions[triviaIndex].answer;
    if (isCorrect) setTriviaCorrect(c => c + 1);

    setTimeout(() => {
      if (triviaIndex + 1 < Math.min(quest.data.questions.length, 3)) {
        setTriviaIndex(i => i + 1);
        setSelectedAnswer(null);
      } else {
        handleComplete();
      }
    }, 800);
  };

  const handleMemoryFlip = (cardId: number) => {
    if (memoryFlipped.length >= 2) return;
    const card = memoryCards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const newCards = memoryCards.map(c => c.id === cardId ? { ...c, flipped: true } : c);
    const newFlipped = [...memoryFlipped, cardId];
    setMemoryCards(newCards);
    setMemoryFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped.map(id => newCards.find(c => c.id === id)!);
      if (first.value === second.value) {
        setTimeout(() => {
          const matched = newCards.map(c =>
            c.id === first.id || c.id === second.id ? { ...c, matched: true } : c
          );
          setMemoryCards(matched);
          setMemoryFlipped([]);
          if (matched.every(c => c.matched)) handleComplete();
        }, 300);
      } else {
        setTimeout(() => {
          setMemoryCards(newCards.map(c =>
            c.id === first.id || c.id === second.id ? { ...c, flipped: false } : c
          ));
          setMemoryFlipped([]);
        }, 700);
      }
    }
  };

  if (!quest) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: quest.color + '20' }}>
              <Sparkles className="w-4 h-4" style={{ color: quest.color }} />
            </div>
            <span className="text-white font-semibold text-sm">{quest.title}</span>
          </div>
          <button onClick={() => setActiveQuest(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* INTRO PHASE */}
          {phase === 'intro' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center" style={{ backgroundColor: quest.color + '20' }}>
                <Sparkles className="w-10 h-10" style={{ color: quest.color }} />
              </div>
              <h2 className="text-white text-xl font-bold">{quest.title}</h2>
              <p className="text-slate-400 text-sm">{quest.description}</p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 text-sm">{quest.timeSeconds}s</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 text-sm font-bold">+{quest.coins}</span>
                </div>
              </div>
              <button
                onClick={() => setPhase('active')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                Start Quest
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ACTIVE PHASE */}
          {phase === 'active' && (
            <div className="space-y-4">
              {/* Timer bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Time remaining</span>
                  <span className="text-white font-mono font-bold">{timer}s</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(timer / quest.timeSeconds) * 100}%` }}
                  />
                </div>
              </div>

              {/* CONFIRM type */}
              {quest.interaction === 'confirm' && (
                <div className="text-center space-y-4 py-4">
                  <p className="text-white text-lg font-medium">{quest.description}</p>
                  <p className="text-slate-400 text-sm">Complete the task and tap "Done" when finished.</p>
                  <button
                    onClick={handleComplete}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 rounded-xl hover:from-emerald-400 hover:to-green-400 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    I Did It!
                  </button>
                </div>
              )}

              {/* TIMER type */}
              {quest.interaction === 'timer' && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-32 h-32 mx-auto rounded-full border-4 border-purple-500/30 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="64" cy="64" r="58"
                        fill="none" stroke="url(#timerGrad)" strokeWidth="4"
                        strokeDasharray={`${(timer / quest.timeSeconds) * 364} 364`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="timerGrad">
                          <stop offset="0%" stopColor="#7C3AED" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-3xl font-bold text-white font-mono">{timer}</span>
                  </div>
                  <p className="text-slate-300">{quest.description}</p>
                  <button
                    onClick={handleComplete}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Done Early!
                  </button>
                </div>
              )}

              {/* TRIVIA type */}
              {quest.interaction === 'trivia' && quest.data?.questions && (
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-slate-400 text-xs">Question {triviaIndex + 1} of {Math.min(quest.data.questions.length, 3)}</span>
                  </div>
                  <h3 className="text-white font-semibold text-center">{quest.data.questions[triviaIndex].q}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {quest.data.questions[triviaIndex].options.map((opt: string, idx: number) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === quest.data.questions[triviaIndex].answer;
                      const showResult = selectedAnswer !== null;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleTriviaAnswer(idx)}
                          disabled={selectedAnswer !== null}
                          className={`p-3 rounded-xl text-sm font-medium text-left transition-all border ${
                            showResult && isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                              : showResult && isSelected && !isCorrect
                              ? 'bg-red-500/20 border-red-500/50 text-red-300'
                              : 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-700/50 hover:border-purple-500/30'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MEMORY type */}
              {quest.interaction === 'memory' && (
                <div className="space-y-3">
                  <p className="text-center text-slate-400 text-sm">Find all matching pairs!</p>
                  <div className="grid grid-cols-4 gap-2">
                    {memoryCards.map(card => (
                      <button
                        key={card.id}
                        onClick={() => handleMemoryFlip(card.id)}
                        className={`aspect-square rounded-xl text-lg font-bold transition-all duration-300 ${
                          card.matched
                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                            : card.flipped
                            ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                            : 'bg-slate-800 border border-white/10 text-transparent hover:bg-slate-700'
                        }`}
                      >
                        {card.flipped || card.matched ? card.value : '?'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* WORD type */}
              {quest.interaction === 'word' && quest.data?.words && (
                <div className="text-center space-y-4 py-2">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                    <h3 className="text-2xl font-bold text-purple-300 mb-2">{quest.data.words[wordIndex].word}</h3>
                    <p className="text-slate-300 text-sm mb-2">{quest.data.words[wordIndex].meaning}</p>
                    <p className="text-slate-500 text-xs italic">"{quest.data.words[wordIndex].example}"</p>
                  </div>
                  <button
                    onClick={handleComplete}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Got It!
                  </button>
                </div>
              )}

              {/* MEDITATION type */}
              {quest.interaction === 'meditation' && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center animate-pulse">
                    <span className="text-cyan-300 text-lg font-medium">{breathPhase}</span>
                  </div>
                  <p className="text-slate-400 text-sm">Close your eyes. Follow the breathing guide.</p>
                </div>
              )}

              {/* LOGO type */}
              {quest.interaction === 'logo' && quest.data?.logos && (
                <div className="text-center space-y-4 py-2">
                  <div className="bg-slate-800 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm mb-3">Hint: {quest.data.logos[Math.floor(Math.random() * quest.data.logos.length)].hint}</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {quest.data.logos.slice(0, 4).map((logo: any, i: number) => (
                        <button
                          key={i}
                          onClick={handleComplete}
                          className="bg-slate-700 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
                        >
                          {logo.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMPLETE PHASE */}
          {phase === 'complete' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-white text-2xl font-bold">Quest Complete!</h2>
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-6 h-6 text-amber-400" />
                <span className="text-amber-300 text-2xl font-bold">+{quest.coins}</span>
                <span className="text-slate-400">coins earned</span>
              </div>
              {quest.interaction === 'trivia' && (
                <p className="text-slate-400 text-sm">{triviaCorrect}/{Math.min(quest.data?.questions?.length || 3, 3)} correct answers</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveQuest(null)}
                  className="flex-1 bg-slate-800 text-white font-semibold py-3 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setActiveQuest(null);
                    // Could trigger rewarded ad here
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all flex items-center justify-center gap-1"
                >
                  <span>Watch Ad +30</span>
                  <Coins className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveQuest;
