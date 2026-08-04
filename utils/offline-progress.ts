import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const STORAGE_KEY = 'offline_progress_queue_v1';
const XP_CACHE_PREFIX = 'xp_cache:';

export type OfflineCompletionEvent = {
  id: string;
  ownerId: string;
  completionKey: string;
  legacyContentId: string;
  dialect: string;
  score: number;
  xp: number;
  completionCandidates: string[];
  createdAt: string;
  attempts: number;
};

type AcknowledgedCompletion = Pick<OfflineCompletionEvent, 'completionKey' | 'legacyContentId' | 'dialect'>;
type OfflineProgressStore = {
  events: OfflineCompletionEvent[];
  acknowledged: Record<string, AcknowledgedCompletion>;
};

type QueueRuntime = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  setItems: (entries: [string, string][]) => Promise<void>;
  removeItem?: (key: string) => Promise<void>;
  now: () => Date;
  syncCompletion: (event: OfflineCompletionEvent) => Promise<{ firstCompletion: boolean; xpAwarded: number }>;
};

const listeners = new Set<() => void>();
let pendingCount = 0;
let syncing = false;

function notify() {
  listeners.forEach(listener => listener());
}

function emptyStore(): OfflineProgressStore {
  return { events: [], acknowledged: {} };
}

function parseStore(raw: string | null): OfflineProgressStore {
  if (!raw) return emptyStore();
  try {
    const parsed = JSON.parse(raw) as Partial<OfflineProgressStore>;
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      acknowledged: parsed.acknowledged && typeof parsed.acknowledged === 'object' ? parsed.acknowledged : {},
    };
  } catch {
    return emptyStore();
  }
}

