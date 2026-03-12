import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import {
  User, Coins, Flame, Trophy, Star, Crown, Clock, ArrowUp, ArrowDown,
  LogOut, Shield, ChevronRight, Zap, Gift
} from 'lucide-react';
import { toast } from 'sonner';

const ProfileSection: React.FC = () => {
  const {
    user, coins, totalCoinsEarned, streak, longestStreak, level, xpProgress, xpToNextLevel,
    totalQuestsCompleted, questsCompletedToday, transactions, logout, setActiveView, isAuthenticated, setShowAuthModal
  } = useGame();
  const [showTransactions, setShowTransactions] = useState(false);

  if (!isAuthenticated) {
    return (
      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Sign in to view your profile</h2>
          <p className="text-slate-400 text-sm mb-4">Track your progress, stats, and transaction history.</p>
          <button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-6 py-3 rounded-xl">Sign In</button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 text-center">
            <div className="relative inline-block mb-3">
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-purple-500/30" />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">{level}</div>
            </div>
            <h2 className="text-white font-bold text-lg">{user.name}</h2>
            <p className="text-slate-400 text-sm">{user.email}</p>
            {user.isPremium && (
              <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mt-2"><Crown className="w-3 h-3" />Premium</div>
            )}
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs"><span className="text-slate-400">Level {level}</span><span className="text-purple-300">{xpProgress}/{xpToNextLevel} XP</span></div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${(xpProgress / xpToNextLevel) * 100}%` }} /></div>
            </div>
            <div className="mt-4 space-y-2">
              <button onClick={() => setActiveView('referral')} className="w-full bg-slate-700/50 text-white text-sm py-2.5 rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"><Gift className="w-4 h-4 text-cyan-400" />Invite Friends<ChevronRight className="w-4 h-4 text-slate-500" /></button>
              <button onClick={async () => { await logout(); setActiveView('home'); }} className="w-full bg-red-500/10 text-red-400 text-sm py-2.5 rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"><LogOut className="w-4 h-4" />Sign Out</button>
            </div>
          </div>
          {!user.isPremium && (
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2"><Crown className="w-5 h-5 text-amber-400" /><h3 className="text-white font-bold">Go Premium</h3></div>
              <ul className="space-y-1.5 text-sm text-slate-300 mb-3">
                <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-amber-400" /> 2x coin earnings</li>
                <li className="flex items-center gap-2"><Shield className="w-3 h-3 text-amber-400" /> No ads</li>
                <li className="flex items-center gap-2"><Star className="w-3 h-3 text-amber-400" /> Exclusive quests</li>
              </ul>
              <button onClick={() => toast.info('Premium subscription coming soon!')} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2.5 rounded-xl text-sm">$3.99/month</button>
            </div>
          )}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Coins', value: totalCoinsEarned.toLocaleString(), icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Balance', value: coins.toLocaleString(), icon: Coins, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Streak', value: streak.toString(), icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { label: 'Best Streak', value: longestStreak.toString(), icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Today', value: questsCompletedToday.toString(), icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              { label: 'Total Quests', value: totalQuestsCompleted.toString(), icon: Star, color: 'text-pink-400', bg: 'bg-pink-500/10' },
              { label: 'Referrals', value: user.referralCount.toString(), icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Cash Value', value: `$${(coins / 1200).toFixed(2)}`, icon: ArrowUp, color: 'text-green-400', bg: 'bg-green-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/50 border border-white/5 rounded-xl p-3">
                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
                <div className="text-white font-bold text-lg">{stat.value}</div>
                <div className="text-slate-400 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden">
            <button onClick={() => setShowTransactions(!showTransactions)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400" /><h3 className="text-white font-semibold">Transaction History</h3><span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{transactions.length}</span></div>
              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showTransactions ? 'rotate-90' : ''}`} />
            </button>
            {showTransactions && (
              <div className="border-t border-white/5 max-h-80 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">No transactions yet</div>
                ) : transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {tx.amount > 0 ? <ArrowUp className="w-4 h-4 text-emerald-400" /> : <ArrowDown className="w-4 h-4 text-red-400" />}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{tx.description}</div>
                        <div className="text-slate-500 text-xs">{new Date(tx.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
