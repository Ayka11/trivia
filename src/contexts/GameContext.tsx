import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Quest, QUESTS } from '@/data/quests';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'redeem' | 'referral' | 'bonus';
  amount: number;
  description: string;
  timestamp: Date;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  referralCode: string;
  referralCount: number;
  joinDate: Date;
}

interface GameState {
  coins: number;
  totalCoinsEarned: number;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  questsCompletedToday: number;
  totalQuestsCompleted: number;
  completedQuestIds: string[];
  transactions: Transaction[];
  user: UserProfile;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  showCoinAnimation: boolean;
  coinAnimationAmount: number;
  activeView: 'home' | 'quests' | 'rewards' | 'offers' | 'leaderboard' | 'profile' | 'referral';
  questFilter: string;
  activeQuest: Quest | null;
  mysteryBoxOpen: boolean;
  dailyBonusClaimed: boolean;
  loading: boolean;
  authUser: User | null;
  showRewardedAd: boolean;
  showInterstitialAd: boolean;
  questCompletionCount: number;
}

interface GameContextType extends GameState {
  earnCoins: (amount: number, description: string) => void;
  spendCoins: (amount: number, description: string) => Promise<boolean>;
  completeQuest: (questId: string) => Promise<void>;
  setActiveView: (view: GameState['activeView']) => void;
  setQuestFilter: (filter: string) => void;
  setActiveQuest: (quest: Quest | null) => void;
  setShowAuthModal: (show: boolean) => void;
  setMysteryBoxOpen: (open: boolean) => void;
  claimDailyBonus: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  getQuestCompletionsToday: (questId: string) => number;
  spendCoinsForReward: (rewardId: string) => Promise<{ success: boolean; mysteryResult?: any }>;
  refreshProfile: () => Promise<void>;
  xpToNextLevel: number;
  xpProgress: number;
  setShowRewardedAd: (show: boolean) => void;
  setShowInterstitialAd: (show: boolean) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

const XP_PER_LEVEL = 100;

const DEFAULT_USER: UserProfile = {
  name: '',
  email: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  isPremium: false,
  referralCode: '',
  referralCount: 0,
  joinDate: new Date(),
};

const DEFAULT_STATE: GameState = {
  coins: 0,
  totalCoinsEarned: 0,
  xp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  questsCompletedToday: 0,
  totalQuestsCompleted: 0,
  completedQuestIds: [],
  transactions: [],
  user: DEFAULT_USER,
  isAuthenticated: false,
  showAuthModal: false,
  showCoinAnimation: false,
  coinAnimationAmount: 0,
  activeView: 'home',
  questFilter: 'all',
  activeQuest: null,
  mysteryBoxOpen: false,
  dailyBonusClaimed: false,
  loading: true,
  authUser: null,
  showRewardedAd: false,
  showInterstitialAd: false,
  questCompletionCount: 0,
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [questCompletionCount, setQuestCompletionCount] = useState(0);

  const showCoinAnim = useCallback((amount: number) => {
    if (animationTimeout.current) clearTimeout(animationTimeout.current);
    setState(s => ({ ...s, showCoinAnimation: true, coinAnimationAmount: amount }));
    animationTimeout.current = setTimeout(() => {
      setState(s => ({ ...s, showCoinAnimation: false }));
    }, 2000);
  }, []);

  // Map DB profile to local state
  const applyProfile = useCallback((dbProfile: any, authUser: User) => {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const bonusClaimed = dbProfile.daily_bonus_claimed_at
      ? new Date(dbProfile.daily_bonus_claimed_at) >= todayStart
      : false;

    setState(s => ({
      ...s,
      coins: dbProfile.coins,
      totalCoinsEarned: dbProfile.total_coins_earned,
      xp: dbProfile.xp,
      level: dbProfile.level,
      streak: dbProfile.streak,
      longestStreak: dbProfile.longest_streak,
      totalQuestsCompleted: dbProfile.total_quests_completed,
      isAuthenticated: true,
      dailyBonusClaimed: bonusClaimed,
      loading: false,
      authUser,
      user: {
        name: dbProfile.name || authUser.email?.split('@')[0] || 'Player',
        email: dbProfile.email || authUser.email || '',
        avatar: dbProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id.substring(0, 8)}`,
        isPremium: dbProfile.is_premium,
        referralCode: dbProfile.referral_code,
        referralCount: dbProfile.referral_count,
        joinDate: new Date(dbProfile.created_at),
      },
    }));
  }, []);

  // Load today's quest completions
  const loadTodayCompletions = useCallback(async (userId: string) => {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('quest_completions')
      .select('quest_id')
      .eq('user_id', userId)
      .gte('completed_at', todayStart.toISOString());

    const ids = (data || []).map(d => d.quest_id);
    setState(s => ({
      ...s,
      completedQuestIds: ids,
      questsCompletedToday: ids.length,
    }));
  }, []);

  // Load recent transactions
  const loadTransactions = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setState(s => ({
        ...s,
        transactions: data.map(t => ({
          id: t.id,
          type: t.type as Transaction['type'],
          amount: t.amount,
          description: t.description,
          timestamp: new Date(t.created_at),
        })),
      }));
    }
  }, []);

  // Full profile refresh
  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      applyProfile(profile, user);
      await loadTodayCompletions(user.id);
      await loadTransactions(user.id);
    }
  }, [applyProfile, loadTodayCompletions, loadTransactions]);

  // Initialize profile via edge function
  const initProfile = useCallback(async (user: User, name?: string, referralCode?: string) => {
    const { data, error } = await supabase.functions.invoke('init-profile', {
      body: {
        name: name || user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
        referral_code_used: referralCode || null,
      },
    });

    if (error) {
      console.error('Init profile error:', error);
      return;
    }

    const profile = data?.profile;
    if (profile) {
      applyProfile(profile, user);
      await loadTodayCompletions(user.id);
      await loadTransactions(user.id);
    }
  }, [applyProfile, loadTodayCompletions, loadTransactions]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await initProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setState(s => ({
          ...DEFAULT_STATE,
          activeView: s.activeView,
          loading: false,
        }));
      } else if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await initProfile(session.user);
        } else {
          setState(s => ({ ...s, loading: false }));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [initProfile]);

  // ---- Auth Methods ----

  const signUpWithEmail = useCallback(async (name: string, email: string, password: string, referralCode?: string) => {
    setState(s => ({ ...s, loading: true }));
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setState(s => ({ ...s, loading: false }));
      toast.error(error.message);
      throw error;
    }

    if (data.user) {
      await initProfile(data.user, name, referralCode);
      setState(s => ({ ...s, showAuthModal: false }));
      toast.success('Welcome to 30-Second Wins!');
    }
  }, [initProfile]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setState(s => ({ ...s, loading: false }));
      toast.error(error.message);
      throw error;
    }

    setState(s => ({ ...s, showAuthModal: false }));
    toast.success('Welcome back!');
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState(s => ({
      ...DEFAULT_STATE,
      activeView: 'home',
      loading: false,
    }));
    toast.info('Signed out successfully');
  }, []);

  // ---- Game Methods (server-validated) ----

  const completeQuest = useCallback(async (questId: string) => {
    if (!state.authUser) {
      setState(s => ({ ...s, showAuthModal: true }));
      toast.error('Please sign in to complete quests');
      return;
    }

    const quest = QUESTS.find(q => q.id === questId);
    if (!quest) return;

    // Optimistic UI update
    const optimisticCoins = quest.coins;
    setState(s => {
      const newQuestCompletionCount = questCompletionCount + 1;
      const showInterstitial = newQuestCompletionCount % 3 === 0;
      return {
        ...s,
        completedQuestIds: [...s.completedQuestIds, questId],
        questsCompletedToday: s.questsCompletedToday + 1,
        questCompletionCount: newQuestCompletionCount,
        showRewardedAd: true,
        showInterstitialAd: showInterstitial,
      };
    });

    try {
      const { data, error } = await supabase.functions.invoke('complete-quest', {
        body: { quest_id: questId },
      });

      if (error || data?.error) {
        // Revert optimistic update
        setState(s => ({
          ...s,
          completedQuestIds: s.completedQuestIds.filter((_, i) => i < s.completedQuestIds.length - 1),
          questsCompletedToday: s.questsCompletedToday - 1,
        }));
        toast.error(data?.error || 'Failed to complete quest');
        return;
      }

      // Apply server response
      if (data.profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) applyProfile(data.profile, user);
      }

      showCoinAnim(data.coins_earned);
      await loadTransactions(state.authUser.id);
    } catch (err) {
      console.error('Complete quest error:', err);
      toast.error('Network error. Please try again.');
    }
  }, [state.authUser, applyProfile, showCoinAnim, loadTransactions]);

  const claimDailyBonus = useCallback(async () => {
    if (!state.authUser) {
      setState(s => ({ ...s, showAuthModal: true }));
      return;
    }

    if (state.dailyBonusClaimed) return;

    try {
      const { data, error } = await supabase.functions.invoke('claim-daily-bonus', {
        body: {},
      });

      if (error || data?.error) {
        toast.error(data?.error || 'Failed to claim bonus');
        return;
      }

      if (data.profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) applyProfile(data.profile, user);
      }

      setState(s => ({ ...s, dailyBonusClaimed: true }));
      showCoinAnim(data.bonus);
      toast.success(`+${data.bonus} daily bonus coins!`);
      await loadTransactions(state.authUser.id);
    } catch (err) {
      console.error('Claim bonus error:', err);
      toast.error('Network error. Please try again.');
    }
  }, [state.authUser, state.dailyBonusClaimed, applyProfile, showCoinAnim, loadTransactions]);

  const spendCoinsForReward = useCallback(async (rewardId: string): Promise<{ success: boolean; mysteryResult?: any }> => {
    if (!state.authUser) {
      setState(s => ({ ...s, showAuthModal: true }));
      return { success: false };
    }

    try {
      const { data, error } = await supabase.functions.invoke('spend-coins', {
        body: { reward_id: rewardId },
      });

      if (error || data?.error) {
        toast.error(data?.error || 'Failed to redeem reward');
        return { success: false };
      }

      if (data.profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) applyProfile(data.profile, user);
      }

      await loadTransactions(state.authUser.id);
      return { success: true, mysteryResult: data.mystery_result };
    } catch (err) {
      console.error('Spend coins error:', err);
      toast.error('Network error. Please try again.');
      return { success: false };
    }
  }, [state.authUser, applyProfile, loadTransactions]);

  // Legacy earnCoins for offer wall simulation (still goes through edge function in production)
  const earnCoins = useCallback((amount: number, description: string) => {
    if (!state.authUser) {
      setState(s => ({ ...s, showAuthModal: true }));
      return;
    }
    // For offer wall / ad rewards, optimistically update UI
    // In production these would be server-to-server callbacks
    setState(s => ({
      ...s,
      coins: s.coins + amount,
      totalCoinsEarned: s.totalCoinsEarned + amount,
      transactions: [
        { id: Date.now().toString(), type: 'earn' as const, amount, description, timestamp: new Date() },
        ...s.transactions.slice(0, 49),
      ],
    }));
    showCoinAnim(amount);
  }, [state.authUser, showCoinAnim]);

  // Legacy spendCoins (use spendCoinsForReward for validated spending)
  const spendCoins = useCallback(async (amount: number, description: string): Promise<boolean> => {
    if (state.coins < amount) return false;
    setState(s => ({
      ...s,
      coins: s.coins - amount,
      transactions: [
        { id: Date.now().toString(), type: 'spend' as const, amount: -amount, description, timestamp: new Date() },
        ...s.transactions.slice(0, 49),
      ],
    }));
    return true;
  }, [state.coins]);

  const getQuestCompletionsToday = useCallback((questId: string) => {
    return state.completedQuestIds.filter(id => id === questId).length;
  }, [state.completedQuestIds]);

  // ---- UI State Setters ----
  const setActiveView = useCallback((view: GameState['activeView']) => {
    setState(s => ({ ...s, activeView: view }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setQuestFilter = useCallback((filter: string) => {
    setState(s => ({ ...s, questFilter: filter }));
  }, []);

  const setActiveQuest = useCallback((quest: Quest | null) => {
    setState(s => ({ ...s, activeQuest: quest }));
  }, []);

  const setShowAuthModal = useCallback((show: boolean) => {
    setState(s => ({ ...s, showAuthModal: show }));
  }, []);

  const setMysteryBoxOpen = useCallback((open: boolean) => {
    setState(s => ({ ...s, mysteryBoxOpen: open }));
  }, []);

  const xpToNextLevel = XP_PER_LEVEL;
  const xpProgress = state.xp % XP_PER_LEVEL;

  return (
    <GameContext.Provider value={{
      ...state,
      earnCoins,
      spendCoins,
      completeQuest,
      setActiveView,
      setQuestFilter,
      setActiveQuest,
      setShowAuthModal,
      setMysteryBoxOpen,
      claimDailyBonus,
      signUpWithEmail,
      signInWithEmail,
      signInWithOAuth,
      logout,
      getQuestCompletionsToday,
      spendCoinsForReward,
      refreshProfile,
      xpToNextLevel,
      xpProgress,
      showRewardedAd,
      setShowRewardedAd,
      showInterstitialAd,
      setShowInterstitialAd,
      questCompletionCount,
    }}>
      {children}
    </GameContext.Provider>
  );
};