export function createOfflineProgressQueue(runtime: QueueRuntime) {
  let queue = Promise.resolve();
  let syncPromise: Promise<number> | null = null;
  let syncOwnerId: string | null = null;

  const serialize = <T,>(work: () => Promise<T>) => {
    const operation = queue.then(work, work);
    queue = operation.then(() => undefined, () => undefined);
    return operation;
  };

  const readUnlocked = async () => parseStore(await runtime.getItem(STORAGE_KEY));
  const writeUnlocked = async (store: OfflineProgressStore) => {
    await runtime.setItem(STORAGE_KEY, JSON.stringify(store));
    pendingCount = store.events.length;
    notify();
  };

  const eventId = (ownerId: string, dialect: string, completionKey: string) =>
    `completion:${encodeURIComponent(ownerId)}:${encodeURIComponent(dialect)}:${encodeURIComponent(completionKey)}`;

  const enqueue = (input: Omit<OfflineCompletionEvent, 'id' | 'createdAt' | 'attempts'>) => serialize(async () => {
    const store = await readUnlocked();
    const id = eventId(input.ownerId, input.dialect, input.completionKey);
    const existing = store.events.find(event => event.id === id);
    if (existing || store.acknowledged[id]) {
      return { event: existing ?? null, firstCompletion: false, xpAwarded: 0, previousXp: 0, nextXp: 0 };
    }
    const event: OfflineCompletionEvent = {
      ...input,
      id,
      createdAt: runtime.now().toISOString(),
      attempts: 0,
    };
    const xpKey = `${XP_CACHE_PREFIX}${input.ownerId}`;
    const rawXp = await runtime.getItem(xpKey);
    const parsedXp = rawXp == null ? 0 : Number.parseInt(rawXp, 10);
    const previousXp = Number.isFinite(parsedXp) && parsedXp >= 0 ? parsedXp : 0;
    const nextXp = previousXp + input.xp;
    store.events.push(event);
    await runtime.setItems([
      [xpKey, String(nextXp)],
      [STORAGE_KEY, JSON.stringify(store)],
    ]);
    pendingCount = store.events.length;
    notify();
    if (__DEV__) console.info('[offline-progress] queued', { dialect: input.dialect, pending: store.events.length });
    return { event, firstCompletion: true, xpAwarded: input.xp, previousXp, nextXp };
  });

  const acknowledge = (input: Omit<OfflineCompletionEvent, 'id' | 'createdAt' | 'attempts'>) => serialize(async () => {
    const store = await readUnlocked();
    const id = eventId(input.ownerId, input.dialect, input.completionKey);
    store.events = store.events.filter(event => event.id !== id);
    store.acknowledged[id] = {
      completionKey: input.completionKey,
      legacyContentId: input.legacyContentId,
      dialect: input.dialect,
    };
    await writeUnlocked(store);
  });

  const getCompletionIds = async (ownerId: string) => {
    await queue;
    const store = await readUnlocked();
    const ids = new Set<string>();
    store.events.filter(event => event.ownerId === ownerId).forEach(event => ids.add(event.completionKey));
    Object.entries(store.acknowledged).forEach(([id, item]) => {
      if (id === eventId(ownerId, item.dialect, item.completionKey)) ids.add(item.completionKey);
    });
    return ids;
  };

  const hydrate = async () => {
    await queue;
    const store = await readUnlocked();
    pendingCount = store.events.length;
    notify();
    return store.events.length;
  };

  const clearOwner = (ownerId: string) => serialize(async () => {
    const store = await readUnlocked();
    store.events = store.events.filter(event => event.ownerId !== ownerId);
    for (const [id, item] of Object.entries(store.acknowledged)) {
      if (id === eventId(ownerId, item.dialect, item.completionKey)) delete store.acknowledged[id];
    }
    await writeUnlocked(store);
    if (runtime.removeItem) await runtime.removeItem(`${XP_CACHE_PREFIX}${ownerId}`);
    else await runtime.setItem(`${XP_CACHE_PREFIX}${ownerId}`, '0');
  });

  const sync = (ownerId: string): Promise<number> => {
    if (syncPromise) {
      if (syncOwnerId === ownerId) return syncPromise;
      return syncPromise.then(() => sync(ownerId), () => sync(ownerId));
    }
    syncOwnerId = ownerId;
    syncing = true;
    notify();
    syncPromise = serialize(async () => {
      const store = await readUnlocked();
      let synced = 0;
      for (const event of store.events.filter(item => item.ownerId === ownerId)) {
        try {
          await runtime.syncCompletion(event);
          store.events = store.events.filter(item => item.id !== event.id);
          store.acknowledged[event.id] = {
            completionKey: event.completionKey,
            legacyContentId: event.legacyContentId,
            dialect: event.dialect,
          };
          await writeUnlocked(store);
          synced += 1;
        } catch (error) {
          event.attempts += 1;
          await writeUnlocked(store);
          if (__DEV__) console.warn('[offline-progress] sync retained event', { eventId: event.id, attempts: event.attempts });
          break;
        }
      }
      return synced;
    }).finally(() => {
      syncing = false;
      syncPromise = null;
      syncOwnerId = null;
      notify();
    });
    return syncPromise;
  };

  return { enqueue, acknowledge, getCompletionIds, hydrate, sync, clearOwner };
}

const defaultQueue = createOfflineProgressQueue({
  getItem: key => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  setItems: entries => AsyncStorage.multiSet(entries),
  removeItem: key => AsyncStorage.removeItem(key),
  now: () => new Date(),
  syncCompletion: async event => {
    const { data, error } = await supabase.rpc('complete_quiz_once', {
      p_scenario: event.completionKey,
      p_dialect: event.dialect,
      p_score: event.score,
      p_xp: event.xp,
      p_completion_candidates: event.completionCandidates,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return { firstCompletion: Boolean(row?.first_completion), xpAwarded: Number(row?.xp_awarded ?? 0) };
  },
});

export const enqueueOfflineCompletion = defaultQueue.enqueue;
export const acknowledgeOnlineCompletion = defaultQueue.acknowledge;
export const getLocalCompletionIds = defaultQueue.getCompletionIds;
export const hydrateOfflineProgressQueue = defaultQueue.hydrate;
export const clearOfflineProgressForOwner = defaultQueue.clearOwner;

export async function syncOfflineProgressQueue() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return 0;
  return defaultQueue.sync(session.user.id);
}

export function getOfflineProgressStatus() {
  return { pendingCount, syncing };
}

export function subscribeOfflineProgress(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
