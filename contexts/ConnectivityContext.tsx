import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  createEmptyOfflinePackMap,
  downloadOfflineDialectPack,
  getOfflineDialectAssetCount,
  getOfflineDialectManifestInfo,
  getOfflinePackMap,
  isOfflinePackReady,
  isOfflinePackUpdateAvailable,
  removeOfflineDialectPack,
  type OfflineDialect,
  type OfflinePackManifestInfo,
  type OfflinePackMap,
  type OfflinePackRecord,
} from '../utils/offline-pack';
import { useDialect } from './DialectContext';
import { useXP } from './XPContext';
import { setConnectivitySnapshot } from '../utils/connectivity-state';
import { hydrateOfflineProgressQueue, syncOfflineProgressQueue } from '../utils/offline-progress';
import { supabase } from '../utils/supabase';

type DownloadState = {
  status: 'idle' | 'downloading' | 'done' | 'error';
  progress: number;
  completed: number;
  total: number;
  error?: string;
};

type DownloadStateMap = Record<OfflineDialect, DownloadState>;
type OptionalNetworkState = {
  isConnected?: boolean | null;
  isInternetReachable?: boolean | null;
  type?: unknown;
};
type OptionalNetworkSubscription = { remove: () => void };
type OptionalNetworkModule = {
  getNetworkStateAsync?: () => Promise<OptionalNetworkState>;
  addNetworkStateListener?: (listener: (state: OptionalNetworkState) => void) => OptionalNetworkSubscription;
};

interface ConnectivityContextValue {
  isOnline: boolean;
  isChecking: boolean;
  shouldBlockOfflineFree: boolean;
  offlineBlockReason: 'free-plan' | 'pack-required' | null;
  currentDialectOfflineReady: boolean;
  offlinePacks: OfflinePackMap;
  downloadStates: DownloadStateMap;
  refreshConnection: () => Promise<void>;
  downloadPack: (dialect: OfflineDialect) => Promise<void>;
  removePack: (dialect: OfflineDialect) => Promise<void>;
  getPackAssetCount: (dialect: OfflineDialect) => number;
  getPackManifestInfo: (dialect: OfflineDialect) => OfflinePackManifestInfo;
  isPackUpdateAvailable: (dialect: OfflineDialect) => boolean;
}

const DEFAULT_DOWNLOAD_STATE: DownloadState = {
  status: 'idle',
  progress: 0,
  completed: 0,
  total: 0,
};

let didWarnMissingExpoNetwork = false;

function getOptionalNetwork(): OptionalNetworkModule | null {
  try {
    // Optional native module: older dev clients may not include ExpoNetwork.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-network') as OptionalNetworkModule;
  } catch (error) {
    if (__DEV__ && !didWarnMissingExpoNetwork) {
      didWarnMissingExpoNetwork = true;
      console.warn('expo-network unavailable, using online fallback.', error);
    }
    return null;
  }
}

