export type ConnectivitySnapshot = {
  isOnline: boolean;
  isHydrated: boolean;
};

let snapshot: ConnectivitySnapshot = { isOnline: true, isHydrated: false };
const listeners = new Set<(value: ConnectivitySnapshot) => void>();

export function setConnectivitySnapshot(value: ConnectivitySnapshot) {
  const changed = snapshot.isOnline !== value.isOnline || snapshot.isHydrated !== value.isHydrated;
  snapshot = value;
  if (changed) listeners.forEach(listener => listener(snapshot));
}

export function getConnectivitySnapshot() {
  return snapshot;
}

export function subscribeConnectivitySnapshot(listener: (value: ConnectivitySnapshot) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function isLikelyNetworkError(error: unknown) {
  const value = error instanceof Error
    ? `${error.name} ${error.message}`
    : typeof error === 'object' && error !== null
      ? JSON.stringify(error)
      : String(error);
  return /network|offline|fetch|timeout|timed out|connection|socket/i.test(value);
}
