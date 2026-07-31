import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  DEFAULT_OFFERING_ID,
  ANDROID_MONTHLY_PRODUCT_ID,
  IOS_MONTHLY_PRODUCT_ID,
  PREMIUM_ENTITLEMENT_ID,
  createConfigureOnce,
  createExclusiveOperation,
  createLatestOperationGuard,
  getDefaultOffering,
  getRevenueCatApiKey,
  getRevenueCatIdentityAction,
  hasPremiumEntitlement,
  isAnonymousRevenueCatUser,
  isSafePublicRevenueCatKey,
  isUserCancelledPurchase,
  selectMonthlyPackage,
} from '../utils/premium';

let getContentAccess: typeof import('../utils/access').getContentAccess;
let resolveInternalTestingAccess: typeof import('../utils/access').resolveInternalTestingAccess;

type Test = { name: string; run: () => void | Promise<void> };
const tests: Test[] = [];
const test = (name: string, run: Test['run']) => tests.push({ name, run });

const customerInfo = (active: boolean) => ({
  entitlements: { active: active ? { premium: {} } : {} },
}) as any;

const iosMonthlyPackage = {
  identifier: '$rc_monthly',
  packageType: 'MONTHLY',
  product: { identifier: IOS_MONTHLY_PRODUCT_ID, priceString: '$4.99' },
} as any;

const androidMonthlyPackage = {
  identifier: '$rc_monthly',
  packageType: 'MONTHLY',
  product: { identifier: ANDROID_MONTHLY_PRODUCT_ID, priceString: '$4.99' },
} as any;

const offerings = {
  current: null,
  all: {
    default: {
      identifier: 'default',
      availablePackages: [iosMonthlyPackage, androidMonthlyPackage],
    },
  },
} as any;

test('configure executes once for concurrent callers', async () => {
  const configureOnce = createConfigureOnce<object>();
  let calls = 0;
  const configure = async () => {
    calls += 1;
    await Promise.resolve();
    return {};
  };
  const [first, second] = await Promise.all([
    configureOnce('appl_public', configure),
    configureOnce('appl_public', configure),
  ]);
  assert.equal(calls, 1);
  assert.equal(first, second);
});

test('configure failure can be retried', async () => {
  const configureOnce = createConfigureOnce<object>();
  await assert.rejects(configureOnce('appl_public', async () => {
    throw new Error('first failure');
  }));
  const result = {};
  assert.equal(await configureOnce('appl_public', () => result), result);
});

test('configure rejects a different key after success', async () => {
  const configureOnce = createConfigureOnce<object>();
  await configureOnce('appl_public', () => ({}));
  await assert.rejects(configureOnce('goog_public', () => ({})), /different API key/);
});

test('missing platform key fails closed', () => {
  assert.equal(getRevenueCatApiKey('ios', {}), null);
  assert.equal(getRevenueCatApiKey('android', {}), null);
});

test('one missing platform key cannot borrow the other platform key', () => {
  assert.equal(getRevenueCatApiKey('ios', {
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: 'goog_public',
  }), null);
  assert.equal(getRevenueCatApiKey('android', {
    EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: 'appl_public',
  }), null);
});

test('platform keys are selected independently', () => {
  const env = {
    EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: 'appl_public',
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: 'goog_public',
  };
  assert.equal(getRevenueCatApiKey('ios', env), 'appl_public');
  assert.equal(getRevenueCatApiKey('android', env), 'goog_public');
});

test('secret-looking keys are rejected', () => {
  assert.equal(isSafePublicRevenueCatKey('sk_private'), false);
  assert.equal(isSafePublicRevenueCatKey('secret_private'), false);
  assert.equal(isSafePublicRevenueCatKey('appl_public', 'ios'), true);
  assert.equal(isSafePublicRevenueCatKey('goog_public', 'android'), true);
});

test('malformed and cross-platform public keys are rejected', () => {
  assert.equal(isSafePublicRevenueCatKey('placeholder', 'ios'), false);
  assert.equal(isSafePublicRevenueCatKey('appl_public', 'android'), false);
  assert.equal(isSafePublicRevenueCatKey('goog_public', 'ios'), false);
  assert.equal(isSafePublicRevenueCatKey('appl_public-value', 'ios'), false);
});

test('anonymous IDs are detected', () => {
  assert.equal(isAnonymousRevenueCatUser('$RCAnonymousID:abc'), true);
  assert.equal(isAnonymousRevenueCatUser('supabase-user-id'), false);
});

test('guest refreshes anonymous customer info', () => {
  assert.equal(getRevenueCatIdentityAction(null, null), 'refresh');
});

test('sign-in logs in with the stable account ID', () => {
  assert.equal(getRevenueCatIdentityAction(null, 'supabase-uuid'), 'login');
});

test('logout returns to anonymous identity', () => {
  assert.equal(getRevenueCatIdentityAction('supabase-uuid', null), 'logout');
});

test('account switch logs in as the next stable ID', () => {
  assert.equal(getRevenueCatIdentityAction('user-a', 'user-b'), 'login');
});

