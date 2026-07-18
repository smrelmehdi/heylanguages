import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTEMPT_COUNTER_PREFIX = 'quiz_attempt_counter:';
const ACTIVE_ATTEMPT_PREFIX = 'quiz_active_attempt:';
let seedWriteQueue = Promise.resolve();

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
