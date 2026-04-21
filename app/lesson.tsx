import { View, Text, Pressable, StyleSheet, Dimensions, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { getLevelFromXP } from '../constants/levels';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { playLocalAudio, stopAudio } from '../utils/tts';
import { stripTashkeel } from '../utils/arabic';
import {
  NUMBERS_1_5_WORDS, NUMBERS_6_10_WORDS, NUMBERS_11_20_WORDS, NUMBERS_TENS_WORDS,
  NUMBERS_AGE_WORDS, NUMBERS_PRICES_WORDS, NUMBERS_PHONE_WORDS, NUMBERS_HOURS_WORDS,
  NUMBERS_MINUTES_WORDS, NUMBERS_DAYS_WORDS, NUMBERS_MONTHS_WORDS, NUMBERS_DATES_WORDS,
  NUMBERS_ORDERING_WORDS, NUMBERS_TOGETHER_WORDS,
  GRAMMAR_PRONOUNS_WORDS, GRAMMAR_THIS_THAT_WORDS, GRAMMAR_POSSESSIVES_WORDS,
  GRAMMAR_PRESENT_VERBS_WORDS, GRAMMAR_PAST_VERBS_WORDS, GRAMMAR_WANT_NEED_WORDS,
  GRAMMAR_QUESTIONS_WORDS, GRAMMAR_NEGATION_WORDS, GRAMMAR_ADJECTIVES_WORDS,
  GRAMMAR_SENTENCES_WORDS,
  WORK_OFFICE_WORDS, WORK_GREETINGS_WORDS, WORK_MEETING_WORDS, WORK_PHONE_WORDS,
  WORK_EMAIL_WORDS, WORK_SCHEDULE_WORDS, WORK_PROBLEMS_WORDS, WORK_SMALLTALK_WORDS,
  WORK_SALARY_WORDS, WORK_LEAVING_WORDS,
  SOCIAL_GREETINGS_WORDS, SOCIAL_FAMILY_WORDS, SOCIAL_INVITATIONS_WORDS, SOCIAL_RAMADAN_WORDS,
  SOCIAL_COMPLIMENTS_WORDS, SOCIAL_EMOTIONS_WORDS, SOCIAL_WEDDINGS_WORDS, SOCIAL_CONDOLENCES_WORDS,
  SOCIAL_RELIGION_WORDS, SOCIAL_MANNERS_WORDS,
} from '../constants/words';
import type { Word } from '../constants/words';
import { ArrowLeft, Volume2, ChevronRight } from 'lucide-react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, useAudioRecorder } from 'expo-audio';
import { useDialect } from '../contexts/DialectContext';
import { recordActivity } from '../utils/streak';

const { width } = Dimensions.get('window');

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: string; icon: string; color: string } | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { content, dialect, speakInDialect } = useDialect();

  // All hooks above — derived values below
  const type = params.type;
  const typeStr = Array.isArray(type) ? type[0] : (type ?? '');

  const LESSON_WORDS_MAP: Record<string, Word[]> = {
    // Unit 4 — Numbers & Counting
    'numbers-1-5':       NUMBERS_1_5_WORDS,
    'numbers-6-10':      NUMBERS_6_10_WORDS,
    'numbers-11-20':     NUMBERS_11_20_WORDS,
    'numbers-tens':      NUMBERS_TENS_WORDS,
    'numbers-age':       NUMBERS_AGE_WORDS,
    'numbers-prices':    NUMBERS_PRICES_WORDS,
    'numbers-phone':     NUMBERS_PHONE_WORDS,
    'numbers-hours':     NUMBERS_HOURS_WORDS,
    'numbers-minutes':   NUMBERS_MINUTES_WORDS,
    'numbers-days':      NUMBERS_DAYS_WORDS,
    'numbers-months':    NUMBERS_MONTHS_WORDS,
    'numbers-dates':     NUMBERS_DATES_WORDS,
    'numbers-ordering':  NUMBERS_ORDERING_WORDS,
    'numbers-together':  NUMBERS_TOGETHER_WORDS,
    // Unit 5 — Grammar Basics
    'grammar-pronouns':      GRAMMAR_PRONOUNS_WORDS,
    'grammar-this-that':     GRAMMAR_THIS_THAT_WORDS,
    'grammar-possessives':   GRAMMAR_POSSESSIVES_WORDS,
    'grammar-present-verbs': GRAMMAR_PRESENT_VERBS_WORDS,
    'grammar-past-verbs':    GRAMMAR_PAST_VERBS_WORDS,
    'grammar-want-need':     GRAMMAR_WANT_NEED_WORDS,
    'grammar-questions':     GRAMMAR_QUESTIONS_WORDS,
    'grammar-negation':      GRAMMAR_NEGATION_WORDS,
    'grammar-adjectives':    GRAMMAR_ADJECTIVES_WORDS,
    'grammar-sentences':     GRAMMAR_SENTENCES_WORDS,
    // Unit 7 — Work & Business
    'work-office':     WORK_OFFICE_WORDS,
    'work-greetings':  WORK_GREETINGS_WORDS,
    'work-meeting':    WORK_MEETING_WORDS,
    'work-phone':      WORK_PHONE_WORDS,
    'work-email':      WORK_EMAIL_WORDS,
    'work-schedule':   WORK_SCHEDULE_WORDS,
    'work-problems':   WORK_PROBLEMS_WORDS,
    'work-smalltalk':  WORK_SMALLTALK_WORDS,
    'work-salary':     WORK_SALARY_WORDS,
    'work-leaving':    WORK_LEAVING_WORDS,
    // Unit 9 — Social & Culture
    'social-greetings':   SOCIAL_GREETINGS_WORDS,
    'social-family':      SOCIAL_FAMILY_WORDS,
    'social-invitations': SOCIAL_INVITATIONS_WORDS,
    'social-ramadan':     SOCIAL_RAMADAN_WORDS,
    'social-compliments': SOCIAL_COMPLIMENTS_WORDS,
    'social-emotions':    SOCIAL_EMOTIONS_WORDS,
    'social-weddings':    SOCIAL_WEDDINGS_WORDS,
    'social-condolences': SOCIAL_CONDOLENCES_WORDS,
    'social-religion':    SOCIAL_RELIGION_WORDS,
    'social-manners':     SOCIAL_MANNERS_WORDS,
  };

  const LESSON_TITLES: Record<string, string> = {
    // Unit 4
    'numbers-1-5':       'Numbers 1–5',
    'numbers-6-10':      'Numbers 6–10',
    'numbers-11-20':     'Numbers 11–20',
    'numbers-tens':      'Tens & Hundreds',
    'numbers-age':       'Talking About Age',
    'numbers-prices':    'Prices & Money',
    'numbers-phone':     'Phone Numbers',
    'numbers-hours':     'Telling the Time',
    'numbers-minutes':   'Minutes & Fractions',
    'numbers-days':      'Days of the Week',
    'numbers-months':    'Months of the Year',
    'numbers-dates':     'Dates & Calendar',
    'numbers-ordering':  'Ordinal Numbers',
    'numbers-together':  'Big Numbers',
    // Unit 5
    'grammar-pronouns':      'Pronouns',
    'grammar-this-that':     'This & That',
    'grammar-possessives':   'My, Your, His, Her',
    'grammar-present-verbs': 'Common Verbs (Present)',
    'grammar-past-verbs':    'Common Verbs (Past)',
    'grammar-want-need':     'Wanting & Needing',
    'grammar-questions':     'Asking Questions',
    'grammar-negation':      'Saying No & Not',
    'grammar-adjectives':    'Describing Things',
    'grammar-sentences':     'Building Sentences',
    // Unit 7
    'work-office':     'At the Office',
    'work-greetings':  'Work Greetings',
    'work-meeting':    'In a Meeting',
    'work-phone':      'Phone Calls',
    'work-email':      'Email & Messages',
    'work-schedule':   'Schedule & Deadlines',
    'work-problems':   'Reporting Problems',
    'work-smalltalk':  'Office Small Talk',
    'work-salary':     'Salary & Benefits',
    'work-leaving':    'End of Day',
    // Unit 9
    'social-greetings':   'Greetings & Farewells',
    'social-family':      'Family & Relationships',
    'social-invitations': 'Invitations & Plans',
    'social-ramadan':     'Ramadan & Eid',
    'social-compliments': 'Compliments & Praise',
    'social-emotions':    'Feelings & Emotions',
    'social-weddings':    'Weddings & Celebrations',
    'social-condolences': 'Condolences & Sympathy',
    'social-religion':    'Religion & Daily Phrases',
    'social-manners':     'Manners & Etiquette',
  };

  const LESSON_SUBTITLES: Record<string, string> = {
    // Unit 4
    'numbers-1-5':       'One through Five',
    'numbers-6-10':      'Six through Ten',
    'numbers-11-20':     'Eleven through Twenty',
    'numbers-tens':      '20, 30, 40 and beyond',
    'numbers-age':       'How old are you?',
    'numbers-prices':    'Shopping in the Gulf',
    'numbers-phone':     'Sharing Contact Info',
    'numbers-hours':     'What time is it?',
    'numbers-minutes':   'Quarter & Half Hours',
    'numbers-days':      'Weekly Calendar',
    'numbers-months':    'Monthly Calendar',
    'numbers-dates':     "What's today's date?",
    'numbers-ordering':  'First, Second, Third...',
    'numbers-together':  'Hundreds & Thousands',
    // Unit 5
    'grammar-pronouns':      'Ana, Inta, Huwwa...',
    'grammar-this-that':     'Haadha vs. Dhaak',
    'grammar-possessives':   'Haqqi, Haqqak...',
    'grammar-present-verbs': 'Arooh, Aakil, Ashrab...',
    'grammar-past-verbs':    'Ruht, Akalt, Shribt...',
    'grammar-want-need':     'Abi, Ahtaaj...',
    'grammar-questions':     'Shinu, Wain, Laish...',
    'grammar-negation':      'La, Ma, Mu...',
    'grammar-adjectives':    'Kbeer, Sgheer, Hilow...',
    'grammar-sentences':     'Putting It All Together',
    // Unit 7
    'work-office':     'Maktab, Sharika...',
    'work-greetings':  'Ya Jamaa\'a, Yit\'eek...',
    'work-meeting':    'Nibda, Muwaafiq...',
    'work-phone':      'Aalo, Minu Ma\'i...',
    'work-email':      'Eemeil, Murfaq...',
    'work-schedule':   'Jadwal, Deadline...',
    'work-problems':   'Indi Mushkila...',
    'work-smalltalk':  'Weekend, Tarqiya...',
    'work-salary':     'Raatib, Ijaaza...',
    'work-leaving':    'Khallast, Istarih...',
    // Unit 9
    'social-greetings':   'Ahlan, Marhaba...',
    'social-family':      'Ummi, Abooy, Akhoy...',
    'social-invitations': "Taa'al, Yallah...",
    'social-ramadan':     'Ramadan Kareem!',
    'social-compliments': 'Mashallah, Hilow...',
    'social-emotions':    'Farhan, Hazeen...',
    'social-weddings':    'Mabrook, Alf Mabrook...',
    'social-condolences': 'Allah Yirhamu...',
    'social-religion':    'Bismillah, Alhamdulillah...',
    'social-manners':     'Tafaddal, Afwan...',
  };

  const isCustomLesson = typeStr in LESSON_WORDS_MAP;
  const lessonKey = typeStr === 'intro' ? 'intro' : typeStr === 'greetings' ? 'greetings' : 'basic';
  const WORDS: Word[] = isCustomLesson ? (LESSON_WORDS_MAP[typeStr] ?? []) : (content.lessons[lessonKey] ?? []);
  const isComingSoon = WORDS.length === 0;

  const lessonTitle = isCustomLesson ? (LESSON_TITLES[typeStr] ?? 'Lesson') :
    typeStr === 'intro'     ? 'Introduce Yourself'      :
    typeStr === 'greetings' ? 'Common Greetings'        :
    'Basic Words';

  const lessonSubtitle = isCustomLesson ? (LESSON_SUBTITLES[typeStr] ?? 'Gulf Arabic') :
    typeStr === 'intro'     ? 'Talk About Yourself'     :
    typeStr === 'greetings' ? 'Meeting People in Dubai' :
    'A Day in Dubai';

  const currentWord = WORDS[currentIndex] ?? { arabic: '', transliteration: '', english: '', context: '', audio: undefined };
  const progress = WORDS.length > 0 ? currentIndex / WORDS.length : 0;

  useEffect(() => {
    requestRecordingPermissionsAsync();
    return () => { stopAudio(); };
  }, []);

  useEffect(() => {
    if (isComingSoon) return;
    const timer = setTimeout(() => {
      if (currentWord.audio) {
        playLocalAudio(currentWord.audio);
      } else {
        speakInDialect(currentWord.arabic);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSpeak = () => {
    if (currentWord.audio) {
      playLocalAudio(currentWord.audio);
    } else {
      speakInDialect(currentWord.arabic);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMicPress = async () => {
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try { audioRecorder.record(); } catch (e) {}
  };

  const handleMicRelease = async () => {
    setIsRecording(false);
    setHasAttempted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try { await audioRecorder.stop(); } catch (e) {}
  };

  const saveCompletion = async () => {
    const scenarioKey = typeStr ?? 'basic_words';
    console.log('Saving completion for:', scenarioKey);
    const xpEarned = 60;
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data: xpData } = await supabase
        .from('users')
        .select('xp')
        .eq('id', session.user.id)
        .maybeSingle();
      const previousXP = xpData?.xp ?? 0;
      const oldLevel = getLevelFromXP(previousXP);
      const newLevel = getLevelFromXP(previousXP + xpEarned);
      if (oldLevel.name !== newLevel.name) {
        setLevelUpData({ newLevel: newLevel.name, icon: newLevel.icon, color: newLevel.color });
        setShowLevelUp(true);
      }

      const { data: existing } = await supabase
        .from('scenario_progress')
        .select('id, attempts')
        .eq('user_id', session.user.id)
        .eq('scenario', scenarioKey)
        .maybeSingle();

      if (existing) {
        await supabase.from('scenario_progress').update({
          completed: true,
          best_score: 100,
          attempts: (existing.attempts ?? 0) + 1,
        }).eq('id', existing.id);
      } else {
        await supabase.from('scenario_progress').insert({
          user_id: session.user.id,
          scenario: scenarioKey,
          dialect: dialect,
          completed: true,
          best_score: 100,
          attempts: 1,
        });
        // Only award XP the first time a lesson is completed
        const { data: userData } = await supabase
          .from('users')
          .select('xp')
          .eq('id', session.user.id)
          .maybeSingle();
        await supabase.from('users').update({
          xp: (userData?.xp ?? 0) + xpEarned,
        }).eq('id', session.user.id);
      }
    } else {
      const guestProgress = await AsyncStorage.getItem('guest_progress');
      const progress = guestProgress ? JSON.parse(guestProgress) : {};
      progress[scenarioKey] = true;
      await AsyncStorage.setItem('guest_progress', JSON.stringify(progress));
    }

    // Record activity for streak (works for both guests and signed-in users)
    await recordActivity();
  };

  const handleNext = () => {
    if (currentIndex < WORDS.length - 1) {
      setCurrentIndex(i => i + 1);
      setHasAttempted(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      saveCompletion();
      setCompleted(true);
    }
  };

  if (isComingSoon) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔜</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' }}>Coming Soon</Text>
          <Text style={{ fontSize: 15, color: '#555', textAlign: 'center', marginBottom: 32 }}>
            This lesson is not available for your selected dialect yet. We're working on it!
          </Text>
          <Pressable style={[styles.doneButton]} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
            <Text style={styles.doneButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.completionContainer}>
          <LottieView
            source={require('../assets/images/animations/yusuf-celebrating.json')}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
          <Text style={styles.completionEmoji}>🎉</Text>
          <Text style={styles.completionTitle}>ممتاز!</Text>
          <Text style={styles.completionSub}>You learned {WORDS.length} new words</Text>
          <View style={styles.completionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>20</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>+60</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
          </View>
          <Pressable style={styles.doneButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.doneButtonText}>Back to Home</Text>
          </Pressable>
        </View>

        <Modal visible={showLevelUp} transparent animationType="fade">
          <View style={styles.levelUpOverlay}>
            <View style={styles.levelUpCard}>
              <Text style={styles.levelUpEmoji}>{levelUpData?.icon}</Text>
              <Text style={styles.levelUpTitle}>Level Up!</Text>
              <Text style={[styles.levelUpLevel, { color: levelUpData?.color ?? '#00897B' }]}>{levelUpData?.newLevel}</Text>
              <Text style={styles.levelUpSub}>You reached a new level. Keep going!</Text>
              <Pressable style={styles.levelUpButton} onPress={() => setShowLevelUp(false)}>
                <Text style={styles.levelUpButtonText}>Continue 🎉</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => {
          const goBack = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
          if (currentIndex === 0) { goBack(); return; }
          Alert.alert(
            'Leave Lesson?',
            'Your progress in this lesson will be lost.',
            [
              { text: 'Keep Learning', style: 'cancel' },
              { text: 'Leave', style: 'destructive', onPress: goBack },
            ]
          );
        }}>
          <ArrowLeft color="#fff" size={18} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.lessonName}>{lessonTitle}</Text>
          <Text style={styles.lessonSub}>{lessonSubtitle}</Text>
        </View>
        <View style={styles.xpPill}>
          <Text style={styles.xpText}>+60 XP</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{currentIndex + 1} / {WORDS.length}</Text>
      </View>

      {/* Yusuf */}
      <View style={styles.yusufWrap}>
        <LottieView
          source={require('../assets/images/animations/yusuf-waving.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      {/* Word card */}
      <View style={styles.wordCard}>
        <Text style={styles.contextLabel}>{currentWord.context}</Text>
        <Text
          style={styles.arabicBig}
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.5}
        >
          {stripTashkeel(currentWord.arabic)}
        </Text>
        <Text style={styles.roman}>{currentWord.transliteration}</Text>
        <Text style={styles.english}>{currentWord.english}</Text>
        {currentWord.example && (
          <View style={styles.exampleWrap}>
            <Text style={styles.exampleAr}>"{stripTashkeel(currentWord.example ?? '')}"</Text>
            <Text style={styles.exampleEn}>{currentWord.exampleTranslation}</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.ctrlBtn} onPress={handleSpeak}>
          <Volume2 color="#00897B" size={22} />
        </Pressable>

        <Pressable
          style={[styles.micBtn, isRecording && styles.micBtnRecording]}
          onPressIn={handleMicPress}
          onPressOut={handleMicRelease}
        >
          <Text style={styles.micIcon}>🎙</Text>
        </Pressable>

        <Pressable
          style={[styles.ctrlBtn, hasAttempted && styles.nextBtnActive]}
          onPress={handleNext}
        >
          <ChevronRight color={hasAttempted ? '#00897B' : '#333'} size={22} />
        </Pressable>
      </View>

      <Text style={styles.hint}>
        {isRecording ? 'Recording...' : 'Hold mic and repeat the word'}
      </Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#2a2a2a' },
  headerCenter: { alignItems: 'center' },
  lessonName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  lessonSub: { fontSize: 11, color: '#555', marginTop: 1 },
  xpPill: { backgroundColor: 'rgba(0,137,123,0.15)', borderWidth: 0.5, borderColor: '#00897B', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  xpText: { fontSize: 11, color: '#00897B', fontWeight: '700' },
  progressWrap: { paddingHorizontal: 20, marginBottom: 8 },
  progressBg: { height: 4, backgroundColor: '#1a1a1a', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00897B', borderRadius: 2 },
  progressLabel: { fontSize: 10, color: '#555', textAlign: 'right', marginTop: 4 },
  yusufWrap: { alignItems: 'center', height: 200, justifyContent: 'center' },
  lottie: { width: 200, height: 200 },
  wordCard: { marginHorizontal: 20, backgroundColor: '#111', borderRadius: 24, padding: 20, borderWidth: 0.5, borderColor: '#1e1e1e', marginBottom: 16, minHeight: 180 },
  contextLabel: { fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  arabicBig: { fontSize: 56, fontWeight: '800', color: '#fff', textAlign: 'right', lineHeight: 72, marginBottom: 4, paddingHorizontal: 8 },
  roman: { fontSize: 20, color: '#00897B', fontWeight: '500', marginBottom: 4 },
  english: { fontSize: 15, color: '#666' },
  exampleWrap: { marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: '#1e1e1e' },
  exampleAr: { fontSize: 14, color: '#00897B', marginBottom: 2 },
  exampleEn: { fontSize: 12, color: '#444', fontStyle: 'italic' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 20, marginBottom: 8 },
  ctrlBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#2a2a2a' },
  nextBtnActive: { borderColor: '#00897B', backgroundColor: 'rgba(0,137,123,0.1)' },
  micBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#00897B', alignItems: 'center', justifyContent: 'center' },
  micBtnRecording: { backgroundColor: '#FF4444' },
  micIcon: { fontSize: 26 },
  hint: { textAlign: 'center', fontSize: 12, color: '#333', paddingBottom: 40 },
  completionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  completionEmoji: { fontSize: 56, marginBottom: 8 },
  completionTitle: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 4 },
  completionSub: { fontSize: 16, color: '#666', marginBottom: 32 },
  completionStats: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 32, gap: 32, borderWidth: 0.5, borderColor: '#1e1e1e' },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 28, fontWeight: '800', color: '#00897B' },
  statLabel: { fontSize: 11, color: '#555', textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 0.5, backgroundColor: '#2a2a2a' },
  doneButton: { width: '100%', height: 56, backgroundColor: '#00897B', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  doneButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  levelUpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  levelUpCard: { backgroundColor: '#111', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  levelUpEmoji: { fontSize: 64, marginBottom: 8 },
  levelUpTitle: { fontSize: 18, color: '#888', marginBottom: 4 },
  levelUpLevel: { fontSize: 36, fontWeight: '800', marginBottom: 8 },
  levelUpSub: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 24 },
  levelUpButton: { backgroundColor: '#00897B', width: '100%', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  levelUpButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
