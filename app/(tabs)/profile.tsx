import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
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
              <View style={[styles.settingIcon, { backgroundColor: '#0d1f1e' }]}>
                <Globe color="#00897B" size={16} />
              </View>
              <Text style={styles.settingLabel}>Dialect</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{getDialectLabel()}</Text>
              <ChevronRight color="#333" size={16} />
            </View>
          </Pressable>

          <Pressable style={styles.settingRow} onPress={handleLevelChange}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#0d1f1e' }]}>
                <BarChart2 color="#00897B" size={16} />
              </View>
              <Text style={styles.settingLabel}>Level</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
              <ChevronRight color="#333" size={16} />
            </View>
          </Pressable>
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingsCard}>
          <Pressable style={styles.settingRow} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#1a0a0a' }]}>
                <LogOut color="#E24B4A" size={16} />
              </View>
              <Text style={[styles.settingLabel, { color: '#E24B4A' }]}>Log Out</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.version}>HeyYusuf v{version} · Made with ❤️ in Dubai</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 16 },
  avatarCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 0.5, borderColor: '#1e1e1e', marginBottom: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#00897B', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  avatarInfo: { flex: 1 },
  avatarName: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  avatarLevel: { fontSize: 13, color: '#00897B', fontWeight: '600', marginTop: 3 },
  signInPrompt: { fontSize: 12, color: '#00897B', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: '#111', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 0.5, borderColor: '#1e1e1e' },
  statIcon: { fontSize: 20 },
  statVal: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  statLabel: { fontSize: 10, color: '#555', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: '#444', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8, marginTop: 4 },
  settingsCard: { backgroundColor: '#111', borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: '#1e1e1e', marginBottom: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, color: '#FFF', fontWeight: '500' },
  settingValue: { fontSize: 13, color: '#555' },
  version: { textAlign: 'center', fontSize: 12, color: '#333', marginTop: 8 },
  xpProgressCard: { backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 0.5, borderColor: '#1e1e1e' },
  xpProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpProgressLabel: { fontSize: 14, fontWeight: '700', color: '#fff' },
  xpProgressValue: { fontSize: 14, fontWeight: '700', color: '#00897B' },
  xpProgressBg: { height: 8, backgroundColor: '#1a1a1a', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  xpProgressFill: { height: '100%', borderRadius: 4 },
  xpNextLevel: { fontSize: 11, color: '#555' },
});
