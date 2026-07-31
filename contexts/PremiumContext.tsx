import { AppState, Platform } from 'react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import { supabase } from '../utils/supabase';
import {
  createConfigureOnce,
  createExclusiveOperation,
  createLatestOperationGuard,
  getDefaultOffering,
  getMonthlyProductId,
  getRevenueCatApiKey,
  getRevenueCatIdentityAction,
  hasPremiumEntitlement,
  isAnonymousRevenueCatUser,
  isSafePublicRevenueCatKey,
  isUserCancelledPurchase,
  selectMonthlyPackage,
  withTimeout,
  type PremiumActionResult,
} from '../utils/premium';

type PurchasesModule = typeof import('react-native-purchases');
type PurchasesClient = PurchasesModule['default'];
export type PremiumAvailabilityStatus =
  | 'initializing'
  | 'ready'
  | 'missing_api_key'
  | 'invalid_api_key'
  | 'native_module_missing'
  | 'missing_default_offering'
  | 'missing_monthly_product'
  | 'store_unavailable'
  | 'unsupported_platform';
type PremiumOperation = 'idle' | 'purchasing' | 'restoring';

const configurePurchasesOnce = createConfigureOnce<PurchasesClient>();

type PremiumContextValue = {
  isPremium: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  availabilityStatus: PremiumAvailabilityStatus;
  offerings: PurchasesOfferings | null;
  premiumPackage: PurchasesPackage | null;
  premiumPrice: string | null;
  managementURL: string | null;
  error: string | null;
  purchasePremium: () => Promise<PremiumActionResult>;
  restorePurchases: () => Promise<PremiumActionResult>;
  refreshCustomerInfo: () => Promise<void>;
  clearPremiumError: () => void;
};

const PremiumContext = createContext<PremiumContextValue>({
  isPremium: false,
  isLoading: true,
  isConfigured: false,
  isPurchasing: false,
  isRestoring: false,
  availabilityStatus: 'initializing',
  offerings: null,
  premiumPackage: null,
  premiumPrice: null,
  managementURL: null,
  error: null,
  purchasePremium: async () => 'error',
  restorePurchases: async () => 'error',
  refreshCustomerInfo: async () => {},
  clearPremiumError: () => {},
});

function isSupportedPurchasesPlatform() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function loadPurchasesModule(): PurchasesModule | null {
  try {
    return require('react-native-purchases') as PurchasesModule;
  } catch (error) {
    if (__DEV__) {
      console.warn('[premium] RevenueCat native module unavailable; premium purchases disabled.');
    }
    return null;
  }
}

function logPremiumError(scope: string, error: unknown) {
  if (__DEV__) {
    console.warn(`[premium] ${scope}: ${errorCode(error) || 'unknown error'}`);
  }
}

function logPremiumDebug(scope: string, values?: string[]) {
  if (!__DEV__) return;
  console.info(`[premium] ${scope}${values?.length ? `: ${values.join(', ')}` : ''}`);
}

function errorCode(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String(error.code);
  }
  return '';
}

function errorMessageText(error: unknown) {
  if (error instanceof Error) return error.message.toLowerCase();
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message).toLowerCase();
  }
  return '';
}

function getFriendlyPurchaseError(error: unknown): string | null {
  if (isUserCancelledPurchase(error)) return null;
  const code = errorCode(error).toLowerCase();
  const message = errorMessageText(error);

  if (code.includes('network') || message.includes('network') || message.includes('offline')) {
    return 'The store is temporarily unavailable. Please check your connection and try again.';
  }
  if (code.includes('paymentpending') || message.includes('pending')) {
    return 'Your payment is pending. Premium will unlock once the store confirms it.';
  }
  if (code.includes('product') || message.includes('product') || message.includes('not available')) {
    return 'Premium is not available in the store right now. Please try again later.';
  }
  if (code.includes('purchase') || message.includes('billing') || message.includes('store')) {
    return 'The store is temporarily unavailable. Please try again later.';
  }

  return 'Purchase failed. Please try again.';
}

