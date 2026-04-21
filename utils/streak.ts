import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  activeDates: string[];         // YYYY-MM-DD, last 30 days
}

const MILESTONE_DAYS = [3, 7, 14, 30];

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  activeDates: [],
};

// ── Date helpers ──────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ── Read local streak (AsyncStorage only, fast) ───────────────────────────────

export async function getLocalStreakData(): Promise<StreakData> {
  try {
    const raw = await AsyncStorage.getItem('streak_data');
    const data: StreakData = raw ? JSON.parse(raw) : { ...DEFAULT_STREAK };

    // Apply stale reset: if last activity was before yesterday, streak is 0
    const today = todayStr();
    const yesterday = yesterdayStr();
    if (
      data.lastActiveDate &&
      data.lastActiveDate !== today &&
      data.lastActiveDate !== yesterday
    ) {
      data.currentStreak = 0;
    }

    return data;
  } catch {
    return { ...DEFAULT_STREAK };
  }
}

// ── Record activity (idempotent, updates local + Supabase) ────────────────────

export async function recordActivity(): Promise<void> {
  const today = todayStr();

  try {
    const raw = await AsyncStorage.getItem('streak_data');
    const stored: StreakData = raw ? JSON.parse(raw) : { ...DEFAULT_STREAK };

    // Idempotent — already recorded today
    if (stored.lastActiveDate === today) return;

    // Compute new streak
    const yesterday = yesterdayStr();
    const newStreak =
      stored.lastActiveDate === yesterday ? stored.currentStreak + 1 : 1;
    const newLongest = Math.max(stored.longestStreak, newStreak);

    // Update active dates: add today, trim to last 30 days, dedupe
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const newActiveDates = [
      ...(stored.activeDates ?? []).filter(d => d >= cutoffStr && d !== today),
      today,
    ];

    const newData: StreakData = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
      activeDates: newActiveDates,
    };

    await AsyncStorage.setItem('streak_data', JSON.stringify(newData));

    // Store pending milestone for home screen to pick up
    if (MILESTONE_DAYS.includes(newStreak)) {
      await AsyncStorage.setItem('streak_pending_milestone', String(newStreak));
    }

    // Sync to Supabase (best-effort: streak_count + last_active always, longest_streak optional)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('users')
        .update({ streak_count: newStreak, last_active: today })
        .eq('id', session.user.id);

      // longest_streak column may not exist yet — ignore error if so
      supabase
        .from('users')
        .update({ longest_streak: newLongest })
        .eq('id', session.user.id)
        .then(() => {})
        .catch(() => {});
    }
  } catch (e) {
    console.warn('recordActivity error:', e);
  }
}

// ── Milestone helpers ─────────────────────────────────────────────────────────

export async function getPendingMilestone(): Promise<number | null> {
  const raw = await AsyncStorage.getItem('streak_pending_milestone');
  return raw ? parseInt(raw, 10) : null;
}

export async function clearPendingMilestone(): Promise<void> {
  await AsyncStorage.removeItem('streak_pending_milestone');
}

// ── Weekly dot helpers ────────────────────────────────────────────────────────

export interface WeekDay {
  label: string;  // 'M', 'T', 'W', 'T', 'F', 'S', 'S'
  date: string;   // YYYY-MM-DD
  isToday: boolean;
}

export function getWeekDays(): WeekDay[] {
  const today = new Date();
  const todayISO = todayStr();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const date = d.toISOString().split('T')[0];
    return { label, date, isToday: date === todayISO };
  });
}

// ── Milestone message lookup ──────────────────────────────────────────────────

export const MILESTONE_MESSAGES: Record<number, string> = {
  3:  "3 days in a row! You're building a habit 🔥",
  7:  "One full week! Yusuf is proud of you 🔥🔥",
  14: "2 weeks strong! You're unstoppable 🔥🔥🔥",
  30: "30 days! You're a legend 🔥🔥🔥🔥",
};
