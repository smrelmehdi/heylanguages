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
  createCustomerInfoOperationGuard,
  createExclusiveOperation,
  createLatestOperationGuard,
  getDefaultOffering,
  getMonthlyProductId,
  getRevenueCatApiKey,
  getRevenueCatIdentityAction,
  hasPremiumEntitlement,
  isAlreadyPurchasedError,
  isAnonymousRevenueCatUser,
  isSafePublicRevenueCatKey,
  isUserCancelledPurchase,
  selectMonthlyPackage,
  shouldInvalidateRevenueCatIdentity,
  withTimeout,
  type CustomerInfoOperation,
  type PremiumActionResult,
  type PremiumStatus,
} from '../utils/premium';
import {
  createPremiumDiagnosticRequestId,
  recordNoLocalPremiumCache,
  recordPremiumDiagnostic,
  type PremiumEntitlementSource,
} from '../utils/premium-diagnostics';

type PurchasesModule = typeof import('react-native-purchases');
type PurchasesClient = PurchasesModule['default'];
type GuardedCustomerInfoOperation = CustomerInfoOperation & { requestId: string };
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
  premiumStatus: PremiumStatus;
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
  refreshCustomerInfo: (source?: PremiumEntitlementSource) => Promise<void>;
  clearPremiumCustomerInfoCache: () => Promise<boolean>;
  clearPremiumError: () => void;
};