function getFriendlyRestoreError(error: unknown): string {
  const code = errorCode(error).toLowerCase();
  const message = errorMessageText(error);

  if (code.includes('network') || message.includes('network') || message.includes('offline')) {
    return 'The store is temporarily unavailable. Please check your connection and try again.';
  }
  if (message.includes('not available') || message.includes('billing') || message.includes('store')) {
    return 'Purchases are unavailable on this device right now.';
  }

  return 'Restore failed. Please try again.';
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const purchasesRef = useRef<PurchasesClient | null>(null);
  const configuredRef = useRef(false);
  const mountedRef = useRef(true);
  const currentRevenueCatUserRef = useRef<string | null>(null);
  const identitySettledRef = useRef(false);
  const identityGuardRef = useRef(createLatestOperationGuard());
  const identityQueueRef = useRef<Promise<void>>(Promise.resolve());
  const customerInfoListenerRef = useRef<CustomerInfoUpdateListener | null>(null);
  const storeOperationRef = useRef(createExclusiveOperation<Exclude<PremiumOperation, 'idle'>>());

  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [operation, setOperation] = useState<PremiumOperation>('idle');
  const [availabilityStatus, setAvailabilityStatus] = useState<PremiumAvailabilityStatus>('initializing');
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [premiumPackage, setPremiumPackage] = useState<PurchasesPackage | null>(null);
  const [managementURL, setManagementURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyCustomerInfo = useCallback((customerInfo: CustomerInfo) => {
    if (!mountedRef.current) return;
    logPremiumDebug('active entitlement identifiers', Object.keys(customerInfo.entitlements.active));
    setIsPremium(hasPremiumEntitlement(customerInfo));
    setManagementURL(customerInfo.managementURL);
  }, []);

  const clearCustomerState = useCallback(() => {
    if (!mountedRef.current) return;
    setIsPremium(false);
    setManagementURL(null);
  }, []);

  const clearStoreState = useCallback(() => {
    if (!mountedRef.current) return;
    setOfferings(null);
    setPremiumPackage(null);
  }, []);

  const refreshOfferings = useCallback(async (client: PurchasesClient) => {
    const nextOfferings = await withTimeout(client.getOfferings());
    if (!mountedRef.current) return;
    const defaultOffering = getDefaultOffering(nextOfferings);
    const selectedPackage = selectMonthlyPackage(nextOfferings, Platform.OS);
    logPremiumDebug('offering identifiers returned', Object.keys(nextOfferings.all));
    logPremiumDebug(
      'package product identifiers returned',
      defaultOffering?.availablePackages.map(item => item.product.identifier) ?? []
    );
    logPremiumDebug('expected product identifier', [getMonthlyProductId(Platform.OS) ?? 'unsupported-platform']);
    setOfferings(nextOfferings);
    setPremiumPackage(selectedPackage);
    if (!defaultOffering) {
      setAvailabilityStatus('missing_default_offering');
    } else if (!selectedPackage) {
      setAvailabilityStatus('missing_monthly_product');
    } else {
      setAvailabilityStatus('ready');
    }
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    const client = purchasesRef.current;
    if (!client || !configuredRef.current || !identitySettledRef.current) return;
    const identityToken = identityGuardRef.current.current();

    try {
      const customerInfo = await withTimeout(client.getCustomerInfo());
      if (!identityGuardRef.current.isCurrent(identityToken) || !identitySettledRef.current) return;
      applyCustomerInfo(customerInfo);
      await refreshOfferings(client);
      if (!mountedRef.current || !identityGuardRef.current.isCurrent(identityToken)) return;
      setError(null);
    } catch (refreshError) {
      if (!mountedRef.current || !identityGuardRef.current.isCurrent(identityToken)) return;
      logPremiumError('refresh failed', refreshError);
      setAvailabilityStatus('store_unavailable');
      setError('The store is temporarily unavailable. Please try again later.');
    }
  }, [applyCustomerInfo, refreshOfferings]);

  const transitionIdentity = useCallback((nextUserId: string | null, client: PurchasesClient) => {
    const token = identityGuardRef.current.begin();
    const identityChanged = currentRevenueCatUserRef.current !== nextUserId;
    identitySettledRef.current = false;
    if (identityChanged) clearCustomerState();
    if (mountedRef.current) setIsLoading(true);

    const runTransition = async () => {
      if (!identityGuardRef.current.isCurrent(token)) return;

      try {
        const action = getRevenueCatIdentityAction(currentRevenueCatUserRef.current, nextUserId);
        let customerInfo: CustomerInfo;
        if (action === 'login' && nextUserId) {
          customerInfo = (await withTimeout(client.logIn(nextUserId))).customerInfo;
          currentRevenueCatUserRef.current = nextUserId;
        } else if (action === 'logout') {
          customerInfo = await withTimeout(client.logOut());
          currentRevenueCatUserRef.current = null;
        } else {
          customerInfo = await withTimeout(client.getCustomerInfo());
        }

        if (!identityGuardRef.current.isCurrent(token) || !mountedRef.current) return;
        identitySettledRef.current = true;
        applyCustomerInfo(customerInfo);
        try {
          await refreshOfferings(client);
          if (!identityGuardRef.current.isCurrent(token) || !mountedRef.current) return;
          setError(null);
        } catch (offeringError) {
          if (!identityGuardRef.current.isCurrent(token) || !mountedRef.current) return;
          logPremiumError('offerings refresh failed', offeringError);
          setAvailabilityStatus('store_unavailable');
          setError('The store is temporarily unavailable. Please try again later.');
        }
      } catch (identityError) {
        if (!identityGuardRef.current.isCurrent(token) || !mountedRef.current) return;
        logPremiumError('identity transition failed', identityError);
        identitySettledRef.current = false;
        if (identityChanged) clearCustomerState();
        setAvailabilityStatus('store_unavailable');
        setError('Premium status could not be refreshed. Please try again.');
      } finally {
        if (identityGuardRef.current.isCurrent(token) && mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    const queued = identityQueueRef.current.then(runTransition, runTransition);
    identityQueueRef.current = queued.catch(() => {});
    return queued;
  }, [applyCustomerInfo, clearCustomerState, refreshOfferings]);

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const initRevenueCat = async () => {
      if (!isSupportedPurchasesPlatform()) {
        setIsLoading(false);
        setIsConfigured(false);
        setAvailabilityStatus('unsupported_platform');
        setError(null);
        return;
      }

      const apiKey = getRevenueCatApiKey(Platform.OS);
      if (!apiKey) {
        setIsLoading(false);
        setIsConfigured(false);
        setAvailabilityStatus('missing_api_key');
        setError(null);
        return;
      }
      if (!isSafePublicRevenueCatKey(apiKey, Platform.OS)) {
        setIsLoading(false);
        setIsConfigured(false);
        setAvailabilityStatus('invalid_api_key');
        setError(null);
        return;
      }

      const purchasesModule = loadPurchasesModule();
      if (!purchasesModule) {
        setIsLoading(false);
        setIsConfigured(false);
        setAvailabilityStatus('native_module_missing');
        setError(null);
        return;
      }

      try {
        const client = await configurePurchasesOnce(apiKey, async () => {
          const nextClient = purchasesModule.default;
          await nextClient.setLogLevel(purchasesModule.LOG_LEVEL.WARN);
          nextClient.configure({ apiKey });
          return nextClient;
        });
        if (!mounted) return;
        logPremiumDebug('RevenueCat configured successfully');
        purchasesRef.current = client;

        const listener: CustomerInfoUpdateListener = customerInfo => {
          if (mounted && identitySettledRef.current) applyCustomerInfo(customerInfo);
        };
        customerInfoListenerRef.current = listener;
        client.addCustomerInfoUpdateListener(listener);

        const currentAppUserId = await withTimeout(client.getAppUserID());
        if (!mounted) return;
        currentRevenueCatUserRef.current = isAnonymousRevenueCatUser(currentAppUserId)
          ? null
          : currentAppUserId;
        configuredRef.current = true;
        setIsConfigured(true);
        const { data: { session } } = await supabase.auth.getSession();
        await transitionIdentity(session?.user.id ?? null, client);
      } catch (initError) {
        if (!mounted) return;
        logPremiumError('initialization failed', initError);
        setIsConfigured(false);
        setAvailabilityStatus('store_unavailable');
        setError('Purchases are unavailable on this device right now.');
        setIsLoading(false);
      }
    };

    initRevenueCat();

    return () => {
      mounted = false;
      mountedRef.current = false;
      identityGuardRef.current.begin();
      const client = purchasesRef.current;
      const listener = customerInfoListenerRef.current;
      if (client && listener) {
        client.removeCustomerInfoUpdateListener(listener);
      }
    };
  }, [applyCustomerInfo, transitionIdentity]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const client = purchasesRef.current;
      if (!client || !configuredRef.current) return;
      if (!session?.user.id) clearStoreState();
      transitionIdentity(session?.user.id ?? null, client).catch(() => {});
    });

    return () => subscription.unsubscribe();
  }, [clearStoreState, transitionIdentity]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refreshCustomerInfo().catch(() => {});
    });
    return () => subscription.remove();
  }, [refreshCustomerInfo]);

  const purchasePremium = useCallback(async () => {
    if (!storeOperationRef.current.tryStart('purchasing')) return 'error';
    const client = purchasesRef.current;
    if (!client || !configuredRef.current || !identitySettledRef.current || !premiumPackage) {
      setError('Premium unavailable, try again later.');
      storeOperationRef.current.finish('purchasing');
      return 'error';
    }
    const identityToken = identityGuardRef.current.current();

    try {
      setOperation('purchasing');
      setError(null);
      const result = await withTimeout(client.purchasePackage(premiumPackage));
      let customerInfo = result.customerInfo;
      try {
        customerInfo = await withTimeout(client.getCustomerInfo());
      } catch (refreshError) {
        logPremiumError('post-purchase customer info refresh failed', refreshError);
      }
      if (!identityGuardRef.current.isCurrent(identityToken)) return 'error';
      if (!mountedRef.current) return hasPremiumEntitlement(customerInfo) ? 'success' : 'no_entitlement';
      applyCustomerInfo(customerInfo);
      if (!hasPremiumEntitlement(customerInfo)) {
        setError('Your purchase was received, but Premium is not active yet. Please retry or contact support.');
        return 'no_entitlement';
      }
      return 'success';
    } catch (purchaseError) {
      logPremiumError('purchase failed', purchaseError);
      if (isUserCancelledPurchase(purchaseError)) return 'cancelled';
      const message = getFriendlyPurchaseError(purchaseError);
      if (message && mountedRef.current) setError(message);
      return 'error';
    } finally {
      storeOperationRef.current.finish('purchasing');
      if (mountedRef.current) setOperation('idle');
    }
  }, [applyCustomerInfo, premiumPackage]);

  const restorePurchases = useCallback(async () => {
    if (!storeOperationRef.current.tryStart('restoring')) return 'error';
    const client = purchasesRef.current;
    if (!client || !configuredRef.current || !identitySettledRef.current) {
      setError('Premium unavailable, try again later.');
      storeOperationRef.current.finish('restoring');
      return 'error';
    }
    const identityToken = identityGuardRef.current.current();

    try {
      setOperation('restoring');
      setError(null);
      const customerInfo = await withTimeout(client.restorePurchases());
      if (!identityGuardRef.current.isCurrent(identityToken)) return 'error';
      applyCustomerInfo(customerInfo);
      const restored = hasPremiumEntitlement(customerInfo);
      if (!restored) {
        if (mountedRef.current) setError('No active subscription found.');
        return 'no_entitlement';
      }
      return 'success';
    } catch (restoreError) {
      logPremiumError('restore failed', restoreError);
      if (mountedRef.current) setError(getFriendlyRestoreError(restoreError));
      return 'error';
    } finally {
      storeOperationRef.current.finish('restoring');
      if (mountedRef.current) setOperation('idle');
    }
  }, [applyCustomerInfo]);

  const clearPremiumError = useCallback(() => {
    if (mountedRef.current) setError(null);
  }, []);

  const value = useMemo<PremiumContextValue>(() => ({
    isPremium,
    isLoading,
    isConfigured,
    isPurchasing: operation === 'purchasing',
    isRestoring: operation === 'restoring',
    availabilityStatus,
    offerings,
    premiumPackage,
    premiumPrice: premiumPackage?.product.priceString ?? null,
    managementURL,
    error,
    purchasePremium,
    restorePurchases,
    refreshCustomerInfo,
    clearPremiumError,
  }), [
    isPremium,
    isLoading,
    isConfigured,
    operation,
    availabilityStatus,
    offerings,
    premiumPackage,
    managementURL,
    error,
    purchasePremium,
    restorePurchases,
    refreshCustomerInfo,
    clearPremiumError,
  ]);

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
