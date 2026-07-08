import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { recordActivity } from '../utils/streak';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import { speakArabic, playLocalAudio, stopAudio } from '../utils/tts';
import { stripTashkeel } from '../utils/arabic';
import { theme } from '../constants/theme';
import {
  BASIC_WORDS, GREETINGS_WORDS, INTRO_WORDS,
  NUMBERS_1_5_WORDS, NUMBERS_6_10_WORDS, NUMBERS_11_20_WORDS, NUMBERS_TENS_WORDS,
  NUMBERS_AGE_WORDS, NUMBERS_PRICES_WORDS, NUMBERS_PHONE_WORDS, NUMBERS_HOURS_WORDS,
  NUMBERS_MINUTES_WORDS, NUMBERS_DAYS_WORDS, NUMBERS_MONTHS_WORDS, NUMBERS_DATES_WORDS,
  NUMBERS_ORDERING_WORDS, NUMBERS_TOGETHER_WORDS,
  GRAMMAR_PRONOUNS_WORDS, GRAMMAR_THIS_THAT_WORDS, GRAMMAR_POSSESSIVES_WORDS,
  GRAMMAR_PRESENT_VERBS_WORDS, GRAMMAR_PAST_VERBS_WORDS, GRAMMAR_WANT_NEED_WORDS,
  GRAMMAR_QUESTIONS_WORDS, GRAMMAR_NEGATION_WORDS, GRAMMAR_ADJECTIVES_WORDS,
  GRAMMAR_SENTENCES_WORDS,
} from '../constants/words';
import type { Word } from '../constants/words';

type QuestionType = 'mc_ar_to_en' | 'mc_en_to_ar' | 'audio';

interface Question {
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

function generateQuiz(allWords: Word[], count = 15): Question[] {
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, allWords.length));
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

