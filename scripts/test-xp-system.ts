import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';

const extensions = (Module as typeof Module & { _extensions: Record<string, (module: { exports: unknown }) => void> })._extensions;
for (const extension of ['.mp3', '.png', '.jpg', '.jpeg', '.webp']) {
  extensions[extension] = module => { module.exports = 1; };
}

const nativeStorageValues = new Map<string, string>();
const nativeStorageMock = {
  getItem: async (key: string) => nativeStorageValues.get(key) ?? null,
  setItem: async (key: string, value: string) => { nativeStorageValues.set(key, value); },
  multiSet: async (entries: readonly (readonly [string, string])[]) => entries.forEach(([key, value]) => nativeStorageValues.set(key, value)),
  multiRemove: async (keys: readonly string[]) => keys.forEach(key => nativeStorageValues.delete(key)),
};
const moduleWithLoader = Module as typeof Module & {
  _load: (request: string, parent: unknown, isMain: boolean) => unknown;
};
const originalLoad = moduleWithLoader._load;
const supabaseMock = {
  auth: { getSession: async () => ({ data: { session: null as null | { user: { id: string } } } }) },
  rpc: async () => ({ data: null as unknown, error: null as Error | null }),
};
moduleWithLoader._load = function loadForXpTests(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') {
    return { __esModule: true, default: nativeStorageMock };
  }
  if (request === './supabase') {
    return { supabase: supabaseMock };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const memory = () => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => { values.set(key, value); },
    multiSet: async (entries: readonly (readonly [string, string])[]) => entries.forEach(([key, value]) => values.set(key, value)),
    multiRemove: async (keys: readonly string[]) => keys.forEach(key => values.delete(key)),
  };
};

const {
  createGuestCompletionPersister,
  GUEST_PROGRESS_KEY,
  GUEST_XP_CACHE_KEY,
} = require('../utils/quiz-completion') as typeof import('../utils/quiz-completion');
const { mergeGuestProgress } = require('../utils/guest-xp-migration') as typeof import('../utils/guest-xp-migration');
const { buildCompletionKey } = require('../utils/progression') as typeof import('../utils/progression');
const { getLevelFromXP, getXPProgress, getXPToNextLevel } = require('../constants/levels') as typeof import('../constants/levels');
const { getPersistableQuizXp, getQuizPassed } = require('../utils/quiz-scoring') as typeof import('../utils/quiz-scoring');

const lessonKey = buildCompletionKey('gulf', 'unit-1', 'basic_words');
const guestInput = (snapshots: Array<[number, number]>) => ({
  completionKey: lessonKey,
  dialect: 'gulf',
  legacyContentId: 'basic_words',
  score: 100,
  xp: 60,
  applyGuestXpSnapshot: (previousXp: number, nextXp: number) => snapshots.push([previousXp, nextXp]),
  refreshSignedInXp: async () => {},
});

async function testGuestFirstRepeatConcurrencyAndRestart() {
  const storage = memory();
  const snapshots: Array<[number, number]> = [];
  const persist = createGuestCompletionPersister(storage);
  const first = await persist(guestInput(snapshots));
  assert.deepEqual(first, { firstCompletion: true, xpAwarded: 60 });
  assert.equal(storage.values.get(GUEST_XP_CACHE_KEY), '60');
  assert.equal(JSON.parse(storage.values.get(GUEST_PROGRESS_KEY) ?? '{}')[lessonKey], true);

  const repeat = await persist(guestInput(snapshots));
  assert.deepEqual(repeat, { firstCompletion: false, xpAwarded: 0 });
  assert.equal(storage.values.get(GUEST_XP_CACHE_KEY), '60');

  const afterRestart = createGuestCompletionPersister(storage);
  const restartedRepeat = await afterRestart(guestInput(snapshots));
  assert.equal(restartedRepeat.xpAwarded, 0);
  assert.deepEqual(snapshots[snapshots.length - 1], [60, 60]);

  const concurrentStorage = memory();
  const concurrentPersist = createGuestCompletionPersister(concurrentStorage);
  const results = await Promise.all(Array.from({ length: 20 }, () => concurrentPersist(guestInput([]))));
  assert.equal(results.filter(result => result.firstCompletion).length, 1);
  assert.equal(results.reduce((sum, result) => sum + result.xpAwarded, 0), 60);
  assert.equal(concurrentStorage.values.get(GUEST_XP_CACHE_KEY), '60');
}

