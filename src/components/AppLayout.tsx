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
  const { activeView, activeQuest, showCoinAnimation, coinAnimationAmount, showAuthModal, mysteryBoxOpen } = useGame();

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
    </div>
  );
};

export default AppLayout;
