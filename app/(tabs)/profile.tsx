import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { AlertCircle, BarChart2, CheckCircle2, ChevronRight, Crown, Download, Globe, LogOut, RefreshCw, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, DevSettings, Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumDiagnosticsPanel from '../../components/PremiumDiagnosticsPanel';
import { getLevelFromXP, getXPProgress, getXPToNextLevel, LEVELS } from '../../constants/levels';
import { theme } from '../../constants/theme';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import { useDialect } from '../../contexts/DialectContext';
import { usePaywall } from '../../contexts/PaywallContext';
import { usePremium } from '../../contexts/PremiumContext';
import { useXP } from '../../contexts/XPContext';
import { version } from '../../package.json';
import {
  CAN_USE_INTERNAL_TESTING_ACCESS,
  getTestingUnlockAllState,
  setTestingUnlockAllOverride,
} from '../../utils/access';
import type { OfflineDialect } from '../../utils/offline-pack';
import { recordPremiumDiagnostic } from '../../utils/premium-diagnostics';
import { supabase } from '../../utils/supabase';
import { getConnectivitySnapshot } from '../../utils/connectivity-state';
import { ACCOUNT_DELETION_CONFIRMATION, clearDeletedAccountLocalState, deleteCurrentAccount } from '../../utils/account-deletion';
import { LEGAL_CONFIG, openExternalDestination, openSupport } from '../../utils/legal';

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [streakCount, setStreakCount] = useState(0);
  const { dialect: contextDialect, setDialect: setContextDialect } = useDialect();
  const { xp: xpTotal, premiumStatus } = useXP();
  const { restorePurchases, isRestoring, error: premiumError, managementURL, disconnectDeletedAccount } = usePremium();
  const isPremium = premiumStatus === 'premium';
  const isPremiumLoading = premiumStatus === 'loading';
  const { openPaywall } = usePaywall();
  const {
    isOnline,
    offlinePacks,
    downloadStates,
    downloadPack,
    removePack,
    getPackManifestInfo,
    isPackUpdateAvailable,
  } = useConnectivity();
  const [scenariosCompleted, setScenariosCompleted] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [testingUnlockEnabled, setTestingUnlockEnabled] = useState(getTestingUnlockAllState());
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    recordPremiumDiagnostic({
      operation: 'profile.render_status',
      source: 'profile_render',
      previousPremiumStatus: premiumStatus,
      nextPremiumStatus: premiumStatus,
      accepted: true,
      updatesPremiumState: false,
    });
  }, [premiumStatus]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    setTestingUnlockEnabled(getTestingUnlockAllState());
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      setIsGuest(false);
      const connectivity = getConnectivitySnapshot();
      const canUseNetwork = !connectivity.isHydrated || connectivity.isOnline;
      const { data: user } = canUseNetwork
        ? await supabase
            .from('users')
            .select('level, dialect, streak_count')
            .eq('id', session.user.id)
            .maybeSingle()
        : { data: null };

      if (user) {
        setLevel(user.level ?? 'beginner');
        const serverDialect = user.dialect ?? 'gulf';
        if (serverDialect !== contextDialect) {
          setContextDialect(serverDialect);
        }
        setStreakCount(user.streak_count ?? 0);
      }

      // XP comes from XPContext (reads users.xp, includes both lessons and scenarios)
      const { data: progress } = canUseNetwork
        ? await supabase
            .from('scenario_progress')
            .select('id, completed_count')
            .eq('user_id', session.user.id)
        : { data: null };

      if (progress) {
        const completed = progress.filter(p => (p.completed_count ?? 0) > 0);
        setScenariosCompleted(completed.length);
      }
    } else {
      setIsGuest(true);
    }

    const name = await AsyncStorage.getItem('wizard_name');
    if (name) setUserName(name);
  };

  const handleDialectChange = () => {
    Alert.alert(
      'Change Dialect',
      'Select your preferred Arabic dialect',
      [
        { text: '🌍 Modern Standard Arabic', onPress: () => updateDialect('msa') },
        { text: '🇦🇪 Gulf Arabic', onPress: () => updateDialect('gulf') },
        { text: '🇪🇬 Egyptian Arabic', onPress: () => updateDialect('egyptian') },
        { text: '🇲🇦 Maghrebi (Coming Soon)', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateDialect = async (newDialect: string) => {
    if (newDialect === contextDialect) return;
    await setContextDialect(newDialect);
  };

  const handleLevelChange = () => {
    Alert.alert(
      'Change Level',
      'Select your current level',
      [
        { text: 'Beginner', onPress: () => updateLevel('beginner') },
        { text: 'Intermediate', onPress: () => updateLevel('intermediate') },
        { text: 'Advanced', onPress: () => updateLevel('advanced') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateLevel = async (newLevel: string) => {
    setLevel(newLevel);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('users').update({ level: newLevel }).eq('id', session.user.id);
    }
    await AsyncStorage.setItem('wizard_level', newLevel);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            // wizard_complete stays set → _layout routes to /(tabs) as guest
            router.replace('/(tabs)');
          }
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    setDeleteStep(0);
    setDeletePhrase('');
    setDeleteError('');
  };

  const handleDeleteAccount = async () => {
    if (isDeleting || deletePhrase !== ACCOUNT_DELETION_CONFIRMATION) return;
    setIsDeleting(true);
    setDeleteError('');
    const result = await deleteCurrentAccount({
      isOnline: () => getConnectivitySnapshot().isOnline,
      getAuthenticatedUserId: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user.id ?? null;
      },
      deleteRemoteAccount: async () => {
        const { data, error } = await supabase.functions.invoke('delete-account', { body: {} });
        if (error) throw error;
        return data as { deleted: boolean };
      },
      clearLocalState: clearDeletedAccountLocalState,
      disconnectPremium: disconnectDeletedAccount,
      signOut: async () => { await supabase.auth.signOut({ scope: 'local' }); },
      navigateToWelcome: () => router.replace('/'),
    });
    setIsDeleting(false);
    if (result.status === 'deleted') {
      setDeleteStep(0);
      return;
    }
    const message = result.status === 'blocked' && result.reason === 'offline'
      ? 'Connect to the internet before deleting your account.'
      : result.status === 'blocked' && result.reason === 'identity_changed'
        ? 'The signed-in account changed. No local data was cleared.'
        : 'We could not delete your account. Nothing was cleared from this device. Please try again.';
    setDeleteError(message);
  };

  const handleResetOnboarding = async () => {
    const onboardingKeys = [
      'wizard_complete',
      'wizard_complete_date',
      'wizard_name',
      'wizard_dialect',
      'wizard_level',
      'guest_expiry_warning',
    ];
    await AsyncStorage.multiRemove(onboardingKeys);
    console.log('[dev] onboarding reset keys cleared:', onboardingKeys);
    Alert.alert('Onboarding reset. Reloading...');
    router.replace('/');
    if (__DEV__) {
      setTimeout(() => DevSettings.reload(), 500);
    }
  };

  const handleTestingUnlockToggle = async (enabled: boolean) => {
    const applied = await setTestingUnlockAllOverride(enabled);
    setTestingUnlockEnabled(applied);
    Alert.alert(
      applied ? 'Development override enabled' : 'Development override disabled',
      applied
        ? 'All content is temporarily unlocked in this development build.'
        : 'Locked content now uses the normal free/premium access rules.'
    );
  };

  const getDialectLabel = () => {
    const labels: Record<string, string> = {
      gulf: 'Gulf Arabic',
      egyptian: 'Egyptian',
      msa: 'Modern Standard',
      maghrebi: 'Maghrebi (Coming Soon)',
    };
    return labels[contextDialect] ?? contextDialect;
  };

  const getInitial = () => userName ? userName[0].toUpperCase() : '?';

  const currentLevel = getLevelFromXP(xpTotal);
  const xpProgress = getXPProgress(xpTotal);
  const xpToNext = getXPToNextLevel(xpTotal);

  const DIALECTS: Array<{ id: OfflineDialect; label: string }> = [
    { id: 'msa', label: 'Modern Standard Arabic' },
    { id: 'gulf', label: 'Gulf Arabic' },
    { id: 'egyptian', label: 'Egyptian Arabic' },
  ];

  const handleDownloadPack = async (dialect: OfflineDialect) => {
    try {
      await downloadPack(dialect);
    } catch (error) {
      if (__DEV__) console.warn('[offline-pack] Profile download failed.', error);
    }
  };

  const handleRemovePack = (dialect: OfflineDialect) => {
    Alert.alert(
      'Remove offline pack?',
      'You can download it again later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePack(dialect);
            } catch (error) {
              Alert.alert('Remove failed', error instanceof Error ? error.message : 'Could not remove the offline pack.');
            }
          },
        },
      ]
    );
  };

  const handleRestorePurchases = async () => {
    if (!isOnline) {
      Alert.alert('Internet connection required', 'Reconnect to restore purchases.');
      return;
    }
    const result = await restorePurchases();
    if (result === 'error') return;
    Alert.alert(
      result === 'success' ? 'Premium restored' : 'No active subscription found',
      result === 'success'
        ? 'Your premium access is active on this device.'
        : 'No active subscription was found for this store account.'
    );
  };

  const handleManageSubscription = async () => {
    if (!isOnline) {
      Alert.alert('Internet connection required', 'Reconnect to manage your subscription.');
      return;
    }
    if (!managementURL) return;
    await openExternalDestination(managementURL, {
      canOpenURL: Linking.canOpenURL,
      openURL: Linking.openURL,
      showError: (title, message) => Alert.alert(title, message),
    });
  };

  const openExternalLink = async (url: string) => {
    if (!isOnline) {
      Alert.alert('Internet connection required', 'Reconnect to open this page.');
      return;
    }
    await openExternalDestination(url, {
      canOpenURL: Linking.canOpenURL,
      openURL: Linking.openURL,
      showError: (title, message) => Alert.alert(title, message),
    });
  };
  const contactSupport = () => openSupport({
    canOpenURL: Linking.canOpenURL,
    openURL: Linking.openURL,
    showError: (title, message) => Alert.alert(title, message),
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.pageTitle}>Profile</Text>

        {/* Avatar Card */}
        <View style={[styles.avatarCard, isPremium && styles.avatarCardPremium]}>
          <View style={[styles.avatar, isPremium && styles.avatarPremium]}>
            <Text style={styles.avatarInitial}>{getInitial()}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <View style={styles.avatarNameRow}>
              <Text style={styles.avatarName}>{userName || 'Friend'}</Text>
              {isPremium && (
                <View style={styles.profilePremiumBadge}>
                  <Crown color={theme.colors.accentWarm} size={12} />
                  <Text style={styles.profilePremiumBadgeText}>PREMIUM</Text>
                </View>
              )}
            </View>
            <Text style={styles.avatarLevel}>
              {currentLevel.icon} {currentLevel.name} · {getDialectLabel()}
            </Text>
            {isGuest && (
              <Pressable onPress={() => router.push('/login' as any)}>
                <Text style={styles.signInPrompt}>Sign in to save progress →</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statVal}>{streakCount}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statVal}>{xpTotal}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>☕</Text>
            <Text style={styles.statVal}>{scenariosCompleted}</Text>
            <Text style={styles.statLabel}>Scenarios</Text>
          </View>
        </View>

        {/* XP Progress */}
        <View style={styles.xpProgressCard}>
          <View style={styles.xpProgressHeader}>
            <Text style={styles.xpProgressLabel}>{currentLevel.icon} {currentLevel.name}</Text>
            <Text style={styles.xpProgressValue}>{xpTotal} XP</Text>
          </View>
          <View style={styles.xpProgressBg}>
            <View style={[styles.xpProgressFill, { width: `${xpProgress}%`, backgroundColor: currentLevel.color }]} />
          </View>
          {xpToNext > 0 && (
            <Text style={styles.xpNextLevel}>
              {xpToNext} XP to {LEVELS[LEVELS.indexOf(currentLevel) + 1]?.name}
            </Text>
          )}
        </View>

        {/* Learning Settings */}
        <Text style={styles.sectionTitle}>Learning</Text>
        <View style={styles.settingsCard}>
          <Pressable style={styles.settingRow} onPress={handleDialectChange}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Globe color={theme.colors.accentPrimary} size={16} />
              </View>
              <Text style={styles.settingLabel}>Dialect</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{getDialectLabel()}</Text>
              <ChevronRight color={theme.colors.textTertiary} size={16} />
            </View>
          </Pressable>

          <Pressable style={[styles.settingRow, styles.settingRowLast]} onPress={handleLevelChange}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <BarChart2 color={theme.colors.accentPrimary} size={16} />
              </View>
              <Text style={styles.settingLabel}>Level</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
              <ChevronRight color={theme.colors.textTertiary} size={16} />
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Premium</Text>
        {isPremiumLoading ? (
          <View style={styles.premiumHydrationCard} accessibilityLabel="Checking membership">
            <ActivityIndicator color={theme.colors.textTertiary} size="small" />
            <View style={styles.premiumHydrationCopy}>
              <View style={[styles.premiumHydrationLine, { width: '46%' }]} />
              <View style={[styles.premiumHydrationLine, { width: '76%' }]} />
            </View>
          </View>
        ) : <View style={styles.settingsCard}>
          <Pressable
            style={[styles.settingRow, isPremium && styles.premiumMemberRow]}
            onPress={isPremium ? handleManageSubscription : () => openPaywall('profile_membership', { contentLabel: 'Membership' })}
            disabled={isPremium && !managementURL}
            accessibilityRole="button"
            accessibilityLabel={isPremium ? 'Manage Premium subscription' : 'Open HeyYusuf Premium'}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, isPremium && styles.premiumMemberIcon]}>
                <Crown color="#F59E0B" size={16} />
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Membership</Text>
                <Text style={styles.offlineMeta}>
                  {isPremium
                    ? 'All lessons, scenarios, practice modes, and offline audio are unlocked.'
                    : 'Free plan includes Units 1-3 and previews in Units 4-5.'}
                </Text>
                {CAN_USE_INTERNAL_TESTING_ACCESS && testingUnlockEnabled && (
                  <Text style={styles.internalAccessLabel}>Development override active</Text>
                )}
              </View>
            </View>
            <Text style={[styles.premiumStatus, isPremium && styles.premiumStatusActive]}>
              {isPremium ? 'Premium Member' : 'Free'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.settingRow, !managementURL && styles.settingRowLast]}
            onPress={handleRestorePurchases}
            disabled={isRestoring || isPremiumLoading}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <RefreshCw color={theme.colors.accentPrimary} size={16} />
              </View>
              <Text style={styles.settingLabel}>
                {isPremiumLoading ? 'Checking Premium...' : isRestoring ? 'Restoring...' : 'Restore Purchases'}
              </Text>
            </View>
            <ChevronRight color={theme.colors.textTertiary} size={16} />
          </Pressable>

          {managementURL && (
            <Pressable style={[styles.settingRow, styles.settingRowLast]} onPress={handleManageSubscription}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Crown color={theme.colors.accentPrimary} size={16} />
                </View>
                <Text style={styles.settingLabel}>Manage Subscription</Text>
              </View>
              <ChevronRight color={theme.colors.textTertiary} size={16} />
            </Pressable>
          )}

          {premiumError && <Text style={styles.premiumError}>{premiumError}</Text>}
        </View>}

        <PremiumDiagnosticsPanel />

        <Text style={styles.sectionTitle}>Offline audio</Text>
        {isPremiumLoading ? (
          <View style={styles.premiumHydrationCard} accessibilityLabel="Checking offline access">
            <ActivityIndicator color={theme.colors.textTertiary} size="small" />
            <View style={styles.premiumHydrationCopy}>
              <View style={[styles.premiumHydrationLine, { width: '38%' }]} />
              <View style={[styles.premiumHydrationLine, { width: '68%' }]} />
            </View>
          </View>
        ) : isPremium ? (
          <View style={styles.settingsCard}>
            {DIALECTS.map((dialect, index) => {
              const pack = offlinePacks[dialect.id];
              const downloadState = downloadStates[dialect.id];
              const isCurrentDialect = contextDialect === dialect.id;
              const isDownloading = downloadState.status === 'downloading';
              const progressPct = Math.round(downloadState.progress * 100);
              const manifest = getPackManifestInfo(dialect.id);
              const updateAvailable = isPackUpdateAvailable(dialect.id);
              const isDownloaded = pack.downloaded && !updateAvailable;
              const packMegabytes = pack.totalBytes > 0 ? (pack.totalBytes / (1024 * 1024)).toFixed(1) : null;
              const expectedMegabytes = manifest.expectedBytes > 0
                ? (manifest.expectedBytes / (1024 * 1024)).toFixed(1)
                : null;
              const statusText = isDownloading
                ? `Downloading ${downloadState.completed} of ${downloadState.total} (${progressPct}%)`
                : downloadState.status === 'error'
                  ? downloadState.error ?? 'Download paused. Tap Retry.'
                  : updateAvailable
                    ? `Update available · ${manifest.fileCount} audio files`
                    : isDownloaded
                      ? `Downloaded · ${pack.assetCount} files${packMegabytes ? ` · ${packMegabytes} MB` : ''}`
                      : manifest.available
                        ? `${manifest.fileCount} audio files${expectedMegabytes ? ` · ${expectedMegabytes} MB` : ''}`
                        : 'Offline pack not available yet';

              return (
                <View
                  key={dialect.id}
                  style={[styles.settingRow, index === DIALECTS.length - 1 && styles.settingRowLast]}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <Download color={theme.colors.accentPrimary} size={16} />
                    </View>
                    <View style={styles.offlinePackCopy}>
                      <Text style={styles.settingLabel}>{dialect.label}</Text>
                      <Text style={[styles.offlineMeta, downloadState.status === 'error' && styles.offlineErrorText]}>
                        {statusText}
                      </Text>
                      {isDownloading && (
                        <View style={styles.offlineProgressTrack}>
                          <View style={[styles.offlineProgressFill, { width: `${progressPct}%` }]} />
                        </View>
                      )}
                      {isCurrentDialect && <Text style={styles.currentDialectTag}>Current dialect</Text>}
                    </View>
                  </View>

                  {!manifest.available ? (
                    <AlertCircle color={theme.colors.textTertiary} size={18} />
                  ) : isDownloading ? (
                    <View style={styles.offlineActionProgress} accessibilityLabel={`Downloading ${downloadState.completed} of ${downloadState.total}`}>
                      <ActivityIndicator color={theme.colors.accentPrimary} size="small" />
                      <Text style={styles.offlineActionProgressText}>{progressPct}%</Text>
                    </View>
                  ) : isDownloaded ? (
                    <View style={styles.offlineDownloadedActions}>
                      <View style={styles.offlineDownloadedStatus}>
                        <CheckCircle2 color={theme.colors.accentSuccess} size={15} />
                        <Text style={styles.offlineDownloadedText}>Downloaded</Text>
                      </View>
                      <Pressable
                        style={styles.offlineRemoveButton}
                        onPress={() => handleRemovePack(dialect.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${dialect.label} offline pack`}
                      >
                        <Trash2 color={theme.colors.accentDanger} size={15} />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.offlineActionPrimary}
                      onPress={() => handleDownloadPack(dialect.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`${downloadState.status === 'error' ? 'Retry' : updateAvailable ? 'Update' : 'Download'} ${dialect.label} offline pack`}
                    >
                      <Text style={styles.offlineActionPrimaryText}>
                        {downloadState.status === 'error' ? 'Retry' : updateAvailable ? 'Update' : 'Download'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.offlineTeaserCard}>
            <Text style={styles.offlineTeaserTitle}>Offline packs are premium only</Text>
            <Text style={styles.offlineTeaserText}>Members can prepare Gulf, Egyptian, and MSA audio packs for offline use. Free users need an internet connection.</Text>
            <Pressable
              style={styles.offlineTeaserButton}
              onPress={() => openPaywall('offline_audio', { contentLabel: 'Offline audio packs' })}
              accessibilityRole="button"
              accessibilityLabel="Explore HeyYusuf Premium"
            >
              <Text style={styles.offlineTeaserButtonText}>Explore Premium</Text>
            </Pressable>
          </View>
        )}

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingsCard}>
          <Pressable
            style={styles.settingRow}
            onPress={() => openExternalLink(LEGAL_CONFIG.privacyPolicyUrl)}
            accessibilityRole="link"
            accessibilityLabel="Open Privacy Policy"
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <ChevronRight color={theme.colors.textTertiary} size={16} />
          </Pressable>

          <Pressable
            style={styles.settingRow}
            onPress={() => openExternalLink(LEGAL_CONFIG.termsOfUseUrl)}
            accessibilityRole="link"
            accessibilityLabel="Open Terms of Use"
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Terms of Use</Text>
            </View>
            <ChevronRight color={theme.colors.textTertiary} size={16} />
          </Pressable>

          <Pressable
            style={styles.settingRow}
            onPress={contactSupport}
            accessibilityRole="link"
            accessibilityLabel="Open Support"
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Support</Text>
            </View>
            <ChevronRight color={theme.colors.textTertiary} size={16} />
          </Pressable>

          <Pressable style={[styles.settingRow, styles.settingRowLast]} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <LogOut color={theme.colors.accentDanger} size={16} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.accentDanger }]}>Log Out</Text>
            </View>
          </Pressable>
        </View>

        {!isGuest && <>
          <Text style={[styles.sectionTitle, styles.dangerSectionTitle]}>Danger Zone</Text>
          <View style={[styles.settingsCard, styles.dangerCard]}>
            <Pressable style={[styles.settingRow, styles.settingRowLast]} onPress={() => setDeleteStep(1)} accessibilityRole="button">
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}><Trash2 color={theme.colors.accentDanger} size={18} /></View>
                <View style={styles.settingCopy}>
                  <Text style={[styles.settingLabel, { color: theme.colors.accentDanger }]}>Delete Account</Text>
                  <Text style={styles.offlineMeta}>Permanently remove your account and learning data.</Text>
                </View>
              </View>
              <ChevronRight color={theme.colors.accentDanger} size={16} />
            </Pressable>
          </View>
        </>}

        {__DEV__ && (
          <>
            <Text style={styles.sectionTitle}>Developer</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View>
                      <Text style={styles.settingLabel}>Development content override</Text>
                      <Text style={styles.devMeta}>Available only while running a development JavaScript bundle.</Text>
                    </View>
                  </View>
                  <Switch
                    value={testingUnlockEnabled}
                    onValueChange={handleTestingUnlockToggle}
                    accessibilityLabel="Override content locks in development"
                    trackColor={{ false: theme.colors.bgElevated, true: 'rgba(61, 212, 192, 0.35)' }}
                    thumbColor={testingUnlockEnabled ? theme.colors.accentPrimary : theme.colors.textTertiary}
                  />
              </View>

              <Pressable style={[styles.settingRow, styles.settingRowLast]} onPress={handleResetOnboarding}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>Reset onboarding</Text>
                </View>
              </Pressable>
            </View>
          </>
        )}

        <Text style={styles.version}>HeyYusuf v{version} · Made with ❤️ in Dubai</Text>

      </ScrollView>
      <Modal visible={deleteStep > 0} transparent animationType="fade" onRequestClose={closeDeleteDialog}>
        <View style={styles.modalBackdrop}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteTitle}>Delete your account?</Text>
            <Text style={styles.deleteBody}>
              This permanently deletes your profile, learning progress, XP, conversations, and account data. Deleting HeyYusuf does not cancel an active subscription. Manage or cancel it separately through Google Play or the App Store. Store purchase records are not erased.
            </Text>
            {deleteStep === 2 && <>
              <Text style={styles.deletePrompt}>Type DELETE to confirm</Text>
              <TextInput
                style={styles.deleteInput}
                value={deletePhrase}
                onChangeText={setDeletePhrase}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isDeleting}
                accessibilityLabel="Type DELETE to confirm account deletion"
              />
            </>}
            {!!deleteError && <Text style={styles.deleteError}>{deleteError}</Text>}
            <View style={styles.deleteActions}>
              <Pressable style={styles.deleteCancel} onPress={closeDeleteDialog} disabled={isDeleting}>
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </Pressable>
              {deleteStep === 1 ? (
                <Pressable style={styles.deleteDanger} onPress={() => setDeleteStep(2)}>
                  <Text style={styles.deleteDangerText}>Continue</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.deleteDanger, (deletePhrase !== ACCOUNT_DELETION_CONFIRMATION || isDeleting) && styles.deleteDisabled]}
                  onPress={handleDeleteAccount}
                  disabled={deletePhrase !== ACCOUNT_DELETION_CONFIRMATION || isDeleting}
                >
                  {isDeleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteDangerText}>Delete permanently</Text>}
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  scroll: { padding: 20, paddingBottom: 120 },
  pageTitle: { fontSize: theme.fontSize.display, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 16 },
  avatarCard: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: theme.colors.borderDefault, marginBottom: 14 },
  avatarCardPremium: { borderColor: `${theme.colors.accentWarm}66`, backgroundColor: `${theme.colors.accentWarm}08` },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.accentPrimary, alignItems: 'center', justifyContent: 'center' },
  avatarPremium: { borderWidth: 2, borderColor: theme.colors.accentWarm },
  avatarInitial: { fontSize: 28, fontWeight: theme.fontWeight.medium, color: theme.colors.bgBase },
  avatarInfo: { flex: 1 },
  avatarNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  avatarName: { fontSize: 20, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  profilePremiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: theme.radii.pill, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: `${theme.colors.accentWarm}16`, borderWidth: 1, borderColor: `${theme.colors.accentWarm}55` },
  profilePremiumBadgeText: { color: theme.colors.accentWarm, fontSize: 9, fontWeight: theme.fontWeight.medium },
  avatarLevel: { fontSize: theme.fontSize.body, color: theme.colors.textAccent, fontWeight: theme.fontWeight.regular, marginTop: 3 },
  signInPrompt: { fontSize: theme.fontSize.caption, color: theme.colors.textAccent, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.md, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: theme.colors.borderDefault },
  statIcon: { fontSize: 20 },
  statVal: { fontSize: theme.fontSize.display, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  statLabel: { fontSize: theme.fontSize.label, color: theme.colors.textTertiary, fontWeight: theme.fontWeight.regular, textTransform: 'uppercase', letterSpacing: 1.5 },
  sectionTitle: { fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.medium, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, marginTop: 4 },
  settingsCard: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.borderDefault, marginBottom: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.borderDefault },
  settingRowLast: { borderBottomWidth: 0 },
  settingLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingCopy: { flex: 1 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingIcon: { width: 32, height: 32, borderRadius: theme.radii.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bgElevated },
  premiumMemberRow: { backgroundColor: `${theme.colors.accentWarm}08`, borderBottomColor: `${theme.colors.accentWarm}33` },
  premiumMemberIcon: { backgroundColor: `${theme.colors.accentWarm}16`, borderWidth: 1, borderColor: `${theme.colors.accentWarm}44` },
  settingLabel: { fontSize: 15, color: theme.colors.textPrimary, fontWeight: theme.fontWeight.regular },
  settingValue: { fontSize: theme.fontSize.body, color: theme.colors.textTertiary },
  premiumStatus: { maxWidth: 92, fontSize: 13, fontWeight: theme.fontWeight.medium, color: theme.colors.textTertiary, textAlign: 'right' },
  premiumStatusActive: { color: '#F59E0B' },
  internalAccessLabel: { fontSize: theme.fontSize.caption, color: theme.colors.accentWarm, marginTop: 4, fontWeight: theme.fontWeight.medium },
  devMeta: { fontSize: theme.fontSize.label, color: theme.colors.accentWarm, marginTop: 3, lineHeight: 17 },
  premiumError: { color: theme.colors.accentDanger, fontSize: 13, lineHeight: 18, paddingHorizontal: 14, paddingBottom: 14 },
  premiumHydrationCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.bgSurface,
  },
  premiumHydrationCopy: { flex: 1, gap: 8 },
  premiumHydrationLine: { height: 9, borderRadius: 4, backgroundColor: theme.colors.bgElevated },
  offlinePackCopy: { flex: 1, minWidth: 0 },
  offlineMeta: { fontSize: theme.fontSize.label, color: theme.colors.textTertiary, marginTop: 3 },
  offlineErrorText: { color: theme.colors.accentDanger },
  offlineProgressTrack: { height: 4, marginTop: 8, borderRadius: 2, overflow: 'hidden', backgroundColor: theme.colors.bgElevated },
  offlineProgressFill: { height: '100%', borderRadius: 2, backgroundColor: theme.colors.accentPrimary },
  currentDialectTag: { fontSize: theme.fontSize.caption, color: theme.colors.textAccent, marginTop: 4 },
  offlineActionPrimary: { minWidth: 96, height: 38, borderRadius: theme.radii.md, backgroundColor: theme.colors.accentPrimary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  offlineActionPrimaryText: { color: theme.colors.bgBase, fontSize: 13, fontWeight: theme.fontWeight.medium },
  offlineActionProgress: { width: 62, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 3 },
  offlineActionProgressText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
  offlineDownloadedActions: { alignItems: 'flex-end', gap: 8 },
  offlineDownloadedStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  offlineDownloadedText: { color: theme.colors.accentSuccess, fontSize: theme.fontSize.caption, fontWeight: theme.fontWeight.medium },
  offlineRemoveButton: { width: 38, height: 38, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: `${theme.colors.accentDanger}66`, alignItems: 'center', justifyContent: 'center' },
  offlineTeaserCard: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 18, borderWidth: 1, borderColor: theme.colors.borderDefault, marginBottom: 14 },
  offlineTeaserTitle: { fontSize: 16, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 8 },
  offlineTeaserText: { fontSize: 14, lineHeight: 20, color: theme.colors.textSecondary, marginBottom: 14 },
  offlineTeaserButton: { height: 46, borderRadius: theme.radii.md, backgroundColor: theme.colors.bgElevated, borderWidth: 1, borderColor: theme.colors.borderAccent, alignItems: 'center', justifyContent: 'center' },
  offlineTeaserButtonText: { color: theme.colors.textAccent, fontSize: 14, fontWeight: theme.fontWeight.medium },
  version: { textAlign: 'center', fontSize: theme.fontSize.caption, color: theme.colors.textTertiary, marginTop: 8 },
  xpProgressCard: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: theme.colors.borderDefault },
  xpProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpProgressLabel: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  xpProgressValue: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.textAccent },
  xpProgressBg: { height: 8, backgroundColor: theme.colors.bgBase, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  xpProgressFill: { height: '100%', borderRadius: 4 },
  xpNextLevel: { fontSize: theme.fontSize.label, color: theme.colors.textTertiary },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: 24 },
  deleteModal: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: `${theme.colors.accentDanger}88`, padding: 20 },
  deleteTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: theme.fontWeight.medium, marginBottom: 10 },
  deleteBody: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22 },
  deletePrompt: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: theme.fontWeight.medium, marginTop: 18, marginBottom: 8 },
  deleteInput: { color: theme.colors.textPrimary, backgroundColor: theme.colors.bgBase, borderWidth: 1, borderColor: theme.colors.borderDefault, borderRadius: theme.radii.md, paddingHorizontal: 14, minHeight: 48, fontSize: 17 },
  deleteError: { color: theme.colors.accentDanger, fontSize: 14, lineHeight: 20, marginTop: 12 },
  deleteActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  deleteCancel: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.borderDefault },
  deleteCancelText: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: theme.fontWeight.medium },
  deleteDanger: { flex: 1.4, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radii.md, backgroundColor: theme.colors.accentDanger, paddingHorizontal: 12 },
  deleteDangerText: { color: '#fff', fontSize: 15, fontWeight: theme.fontWeight.medium },
  deleteDisabled: { opacity: 0.4 },
  dangerSectionTitle: { color: theme.colors.accentDanger },
  dangerCard: { borderColor: `${theme.colors.accentDanger}66` },
});
