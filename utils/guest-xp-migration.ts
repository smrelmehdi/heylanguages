import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCanonicalCompletionKey, parseCompletionKey } from './progression';
import { supabase } from './supabase';

export const GUEST_PROGRESS_KEY = 'guest_progress';
export const GUEST_XP_CACHE_KEY = 'guest_xp_cache';
export const GUEST_MIGRATION_ID_KEY = 'guest_xp_migration_id';
export const GUEST_MIGRATION_SNAPSHOT_KEY = 'guest_progress_migration_snapshot_v1';
export const GUEST_MIGRATION_TIMEOUT_MS = 8_000;

type GuestMigrationSnapshot = {
  migrationId: string;
  targetUserId: string;
  progress: Record<string, boolean>;
  xp: number;
};

type GuestMigrationStorage = Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'multiRemove'>;

export type GuestMigrationDependencies = {
  storage: GuestMigrationStorage;
  getAuthenticatedUserId: () => Promise<string | null>;
  mergeXpOnce: (targetUserId: string, migrationId: string, xp: number) => Promise<number>;
  persistCompletion: (
    targetUserId: string,
    migrationId: string,
    completionKey: string,
  ) => Promise<boolean>;
  createMigrationId: () => string;
};

export type GuestMigrationResult = {
  status: 'complete' | 'pending';
  reason?: 'timeout' | 'identity_changed' | 'error';
  xpAwarded: number;
  completionsMerged: number;
  migrated: boolean;
};

type MigrationAttempt = { cancelled: boolean };

class MigrationIdentityChangedError extends Error {}
class MigrationCancelledError extends Error {}

async function getCurrentAuthenticatedUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

