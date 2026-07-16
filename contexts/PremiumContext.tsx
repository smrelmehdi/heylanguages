import { Platform } from 'react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import { supabase } from '../utils/supabase';

const PREMIUM_ENTITLEMENT_ID = 'premium';
const DEFAULT_OFFERING_ID = 'default';
const MONTHLY_PRODUCT_ID = 'heyyusuf_premium_monthly';

type PurchasesModule = typeof import('react-native-purchases');
type PurchasesClient = PurchasesModule['default'];
export type PremiumAvailabilityStatus =
  | 'initializing'
  | 'ready'
  | 'missing_api_key'
  | 'native_module_missing'
  | 'missing_default_offering'
  | 'missing_monthly_product'
  | 'store_unavailable'
  | 'unsupported_platform';
type PremiumOperation = 'idle' | 'purchasing' | 'restoring';

let configuredPurchasesClient: PurchasesClient | null = null;
let configuredApiKey: string | null = null;

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
  purchasePremium: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
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
  purchasePremium: async () => false,
  restorePurchases: async () => false,
  refreshCustomerInfo: async () => {},
});

function getRevenueCatApiKey() {
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: undefined,
  });
}

function isSupportedPurchasesPlatform() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function loadPurchasesModule(): PurchasesModule | null {
  try {
    return require('react-native-purchases') as PurchasesModule;
  } catch (error) {
    if (__DEV__) {
      console.warn('[premium] RevenueCat native module unavailable; premium purchases disabled.', error);
    }
    return null;
  }
}

