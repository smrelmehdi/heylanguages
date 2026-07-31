import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';

(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = false;

const moduleLoader = Module as typeof Module & { _load: (request: string, parent: unknown, isMain: boolean) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function loadForTest(request, parent, isMain) {
  if (request === 'react-native-purchases') return {};
  return originalLoad.call(this, request, parent, isMain);
};

const premium = require('../utils/premium') as typeof import('../utils/premium');
const connectivity = require('../utils/connectivity-state') as typeof import('../utils/connectivity-state');

function customerInfo(active: boolean) {
  return {
    entitlements: {
      active: active ? { premium: { identifier: 'premium' } } : {},
      all: active ? { premium: { identifier: 'premium' } } : {},
    },
  } as any;
}

async function main() {
  connectivity.setConnectivitySnapshot({ isOnline: false, isHydrated: true });
  assert.deepEqual(connectivity.getConnectivitySnapshot(), { isOnline: false, isHydrated: true });
  assert.equal(premium.hasPremiumEntitlement(customerInfo(true)), true, 'RevenueCat cached CustomerInfo may confirm Premium');
  assert.equal(premium.hasPremiumEntitlement(customerInfo(false)), false, 'cached confirmed Free stays Free');
  assert.equal(premium.hasPremiumEntitlement(null), false, 'missing cache fails closed');

  const layout = readFileSync('app/_layout.tsx', 'utf8');
  const premiumContext = readFileSync('contexts/PremiumContext.tsx', 'utf8');
  const connectivityContext = readFileSync('contexts/ConnectivityContext.tsx', 'utf8');
  const routeGate = readFileSync('components/PremiumRouteGate.tsx', 'utf8');
  const chat = readFileSync('app/chat-conversation.tsx', 'utf8');
  const pronunciation = readFileSync('utils/pronunciation.ts', 'utf8');

  assert.match(layout, /Session hydration timed out/);
  assert.match(layout, /\.finally\(\(\) => setInitialized\(true\)\)/);
  assert.match(layout, /<OfflineSyncStatus \/>/);
  assert.match(premiumContext, /RevenueCat SDK cache \(offline\)/);
  assert.match(connectivityContext, /refreshSession\(\)/);
  assert.match(connectivityContext, /syncOfflineProgressQueue\(\)/);
  assert.match(routeGate, /getLocalCompletionIds/);
  assert.match(chat, /Internet connection required/);
  assert.match(pronunciation, /Pronunciation checking requires an internet connection/);

  console.log('Offline cold-launch tests passed (12 checks).');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
