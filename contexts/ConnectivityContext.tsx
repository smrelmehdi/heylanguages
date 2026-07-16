import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    downloadOfflineDialectPack,
    getOfflineDialectAssetCount,
    getOfflinePackMap,
    removeOfflineDialectPack,
    type OfflineDialect,
    type OfflinePackMap,
    type OfflinePackRecord,
} from '../utils/offline-pack';
import { useDialect } from './DialectContext';
import { useXP } from './XPContext';

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
  offlinePacks: {
    gulf: { downloaded: false, downloadedAt: null, assetCount: 0, version: 1 },
    egyptian: { downloaded: false, downloadedAt: null, assetCount: 0, version: 1 },
    msa: { downloaded: false, downloadedAt: null, assetCount: 0, version: 1 },
  },
  downloadStates: {
    gulf: DEFAULT_DOWNLOAD_STATE,
    egyptian: DEFAULT_DOWNLOAD_STATE,
    msa: DEFAULT_DOWNLOAD_STATE,
  },
  refreshConnection: async () => {},
  downloadPack: async () => {},
  removePack: async () => {},
  getPackAssetCount: () => 0,
});

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const { dialect } = useDialect();
  const { isPremium, isLoaded: isXpLoaded } = useXP();
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [offlinePacks, setOfflinePacks] = useState<OfflinePackMap>({
    gulf: { downloaded: false, downloadedAt: null, assetCount: 0, version: 1 },
    egyptian: { downloaded: false, downloadedAt: null, assetCount: 0, version: 1 },
    msa: { downloaded: false, downloadedAt: null, assetCount: 0, version: 1 },
  });
  const [downloadStates, setDownloadStates] = useState<DownloadStateMap>({
    gulf: DEFAULT_DOWNLOAD_STATE,
    egyptian: DEFAULT_DOWNLOAD_STATE,
    msa: DEFAULT_DOWNLOAD_STATE,
  });

  const refreshConnection = useCallback(async () => {
    const Network = getOptionalNetwork();
    if (!Network?.getNetworkStateAsync) {
      setIsOnline(true);
      setIsChecking(false);
      return;
    }

    const state = await Network.getNetworkStateAsync();
    setIsOnline(isReachable(state));
    setIsChecking(false);
  }, []);

  const refreshOfflinePacks = useCallback(async () => {
    setOfflinePacks(await getOfflinePackMap());
  }, []);

  useEffect(() => {
    refreshConnection().catch(() => {
      setIsOnline(true);
      setIsChecking(false);
    });
    refreshOfflinePacks().catch(() => {});

    const Network = getOptionalNetwork();
    if (!Network?.addNetworkStateListener) return undefined;

    const subscription = Network.addNetworkStateListener(state => {
      setIsOnline(isReachable(state));
      setIsChecking(false);
    });

    return () => subscription.remove();
  }, [refreshConnection, refreshOfflinePacks]);

  const downloadPack = useCallback(async (dialect: OfflineDialect) => {
    if (!isPremium) {
      throw new Error('Offline packs are members-only.');
    }

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
      const record = await downloadOfflineDialectPack(dialect, (progress, completed, total) => {
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
  }, [isPremium]);

  const removePack = useCallback(async (dialect: OfflineDialect) => {
    await removeOfflineDialectPack(dialect);
    const cleared: OfflinePackRecord = {
      downloaded: false,
      downloadedAt: null,
      assetCount: 0,
      version: 1,
    };
    setOfflinePacks(current => ({ ...current, [dialect]: cleared }));
    setDownloadStates(current => ({
      ...current,
      [dialect]: DEFAULT_DOWNLOAD_STATE,
    }));
  }, []);

  const getPackAssetCount = useCallback((dialect: OfflineDialect) => {
    return getOfflineDialectAssetCount(dialect);
  }, []);

  const activeDialect = (dialect === 'egyptian' || dialect === 'msa' ? dialect : 'gulf') as OfflineDialect;
  const currentDialectOfflineReady = Boolean(offlinePacks[activeDialect]?.downloaded);
  const shouldBlockOfflineFree = !isChecking && isXpLoaded && !isOnline && (!isPremium || !currentDialectOfflineReady);
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
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
