import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';

(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = true;
process.env.EXPO_PUBLIC_APP_ENV = 'development';
process.env.EXPO_PUBLIC_GULF_UNIT1_CURRICULUM_VERSION = 'v2';

const extensions = (Module as typeof Module & { _extensions: Record<string, (module: { exports: unknown }) => void> })._extensions;
for (const extension of ['.mp3', '.png', '.jpg', '.jpeg', '.webp']) {
  extensions[extension] = module => { module.exports = 1; };
}

const moduleLoader = Module as typeof Module & { _load: (request: string, parent: unknown, isMain: boolean) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function loadForTest(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') {
    return { __esModule: true, default: memoryStorage() };
  }
  if (request.endsWith('/supabase') || request === './supabase') {
    return { supabase: { auth: { getSession: async () => ({ data: { session: null } }) }, rpc: async () => ({ data: null, error: null }) } };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const { getContentAccess } = require('../utils/access') as typeof import('../utils/access');
const { getDialectProgressionItems } = require('../utils/content-resolver') as typeof import('../utils/content-resolver');
const { buildCompletionKey } = require('../utils/progression') as typeof import('../utils/progression');
const {
  GUEST_MIGRATION_SNAPSHOT_KEY,
  GUEST_PROGRESS_KEY,
  GUEST_XP_CACHE_KEY,
  mergeGuestProgress,
  publishAuthenticatedProgressIfCurrent,
  runGuestProgressMigrationAttempt,
  subscribeAuthenticatedProgress,
} = require('../utils/guest-xp-migration') as typeof import('../utils/guest-xp-migration');
const { createOfflineProgressQueue } = require('../utils/offline-progress') as typeof import('../utils/offline-progress');

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => { values.set(key, value); },
    multiSet: async (entries: readonly (readonly [string, string])[]) => {
      entries.forEach(([key, value]) => values.set(key, value));
    },
    multiRemove: async (keys: readonly string[]) => { keys.forEach(key => values.delete(key)); },
  };
}

const items = getDialectProgressionItems('gulf');
const [mission1, mission2, mission3] = items;
assert.equal(mission1.contentId, 'first_arabic_words');
assert.equal(mission2.contentId, 'polite_like_a_local');
assert.equal(mission3.contentId, 'people_around_you');
const mission1Key = buildCompletionKey('gulf', mission1.unitId, mission1.contentId);
const mission2Key = buildCompletionKey('gulf', mission2.unitId, mission2.contentId);

const access = (item: typeof mission1, completed: Iterable<string>) => getContentAccess({
  contentId: item.contentId,
  unitId: item.unitId,
  contentType: item.contentType,
  dialect: 'gulf',
  isPremium: false,
  isTestingUnlocked: false,
  completedContentIds: completed,
});

async function testGuestMissionOneMigration() {
  const storage = memoryStorage();
  storage.values.set(GUEST_PROGRESS_KEY, JSON.stringify({ [mission1Key]: true }));
  storage.values.set(GUEST_XP_CACHE_KEY, '60');
  const remote = new Set<string>();
  const completionLedger = new Set<string>();
  const result = await mergeGuestProgress({
    storage,
    getAuthenticatedUserId: async () => 'account-a',
    createMigrationId: () => 'guest-to-account-a',
    mergeXpOnce: async (targetUserId) => {
      assert.equal(targetUserId, 'account-a');
      return 60;
    },
    persistCompletion: async (targetUserId, migrationId, completionKey) => {
      assert.equal(targetUserId, 'account-a');
      const ledgerKey = `${migrationId}:${completionKey}`;
      if (completionLedger.has(ledgerKey)) return false;
      completionLedger.add(ledgerKey);
      remote.add(completionKey);
      return true;
    },
  }, 'account-a');

  assert.deepEqual(result, { xpAwarded: 60, completionsMerged: 1, migrated: true });
  assert.equal(remote.has(mission1Key), true, 'Mission 1 must survive authentication');
  assert.equal(remote.has(mission2Key), false, 'Authentication must not synthesize Mission 2');
  assert.equal(access(mission2, remote).allowed, true, 'Mission 2 must be next');
  assert.equal(access(mission3, remote).reason, 'previous_incomplete', 'Mission 3 must remain locked');
  assert.equal(storage.values.has(GUEST_PROGRESS_KEY), false, 'guest state clears only after durable migration');
}

async function testInterruptedMigrationUsesStableSnapshot() {
  const storage = memoryStorage();
  storage.values.set(GUEST_PROGRESS_KEY, JSON.stringify({ [mission1Key]: true }));
  const remoteCounts = new Map<string, number>();
  const completionLedger = new Set<string>();
  let failCleanup = true;
  const originalRemove = storage.multiRemove;
  storage.multiRemove = async keys => {
    if (failCleanup) {
      failCleanup = false;
      throw new Error('simulated interruption after server commit');
    }
    await originalRemove(keys);
  };
  const dependencies = {
    storage,
    getAuthenticatedUserId: async () => 'account-a',
    createMigrationId: () => 'stable-retry',
    mergeXpOnce: async () => 0,
    persistCompletion: async (_targetUserId: string, migrationId: string, completionKey: string) => {
      const ledgerKey = `${migrationId}:${completionKey}`;
      if (completionLedger.has(ledgerKey)) return false;
      completionLedger.add(ledgerKey);
      remoteCounts.set(completionKey, (remoteCounts.get(completionKey) ?? 0) + 1);
      return true;
    },
  };

  await assert.rejects(mergeGuestProgress(dependencies, 'account-a'));
  assert.equal(storage.values.has(GUEST_MIGRATION_SNAPSHOT_KEY), true);
  storage.values.set(GUEST_PROGRESS_KEY, JSON.stringify({ [mission1Key]: true, [mission2Key]: true }));
  const retry = await mergeGuestProgress(dependencies, 'account-a');
  assert.equal(retry.completionsMerged, 0, 'ledger must reject the replayed completion');
  assert.equal(remoteCounts.get(mission1Key), 1, 'completion counter must increment exactly once');
  assert.equal(remoteCounts.has(mission2Key), false, 'retry must use the original stable snapshot');
}

async function testOwnerScopedOfflineIsolation() {
  const storage = memoryStorage();
  const queue = createOfflineProgressQueue({
    getItem: storage.getItem,
    setItem: storage.setItem,
    setItems: storage.multiSet,
    now: () => new Date('2026-08-03T00:00:00Z'),
    syncCompletion: async () => ({ firstCompletion: true, xpAwarded: 0 }),
  });
  const base = {
    completionKey: mission1Key,
    legacyContentId: mission1.contentId,
    dialect: 'gulf',
    score: 100,
    xp: 0,
    completionCandidates: [mission1Key],
  };
  await queue.enqueue({ ...base, ownerId: 'account-a' });
  assert.deepEqual([...await queue.getCompletionIds('account-a')], [mission1Key]);
  assert.deepEqual([...await queue.getCompletionIds('account-b')], []);
}

async function testMigrationSnapshotAccountBinding() {
  const storage = memoryStorage();
  storage.values.set(GUEST_PROGRESS_KEY, JSON.stringify({ [mission1Key]: true }));
  const dependencies = {
    storage,
    getAuthenticatedUserId: async () => 'account-a',
    createMigrationId: () => 'account-bound-snapshot',
    mergeXpOnce: async () => 0,
    persistCompletion: async () => { throw new Error('pause before completion'); },
  };
  await assert.rejects(mergeGuestProgress(dependencies, 'account-a'));
  await assert.rejects(
    mergeGuestProgress(dependencies, 'account-b'),
    /belongs to another authenticated account/,
  );
}

async function testIdentityAndTimeoutSafety() {
  const mismatchStorage = memoryStorage();
  mismatchStorage.values.set(GUEST_PROGRESS_KEY, JSON.stringify({ [mission1Key]: true }));
  let mismatchRpcCalls = 0;
  const mismatch = await runGuestProgressMigrationAttempt({
    storage: mismatchStorage,
    getAuthenticatedUserId: async () => 'account-b',
    createMigrationId: () => 'mismatch',
    mergeXpOnce: async () => { mismatchRpcCalls += 1; return 0; },
    persistCompletion: async () => { mismatchRpcCalls += 1; return true; },
  }, 'account-a', 100);
  assert.equal(mismatch.status, 'pending');
  assert.equal(mismatch.reason, 'identity_changed');
  assert.equal(mismatchRpcCalls, 0, 'account mismatch must stop before RPC');
  assert.equal(mismatchStorage.values.has(GUEST_PROGRESS_KEY), true);

  const switchStorage = memoryStorage();
  switchStorage.values.set(GUEST_XP_CACHE_KEY, '10');
  switchStorage.values.set(GUEST_PROGRESS_KEY, JSON.stringify({ [mission1Key]: true }));
  let identity = 'account-a';
  let completionCalls = 0;
  const switched = await runGuestProgressMigrationAttempt({
    storage: switchStorage,
    getAuthenticatedUserId: async () => identity,
    createMigrationId: () => 'switch',
    mergeXpOnce: async target => { assert.equal(target, 'account-a'); identity = 'account-b'; return 10; },
    persistCompletion: async () => { completionCalls += 1; return true; },
  }, 'account-a', 100);
  assert.equal(switched.reason, 'identity_changed');
  assert.equal(completionCalls, 0, 'identity switch after XP RPC must abort completion sequence');
  assert.equal(switchStorage.values.has(GUEST_MIGRATION_SNAPSHOT_KEY), true);

  const timeoutStorage = memoryStorage();
  timeoutStorage.values.set(GUEST_XP_CACHE_KEY, '10');
  const timedOut = await runGuestProgressMigrationAttempt({
    storage: timeoutStorage,
    getAuthenticatedUserId: async () => 'account-a',
    createMigrationId: () => 'timeout',
    mergeXpOnce: async () => new Promise<number>(() => {}),
    persistCompletion: async () => true,
  }, 'account-a', 5);
  assert.equal(timedOut.status, 'pending');
  assert.equal(timedOut.reason, 'timeout');
  assert.equal(timeoutStorage.values.has(GUEST_MIGRATION_SNAPSHOT_KEY), true, 'timeout retains immutable snapshot');
  assert.equal(timeoutStorage.values.has(GUEST_XP_CACHE_KEY), true, 'timeout retains guest storage');

  const emptyStorage = memoryStorage();
  let emptyCalls = 0;
  const empty = await runGuestProgressMigrationAttempt({
    storage: emptyStorage,
    getAuthenticatedUserId: async () => 'account-a',
    createMigrationId: () => 'empty',
    mergeXpOnce: async () => { emptyCalls += 1; return 0; },
    persistCompletion: async () => { emptyCalls += 1; return true; },
  }, 'account-a', 100);
  assert.equal(empty.status, 'complete');
  assert.equal(empty.migrated, false);
  assert.equal(emptyCalls, 0, 'empty snapshot must not call an RPC');

  const legacyStorage = memoryStorage();
  legacyStorage.values.set(GUEST_PROGRESS_KEY, JSON.stringify({ first_arabic_words: true }));
  let canonicalizedKey = '';
  const legacy = await runGuestProgressMigrationAttempt({
    storage: legacyStorage,
    getAuthenticatedUserId: async () => 'account-a',
    createMigrationId: () => 'legacy',
    mergeXpOnce: async () => 0,
    persistCompletion: async (_target, _migration, completionKey) => {
      canonicalizedKey = completionKey;
      return true;
    },
  }, 'account-a', 100);
  assert.equal(legacy.status, 'complete');
  assert.equal(canonicalizedKey, mission1Key, 'legacy Gulf key must be canonicalized before RPC');

  const published: string[] = [];
  const unsubscribe = subscribeAuthenticatedProgress(userId => published.push(userId));
  await publishAuthenticatedProgressIfCurrent(
    'account-a',
    { status: 'complete', xpAwarded: 0, completionsMerged: 1, migrated: true },
    async () => 'account-b',
  );
  await publishAuthenticatedProgressIfCurrent(
    'account-a',
    { status: 'pending', reason: 'identity_changed', xpAwarded: 0, completionsMerged: 0, migrated: false },
    async () => 'account-a',
  );
  assert.deepEqual(published, [], 'identity changes and pending attempts must never publish success');
  await publishAuthenticatedProgressIfCurrent(
    'account-a',
    { status: 'complete', xpAwarded: 0, completionsMerged: 1, migrated: true },
    async () => 'account-a',
  );
  assert.deepEqual(published, ['account-a']);
  unsubscribe();
}

async function main() {
  await testGuestMissionOneMigration();
  await testInterruptedMigrationUsesStableSnapshot();
  await testOwnerScopedOfflineIsolation();
  await testMigrationSnapshotAccountBinding();
  await testIdentityAndTimeoutSafety();

  const rootLayout = readFileSync('app/_layout.tsx', 'utf8');
  const login = readFileSync('app/login.tsx', 'utf8');
  const learn = readFileSync('app/(tabs)/index.tsx', 'utf8');
  const routeGate = readFileSync('components/PremiumRouteGate.tsx', 'utf8');
  const sql = readFileSync('supabase/migrations/20260803000000_idempotent_guest_completion_migration.sql', 'utf8');

  assert.match(rootLayout, /getSession[\s\S]*migrateGuestProgressForAuthenticatedUser/, 'restored sessions must migrate');
  assert.match(rootLayout, /onAuthStateChange[\s\S]*migrateGuestProgressForAuthenticatedUser/, 'email verification and future auth methods must migrate');
  assert.doesNotMatch(login.slice(login.indexOf('signInWithPassword'), login.indexOf('} else {', login.indexOf('signInWithPassword'))), /dialect:|level:/, 'existing profile dialect and level must be preserved');
  assert.doesNotMatch(learn.slice(learn.indexOf('if (session)'), learn.indexOf('} else {', learn.indexOf('if (session)'))), /guest_progress/, 'signed-in Learn hydration must not merge raw guest state');
  assert.match(routeGate, /if \(!session\)[\s\S]*guest_progress/, 'route gate may read guest progress only without a session');
  assert.match(sql, /primary key \(user_id, migration_id, completion_key\)/);
  assert.match(sql, /on conflict \(user_id, migration_id, completion_key\) do nothing/);
  assert.match(sql, /p_target_user_id uuid/);
  assert.match(sql, /current_user_id <> p_target_user_id/);
  assert.match(sql, /set search_path = ''/);
  assert.match(sql, /on conflict \(user_id, scenario_id, dialect\) do nothing/);
  assert.doesNotMatch(sql, /do update set/);
  assert.match(sql, /\^\(msa\|gulf\|egyptian\):unit-/);
  assert.match(sql, /revoke all on function public\.merge_guest_completion_once\(uuid, text, text\) from anon/);
  assert.match(sql, /merge_guest_xp_once\(\s*p_target_user_id uuid/);
  assert.match(learn, /session\?\.user\.id === eventUserId/);
  assert.match(routeGate, /session\?\.user\.id === eventUserId/);
  assert.equal(access(mission3, [mission1Key]).reason, 'previous_incomplete');

  console.log('Guest-to-account progression regression tests passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