async function testGuestPersistenceFailureDoesNotShowXp() {
  const storage = memory();
  let snapshotCalls = 0;
  storage.multiSet = async () => { throw new Error('disk full'); };
  const persist = createGuestCompletionPersister(storage);
  await assert.rejects(persist({
    ...guestInput([]),
    applyGuestXpSnapshot: () => { snapshotCalls += 1; },
  }));
  assert.equal(snapshotCalls, 0);
  assert.equal(storage.values.has(GUEST_PROGRESS_KEY), false);
  assert.equal(storage.values.has(GUEST_XP_CACHE_KEY), false);
}

async function testCommittedSignedCompletionSurvivesRefreshFailure() {
  const originalGetSession = supabaseMock.auth.getSession;
  const originalRpc = supabaseMock.rpc;
  supabaseMock.auth.getSession = async () => ({
    data: { session: { user: { id: 'signed-user' } } },
  });
  supabaseMock.rpc = async () => ({
    data: [{ first_completion: true, xp_awarded: 60 }],
    error: null,
  });
  const originalWarn = console.warn;
  console.warn = () => {};

  try {
    const { persistCurriculumCompletion } = require('../utils/quiz-completion') as typeof import('../utils/quiz-completion');
    const result = await persistCurriculumCompletion({
      ...guestInput([]),
      refreshSignedInXp: async () => { throw new Error('network refresh failed'); },
    });
    assert.deepEqual(result, { firstCompletion: true, xpAwarded: 60 });
  } finally {
    console.warn = originalWarn;
    supabaseMock.auth.getSession = originalGetSession;
    supabaseMock.rpc = originalRpc;
  }
}

async function testIdempotentGuestMigration() {
  const storage = memory();
  storage.values.set(GUEST_PROGRESS_KEY, JSON.stringify({ [lessonKey]: true }));
  storage.values.set(GUEST_XP_CACHE_KEY, '60');
  let remoteXp = 100;
  const migrationLedger = new Set<string>();
  const completionLedger = new Set<string>();
  let failCleanupOnce = true;
  storage.multiRemove = async keys => {
    if (failCleanupOnce) {
      failCleanupOnce = false;
      throw new Error('interrupted after server commit');
    }
    keys.forEach(key => storage.values.delete(key));
  };
  const dependencies = {
    storage,
    getAuthenticatedUserId: async () => 'test-user',
    createMigrationId: () => 'stable-device-transfer',
    mergeXpOnce: async (_targetUserId: string, id: string, xp: number) => {
      if (migrationLedger.has(id)) return 0;
      migrationLedger.add(id);
      remoteXp += xp;
      return xp;
    },
    persistCompletion: async (_targetUserId: string, _migrationId: string, key: string) => {
      const firstMigration = !completionLedger.has(key);
      completionLedger.add(key);
      return firstMigration;
    },
  };

  await assert.rejects(mergeGuestProgress(dependencies, 'test-user'));
  const retry = await mergeGuestProgress(dependencies, 'test-user');
  assert.equal(remoteXp, 160, 'Interrupted migration must transfer guest XP exactly once');
  assert.equal(retry.xpAwarded, 0);
  assert.equal(completionLedger.size, 1);
  assert.equal(storage.values.has(GUEST_XP_CACHE_KEY), false);
}

async function testSignedFirstRepeatAndConcurrentModel() {
  let queue = Promise.resolve();
  let completed = false;
  let remoteXp = 0;
  const completeOnce = (xp: number) => {
    const operation = queue.then(() => {
      const firstCompletion = !completed;
      completed = true;
      const xpAwarded = firstCompletion ? xp : 0;
      remoteXp += xpAwarded;
      return { firstCompletion, xpAwarded };
    });
    queue = operation.then(() => undefined, () => undefined);
    return operation;
  };

  const results = await Promise.all(Array.from({ length: 20 }, () => completeOnce(60)));
  assert.equal(results.filter(result => result.firstCompletion).length, 1);
  assert.equal(results.reduce((sum, result) => sum + result.xpAwarded, 0), 60);
  assert.deepEqual(await completeOnce(60), { firstCompletion: false, xpAwarded: 0 });
  assert.equal(remoteXp, 60);
}

