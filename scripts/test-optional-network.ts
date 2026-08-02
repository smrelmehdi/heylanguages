import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';

(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = true;

type NativeNetwork = {
  getNetworkStateAsync?: () => Promise<{ isConnected?: boolean; isInternetReachable?: boolean }>;
  addListener?: (eventName: string, listener: (state: unknown) => void) => { remove: () => void };
};

let nativeNetwork: NativeNetwork | null = null;
let throwWhileResolving = false;
const moduleLoader = Module as typeof Module & {
  _load: (request: string, parent: unknown, isMain: boolean) => unknown;
};
const originalLoad = moduleLoader._load;
moduleLoader._load = function loadForOptionalNetworkTest(request, parent, isMain) {
  if (request === 'expo-modules-core') {
    return {
      requireOptionalNativeModule: () => {
        if (throwWhileResolving) throw new Error('simulated native registry failure');
        return nativeNetwork;
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const { getOptionalNetwork } = require('../utils/optional-network') as typeof import('../utils/optional-network');

async function main() {
  assert.equal(getOptionalNetwork(), null, 'missing native module must use the fallback');

  let subscribedEvent = '';
  let listenerRemoved = false;
  nativeNetwork = {
    getNetworkStateAsync: async () => ({ isConnected: true, isInternetReachable: true }),
    addListener: (eventName) => {
      subscribedEvent = eventName;
      return { remove: () => { listenerRemoved = true; } };
    },
  };

  const available = getOptionalNetwork();
  assert.ok(available);
  assert.deepEqual(await available.getNetworkStateAsync?.(), {
    isConnected: true,
    isInternetReachable: true,
  });
  const subscription = available.addNetworkStateListener?.(() => {});
  assert.equal(subscribedEvent, 'onNetworkStateChanged');
  subscription?.remove();
  assert.equal(listenerRemoved, true);

  nativeNetwork = {};
  assert.equal(getOptionalNetwork(), null, 'incomplete native API must use the fallback');
  throwWhileResolving = true;
  assert.equal(getOptionalNetwork(), null, 'native registry errors must use the fallback');

  const contextSource = readFileSync('contexts/ConnectivityContext.tsx', 'utf8');
  const ttsSource = readFileSync('utils/tts.ts', 'utf8');
  const adapterSource = readFileSync('utils/optional-network.ts', 'utf8');
  assert.doesNotMatch(contextSource, /require\(['"]expo-network['"]\)/);
  assert.doesNotMatch(ttsSource, /require\(['"]expo-network['"]\)/);
  assert.doesNotMatch(adapterSource, /require\(['"]expo-network['"]\)/);
  assert.match(adapterSource, /requireOptionalNativeModule<NativeExpoNetworkModule>\(['"]ExpoNetwork['"]\)/);

  console.log('Optional network fallback tests passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
