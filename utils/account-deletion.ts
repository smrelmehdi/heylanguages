import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearOfflineProgressForOwner } from './offline-progress';
import { selectDeletedAccountLocalKeys } from './account-deletion-core';

const GUEST_MIGRATION_SNAPSHOT_KEY = 'guest_progress_migration_snapshot_v1';

export { ACCOUNT_DELETION_CONFIRMATION, deleteCurrentAccount } from './account-deletion-core';

type Storage = Pick<typeof AsyncStorage, 'getItem' | 'getAllKeys' | 'multiRemove'>;

export async function clearDeletedAccountLocalState(
  ownerId: string,
  storage: Storage = AsyncStorage,
  clearOfflineOwner: (ownerId: string) => Promise<void> = clearOfflineProgressForOwner,
) {
  const keys = await storage.getAllKeys();
  let snapshotOwnerId: string | null = null;
  const snapshotRaw = await storage.getItem(GUEST_MIGRATION_SNAPSHOT_KEY);
  if (snapshotRaw) {
    try {
      const snapshot = JSON.parse(snapshotRaw) as { targetUserId?: unknown };
      snapshotOwnerId = typeof snapshot.targetUserId === 'string' ? snapshot.targetUserId : null;
    } catch {
      // An unreadable snapshot is retained because ownership cannot be proved.
    }
  }
  const ownedKeys = selectDeletedAccountLocalKeys(ownerId, keys, snapshotOwnerId);
  await clearOfflineOwner(ownerId);
  await storage.multiRemove([...new Set(ownedKeys)]);
}
