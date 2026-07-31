import type { CustomerInfo, PurchasesOfferings } from 'react-native-purchases';

export const PREMIUM_ENTITLEMENT_ID = 'premium';
export const DEFAULT_OFFERING_ID = 'default';
export const IOS_MONTHLY_PRODUCT_ID = 'heyyusuf_premium_monthly';
export const ANDROID_MONTHLY_PRODUCT_ID = 'heyyusuf_premium_monthly:monthly';
export const PRODUCT_ALREADY_PURCHASED_ERROR_CODE = '6';
export const REVENUECAT_REQUEST_TIMEOUT_MS = 15_000;

export type RevenueCatPlatform = 'ios' | 'android';
export type PremiumActionResult = 'success' | 'cancelled' | 'no_entitlement' | 'error';
export type RevenueCatIdentityAction = 'refresh' | 'login' | 'logout';
export type PremiumPaywallSource =
  | 'profile_membership'
  | 'offline_audio'
  | 'locked_lesson'
  | 'locked_scenario'
  | 'premium_practice'
  | 'home_upgrade'
  | 'route_gate';

type PublicRevenueCatEnvironment = {
  [key: string]: string | undefined;
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?: string;
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?: string;
};

const runtimeRevenueCatEnvironment: PublicRevenueCatEnvironment = {
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
};

export function getRevenueCatApiKey(
  platform: string,
  environment: PublicRevenueCatEnvironment = runtimeRevenueCatEnvironment
) {
  if (platform === 'ios') return environment.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() || null;
  if (platform === 'android') return environment.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim() || null;
  return null;
}

export function isSafePublicRevenueCatKey(key: string | null, platform?: string) {
  if (!key) return false;
  if (/^(sk_|secret_)/i.test(key)) return false;
  if (platform === 'ios') return /^appl_[A-Za-z0-9]+$/.test(key);
  if (platform === 'android') return /^goog_[A-Za-z0-9]+$/.test(key);
  return /^(appl|goog)_[A-Za-z0-9]+$/.test(key);
}

export function hasPremiumEntitlement(customerInfo: CustomerInfo | null) {
  return Boolean(customerInfo?.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
}

export function getDefaultOffering(offerings: PurchasesOfferings | null) {
  return offerings?.all[DEFAULT_OFFERING_ID] ?? null;
}

export function getMonthlyProductId(platform: string) {
  if (platform === 'ios') return IOS_MONTHLY_PRODUCT_ID;
  if (platform === 'android') return ANDROID_MONTHLY_PRODUCT_ID;
  return null;
}

export function selectMonthlyPackage(offerings: PurchasesOfferings | null, platform: string) {
  const offering = getDefaultOffering(offerings);
  const productId = getMonthlyProductId(platform);
  if (!offering || !productId) return null;
  return offering.availablePackages.find(item => item.product.identifier === productId) ?? null;
}

export function getPaywallSourceForContentType(contentType: string): PremiumPaywallSource {
  if (contentType === 'lesson') return 'locked_lesson';
  if (contentType === 'scenario') return 'locked_scenario';
  return 'premium_practice';
}

export function getRevenueCatIdentityAction(
  currentUserId: string | null,
  nextUserId: string | null
): RevenueCatIdentityAction {
  if (currentUserId === nextUserId) return 'refresh';
  return nextUserId ? 'login' : 'logout';
}

export function isAnonymousRevenueCatUser(userId: string) {
  return userId.startsWith('$RCAnonymousID:');
}

export function isUserCancelledPurchase(error: unknown) {
  return Boolean(typeof error === 'object' && error !== null && 'userCancelled' in error && error.userCancelled);
}

export function isAlreadyPurchasedError(error: unknown) {
  if (typeof error !== 'object' || error === null) return false;
  const code = 'code' in error ? String(error.code) : '';
  const readableCode =
    'userInfo' in error && typeof error.userInfo === 'object' && error.userInfo !== null &&
    'readableErrorCode' in error.userInfo
      ? String(error.userInfo.readableErrorCode)
      : 'readableErrorCode' in error
        ? String(error.readableErrorCode)
        : '';
  return code === PRODUCT_ALREADY_PURCHASED_ERROR_CODE ||
    readableCode === 'PRODUCT_ALREADY_PURCHASED_ERROR';
}

export function shouldInvalidateRevenueCatIdentity(
  currentUserId: string | null,
  nextUserId: string | null,
  isIdentitySettled: boolean
) {
  return !isIdentitySettled || currentUserId !== nextUserId;
}

export function shouldShowPremiumSuccess(wasPremium: boolean, result: PremiumActionResult) {
  return !wasPremium && result === 'success';
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = REVENUECAT_REQUEST_TIMEOUT_MS,
  message = 'RevenueCat request timed out'
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}

export function createConfigureOnce<T>() {
  let configuredKey: string | null = null;
  let pending: Promise<T> | null = null;

  return async (apiKey: string, configure: () => T | Promise<T>) => {
    if (configuredKey && configuredKey !== apiKey) {
      throw new Error('RevenueCat was already configured with a different API key.');
    }
    if (pending) return pending;

    pending = Promise.resolve()
      .then(configure)
      .then(result => {
        configuredKey = apiKey;
        return result;
      })
      .catch(error => {
        pending = null;
        throw error;
      });
    return pending;
  };
}

export function createLatestOperationGuard() {
  let generation = 0;
  return {
    begin() {
      generation += 1;
      return generation;
    },
    isCurrent(token: number) {
      return token === generation;
    },
    current() {
      return generation;
    },
  };
}

export function createExclusiveOperation<T extends string>() {
  let active: T | null = null;
  return {
    tryStart(operation: T) {
      if (active) return false;
      active = operation;
      return true;
    },
    finish(operation: T) {
      if (active === operation) active = null;
    },
    getActive() {
      return active;
    },
  };
}
