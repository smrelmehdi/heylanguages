import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumRouteGate from '../components/PremiumRouteGate';
import { theme } from '../constants/theme';
import type { Word } from '../constants/words';
import {
    BASIC_WORDS,
    GRAMMAR_ADJECTIVES_WORDS,
    GRAMMAR_NEGATION_WORDS,
    GRAMMAR_PAST_VERBS_WORDS,
    GRAMMAR_POSSESSIVES_WORDS,
    GRAMMAR_PRESENT_VERBS_WORDS,
    GRAMMAR_PRONOUNS_WORDS,
    GRAMMAR_QUESTIONS_WORDS,
    GRAMMAR_SENTENCES_WORDS,
    GRAMMAR_THIS_THAT_WORDS,
    GRAMMAR_WANT_NEED_WORDS,
    GREETINGS_WORDS, INTRO_WORDS,
    NUMBERS_11_20_WORDS,
    NUMBERS_1_5_WORDS, NUMBERS_6_10_WORDS,
    NUMBERS_AGE_WORDS,
    NUMBERS_DATES_WORDS,
    NUMBERS_DAYS_WORDS,
    NUMBERS_HOURS_WORDS,
    NUMBERS_MINUTES_WORDS,
    NUMBERS_MONTHS_WORDS,
    NUMBERS_ORDERING_WORDS,
    NUMBERS_PHONE_WORDS,
    NUMBERS_PRICES_WORDS,
    NUMBERS_TENS_WORDS,
    NUMBERS_TOGETHER_WORDS,
} from '../constants/words';
import { useDialect } from '../contexts/DialectContext';
import { stripTashkeel } from '../utils/arabic';
import { getQuizContentId } from '../utils/access';
import { feedbackCorrect, feedbackStreak, feedbackWrong } from '../utils/feedback';
import { getQuizSrsSummary, recordQuizSrsResult, selectQuizItems, type QuizSrsSummary } from '../utils/srs';
import { recordActivity } from '../utils/streak';
import { supabase } from '../utils/supabase';
import { playLocalAudio, speakArabic, stopAudio } from '../utils/tts';

type QuestionType = 'mc_ar_to_en' | 'mc_en_to_ar' | 'audio';

interface Question {
  id: string;
  type: QuestionType;
  arabic: string;
  audioText: string;
  transliteration: string;
  english: string;
  options: string[];
  correctAnswer: string;
  audio?: any;
}

const getDisplayArabic = (word: Word) => word.displayArabic ?? word.arabic;
const getAudioText = (word: Word) => word.audioText ?? word.displayArabic ?? word.arabic;
const shuffleOptions = (options: string[]) => [...options].sort(() => Math.random() - 0.5);

function buildWordSrsId(scope: string, word: Word): string {
  return `${scope}:${getDisplayArabic(word)}:${word.english}`;
}

function generateQuiz(selected: Word[], allWords: Word[], count = 15, scope = 'quiz'): Question[] {
  const arToEnCutoff = Math.round(count * 8 / 15);
  const enToArCutoff = Math.round(count * 12 / 15);

  return selected.map((word, index) => {
    let type: QuestionType;
    if (index < arToEnCutoff) type = 'mc_ar_to_en';
    else if (index < enToArCutoff) type = 'mc_en_to_ar';
    else type = 'audio';

    const displayArabic = getDisplayArabic(word);
    const audioText = getAudioText(word);
    const otherWords = allWords.filter(w => getDisplayArabic(w) !== displayArabic);
    const wrongWords = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);

    let options: string[];
    let correctAnswer: string;

    if (type === 'mc_en_to_ar') {
      correctAnswer = displayArabic;
      options = [displayArabic, ...wrongWords.map(getDisplayArabic)].sort(() => Math.random() - 0.5);
    } else {
      correctAnswer = word.english;
      options = [word.english, ...wrongWords.map(w => w.english)].sort(() => Math.random() - 0.5);
    }

    return {
      id: buildWordSrsId(scope, word),
      type,
      arabic: displayArabic,
      audioText,
      transliteration: word.transliteration,
      english: word.english,
      options,
      correctAnswer,
      audio: word.audio,
    };
  });
}

