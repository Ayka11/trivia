import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { CPA_OFFERS } from '@/data/rewards';
import { Coins, Clock, ExternalLink, Shield, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

const OfferWall: React.FC = () => {
  const { earnCoins, isAuthenticated, setShowAuthModal } = useGame();

  const handleOffer = (offer: typeof CPA_OFFERS[0]) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      toast.error('Please sign in to complete offers');
      return;
    }
    // Simulate offer completion (in production, this would redirect to CPA network)
    toast.info(`Redirecting to ${offer.title} (${offer.network})...`);
    setTimeout(() => {
      earnCoins(offer.coins, `Offer: ${offer.title} (${offer.network})`);
      toast.success(`${offer.coins} coins earned from offer! (Payout: $${offer.payoutUSD})`);
    }, 2000);
  };

  return (
    <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Offer Wall</h2>
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">
            HIGH REWARDS
          </span>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-white text-sm font-medium">Earn massive coins by completing partner offers</p>
          <p className="text-slate-400 text-xs mt-1">Complete sign-ups, surveys, and trials from our trusted partners. Coins are awarded after verification.</p>
        </div>
      </div>

      {/* Offers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CPA_OFFERS.map(offer => (
          <div
            key={offer.id}
            className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{offer.title}</h3>
                <p className="text-slate-400 text-xs">{offer.description}</p>
                <p className="text-emerald-300 text-xs mt-1 font-semibold">Network: {offer.network}</p>
                <p className="text-cyan-300 text-xs mt-1">Payout: ${offer.payoutUSD.toFixed(2)} | Coins: {offer.coins}</p>
              </div>
              <div
                className="shrink-0 ml-3 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: offer.color + '20' }}
              >
                <Zap className="w-5 h-5" style={{ color: offer.color }} />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4 text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {offer.time}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-medium ${
                  offer.difficulty === 'Easy'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                {offer.difficulty}
              </span>
              <span className="text-slate-500">{offer.network}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-bold text-lg">+{offer.coins.toLocaleString()}</span>
              </div>
              <button
                onClick={() => handleOffer(offer)}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1 group-hover:shadow-emerald-500/30"
              >
                Complete
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rewarded Ad Section */}
      <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Watch Rewarded Video</h3>
              <p className="text-slate-400 text-sm">Watch a short video ad to earn bonus coins</p>
            </div>
          </div>
          <button
            onClick={() => {
              toast.info('Loading rewarded video...');
              setTimeout(() => {
                earnCoins(30, 'Rewarded video ad');
                toast.success('+30 coins from rewarded video!');
              }, 2000);
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2"
          >
            <span>Watch Ad</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">+30</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default OfferWall;
