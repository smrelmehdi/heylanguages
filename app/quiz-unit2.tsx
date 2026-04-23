import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';

import LottieView from 'lottie-react-native';
import { supabase } from '../utils/supabase';
import { recordActivity } from '../utils/streak';
import type { QuizQuestion } from '../data/quiz-types';
import { QUIZ_PART1_QUESTIONS } from '../data/quiz-part1';
import { QUIZ_PART2_QUESTIONS } from '../data/quiz-part2';
import { QUIZ_UNIT6_QUESTIONS } from '../data/quiz-unit6';

import QuizIntro from '../components/quiz/QuizIntro';
import QuizProgress from '../components/quiz/QuizProgress';
import QuizResults from '../components/quiz/QuizResults';
import SceneReplay from '../components/quiz/SceneReplay';
import FillConversation from '../components/quiz/FillConversation';
import ListeningChallenge from '../components/quiz/ListeningChallenge';
import EmojiMatch from '../components/quiz/EmojiMatch';
import { theme } from '../constants/theme';

type Phase = 'intro' | 'quiz' | 'results';

// ── Shuffle: no two same formats adjacent ────────────────────────────────────
function shuffleNoAdjacentFormats(questions: QuizQuestion[]): QuizQuestion[] {
  const arr = [...questions];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i].format === arr[i + 1].format) {
      for (let j = i + 2; j < arr.length; j++) {
        if (arr[j].format !== arr[i].format) {
          [arr[i + 1], arr[j]] = [arr[j], arr[i + 1]];
          break;
        }
      }
    }
  }
  return arr;
}

