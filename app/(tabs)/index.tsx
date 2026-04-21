import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Mic, Coffee, Plane, Car, ShoppingBag,
  Flame, Lock, ChevronRight,
  Play, Check, Activity, BookOpen, User,
  Utensils, ShoppingCart, Heart, Scissors, Pencil, Hash, MapPin,
} from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import { supabase } from '../../utils/supabase';
import { getLevelFromXP } from '../../constants/levels';
import SignUpPrompt from '../../components/SignUpPrompt';
import StreakModal from '../../components/StreakModal';
import MilestoneModal from '../../components/MilestoneModal';
import { getLocalStreakData, getPendingMilestone, clearPendingMilestone } from '../../utils/streak';
import type { StreakData } from '../../utils/streak';
import { useState, useCallback } from 'react';
import { useDialect } from '../../contexts/DialectContext';

// TODO: Re-enable lesson locking and guest restrictions before production release
const TESTING_UNLOCK_ALL = true;

const DIALECT_LABELS: Record<string, string> = {
  gulf: 'Gulf Arabic',
  egyptian: 'Egyptian',
  msa: 'Modern Standard',
  levantine: 'Levantine',
  maghrebi: 'Maghrebi',
};

const DIALECT_FLAGS: Record<string, string> = {
  gulf: '🇦🇪',
  egyptian: '🇪🇬',
  msa: '🌍',
  levantine: '🇱🇧',
  maghrebi: '🇲🇦',
};

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Friend');
  const [streakCount, setStreakCount] = useState(0);
  const [scenarioProgress, setScenarioProgress] = useState<Record<string, boolean>>({});
  const [xpTotal, setXpTotal] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [lessonsToday, setLessonsToday] = useState(0);
  const [level, setLevel] = useState('beginner');
  const { dialect: contextDialect, content, setDialect: setContextDialect } = useDialect();
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [promptReason, setPromptReason] = useState('');
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [pendingMilestone, setPendingMilestone] = useState<number | null>(null);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0, longestStreak: 0, lastActiveDate: null, activeDates: [],
  });

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { data: user } = await supabase
            .from('users')
            .select('xp, streak_count, dialect, level, name')
            .eq('id', session.user.id)
            .maybeSingle();

          if (user) {
            setXpTotal(user.xp ?? 0);
            setStreakCount(user.streak_count ?? 0);
            const serverDialect = user.dialect ?? 'gulf';
            if (serverDialect !== contextDialect) {
              setContextDialect(serverDialect);
            }
            setLevel(user.level ?? 'beginner');
            if (user.name) setUserName(user.name);
          }

          const storedName = await AsyncStorage.getItem('wizard_name');
          if (storedName) setUserName(storedName.split(' ')[0]);

          const { data: progress } = await supabase
            .from('scenario_progress')
            .select('scenario, completed')
            .eq('user_id', session.user.id);

          const map: Record<string, boolean> = {};
          if (progress) {
            progress.forEach(p => { map[p.scenario] = p.completed; });
          }
          const guestProgress = await AsyncStorage.getItem('guest_progress');
          if (guestProgress) {
            Object.assign(map, JSON.parse(guestProgress));
          }
          console.log('Loaded progress:', map);
          setScenarioProgress(map);

          const todayStr = new Date().toISOString().split('T')[0];
          const { data: todayProgress } = await supabase
            .from('scenario_progress')
            .select('id')
            .eq('user_id', session.user.id)
            .gte('updated_at', todayStr);

          setLessonsToday(todayProgress?.length ?? 0);
        } else {
          const name = await AsyncStorage.getItem('wizard_name');
          if (name) setUserName(name.split(' ')[0]);
          const d = await AsyncStorage.getItem('wizard_dialect');
          const l = await AsyncStorage.getItem('wizard_level');
          if (d && d !== contextDialect) setContextDialect(d);
          if (l) setLevel(l);
          const guestProg = await AsyncStorage.getItem('guest_progress');
          setScenarioProgress(guestProg ? JSON.parse(guestProg) : {});
          const expiry = await AsyncStorage.getItem('guest_expiry_warning');
          if (expiry === 'true') setShowExpiryWarning(true);
          setIsGuest(true);
        }

        // Load streak data (local AsyncStorage, fast)
        const localStreak = await getLocalStreakData();
        setStreakData(localStreak);
        setStreakCount(localStreak.currentStreak);

        // Check for pending milestone celebration
        const milestone = await getPendingMilestone();
        if (milestone) {
          await clearPendingMilestone();
          setPendingMilestone(milestone);
          setShowMilestoneModal(true);
        }
      };

      loadData();
    }, [])
  );

  // When TESTING_UNLOCK_ALL is true, treat every user as logged-in with no prerequisites
  const effectiveIsGuest = TESTING_UNLOCK_ALL ? false : isGuest;

  const getStatus = (scenario: string, prerequisite?: string): 'completed' | 'current' | 'locked' => {
    if (scenarioProgress[scenario]) return 'completed';
    if (TESTING_UNLOCK_ALL) return 'current';
    if (!prerequisite || scenarioProgress[prerequisite]) return 'current';
    return 'locked';
  };

  const questComplete = lessonsToday >= 1;
  const dialectFlag = DIALECT_FLAGS[contextDialect] ?? '🌍';
  const dialectLabel = DIALECT_LABELS[contextDialect] ?? contextDialect;
  const currentLevel = getLevelFromXP(xpTotal);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">Ahlan, {userName}!</Text>
            <Text style={styles.dialectBadge}>{dialectFlag} {dialectLabel} · {currentLevel.icon} {currentLevel.name}</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={[styles.statPill, streakCount === 0 && styles.statPillDim]}
              onPress={() => setShowStreakModal(true)}
            >
              <Flame
                color={streakCount > 0 ? '#FF9600' : '#444'}
                size={14}
                fill={streakCount > 0 ? '#FF9600' : '#444'}
              />
              <Text style={[styles.statPillText, streakCount === 0 && { color: '#555' }]}>
                {streakCount}
              </Text>
            </Pressable>
            <View style={styles.statPill}>
              <Text style={{ fontSize: 13 }}>{currentLevel.icon}</Text>
              <Text style={styles.statPillText}>{xpTotal}</Text>
            </View>
          </View>
        </View>

        {/* Guest banner */}
        {isGuest && !showExpiryWarning && (
          <Pressable
            style={styles.guestBanner}
            onPress={() => router.push('/login' as any)}
          >
            <Text style={styles.guestBannerText}>
              💾 Save your progress — Sign in or create account →
            </Text>
          </Pressable>
        )}

        {/* Expiry warning banner */}
        {isGuest && showExpiryWarning && (
          <Pressable
            style={styles.expiryBanner}
            onPress={() => { setPromptReason('save your progress'); setShowSignUpPrompt(true); }}
          >
            <Text style={styles.expiryBannerText}>
              ⚠️ Your progress expires soon. Save it now →
            </Text>
          </Pressable>
        )}

        {/* Daily Quest card */}
        <View style={styles.questCard}>
          <View style={styles.questTop}>
            <View style={styles.questLeft}>
              <Text style={styles.questLabel}>DAILY QUEST</Text>
              <Text style={styles.questTitle}>
                {questComplete ? '✓ Quest complete! Come back tomorrow' : 'Complete 1 lesson today'}
              </Text>
            </View>
            <Activity color={questComplete ? '#00732F' : '#00897B'} size={22} />
          </View>
          <View style={styles.questBarRow}>
            <View style={styles.questBarBg}>
              <View style={[
                styles.questBarFill,
                { width: questComplete ? '100%' : '0%', backgroundColor: questComplete ? '#00732F' : '#00897B' }
              ]} />
            </View>
            <Text style={[styles.questFraction, questComplete && { color: '#00732F' }]}>
              {questComplete ? 'Done! ✓' : '0 / 1'}
            </Text>
          </View>
        </View>

        {/* Yusuf Chat card */}
        <Pressable style={styles.yusufCard} onPress={() => router.push('/chat')}>
          <LottieView
            source={require('../../assets/images/animations/yusuf-thinking.json')}
            autoPlay
            loop
            style={{ width: 100, height: 100 }}
          />
          <Text style={styles.yusufTitle}>Free Chat with Yusuf</Text>
          <Text style={styles.yusufSubtitle}>
            Real-time conversation practice. No judgment, just fluency.
          </Text>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>⚡ EARN +10 XP PER MINUTE</Text>
          </View>
        </Pressable>

        {/* Yusuf says */}
        <View style={styles.tipCard}>
          <View style={styles.tipAvatar}>
            <Text style={styles.tipAvatarText}>Y</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipLabel}>💡 Yusuf says</Text>
            <Text style={styles.tipText}>
              Don't stress about the alphabet yet. Just listen and repeat after me — your brain does the rest!
            </Text>
          </View>
        </View>

        {/* Unit 1 */}
        <View style={styles.unitRow}>
          <Text style={styles.unitTitle}>Unit 1: First Words</Text>
        </View>

        <LessonRow
          label="Basic Words"
          meta="Lesson 1 of 3 · 3 mins"
          icon={<BookOpen color="#00897B" size={20} />}
          status={getStatus('basic_words')}
          onPress={() => router.push('/lesson?type=basic_words' as any)}
          comingSoon={!content.availableLessons.includes('basic')}
        />
        <View style={[styles.lessonConnector, scenarioProgress['basic_words'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Common Greetings"
          meta="Lesson 2 of 3 · 3 mins"
          icon={<Mic color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('greetings', 'basic_words')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=greetings' as any);
          }}
          comingSoon={!content.availableLessons.includes('greetings')}
        />
        <View style={[styles.lessonConnector, scenarioProgress['greetings'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Introduce Yourself"
          meta="Lesson 3 of 3 · 4 mins"
          icon={<User color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('intro', 'greetings')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=intro' as any);
          }}
          comingSoon={!content.availableLessons.includes('intro')}
        />
        <View style={[styles.lessonConnector, scenarioProgress['intro'] && { backgroundColor: '#00897B' }]} />

        {/* Unit 1 Quiz */}
        {(() => {
          const quizUnlocked = TESTING_UNLOCK_ALL || (!isGuest && !!scenarioProgress['intro']);
          return (
            <Pressable
              style={[styles.quizButton, !quizUnlocked && styles.quizButtonLocked]}
              onPress={() => {
                if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                if (quizUnlocked) router.push('/quiz' as any);
              }}
            >
              <Text style={styles.quizButtonIcon}>🎯</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.quizButtonTitle, !quizUnlocked && { color: '#666' }]}>Unit 1 Quiz</Text>
                <Text style={[styles.quizButtonSub, !quizUnlocked && { color: '#444' }]}>
                  {effectiveIsGuest ? 'Create account to unlock' : 'Test what you learned · +150 XP'}
                </Text>
              </View>
              {quizUnlocked
                ? <ChevronRight color="#00897B" size={20} />
                : <Lock color="#444" size={18} />}
            </Pressable>
          );
        })()}

        {/* Unit 2 */}
        <View style={[styles.unitRow, { marginTop: 24 }]}>
          <Text style={styles.unitTitle}>Unit 2: Real Life Situations</Text>
        </View>

        <LessonRow
          label="Café Ordering"
          meta="Lesson 1 of 8 · 4 mins"
          icon={<Coffee color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('cafe', 'intro')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro?type=Cafe' as any);
          }}
          comingSoon={!content.availableScenarios.includes('Cafe')}
        />
        <View style={[styles.lessonConnector, scenarioProgress['cafe'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Taxi Ride"
          meta="Lesson 2 of 8 · 4 mins"
          icon={<Car color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('taxi', 'cafe')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-taxi' as any);
          }}
          comingSoon={!content.availableScenarios.includes('Taxi')}
        />
        <View style={[styles.lessonConnector, scenarioProgress['taxi'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Hotel Check-in"
          meta="Lesson 3 of 8 · 3 mins"
          icon={<ShoppingBag color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('hotel', 'taxi')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-hotel' as any);
          }}
          comingSoon={!content.availableScenarios.includes('Hotel')}
        />
        <View style={[styles.lessonConnector, scenarioProgress['hotel'] && { backgroundColor: '#00897B' }]} />

        {/* Unit 2 Quiz · Part 1 — unlocks after Hotel */}
        {(() => {
          const unlocked = TESTING_UNLOCK_ALL || (!isGuest && !!scenarioProgress['hotel']);
          const done = !!scenarioProgress['quiz_u2_p1'];
          return (
            <Pressable
              style={[styles.quizButton, !unlocked && styles.quizButtonLocked, done && styles.quizButtonDone]}
              onPress={() => {
                if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                if (unlocked) router.push('/quiz-unit2?unit=2p1' as any);
              }}
            >
              <Text style={styles.quizButtonIcon}>{done ? '✅' : '🎯'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.quizButtonTitle, !unlocked && { color: '#666' }]}>Unit 2 Quiz · Part 1</Text>
                <Text style={[styles.quizButtonSub, !unlocked && { color: '#444' }]}>
                  {effectiveIsGuest ? 'Create account to unlock' : 'Café, Taxi, Hotel · +150 XP'}
                </Text>
              </View>
              {done
                ? <Check color="#FFD900" size={20} />
                : unlocked
                  ? <ChevronRight color="#00897B" size={20} />
                  : <Lock color="#444" size={18} />}
            </Pressable>
          );
        })()}

        <View style={[styles.lessonConnector, scenarioProgress['quiz_u2_p1'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Restaurant"
          meta="Lesson 4 of 8 · 3 mins"
          icon={<Utensils color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('restaurant', 'quiz_u2_p1')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-restaurant' as any);
          }}
          comingSoon={!content.availableScenarios.includes('Restaurant')}
        />
        <View style={[styles.lessonConnector, scenarioProgress['restaurant'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Supermarket"
          meta="Lesson 5 of 8 · 3 mins"
          icon={<ShoppingCart color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('supermarket', 'restaurant')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-supermarket' as any);
          }}
          comingSoon={!content.availableScenarios.includes('Supermarket')}
        />
        <View style={[styles.lessonConnector, scenarioProgress['supermarket'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Pharmacy"
          meta="Lesson 6 of 8 · 3 mins"
          icon={<Heart color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('pharmacy', 'supermarket')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-pharmacy' as any);
          }}
          comingSoon={!content.availableScenarios.includes('Pharmacy')}
        />
        <View style={[styles.lessonConnector, scenarioProgress['pharmacy'] && { backgroundColor: '#00897B' }]} />

        {/* Unit 2 Quiz · Part 2 — unlocks after Pharmacy */}
        {(() => {
          const unlocked = TESTING_UNLOCK_ALL || (!isGuest && !!scenarioProgress['pharmacy']);
          const done = !!scenarioProgress['quiz_u2_p2'];
          return (
            <Pressable
              style={[styles.quizButton, !unlocked && styles.quizButtonLocked, done && styles.quizButtonDone]}
              onPress={() => {
                if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                if (unlocked) router.push('/quiz-unit2?unit=2p2' as any);
              }}
            >
              <Text style={styles.quizButtonIcon}>{done ? '✅' : '🎯'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.quizButtonTitle, !unlocked && { color: '#666' }]}>Unit 2 Quiz · Part 2</Text>
                <Text style={[styles.quizButtonSub, !unlocked && { color: '#444' }]}>
                  {effectiveIsGuest ? 'Create account to unlock' : 'Restaurant, Supermarket, Pharmacy · +150 XP'}
                </Text>
              </View>
              {done
                ? <Check color="#FFD900" size={20} />
                : unlocked
                  ? <ChevronRight color="#00897B" size={20} />
                  : <Lock color="#444" size={18} />}
            </Pressable>
          );
        })()}

        <View style={[styles.lessonConnector, scenarioProgress['quiz_u2_p2'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Barbershop"
          meta="Lesson 7 of 8 · 3 mins"
          icon={<Scissors color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('barbershop', 'quiz_u2_p2')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-barbershop' as any);
          }}
          comingSoon={!content.availableScenarios.includes('Barbershop')}
        />
        <View style={[styles.lessonConnector, scenarioProgress['barbershop'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Airport"
          meta="Lesson 8 of 8 · 3 mins"
          icon={<Plane color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('airport', 'barbershop')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-airport' as any);
          }}
          comingSoon={!content.availableScenarios.includes('Airport')}
        />

        {/* Unit 3 */}
        <View style={[styles.unitRow, { marginTop: 24 }]}>
          <Text style={styles.unitTitle}>Unit 3: Writing Arabic</Text>
        </View>

        <LessonRow
          label="The ا Family"
          meta="Lesson 1 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={getStatus('alif_family')}
          onPress={() => router.push('/writing?family=alif' as any)}
        />
        <View style={[styles.lessonConnector, scenarioProgress['alif_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The ب Family"
          meta="Lesson 2 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('ba_family', 'alif_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['ba_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The ج Family"
          meta="Lesson 3 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('jeem_family', 'ba_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=jeem' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['jeem_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The د Family"
          meta="Lesson 4 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('dal_family', 'jeem_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=dal' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['dal_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The ر Family"
          meta="Lesson 5 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('ra_family', 'dal_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=ra' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['ra_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The س Family"
          meta="Lesson 6 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('seen_family', 'ra_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=seen' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['seen_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The ص Family"
          meta="Lesson 7 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('sad_family', 'seen_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=sad' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['sad_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The ط Family"
          meta="Lesson 8 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('taa_family', 'sad_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=taa' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['taa_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The ع Family"
          meta="Lesson 9 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('ayn_family', 'taa_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=ayn' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['ayn_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The ف Family"
          meta="Lesson 10 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('fa_family', 'ayn_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=fa' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['fa_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The ك Family"
          meta="Lesson 11 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('kaf_family', 'fa_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=kaf' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['kaf_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The م Family"
          meta="Lesson 12 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('meem_family', 'kaf_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=meem' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['meem_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The ه Family"
          meta="Lesson 13 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('ha_family', 'meem_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=ha' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['ha_family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="The ي Family"
          meta="Lesson 14 of 14 · 3 mins"
          icon={<Pencil color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('ya_family', 'ha_family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/writing?family=ya' as any);
          }}
        />

        {/* Connector from lesson 14 → Unit 3 Quiz */}
        {(() => {
          const ALL_WRITING_FAMILIES = [
            'alif_family', 'ba_family', 'jeem_family', 'dal_family', 'ra_family',
            'seen_family', 'sad_family', 'taa_family', 'ayn_family', 'fa_family',
            'kaf_family', 'meem_family', 'ha_family', 'ya_family',
          ];
          const allFamiliesDone = ALL_WRITING_FAMILIES.every(f => !!scenarioProgress[f]);
          const quizUnlocked = TESTING_UNLOCK_ALL || (!isGuest && allFamiliesDone);
          const quizDone = !!scenarioProgress['quiz_u3'];
          return (
            <>
              <View style={[styles.lessonConnector, scenarioProgress['ya_family'] && { backgroundColor: '#00897B' }]} />
              <LessonRow
                label="Unit 3 Quiz"
                meta="Test what you learned · +150 XP"
                icon={<Pencil color="#00897B" size={20} />}
                status={quizDone ? 'completed' : (effectiveIsGuest ? 'locked' : (quizUnlocked ? 'current' : 'locked'))}
                guestLocked={effectiveIsGuest}
                onPress={() => {
                  if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                  if (quizUnlocked) router.push('/quiz?unit=3' as any);
                }}
              />
            </>
          );
        })()}

        {/* Unit 4 */}
        <View style={[styles.unitRow, { marginTop: 24 }]}>
          <Text style={styles.unitTitle}>Unit 4: Numbers & Counting</Text>
        </View>

        <LessonRow
          label="Numbers 1–5"
          meta="Lesson 1 of 14 · 2 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-1-5')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-1-5' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-1-5'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Numbers 6–10"
          meta="Lesson 2 of 14 · 2 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-6-10', 'numbers-1-5')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-6-10' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-6-10'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Numbers 11–20"
          meta="Lesson 3 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-11-20', 'numbers-6-10')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-11-20' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-11-20'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Tens & Hundreds"
          meta="Lesson 4 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-tens', 'numbers-11-20')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-tens' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-tens'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Talking About Age"
          meta="Lesson 5 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-age', 'numbers-tens')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-age' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-age'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Prices & Money"
          meta="Lesson 6 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-prices', 'numbers-age')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-prices' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-prices'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Phone Numbers"
          meta="Lesson 7 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-phone', 'numbers-prices')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-phone' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-phone'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Telling the Time"
          meta="Lesson 8 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-hours', 'numbers-phone')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-hours' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-hours'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Minutes & Fractions"
          meta="Lesson 9 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-minutes', 'numbers-hours')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-minutes' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-minutes'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Days of the Week"
          meta="Lesson 10 of 14 · 2 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-days', 'numbers-minutes')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-days' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-days'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Months of the Year"
          meta="Lesson 11 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-months', 'numbers-days')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-months' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-months'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Dates & Calendar"
          meta="Lesson 12 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-dates', 'numbers-months')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-dates' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-dates'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Ordinal Numbers"
          meta="Lesson 13 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-ordering', 'numbers-dates')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-ordering' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['numbers-ordering'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Big Numbers"
          meta="Lesson 14 of 14 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('numbers-together', 'numbers-ordering')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=numbers-together' as any);
          }}
        />

        {/* Unit 4 Quiz */}
        {(() => {
          const ALL_U4_LESSONS = [
            'numbers-1-5', 'numbers-6-10', 'numbers-11-20', 'numbers-tens',
            'numbers-age', 'numbers-prices', 'numbers-phone', 'numbers-hours',
            'numbers-minutes', 'numbers-days', 'numbers-months', 'numbers-dates',
            'numbers-ordering', 'numbers-together',
          ];
          const allDone = ALL_U4_LESSONS.every(k => !!scenarioProgress[k]);
          const quizUnlocked = TESTING_UNLOCK_ALL || (!isGuest && allDone);
          const quizDone = !!scenarioProgress['quiz_u4'];
          return (
            <>
              <View style={[styles.lessonConnector, scenarioProgress['numbers-together'] && { backgroundColor: '#00897B' }]} />
              <Pressable
                style={[styles.quizButton, !quizUnlocked && styles.quizButtonLocked, quizDone && styles.quizButtonDone]}
                onPress={() => {
                  if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                  if (quizUnlocked) router.push('/quiz?unit=4' as any);
                }}
              >
                <Text style={styles.quizButtonIcon}>{quizDone ? '✅' : '🎯'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quizButtonTitle, !quizUnlocked && { color: '#666' }]}>Unit 4 Quiz</Text>
                  <Text style={[styles.quizButtonSub, !quizUnlocked && { color: '#444' }]}>
                    {effectiveIsGuest ? 'Create account to unlock' : 'Numbers & Counting · +150 XP'}
                  </Text>
                </View>
                {quizDone
                  ? <Check color="#FFD900" size={20} />
                  : quizUnlocked
                    ? <ChevronRight color="#00897B" size={20} />
                    : <Lock color="#444" size={18} />}
              </Pressable>
            </>
          );
        })()}

        {/* Unit 5 */}
        <View style={[styles.unitRow, { marginTop: 24 }]}>
          <Text style={styles.unitTitle}>Unit 5: Grammar Basics</Text>
        </View>

        <LessonRow
          label="Pronouns"
          meta="Lesson 1 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('grammar-pronouns')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=grammar-pronouns' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['grammar-pronouns'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="This & That"
          meta="Lesson 2 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('grammar-this-that', 'grammar-pronouns')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=grammar-this-that' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['grammar-this-that'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="My, Your, His, Her"
          meta="Lesson 3 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('grammar-possessives', 'grammar-this-that')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=grammar-possessives' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['grammar-possessives'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Common Verbs (Present)"
          meta="Lesson 4 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('grammar-present-verbs', 'grammar-possessives')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=grammar-present-verbs' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['grammar-present-verbs'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Common Verbs (Past)"
          meta="Lesson 5 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('grammar-past-verbs', 'grammar-present-verbs')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=grammar-past-verbs' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['grammar-past-verbs'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Wanting & Needing"
          meta="Lesson 6 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('grammar-want-need', 'grammar-past-verbs')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=grammar-want-need' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['grammar-want-need'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Asking Questions"
          meta="Lesson 7 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('grammar-questions', 'grammar-want-need')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=grammar-questions' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['grammar-questions'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Saying No & Not"
          meta="Lesson 8 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('grammar-negation', 'grammar-questions')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=grammar-negation' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['grammar-negation'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Describing Things"
          meta="Lesson 9 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('grammar-adjectives', 'grammar-negation')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=grammar-adjectives' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['grammar-adjectives'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Building Sentences"
          meta="Lesson 10 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('grammar-sentences', 'grammar-adjectives')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=grammar-sentences' as any);
          }}
        />

        {/* Unit 5 Quiz */}
        {(() => {
          const ALL_U5_LESSONS = [
            'grammar-pronouns', 'grammar-this-that', 'grammar-possessives',
            'grammar-present-verbs', 'grammar-past-verbs', 'grammar-want-need',
            'grammar-questions', 'grammar-negation', 'grammar-adjectives', 'grammar-sentences',
          ];
          const allDone = ALL_U5_LESSONS.every(k => !!scenarioProgress[k]);
          const quizUnlocked = TESTING_UNLOCK_ALL || (!isGuest && allDone);
          const quizDone = !!scenarioProgress['quiz_u5'];
          return (
            <>
              <View style={[styles.lessonConnector, scenarioProgress['grammar-sentences'] && { backgroundColor: '#00897B' }]} />
              <Pressable
                style={[styles.quizButton, !quizUnlocked && styles.quizButtonLocked, quizDone && styles.quizButtonDone]}
                onPress={() => {
                  if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                  if (quizUnlocked) router.push('/quiz?unit=5' as any);
                }}
              >
                <Text style={styles.quizButtonIcon}>{quizDone ? '✅' : '🎯'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quizButtonTitle, !quizUnlocked && { color: '#666' }]}>Unit 5 Quiz</Text>
                  <Text style={[styles.quizButtonSub, !quizUnlocked && { color: '#444' }]}>
                    {effectiveIsGuest ? 'Create account to unlock' : 'Grammar Basics · +150 XP'}
                  </Text>
                </View>
                {quizDone
                  ? <Check color="#FFD900" size={20} />
                  : quizUnlocked
                    ? <ChevronRight color="#00897B" size={20} />
                    : <Lock color="#444" size={18} />}
              </Pressable>
            </>
          );
        })()}

        {/* Unit 6 */}
        <View style={[styles.unitRow, { marginTop: 24 }]}>
          <Text style={styles.unitTitle}>Unit 6: Daily Life Scenarios</Text>
        </View>

        <LessonRow
          label="Morning Routine"
          meta="Lesson 1 of 8 · 3 mins"
          icon={<Coffee color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('morningroutine')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-morning-routine' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['morningroutine'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="At the Gym"
          meta="Lesson 2 of 8 · 3 mins"
          icon={<Activity color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('atgym', 'morningroutine')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-gym' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['atgym'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Cooking at Home"
          meta="Lesson 3 of 8 · 3 mins"
          icon={<Utensils color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('cookinghome', 'atgym')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-cooking-home' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['cookinghome'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Weather Chat"
          meta="Lesson 4 of 8 · 3 mins"
          icon={<Mic color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('weatherchat', 'cookinghome')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-weather-chat' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['weatherchat'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Doctor Visit"
          meta="Lesson 5 of 8 · 3 mins"
          icon={<Heart color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('doctorvisit', 'weatherchat')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-doctor-visit' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['doctorvisit'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="At the Bank"
          meta="Lesson 6 of 8 · 3 mins"
          icon={<ShoppingBag color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('atbank', 'doctorvisit')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-bank' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['atbank'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Friday Gathering"
          meta="Lesson 7 of 8 · 3 mins"
          icon={<User color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('fridaygathering', 'atbank')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-friday-gathering' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['fridaygathering'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Neighbour Visit"
          meta="Lesson 8 of 8 · 3 mins"
          icon={<Coffee color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('neighborvisit', 'fridaygathering')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('access real life scenarios'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-neighbor-visit' as any);
          }}
        />

        {/* Unit 6 Quiz */}
        {(() => {
          const ALL_U6_SCENARIOS = [
            'morningroutine', 'atgym', 'cookinghome', 'weatherchat',
            'doctorvisit', 'atbank', 'fridaygathering', 'neighborvisit',
          ];
          const allDone = ALL_U6_SCENARIOS.every(k => !!scenarioProgress[k]);
          const quizUnlocked = TESTING_UNLOCK_ALL || (!isGuest && allDone);
          const quizDone = !!scenarioProgress['quiz_u6'];
          return (
            <>
              <View style={[styles.lessonConnector, scenarioProgress['neighborvisit'] && { backgroundColor: '#00897B' }]} />
              <Pressable
                style={[styles.quizButton, !quizUnlocked && styles.quizButtonLocked, quizDone && styles.quizButtonDone]}
                onPress={() => {
                  if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                  if (quizUnlocked) router.push('/quiz-unit2?unit=6' as any);
                }}
              >
                <Text style={styles.quizButtonIcon}>{quizDone ? '✅' : '🎯'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quizButtonTitle, !quizUnlocked && { color: '#666' }]}>Unit 6 Quiz</Text>
                  <Text style={[styles.quizButtonSub, !quizUnlocked && { color: '#444' }]}>
                    {effectiveIsGuest ? 'Create account to unlock' : 'Daily Life Scenarios · +150 XP'}
                  </Text>
                </View>
                {quizDone
                  ? <Check color="#FFD900" size={20} />
                  : quizUnlocked
                    ? <ChevronRight color="#00897B" size={20} />
                    : <Lock color="#444" size={18} />}
              </Pressable>
            </>
          );
        })()}

        {/* Unit 8 */}
        <View style={[styles.unitRow, { marginTop: 24 }]}>
          <Text style={styles.unitTitle}>Unit 8: Emergencies & Help</Text>
        </View>

        <LessonRow
          label="Lost in the City"
          meta="Lesson 1 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('lostincity')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-lost-in-city' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['lostincity'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Car Breakdown"
          meta="Lesson 2 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('carbreakdown', 'lostincity')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-car-breakdown' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['carbreakdown'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="At the Police Station"
          meta="Lesson 3 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('policestation', 'carbreakdown')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-police-station' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['policestation'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Hospital Emergency"
          meta="Lesson 4 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('hospitalemergency', 'policestation')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-hospital-emergency' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['hospitalemergency'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Lost Wallet"
          meta="Lesson 5 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('lostwallet', 'hospitalemergency')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-lost-wallet' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['lostwallet'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Phone Stolen"
          meta="Lesson 6 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('phonestolen', 'lostwallet')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-phone-stolen' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['phonestolen'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Flight Problem"
          meta="Lesson 7 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('flightproblem', 'phonestolen')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-flight-problem' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['flightproblem'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Asking Strangers for Help"
          meta="Lesson 8 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('askingforhelp', 'flightproblem')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-asking-for-help' as any);
          }}
        />

        {/* Unit 8 Quiz */}
        {(() => {
          const ALL_U8_SCENARIOS = [
            'lostincity', 'carbreakdown', 'policestation', 'hospitalemergency',
            'lostwallet', 'phonestolen', 'flightproblem', 'askingforhelp',
          ];
          const allDone = ALL_U8_SCENARIOS.every(k => !!scenarioProgress[k]);
          const quizUnlocked = TESTING_UNLOCK_ALL || (!isGuest && allDone);
          const quizDone = !!scenarioProgress['quiz_u8'];
          return (
            <>
              <View style={[styles.lessonConnector, scenarioProgress['askingforhelp'] && { backgroundColor: '#00897B' }]} />
              <Pressable
                style={[styles.quizButton, !quizUnlocked && styles.quizButtonLocked, quizDone && styles.quizButtonDone]}
                onPress={() => {
                  if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                  if (quizUnlocked) router.push('/quiz-unit2?unit=8' as any);
                }}
              >
                <Text style={styles.quizButtonIcon}>{quizDone ? '✅' : '🎯'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quizButtonTitle, !quizUnlocked && { color: '#666' }]}>Unit 8 Quiz</Text>
                  <Text style={[styles.quizButtonSub, !quizUnlocked && { color: '#444' }]}>
                    {effectiveIsGuest ? 'Create account to unlock' : 'Emergencies & Help · +150 XP'}
                  </Text>
                </View>
                {quizDone
                  ? <Check color="#FFD900" size={20} />
                  : quizUnlocked
                    ? <ChevronRight color="#00897B" size={20} />
                    : <Lock color="#444" size={18} />}
              </Pressable>
            </>
          );
        })()}

        {/* Unit 7 */}
        <View style={[styles.unitRow, { marginTop: 24 }]}>
          <Text style={styles.unitTitle}>Unit 7: Work & Business</Text>
        </View>

        <LessonRow
          label="At the Office"
          meta="Lesson 1 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('work-office')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=work-office' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['work-office'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Work Greetings"
          meta="Lesson 2 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('work-greetings', 'work-office')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=work-greetings' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['work-greetings'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="In a Meeting"
          meta="Lesson 3 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('work-meeting', 'work-greetings')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=work-meeting' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['work-meeting'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Phone Calls"
          meta="Lesson 4 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('work-phone', 'work-meeting')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=work-phone' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['work-phone'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Email & Messages"
          meta="Lesson 5 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('work-email', 'work-phone')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=work-email' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['work-email'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Schedule & Deadlines"
          meta="Lesson 6 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('work-schedule', 'work-email')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=work-schedule' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['work-schedule'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Reporting Problems"
          meta="Lesson 7 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('work-problems', 'work-schedule')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=work-problems' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['work-problems'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Office Small Talk"
          meta="Lesson 8 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('work-smalltalk', 'work-problems')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=work-smalltalk' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['work-smalltalk'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Salary & Benefits"
          meta="Lesson 9 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('work-salary', 'work-smalltalk')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=work-salary' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['work-salary'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="End of Day"
          meta="Lesson 10 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('work-leaving', 'work-salary')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=work-leaving' as any);
          }}
        />

        {/* Unit 7 Quiz */}
        {(() => {
          const ALL_U7_LESSONS = [
            'work-office', 'work-greetings', 'work-meeting', 'work-phone', 'work-email',
            'work-schedule', 'work-problems', 'work-smalltalk', 'work-salary', 'work-leaving',
          ];
          const allDone = ALL_U7_LESSONS.every(k => !!scenarioProgress[k]);
          const quizUnlocked = TESTING_UNLOCK_ALL || (!isGuest && allDone);
          const quizDone = !!scenarioProgress['quiz_u7'];
          return (
            <>
              <View style={[styles.lessonConnector, scenarioProgress['work-leaving'] && { backgroundColor: '#00897B' }]} />
              <Pressable
                style={[styles.quizButton, !quizUnlocked && styles.quizButtonLocked, quizDone && styles.quizButtonDone]}
                onPress={() => {
                  if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                  if (quizUnlocked) router.push('/quiz?unit=7' as any);
                }}
              >
                <Text style={styles.quizButtonIcon}>{quizDone ? '✅' : '🎯'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quizButtonTitle, !quizUnlocked && { color: '#666' }]}>Unit 7 Quiz</Text>
                  <Text style={[styles.quizButtonSub, !quizUnlocked && { color: '#444' }]}>
                    {effectiveIsGuest ? 'Create account to unlock' : 'Work & Business · +150 XP'}
                  </Text>
                </View>
                {quizDone
                  ? <Check color="#FFD900" size={20} />
                  : quizUnlocked
                    ? <ChevronRight color="#00897B" size={20} />
                    : <Lock color="#444" size={18} />}
              </Pressable>
            </>
          );
        })()}

        {/* Unit 9 */}
        <View style={[styles.unitRow, { marginTop: 24 }]}>
          <Text style={styles.unitTitle}>Unit 9: Social & Culture</Text>
        </View>

        <LessonRow
          label="Greetings & Farewells"
          meta="Lesson 1 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('social-greetings')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=social-greetings' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['social-greetings'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Family & Relationships"
          meta="Lesson 2 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('social-family', 'social-greetings')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=social-family' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['social-family'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Invitations & Plans"
          meta="Lesson 3 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('social-invitations', 'social-family')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=social-invitations' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['social-invitations'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Ramadan & Eid"
          meta="Lesson 4 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('social-ramadan', 'social-invitations')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=social-ramadan' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['social-ramadan'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Compliments & Praise"
          meta="Lesson 5 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('social-compliments', 'social-ramadan')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=social-compliments' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['social-compliments'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Feelings & Emotions"
          meta="Lesson 6 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('social-emotions', 'social-compliments')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=social-emotions' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['social-emotions'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Weddings & Celebrations"
          meta="Lesson 7 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('social-weddings', 'social-emotions')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=social-weddings' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['social-weddings'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Condolences & Sympathy"
          meta="Lesson 8 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('social-condolences', 'social-weddings')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=social-condolences' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['social-condolences'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Religion & Daily Phrases"
          meta="Lesson 9 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('social-religion', 'social-condolences')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=social-religion' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['social-religion'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Manners & Etiquette"
          meta="Lesson 10 of 10 · 3 mins"
          icon={<Hash color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('social-manners', 'social-religion')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/lesson?type=social-manners' as any);
          }}
        />

        {/* Unit 9 Quiz */}
        {(() => {
          const ALL_U9_LESSONS = [
            'social-greetings', 'social-family', 'social-invitations', 'social-ramadan',
            'social-compliments', 'social-emotions', 'social-weddings', 'social-condolences',
            'social-religion', 'social-manners',
          ];
          const allDone = ALL_U9_LESSONS.every(k => !!scenarioProgress[k]);
          const quizUnlocked = TESTING_UNLOCK_ALL || (!isGuest && allDone);
          const quizDone = !!scenarioProgress['quiz_u9'];
          return (
            <>
              <View style={[styles.lessonConnector, scenarioProgress['social-manners'] && { backgroundColor: '#00897B' }]} />
              <Pressable
                style={[styles.quizButton, !quizUnlocked && styles.quizButtonLocked, quizDone && styles.quizButtonDone]}
                onPress={() => {
                  if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                  if (quizUnlocked) router.push('/quiz?unit=9' as any);
                }}
              >
                <Text style={styles.quizButtonIcon}>{quizDone ? '✅' : '🎯'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quizButtonTitle, !quizUnlocked && { color: '#666' }]}>Unit 9 Quiz</Text>
                  <Text style={[styles.quizButtonSub, !quizUnlocked && { color: '#444' }]}>
                    {effectiveIsGuest ? 'Create account to unlock' : 'Social & Culture · +150 XP'}
                  </Text>
                </View>
                {quizDone
                  ? <Check color="#FFD900" size={20} />
                  : quizUnlocked
                    ? <ChevronRight color="#00897B" size={20} />
                    : <Lock color="#444" size={18} />}
              </Pressable>
            </>
          );
        })()}

        {/* Unit 10 */}
        <View style={[styles.unitRow, { marginTop: 24 }]}>
          <Text style={styles.unitTitle}>Unit 10: Making Friends</Text>
        </View>

        <LessonRow
          label="New Neighbor"
          meta="Lesson 1 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('friendsnewneighbor')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-friends-new-neighbor' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['friendsnewneighbor'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Watching Football"
          meta="Lesson 2 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('friendsfootball', 'friendsnewneighbor')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-friends-football' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['friendsfootball'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Gaming Night"
          meta="Lesson 3 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('friendsgaming', 'friendsfootball')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-friends-gaming' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['friendsgaming'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Weekend Plans"
          meta="Lesson 4 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('friendsweekend', 'friendsgaming')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-friends-weekend' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['friendsweekend'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Social Media"
          meta="Lesson 5 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('friendssocialmedia', 'friendsweekend')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-friends-social-media' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['friendssocialmedia'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Road Trip"
          meta="Lesson 6 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('friendsroadtrip', 'friendssocialmedia')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-friends-road-trip' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['friendsroadtrip'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Birthday Party"
          meta="Lesson 7 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('friendsbirthday', 'friendsroadtrip')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-friends-birthday' as any);
          }}
        />
        <View style={[styles.lessonConnector, scenarioProgress['friendsbirthday'] && { backgroundColor: '#00897B' }]} />
        <LessonRow
          label="Saying Goodbye"
          meta="Lesson 8 of 8 · 5 mins"
          icon={<MapPin color="#00897B" size={20} />}
          status={effectiveIsGuest ? 'locked' : getStatus('friendsfarewell', 'friendsbirthday')}
          guestLocked={effectiveIsGuest}
          onPress={() => {
            if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
            router.push('/scenario-intro-friends-farewell' as any);
          }}
        />

        {/* Unit 10 Quiz */}
        {(() => {
          const ALL_U10_SCENARIOS = [
            'friendsnewneighbor', 'friendsfootball', 'friendsgaming', 'friendsweekend',
            'friendssocialmedia', 'friendsroadtrip', 'friendsbirthday', 'friendsfarewell',
          ];
          const allDone = ALL_U10_SCENARIOS.every(k => !!scenarioProgress[k]);
          const quizUnlocked = TESTING_UNLOCK_ALL || (!isGuest && allDone);
          const quizDone = !!scenarioProgress['quiz_u10'];
          return (
            <>
              <View style={[styles.lessonConnector, scenarioProgress['friendsfarewell'] && { backgroundColor: '#00897B' }]} />
              <Pressable
                style={[styles.quizButton, !quizUnlocked && styles.quizButtonLocked, quizDone && styles.quizButtonDone]}
                onPress={() => {
                  if (effectiveIsGuest) { setPromptReason('unlock all lessons'); setShowSignUpPrompt(true); return; }
                  if (quizUnlocked) router.push('/quiz-unit2?unit=10' as any);
                }}
              >
                <Text style={styles.quizButtonIcon}>{quizDone ? '✅' : '🎯'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quizButtonTitle, !quizUnlocked && { color: '#666' }]}>Unit 10 Quiz</Text>
                  <Text style={[styles.quizButtonSub, !quizUnlocked && { color: '#444' }]}>
                    {effectiveIsGuest ? 'Create account to unlock' : 'Making Friends · +150 XP'}
                  </Text>
                </View>
                {quizDone
                  ? <Check color="#FFD900" size={20} />
                  : quizUnlocked
                    ? <ChevronRight color="#00897B" size={20} />
                    : <Lock color="#444" size={18} />}
              </Pressable>
            </>
          );
        })()}

      </ScrollView>

      <SignUpPrompt
        visible={showSignUpPrompt && !TESTING_UNLOCK_ALL}
        onClose={() => setShowSignUpPrompt(false)}
        reason={promptReason}
      />

      <StreakModal
        visible={showStreakModal}
        streakData={streakData}
        onClose={() => setShowStreakModal(false)}
      />

      <MilestoneModal
        visible={showMilestoneModal}
        milestone={pendingMilestone}
        onClose={() => setShowMilestoneModal(false)}
      />
    </SafeAreaView>
  );
}

function LessonRow({ label, meta, icon, status, onPress, guestLocked, comingSoon }: {
  label: string;
  meta: string;
  icon: any;
  status: 'completed' | 'current' | 'locked';
  onPress?: () => void;
  guestLocked?: boolean;
  comingSoon?: boolean;
}) {
  const effectiveStatus = comingSoon ? 'locked' : status;
  const isActive = effectiveStatus === 'current';
  const isCompleted = effectiveStatus === 'completed';
  const isLocked = effectiveStatus === 'locked';

  const iconBg = isCompleted ? '#1a1500' : isActive ? '#0a1f1a' : '#161616';
  const iconColor = isCompleted ? '#FFD900' : isActive ? '#00897B' : '#444';

  const effectiveMeta = comingSoon ? 'Coming Soon' : (isLocked && guestLocked ? '🔒 Sign up to unlock' : meta);

  return (
    <Pressable
      style={[
        styles.lessonRow,
        isCompleted && styles.lessonRowCompleted,
        isActive && styles.lessonRowActive,
        isLocked && styles.lessonRowLocked,
      ]}
      onPress={comingSoon ? undefined : onPress}
    >
      <View style={[styles.lessonIconCircle, { backgroundColor: iconBg }]}>
        {isLocked ? <Lock color={iconColor} size={18} /> : icon}
      </View>
      <View style={styles.lessonMiddle}>
        <Text style={[
          styles.lessonLabel,
          isLocked && { color: '#666' },
        ]}>{label}</Text>
        <Text style={[
          styles.lessonMeta,
          isActive && { color: '#00897B' },
          isLocked && { color: '#444' },
        ]}>
          {effectiveMeta}
        </Text>
      </View>
      <View style={[
        styles.lessonPlayBtn,
        isCompleted && { backgroundColor: '#FFD900' },
        isActive && { backgroundColor: '#00897B' },
        isLocked && { backgroundColor: '#1a1a1a' },
      ]}>
        {isCompleted && <Check color="#000" size={16} />}
        {isActive && !comingSoon && <Play color="#FFF" size={16} />}
        {comingSoon && <Text style={{ fontSize: 14 }}>🔜</Text>}
        {isLocked && !comingSoon && <Lock color="#444" size={14} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { padding: 20, paddingBottom: 60 },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#00897B' },
  dialectBadge: { fontSize: 12, color: '#00897B', fontWeight: '600', marginTop: 4, opacity: 0.75 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  statPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151515', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 4 },
  statPillDim: { borderColor: '#1e1e1e', opacity: 0.6 },
  statPillText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  // Guest banner
  guestBanner: { backgroundColor: '#111', borderLeftWidth: 3, borderLeftColor: '#00897B', borderRadius: 8, padding: 12, marginBottom: 16 },
  guestBannerText: { color: '#00897B', fontSize: 13, fontWeight: '500' },
  expiryBanner: { backgroundColor: '#1a0a00', borderLeftWidth: 3, borderLeftColor: '#FF9600', borderRadius: 8, padding: 12, marginBottom: 16 },
  expiryBannerText: { color: '#FF9600', fontSize: 13, fontWeight: '500' },

  // Daily Quest
  questCard: { backgroundColor: '#161616', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1e1e1e' },
  questTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  questLeft: { flex: 1, paddingRight: 12 },
  questLabel: { fontSize: 10, fontWeight: '700', color: '#00897B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  questTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  questBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  questBarBg: { flex: 1, height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' },
  questBarFill: { height: '100%', borderRadius: 4 },
  questFraction: { fontSize: 12, fontWeight: '700', color: '#555' },

  // Yusuf chat card
  yusufCard: { backgroundColor: '#0d1f1e', borderWidth: 1.5, borderColor: '#00897B', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16 },
  yusufTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 6, textAlign: 'center' },
  yusufSubtitle: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 19, marginBottom: 14 },
  xpPill: { backgroundColor: '#0A2A20', borderWidth: 1, borderColor: '#00897B', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  xpPillText: { color: '#00897B', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Tip card
  tipCard: { flexDirection: 'row', backgroundColor: 'rgba(0,137,123,0.05)', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,137,123,0.3)', gap: 12 },
  tipAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#00897B', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  tipAvatarText: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  tipLabel: { fontSize: 11, fontWeight: '700', color: '#00897B', marginBottom: 5 },
  tipText: { fontSize: 14, color: '#FFF', lineHeight: 21, opacity: 0.85 },

  // Unit header
  unitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#00897B', paddingLeft: 12 },
  unitTitle: { fontSize: 17, fontWeight: 'bold', color: '#FFF' },

  // Lesson rows
  lessonRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, paddingHorizontal: 16, marginBottom: 10, borderWidth: 0.5, borderColor: '#2a2a2a' },
  lessonRowCompleted: { borderLeftWidth: 3, borderLeftColor: '#FFD900', borderColor: '#2a2a2a' },
  lessonRowActive: { backgroundColor: '#0d1a19', borderLeftWidth: 3, borderLeftColor: '#00897B', borderColor: '#00897B' },
  lessonRowLocked: { backgroundColor: '#111', borderColor: '#1a1a1a' },
  lessonIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  lessonMiddle: { flex: 1 },
  lessonLabel: { fontSize: 15, fontWeight: 'bold', color: '#FFF', marginBottom: 2 },
  lessonMeta: { fontSize: 12, color: '#555' },
  lessonConnector: { width: 3, height: 28, backgroundColor: '#1e1e1e', marginLeft: 34, borderRadius: 2 },
  quizButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,137,123,0.08)', borderWidth: 1.5, borderColor: '#00897B', borderRadius: 16, padding: 16, gap: 12, marginBottom: 4 },
  quizButtonLocked: { backgroundColor: '#111', borderColor: '#1a1a1a' },
  quizButtonDone: { backgroundColor: 'rgba(255,217,0,0.06)', borderColor: '#FFD900' },
  quizButtonIcon: { fontSize: 24 },
  quizButtonTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  quizButtonSub: { fontSize: 12, color: '#00897B', marginTop: 2 },
  lessonPlayBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

});
