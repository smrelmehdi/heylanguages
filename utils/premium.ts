import type { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';

export const PREMIUM_ENTITLEMENT_ID = 'premium';
export const DEFAULT_OFFERING_ID = 'default';
export const MONTHLY_PRODUCT_ID = 'heyyusuf_premium_monthly';
export const REVENUECAT_REQUEST_TIMEOUT_MS = 15_000;

export type RevenueCatPlatform = 'ios' | 'android';
export type PremiumActionResult = 'success' | 'cancelled' | 'no_entitlement' | 'error';
export type RevenueCatIdentityAction = 'refresh' | 'login' | 'logout';

type PublicRevenueCatEnvironment = {
  [key: string]: string | undefined;
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?: string;
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?: string;
};

export function getRevenueCatApiKey(
  platform: string,
  environment: PublicRevenueCatEnvironment = process.env
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

export function selectMonthlyPackage(offerings: PurchasesOfferings | null) {
  const offering = getDefaultOffering(offerings);
  if (!offering) return null;
  return offering.availablePackages.find(item => item.product.identifier === MONTHLY_PRODUCT_ID) ?? null;
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
