import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { feedbackCorrect, feedbackWrong } from '../utils/feedback';
import { getQuizSrsSummary, prioritizeQuizItems, recordQuizSrsResult, type QuizSrsSummary } from '../utils/srs';

import PremiumRouteGate from '../components/PremiumRouteGate';
import { QUIZ_PART1_QUESTIONS } from '../data/quiz-part1';
import { QUIZ_PART2_QUESTIONS } from '../data/quiz-part2';
import type { QuizQuestion } from '../data/quiz-types';
import { QUIZ_UNIT6_QUESTIONS } from '../data/quiz-unit6';
import { useDialect } from '../contexts/DialectContext';
import type { DialectContent, DialogueTurn } from '../data/content-registry';
import { getQuizContentId } from '../utils/access';
import { recordActivity } from '../utils/streak';
import { buildCompletionKey, getCompletionKeyCandidates } from '../utils/progression';
import { supabase } from '../utils/supabase';

import EmojiMatch from '../components/quiz/EmojiMatch';
import FillConversation from '../components/quiz/FillConversation';
import ListeningChallenge from '../components/quiz/ListeningChallenge';
import QuizIntro from '../components/quiz/QuizIntro';
import QuizProgress from '../components/quiz/QuizProgress';
import QuizResults from '../components/quiz/QuizResults';
import SceneReplay from '../components/quiz/SceneReplay';
import { theme } from '../constants/theme';

type Phase = 'intro' | 'quiz' | 'results';

const UNIT2_PART1_SCENARIOS = ['Cafe', 'Taxi', 'Hotel'];
const UNIT2_PART2_SCENARIOS = ['Restaurant', 'Supermarket', 'Pharmacy'];
const EMOJI_POOL = ['☕', '🚕', '🏨', '🍽️', '🛒', '💊', '💬', '👋'];

const displayTurnArabic = (turn: DialogueTurn) => turn.displayArabic ?? turn.arabic;
const turnAudioText = (turn: DialogueTurn) => turn.audioText ?? turn.displayArabic ?? turn.arabic;
const turnKey = (turn: DialogueTurn) => displayTurnArabic(turn).replace(/\s+/g, ' ').trim();

const GENERIC_TURN_ARABIC = [
  'السلام عليكم',
  'وعليكم السلام',
  'أهلاً',
  'أهلاً بك',
  'أهلاً وسهلاً',
  'كيف حالك',
  'بخير، الله يسلمك',
  'شكراً',
  'شكراً جزيلاً',
  'تفضل',
  'حسناً',
  'مع السلامة',
];

const GENERIC_TURN_ENGLISH = [
  'peace be upon you',
  'and upon you peace',
  'hello',
  'welcome',
  'welcome to you',
  'how are you',
  'fine god keep you safe',
  'thank you',
  'thank you very much',
  'thanks',
  'here you go',
  'alright',
  'goodbye',
];

function isGenericTurn(turn: DialogueTurn) {
  const arabic = turnKey(turn).replace(/[،.!؟?]/g, '').trim();
  const english = turn.english.toLowerCase().replace(/[,.!?]/g, '').trim();
  return GENERIC_TURN_ARABIC.includes(arabic) || GENERIC_TURN_ENGLISH.includes(english);
}

function meaningfulTurns(turns: DialogueTurn[]) {
  const filtered = turns.filter(turn => !isGenericTurn(turn));
  return filtered.length > 0 ? filtered : turns;
}

