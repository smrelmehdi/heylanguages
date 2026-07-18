import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCompletionKeyCandidates } from './progression';
import { supabase } from './supabase';

const GUEST_PROGRESS_KEY = 'guest_progress';
let guestCompletionQueue = Promise.resolve();

export type QuizPassPersistenceInput = {
  completionKey: string;
  dialect: string;
  legacyContentId: string;
  score: number;
  xp: number;
  addGuestXp: (amount: number) => Promise<unknown>;
  refreshSignedInXp: () => Promise<void>;
};

export type QuizPassPersistenceResult = {
  firstCompletion: boolean;
  xpAwarded: number;
};

async function persistGuestPass(input: QuizPassPersistenceInput): Promise<QuizPassPersistenceResult> {
  const operation = guestCompletionQueue.then(async () => {
    const raw = await AsyncStorage.getItem(GUEST_PROGRESS_KEY);
    const progress: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    const candidates = getCompletionKeyCandidates(input.dialect, input.legacyContentId);
    const firstCompletion = !candidates.some(key => progress[key] === true);

    progress[input.completionKey] = true;
    await AsyncStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(progress));

    const xpAwarded = firstCompletion ? input.xp : 0;
    if (xpAwarded > 0) await input.addGuestXp(xpAwarded);
    return { firstCompletion, xpAwarded };
  });
  guestCompletionQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

/**
 * Persists a passed quiz exactly once. Signed-in writes use a database RPC that
 * locks the completion identity and awards XP in the same transaction. Guest
 * writes are serialized and re-check progress inside the critical section.
 */
export async function persistQuizPass(input: QuizPassPersistenceInput): Promise<QuizPassPersistenceResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return persistGuestPass(input);

  const { data, error } = await supabase.rpc('complete_quiz_once', {
    p_scenario: input.completionKey,
    p_dialect: input.dialect,
    p_score: input.score,
    p_xp: input.xp,
    p_completion_candidates: getCompletionKeyCandidates(input.dialect, input.legacyContentId),
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  const result = {
    firstCompletion: Boolean(row?.first_completion),
    xpAwarded: Number(row?.xp_awarded ?? 0),
  };
  await input.refreshSignedInXp();
  return result;
}
