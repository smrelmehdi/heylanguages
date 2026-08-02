import { requireOptionalNativeModule } from 'expo-modules-core';

export type OptionalNetworkState = {
  isConnected?: boolean | null;
  isInternetReachable?: boolean | null;
  type?: unknown;
};

export type OptionalNetworkSubscription = { remove: () => void };

export type OptionalNetworkModule = {
  getNetworkStateAsync?: () => Promise<OptionalNetworkState>;
  addNetworkStateListener?: (listener: (state: OptionalNetworkState) => void) => OptionalNetworkSubscription;
};

type NativeExpoNetworkModule = {
  getNetworkStateAsync?: () => Promise<OptionalNetworkState>;
  addListener?: (
    eventName: 'onNetworkStateChanged',
    listener: (state: OptionalNetworkState) => void,
  ) => OptionalNetworkSubscription;
};

let didWarnMissingExpoNetwork = false;

function warnMissingExpoNetwork() {
  if (!__DEV__ || didWarnMissingExpoNetwork) return;
  didWarnMissingExpoNetwork = true;
  console.warn('expo-network unavailable, using online fallback.');
}

export function adaptOptionalNetworkModule(
  nativeModule: NativeExpoNetworkModule | null,
): OptionalNetworkModule | null {
  if (!nativeModule) return null;
  if (!nativeModule.getNetworkStateAsync && !nativeModule.addListener) return null;

  return {
    getNetworkStateAsync: nativeModule.getNetworkStateAsync
      ? () => nativeModule.getNetworkStateAsync!()
      : undefined,
    addNetworkStateListener: nativeModule.addListener
      ? listener => nativeModule.addListener!('onNetworkStateChanged', listener)
      : undefined,
  };
}

export function getOptionalNetwork(): OptionalNetworkModule | null {
  try {
    const network = adaptOptionalNetworkModule(
      requireOptionalNativeModule<NativeExpoNetworkModule>('ExpoNetwork'),
    );
    if (!network) warnMissingExpoNetwork();
    return network;
  } catch {
    warnMissingExpoNetwork();
    return null;
  }
}
