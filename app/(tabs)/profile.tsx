import { View, Text, Pressable, ScrollView, StyleSheet, Alert, DevSettings } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../utils/supabase';
import { Globe, BarChart2, LogOut, ChevronRight } from 'lucide-react-native';
import { useDialect } from '../../contexts/DialectContext';
import { getLevelFromXP, getXPProgress, getXPToNextLevel, LEVELS } from '../../constants/levels';
import { version } from '../../package.json';
import { theme } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [streakCount, setStreakCount] = useState(0);
  const { dialect: contextDialect, setDialect: setContextDialect } = useDialect();
  const [xpTotal, setXpTotal] = useState(0);
  const [scenariosCompleted, setScenariosCompleted] = useState(0);
  const [isGuest, setIsGuest] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      setIsGuest(false);
      const { data: user } = await supabase
        .from('users')
        .select('level, dialect, streak_count')
        .eq('id', session.user.id)
        .maybeSingle();

      if (user) {
        setLevel(user.level ?? 'beginner');
        const serverDialect = user.dialect ?? 'gulf';
        if (serverDialect !== contextDialect) {
          setContextDialect(serverDialect);
        }
        setStreakCount(user.streak_count ?? 0);
      }

      const { data: convos } = await supabase
        .from('conversations')
        .select('xp_earned')
        .eq('user_id', session.user.id)
        .eq('status', 'completed');

      if (convos) {
        setXpTotal(convos.reduce((sum, c) => sum + (c.xp_earned ?? 0), 0));
      }

      const { data: progress } = await supabase
        .from('scenario_progress')
        .select('id, completed')
        .eq('user_id', session.user.id);

      if (progress) {
        const completed = progress.filter(p => p.completed === true);
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
        { text: '🇦🇪 Gulf Arabic', onPress: () => updateDialect('gulf') },
        { text: '🇪🇬 Egyptian Arabic', onPress: () => updateDialect('egyptian') },
        { text: '🌍 Modern Standard', onPress: () => updateDialect('msa') },
        { text: '🇱🇧 Levantine (Coming Soon)', onPress: () => {} },
        { text: '🇲🇦 Maghrebi (Coming Soon)', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateDialect = async (newDialect: string) => {
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

  const getDialectLabel = () => {
    const labels: Record<string, string> = {
      gulf: 'Gulf Arabic',
      egyptian: 'Egyptian',
      msa: 'Modern Standard',
      levantine: 'Levantine',
      maghrebi: 'Maghrebi',
    };
    return labels[contextDialect] ?? contextDialect;
  };

  const getInitial = () => userName ? userName[0].toUpperCase() : '?';

  const currentLevel = getLevelFromXP(xpTotal);
  const xpProgress = getXPProgress(xpTotal);
  const xpToNext = getXPToNextLevel(xpTotal);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.pageTitle}>Profile</Text>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{getInitial()}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>{userName || 'Friend'}</Text>
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

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingsCard}>
          <Pressable style={[styles.settingRow, styles.settingRowLast]} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <LogOut color={theme.colors.accentDanger} size={16} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.accentDanger }]}>Log Out</Text>
            </View>
          </Pressable>
        </View>

        {__DEV__ && (
          <>
            {/* TEMP DEV ONLY - remove before production */}
            <Text style={styles.sectionTitle}>Developer</Text>
            <View style={styles.settingsCard}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  scroll: { padding: 20, paddingBottom: 120 },
  pageTitle: { fontSize: theme.fontSize.display, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 16 },
  avatarCard: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: theme.colors.borderDefault, marginBottom: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.accentPrimary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 28, fontWeight: theme.fontWeight.medium, color: theme.colors.bgBase },
  avatarInfo: { flex: 1 },
  avatarName: { fontSize: 20, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
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
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingIcon: { width: 32, height: 32, borderRadius: theme.radii.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bgElevated },
  settingLabel: { fontSize: 15, color: theme.colors.textPrimary, fontWeight: theme.fontWeight.regular },
  settingValue: { fontSize: theme.fontSize.body, color: theme.colors.textTertiary },
  version: { textAlign: 'center', fontSize: theme.fontSize.caption, color: theme.colors.textTertiary, marginTop: 8 },
  xpProgressCard: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: theme.colors.borderDefault },
  xpProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpProgressLabel: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  xpProgressValue: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.textAccent },
  xpProgressBg: { height: 8, backgroundColor: theme.colors.bgBase, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  xpProgressFill: { height: '100%', borderRadius: 4 },
  xpNextLevel: { fontSize: theme.fontSize.label, color: theme.colors.textTertiary },
});
