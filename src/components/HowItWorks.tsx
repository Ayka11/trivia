import React from 'react';
import { Zap, Coins, Gift, TrendingUp, ArrowRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Zap,
      title: 'Complete Quests',
      description: 'Choose from 20+ micro-quests. Each takes just 30-90 seconds. Drink water, solve puzzles, learn words, meditate.',
      color: '#7C3AED',
    },
    {
      icon: Coins,
      title: 'Earn Coins',
      description: 'Get 10-60 coins per quest. Build streaks for multiplier bonuses. Complete offers for massive coin drops.',
      color: '#F59E0B',
    },
    {
      icon: Gift,
      title: 'Redeem Rewards',
      description: 'Cash out via PayPal, spin mystery boxes, unlock themes, or grab gift cards. Real rewards, real fast.',
      color: '#EC4899',
    },
    {
      icon: TrendingUp,
      title: 'Level Up',
      description: 'Climb the leaderboard, unlock premium quests, invite friends for bonus coins, and compete in weekly tournaments.',
      color: '#10B981',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Turn tiny daily habits into real rewards. It's simple, fun, and takes less than 5 minutes a day.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="relative group">
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 text-center hover:border-purple-500/20 transition-all duration-300 hover:-translate-y-1 h-full">
              {/* Step number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-slate-400 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {i + 1}
              </div>

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: step.color + '15' }}
              >
                <step.icon className="w-7 h-7" style={{ color: step.color }} />
              </div>
              <h3 className="text-white font-bold mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
            </div>

            {/* Arrow connector (hidden on last) */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                <ArrowRight className="w-6 h-6 text-slate-700" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats banner */}
      <div className="mt-12 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-amber-500/5 border border-white/5 rounded-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '2M+', label: 'Quests Completed' },
            { value: '$125K+', label: 'Rewards Paid Out' },
            { value: '4.8/5', label: 'User Rating' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
