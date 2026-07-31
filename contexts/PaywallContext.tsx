import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PaywallModal from '../components/PaywallModal';
import type { PremiumPaywallSource } from '../utils/premium';
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
    const result = await purchasePremium();
    if (result === 'success') {
      setPaywallSource(null);
      setContentLabel(undefined);
    }
  }, [purchasePremium]);

  const handleRestore = useCallback(async () => {
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
    </PaywallContext.Provider>
  );
}

export function usePaywall() {
  return useContext(PaywallContext);
}