const defaultDependencies: GuestMigrationDependencies = {
  storage: AsyncStorage,
  getAuthenticatedUserId: getCurrentAuthenticatedUserId,
  createMigrationId: () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`,
  mergeXpOnce: async (targetUserId, migrationId, xp) => {
    const { data, error } = await supabase.rpc('merge_guest_xp_once', {
      p_target_user_id: targetUserId,
      p_migration_id: migrationId,
      p_xp: xp,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return Number(row?.xp_awarded ?? 0);
  },
  persistCompletion: async (targetUserId, migrationId, completionKey) => {
    const { data, error } = await supabase.rpc('merge_guest_completion_once', {
      p_target_user_id: targetUserId,
      p_migration_id: migrationId,
      p_completion_key: completionKey,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return Boolean(row?.completion_migrated);
  },
};

function checkAttempt(attempt?: MigrationAttempt) {
  if (attempt?.cancelled) throw new MigrationCancelledError('Guest progress migration timed out.');
}

async function assertSnapshotOwner(
  dependencies: GuestMigrationDependencies,
  targetUserId: string,
  attempt?: MigrationAttempt,
) {
  checkAttempt(attempt);
  const authenticatedUserId = await dependencies.getAuthenticatedUserId();
  checkAttempt(attempt);
  if (authenticatedUserId !== targetUserId) {
    throw new MigrationIdentityChangedError('Authenticated account changed during guest progress migration.');
  }
}

async function getOrCreateSnapshot(
  dependencies: GuestMigrationDependencies,
  targetUserId: string,
): Promise<GuestMigrationSnapshot | null> {
  const { storage } = dependencies;
  const existingRaw = await storage.getItem(GUEST_MIGRATION_SNAPSHOT_KEY);
  if (existingRaw) {
    const existing = JSON.parse(existingRaw) as Partial<GuestMigrationSnapshot>;
    if (existing.targetUserId && existing.targetUserId !== targetUserId) {
      throw new MigrationIdentityChangedError('Guest progress snapshot belongs to another authenticated account.');
    }
    const boundSnapshot = { ...existing, targetUserId } as GuestMigrationSnapshot;
    if (!existing.targetUserId) {
      await storage.setItem(GUEST_MIGRATION_SNAPSHOT_KEY, JSON.stringify(boundSnapshot));
    }
    return boundSnapshot;
  }

  const [guestProgress, guestXpRaw, existingMigrationId] = await Promise.all([
    storage.getItem(GUEST_PROGRESS_KEY),
    storage.getItem(GUEST_XP_CACHE_KEY),
    storage.getItem(GUEST_MIGRATION_ID_KEY),
  ]);
  const progress: Record<string, boolean> = guestProgress ? JSON.parse(guestProgress) : {};
  const parsedXp = guestXpRaw == null ? 0 : Number.parseInt(guestXpRaw, 10);
  const xp = Number.isFinite(parsedXp) && parsedXp > 0 ? parsedXp : 0;
  if (!Object.values(progress).some(Boolean) && xp === 0) return null;

  const snapshot: GuestMigrationSnapshot = {
    migrationId: existingMigrationId || dependencies.createMigrationId(),
    targetUserId,
    progress: { ...progress },
    xp,
  };
  await storage.setItem(GUEST_MIGRATION_ID_KEY, snapshot.migrationId);
  await storage.setItem(GUEST_MIGRATION_SNAPSHOT_KEY, JSON.stringify(snapshot));
  return snapshot;
}

export async function mergeGuestProgress(
  dependencies: GuestMigrationDependencies,
  targetUserId: string,
  attempt?: MigrationAttempt,
) {
  const snapshot = await getOrCreateSnapshot(dependencies, targetUserId);
  if (!snapshot) return { xpAwarded: 0, completionsMerged: 0, migrated: false };
  await assertSnapshotOwner(dependencies, snapshot.targetUserId, attempt);

  let xpAwarded = 0;
  if (snapshot.xp > 0) {
    await assertSnapshotOwner(dependencies, snapshot.targetUserId, attempt);
    xpAwarded = await dependencies.mergeXpOnce(snapshot.targetUserId, snapshot.migrationId, snapshot.xp);
    await assertSnapshotOwner(dependencies, snapshot.targetUserId, attempt);
  }

  let completionsMerged = 0;
  for (const [storedKey, completed] of Object.entries(snapshot.progress)) {
    if (!completed) continue;
    const parsed = parseCompletionKey(storedKey);
    const completionKey = parsed ? storedKey : getCanonicalCompletionKey('gulf', storedKey);
    if (!completionKey) continue;
    await assertSnapshotOwner(dependencies, snapshot.targetUserId, attempt);
    const migrated = await dependencies.persistCompletion(
      snapshot.targetUserId,
      snapshot.migrationId,
      completionKey,
    );
    await assertSnapshotOwner(dependencies, snapshot.targetUserId, attempt);
    if (migrated) completionsMerged += 1;
  }

  checkAttempt(attempt);
  await dependencies.storage.multiRemove([
    GUEST_PROGRESS_KEY,
    GUEST_XP_CACHE_KEY,
    GUEST_MIGRATION_ID_KEY,
    GUEST_MIGRATION_SNAPSHOT_KEY,
    'guest_chat_count',
  ]);
  return { xpAwarded, completionsMerged, migrated: true };
}

export async function runGuestProgressMigrationAttempt(
  dependencies: GuestMigrationDependencies,
  targetUserId: string,
  timeoutMs = GUEST_MIGRATION_TIMEOUT_MS,
): Promise<GuestMigrationResult> {
  const attempt: MigrationAttempt = { cancelled: false };
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const work = mergeGuestProgress(dependencies, targetUserId, attempt)
    .then(result => ({ status: 'complete' as const, ...result }))
    .catch((error: unknown): GuestMigrationResult => ({
      status: 'pending',
      reason: error instanceof MigrationIdentityChangedError
        ? 'identity_changed'
        : error instanceof MigrationCancelledError ? 'timeout' : 'error',
      xpAwarded: 0,
      completionsMerged: 0,
      migrated: false,
    }));
  const timeout = new Promise<GuestMigrationResult>(resolve => {
    timeoutHandle = setTimeout(() => {
      attempt.cancelled = true;
      resolve({ status: 'pending', reason: 'timeout', xpAwarded: 0, completionsMerged: 0, migrated: false });
    }, timeoutMs);
  });
  const result = await Promise.race([work, timeout]);
  if (timeoutHandle) clearTimeout(timeoutHandle);
  return result;
}

type ProgressMigrationListener = (userId: string) => void;
const listeners = new Set<ProgressMigrationListener>();
let activeMigration: { userId: string; promise: Promise<GuestMigrationResult> } | null = null;

export function subscribeAuthenticatedProgress(listener: ProgressMigrationListener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export async function publishAuthenticatedProgressIfCurrent(
  userId: string,
  result: GuestMigrationResult,
  getAuthenticatedUserId: () => Promise<string | null> = getCurrentAuthenticatedUserId,
) {
  if (result.status !== 'complete' || !result.migrated) return;
  if (await getAuthenticatedUserId() !== userId) return;
  listeners.forEach(listener => listener(userId));
}

export function migrateGuestProgressForAuthenticatedUser(userId: string): Promise<GuestMigrationResult> {
  if (activeMigration) {
    if (activeMigration.userId === userId) return activeMigration.promise;
    return activeMigration.promise.then(() => migrateGuestProgressForAuthenticatedUser(userId));
  }
  const migration = runGuestProgressMigrationAttempt(defaultDependencies, userId)
    .then(async result => {
      await publishAuthenticatedProgressIfCurrent(userId, result);
      return result;
    })
    .finally(() => { activeMigration = null; });
  activeMigration = { userId, promise: migration };
  return migration;
}

export const retryGuestProgressMigration = migrateGuestProgressForAuthenticatedUser;