function buildQuestion(type: QuestionType, word: Word, wrongOptions: string[], scope: string): Question {
  const displayArabic = getDisplayArabic(word);
  const correctAnswer = type === 'mc_en_to_ar' ? displayArabic : word.english;

  return {
    id: buildWordSrsId(scope, word),
    type,
    arabic: displayArabic,
    audioText: getAudioText(word),
    transliteration: word.transliteration,
    english: word.english,
    options: shuffleOptions([correctAnswer, ...wrongOptions]),
    correctAnswer,
    audio: word.audio,
  };
}

function generateUnit1Quiz(lessonWords: { basic: Word[]; greetings: Word[]; intro: Word[] }, scopePrefix = 'unit1'): Question[] {
  const BASIC = lessonWords.basic;
  const GREETINGS = lessonWords.greetings;
  const INTRO = lessonWords.intro;
  if (BASIC.length < 20 || GREETINGS.length < 15 || INTRO.length < 15) return [];

  return [
    buildQuestion('mc_ar_to_en', BASIC[0], [BASIC[1].english, BASIC[4].english, BASIC[13].english], scopePrefix),
    buildQuestion('mc_ar_to_en', BASIC[1], [BASIC[13].english, BASIC[14].english, BASIC[15].english], scopePrefix),
    buildQuestion('mc_ar_to_en', BASIC[12], [BASIC[11].english, BASIC[10].english, GREETINGS[11].english], scopePrefix),
    buildQuestion('mc_ar_to_en', INTRO[0], [INTRO[2].english, INTRO[4].english, INTRO[8].english], scopePrefix),
    buildQuestion('mc_ar_to_en', INTRO[3], [INTRO[5].english, INTRO[1].english, INTRO[9].english], scopePrefix),
    buildQuestion('mc_ar_to_en', INTRO[10], [INTRO[11].english, INTRO[12].english, INTRO[14].english], scopePrefix),
    buildQuestion('mc_en_to_ar', BASIC[13], [getDisplayArabic(BASIC[1]), getDisplayArabic(BASIC[14]), getDisplayArabic(BASIC[15])], scopePrefix),
    buildQuestion('mc_en_to_ar', BASIC[9], [getDisplayArabic(BASIC[10]), getDisplayArabic(BASIC[18]), getDisplayArabic(BASIC[19])], scopePrefix),
    buildQuestion('mc_en_to_ar', INTRO[4], [getDisplayArabic(INTRO[2]), getDisplayArabic(INTRO[6]), getDisplayArabic(INTRO[8])], scopePrefix),
    buildQuestion('mc_en_to_ar', INTRO[5], [getDisplayArabic(INTRO[3]), getDisplayArabic(INTRO[1]), getDisplayArabic(INTRO[9])], scopePrefix),
    buildQuestion('mc_en_to_ar', INTRO[11], [getDisplayArabic(INTRO[10]), getDisplayArabic(INTRO[12]), getDisplayArabic(INTRO[14])], scopePrefix),
    buildQuestion('audio', BASIC[4], [BASIC[3].english, BASIC[5].english, BASIC[15].english], scopePrefix),
    buildQuestion('audio', GREETINGS[11], [GREETINGS[0].english, GREETINGS[7].english, GREETINGS[14].english], scopePrefix),
    buildQuestion('audio', INTRO[7], [INTRO[6].english, INTRO[5].english, INTRO[3].english], scopePrefix),
    buildQuestion('audio', INTRO[14], [BASIC[11].english, GREETINGS[14].english, INTRO[0].english], scopePrefix),
  ];
}

