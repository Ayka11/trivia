import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';

const missingEnvKeys = [
  !firebaseConfig.apiKey ? 'VITE_FIREBASE_API_KEY' : null,
  !firebaseConfig.authDomain ? 'VITE_FIREBASE_AUTH_DOMAIN' : null,
  !firebaseConfig.projectId ? 'VITE_FIREBASE_PROJECT_ID' : null,
  !firebaseConfig.appId ? 'VITE_FIREBASE_APP_ID' : null,
].filter(Boolean);

export const firebaseConfigError =
  missingEnvKeys.length > 0
    ? `Missing Firebase web config: ${missingEnvKeys.join(', ')}. Fill web/.env.local and restart Vite.`
    : '';

const app = firebaseConfigError ? null : initializeApp(firebaseConfig);
export const auth = app ? getAuth(app) : null;
export const functions = app ? getFunctions(app, region) : null;

function requireConfigured() {
  if (firebaseConfigError || !auth || !functions) {
    throw new Error(firebaseConfigError || 'Firebase is not configured.');
  }
}

function getServices() {
  requireConfigured();
  return {
    auth: auth as NonNullable<typeof auth>,
    functions: functions as NonNullable<typeof functions>,
  };
}

export async function ensureSignedIn() {
  const { auth: authClient } = getServices();
  if (!authClient.currentUser) {
    await signInAnonymously(authClient);
  }
  return authClient.currentUser;
}

export type Option = { id: string; text: string };
export type MediaItem = {
  type?: 'image' | 'audio' | 'video' | string;
  url: string;
  altText?: string;
  caption?: string;
  transcript?: string;
};

export type Question = {
  id: string;
  prompt: string;
  options?: Option[];
  answerFormat: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  mediaCaption?: string | null;
  mediaTranscript?: string | null;
  media?: MediaItem[];
};

export type SessionPayload = {
  sessionId: string;
  questions: Question[];
};

export type SubmitAnswerPayload = {
  sessionId: string;
  questionId: string;
  answer: { optionId: string };
  timeSpentSec?: number;
};

export type SubmitAnswerResult = {
  isCorrect: boolean;
  sessionStatus: string;
  coinsDelta: number;
};

export type RedeemRewardResult = {
  coinsBalance: number;
};

export type ReferFriendResult = {
  coinsRewarded: number;
};

export type LeaderboardEntry = {
  userId: string;
  coinsBalance: number;
};

export type GetLeaderboardResult = {
  leaderboard: LeaderboardEntry[];
};

export type UpgradePremiumResult = {
  success: boolean;
};

export async function startSession(data: { modeId?: string; packId?: string; difficulty?: string; questionCount?: number }) {
  const { functions: fn } = getServices();
  return httpsCallable<typeof data, SessionPayload>(fn, 'startSession')(data);
}

export async function submitAnswer(data: SubmitAnswerPayload) {
  const { functions: fn } = getServices();
  return httpsCallable<SubmitAnswerPayload, SubmitAnswerResult>(fn, 'submitAnswer')(data);
}

export async function redeemReward(rewardType: string) {
  const { functions: fn } = getServices();
  return httpsCallable<{ rewardType: string }, RedeemRewardResult>(fn, 'redeemReward')({ rewardType });
}

export async function referFriend(referralCode: string) {
  const { functions: fn } = getServices();
  return httpsCallable<{ referralCode: string }, ReferFriendResult>(fn, 'referFriend')({ referralCode });
}

export async function getLeaderboard() {
  const { functions: fn } = getServices();
  return httpsCallable<Record<string, never>, GetLeaderboardResult>(fn, 'getLeaderboard')({});
}

export async function upgradePremium() {
  // Placeholder: backend endpoint for premium upgrade
  // return httpsCallable(fn, 'upgradePremium')({});
  return { data: { success: true } as UpgradePremiumResult };
}
