import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCanonicalCompletionKey, getCompletionKeyCandidates, parseCompletionKey } from './progression';
import { supabase } from './supabase';

const GUEST_PROGRESS_KEY = 'guest_progress';
const GUEST_XP_CACHE_KEY = 'guest_xp_cache';
const GUEST_XP_MIGRATION_KEY = 'guest_xp_migration_id';

type GuestMigrationStorage = Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'multiRemove'>;

export type GuestMigrationDependencies = {
  storage: GuestMigrationStorage;
  mergeXpOnce: (migrationId: string, xp: number) => Promise<number>;
  persistCompletion: (completionKey: string, dialect: string, contentId: string) => Promise<void>;
  createMigrationId: () => string;
};

const defaultDependencies: GuestMigrationDependencies = {
  storage: AsyncStorage,
  createMigrationId: () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`,
  mergeXpOnce: async (migrationId, xp) => {
    const { data, error } = await supabase.rpc('merge_guest_xp_once', {
      p_migration_id: migrationId,
      p_xp: xp,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return Number(row?.xp_awarded ?? 0);
  },
  persistCompletion: async (completionKey, dialect, contentId) => {
    const { error } = await supabase.rpc('complete_quiz_once', {
      p_scenario: completionKey,
      p_dialect: dialect,
      p_score: 100,
      p_xp: 0,
      p_completion_candidates: getCompletionKeyCandidates(dialect, contentId),
    });
    if (error) throw error;
  },
};

export async function mergeGuestProgress(
  dependencies: GuestMigrationDependencies = defaultDependencies,
) {
  const { storage } = dependencies;
  const [guestProgress, guestXpRaw] = await Promise.all([
    storage.getItem(GUEST_PROGRESS_KEY),
    storage.getItem(GUEST_XP_CACHE_KEY),
  ]);
  const progressMap: Record<string, boolean> = guestProgress ? JSON.parse(guestProgress) : {};
  const parsedXp = guestXpRaw == null ? 0 : Number.parseInt(guestXpRaw, 10);
  const guestXp = Number.isFinite(parsedXp) && parsedXp > 0 ? parsedXp : 0;
  if (Object.keys(progressMap).length === 0 && guestXp === 0) return { xpAwarded: 0, completionsMerged: 0 };

  let migrationId = await storage.getItem(GUEST_XP_MIGRATION_KEY);
  if (!migrationId) {
    migrationId = dependencies.createMigrationId();
    await storage.setItem(GUEST_XP_MIGRATION_KEY, migrationId);
  }

  const xpAwarded = guestXp > 0 ? await dependencies.mergeXpOnce(migrationId, guestXp) : 0;
  let completionsMerged = 0;
  for (const [storedKey, completed] of Object.entries(progressMap)) {
    if (!completed) continue;
    const parsed = parseCompletionKey(storedKey);
    const completionKey = parsed ? storedKey : getCanonicalCompletionKey('gulf', storedKey);
    if (!completionKey) continue;
    await dependencies.persistCompletion(
      completionKey,
      parsed?.dialect ?? 'gulf',
      parsed?.contentId ?? storedKey,
    );
    completionsMerged += 1;
  }

  await storage.multiRemove([
    GUEST_PROGRESS_KEY,
    GUEST_XP_CACHE_KEY,
    GUEST_XP_MIGRATION_KEY,
    'guest_chat_count',
  ]);
  return { xpAwarded, completionsMerged };
}
