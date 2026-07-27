import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTEMPT_COUNTER_PREFIX = 'quiz_attempt_counter:';
const ACTIVE_ATTEMPT_PREFIX = 'quiz_active_attempt:';
let seedWriteQueue = Promise.resolve();

export type ScopedAttemptSeed = {
  scope: string;
  seed: string;
};

function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = seedWriteQueue.then(operation, operation);
  seedWriteQueue = result.then(() => undefined, () => undefined);
  return result;
}

export async function getOrCreateQuizAttemptSeed(scope: string): Promise<string> {
  return serialize(async () => {
    const activeKey = `${ACTIVE_ATTEMPT_PREFIX}${scope}`;
    const existing = await AsyncStorage.getItem(activeKey);
    if (existing) return existing;

    const counterKey = `${ATTEMPT_COUNTER_PREFIX}${scope}`;
    const rawCounter = await AsyncStorage.getItem(counterKey);
    const nextCounter = (Number.parseInt(rawCounter ?? '0', 10) || 0) + 1;
    const seed = `${scope}:${nextCounter}`;
    await AsyncStorage.multiSet([
      [counterKey, String(nextCounter)],
      [activeKey, seed],
    ]);
    return seed;
  });
}

export async function finishQuizAttempt(scope: string, seed: string): Promise<void> {
  await serialize(async () => {
    const activeKey = `${ACTIVE_ATTEMPT_PREFIX}${scope}`;
    if (await AsyncStorage.getItem(activeKey) === seed) {
      await AsyncStorage.removeItem(activeKey);
    }
  });
}

export async function startFreshQuizAttempt(scope: string): Promise<string> {
  await serialize(() => AsyncStorage.removeItem(`${ACTIVE_ATTEMPT_PREFIX}${scope}`));
  return getOrCreateQuizAttemptSeed(scope);
}

export function createScopedAttemptSeedCache(
  loadSeed: (scope: string) => Promise<string> = getOrCreateQuizAttemptSeed,
) {
  let cached: ScopedAttemptSeed | null = null;
  let activeScope: string | null = null;
  let scopeGeneration = 0;
  const pendingByScope = new Map<string, Promise<string>>();

  const getPendingSeed = (scope: string) => {
    const existing = pendingByScope.get(scope);
    if (existing) return existing;

    const pending = loadSeed(scope).finally(() => {
      if (pendingByScope.get(scope) === pending) pendingByScope.delete(scope);
    });
    pendingByScope.set(scope, pending);
    return pending;
  };

  return {
    async resolve(scope: string): Promise<ScopedAttemptSeed | null> {
      if (activeScope !== scope) {
        activeScope = scope;
        scopeGeneration += 1;
      }
      const requestedGeneration = scopeGeneration;

      if (cached?.scope === scope) return cached;

      const seed = await getPendingSeed(scope);
      if (activeScope !== scope || requestedGeneration !== scopeGeneration) return null;

      cached = { scope, seed };
      return cached;
    },

    set(scope: string, seed: string): ScopedAttemptSeed {
      activeScope = scope;
      scopeGeneration += 1;
      cached = { scope, seed };
      return cached;
    },

    peek(scope: string): ScopedAttemptSeed | null {
      return cached?.scope === scope ? cached : null;
    },
  };
}