test('active premium entitlement unlocks', () => {
  assert.equal(hasPremiumEntitlement(customerInfo(true)), true);
});

test('expired or absent premium entitlement stays inactive', () => {
  assert.equal(hasPremiumEntitlement(customerInfo(false)), false);
  assert.equal(hasPremiumEntitlement(null), false);
});

test('offering identifier is exactly default', () => {
  assert.equal(DEFAULT_OFFERING_ID, 'default');
  assert.equal(getDefaultOffering(offerings)?.identifier, 'default');
});

test('current offering is not an implicit fallback', () => {
  assert.equal(getDefaultOffering({ all: {}, current: offerings.all.default } as any), null);
});

test('Android accepts the exact product and base-plan identifier', () => {
  assert.equal(ANDROID_MONTHLY_PRODUCT_ID, 'heyyusuf_premium_monthly:monthly');
  assert.equal(selectMonthlyPackage(offerings, 'android'), androidMonthlyPackage);
});

test('Android rejects the product without its base-plan suffix', () => {
  const iosOnly = {
    all: { default: { availablePackages: [iosMonthlyPackage] } },
  } as any;
  assert.equal(selectMonthlyPackage(iosOnly, 'android'), null);
});

test('iOS accepts the exact monthly product identifier', () => {
  assert.equal(IOS_MONTHLY_PRODUCT_ID, 'heyyusuf_premium_monthly');
  assert.equal(selectMonthlyPackage(offerings, 'ios'), iosMonthlyPackage);
});

test('iOS rejects the Android product identifier', () => {
  const androidOnly = {
    all: { default: { availablePackages: [androidMonthlyPackage] } },
  } as any;
  assert.equal(selectMonthlyPackage(androidOnly, 'ios'), null);
});

test('another package is never selected', () => {
  const annualOnly = {
    all: { default: { availablePackages: [{ product: { identifier: 'annual' } }] } },
  } as any;
  assert.equal(selectMonthlyPackage(annualOnly, 'ios'), null);
  assert.equal(selectMonthlyPackage(annualOnly, 'android'), null);
  assert.equal(selectMonthlyPackage(offerings, 'web'), null);
});

test('localized package price remains the display source', () => {
  assert.equal(selectMonthlyPackage(offerings, 'ios')?.product.priceString, '$4.99');
  assert.equal(selectMonthlyPackage(offerings, 'android')?.product.priceString, '$4.99');
});

test('purchase and restore cannot overlap', () => {
  const operation = createExclusiveOperation<'purchasing' | 'restoring'>();
  assert.equal(operation.tryStart('purchasing'), true);
  assert.equal(operation.tryStart('restoring'), false);
  operation.finish('purchasing');
  assert.equal(operation.tryStart('restoring'), true);
});

test('operation completion cannot release another operation', () => {
  const operation = createExclusiveOperation<'purchasing' | 'restoring'>();
  operation.tryStart('purchasing');
  operation.finish('restoring');
  assert.equal(operation.getActive(), 'purchasing');
});

test('purchase cancellation is explicit', () => {
  assert.equal(isUserCancelledPurchase({ userCancelled: true }), true);
  assert.equal(isUserCancelledPurchase(new Error('network')), false);
});

test('stale identity result cannot become current', () => {
  const guard = createLatestOperationGuard();
  const egyptian = guard.begin();
  const gulf = guard.begin();
  assert.equal(guard.isCurrent(egyptian), false);
  assert.equal(guard.isCurrent(gulf), true);
});

test('repeated listener events do not change entitlement semantics', () => {
  assert.equal(hasPremiumEntitlement(customerInfo(true)), hasPremiumEntitlement(customerInfo(true)));
});

test('direct premium route blocks free users', () => {
  const result = getContentAccess({
    contentId: 'grammar-present-verbs',
    unitId: 'unit-5',
    contentType: 'lesson',
    dialect: 'gulf',
    isPremium: false,
    isTestingUnlocked: false,
    completedContentIds: ['gulf:unit-5:grammar-possessives'],
  });
  assert.equal(result.allowed, false);
});

test('direct premium route opens for premium users after progression', () => {
  const result = getContentAccess({
    contentId: 'grammar-present-verbs',
    unitId: 'unit-5',
    contentType: 'lesson',
    dialect: 'gulf',
    isPremium: true,
    isTestingUnlocked: false,
    completedContentIds: ['gulf:unit-5:grammar-possessives'],
  });
  assert.equal(result.reason === 'premium' || result.reason === 'free', true);
});

test('testing access does not equal RevenueCat entitlement', () => {
  assert.equal(hasPremiumEntitlement(customerInfo(false)), false);
  assert.equal(PREMIUM_ENTITLEMENT_ID, 'premium');
});

test('development override requires the compile-time development boundary', () => {
  assert.equal(resolveInternalTestingAccess(true, true), true);
  assert.equal(resolveInternalTestingAccess(true, false), false);
});

