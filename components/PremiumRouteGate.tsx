import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { useDialect } from '../contexts/DialectContext';
import { usePremium } from '../contexts/PremiumContext';
import { getContentAccess, TESTING_UNLOCK_ALL, type ContentType } from '../utils/access';
import { getDialectContentMeta } from '../utils/content-resolver';
import { supabase } from '../utils/supabase';
import PaywallModal from './PaywallModal';

type Props = {
  contentId: string | null;
  unitId?: string;
  contentType: ContentType;
  contentLabel: string;
  children: React.ReactNode;
};

export default function PremiumRouteGate({ contentId, unitId, contentType, contentLabel, children }: Props) {
  const router = useRouter();
  const { dialect } = useDialect();
  const [completedContentIds, setCompletedContentIds] = useState<Set<string>>(new Set());
  const [progressLoaded, setProgressLoaded] = useState(false);
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

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const loadCompletedContentIds = async () => {
        try {
          const ids = new Set<string>();
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            const { data: progress } = await supabase
              .from('scenario_progress')
              .select('scenario, completed')
              .eq('user_id', session.user.id);

            progress?.forEach(item => {
              if (item.completed) ids.add(item.scenario);
            });
          }

          const guestProgress = await AsyncStorage.getItem('guest_progress');
          if (guestProgress) {
            const parsed = JSON.parse(guestProgress) as Record<string, boolean>;
            Object.entries(parsed).forEach(([id, completed]) => {
              if (completed) ids.add(id);
            });
          }

          if (!cancelled) setCompletedContentIds(ids);
        } catch (error) {
          console.warn('[access] Failed to load progression state:', error);
          if (!cancelled) setCompletedContentIds(new Set());
        } finally {
          if (!cancelled) setProgressLoaded(true);
        }
      };

      setProgressLoaded(false);
      loadCompletedContentIds();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const routeMeta = getDialectContentMeta(dialect, contentId, contentType);
  const access = getContentAccess({
    contentId,
    unitId: unitId ?? routeMeta?.unitId,
    contentType,
    dialect,
    isPremium,
    isTestingUnlocked: TESTING_UNLOCK_ALL,
    completedContentIds,
  });

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

  if (access.allowed) {
    return <>{children}</>;
  }

  if (!progressLoaded || isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.accentPrimary} />
      </View>
    );
  }

  if (access.reason === 'previous_incomplete' || access.reason === 'unavailable') {
    return (
      <View style={styles.locked}>
        <Text style={styles.lockTitle}>
          {access.reason === 'unavailable' ? 'Content unavailable' : 'Complete previous lesson'}
        </Text>
        <Text style={styles.lockText}>
          {access.reason === 'unavailable'
            ? `${contentLabel} is not available for this dialect yet.`
            : `Finish the previous activity first, then ${contentLabel} will unlock.`}
        </Text>
        <Pressable style={styles.homeButton} onPress={goHome}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
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
  locked: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  lockTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  lockText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.body,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  homeButton: {
    backgroundColor: theme.colors.accentPrimary,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  homeButtonText: {
    color: theme.colors.bgBase,
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
  },
});
