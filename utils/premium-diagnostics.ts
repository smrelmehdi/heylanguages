import type { AppStateStatus } from 'react-native';
import type { CustomerInfo } from 'react-native-purchases';
import { PREMIUM_ENTITLEMENT_ID, type PremiumStatus } from './premium';

const appEnvironment = process.env.EXPO_PUBLIC_APP_ENV;
const isLocalDevelopment = typeof __DEV__ !== 'undefined' && __DEV__;
export const PREMIUM_DIAGNOSTICS_ENABLED =
  appEnvironment !== 'production' &&
  (isLocalDevelopment || appEnvironment === 'development' || appEnvironment === 'preview');

export type PremiumDiagnosticStatus = PremiumStatus;
export type PremiumEntitlementSource =
  | 'initialization'
  | 'purchase'
  | 'refresh'
  | 'restore'
  | 'listener'
  | 'foreground'
  | 'identity'
  | 'profile_diagnostics'
  | 'app_state'
  | 'cache'
  | 'home_render'
  | 'profile_render';

export type PremiumDiagnosticEvent = {
  timestamp: string;
  sequence: number;
  operation: string;
  requestId: string;
  operationSource: PremiumEntitlementSource;
  appState: AppStateStatus;
  revenueCatAppUserId: string | null;
  authenticatedUserPresent: boolean;
  identityGeneration: number;
  customerInfoOperationId: number | null;
  previousPremiumStatus: PremiumDiagnosticStatus;
  incomingActiveEntitlementIds: string[];
  incomingPremiumExpirationDate: string | null;
  incomingLatestPurchaseDate: string | null;
  incomingProductIdentifier: string | null;
  nextPremiumStatus: PremiumDiagnosticStatus;
  accepted: boolean | null;
  rejectionReason: string | null;
  detail: string | null;
  elapsedMsSincePurchaseStarted: number | null;
  errorCode: string | null;
};

export type PremiumDiagnosticSnapshot = {
  premiumStatus: PremiumDiagnosticStatus;
  configured: boolean;
  revenueCatAppUserId: string | null;
  authenticatedUserPresent: boolean;
  activeEntitlementIds: string[];
  premiumExpirationDate: string | null;
  latestPurchaseDate: string | null;
  productIdentifier: string | null;
  customerInfoLastRefreshedAt: string | null;
  lastEntitlementSource: PremiumEntitlementSource | null;
  lastPremiumStateTransition: string | null;
  lastRevenueCatErrorCode: string | null;
  appState: AppStateStatus;
  identityGeneration: number;
  latestAcceptedCustomerInfoOperationId: number | null;
  testSubscriptionState: 'likely_active' | 'likely_expired' | 'unknown';
  lastSequence: number;
};

type RecordDiagnosticInput = {
  operation: string;
  requestId?: string;
  source: PremiumEntitlementSource;
  customerInfo?: CustomerInfo | null;
  previousPremiumStatus?: PremiumDiagnosticStatus;
  nextPremiumStatus?: PremiumDiagnosticStatus;
  accepted?: boolean | null;
  rejectionReason?: string | null;
  detail?: string | null;
  errorCode?: string | null;
  configured?: boolean;
  revenueCatAppUserId?: string | null;
  authenticatedUserPresent?: boolean;
  identityGeneration?: number;
  customerInfoOperationId?: number | null;
  appState?: AppStateStatus;
  updatesPremiumState?: boolean;
};

const listeners = new Set<() => void>();
const events: PremiumDiagnosticEvent[] = [];
let sequence = 0;
let requestSequence = 0;
let purchaseStartedAt: number | null = null;
let snapshot: PremiumDiagnosticSnapshot = {
  premiumStatus: 'loading',
  configured: false,
  revenueCatAppUserId: null,
  authenticatedUserPresent: false,
  activeEntitlementIds: [],
  premiumExpirationDate: null,
  latestPurchaseDate: null,
  productIdentifier: null,
  customerInfoLastRefreshedAt: null,
  lastEntitlementSource: null,
  lastPremiumStateTransition: null,
  lastRevenueCatErrorCode: null,
  appState: 'unknown',
  identityGeneration: 0,
  latestAcceptedCustomerInfoOperationId: null,
  testSubscriptionState: 'unknown',
  lastSequence: 0,
};

function getCustomerInfoFields(customerInfo?: CustomerInfo | null) {
  const entitlement = customerInfo?.entitlements.all[PREMIUM_ENTITLEMENT_ID];
  return {
    entitlementIds: customerInfo ? Object.keys(customerInfo.entitlements.active) : [],
    expirationDate: entitlement?.expirationDate ?? null,
    latestPurchaseDate: entitlement?.latestPurchaseDate ?? null,
    productIdentifier: entitlement?.productIdentifier ?? null,
    premiumStatus: customerInfo
      ? customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]
        ? 'premium' as const
        : 'free' as const
      : undefined,
  };
}

function getTestSubscriptionState(status: PremiumDiagnosticStatus, expirationDate: string | null) {
  if (!expirationDate) return 'unknown' as const;
  const expirationTime = Date.parse(expirationDate);
  if (!Number.isFinite(expirationTime)) return 'unknown' as const;
  if (status === 'premium' && expirationTime > Date.now()) return 'likely_active' as const;
  if (expirationTime <= Date.now()) return 'likely_expired' as const;
  return 'unknown' as const;
}

function notify() {
  listeners.forEach(listener => listener());
}