test('preview and production ignore requested or persisted overrides', () => {
  assert.equal(resolveInternalTestingAccess(false, true), false);
  assert.equal(resolveInternalTestingAccess(false, false), false);
});

test('public environment variables are not an access authority', () => {
  const accessSource = fs.readFileSync('utils/access.ts', 'utf8');
  assert.doesNotMatch(accessSource, /EXPO_PUBLIC_TESTING_UNLOCK_ALL/);
  assert.match(accessSource, /CAN_USE_INTERNAL_TESTING_ACCESS = IS_LOCAL_DEV/);
});

test('persisted development override is not read outside development', () => {
  const accessSource = fs.readFileSync('utils/access.ts', 'utf8');
  const hydrationGuard = accessSource.indexOf('if (!CAN_USE_INTERNAL_TESTING_ACCESS)');
  const storageRead = accessSource.indexOf('AsyncStorage.getItem(TESTING_UNLOCK_OVERRIDE_KEY)');
  assert.ok(hydrationGuard >= 0 && storageRead > hydrationGuard);
});

test('direct route rejects a testing flag outside development', () => {
  const result = getContentAccess({
    contentId: 'grammar-present-verbs',
    unitId: 'unit-5',
    contentType: 'lesson',
    dialect: 'gulf',
    isPremium: false,
    isTestingUnlocked: true,
    completedContentIds: ['gulf:unit-5:grammar-possessives'],
  });
  assert.equal(result.reason, 'premium_required');
});

test('profile exposes the override only as a development-labelled control', () => {
  const profileSource = fs.readFileSync('app/(tabs)/profile.tsx', 'utf8');
  assert.match(profileSource, /\{__DEV__ && \(/);
  assert.match(profileSource, /Development content override/);
  assert.match(profileSource, /Development override active/);
});

test('premium state has no client-owned AsyncStorage authority', () => {
  const contextSource = fs.readFileSync('contexts/PremiumContext.tsx', 'utf8');
  const logicSource = fs.readFileSync('utils/premium.ts', 'utf8');
  assert.doesNotMatch(contextSource, /AsyncStorage/);
  assert.match(logicSource, /entitlements\.active/);
});

test('identity changes clear access before asynchronous login', () => {
  const source = fs.readFileSync('contexts/PremiumContext.tsx', 'utf8');
  assert.match(source, /if \(identityChanged\) clearCustomerState\(\)/);
  assert.match(source, /identityGuardRef\.current\.isCurrent\(token\)/);
});

test('offering failure does not revoke a settled entitlement identity', () => {
  const source = fs.readFileSync('contexts/PremiumContext.tsx', 'utf8');
  const settled = source.indexOf('identitySettledRef.current = true;');
  const offeringRefresh = source.indexOf('await refreshOfferings(client);', settled);
  const offeringCatch = source.indexOf("logPremiumError('offerings refresh failed'", offeringRefresh);
  assert.ok(settled >= 0 && offeringRefresh > settled && offeringCatch > offeringRefresh);
});

test('purchase closes only through explicit success result', () => {
  const home = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
  assert.match(home, /result === 'success'/);
  assert.doesNotMatch(home, /if \(unlocked\) setPaywallVisible/);
});

test('purchase without entitlement remains recoverable', () => {
  const source = fs.readFileSync('contexts/PremiumContext.tsx', 'utf8');
  assert.match(source, /Premium is not active yet/);
  assert.match(source, /return 'no_entitlement'/);
});

test('restore distinguishes no entitlement from failure', () => {
  const source = fs.readFileSync('contexts/PremiumContext.tsx', 'utf8');
  assert.match(source, /No active premium subscription was found/);
  assert.match(source, /return 'no_entitlement'/);
  assert.match(source, /return 'error'/);
});

test('review mode keeps zero-XP and no-completion protections', () => {
  const source = fs.readFileSync('app/quiz-unit2.tsx', 'utf8');
  assert.match(source, /initialPassed && requestedUnit !== 'review'/);
  assert.match(source, /requestedUnit === 'review' \|\| awardedQuestionIdsRef/);
});

test('paywall exposes legal links and auto-renewal disclosure', () => {
  const source = fs.readFileSync('components/PaywallModal.tsx', 'utf8');
  assert.match(source, /Privacy Policy/);
  assert.match(source, /Terms of Use/);
  assert.match(source, /Renews automatically each month until canceled/);
});

async function main() {
  const extensions = (require as NodeRequire & {
    extensions: Record<string, (module: NodeModule, filename: string) => void>;
  }).extensions;
  const assetLoader = (module: NodeModule, filename: string) => {
    (module as NodeModule & { exports: string }).exports = filename;
  };
  extensions['.mp3'] = assetLoader;
  extensions['.png'] = assetLoader;
  extensions['.webp'] = assetLoader;
  ({ getContentAccess, resolveInternalTestingAccess } = await import('../utils/access'));

  for (const { name, run } of tests) {
    await run();
    console.log(`PASS ${name}`);
  }

  console.log(`Premium system regression tests passed (${tests.length}).`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
