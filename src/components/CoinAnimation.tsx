import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';

interface CoinAnimationProps {
  amount: number;
  show: boolean;
}

const CoinAnimation: React.FC<CoinAnimationProps> = ({ amount, show }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; delay: number }[]>([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 200 - 100,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      {/* Central coin burst */}
      <div className="relative animate-bounce">
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold text-2xl md:text-3xl px-6 py-3 rounded-2xl shadow-2xl shadow-amber-500/50 flex items-center gap-3 animate-pulse">
          <Coins className="w-8 h-8" />
          <span>+{amount}</span>
        </div>
      </div>
      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            animation: `coinFloat 1.5s ease-out ${p.delay}s forwards`,
            left: `calc(50% + ${p.x}px)`,
            top: '50%',
          }}
        >
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full shadow-lg" />
        </div>
      ))}
      <style>{`
        @keyframes coinFloat {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CoinAnimation;