function testQuizRulesAndLevelBoundaries() {
  assert.equal(getQuizPassed(2, 4), false);
  assert.equal(getPersistableQuizXp(2, 4, 20), 0, 'Failed quiz awards zero XP');
  assert.equal(getQuizPassed(3, 4), true);
  assert.equal(getPersistableQuizXp(3, 4, 30), 30, 'Exact 75% pass awards earned XP');
  assert.equal(getPersistableQuizXp(4, 4, 40, true), 0, 'Due for Practice awards zero XP');

  const boundaries = [
    [0, 'Beginner', 0, 500],
    [499, 'Beginner', 99, 1],
    [500, 'Elementary', 0, 1000],
    [1499, 'Elementary', 99, 1],
    [1500, 'Intermediate', 0, 1500],
    [3000, 'Advanced', 0, 3000],
    [6000, 'Fluent', 100, 0],
  ] as const;
  boundaries.forEach(([xp, level, progress, toNext]) => {
    assert.equal(getLevelFromXP(xp).name, level);
    assert.equal(getXPProgress(xp), progress);
    assert.equal(getXPToNextLevel(xp), toNext);
  });
}

function testDatabaseAtomicityContracts() {
  const completionSql = readFileSync('supabase/migrations/20260718010000_atomic_quiz_completion.sql', 'utf8');
  assert.match(completionSql, /pg_advisory_xact_lock/);
  assert.match(completionSql, /completed_count\s*=\s*coalesce\(progress\.completed_count, 0\) \+ 1/);
  assert.match(completionSql, /set xp = coalesce\(xp, 0\) \+ p_xp/);
  assert.match(completionSql, /case when was_completed then 0 else p_xp end/);

  const migrationSql = readFileSync('supabase/migrations/20260721000000_idempotent_guest_xp_migration.sql', 'utf8');
  assert.match(migrationSql, /primary key \(user_id, migration_id\)/);
  assert.match(migrationSql, /on conflict \(user_id, migration_id\) do nothing/);
  assert.match(migrationSql, /set xp = coalesce\(xp, 0\) \+ p_xp/);
}

function testXpUiAndWriteContracts() {
  const lesson = readFileSync('app/lesson.tsx', 'utf8');
  const scenario = readFileSync('app/scenario.tsx', 'utf8');
  const writing = readFileSync('app/writing.tsx', 'utf8');
  const tieredQuiz = readFileSync('app/quiz-unit2.tsx', 'utf8');
  const context = readFileSync('contexts/XPContext.tsx', 'utf8');

  assert.match(lesson, /setCompletionXpAwarded\(await saveCompletion\(\)\)/);
  assert.match(scenario, /setCompletionXpAwarded\(xpAwarded\)/);
  assert.match(writing, /setCompletionXpAwarded\(xpAwarded\)/);
  assert.match(tieredQuiz, /requestedUnit === 'review' \|\| awardedQuestionIdsRef/);
  assert.match(tieredQuiz, /setPersistenceFailed\(true\)/);
  assert.doesNotMatch(context, /\baddXP\b/);
  assert.match(context, /`\$\{XP_CACHE_KEY\}:\$\{session\.user\.id\}`/);
}

async function main() {
  await testGuestFirstRepeatConcurrencyAndRestart();
  await testGuestPersistenceFailureDoesNotShowXp();
  await testCommittedSignedCompletionSurvivesRefreshFailure();
  await testIdempotentGuestMigration();
  await testSignedFirstRepeatAndConcurrentModel();
  testQuizRulesAndLevelBoundaries();
  testDatabaseAtomicityContracts();
  testXpUiAndWriteContracts();
  console.log('XP system regression tests passed.');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
