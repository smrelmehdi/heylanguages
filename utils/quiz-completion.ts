import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCompletionKeyCandidates, isFirstContentCompletion } from './progression';
import { getConnectivitySnapshot, isLikelyNetworkError } from './connectivity-state';
import { acknowledgeOnlineCompletion, enqueueOfflineCompletion } from './offline-progress';
import { supabase } from './supabase';

export const GUEST_PROGRESS_KEY = 'guest_progress';
export const GUEST_XP_CACHE_KEY = 'guest_xp_cache';
const LEGACY_XP_CACHE_KEY = 'xp_cache';

export type CurriculumCompletionInput = {
  completionKey: string;
  dialect: string;
  legacyContentId: string;
  score: number;
  xp: number;
  applyGuestXpSnapshot: (previousXp: number, nextXp: number) => unknown;
  refreshSignedInXp: () => Promise<void>;
};

export type CurriculumCompletionResult = {
  firstCompletion: boolean;
  xpAwarded: number;
  queuedOffline?: boolean;
};

type GuestCompletionStorage = Pick<typeof AsyncStorage, 'getItem' | 'multiSet'>;

export function createGuestCompletionPersister(storage: GuestCompletionStorage = AsyncStorage) {
  let queue = Promise.resolve();
  return (input: CurriculumCompletionInput): Promise<CurriculumCompletionResult> => {
    const operation = queue.then(async () => {
      const [raw, guestXpRaw] = await Promise.all([
        storage.getItem(GUEST_PROGRESS_KEY),
        storage.getItem(GUEST_XP_CACHE_KEY),
      ]);
      const progress: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      const completedIds = Object.keys(progress).filter(key => progress[key]);
      const firstCompletion = isFirstContentCompletion(input.dialect, input.legacyContentId, completedIds);
      progress[input.completionKey] = true;
      const xpAwarded = firstCompletion ? input.xp : 0;
      const parsedXp = guestXpRaw == null ? 0 : Number.parseInt(guestXpRaw, 10);
      const previousXp = Number.isFinite(parsedXp) && parsedXp >= 0 ? parsedXp : 0;
      const nextXp = previousXp + xpAwarded;
      await storage.multiSet([
        [GUEST_PROGRESS_KEY, JSON.stringify(progress)],
        [GUEST_XP_CACHE_KEY, String(nextXp)],
        [LEGACY_XP_CACHE_KEY, String(nextXp)],
      ]);
      input.applyGuestXpSnapshot(previousXp, nextXp);
      return { firstCompletion, xpAwarded };
    });
    queue = operation.then(() => undefined, () => undefined);
    return operation;
  };
}

const persistGuestCompletion = createGuestCompletionPersister();

/**
 * Persists a completed curriculum item. Signed-in writes use a database RPC
 * that locks the completion identity and awards XP in the same transaction.
 * Guest writes are serialized and re-check progress inside the critical section.
 */
export async function persistCurriculumCompletion(input: CurriculumCompletionInput): Promise<CurriculumCompletionResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return persistGuestCompletion(input);

  const queueInput = {
    ownerId: session.user.id,
    completionKey: input.completionKey,
    legacyContentId: input.legacyContentId,
    dialect: input.dialect,
    score: input.score,
    xp: input.xp,
    completionCandidates: getCompletionKeyCandidates(input.dialect, input.legacyContentId),
  };
  const persistOffline = async () => {
    const queued = await enqueueOfflineCompletion(queueInput);
    if (queued.firstCompletion) input.applyGuestXpSnapshot(queued.previousXp, queued.nextXp);
    return { firstCompletion: queued.firstCompletion, xpAwarded: queued.xpAwarded, queuedOffline: true };
  };

  if (getConnectivitySnapshot().isHydrated && !getConnectivitySnapshot().isOnline) {
    return persistOffline();
  }

  let data: unknown;
  try {
    const response = await supabase.rpc('complete_quiz_once', {
      p_scenario: input.completionKey,
      p_dialect: input.dialect,
      p_score: input.score,
      p_xp: input.xp,
      p_completion_candidates: queueInput.completionCandidates,
    });
    if (response.error) throw response.error;
    data = response.data;
  } catch (error) {
    if (isLikelyNetworkError(error)) return persistOffline();
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  const result = {
    firstCompletion: Boolean(row?.first_completion),
    xpAwarded: Number(row?.xp_awarded ?? 0),
  };
  await acknowledgeOnlineCompletion(queueInput);
  try {
    await input.refreshSignedInXp();
  } catch (error) {
    // The atomic RPC has already committed. A cache refresh failure must not
    // turn a successful completion into an apparent save failure.
    console.warn('XP refresh after completion failed:', error);
  }
  return result;
}

export const persistQuizPass = persistCurriculumCompletion;