function isReachable(state: OptionalNetworkState): boolean {
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

const ConnectivityContext = createContext<ConnectivityContextValue>({
  isOnline: true,
  isChecking: true,
  shouldBlockOfflineFree: false,
  offlineBlockReason: null,
  currentDialectOfflineReady: false,
  offlinePacks: createEmptyOfflinePackMap(),
  downloadStates: {
    gulf: DEFAULT_DOWNLOAD_STATE,
    egyptian: DEFAULT_DOWNLOAD_STATE,
    msa: DEFAULT_DOWNLOAD_STATE,
  },
  refreshConnection: async () => {},
  downloadPack: async () => {},
  removePack: async () => {},
  getPackAssetCount: () => 0,
  getPackManifestInfo: dialect => getOfflineDialectManifestInfo(dialect),
  isPackUpdateAvailable: () => false,
});

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const { dialect } = useDialect();
  const { isPremium, premiumStatus, isLoaded: isXpLoaded, refreshFromServer } = useXP();
  const previousOnlineRef = useRef<boolean | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [offlinePacks, setOfflinePacks] = useState<OfflinePackMap>(createEmptyOfflinePackMap);
  const [downloadStates, setDownloadStates] = useState<DownloadStateMap>({
    gulf: DEFAULT_DOWNLOAD_STATE,
    egyptian: DEFAULT_DOWNLOAD_STATE,
    msa: DEFAULT_DOWNLOAD_STATE,
  });

  const refreshConnection = useCallback(async () => {
    const Network = getOptionalNetwork();
    if (!Network?.getNetworkStateAsync) {
      setIsOnline(true);
      setConnectivitySnapshot({ isOnline: true, isHydrated: true });
      setIsChecking(false);
      return;
    }

    const state = await Network.getNetworkStateAsync();
    const online = isReachable(state);
    setIsOnline(online);
    setConnectivitySnapshot({ isOnline: online, isHydrated: true });
    setIsChecking(false);
  }, []);

  const refreshOfflinePacks = useCallback(async () => {
    setOfflinePacks(await getOfflinePackMap());
  }, []);

  useEffect(() => {
    refreshConnection().catch(() => {
      setIsOnline(true);
      setConnectivitySnapshot({ isOnline: true, isHydrated: true });
      setIsChecking(false);
    });
    refreshOfflinePacks().catch(() => {});
    hydrateOfflineProgressQueue().catch(() => {});

    const Network = getOptionalNetwork();
    if (!Network?.addNetworkStateListener) return undefined;

    const subscription = Network.addNetworkStateListener(state => {
      const online = isReachable(state);
      if (__DEV__) console.info('[connectivity] transition', { online });
      setIsOnline(online);
      setConnectivitySnapshot({ isOnline: online, isHydrated: true });
      setIsChecking(false);
    });

    return () => subscription.remove();
  }, [refreshConnection, refreshOfflinePacks]);

  useEffect(() => {
    const previous = previousOnlineRef.current;
    previousOnlineRef.current = isOnline;
    if (isChecking || !isOnline || previous === true) return;
    const reconnect = async () => {
      await supabase.auth.refreshSession().catch(error => {
        if (__DEV__) console.warn('[session] reconnect refresh failed; persisted session retained', { message: error instanceof Error ? error.message : 'unknown' });
      });
      const synced = await syncOfflineProgressQueue();
      if (__DEV__) console.info('[offline-progress] sync result', { synced });
      await refreshFromServer();
    };
    reconnect()
      .catch(error => {
        if (__DEV__) console.warn('[offline-progress] sync failed; events retained', { message: error instanceof Error ? error.message : 'unknown' });
      });
  }, [isChecking, isOnline, refreshFromServer]);

  const downloadPack = useCallback(async (dialect: OfflineDialect) => {
    if (!isPremium) {
      throw new Error('Offline packs are members-only.');
    }
    if (!isOnline) throw new Error('An internet connection is required to download an offline pack.');

    setDownloadStates(current => ({
      ...current,
      [dialect]: {
        status: 'downloading',
        progress: 0,
        completed: 0,
        total: getPackAssetCount(dialect),
      },
    }));

    try {
      const record = await downloadOfflineDialectPack(dialect, isPremium, (progress, completed, total) => {
        setDownloadStates(current => ({
          ...current,
          [dialect]: {
            status: 'downloading',
            progress,
            completed,
            total,
          },
        }));
      });

      setOfflinePacks(current => ({
        ...current,
        [dialect]: record,
      }));
      setDownloadStates(current => ({
        ...current,
        [dialect]: {
          status: 'done',
          progress: 1,
          completed: record.assetCount,
          total: record.assetCount,
        },
      }));
    } catch (error) {
      setDownloadStates(current => ({
        ...current,
        [dialect]: {
          ...current[dialect],
          status: 'error',
          error: error instanceof Error ? error.message : 'Download failed',
        },
      }));
      throw error;
    }
  }, [isOnline, isPremium]);

  const removePack = useCallback(async (dialect: OfflineDialect) => {
    await removeOfflineDialectPack(dialect);
    const cleared: OfflinePackRecord = createEmptyOfflinePackMap()[dialect];
    setOfflinePacks(current => ({ ...current, [dialect]: cleared }));
    setDownloadStates(current => ({
      ...current,
      [dialect]: DEFAULT_DOWNLOAD_STATE,
    }));
  }, []);

  const getPackAssetCount = useCallback((dialect: OfflineDialect) => {
    return getOfflineDialectAssetCount(dialect);
  }, []);

  const getPackManifestInfo = useCallback((dialect: OfflineDialect) => {
    return getOfflineDialectManifestInfo(dialect);
  }, []);

  const isPackUpdateAvailable = useCallback((dialect: OfflineDialect) => {
    return isOfflinePackUpdateAvailable(offlinePacks[dialect], dialect);
  }, [offlinePacks]);

  const activeDialect = (dialect === 'egyptian' || dialect === 'msa' ? dialect : 'gulf') as OfflineDialect;
  const currentDialectOfflineReady = isOfflinePackReady(offlinePacks[activeDialect], activeDialect);
  const shouldBlockOfflineFree = premiumStatus !== 'loading' &&
    !isChecking && isXpLoaded && !isOnline && (!isPremium || !currentDialectOfflineReady);
  const offlineBlockReason = shouldBlockOfflineFree
    ? (isPremium ? 'pack-required' : 'free-plan')
    : null;

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
        isChecking,
        shouldBlockOfflineFree,
        offlineBlockReason,
        currentDialectOfflineReady,
        offlinePacks,
        downloadStates,
        refreshConnection,
        downloadPack,
        removePack,
        getPackAssetCount,
        getPackManifestInfo,
        isPackUpdateAvailable,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
