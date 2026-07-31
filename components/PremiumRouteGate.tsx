import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { useDialect } from '../contexts/DialectContext';
import { usePaywall } from '../contexts/PaywallContext';
import { usePremium } from '../contexts/PremiumContext';
import { getContentAccess, TESTING_UNLOCK_ALL, type ContentType } from '../utils/access';
import { getDialectContentMeta } from '../utils/content-resolver';
import { supabase } from '../utils/supabase';
import { getLocalCompletionIds } from '../utils/offline-progress';
import { getConnectivitySnapshot } from '../utils/connectivity-state';

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
  const { isPremium, isLoading } = usePremium();
  const { openPaywall } = usePaywall();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const loadCompletedContentIds = async () => {
        try {
          const ids = new Set<string>();
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            (await getLocalCompletionIds(session.user.id)).forEach(id => ids.add(id));
            const connectivity = getConnectivitySnapshot();
            if (!connectivity.isHydrated || connectivity.isOnline) {
              const { data: progress, error } = await supabase
                .from('scenario_progress')
                .select('scenario_id, completed_count')
                .eq('user_id', session.user.id);

              if (error) {
                if (__DEV__) console.warn('[access] Remote progression unavailable; using local snapshot.');
              } else {
                progress?.forEach(item => {
                  if ((item.completed_count ?? 0) > 0) ids.add(item.scenario_id);
                });
              }
            }
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

  useEffect(() => {
    if (progressLoaded && !isLoading && access.reason === 'premium_required') {
      openPaywall('route_gate', { contentLabel });
    }
  }, [access.reason, contentLabel, isLoading, openPaywall, progressLoaded]);

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
    <View style={styles.locked}>
      <Text style={styles.lockTitle}>Premium required</Text>
      <Text style={styles.lockText}>{contentLabel} is included with HeyYusuf Premium.</Text>
      <Pressable
        style={styles.homeButton}
        onPress={() => openPaywall('route_gate', { contentLabel })}
        accessibilityRole="button"
        accessibilityLabel="View HeyYusuf Premium"
      >
        <Text style={styles.homeButtonText}>View Premium</Text>
      </Pressable>
      <Pressable style={styles.backButton} onPress={goHome}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </Pressable>
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
  backButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.body,
  },
});