export default function QuizUnit2Screen() {
  const router = useRouter();
  const { unit } = useLocalSearchParams<{ unit?: string }>();

  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerResult, setAnswerResult] = useState<'none' | 'correct' | 'wrong'>('none');
  const [xpEarned, setXpEarned] = useState(0);
  const [xpFloatKey, setXpFloatKey] = useState(0);
  const [showXpFloat, setShowXpFloat] = useState(false);

  // Refs to avoid stale closures when reading final state in timeouts
  const xpRef = useRef(0);
  const correctIdsRef = useRef(new Set<string>());
  const wrongIdsRef = useRef(new Set<string>());

  // Card entrance animation
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(18);
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  useEffect(() => {
    cardOpacity.value = 0; cardY.value = 18;
    cardOpacity.value = withTiming(1, { duration: 280 });
    cardY.value = withTiming(0, { duration: 280 });
  }, [currentIndex]);

  const quizTitle =
    unit === '2p2' ? 'Unit 2 Quiz · Part 2' :
    unit === '2p1' ? 'Unit 2 Quiz · Part 1' :
    unit === '6'   ? 'Unit 6 Quiz' :
    'Unit 2 Quiz';

  // ── Start ────────────────────────────────────────────────────────────────
  const startQuiz = () => {
    const base =
      unit === '2p2' && QUIZ_PART2_QUESTIONS.length > 0 ? QUIZ_PART2_QUESTIONS :
      unit === '6'   && QUIZ_UNIT6_QUESTIONS.length > 0  ? QUIZ_UNIT6_QUESTIONS :
      QUIZ_PART1_QUESTIONS;
    const shuffled = shuffleNoAdjacentFormats(base);
    setAllQuestions(base);
    setQuestions(shuffled);
    xpRef.current = 0;
    correctIdsRef.current.clear();
    wrongIdsRef.current.clear();
    setXpEarned(0);
    setCurrentIndex(0);
    setAnswerResult('none');
    setPhase('quiz');
  };

  // ── Answer handler ───────────────────────────────────────────────────────
  const handleAnswer = (correct: boolean) => {
    if (answerResult !== 'none') return;

    const q = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    if (correct) {
      xpRef.current += q.xpValue;
      correctIdsRef.current.add(q.id);
      setXpEarned(xpRef.current);
      setShowXpFloat(true);
      setXpFloatKey(k => k + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      wrongIdsRef.current.add(q.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setAnswerResult(correct ? 'correct' : 'wrong');

    setTimeout(() => {
      setShowXpFloat(false);
      setAnswerResult('none');

      if (isLastQuestion) {
        const perfect = wrongIdsRef.current.size === 0;
        if (perfect) {
          xpRef.current += 50;
          setXpEarned(xpRef.current);
        }
        saveQuizCompletion(xpRef.current);
        setPhase('results');
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, correct ? 500 : 2000);
  };

  // ── Save to DB ───────────────────────────────────────────────────────────
  const saveQuizCompletion = async (finalXp: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;

      const scenarioKey =
        unit === '2p1' ? 'quiz_u2_p1' :
        unit === '2p2' ? 'quiz_u2_p2' :
        unit === '6'   ? 'quiz_u6'    : null;

      if (scenarioKey) {
        const { data: existing } = await supabase
          .from('scenario_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('scenario', scenarioKey)
          .maybeSingle();

        if (!existing) {
          await supabase.from('scenario_progress').insert({
            user_id: userId,
            scenario: scenarioKey,
            dialect: 'gulf',
            completed: true,
            best_score: Math.round((correctIdsRef.current.size / allQuestions.length) * 100),
            attempts: 1,
          });
        } else {
          await supabase.from('scenario_progress').update({
            completed: true,
            best_score: Math.max(
              Math.round((correctIdsRef.current.size / allQuestions.length) * 100),
              0
            ),
          }).eq('id', existing.id);
        }
      }

      const { data: userData } = await supabase
        .from('users').select('xp').eq('id', userId).maybeSingle();
      await supabase
        .from('users').update({ xp: (userData?.xp ?? 0) + finalXp }).eq('id', userId);

      await recordActivity();
    } catch (err) {
      console.warn('Quiz save error:', err);
    }
  };

  // ── Retry missed questions ───────────────────────────────────────────────
  const handleRetry = () => {
    const missed = allQuestions.filter(q => wrongIdsRef.current.has(q.id));
    if (missed.length === 0) return;
    wrongIdsRef.current.clear();
    const shuffled = shuffleNoAdjacentFormats(missed);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setAnswerResult('none');
    setPhase('quiz');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <QuizIntro title={quizTitle} onStart={startQuiz} />
      </>
    );
  }

  if (phase === 'results') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <QuizResults
          correct={correctIdsRef.current.size}
          total={allQuestions.length}
          xpEarned={xpRef.current}
          hasMissed={wrongIdsRef.current.size > 0}
          onRetry={handleRetry}
          onHome={() => router.replace('/(tabs)')}
        />
      </>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => Alert.alert(
              'Leave Quiz?',
              'Your progress will be lost.',
              [
                { text: 'Keep Going', style: 'cancel' },
                { text: 'Leave', style: 'destructive', onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)') },
              ]
            )}
          >
            <ArrowLeft color={theme.colors.textPrimary} size={18} />
          </Pressable>

          <Text style={styles.headerTitle}>{quizTitle}</Text>

          <View style={styles.xpCounter}>
            <Text style={styles.xpCounterText}>⚡{xpEarned}</Text>
          </View>
        </View>

        {/* Progress */}
        <QuizProgress current={currentIndex + 1} total={questions.length} />

        {/* Question card */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[styles.card, cardStyle]} key={`card-${currentIndex}`}>

            {/* Format badge */}
            <View style={styles.formatBadge}>
              <Text style={styles.formatBadgeText}>{formatBadgeLabel(currentQuestion.format)}</Text>
            </View>

            {/* Question content */}
            {currentQuestion.format === 'scene_replay' && (
              <SceneReplay
                key={`sr-${currentIndex}`}
                question={currentQuestion}
                answerResult={answerResult}
                onAnswer={handleAnswer}
              />
            )}
            {currentQuestion.format === 'fill_conversation' && (
              <FillConversation
                key={`fc-${currentIndex}`}
                question={currentQuestion}
                answerResult={answerResult}
                onAnswer={handleAnswer}
              />
            )}
            {currentQuestion.format === 'listening' && (
              <ListeningChallenge
                key={`ls-${currentIndex}`}
                question={currentQuestion}
                answerResult={answerResult}
                onAnswer={handleAnswer}
              />
            )}
            {currentQuestion.format === 'emoji_match' && (
              <EmojiMatch
                key={`em-${currentIndex}`}
                question={currentQuestion}
                answerResult={answerResult}
                onAnswer={handleAnswer}
              />
            )}

          </Animated.View>

          {/* Answer result banner */}
          {answerResult !== 'none' && (
            <View style={[styles.resultBanner, answerResult === 'correct' ? styles.correctBanner : styles.wrongBanner]}>
              {answerResult === 'wrong' && (
                <LottieView
                  source={require('../assets/images/animations/yusuf-sad.json')}
                  autoPlay
                  loop={false}
                  style={styles.resultLottie}
                />
              )}
              <Text style={[styles.resultBannerText, answerResult === 'correct' ? styles.correctText : styles.wrongText]}>
                {answerResult === 'correct' ? '✓ Correct!' : '✗ Not quite — see the answer above'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* XP Float */}
        {showXpFloat && <XPFloat key={xpFloatKey} amount={10} />}

      </SafeAreaView>
    </>
  );
}

// ── XP Float animation ───────────────────────────────────────────────────────
function XPFloat({ amount }: { amount: number }) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(0, { duration: 700 });
    translateY.value = withTiming(-60, { duration: 700 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.xpFloatWrap, style]} pointerEvents="none">
      <Text style={styles.xpFloatText}>+{amount} XP</Text>
    </Animated.View>
  );
}

function formatBadgeLabel(format: string): string {
  switch (format) {
    case 'scene_replay':      return '🎭 Scene Replay';
    case 'fill_conversation': return '💬 Fill the Blank';
    case 'listening':         return '🎧 Listening';
    case 'emoji_match':       return '🔗 Emoji Match';
    default:                  return '';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.bgSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderDefault },
  headerTitle: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  xpCounter: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: theme.colors.borderDefault },
  xpCounterText: { color: theme.colors.accentWarm, fontSize: 13, fontWeight: theme.fontWeight.medium },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 12 },

  card: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 20, borderWidth: 1, borderColor: theme.colors.borderDefault, gap: 16 },
  formatBadge: { alignSelf: 'flex-start', backgroundColor: theme.colors.bgElevated, borderRadius: theme.radii.pill, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: theme.colors.borderDefault },
  formatBadgeText: { fontSize: theme.fontSize.caption, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium, letterSpacing: 1.5, textTransform: 'uppercase' },

  resultBanner: { borderRadius: theme.radii.sm, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', gap: 4 },
  resultLottie: { width: 56, height: 56 },
  correctBanner: { backgroundColor: 'rgba(125, 217, 154, 0.12)', borderWidth: 1, borderColor: theme.colors.accentSuccess },
  wrongBanner: { backgroundColor: 'rgba(229, 107, 111, 0.12)', borderWidth: 1, borderColor: theme.colors.accentDanger },
  resultBannerText: { fontSize: 14, fontWeight: theme.fontWeight.medium },
  correctText: { color: theme.colors.accentSuccess },
  wrongText: { color: theme.colors.accentDanger },

  xpFloatWrap: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 160 },
  xpFloatText: { fontSize: 22, fontWeight: theme.fontWeight.medium, color: theme.colors.accentWarm },
});