export function createPremiumDiagnosticRequestId(operation: string) {
  requestSequence += 1;
  return `${operation}-${requestSequence}`;
}

export function recordPremiumDiagnostic(input: RecordDiagnosticInput) {
  if (!PREMIUM_DIAGNOSTICS_ENABLED) return null;

  const now = new Date();
  const fields = getCustomerInfoFields(input.customerInfo);
  const previousStatus = input.previousPremiumStatus ?? snapshot.premiumStatus;
  const nextStatus = input.nextPremiumStatus ?? fields.premiumStatus ?? previousStatus;
  const requestId = input.requestId ?? createPremiumDiagnosticRequestId(input.operation);
  const elapsed = purchaseStartedAt === null ? null : Date.now() - purchaseStartedAt;
  sequence += 1;

  const event: PremiumDiagnosticEvent = {
    timestamp: now.toISOString(),
    sequence,
    operation: input.operation,
    requestId,
    operationSource: input.source,
    appState: input.appState ?? snapshot.appState,
    revenueCatAppUserId:
      input.revenueCatAppUserId === undefined ? snapshot.revenueCatAppUserId : input.revenueCatAppUserId,
    authenticatedUserPresent: input.authenticatedUserPresent ?? snapshot.authenticatedUserPresent,
    identityGeneration: input.identityGeneration ?? snapshot.identityGeneration,
    customerInfoOperationId: input.customerInfoOperationId ?? null,
    previousPremiumStatus: previousStatus,
    incomingActiveEntitlementIds: fields.entitlementIds,
    incomingPremiumExpirationDate: fields.expirationDate,
    incomingLatestPurchaseDate: fields.latestPurchaseDate,
    incomingProductIdentifier: fields.productIdentifier,
    nextPremiumStatus: nextStatus,
    accepted: input.accepted === undefined ? null : input.accepted,
    rejectionReason: input.rejectionReason ?? null,
    detail: input.detail ?? null,
    elapsedMsSincePurchaseStarted: elapsed,
    errorCode: input.errorCode ?? null,
  };

  if (input.operation === 'purchase.started') purchaseStartedAt = Date.now();
  if (input.operation === 'purchase.resolved' || input.operation === 'purchase.rejected') {
    event.elapsedMsSincePurchaseStarted = purchaseStartedAt === null ? null : Date.now() - purchaseStartedAt;
    purchaseStartedAt = null;
  }

  const updatesPremiumState = input.updatesPremiumState !== false;
  const acceptedCustomerInfo = Boolean(input.customerInfo && input.accepted !== false && updatesPremiumState);
  const nextSnapshotStatus = input.accepted === false || !updatesPremiumState ? snapshot.premiumStatus : nextStatus;
  snapshot = {
    ...snapshot,
    premiumStatus: nextSnapshotStatus,
    configured: input.configured ?? snapshot.configured,
    revenueCatAppUserId: event.revenueCatAppUserId,
    authenticatedUserPresent: event.authenticatedUserPresent,
    activeEntitlementIds: acceptedCustomerInfo ? fields.entitlementIds : snapshot.activeEntitlementIds,
    premiumExpirationDate: acceptedCustomerInfo ? fields.expirationDate : snapshot.premiumExpirationDate,
    latestPurchaseDate: acceptedCustomerInfo ? fields.latestPurchaseDate : snapshot.latestPurchaseDate,
    productIdentifier: acceptedCustomerInfo ? fields.productIdentifier : snapshot.productIdentifier,
    customerInfoLastRefreshedAt: acceptedCustomerInfo ? event.timestamp : snapshot.customerInfoLastRefreshedAt,
    lastEntitlementSource: acceptedCustomerInfo ? input.source : snapshot.lastEntitlementSource,
    lastPremiumStateTransition:
      input.accepted !== false && updatesPremiumState && previousStatus !== nextStatus
        ? `${previousStatus} -> ${nextStatus} at ${event.timestamp} (${input.source})`
        : snapshot.lastPremiumStateTransition,
    lastRevenueCatErrorCode: input.errorCode ?? snapshot.lastRevenueCatErrorCode,
    appState: event.appState,
    identityGeneration: event.identityGeneration,
    latestAcceptedCustomerInfoOperationId:
      acceptedCustomerInfo && event.customerInfoOperationId !== null
        ? event.customerInfoOperationId
        : snapshot.latestAcceptedCustomerInfoOperationId,
    testSubscriptionState: getTestSubscriptionState(nextSnapshotStatus, acceptedCustomerInfo
      ? fields.expirationDate
      : snapshot.premiumExpirationDate),
    lastSequence: sequence,
  };

  events.push(event);
  if (events.length > 300) events.splice(0, events.length - 300);
  console.info('[premium-diagnostics]', JSON.stringify(event));
  notify();
  return event;
}

export function getPremiumDiagnosticSnapshot() {
  return { ...snapshot, activeEntitlementIds: [...snapshot.activeEntitlementIds] };
}

export function subscribePremiumDiagnostics(listener: () => void) {
  if (!PREMIUM_DIAGNOSTICS_ENABLED) return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSanitizedPremiumDiagnostics() {
  return JSON.stringify({ snapshot: getPremiumDiagnosticSnapshot(), events: [...events] }, null, 2);
}

export function recordNoLocalPremiumCache() {
  return recordPremiumDiagnostic({
    operation: 'premium_cache.none',
    source: 'cache',
    accepted: true,
    detail: 'RevenueCat CustomerInfo is the only premium authority; no app-owned persisted premium cache exists.',
  });
}