const PremiumContext = createContext<PremiumContextValue>({
  premiumStatus: 'loading',
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
  clearPremiumCustomerInfoCache: async () => false,
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
  const customerInfoOperationGuardRef = useRef(createCustomerInfoOperationGuard());
  const currentCustomerOriginalAppUserIdRef = useRef<string | null>(null);
  const premiumStatusRef = useRef<PremiumStatus>('loading');
  const rawRevenueCatUserIdRef = useRef<string | null>(null);
  const authenticatedUserPresentRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>('loading');
  const [isConfigured, setIsConfigured] = useState(false);
  const [operation, setOperation] = useState<PremiumOperation>('idle');
  const [availabilityStatus, setAvailabilityStatus] = useState<PremiumAvailabilityStatus>('initializing');
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [premiumPackage, setPremiumPackage] = useState<PurchasesPackage | null>(null);
  const [managementURL, setManagementURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isPremium = premiumStatus === 'premium';
  const isLoading = premiumStatus === 'loading';

  const beginCustomerInfoOperation = useCallback((
    source: PremiumEntitlementSource,
    requestId = createPremiumDiagnosticRequestId('customer-info'),
    options?: {
      identityGeneration?: number;
      revenueCatAppUserId?: string | null;
      requiresOriginalAppUserIdMatch?: boolean;
    }
  ): GuardedCustomerInfoOperation => ({
    ...customerInfoOperationGuardRef.current.begin({
      identityGeneration: options?.identityGeneration ?? identityGuardRef.current.current(),
      revenueCatAppUserId:
        options && 'revenueCatAppUserId' in options
          ? options.revenueCatAppUserId ?? null
          : rawRevenueCatUserIdRef.current,
      source,
      requiresOriginalAppUserIdMatch: options?.requiresOriginalAppUserIdMatch ?? false,
    }),
    requestId,
  }), []);

  const applyCustomerInfo = useCallback((
    customerInfo: CustomerInfo,
    operation: GuardedCustomerInfoOperation
  ) => {
    if (!mountedRef.current) return { accepted: false, status: premiumStatusRef.current };
    const previousStatus = premiumStatusRef.current;
    const nextIsPremium = hasPremiumEntitlement(customerInfo);
    const nextStatus: PremiumStatus = nextIsPremium ? 'premium' : 'free';
    const decision = customerInfoOperationGuardRef.current.evaluate(operation, {
      identityGeneration: identityGuardRef.current.current(),
      revenueCatAppUserId: rawRevenueCatUserIdRef.current,
      originalAppUserId: currentCustomerOriginalAppUserIdRef.current,
      incomingOriginalAppUserId: customerInfo.originalAppUserId,
    });
    if (!decision.accepted) {
      recordPremiumDiagnostic({
        operation: 'customer_info.rejected',
        requestId: operation.requestId,
        source: operation.source as PremiumEntitlementSource,
        customerInfo,
        previousPremiumStatus: previousStatus,
        nextPremiumStatus: nextStatus,
        accepted: false,
        rejectionReason: decision.rejectionReason,
        revenueCatAppUserId: operation.revenueCatAppUserId,
        authenticatedUserPresent: authenticatedUserPresentRef.current,
        identityGeneration: operation.identityGeneration,
        customerInfoOperationId: operation.operationId,
        appState: appStateRef.current,
        updatesPremiumState: false,
      });
      return { accepted: false, status: previousStatus };
    }
    recordPremiumDiagnostic({
      operation: 'customer_info.applied',
      requestId: operation.requestId,
      source: operation.source as PremiumEntitlementSource,
      customerInfo,
      previousPremiumStatus: previousStatus,
      nextPremiumStatus: nextStatus,
      accepted: true,
      revenueCatAppUserId: rawRevenueCatUserIdRef.current,
      authenticatedUserPresent: authenticatedUserPresentRef.current,
      identityGeneration: identityGuardRef.current.current(),
      customerInfoOperationId: operation.operationId,
      appState: appStateRef.current,
    });
    if (previousStatus !== nextStatus) {
      recordPremiumDiagnostic({
        operation: 'premium.state_changed',
        requestId: operation.requestId,
        source: operation.source as PremiumEntitlementSource,
        customerInfo,
        previousPremiumStatus: previousStatus,
        nextPremiumStatus: nextStatus,
        accepted: true,
        customerInfoOperationId: operation.operationId,
      });
    }
    const expirationDate = customerInfo.entitlements.all.premium?.expirationDate;
    if (previousStatus === 'premium' && nextStatus === 'free' && expirationDate && Date.parse(expirationDate) <= Date.now()) {
      recordPremiumDiagnostic({
        operation: 'premium.expiration_detected',
        requestId: operation.requestId,
        source: operation.source as PremiumEntitlementSource,
        customerInfo,
        previousPremiumStatus: previousStatus,
        nextPremiumStatus: nextStatus,
        accepted: true,
        customerInfoOperationId: operation.operationId,
      });
    }
    currentCustomerOriginalAppUserIdRef.current = customerInfo.originalAppUserId;
    premiumStatusRef.current = nextStatus;
    logPremiumDebug(`${operation.source} entitlement identifiers`, Object.keys(customerInfo.entitlements.active));
    setPremiumStatus(nextStatus);
    setManagementURL(customerInfo.managementURL);
    return { accepted: true, status: nextStatus };
  }, []);

  const clearCustomerState = useCallback((reason = 'identity-change') => {
    if (!mountedRef.current) return;
    const previousStatus = premiumStatusRef.current;
    currentCustomerOriginalAppUserIdRef.current = null;
    premiumStatusRef.current = 'loading';
    recordPremiumDiagnostic({
      operation: 'premium.identity_cleared',
      source: 'identity',
      previousPremiumStatus: previousStatus,
      nextPremiumStatus: 'loading',
      accepted: true,
      rejectionReason: reason,
      identityGeneration: identityGuardRef.current.current(),
    });
    setPremiumStatus('loading');
    setManagementURL(null);
  }, []);

  const setConfigurationError = useCallback((
    reason: string,
    source: PremiumEntitlementSource = 'initialization'
  ) => {
    if (!mountedRef.current) return;
    const previousStatus = premiumStatusRef.current;
    premiumStatusRef.current = 'configuration_error';
    recordPremiumDiagnostic({
      operation: 'premium.configuration_error',
      source,
      previousPremiumStatus: previousStatus,
      nextPremiumStatus: 'configuration_error',
      accepted: true,
      rejectionReason: reason,
      identityGeneration: identityGuardRef.current.current(),
    });
    setPremiumStatus('configuration_error');
    setManagementURL(null);
  }, []);

  const clearStoreState = useCallback(() => {
    if (!mountedRef.current) return;
    setOfferings(null);
    setPremiumPackage(null);
  }, []);

  const refreshOfferings = useCallback(async (
    client: PurchasesClient,
    source: PremiumEntitlementSource = 'refresh'
  ) => {
    const requestId = createPremiumDiagnosticRequestId('get-offerings');
    recordPremiumDiagnostic({
      operation: 'get_offerings.started',
      requestId,
      source,
      identityGeneration: identityGuardRef.current.current(),
      updatesPremiumState: false,
    });
    try {
      const nextOfferings = await withTimeout(client.getOfferings());
      if (!mountedRef.current) return;
      const defaultOffering = getDefaultOffering(nextOfferings);
      const selectedPackage = selectMonthlyPackage(nextOfferings, Platform.OS);
      const offeringIds = Object.keys(nextOfferings.all);
      const productIds = defaultOffering?.availablePackages.map(item => item.product.identifier) ?? [];
      logPremiumDebug('offering identifiers returned', offeringIds);
      logPremiumDebug('package product identifiers returned', productIds);
      logPremiumDebug('expected product identifier', [getMonthlyProductId(Platform.OS) ?? 'unsupported-platform']);
      recordPremiumDiagnostic({
        operation: 'get_offerings.completed',
        requestId,
        source,
        accepted: true,
        detail: `offerings=${offeringIds.join('|') || 'none'}; products=${productIds.join('|') || 'none'}`,
        identityGeneration: identityGuardRef.current.current(),
        updatesPremiumState: false,
      });
      setOfferings(nextOfferings);
      setPremiumPackage(selectedPackage);
      if (!defaultOffering) {
        setAvailabilityStatus('missing_default_offering');
      } else if (!selectedPackage) {
        setAvailabilityStatus('missing_monthly_product');
      } else {
        setAvailabilityStatus('ready');
      }
    } catch (offeringError) {
      recordPremiumDiagnostic({
        operation: 'get_offerings.rejected',
        requestId,
        source,
        accepted: false,
        rejectionReason: 'request-failed',
        errorCode: errorCode(offeringError) || 'unknown',
        identityGeneration: identityGuardRef.current.current(),
        updatesPremiumState: false,
      });
      throw offeringError;
    }
  }, []);

  const confirmPremiumEntitlement = useCallback(async (
    client: PurchasesClient,
    identityToken: number,
    source: 'purchase' | 'restore',
    allowRestore: boolean
  ) => {
    const refreshRequestId = createPremiumDiagnosticRequestId('post-purchase-refresh');
    const refreshOperation = beginCustomerInfoOperation(source, refreshRequestId, {
      identityGeneration: identityToken,
    });
    recordPremiumDiagnostic({
      operation: 'get_customer_info.started',
      requestId: refreshRequestId,
      source,
      identityGeneration: identityToken,
      customerInfoOperationId: refreshOperation.operationId,
      updatesPremiumState: false,
    });
    try {
      const refreshedCustomerInfo = await withTimeout(client.getCustomerInfo());
      const applyResult = applyCustomerInfo(refreshedCustomerInfo, refreshOperation);
      recordPremiumDiagnostic({
        operation: 'get_customer_info.completed',
        requestId: refreshRequestId,
        source,
        customerInfo: refreshedCustomerInfo,
        accepted: applyResult.accepted,
        rejectionReason: applyResult.accepted ? null : 'guarded-apply-rejected',
        identityGeneration: identityToken,
        customerInfoOperationId: refreshOperation.operationId,
        updatesPremiumState: false,
      });
      logPremiumDebug('post-purchase refresh entitlement identifiers', Object.keys(refreshedCustomerInfo.entitlements.active));
    } catch (refreshError) {
      logPremiumError('post-purchase customer info refresh failed', refreshError);
      recordPremiumDiagnostic({
        operation: 'get_customer_info.rejected',
        requestId: refreshRequestId,
        source,
        accepted: false,
        rejectionReason: 'request-failed',
        errorCode: errorCode(refreshError) || 'unknown',
        identityGeneration: identityToken,
        customerInfoOperationId: refreshOperation.operationId,
        updatesPremiumState: false,
      });
    }

    if (!identityGuardRef.current.isCurrent(identityToken) || !identitySettledRef.current) {
      logPremiumDebug('stale purchase confirmation ignored');
      return null;
    }

    if (premiumStatusRef.current !== 'premium' && allowRestore) {
      const recoveryRequestId = createPremiumDiagnosticRequestId('purchase-recovery-restore');
      const recoveryOperation = beginCustomerInfoOperation(source, recoveryRequestId, {
        identityGeneration: identityToken,
      });
      recordPremiumDiagnostic({
        operation: 'restore_purchases.started',
        requestId: recoveryRequestId,
        source,
        identityGeneration: identityToken,
        customerInfoOperationId: recoveryOperation.operationId,
        updatesPremiumState: false,
      });
      try {
        const restoredCustomerInfo = await withTimeout(client.restorePurchases());
        const applyResult = applyCustomerInfo(restoredCustomerInfo, recoveryOperation);
        recordPremiumDiagnostic({
          operation: 'restore_purchases.completed',
          requestId: recoveryRequestId,
          source,
          customerInfo: restoredCustomerInfo,
          accepted: applyResult.accepted,
          rejectionReason: applyResult.accepted ? null : 'guarded-apply-rejected',
          identityGeneration: identityToken,
          customerInfoOperationId: recoveryOperation.operationId,
          updatesPremiumState: false,
        });
        logPremiumDebug('purchase recovery entitlement identifiers', Object.keys(restoredCustomerInfo.entitlements.active));
      } catch (restoreError) {
        logPremiumError('purchase recovery failed', restoreError);
        recordPremiumDiagnostic({
          operation: 'restore_purchases.rejected',
          requestId: recoveryRequestId,
          source,
          accepted: false,
          rejectionReason: 'request-failed',
          errorCode: errorCode(restoreError) || 'unknown',
          identityGeneration: identityToken,
          customerInfoOperationId: recoveryOperation.operationId,
          updatesPremiumState: false,
        });
      }
    }

    if (!identityGuardRef.current.isCurrent(identityToken) || !identitySettledRef.current) {
      logPremiumDebug('stale purchase recovery ignored');
      return null;
    }

    return premiumStatusRef.current;
  }, [applyCustomerInfo, beginCustomerInfoOperation]);

  const refreshCustomerInfo = useCallback(async (source: PremiumEntitlementSource = 'refresh') => {
    const client = purchasesRef.current;
    if (!client || !configuredRef.current || !identitySettledRef.current) return;
    const identityToken = identityGuardRef.current.current();
    const requestId = createPremiumDiagnosticRequestId('get-customer-info');
    const customerInfoOperation = beginCustomerInfoOperation(source, requestId, {
      identityGeneration: identityToken,
    });
    recordPremiumDiagnostic({
      operation: 'get_customer_info.started',
      requestId,
      source,
      identityGeneration: identityToken,
      customerInfoOperationId: customerInfoOperation.operationId,
      updatesPremiumState: false,
    });

    try {
      const customerInfo = await withTimeout(client.getCustomerInfo());
      const applyResult = applyCustomerInfo(customerInfo, customerInfoOperation);
      recordPremiumDiagnostic({
        operation: 'get_customer_info.completed',
        requestId,
        source,
        customerInfo,
        accepted: applyResult.accepted,
        rejectionReason: applyResult.accepted ? null : 'guarded-apply-rejected',
        identityGeneration: identityToken,
        customerInfoOperationId: customerInfoOperation.operationId,
        updatesPremiumState: false,
      });
      if (!applyResult.accepted) return;
      await refreshOfferings(client, source);
      if (!mountedRef.current || !identityGuardRef.current.isCurrent(identityToken)) return;
      setError(null);
    } catch (refreshError) {
      if (!mountedRef.current || !identityGuardRef.current.isCurrent(identityToken)) return;
      logPremiumError('refresh failed', refreshError);
      recordPremiumDiagnostic({
        operation: 'get_customer_info.rejected',
        requestId,
        source,
        accepted: false,
        rejectionReason: 'request-failed',
        errorCode: errorCode(refreshError) || 'unknown',
        identityGeneration: identityToken,
      });
      setAvailabilityStatus('store_unavailable');
      setError('The store is temporarily unavailable. Please try again later.');
    }
  }, [applyCustomerInfo, beginCustomerInfoOperation, refreshOfferings]);

  const transitionIdentity = useCallback((
    nextUserId: string | null,
    client: PurchasesClient,
    reason: string
  ) => {
    const requestId = createPremiumDiagnosticRequestId('identity');
    const identityChanged = currentRevenueCatUserRef.current !== nextUserId;
    const invalidatesIdentity = shouldInvalidateRevenueCatIdentity(
      currentRevenueCatUserRef.current,
      nextUserId,
      identitySettledRef.current
    );
    const token = invalidatesIdentity
      ? identityGuardRef.current.begin()
      : identityGuardRef.current.current();
    logPremiumDebug('identity change reason', [reason, identityChanged ? 'identity-changed' : 'same-identity']);
    recordPremiumDiagnostic({
      operation: 'identity.transition_received',
      requestId,
      source: reason === 'initialization' ? 'initialization' : 'identity',
      authenticatedUserPresent: Boolean(nextUserId),
      identityGeneration: token,
      accepted: !identityChanged || invalidatesIdentity,
      detail: `${reason}:${identityChanged ? 'identity-changed' : 'same-user-refresh'}`,
    });
    if (invalidatesIdentity) {
      identitySettledRef.current = false;
      if (identityChanged) clearCustomerState();
    }

    const runTransition = async () => {
      if (!identityGuardRef.current.isCurrent(token)) return;
      const operationSource: PremiumEntitlementSource =
        reason === 'initialization' ? 'initialization' : 'identity';

      try {
        const action = getRevenueCatIdentityAction(currentRevenueCatUserRef.current, nextUserId);
        let customerInfoOperation = action === 'logout'
          ? null
          : beginCustomerInfoOperation(operationSource, requestId, {
              identityGeneration: token,
              revenueCatAppUserId: action === 'login' ? nextUserId : rawRevenueCatUserIdRef.current,
            });
        recordPremiumDiagnostic({
          operation: `identity.${action}.started`,
          requestId,
          source: reason === 'initialization' ? 'initialization' : 'identity',
          authenticatedUserPresent: Boolean(nextUserId),
          identityGeneration: token,
          customerInfoOperationId: customerInfoOperation?.operationId ?? null,
          updatesPremiumState: false,
        });
        let customerInfo: CustomerInfo;
        if (action === 'login' && nextUserId) {
          customerInfo = (await withTimeout(client.logIn(nextUserId))).customerInfo;
          currentRevenueCatUserRef.current = nextUserId;
          rawRevenueCatUserIdRef.current = nextUserId;
        } else if (action === 'logout') {
          customerInfo = await withTimeout(client.logOut());
          currentRevenueCatUserRef.current = null;
          rawRevenueCatUserIdRef.current = customerInfo.originalAppUserId;
        } else {
          customerInfo = await withTimeout(client.getCustomerInfo());
        }

        try {
          rawRevenueCatUserIdRef.current = await withTimeout(client.getAppUserID());
        } catch (appUserIdError) {
          logPremiumError('post-identity RevenueCat app user ID lookup failed', appUserIdError);
          recordPremiumDiagnostic({
            operation: 'identity.app_user_id_lookup.rejected',
            requestId,
            source: reason === 'initialization' ? 'initialization' : 'identity',
            accepted: false,
            rejectionReason: 'request-failed',
            errorCode: errorCode(appUserIdError) || 'unknown',
            identityGeneration: token,
            updatesPremiumState: false,
          });
        }

        if (!customerInfoOperation) {
          customerInfoOperation = beginCustomerInfoOperation(operationSource, requestId, {
            identityGeneration: token,
            revenueCatAppUserId: rawRevenueCatUserIdRef.current,
          });
        }

        if (!identityGuardRef.current.isCurrent(token) || !mountedRef.current) {
          logPremiumDebug('stale identity result ignored');
          recordPremiumDiagnostic({
            operation: `identity.${action}.completed`,
            requestId,
            source: reason === 'initialization' ? 'initialization' : 'identity',
            customerInfo,
            accepted: false,
            rejectionReason: 'stale-identity-generation',
            identityGeneration: token,
            customerInfoOperationId: customerInfoOperation.operationId,
            updatesPremiumState: false,
          });
          return;
        }
        identitySettledRef.current = true;
        authenticatedUserPresentRef.current = Boolean(nextUserId);
        const applyResult = applyCustomerInfo(customerInfo, customerInfoOperation);
        recordPremiumDiagnostic({
          operation: `identity.${action}.completed`,
          requestId,
          source: reason === 'initialization' ? 'initialization' : 'identity',
          customerInfo,
          accepted: applyResult.accepted,
          rejectionReason: applyResult.accepted ? null : 'guarded-apply-rejected',
          revenueCatAppUserId: rawRevenueCatUserIdRef.current,
          authenticatedUserPresent: Boolean(nextUserId),
          identityGeneration: token,
          customerInfoOperationId: customerInfoOperation.operationId,
          updatesPremiumState: false,
        });
        if (!applyResult.accepted && invalidatesIdentity) {
          identitySettledRef.current = false;
          setConfigurationError('initial-customer-info-rejected', operationSource);
          return;
        }
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
        recordPremiumDiagnostic({
          operation: 'identity.transition_rejected',
          requestId,
          source: reason === 'initialization' ? 'initialization' : 'identity',
          accepted: false,
          rejectionReason: 'request-failed',
          errorCode: errorCode(identityError) || 'unknown',
          identityGeneration: token,
        });
        if (invalidatesIdentity) {
          identitySettledRef.current = false;
          if (identityChanged) clearCustomerState();
          setConfigurationError('identity-transition-failed', operationSource);
        }
        setAvailabilityStatus('store_unavailable');
        setError('Premium status could not be refreshed. Please try again.');
      }
    };

    const queued = identityQueueRef.current.then(runTransition, runTransition);
    identityQueueRef.current = queued.catch(() => {});
    return queued;
  }, [applyCustomerInfo, beginCustomerInfoOperation, clearCustomerState, refreshOfferings, setConfigurationError]);

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const initRevenueCat = async () => {
      const configRequestId = createPremiumDiagnosticRequestId('configure');
      recordNoLocalPremiumCache();
      recordPremiumDiagnostic({
        operation: 'configuration.started',
        requestId: configRequestId,
        source: 'initialization',
        configured: false,
        appState: appStateRef.current,
      });
      if (!isSupportedPurchasesPlatform()) {
        setConfigurationError('unsupported-platform');
        setIsConfigured(false);
        setAvailabilityStatus('unsupported_platform');
        setError(null);
        recordPremiumDiagnostic({
          operation: 'configuration.rejected',
          requestId: configRequestId,
          source: 'initialization',
          configured: false,
          accepted: false,
          rejectionReason: 'unsupported-platform',
        });
        return;
      }

      const apiKey = getRevenueCatApiKey(Platform.OS);
      if (!apiKey) {
        setConfigurationError('missing-api-key');
        setIsConfigured(false);
        setAvailabilityStatus('missing_api_key');
        setError(null);
        recordPremiumDiagnostic({
          operation: 'configuration.rejected', requestId: configRequestId, source: 'initialization',
          configured: false, accepted: false, rejectionReason: 'missing-api-key',
        });
        return;
      }
      if (!isSafePublicRevenueCatKey(apiKey, Platform.OS)) {
        setConfigurationError('invalid-api-key');
        setIsConfigured(false);
        setAvailabilityStatus('invalid_api_key');
        setError(null);
        recordPremiumDiagnostic({
          operation: 'configuration.rejected', requestId: configRequestId, source: 'initialization',
          configured: false, accepted: false, rejectionReason: 'invalid-api-key',
        });
        return;
      }

      const purchasesModule = loadPurchasesModule();
      if (!purchasesModule) {
        setConfigurationError('native-module-missing');
        setIsConfigured(false);
        setAvailabilityStatus('native_module_missing');
        setError(null);
        recordPremiumDiagnostic({
          operation: 'configuration.rejected', requestId: configRequestId, source: 'initialization',
          configured: false, accepted: false, rejectionReason: 'native-module-missing',
        });
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
        recordPremiumDiagnostic({
          operation: 'configuration.completed',
          requestId: configRequestId,
          source: 'initialization',
          configured: true,
          accepted: true,
        });

        const listener: CustomerInfoUpdateListener = customerInfo => {
          const listenerRequestId = createPremiumDiagnosticRequestId('listener');
          const listenerOperation = beginCustomerInfoOperation('listener', listenerRequestId, {
            requiresOriginalAppUserIdMatch: true,
          });
          const canApply = mounted && identitySettledRef.current;
          recordPremiumDiagnostic({
            operation: 'customer_info_listener.fired',
            requestId: listenerRequestId,
            source: 'listener',
            customerInfo,
            accepted: canApply,
            rejectionReason: canApply ? null : 'identity-not-settled',
            identityGeneration: identityGuardRef.current.current(),
            customerInfoOperationId: listenerOperation.operationId,
            updatesPremiumState: false,
          });
          const applyResult = canApply
            ? applyCustomerInfo(customerInfo, listenerOperation)
            : { accepted: false, status: premiumStatusRef.current };
          if (applyResult.accepted) {
            logPremiumDebug('customer info listener update');
          } else {
            logPremiumDebug('customer info listener update ignored by lifecycle guard');
          }
        };
        customerInfoListenerRef.current = listener;
        client.addCustomerInfoUpdateListener(listener);
        recordPremiumDiagnostic({
          operation: 'customer_info_listener.registered',
          requestId: configRequestId,
          source: 'initialization',
          accepted: true,
        });

        const currentAppUserId = await withTimeout(client.getAppUserID());
        if (!mounted) return;
        logPremiumDebug('current RevenueCat app user ID', [currentAppUserId]);
        rawRevenueCatUserIdRef.current = currentAppUserId;
        recordPremiumDiagnostic({
          operation: 'configuration.app_user_id_loaded',
          requestId: configRequestId,
          source: 'initialization',
          revenueCatAppUserId: currentAppUserId,
          accepted: true,
        });
        currentRevenueCatUserRef.current = isAnonymousRevenueCatUser(currentAppUserId)
          ? null
          : currentAppUserId;
        configuredRef.current = true;
        setIsConfigured(true);
        const { data: { session } } = await supabase.auth.getSession();
        authenticatedUserPresentRef.current = Boolean(session?.user.id);
        logPremiumDebug('auth user ID', [session?.user.id ?? 'guest']);
        await transitionIdentity(session?.user.id ?? null, client, 'initialization');
      } catch (initError) {
        if (!mounted) return;
        logPremiumError('initialization failed', initError);
        recordPremiumDiagnostic({
          operation: 'configuration.rejected',
          requestId: configRequestId,
          source: 'initialization',
          configured: false,
          accepted: false,
          rejectionReason: 'request-failed',
          errorCode: errorCode(initError) || 'unknown',
        });
        setIsConfigured(false);
        setAvailabilityStatus('store_unavailable');
        setError('Purchases are unavailable on this device right now.');
        setConfigurationError('configuration-failed');
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
        recordPremiumDiagnostic({
          operation: 'customer_info_listener.removed',
          source: 'initialization',
          accepted: true,
          identityGeneration: identityGuardRef.current.current(),
        });
      }
    };
  }, [applyCustomerInfo, beginCustomerInfoOperation, setConfigurationError, transitionIdentity]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const client = purchasesRef.current;
      if (!client || !configuredRef.current) return;
      authenticatedUserPresentRef.current = Boolean(session?.user.id);
      recordPremiumDiagnostic({
        operation: 'supabase.auth_event_received',
        source: 'identity',
        authenticatedUserPresent: Boolean(session?.user.id),
        identityGeneration: identityGuardRef.current.current(),
        accepted: true,
        detail: event,
      });
      if (!session?.user.id) clearStoreState();
      logPremiumDebug('auth user ID', [session?.user.id ?? 'guest']);
      transitionIdentity(session?.user.id ?? null, client, `auth:${event}`).catch(() => {});
    });

    return () => subscription.unsubscribe();
  }, [clearStoreState, transitionIdentity]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      appStateRef.current = state;
      logPremiumDebug('app state transition', [state]);
      recordPremiumDiagnostic({
        operation: 'app_state.changed',
        source: state === 'active' ? 'foreground' : 'app_state',
        appState: state,
        accepted: true,
        identityGeneration: identityGuardRef.current.current(),
      });
      if (state === 'active') refreshCustomerInfo('foreground').catch(() => {});
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
    const purchaseRequestId = createPremiumDiagnosticRequestId('purchase');
    let checkoutAppUserId: string | null = null;

    try {
      setOperation('purchasing');
      setError(null);
      try {
        checkoutAppUserId = await withTimeout(client.getAppUserID());
        rawRevenueCatUserIdRef.current = checkoutAppUserId;
        logPremiumDebug('purchase started', [checkoutAppUserId]);
      } catch (userIdError) {
        logPremiumError('purchase user ID lookup failed', userIdError);
        logPremiumDebug('purchase started');
      }
      const purchaseInfoOperation = beginCustomerInfoOperation('purchase', purchaseRequestId, {
        identityGeneration: identityToken,
        revenueCatAppUserId: checkoutAppUserId ?? rawRevenueCatUserIdRef.current,
      });
      recordPremiumDiagnostic({
        operation: 'purchase.started',
        requestId: purchaseRequestId,
        source: 'purchase',
        revenueCatAppUserId: checkoutAppUserId ?? rawRevenueCatUserIdRef.current,
        authenticatedUserPresent: authenticatedUserPresentRef.current,
        identityGeneration: identityToken,
        customerInfoOperationId: purchaseInfoOperation.operationId,
        accepted: true,
        appState: appStateRef.current,
      });
      // Store checkout is user-driven and can remain open well beyond a network timeout.
      const result = await client.purchasePackage(premiumPackage);
      logPremiumDebug('purchase result received');
      recordPremiumDiagnostic({
        operation: 'purchase.resolved',
        requestId: purchaseRequestId,
        source: 'purchase',
        customerInfo: result.customerInfo,
        accepted: identityGuardRef.current.isCurrent(identityToken),
        rejectionReason: identityGuardRef.current.isCurrent(identityToken) ? null : 'identity-generation-changed',
        identityGeneration: identityToken,
        customerInfoOperationId: purchaseInfoOperation.operationId,
        updatesPremiumState: false,
      });
      let returnedAppUserId: string | null = null;
      try {
        returnedAppUserId = await withTimeout(client.getAppUserID());
        rawRevenueCatUserIdRef.current = returnedAppUserId;
        logPremiumDebug('post-purchase RevenueCat app user ID', [returnedAppUserId]);
      } catch (userIdError) {
        logPremiumError('post-purchase user ID lookup failed', userIdError);
      }
      if (checkoutAppUserId && returnedAppUserId && checkoutAppUserId !== returnedAppUserId) {
        logPremiumDebug('stale purchase result ignored after RevenueCat identity changed');
        recordPremiumDiagnostic({
          operation: 'purchase.identity_mismatch',
          requestId: purchaseRequestId,
          source: 'purchase',
          customerInfo: result.customerInfo,
          accepted: false,
          rejectionReason: 'revenuecat-app-user-id-changed',
          revenueCatAppUserId: returnedAppUserId,
          identityGeneration: identityToken,
          customerInfoOperationId: purchaseInfoOperation.operationId,
          updatesPremiumState: false,
        });
        if (mountedRef.current) setError('Your account changed during checkout. Please restore your purchase.');
        return 'error';
      }
      const purchaseApplyResult = applyCustomerInfo(result.customerInfo, purchaseInfoOperation);
      if (!purchaseApplyResult.accepted && !identityGuardRef.current.isCurrent(identityToken)) return 'error';
      const confirmedStatus = await confirmPremiumEntitlement(client, identityToken, 'purchase', true);
      if (!confirmedStatus) return 'error';
      if (confirmedStatus !== 'premium') {
        setError('Your purchase was received, but Premium is not active yet. Please retry or contact support.');
        return 'no_entitlement';
      }
      return 'success';
    } catch (purchaseError) {
      logPremiumError('purchase failed', purchaseError);
      recordPremiumDiagnostic({
        operation: 'purchase.rejected',
        requestId: purchaseRequestId,
        source: 'purchase',
        accepted: false,
        rejectionReason: isUserCancelledPurchase(purchaseError) ? 'user-cancelled' : 'sdk-error',
        errorCode: errorCode(purchaseError) || 'unknown',
        identityGeneration: identityToken,
      });
      if (isUserCancelledPurchase(purchaseError)) return 'cancelled';
      if (isAlreadyPurchasedError(purchaseError)) {
        logPremiumDebug('already purchased response received; recovering entitlement');
        const confirmedStatus = await confirmPremiumEntitlement(client, identityToken, 'purchase', true);
        if (!confirmedStatus) return 'error';
        if (confirmedStatus === 'premium') return 'success';
        if (mountedRef.current) {
          setError('Your store subscription could not be verified yet. Tap Restore Purchases or contact support.');
        }
        return 'no_entitlement';
      }
      const message = getFriendlyPurchaseError(purchaseError);
      if (message && mountedRef.current) setError(message);
      return 'error';
    } finally {
      storeOperationRef.current.finish('purchasing');
      if (mountedRef.current) setOperation('idle');
    }
  }, [applyCustomerInfo, beginCustomerInfoOperation, confirmPremiumEntitlement, premiumPackage]);

  const restorePurchases = useCallback(async () => {
    if (!storeOperationRef.current.tryStart('restoring')) return 'error';
    const client = purchasesRef.current;
    if (!client || !configuredRef.current || !identitySettledRef.current) {
      setError('Premium unavailable, try again later.');
      storeOperationRef.current.finish('restoring');
      return 'error';
    }
    const identityToken = identityGuardRef.current.current();
    const restoreRequestId = createPremiumDiagnosticRequestId('restore');
    const restoreInfoOperation = beginCustomerInfoOperation('restore', restoreRequestId, {
      identityGeneration: identityToken,
    });

    try {
      setOperation('restoring');
      setError(null);
      recordPremiumDiagnostic({
        operation: 'restore_purchases.started',
        requestId: restoreRequestId,
        source: 'restore',
        identityGeneration: identityToken,
        customerInfoOperationId: restoreInfoOperation.operationId,
        updatesPremiumState: false,
      });
      const restoredCustomerInfo = await withTimeout(client.restorePurchases());
      logPremiumDebug('restore result entitlement identifiers', Object.keys(restoredCustomerInfo.entitlements.active));
      const restoreApplyResult = applyCustomerInfo(restoredCustomerInfo, restoreInfoOperation);
      recordPremiumDiagnostic({
        operation: 'restore_purchases.completed',
        requestId: restoreRequestId,
        source: 'restore',
        customerInfo: restoredCustomerInfo,
        accepted: restoreApplyResult.accepted,
        rejectionReason: restoreApplyResult.accepted ? null : 'guarded-apply-rejected',
        identityGeneration: identityToken,
        customerInfoOperationId: restoreInfoOperation.operationId,
        updatesPremiumState: false,
      });
      if (!restoreApplyResult.accepted && !identityGuardRef.current.isCurrent(identityToken)) return 'error';
      const confirmedStatus = await confirmPremiumEntitlement(client, identityToken, 'restore', false);
      if (!confirmedStatus) return 'error';
      const restored = confirmedStatus === 'premium';
      if (!restored) {
        if (mountedRef.current) setError('No active subscription found.');
        return 'no_entitlement';
      }
      return 'success';
    } catch (restoreError) {
      logPremiumError('restore failed', restoreError);
      recordPremiumDiagnostic({
        operation: 'restore_purchases.rejected',
        requestId: restoreRequestId,
        source: 'restore',
        accepted: false,
        rejectionReason: 'request-failed',
        errorCode: errorCode(restoreError) || 'unknown',
        identityGeneration: identityToken,
      });
      if (mountedRef.current) setError(getFriendlyRestoreError(restoreError));
      return 'error';
    } finally {
      storeOperationRef.current.finish('restoring');
      if (mountedRef.current) setOperation('idle');
    }
  }, [applyCustomerInfo, beginCustomerInfoOperation, confirmPremiumEntitlement]);

  const clearPremiumError = useCallback(() => {
    if (mountedRef.current) setError(null);
  }, []);

  const clearPremiumCustomerInfoCache = useCallback(async () => {
    const client = purchasesRef.current;
    const requestId = createPremiumDiagnosticRequestId('premium-cache-invalidate');
    if (!client || !configuredRef.current) {
      recordPremiumDiagnostic({
        operation: 'premium_cache.invalidate_rejected',
        requestId,
        source: 'profile_diagnostics',
        accepted: false,
        rejectionReason: 'revenuecat-not-configured',
        updatesPremiumState: false,
      });
      return false;
    }
    recordPremiumDiagnostic({
      operation: 'premium_cache.invalidate_started',
      requestId,
      source: 'profile_diagnostics',
      accepted: true,
      updatesPremiumState: false,
    });
    try {
      await client.invalidateCustomerInfoCache();
      recordPremiumDiagnostic({
        operation: 'premium_cache.invalidate_completed',
        requestId,
        source: 'profile_diagnostics',
        accepted: true,
        detail: 'RevenueCat SDK CustomerInfo cache invalidated; app-owned premium cache does not exist.',
        updatesPremiumState: false,
      });
      return true;
    } catch (cacheError) {
      recordPremiumDiagnostic({
        operation: 'premium_cache.invalidate_rejected',
        requestId,
        source: 'profile_diagnostics',
        accepted: false,
        rejectionReason: 'request-failed',
        errorCode: errorCode(cacheError) || 'unknown',
        updatesPremiumState: false,
      });
      return false;
    }
  }, []);

  const value = useMemo<PremiumContextValue>(() => ({
    premiumStatus,
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
    clearPremiumCustomerInfoCache,
    clearPremiumError,
  }), [
    premiumStatus,
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
    clearPremiumCustomerInfoCache,
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
