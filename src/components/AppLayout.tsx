import React from 'react';
import { useGame } from '@/contexts/GameContext';
import Header from './Header';
import HeroSection from './HeroSection';
import FeaturedQuests from './FeaturedQuests';
import HowItWorks from './HowItWorks';
import QuestCatalog from './QuestCatalog';
import RewardShop from './RewardShop';
import OfferWall from './OfferWall';
import Leaderboard from './Leaderboard';
import ReferralSection from './ReferralSection';
import ProfileSection from './ProfileSection';
import PremiumBanner from './PremiumBanner';
import Footer from './Footer';
import ActiveQuest from './ActiveQuest';
import MysteryBox from './MysteryBox';
import AuthModal from './AuthModal';
import CoinAnimation from './CoinAnimation';

const AppLayout: React.FC = () => {
  const {
    activeView,
    activeQuest,
    showCoinAnimation,
    coinAnimationAmount,
    showAuthModal,
    mysteryBoxOpen,
    showRewardedAd,
    setShowRewardedAd,
    showInterstitialAd,
    setShowInterstitialAd,
    earnCoins,
  } = useGame();

  const renderContent = () => {
    switch (activeView) {
      case 'quests':
        return <QuestCatalog />;
      case 'rewards':
        return <RewardShop />;
      case 'offers':
        return <OfferWall />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'referral':
        return <ReferralSection />;
      case 'profile':
        return <ProfileSection />;
      case 'home':
      default:
        return (
          <>
            <HeroSection />
            <FeaturedQuests />
            <HowItWorks />
            <PremiumBanner />
          </>
        );
    }
  };

  // Simulated rewarded ad modal
  const handleRewardedAd = () => {
    earnCoins(25, 'Rewarded Video Ad');
    setShowRewardedAd(false);
  };

  // Simulated interstitial ad modal
  const handleInterstitialAd = () => {
    setShowInterstitialAd(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <main>
        {renderContent()}
      </main>
      <Footer />

      {/* Overlays */}
      {activeQuest && <ActiveQuest />}
      {mysteryBoxOpen && <MysteryBox />}
      {showAuthModal && <AuthModal />}
      <CoinAnimation show={showCoinAnimation} amount={coinAnimationAmount} />

      {/* Rewarded Video Ad Modal */}
      {showRewardedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Watch Rewarded Video Ad</h2>
            <p className="mb-4 text-slate-300">Simulated ad: Click below to earn 25 coins!</p>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl" onClick={handleRewardedAd}>Earn Coins</button>
          </div>
        </div>
      )}

      {/* Interstitial Ad Modal */}
      {showInterstitialAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Interstitial Ad</h2>
            <p className="mb-4 text-slate-300">Simulated ad: Click below to continue.</p>
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 py-2 rounded-xl" onClick={handleInterstitialAd}>Close Ad</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