export default function QuizScreen() {
  const router = useRouter();
  const { unit } = useLocalSearchParams<{ unit?: string }>();
  const { dialect, content } = useDialect();
  const routeContentId = getQuizContentId(unit);
  const routeLabel = unit ? `Unit ${unit} Quiz` : 'Unit 1 Quiz';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [srsSummary, setSrsSummary] = useState<QuizSrsSummary | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const currentQuestion = questions[currentIndex];
  const arabicPromptLength = currentQuestion ? stripTashkeel(currentQuestion.arabic).length : 0;
  const arabicPromptSize =
    arabicPromptLength <= 8 ? 'short' :
    arabicPromptLength <= 18 ? 'medium' :
    'long';
  const arabicPromptLineLimit = arabicPromptSize === 'short' ? 1 : arabicPromptSize === 'medium' ? 2 : 3;
  const answeredCount = currentIndex + (selectedAnswer ? 1 : 0);
  const missedCount = answeredCount - correctCount;
  const progress = currentIndex / questions.length;

  useEffect(() => {
    let cancelled = false;

    const loadQuestions = async () => {
      setIsLoadingQuiz(true);

      if (dialect === 'gulf' && unit === '4') {
        const allUnit4Words = [
          ...NUMBERS_1_5_WORDS, ...NUMBERS_6_10_WORDS, ...NUMBERS_11_20_WORDS, ...NUMBERS_TENS_WORDS,
          ...NUMBERS_AGE_WORDS, ...NUMBERS_PRICES_WORDS, ...NUMBERS_PHONE_WORDS, ...NUMBERS_HOURS_WORDS,
          ...NUMBERS_MINUTES_WORDS, ...NUMBERS_DAYS_WORDS, ...NUMBERS_MONTHS_WORDS, ...NUMBERS_DATES_WORDS,
          ...NUMBERS_ORDERING_WORDS, ...NUMBERS_TOGETHER_WORDS,
        ];
        const selected = await selectQuizItems(allUnit4Words, word => buildWordSrsId('unit4', word), 15);
        if (!cancelled) {
          const builtQuestions = generateQuiz(selected, allUnit4Words, 15, 'unit4');
          setQuestions(builtQuestions);
          setSrsSummary(await getQuizSrsSummary(builtQuestions.map(question => question.id)));
        }
      } else if (dialect === 'gulf' && unit === '5') {
        const allUnit5Words = [
          ...GRAMMAR_PRONOUNS_WORDS, ...GRAMMAR_THIS_THAT_WORDS, ...GRAMMAR_POSSESSIVES_WORDS,
          ...GRAMMAR_PRESENT_VERBS_WORDS, ...GRAMMAR_PAST_VERBS_WORDS, ...GRAMMAR_WANT_NEED_WORDS,
          ...GRAMMAR_QUESTIONS_WORDS, ...GRAMMAR_NEGATION_WORDS, ...GRAMMAR_ADJECTIVES_WORDS,
          ...GRAMMAR_SENTENCES_WORDS,
        ];
        const selected = await selectQuizItems(allUnit5Words, word => buildWordSrsId('unit5', word), 18);
        if (!cancelled) {
          const builtQuestions = generateQuiz(selected, allUnit5Words, 18, 'unit5');
          setQuestions(builtQuestions);
          setSrsSummary(await getQuizSrsSummary(builtQuestions.map(question => question.id)));
        }
      } else {
        if (!cancelled) {
          const builtQuestions = generateUnit1Quiz(content.lessons, `${dialect}_unit1`);
          setQuestions(builtQuestions);
          setSrsSummary(await getQuizSrsSummary(builtQuestions.map(question => question.id)));
        }
      }

      if (!cancelled) setIsLoadingQuiz(false);
    };

    loadQuestions().catch(error => {
      console.warn('Quiz load error:', error);
      if (!cancelled) {
        const builtQuestions = generateUnit1Quiz(content.lessons, `${dialect}_unit1`);
        setQuestions(builtQuestions);
        setSrsSummary(null);
        setIsLoadingQuiz(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [unit, dialect, content]);

  useEffect(() => {
    if (currentQuestion?.type === 'audio') {
      const t = setTimeout(() => {
        if (currentQuestion.audio) {
          playLocalAudio(currentQuestion.audio);
        } else {
          speakArabic(currentQuestion.audioText, content.voiceId);
        }
      }, 400);
      return () => clearTimeout(t);
    }
  }, [currentIndex]);

  useEffect(() => () => { stopAudio(); }, []);

  useEffect(() => {
    if (!completed) return;
    recordActivity().catch(console.warn);
  }, [completed]);

  useEffect(() => {
    if (!completed || !unit) return;
    const saveQuizCompletion = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const scenarioKey = unit === '2p1' ? 'quiz_u2_p1' : unit === '2p2' ? 'quiz_u2_p2' : unit === '4' ? 'quiz_u4' : unit === '5' ? 'quiz_u5' : null;
        if (!scenarioKey) return;
        const { data: existing } = await supabase
          .from('scenario_progress')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('scenario', scenarioKey)
          .maybeSingle();
        if (!existing) {
          await supabase.from('scenario_progress').insert({
            user_id: session.user.id,
            scenario: scenarioKey,
            dialect,
            completed: true,
            best_score: Math.round((correctCount / questions.length) * 100),
            attempts: 1,
          });
        }
        // Save XP (always, since quiz can be retaken for practice)
        if (xpEarned > 0) {
          const { data: userData } = await supabase.from('users').select('xp').eq('id', session.user.id).single();
          await supabase.from('users').update({ xp: (userData?.xp ?? 0) + xpEarned }).eq('id', session.user.id);
        }
      } catch (err) {
        console.warn('Quiz save error:', err);
      }
    };
    saveQuizCompletion();
  }, [completed]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    const correct = answer === currentQuestion.correctAnswer;
    recordQuizSrsResult(currentQuestion.id, correct).catch(console.warn);

    setSelectedAnswer(answer);
    setIsCorrect(correct);

    if (correct) {
      setXpEarned(xp => xp + 10);
      setCorrectCount(c => c + 1);
      setCurrentStreak(s => {
        const next = s + 1;
        if (next > 0 && next % 3 === 0) {
          feedbackStreak();
        } else {
          feedbackCorrect();
        }
        return next;
      });
    } else {
      setCurrentStreak(0);
      feedbackWrong();
    }
  };

  const handleContinue = () => {
    if (!selectedAnswer) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setCompleted(true);
    }
  };

  const handlePlayAudio = () => {
    if (currentQuestion.audio) {
      playLocalAudio(currentQuestion.audio);
    } else {
      speakArabic(currentQuestion.audioText, content.voiceId);
    }
  };

  const handleRetry = () => {
    setCompleted(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setXpEarned(0);
    setCorrectCount(0);
  };

  if (isLoadingQuiz || !currentQuestion) {
    return (
      <PremiumRouteGate contentId={routeContentId} contentLabel={routeLabel}>
        <SafeAreaView style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingTitle}>Building your review…</Text>
            <Text style={styles.loadingSub}>Weak and overdue words come first.</Text>
          </View>
        </SafeAreaView>
      </PremiumRouteGate>
    );
  }

  // ─── Completion screen ───
  if (completed) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const grade =
      percentage >= 80 ? '🌟 Excellent!' :
      percentage >= 60 ? '👍 Good job!' :
      '💪 Keep practicing!';

    return (
      <PremiumRouteGate contentId={routeContentId} contentLabel={routeLabel}>
        <SafeAreaView style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.completionContainer}>
          <Text style={styles.gradeText}>{grade}</Text>
          <Text style={styles.scoreText}>{percentage}%</Text>
          <Text style={styles.scoreSub}>{correctCount} / {questions.length} correct</Text>

          <View style={styles.completionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>+{xpEarned}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{questions.length - correctCount}</Text>
              <Text style={styles.statLabel}>Missed</Text>
            </View>
          </View>

          <Pressable style={styles.doneButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.doneButtonText}>Back to Home</Text>
          </Pressable>

          {srsSummary && (
            <View style={styles.srsSummaryCard}>
              <Text style={styles.srsSummaryTitle}>Review impact</Text>
              <Text style={styles.srsSummaryText}>{srsSummary.dueCount} due items, {srsSummary.weakCount} weak items, {srsSummary.unseenCount} fresh items.</Text>
            </View>
          )}

          {percentage < 80 && (
            <Pressable style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          )}
          </View>
        </SafeAreaView>
      </PremiumRouteGate>
    );
  }

  // ─── Quiz screen ───
  return (
    <PremiumRouteGate contentId={routeContentId} contentLabel={routeLabel}>
      <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.textPrimary} size={18} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{
            unit === '2p1' ? 'Unit 2 Quiz · Part 1' :
            unit === '2p2' ? 'Unit 2 Quiz · Part 2' :
            unit === '3'   ? 'Unit 3 Quiz'           :
            unit === '4'   ? 'Unit 4 Quiz'           :
            unit === '5'   ? 'Unit 5 Quiz'           :
            'Unit 1 Quiz'
          }</Text>
          <Text style={styles.headerSub}>{currentIndex + 1} / {questions.length}</Text>
        </View>
        <View style={styles.scoreCounter}>
          <Text style={styles.scoreCorrect}>{correctCount}✓</Text>
          <Text style={styles.scoreWrong}> {missedCount}✗</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Question prompt */}
      <View style={styles.promptRow}>
        <Text style={styles.promptText}>
          {currentQuestion.type === 'mc_ar_to_en' && 'What does this mean?'}
          {currentQuestion.type === 'mc_en_to_ar' && 'Say it in Arabic!'}
          {currentQuestion.type === 'audio' && 'What did you hear?'}
        </Text>
      </View>

      {/* Question card */}
      <View style={styles.questionCard}>
        {currentQuestion.type === 'mc_ar_to_en' && (
          <View style={styles.arabicQuestion}>
            <Text
              style={[
                styles.arabicBig,
                arabicPromptSize === 'medium' && styles.arabicMedium,
                arabicPromptSize === 'long' && styles.arabicLong,
              ]}
              adjustsFontSizeToFit
              numberOfLines={arabicPromptLineLimit}
              minimumFontScale={0.65}
            >
              {stripTashkeel(currentQuestion.arabic)}
            </Text>
            <Text style={styles.romanText}>{currentQuestion.transliteration}</Text>
          </View>
        )}

        {currentQuestion.type === 'mc_en_to_ar' && (
          <View style={styles.englishQuestion}>
            <Text style={styles.englishBig}>{currentQuestion.english}</Text>
          </View>
        )}

        {currentQuestion.type === 'audio' && (
          <Pressable style={styles.audioButton} onPress={handlePlayAudio}>
            <Text style={styles.audioIcon}>🔊</Text>
            <Text style={styles.audioText}>Tap to hear</Text>
          </Pressable>
        )}
      </View>

      {/* Answer options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, i) => {
          let bgColor: string = theme.colors.bgSurface;
          let borderColor: string = theme.colors.borderDefault;
          let textColor: string = theme.colors.textPrimary;
          let isOptionCorrect = false;
          let isOptionWrong = false;

          if (selectedAnswer) {
            if (option === currentQuestion.correctAnswer) {
              bgColor = 'rgba(125, 217, 154, 0.15)';
              borderColor = theme.colors.accentSuccess;
              textColor = theme.colors.accentSuccess;
              isOptionCorrect = true;
            } else if (option === selectedAnswer && !isCorrect) {
              bgColor = 'rgba(229, 107, 111, 0.15)';
              borderColor = theme.colors.accentDanger;
              textColor = theme.colors.accentDanger;
              isOptionWrong = true;
            }
          }

          return (
            <Pressable
              key={i}
              style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
              onPress={() => handleAnswer(option)}
              disabled={!!selectedAnswer}
            >
              <View style={[
                styles.optionLetter,
                isOptionCorrect && styles.optionLetterCorrect,
                isOptionWrong && styles.optionLetterWrong,
              ]}>
                <Text style={styles.optionLetterText}>{['A', 'B', 'C', 'D'][i]}</Text>
              </View>
              <Text style={[styles.optionText, { color: textColor }]}>{stripTashkeel(option)}</Text>
              {isOptionCorrect && <Text style={styles.correctIcon}>✓</Text>}
              {isOptionWrong && <Text style={styles.wrongIcon}>✗</Text>}
            </Pressable>
          );
        })}
      </View>

      {/* Feedback panel */}
      {selectedAnswer && (
        <Animated.View
          entering={FadeIn}
          style={[
            styles.feedbackPanel,
            isCorrect ? styles.feedbackPanelCorrect : styles.feedbackPanelWrong,
          ]}
        >
          <View style={styles.feedbackCopy}>
            <Text style={[styles.feedbackTitle, { color: isCorrect ? theme.colors.accentSuccess : theme.colors.accentDanger }]}>
              {isCorrect ? 'ممتاز!' : 'Almost'}
            </Text>
            <Text style={styles.feedbackSubtitle}>
              {isCorrect ? 'Correct' : `Correct answer: ${currentQuestion.correctAnswer}`}
            </Text>
          </View>
          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </Animated.View>
      )}

      </SafeAreaView>
    </PremiumRouteGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingTitle: { fontSize: 24, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 8 },
  loadingSub: { fontSize: 15, color: theme.colors.textTertiary, textAlign: 'center' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.bgSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderDefault },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  headerSub: { fontSize: theme.fontSize.label, color: theme.colors.textTertiary, marginTop: 1 },
  scoreCounter: { flexDirection: 'row', alignItems: 'center' },
  scoreCorrect: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.accentSuccess },
  scoreWrong: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.accentDanger },

  // Progress
  progressWrap: { paddingHorizontal: 20, marginBottom: 12 },
  progressBg: { height: 4, backgroundColor: theme.colors.bgBase, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.colors.accentPrimary, borderRadius: 2 },

  promptRow: { paddingHorizontal: 20, marginBottom: 12, marginTop: 4 },
  promptText: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center' },

  // Question card
  questionCard: { marginHorizontal: 20, backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 22, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.borderDefault, minHeight: 136, alignItems: 'center', justifyContent: 'center' },
  arabicQuestion: { alignItems: 'center', width: '100%' },
  arabicBig: { fontSize: 48, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center', lineHeight: 58, marginBottom: 8, writingDirection: 'rtl' },
  arabicMedium: { fontSize: 38, lineHeight: 48 },
  arabicLong: { fontSize: 30, lineHeight: 40 },
  romanText: { fontSize: 16, color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium, textAlign: 'center', lineHeight: 22 },
  englishQuestion: { alignItems: 'center' },
  englishBig: { fontSize: 28, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center' },
  audioButton: { alignItems: 'center', padding: 12 },
  audioIcon: { fontSize: 44, marginBottom: 8 },
  audioText: { fontSize: 14, color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium },

  // Feedback
  feedbackPanel: { marginHorizontal: 20, marginTop: 14, borderRadius: theme.radii.lg, padding: 16, borderWidth: 1, gap: 14 },
  feedbackPanelCorrect: { backgroundColor: 'rgba(125, 217, 154, 0.14)', borderColor: theme.colors.accentSuccess },
  feedbackPanelWrong: { backgroundColor: 'rgba(229, 107, 111, 0.14)', borderColor: theme.colors.accentDanger },
  feedbackCopy: { gap: 3 },
  feedbackTitle: { fontSize: 22, fontWeight: theme.fontWeight.medium },
  feedbackSubtitle: { fontSize: 15, color: theme.colors.textPrimary, lineHeight: 21 },
  continueButton: { minHeight: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.accentPrimary, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { color: theme.colors.bgBase, fontSize: 17, fontWeight: theme.fontWeight.medium },

  // Options
  optionsContainer: { paddingHorizontal: 20, gap: 10 },
  optionBtn: { paddingHorizontal: 18, paddingVertical: 16, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.borderDefault, backgroundColor: theme.colors.bgSurface, flexDirection: 'row', alignItems: 'center', minHeight: 66 },
  optionLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionLetterCorrect: { backgroundColor: theme.colors.accentSuccess },
  optionLetterWrong: { backgroundColor: theme.colors.accentDanger },
  optionLetterText: { fontSize: 13, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  optionText: { fontSize: 16, fontWeight: theme.fontWeight.medium, flex: 1, lineHeight: 22, flexShrink: 1 },
  correctIcon: { fontSize: 18, color: theme.colors.accentSuccess },
  wrongIcon: { fontSize: 18, color: theme.colors.accentDanger },

  // Completion
  completionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  gradeText: { fontSize: 24, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 8 },
  scoreText: { fontSize: 64, fontWeight: theme.fontWeight.medium, color: theme.colors.textAccent, lineHeight: 72 },
  scoreSub: { fontSize: 16, color: theme.colors.textTertiary, marginBottom: 32 },
  completionStats: { flexDirection: 'row', backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 20, marginBottom: 32, gap: 24, borderWidth: 1, borderColor: theme.colors.borderDefault },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: theme.fontWeight.medium, color: theme.colors.textAccent },
  statLabel: { fontSize: theme.fontSize.label, color: theme.colors.textTertiary, textTransform: 'uppercase', marginTop: 2, letterSpacing: 1.5 },
  statDivider: { width: 0.5, backgroundColor: theme.colors.borderDefault },
  srsSummaryCard: { width: '100%', backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.borderDefault, marginBottom: 12 },
  srsSummaryTitle: { fontSize: 15, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 6 },
  srsSummaryText: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  doneButton: { width: '100%', height: 56, backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  doneButtonText: { color: theme.colors.bgBase, fontSize: 17, fontWeight: theme.fontWeight.medium },
  retryButton: { width: '100%', height: 48, alignItems: 'center', justifyContent: 'center' },
  retryText: { color: theme.colors.textTertiary, fontSize: 15 },
});
