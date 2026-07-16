import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '../constants/theme';
import { usePremium } from '../contexts/PremiumContext';
import { canAccessContent, TESTING_UNLOCK_ALL } from '../utils/access';
import PaywallModal from './PaywallModal';

type Props = {
  contentId: string | null;
  contentLabel: string;
  children: React.ReactNode;
};

export default function PremiumRouteGate({ contentId, contentLabel, children }: Props) {
  const router = useRouter();
  const {
    isPremium,
    isLoading,
    premiumPackage,
    premiumPrice,
    isPurchasing,
    isRestoring,
    availabilityStatus,
    error,
    purchasePremium,
    restorePurchases,
    refreshCustomerInfo,
  } = usePremium();

  const allowed = canAccessContent(contentId, isPremium);

  const goHome = () => {
    router.replace('/(tabs)' as any);
  };

  const handlePurchase = async () => {
    const unlocked = await purchasePremium();
    if (unlocked) return;
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) return;
  };

  if (TESTING_UNLOCK_ALL || allowed) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.accentPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.loading}>
      <PaywallModal
        visible
        onClose={goHome}
        contentLabel={contentLabel}
        premiumOnly
        price={premiumPrice}
        isPurchasing={isPurchasing}
        isRestoring={isRestoring}
        isPremiumAvailable={Boolean(premiumPackage)}
        availabilityStatus={availabilityStatus}
        error={error}
        onPurchase={handlePurchase}
        onRestore={handleRestore}
        onRefresh={refreshCustomerInfo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
