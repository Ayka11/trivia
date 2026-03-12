import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { REWARDS } from '@/data/rewards';
import {
  DollarSign, Gift, Palette, Rocket, ShoppingBag, Shield, Coins,
  Lock, Star, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const iconMap: Record<string, React.FC<any>> = {
  DollarSign, Gift, Palette, Rocket, ShoppingBag, Shield,
};

const RewardShop: React.FC = () => {
  const { coins, spendCoinsForReward, setMysteryBoxOpen, isAuthenticated, setShowAuthModal } = useGame();
  const [filter, setFilter] = useState<string>('all');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const filters = [
    { key: 'all', label: 'All Rewards' },
    { key: 'paypal', label: 'PayPal Cash' },
    { key: 'mystery', label: 'Mystery Box' },
    { key: 'theme', label: 'Themes' },
    { key: 'boost', label: 'Boosts' },
    { key: 'coupon', label: 'Coupons' },
  ];

  const filteredRewards = filter === 'all' ? REWARDS : REWARDS.filter(r => r.type === filter);

  const handleRedeem = async (reward: typeof REWARDS[0]) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      toast.error('Please sign in to redeem rewards');
      return;
    }

    if (coins < reward.coins) {
      toast.error(`Need ${reward.coins - coins} more coins!`);
      return;
    }

    setRedeemingId(reward.id);

    try {
      const result = await spendCoinsForReward(reward.id);

      if (result.success) {
        if (reward.type === 'mystery' && result.mysteryResult) {
          setMysteryBoxOpen(true);
        } else {
          toast.success(`${reward.title} redeemed successfully!`);
          if (reward.type === 'paypal') {
            toast.info('PayPal payout will be processed within 3 business days.');
          }
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-pink-400" />
          <h2 className="text-2xl font-bold text-white">Reward Shop</h2>
        </div>
        <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 font-bold">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rewards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRewards.map(reward => {
          const IconComp = iconMap[reward.icon] || Gift;
          const canAfford = coins >= reward.coins;
          const isRedeeming = redeemingId === reward.id;

          return (
            <div
              key={reward.id}
              className={`relative bg-slate-800/50 border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl ${
                canAfford
                  ? 'border-white/5 hover:border-pink-500/30 hover:shadow-pink-500/10 hover:-translate-y-1'
                  : 'border-white/5 opacity-60'
              }`}
            >
              {reward.popular && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  POPULAR
                </div>
              )}

              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: reward.color + '20' }}
                >
                  <IconComp className="w-7 h-7" style={{ color: reward.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-1">{reward.title}</h3>
                  <p className="text-slate-400 text-xs mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300 font-bold text-sm">{reward.coins.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford || isRedeeming}
                      className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1 ${
                        isRedeeming
                          ? 'bg-purple-500/20 text-purple-300'
                          : canAfford
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-500 hover:to-purple-500 shadow-md'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isRedeeming ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</>
                      ) : canAfford ? (
                        <>Redeem</>
                      ) : (
                        <><Lock className="w-3 h-3" /> {(reward.coins - coins).toLocaleString()} more</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RewardShop;