function uniqueTurns(turns: DialogueTurn[], correct?: DialogueTurn) {
  const seen = new Set<string>();
  if (correct) seen.add(turnKey(correct));
  return turns.filter(turn => {
    const key = turnKey(turn);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function selectFollowUpPair(turns: DialogueTurn[]) {
  const pairs = turns
    .map((promptTurn, index) => ({ promptTurn, answerTurn: turns[index + 1] }))
    .filter(pair => pair.promptTurn.type !== 'user' && pair.answerTurn?.type === 'user');

  return pairs.find(pair => !isGenericTurn(pair.promptTurn) && !isGenericTurn(pair.answerTurn))
    ?? pairs.find(pair => !isGenericTurn(pair.answerTurn))
    ?? pairs[0]
    ?? null;
}

function selectBlankTurn(turns: DialogueTurn[]) {
  const userTurnsWithIndex = turns
    .map((turn, index) => ({ turn, index }))
    .filter(({ turn }) => turn.type === 'user');

  return userTurnsWithIndex.find(({ turn, index }) => index > 0 && !isGenericTurn(turn))
    ?? userTurnsWithIndex.find(({ turn }) => !isGenericTurn(turn))
    ?? userTurnsWithIndex[0]
    ?? null;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeOptions(correct: DialogueTurn, distractors: DialogueTurn[], fallbackDistractors: DialogueTurn[] = []) {
  const wrongTurns = uniqueTurns([...meaningfulTurns(distractors), ...distractors, ...fallbackDistractors], correct)
    .slice(0, 3);
  return shuffle([
    { arabic: displayTurnArabic(correct), transliteration: correct.transliteration, isCorrect: true },
    ...shuffle(wrongTurns)
      .map(turn => ({ arabic: displayTurnArabic(turn), transliteration: turn.transliteration, isCorrect: false })),
  ]);
}

function buildDialectUnit2Quiz(
  scenarioNames: string[],
  content: DialectContent,
  dialect: string,
): QuizQuestion[] {
  const scenarioEntries = scenarioNames
    .map(name => ({ name, turns: content.scenarios[name] ?? [] }))
    .filter(entry => entry.turns.length > 0);
  const allTurns = scenarioEntries.flatMap(entry => entry.turns);
  const userTurns = allTurns.filter(turn => turn.type === 'user');
  const npcTurns = allTurns.filter(turn => turn.type !== 'user');
  const questions: QuizQuestion[] = [];

  scenarioEntries.forEach((entry, scenarioIndex) => {
    const sceneImage = content.sceneImages[entry.name] ?? null;
    const scenarioUserTurns = entry.turns.filter(turn => turn.type === 'user');
    const scenarioNpcTurns = entry.turns.filter(turn => turn.type !== 'user');
    const scenarioQuestionTurns = uniqueTurns([...scenarioUserTurns, ...scenarioNpcTurns]);
    const followUpPair = selectFollowUpPair(entry.turns);

    if (followUpPair) {
      const { promptTurn, answerTurn } = followUpPair;
      questions.push({
        id: `${dialect}_${entry.name}_scene`,
        format: 'scene_replay',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: 10,
        sceneImage,
        audioFile: promptTurn.audio ?? null,
        audioText: turnAudioText(promptTurn),
        prompt: 'What is the correct response?',
        options: makeOptions(answerTurn, scenarioUserTurns, userTurns),
      });
    }

    const blank = selectBlankTurn(entry.turns);
    if (blank) {
      const blankTurn = blank.turn;
      const start = Math.max(0, blank.index - 1);
      const dialogue = entry.turns.slice(start, Math.min(entry.turns.length, blank.index + 2)).map((turn, offset) => ({
        speaker: turn.type === 'user' ? 'yusuf' as const : 'npc' as const,
        arabic: displayTurnArabic(turn),
        transliteration: turn.transliteration,
        isBlank: start + offset === blank.index,
      }));
      questions.push({
        id: `${dialect}_${entry.name}_fill`,
        format: 'fill_conversation',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: 10,
        dialogue,
        options: makeOptions(blankTurn, scenarioUserTurns, userTurns),
      });
    }

    const listeningCandidates = meaningfulTurns(scenarioUserTurns);
    const listeningTurn = listeningCandidates[scenarioIndex % Math.max(1, listeningCandidates.length)];
    if (listeningTurn) {
      questions.push({
        id: `${dialect}_${entry.name}_listen`,
        format: 'listening',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: 10,
        audioFile: listeningTurn.audio ?? null,
        audioText: turnAudioText(listeningTurn),
        options: makeOptions(listeningTurn, scenarioQuestionTurns, [...userTurns, ...npcTurns]),
      });
    }
  });

  const representativeUserTurns = uniqueTurns([
    ...scenarioEntries
      .map(entry => meaningfulTurns(entry.turns.filter(turn => turn.type === 'user'))[0])
      .filter((turn): turn is DialogueTurn => Boolean(turn)),
    ...meaningfulTurns(userTurns),
    ...userTurns,
  ]);
  const pairs = representativeUserTurns.slice(0, 4).map((turn, index) => ({
    arabic: displayTurnArabic(turn),
    transliteration: turn.transliteration,
    emoji: EMOJI_POOL[index] ?? '💬',
  }));
  if (pairs.length === 4) {
    questions.push({
      id: `${dialect}_${scenarioNames.join('_')}_emoji`,
      format: 'emoji_match',
      scenarioSource: scenarioNames.join(',').toLowerCase(),
      xpValue: 10,
      pairs,
    });
  }

  return questions;
}

// ── Shuffle: no two same formats adjacent ────────────────────────────────────
function shuffleNoAdjacentFormats(questions: QuizQuestion[]): QuizQuestion[] {
  const arr = [...questions];
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
  const { dialect, content } = useDialect();
  const routeContentId = getQuizContentId(unit);

  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerResult, setAnswerResult] = useState<'none' | 'correct' | 'wrong'>('none');
  const [xpEarned, setXpEarned] = useState(0);
  const [xpFloatKey, setXpFloatKey] = useState(0);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [srsSummary, setSrsSummary] = useState<QuizSrsSummary | null>(null);

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
  const startQuiz = async () => {
    const scenarioNames = unit === '2p2' ? UNIT2_PART2_SCENARIOS : UNIT2_PART1_SCENARIOS;
    const dialectQuestions = buildDialectUnit2Quiz(scenarioNames, content, dialect);
    const base =
      unit === '6' && dialect === 'gulf' ? QUIZ_UNIT6_QUESTIONS :
      unit === '6' ? [] :
      dialect === 'gulf' && unit === '2p1' && QUIZ_PART1_QUESTIONS.length > 0 ? QUIZ_PART1_QUESTIONS :
      dialect === 'gulf' && unit === '2p2' && QUIZ_PART2_QUESTIONS.length > 0 ? QUIZ_PART2_QUESTIONS :
      dialectQuestions;
    if (base.length === 0) {
      Alert.alert('Quiz unavailable', 'This dialect does not have quiz content available yet.');
      return;
    }
    const prioritized = await prioritizeQuizItems(base, question => question.id);
    const shuffled = shuffleNoAdjacentFormats(prioritized);
    setAllQuestions(base);
    setQuestions(shuffled);
    setSrsSummary(await getQuizSrsSummary(shuffled.map(question => question.id)));
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
    recordQuizSrsResult(q.id, correct).catch(console.warn);

    if (correct) {
      xpRef.current += q.xpValue;
      correctIdsRef.current.add(q.id);
      setXpEarned(xpRef.current);
      setShowXpFloat(true);
      setXpFloatKey(k => k + 1);
      feedbackCorrect();
    } else {
      wrongIdsRef.current.add(q.id);
      feedbackWrong();
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
      if (!routeContentId) return;

      const unitId = unit === '2p1' || unit === '2p2' ? 'unit-2' : `unit-${unit ?? '2'}`;
      const scenarioKey = buildCompletionKey(dialect, unitId, routeContentId);
      const legacyCandidates = getCompletionKeyCandidates(dialect, routeContentId);

      if (!session) {
        const raw = await AsyncStorage.getItem('guest_progress');
        const progress = raw ? JSON.parse(raw) : {};
        const alreadyCompleted = legacyCandidates.some(key => progress[key] === true);
        progress[scenarioKey] = true;
        await AsyncStorage.setItem('guest_progress', JSON.stringify(progress));
        if (!alreadyCompleted) await recordActivity();
        return;
      }

      const userId = session.user.id;
      const { data: existing } = await supabase
        .from('scenario_progress')
        .select('id')
        .eq('user_id', userId)
        .in('scenario', legacyCandidates.length > 0 ? legacyCandidates : [scenarioKey])
        .maybeSingle();

      if (!existing) {
        await supabase.from('scenario_progress').insert({
          user_id: userId,
          scenario: scenarioKey,
          dialect,
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

      if (!existing && finalXp > 0) {
        const { data: userData } = await supabase
          .from('users').select('xp').eq('id', userId).maybeSingle();
        await supabase
          .from('users').update({ xp: (userData?.xp ?? 0) + finalXp }).eq('id', userId);
      }

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
      <PremiumRouteGate contentId={routeContentId} contentType="quiz" contentLabel={quizTitle}>
        <Stack.Screen options={{ headerShown: false }} />
        <QuizIntro title={quizTitle} onStart={startQuiz} />
      </PremiumRouteGate>
    );
  }

  if (phase === 'results') {
    return (
      <PremiumRouteGate contentId={routeContentId} contentType="quiz" contentLabel={quizTitle}>
        <Stack.Screen options={{ headerShown: false }} />
        <QuizResults
          correct={correctIdsRef.current.size}
          total={allQuestions.length}
          xpEarned={xpRef.current}
          hasMissed={wrongIdsRef.current.size > 0}
          srsSummary={srsSummary}
          onRetry={handleRetry}
          onHome={() => router.replace('/(tabs)')}
        />
      </PremiumRouteGate>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return (
      <PremiumRouteGate contentId={routeContentId} contentType="quiz" contentLabel={quizTitle}>
        <Stack.Screen options={{ headerShown: false }} />
      </PremiumRouteGate>
    );
  }

  return (
    <PremiumRouteGate contentId={routeContentId} contentType="quiz" contentLabel={quizTitle}>
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
              <Text style={[styles.resultBannerText, answerResult === 'correct' ? styles.correctText : styles.wrongText]}>
                {answerResult === 'correct' ? '✓ Correct!' : '✗ Not quite — see the answer above'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* XP Float */}
        {showXpFloat && <XPFloat key={xpFloatKey} amount={10} />}

      </SafeAreaView>
    </PremiumRouteGate>
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
  correctBanner: { backgroundColor: 'rgba(125, 217, 154, 0.12)', borderWidth: 1, borderColor: theme.colors.accentSuccess },
  wrongBanner: { backgroundColor: 'rgba(229, 107, 111, 0.12)', borderWidth: 1, borderColor: theme.colors.accentDanger },
  resultBannerText: { fontSize: 14, fontWeight: theme.fontWeight.medium },
  correctText: { color: theme.colors.accentSuccess },
  wrongText: { color: theme.colors.accentDanger },

  xpFloatWrap: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 160 },
  xpFloatText: { fontSize: 22, fontWeight: theme.fontWeight.medium, color: theme.colors.accentWarm },
});
