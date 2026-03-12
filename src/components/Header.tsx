import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Coins, Flame, Trophy, User, Crown, Zap, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { coins, streak, level, xpProgress, xpToNextLevel, user, isAuthenticated, setShowAuthModal, setActiveView, activeView } = useGame();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { label: string; view: any; icon: React.ReactNode }[] = [
    { label: 'Home', view: 'home', icon: <Zap className="w-4 h-4" /> },
    { label: 'Quests', view: 'quests', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Rewards', view: 'rewards', icon: <Coins className="w-4 h-4" /> },
    { label: 'Offers', view: 'offers', icon: <Crown className="w-4 h-4" /> },
    { label: 'Leaderboard', view: 'leaderboard', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => setActiveView('home')} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:block">
              30-Second Wins
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeView === item.view
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1 bg-orange-500/10 px-2.5 py-1.5 rounded-lg border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-bold">{streak}</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-bold">{coins.toLocaleString()}</span>
            </div>

            {/* Level */}
            <div className="hidden sm:flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20">
              <span className="text-purple-300 text-xs font-bold">LVL {level}</span>
              <div className="w-12 h-1.5 bg-purple-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${(xpProgress / xpToNextLevel) * 100}%` }}
                />
              </div>
            </div>

            {/* Profile */}
            {isAuthenticated ? (
              <button
                onClick={() => setActiveView('profile')}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500/50 hover:border-purple-400 transition-colors"
              >
                <img src={user.avatar} alt="Profile" className="w-full h-full" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-3 border-t border-white/5 pt-3 flex flex-wrap gap-2">
            {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => { setActiveView(item.view); setMobileMenuOpen(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeView === item.view
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { setActiveView('referral'); setMobileMenuOpen(false); }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              Referrals
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
