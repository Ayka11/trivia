import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Zap, Shield, Heart, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const { setActiveView } = useGame();

  return (
    <footer className="bg-slate-900 border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">30-Second Wins</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Complete tiny quests, earn real rewards. The fastest way to turn micro-habits into cash.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Daily Quests', view: 'quests' },
                { label: 'Reward Shop', view: 'rewards' },
                { label: 'Offer Wall', view: 'offers' },
                { label: 'Leaderboard', view: 'leaderboard' },
                { label: 'Invite Friends', view: 'referral' },
              ].map(link => (
                <li key={link.view}>
                  <button
                    onClick={() => { setActiveView(link.view as any); window.scrollTo(0, 0); }}
                    className="text-slate-400 text-sm hover:text-purple-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2">
              {['Help Center', 'Contact Us', 'FAQ', 'Report a Bug', 'Feedback'].map(item => (
                <li key={item}>
                  <button className="text-slate-400 text-sm hover:text-purple-400 transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Payout Policy', 'Anti-Fraud Policy'].map(item => (
                <li key={item}>
                  <button className="text-slate-400 text-sm hover:text-purple-400 transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-6 border-t border-white/5 mb-6">
          {[
            { icon: Shield, label: 'Secure Payments' },
            { icon: Zap, label: 'Instant Rewards' },
            { icon: Heart, label: 'Trusted by 50K+ Users' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-1.5 text-slate-500 text-xs">
              <badge.icon className="w-3.5 h-3.5" />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xs">
          <p>2026 30-Second Wins. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-pink-500" /> for micro-achievers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
