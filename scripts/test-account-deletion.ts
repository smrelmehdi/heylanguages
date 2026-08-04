import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { deleteCurrentAccount, selectDeletedAccountLocalKeys } from '../utils/account-deletion-core';

async function run() {
  const calls: string[] = [];
  let userId: string | null = 'account-a';
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const dependencies = {
    isOnline: () => true,
    getAuthenticatedUserId: async () => userId,
    deleteRemoteAccount: async () => { calls.push('remote'); await gate; return { deleted: true }; },
    clearLocalState: async (owner: string) => { calls.push(`clear:${owner}`); },
    disconnectPremium: async () => { calls.push('premium'); },
    signOut: async () => { calls.push('signout'); },
    navigateToWelcome: () => { calls.push('navigate'); },
  };

  const first = deleteCurrentAccount(dependencies, 1_000);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(await deleteCurrentAccount(dependencies), { status: 'blocked', reason: 'busy' });
  assert.equal(calls.filter(value => value === 'remote').length, 1, 'duplicate submission invokes remote once');
  release();
  assert.deepEqual(await first, { status: 'deleted', premiumLogoutFailed: false });
  assert.deepEqual(calls, ['remote', 'clear:account-a', 'premium', 'signout', 'navigate']);

  let touched = false;
  const blocked = await deleteCurrentAccount({ ...dependencies, isOnline: () => false, deleteRemoteAccount: async () => { touched = true; return { deleted: true }; } });
  assert.deepEqual(blocked, { status: 'blocked', reason: 'offline' });
  assert.equal(touched, false);

  assert.deepEqual(await deleteCurrentAccount({ ...dependencies, getAuthenticatedUserId: async () => null }), { status: 'blocked', reason: 'unauthenticated' });

  let clears = 0;
  const failure = await deleteCurrentAccount({ ...dependencies, deleteRemoteAccount: async () => { throw new Error('server'); }, clearLocalState: async () => { clears += 1; } });
  assert.deepEqual(failure, { status: 'error', reason: 'network_or_server' });
  assert.equal(clears, 0);

  let identityChecks = 0;
  const stale = await deleteCurrentAccount({
    ...dependencies,
    getAuthenticatedUserId: async () => (++identityChecks === 1 ? 'account-a' : 'account-b'),
    deleteRemoteAccount: async () => ({ deleted: true }),
    clearLocalState: async () => { clears += 1; },
  });
  assert.deepEqual(stale, { status: 'blocked', reason: 'identity_changed' });
  assert.equal(clears, 0);

  const rcCalls: string[] = [];
  const rcFailure = await deleteCurrentAccount({
    ...dependencies,
    deleteRemoteAccount: async () => ({ deleted: true }),
    clearLocalState: async () => { rcCalls.push('clear'); },
    disconnectPremium: async () => { rcCalls.push('premium'); throw new Error('RC unavailable'); },
    signOut: async () => { rcCalls.push('signout'); },
    navigateToWelcome: () => { rcCalls.push('navigate'); },
  });
  assert.deepEqual(rcFailure, { status: 'deleted', premiumLogoutFailed: true });
  assert.deepEqual(rcCalls, ['clear', 'premium', 'signout', 'navigate']);

  const selected = selectDeletedAccountLocalKeys('account-a', [
    'xp_cache:account-a', 'xp_cache:account-b', 'wizard_name', 'scenario_progress_local:a', 'guest_progress',
  ], 'account-b');
  assert.deepEqual(selected.sort(), ['scenario_progress_local:a', 'wizard_name', 'xp_cache:account-a'].sort());
  assert.ok(selectDeletedAccountLocalKeys('account-a', ['guest_progress'], 'account-a').includes('guest_progress'));

  const edge = fs.readFileSync(path.join(process.cwd(), 'supabase/functions/delete-account/index.ts'), 'utf8');
  const localCleanup = fs.readFileSync(path.join(process.cwd(), 'utils/account-deletion.ts'), 'utf8');
  const sql = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20260804000000_secure_account_deletion.sql'), 'utf8');
  assert.match(edge, /\/auth\/v1\/user/);
  assert.match(edge, /is_anonymous !== true/);
  assert.match(edge, /Object\.keys\(body\)\.length > 0/);
  assert.match(edge, /catch \{ return json\(\{ error: \{ code: 'invalid_request' \} \}, 400\); \}/);
  assert.doesNotMatch(edge, /body\.userId|body\.user_id/);
  assert.match(edge, /admin\.auth\.admin\.deleteUser\(userId\)/);
  assert.ok(edge.indexOf("rpc('delete_account_data'") < edge.indexOf('deleteUser(userId)'), 'application data is deleted first');
  assert.match(sql, /security definer\s+set search_path = ''/i);
  assert.match(sql, /revoke all on function public\.delete_account_data\(uuid\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.delete_account_data\(uuid\) to service_role/i);
  for (const table of [
    'messages', 'conversations', 'icebreaker_progress', 'learned_words', 'user_memory',
    'speech_rate_limits', 'guest_completion_migrations', 'guest_xp_migrations',
    'scenario_progress', 'subscriptions', 'user_progress', 'user_streaks', 'users',
  ]) {
    assert.match(sql, new RegExp(`delete from public\\.${table}\\b`, 'i'), `${table} is explicitly deleted`);
  }
  assert.match(localCleanup, /selectDeletedAccountLocalKeys\(ownerId, keys, snapshotOwnerId\)/);
  assert.match(localCleanup, /clearOfflineOwner\(ownerId\)/);
  console.log('Account deletion regression tests passed (client guards, local cleanup, Edge authorization, SQL grants).');
}

run().catch(error => { console.error(error); process.exit(1); });
