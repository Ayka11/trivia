import React from 'react';
import { Crown, Zap, Shield, Star, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

const PremiumBanner: React.FC = () => {
  return (
    <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/20 rounded-3xl p-8 md:p-10">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-sm font-bold px-3 py-1 rounded-full mb-4">
              <Crown className="w-4 h-4" />
              Premium Membership
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Unlock <span className="text-amber-400">2x Earnings</span>
            </h2>
            <p className="text-slate-300 mb-6">
              Go premium and supercharge your rewards. Double your coins, remove ads, and access exclusive quests.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Zap, text: '2x Coin Multiplier' },
                { icon: Shield, text: 'Ad-Free Experience' },
                { icon: Star, text: 'Exclusive Quests' },
                { icon: Sparkles, text: 'Premium Themes' },
                { icon: Crown, text: 'Priority Payouts' },
                { icon: Check, text: 'Streak Protection' },
              ].map((perk, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <perk.icon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{perk.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => toast.info('Premium subscription launching soon! Join the waitlist.')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-xl shadow-amber-500/25 flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                $3.99/month
              </button>
              <button
                onClick={() => toast.info('Lifetime access launching soon!')}
                className="bg-white/5 border border-amber-500/20 text-amber-300 font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
              >
                $29.99 Lifetime
              </button>
            </div>
          </div>

          {/* Visual card */}
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-56 h-72 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl shadow-2xl shadow-amber-500/20 p-6 flex flex-col items-center justify-center text-center">
                <Crown className="w-12 h-12 text-white mb-3" />
                <h3 className="text-white font-bold text-xl mb-1">Premium</h3>
                <p className="text-white/70 text-sm mb-4">All features unlocked</p>
                <div className="bg-white/20 rounded-xl px-4 py-2 text-white font-bold text-2xl">
                  2x
                </div>
                <p className="text-white/60 text-xs mt-2">Coin Multiplier</p>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                BEST VALUE
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumBanner;
