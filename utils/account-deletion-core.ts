export const ACCOUNT_DELETION_CONFIRMATION = 'DELETE';
export const ACCOUNT_DELETION_TIMEOUT_MS = 15_000;

export function selectDeletedAccountLocalKeys(
  ownerId: string,
  allKeys: readonly string[],
  guestSnapshotOwnerId: string | null,
) {
  const exact = new Set([
    `xp_cache:${ownerId}`, 'wizard_complete', 'wizard_complete_date', 'wizard_name', 'wizard_dialect',
    'wizard_level', 'guest_expiry_warning', 'streak_data', 'streak_pending_milestone', 'quiz_srs_v1',
  ]);
  const prefixes = ['quiz_attempt_counter:', 'quiz_active_attempt:', 'scenario_progress_local:'];
  const selected = allKeys.filter(key => exact.has(key) || prefixes.some(prefix => key.startsWith(prefix)));
  if (guestSnapshotOwnerId === ownerId) {
    selected.push('guest_progress', 'guest_xp_cache', 'guest_xp_migration_id', 'guest_progress_migration_snapshot_v1', 'guest_chat_count');
  }
  return [...new Set(selected)];
}

export type AccountDeletionDependencies = {
  isOnline: () => boolean;
  getAuthenticatedUserId: () => Promise<string | null>;
  deleteRemoteAccount: () => Promise<{ deleted: boolean }>;
  clearLocalState: (ownerId: string) => Promise<void>;
  disconnectPremium: () => Promise<void>;
  signOut: () => Promise<void>;
  navigateToWelcome: () => void;
};

export type AccountDeletionResult =
  | { status: 'deleted'; premiumLogoutFailed: boolean }
  | { status: 'blocked'; reason: 'offline' | 'unauthenticated' | 'identity_changed' | 'invalid_response' | 'busy' }
  | { status: 'error'; reason: 'network_or_server' };

let activeDeletion: Promise<AccountDeletionResult> | null = null;

function withTimeout<T>(work: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    work,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Account deletion timed out.')), timeoutMs)),
  ]);
}

export function deleteCurrentAccount(
  dependencies: AccountDeletionDependencies,
  timeoutMs = ACCOUNT_DELETION_TIMEOUT_MS,
): Promise<AccountDeletionResult> {
  if (activeDeletion) return Promise.resolve({ status: 'blocked', reason: 'busy' });
  const attempt = (async (): Promise<AccountDeletionResult> => {
    if (!dependencies.isOnline()) return { status: 'blocked', reason: 'offline' };
    const ownerId = await dependencies.getAuthenticatedUserId();
    if (!ownerId) return { status: 'blocked', reason: 'unauthenticated' };
    try {
      const response = await withTimeout(dependencies.deleteRemoteAccount(), timeoutMs);
      if (!response?.deleted) return { status: 'blocked', reason: 'invalid_response' };
      if (await dependencies.getAuthenticatedUserId() !== ownerId) return { status: 'blocked', reason: 'identity_changed' };
      await dependencies.clearLocalState(ownerId);
      let premiumLogoutFailed = false;
      try { await dependencies.disconnectPremium(); } catch { premiumLogoutFailed = true; }
      await dependencies.signOut();
      dependencies.navigateToWelcome();
      return { status: 'deleted', premiumLogoutFailed };
    } catch {
      return { status: 'error', reason: 'network_or_server' };
    }
  })();
  activeDeletion = attempt;
  return attempt.finally(() => { if (activeDeletion === attempt) activeDeletion = null; });
}