function buildQuestion(type: QuestionType, word: Word, wrongOptions: string[]): Question {
  const displayArabic = getDisplayArabic(word);
  const correctAnswer = type === 'mc_en_to_ar' ? displayArabic : word.english;

  return {
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

function generateUnit1Quiz(): Question[] {
  return [
    buildQuestion('mc_ar_to_en', BASIC_WORDS[0], [
      BASIC_WORDS[1].english,
      BASIC_WORDS[4].english,
      BASIC_WORDS[13].english,
    ]),
    buildQuestion('mc_ar_to_en', BASIC_WORDS[1], [
      BASIC_WORDS[13].english,
      BASIC_WORDS[14].english,
      BASIC_WORDS[15].english,
    ]),
    buildQuestion('mc_ar_to_en', BASIC_WORDS[12], [
      BASIC_WORDS[11].english,
      BASIC_WORDS[10].english,
      GREETINGS_WORDS[11].english,
    ]),
    buildQuestion('mc_ar_to_en', INTRO_WORDS[0], [
      INTRO_WORDS[2].english,
      INTRO_WORDS[4].english,
      INTRO_WORDS[8].english,
    ]),
    buildQuestion('mc_ar_to_en', INTRO_WORDS[3], [
      INTRO_WORDS[5].english,
      INTRO_WORDS[1].english,
      INTRO_WORDS[9].english,
    ]),
    buildQuestion('mc_ar_to_en', INTRO_WORDS[10], [
      INTRO_WORDS[11].english,
      INTRO_WORDS[12].english,
      INTRO_WORDS[14].english,
    ]),
    buildQuestion('mc_en_to_ar', BASIC_WORDS[13], [
      getDisplayArabic(BASIC_WORDS[1]),
      getDisplayArabic(BASIC_WORDS[14]),
      getDisplayArabic(BASIC_WORDS[15]),
    ]),
    buildQuestion('mc_en_to_ar', BASIC_WORDS[9], [
      getDisplayArabic(BASIC_WORDS[10]),
      getDisplayArabic(BASIC_WORDS[18]),
      getDisplayArabic(BASIC_WORDS[19]),
    ]),
    buildQuestion('mc_en_to_ar', INTRO_WORDS[4], [
      getDisplayArabic(INTRO_WORDS[2]),
      getDisplayArabic(INTRO_WORDS[6]),
      getDisplayArabic(INTRO_WORDS[8]),
    ]),
    buildQuestion('mc_en_to_ar', INTRO_WORDS[5], [
      getDisplayArabic(INTRO_WORDS[3]),
      getDisplayArabic(INTRO_WORDS[1]),
      getDisplayArabic(INTRO_WORDS[9]),
    ]),
    buildQuestion('mc_en_to_ar', INTRO_WORDS[11], [
      getDisplayArabic(INTRO_WORDS[10]),
      getDisplayArabic(INTRO_WORDS[12]),
      getDisplayArabic(INTRO_WORDS[14]),
    ]),
    buildQuestion('audio', BASIC_WORDS[4], [
      BASIC_WORDS[3].english,
      BASIC_WORDS[5].english,
      BASIC_WORDS[15].english,
    ]),
    buildQuestion('audio', GREETINGS_WORDS[11], [
      GREETINGS_WORDS[0].english,
      GREETINGS_WORDS[7].english,
      GREETINGS_WORDS[14].english,
    ]),
    buildQuestion('audio', INTRO_WORDS[7], [
      INTRO_WORDS[6].english,
      INTRO_WORDS[5].english,
      INTRO_WORDS[3].english,
    ]),
    buildQuestion('audio', INTRO_WORDS[14], [
      BASIC_WORDS[11].english,
      GREETINGS_WORDS[14].english,
      INTRO_WORDS[0].english,
    ]),
  ];
}

export default function QuizScreen() {
  const router = useRouter();
  const { unit } = useLocalSearchParams<{ unit?: string }>();

  const [questions] = useState<Question[]>(() => {
    if (unit === '4') {
      const allUnit4Words = [
        ...NUMBERS_1_5_WORDS, ...NUMBERS_6_10_WORDS, ...NUMBERS_11_20_WORDS, ...NUMBERS_TENS_WORDS,
        ...NUMBERS_AGE_WORDS, ...NUMBERS_PRICES_WORDS, ...NUMBERS_PHONE_WORDS, ...NUMBERS_HOURS_WORDS,
        ...NUMBERS_MINUTES_WORDS, ...NUMBERS_DAYS_WORDS, ...NUMBERS_MONTHS_WORDS, ...NUMBERS_DATES_WORDS,
        ...NUMBERS_ORDERING_WORDS, ...NUMBERS_TOGETHER_WORDS,
      ];
      return generateQuiz(allUnit4Words);
    }
    if (unit === '5') {
      const allUnit5Words = [
        ...GRAMMAR_PRONOUNS_WORDS, ...GRAMMAR_THIS_THAT_WORDS, ...GRAMMAR_POSSESSIVES_WORDS,
        ...GRAMMAR_PRESENT_VERBS_WORDS, ...GRAMMAR_PAST_VERBS_WORDS, ...GRAMMAR_WANT_NEED_WORDS,
        ...GRAMMAR_QUESTIONS_WORDS, ...GRAMMAR_NEGATION_WORDS, ...GRAMMAR_ADJECTIVES_WORDS,
        ...GRAMMAR_SENTENCES_WORDS,
      ];
      return generateQuiz(allUnit5Words, 18);
    }
    return generateUnit1Quiz();
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

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
    if (currentQuestion?.type === 'audio') {
      const t = setTimeout(() => {
        if (currentQuestion.audio) {
          playLocalAudio(currentQuestion.audio);
        } else {
          speakArabic(currentQuestion.audioText);
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
            dialect: 'gulf',
            completed: true,
            best_score: Math.round((correctCount / questions.length) * 100),
            attempts: 1,
          });
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

    setSelectedAnswer(answer);
    setIsCorrect(correct);

    if (correct) {
      setXpEarned(xp => xp + 10);
      setCorrectCount(c => c + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
      speakArabic(currentQuestion.audioText);
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

  // ─── Completion screen ───
  if (completed) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const grade =
      percentage >= 80 ? '🌟 Excellent!' :
      percentage >= 60 ? '👍 Good job!' :
      '💪 Keep practicing!';

    return (
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

          {percentage < 80 && (
            <Pressable style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ─── Quiz screen ───
  return (
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },

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
  doneButton: { width: '100%', height: 56, backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  doneButtonText: { color: theme.colors.bgBase, fontSize: 17, fontWeight: theme.fontWeight.medium },
  retryButton: { width: '100%', height: 48, alignItems: 'center', justifyContent: 'center' },
  retryText: { color: theme.colors.textTertiary, fontSize: 15 },
});
