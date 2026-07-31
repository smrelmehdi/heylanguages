import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import PaywallModal from '../components/PaywallModal';
import PremiumSuccessModal from '../components/PremiumSuccessModal';
import { shouldShowPremiumSuccess, type PremiumPaywallSource } from '../utils/premium';
import { recordPremiumDiagnostic } from '../utils/premium-diagnostics';
import { getConnectivitySnapshot } from '../utils/connectivity-state';
import { usePremium } from './PremiumContext';

type OpenPaywallOptions = {
  contentLabel?: string;
};

type PaywallContextValue = {
  isPaywallVisible: boolean;
  paywallSource: PremiumPaywallSource | null;
  openPaywall: (source: PremiumPaywallSource, options?: OpenPaywallOptions) => void;
  closePaywall: () => void;
};

const PaywallContext = createContext<PaywallContextValue>({
  isPaywallVisible: false,
  paywallSource: null,
  openPaywall: () => {},
  closePaywall: () => {},
});

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const {
    isPremium,
    premiumPackage,
    premiumPrice,
    isPurchasing,
    isRestoring,
    availabilityStatus,
    error,
    purchasePremium,
    restorePurchases,
    refreshCustomerInfo,
    clearPremiumError,
  } = usePremium();
  const [paywallSource, setPaywallSource] = useState<PremiumPaywallSource | null>(null);
  const [contentLabel, setContentLabel] = useState<string | undefined>();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const openPaywall = useCallback((source: PremiumPaywallSource, options?: OpenPaywallOptions) => {
    clearPremiumError();
    setPaywallSource(source);
    setContentLabel(options?.contentLabel);
    if (__DEV__) console.info(`[premium] paywall opened: ${source}`);
  }, [clearPremiumError]);

  const closePaywall = useCallback(() => {
    if (isPurchasing || isRestoring) return;
    setPaywallSource(null);
    setContentLabel(undefined);
    clearPremiumError();
  }, [clearPremiumError, isPurchasing, isRestoring]);

  const handlePurchase = useCallback(async () => {
    if (getConnectivitySnapshot().isHydrated && !getConnectivitySnapshot().isOnline) {
      if (__DEV__) console.info('[connectivity] blocked network-only action', { action: 'purchase' });
      Alert.alert('Internet connection required', 'Reconnect to start a Premium subscription.');
      return;
    }
    const wasPremium = isPremium;
    const result = await purchasePremium();
    if (result === 'success') {
      recordPremiumDiagnostic({
        operation: 'paywall.purchase_confirmed',
        source: 'purchase',
        previousPremiumStatus: wasPremium ? 'premium' : 'free',
        nextPremiumStatus: 'premium',
        accepted: true,
      });
      setPaywallSource(null);
      setContentLabel(undefined);
      if (shouldShowPremiumSuccess(wasPremium, result)) {
        recordPremiumDiagnostic({
          operation: 'premium_success.shown',
          source: 'purchase',
          previousPremiumStatus: 'free',
          nextPremiumStatus: 'premium',
          accepted: true,
        });
        setIsSuccessVisible(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }
  }, [isPremium, purchasePremium]);

  const handleRestore = useCallback(async () => {
    if (getConnectivitySnapshot().isHydrated && !getConnectivitySnapshot().isOnline) {
      if (__DEV__) console.info('[connectivity] blocked network-only action', { action: 'restore' });
      Alert.alert('Internet connection required', 'Reconnect to restore purchases.');
      return;
    }
    const result = await restorePurchases();
    if (result === 'success') {
      setPaywallSource(null);
      setContentLabel(undefined);
    }
  }, [restorePurchases]);

  const value = useMemo<PaywallContextValue>(() => ({
    isPaywallVisible: paywallSource !== null,
    paywallSource,
    openPaywall,
    closePaywall,
  }), [closePaywall, openPaywall, paywallSource]);

  return (
    <PaywallContext.Provider value={value}>
      {children}
      <PaywallModal
        visible={paywallSource !== null}
        onClose={closePaywall}
        contentLabel={contentLabel}
        price={premiumPrice}
        isPurchasing={isPurchasing}
        isRestoring={isRestoring}
        isPremiumAvailable={availabilityStatus === 'ready' && Boolean(premiumPackage)}
        availabilityStatus={availabilityStatus}
        error={error}
        onPurchase={handlePurchase}
        onRestore={handleRestore}
        onRefresh={refreshCustomerInfo}
      />
      <PremiumSuccessModal
        visible={isSuccessVisible}
        onClose={() => {
          recordPremiumDiagnostic({
            operation: 'premium_success.dismissed',
            source: 'purchase',
            previousPremiumStatus: 'premium',
            nextPremiumStatus: 'premium',
            accepted: true,
          });
          setIsSuccessVisible(false);
        }}
      />
    </PaywallContext.Provider>
  );
}

export function usePaywall() {
  return useContext(PaywallContext);
}