function hasPremiumEntitlement(customerInfo: CustomerInfo | null) {
  return Boolean(customerInfo?.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
}

function getDefaultOffering(offerings: PurchasesOfferings | null) {
  if (!offerings) return null;
  return offerings.all[DEFAULT_OFFERING_ID] ?? offerings.current ?? null;
}

function selectMonthlyPackage(offerings: PurchasesOfferings | null) {
  const offering = getDefaultOffering(offerings);
  if (!offering) return null;

  return offering.availablePackages.find(item => item.product.identifier === MONTHLY_PRODUCT_ID) ?? null;
}

function logPremiumError(scope: string, error: unknown) {
  if (__DEV__) {
    console.warn(`[premium] ${scope}`, error);
  }
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

function isUserCancelled(error: unknown) {
  return Boolean(typeof error === 'object' && error !== null && 'userCancelled' in error && error.userCancelled);
}

function getFriendlyPurchaseError(error: unknown): string | null {
  if (isUserCancelled(error)) return null;
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
  const currentRevenueCatUserRef = useRef<string | null>(null);
  const customerInfoListenerRef = useRef<CustomerInfoUpdateListener | null>(null);
  const isPurchasingRef = useRef(false);
  const isRestoringRef = useRef(false);

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
    setIsPremium(hasPremiumEntitlement(customerInfo));
    setManagementURL(customerInfo.managementURL);
  }, []);

  const clearCustomerState = useCallback(() => {
    setIsPremium(false);
    setManagementURL(null);
  }, []);

  const clearStoreState = useCallback(() => {
    setOfferings(null);
    setPremiumPackage(null);
  }, []);

  const refreshOfferings = useCallback(async (client: PurchasesClient) => {
    const nextOfferings = await client.getOfferings();
    const defaultOffering = getDefaultOffering(nextOfferings);
    const selectedPackage = selectMonthlyPackage(nextOfferings);
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
    if (!client || !configuredRef.current) return;

    try {
      const customerInfo = await client.getCustomerInfo();
      applyCustomerInfo(customerInfo);
      await refreshOfferings(client);
      setError(null);
    } catch (refreshError) {
      logPremiumError('refresh failed', refreshError);
      setAvailabilityStatus('store_unavailable');
      setError('The store is temporarily unavailable. Please try again later.');
    }
  }, [applyCustomerInfo, refreshOfferings]);

  useEffect(() => {
    let mounted = true;

    const initRevenueCat = async () => {
      if (!isSupportedPurchasesPlatform()) {
        setIsLoading(false);
        setIsConfigured(false);
        setAvailabilityStatus('unsupported_platform');
        setError(null);
        return;
      }

      const apiKey = getRevenueCatApiKey();
      if (!apiKey) {
        setIsLoading(false);
        setIsConfigured(false);
        setAvailabilityStatus('missing_api_key');
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

      let client = configuredPurchasesClient ?? purchasesModule.default;
      purchasesRef.current = client;

      try {
        if (__DEV__) {
          client.setLogLevel(purchasesModule.LOG_LEVEL.DEBUG).catch(() => {});
        }

        if (!configuredPurchasesClient || configuredApiKey !== apiKey) {
          client = purchasesModule.default;
          client.configure({ apiKey });
          configuredPurchasesClient = client;
          configuredApiKey = apiKey;
          purchasesRef.current = client;
        }
        configuredRef.current = true;
        setIsConfigured(true);

        const listener: CustomerInfoUpdateListener = customerInfo => {
          if (mounted) applyCustomerInfo(customerInfo);
        };
        customerInfoListenerRef.current = listener;
        client.addCustomerInfoUpdateListener(listener);

        const { data: { session } } = await supabase.auth.getSession();
        let customerInfo: CustomerInfo;

        if (session?.user.id) {
          const loginResult = await client.logIn(session.user.id);
          currentRevenueCatUserRef.current = session.user.id;
          customerInfo = loginResult.customerInfo;
        } else {
          customerInfo = await client.getCustomerInfo();
          currentRevenueCatUserRef.current = null;
        }

        if (!mounted) return;
        applyCustomerInfo(customerInfo);
        await refreshOfferings(client);
        setError(null);
      } catch (initError) {
        if (!mounted) return;
        logPremiumError('initialization failed', initError);
        setIsConfigured(false);
        setAvailabilityStatus('store_unavailable');
        setError('Purchases are unavailable on this device right now.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initRevenueCat();

    return () => {
      mounted = false;
      const client = purchasesRef.current;
      const listener = customerInfoListenerRef.current;
      if (client && listener) {
        client.removeCustomerInfoUpdateListener(listener);
      }
    };
  }, [applyCustomerInfo, refreshOfferings]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const client = purchasesRef.current;
      if (!client || !configuredRef.current) return;

      try {
        setIsLoading(true);
        let customerInfo: CustomerInfo;

        if (session?.user.id) {
          if (currentRevenueCatUserRef.current === session.user.id) {
            customerInfo = await client.getCustomerInfo();
          } else {
            clearCustomerState();
            const loginResult = await client.logIn(session.user.id);
            currentRevenueCatUserRef.current = session.user.id;
            customerInfo = loginResult.customerInfo;
          }
        } else {
          clearCustomerState();
          clearStoreState();
          customerInfo = await client.logOut();
          currentRevenueCatUserRef.current = null;
        }

        applyCustomerInfo(customerInfo);
        await refreshOfferings(client);
        setError(null);
      } catch (authError) {
        logPremiumError('identity transition failed', authError);
        clearCustomerState();
        setError('Premium status could not be refreshed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [applyCustomerInfo, clearCustomerState, clearStoreState, refreshOfferings]);

  const purchasePremium = useCallback(async () => {
    if (isPurchasingRef.current) return false;
    const client = purchasesRef.current;
    if (!client || !configuredRef.current || !premiumPackage) {
      setError('Premium unavailable, try again later.');
      return false;
    }

    try {
      isPurchasingRef.current = true;
      setOperation('purchasing');
      setError(null);
      const result = await client.purchasePackage(premiumPackage);
      applyCustomerInfo(result.customerInfo);
      return hasPremiumEntitlement(result.customerInfo);
    } catch (purchaseError) {
      logPremiumError('purchase failed', purchaseError);
      const message = getFriendlyPurchaseError(purchaseError);
      if (message) setError(message);
      return false;
    } finally {
      isPurchasingRef.current = false;
      setOperation('idle');
    }
  }, [applyCustomerInfo, premiumPackage]);

  const restorePurchases = useCallback(async () => {
    if (isRestoringRef.current) return false;
    const client = purchasesRef.current;
    if (!client || !configuredRef.current) {
      setError('Premium unavailable, try again later.');
      return false;
    }

    try {
      isRestoringRef.current = true;
      setOperation('restoring');
      setError(null);
      const customerInfo = await client.restorePurchases();
      applyCustomerInfo(customerInfo);
      const restored = hasPremiumEntitlement(customerInfo);
      if (!restored) {
        setError('No active premium subscription was found.');
      }
      return restored;
    } catch (restoreError) {
      logPremiumError('restore failed', restoreError);
      setError(getFriendlyRestoreError(restoreError));
      return false;
    } finally {
      isRestoringRef.current = false;
      setOperation('idle');
    }
  }, [applyCustomerInfo]);

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
