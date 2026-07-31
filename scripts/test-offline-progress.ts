import assert from 'node:assert/strict';
import Module from 'node:module';

(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = false;

const moduleLoader = Module as typeof Module & { _load: (request: string, parent: unknown, isMain: boolean) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function loadForTest(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') {
    return { __esModule: true, default: { getItem: async () => null, setItem: async () => {} } };
  }
  if (request.endsWith('/supabase') || request === './supabase') {
    return { supabase: { auth: { getSession: async () => ({ data: { session: null } }) }, rpc: async () => ({ data: null, error: null }) } };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const { createOfflineProgressQueue } = require('../utils/offline-progress') as typeof import('../utils/offline-progress');

function createRuntime() {
  const values = new Map<string, string>();
  const syncedIds: string[] = [];
  let failSync = false;
  const runtime: Parameters<typeof createOfflineProgressQueue>[0] = {
    getItem: async key => values.get(key) ?? null,
    setItem: async (key, value) => { values.set(key, value); },
    setItems: async entries => { entries.forEach(([key, value]) => values.set(key, value)); },
    now: () => new Date('2026-07-31T12:00:00.000Z'),
    syncCompletion: async event => {
      if (failSync) throw new Error('network unavailable');
      syncedIds.push(event.id);
      return { firstCompletion: true, xpAwarded: event.xp };
    },
  };
  return { runtime, values, syncedIds, setFailSync: (value: boolean) => { failSync = value; } };
}

const completion = {
  ownerId: 'user-a',
  completionKey: 'msa:unit-1:basic-words',
  legacyContentId: 'basic-words',
  dialect: 'msa',
  score: 100,
  xp: 10,
  completionCandidates: ['msa:unit-1:basic-words', 'basic-words'],
};

async function main() {
  const test = createRuntime();
  const queue = createOfflineProgressQueue(test.runtime);
  const [first, duplicate] = await Promise.all([queue.enqueue(completion), queue.enqueue(completion)]);
  assert.equal(first.firstCompletion, true);
  assert.equal(first.xpAwarded, 10);
  assert.equal(duplicate.firstCompletion, false);
  assert.equal(duplicate.xpAwarded, 0);
  assert.equal(test.values.get('xp_cache:user-a'), '10');

  const afterRestart = createOfflineProgressQueue(test.runtime);
  assert.equal(await afterRestart.hydrate(), 1);
  assert.deepEqual([...await afterRestart.getCompletionIds('user-a')], ['msa:unit-1:basic-words']);
  assert.equal((await afterRestart.getCompletionIds('user-b')).size, 0);

  test.setFailSync(true);
  assert.equal(await afterRestart.sync('user-a'), 0);
  assert.equal(await afterRestart.hydrate(), 1, 'failed sync must remain durable');

  test.setFailSync(false);
  assert.equal(await afterRestart.sync('user-a'), 1);
  assert.equal(await afterRestart.hydrate(), 0);
  assert.equal(test.syncedIds.length, 1);
  assert.equal(await afterRestart.sync('user-a'), 0, 'retry after acknowledgment must not duplicate sync');
  assert.equal(test.syncedIds.length, 1);
  assert.deepEqual([...await afterRestart.getCompletionIds('user-a')], ['msa:unit-1:basic-words']);

  const repeatedAfterSync = await afterRestart.enqueue(completion);
  assert.equal(repeatedAfterSync.firstCompletion, false);
  assert.equal(repeatedAfterSync.xpAwarded, 0);
  assert.equal(test.values.get('xp_cache:user-a'), '10');

  const userB = await afterRestart.enqueue({ ...completion, ownerId: 'user-b' });
  assert.equal(userB.firstCompletion, true);
  assert.equal((await afterRestart.getCompletionIds('user-a')).size, 1);
  assert.equal((await afterRestart.getCompletionIds('user-b')).size, 1);

  console.log('Offline progress queue tests passed (12 checks).');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
