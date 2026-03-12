import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { GameProvider } from '@/contexts/GameContext';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <GameProvider>
        <AppLayout />
      </GameProvider>
    </AppProvider>
  );
};

export default Index;
