import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Users, Copy, Check, Share2, Gift, Coins, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const ReferralSection: React.FC = () => {
  const { user, isAuthenticated, setShowAuthModal } = useGame();
  const [copied, setCopied] = useState(false);

  const referralLink = `https://30secondwins.app/ref/${user.referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const shareToSocial = (platform: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    const text = encodeURIComponent(`I just earned coins completing 30-second quests! Join me and we both get 250 bonus coins! ${referralLink}`);
    const urls: Record<string, string> = {
      tiktok: `https://www.tiktok.com/upload?description=${text}`,
      instagram: `https://www.instagram.com/`,
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      whatsapp: `https://wa.me/?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${text}`,
    };
    window.open(urls[platform] || '#', '_blank');
  };

  return (
    <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Invite Friends</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* How it works */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 space-y-5">
          <h3 className="text-white font-bold text-lg">How Referrals Work</h3>

          <div className="space-y-4">
            {[
              { step: 1, title: 'Share your link', desc: 'Send your unique referral link to friends', icon: Share2 },
              { step: 2, title: 'Friend joins', desc: 'They sign up and complete their first quest', icon: Users },
              { step: 3, title: 'Both earn coins!', desc: 'You both get 250 bonus coins instantly', icon: Gift },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center shrink-0 text-cyan-400 font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                  <p className="text-slate-400 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
            <Coins className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-amber-300 font-bold text-lg">250 coins each</div>
              <div className="text-slate-400 text-xs">Per successful referral</div>
            </div>
          </div>
        </div>

        {/* Referral code + sharing */}
        <div className="space-y-4">
          {/* Code display */}
          <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-white font-semibold text-sm">Your Referral Code</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-purple-300 font-mono font-bold text-sm truncate">
                {isAuthenticated ? user.referralCode : '••••••••'}
              </div>
              <button
                onClick={isAuthenticated ? copyCode : () => setShowAuthModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Referral link */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-slate-400 text-xs truncate">
                {isAuthenticated ? referralLink : 'Sign in to get your referral link'}
              </div>
              <button
                onClick={isAuthenticated ? copyCode : () => setShowAuthModal(true)}
                className="text-purple-400 hover:text-purple-300 text-xs font-medium whitespace-nowrap"
              >
                Copy Link
              </button>
            </div>
          </div>

          {/* Social sharing */}
          <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-white font-semibold text-sm">Share to</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'TikTok', key: 'tiktok', color: '#000000', bg: 'bg-white text-black' },
                { name: 'Instagram', key: 'instagram', color: '#E4405F', bg: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' },
                { name: 'Twitter / X', key: 'twitter', color: '#1DA1F2', bg: 'bg-slate-700 text-white' },
                { name: 'WhatsApp', key: 'whatsapp', color: '#25D366', bg: 'bg-emerald-600 text-white' },
                { name: 'Facebook', key: 'facebook', color: '#1877F2', bg: 'bg-blue-600 text-white' },
                { name: 'More...', key: 'more', color: '#666', bg: 'bg-slate-700 text-slate-300' },
              ].map(platform => (
                <button
                  key={platform.key}
                  onClick={() => {
                    if (platform.key === 'more') {
                      if (navigator.share) {
                        navigator.share({ title: '30-Second Wins', text: 'Join me on 30-Second Wins!', url: referralLink });
                      }
                    } else {
                      shareToSocial(platform.key);
                    }
                  }}
                  className={`${platform.bg} font-medium text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                >
                  {platform.name}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Your Referral Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user.referralCount}</div>
                <div className="text-xs text-slate-400">Referrals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-300">{user.referralCount * 250}</div>
                <div className="text-xs text-slate-400">Coins Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-300">${(user.referralCount * 250 / 1200).toFixed(2)}</div>
                <div className="text-xs text-slate-400">Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralSection;
