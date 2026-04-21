import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import LottieView from 'lottie-react-native';
import { recordActivity } from '../utils/streak';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import { speakArabic, playLocalAudio, stopAudio } from '../utils/tts';
import { stripTashkeel } from '../utils/arabic';
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
  transliteration: string;
  english: string;
  options: string[];
  correctAnswer: string;
  audio?: any;
}

const CORRECT_FEEDBACK = ['ممتاز! 🌟', 'زين! 👍', 'أحسنت! 🎉', 'Perfect! ✓'];

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

    const otherWords = allWords.filter(w => w.arabic !== word.arabic);
    const wrongWords = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);

    let options: string[];
    let correctAnswer: string;

    if (type === 'mc_en_to_ar') {
      correctAnswer = word.arabic;
      options = [word.arabic, ...wrongWords.map(w => w.arabic)].sort(() => Math.random() - 0.5);
    } else {
      correctAnswer = word.english;
      options = [word.english, ...wrongWords.map(w => w.english)].sort(() => Math.random() - 0.5);
    }

    return {
      type,
      arabic: word.arabic,
      transliteration: word.transliteration,
      english: word.english,
      options,
      correctAnswer,
      audio: word.audio,
    };
  });
}

export default function QuizScreen() {
  const router = useRouter();
  const { unit } = useLocalSearchParams<{ unit?: string }>();
  const feedbackRef = useRef<string>('');

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
    const allWords = [...BASIC_WORDS, ...GREETINGS_WORDS, ...INTRO_WORDS];
    return generateQuiz(allWords);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progress = currentIndex / questions.length;

  useEffect(() => {
    if (currentQuestion?.type === 'audio') {
      const t = setTimeout(() => {
        if (currentQuestion.audio) {
          playLocalAudio(currentQuestion.audio);
        } else {
          speakArabic(currentQuestion.arabic);
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
    feedbackRef.current = correct
      ? CORRECT_FEEDBACK[Math.floor(Math.random() * CORRECT_FEEDBACK.length)]
      : `Correct: ${currentQuestion.correctAnswer}`;

    setSelectedAnswer(answer);
    setIsCorrect(correct);

    if (correct) {
      setXpEarned(xp => xp + 10);
      setCorrectCount(c => c + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setCompleted(true);
      }
    }, 1200);
  };

  const handlePlayAudio = () => {
    if (currentQuestion.audio) {
      playLocalAudio(currentQuestion.audio);
    } else {
      speakArabic(currentQuestion.arabic);
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
          <LottieView
            source={percentage >= 78
              ? require('../assets/images/animations/yusuf-celebrating.json')
              : require('../assets/images/animations/yusuf-sad.json')
            }
            autoPlay
            loop={false}
            style={{ width: 180, height: 180 }}
          />
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
          <ArrowLeft color="#fff" size={18} />
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
          <Text style={styles.scoreWrong}> {currentIndex - correctCount}✗</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Yusuf + speech bubble */}
      <View style={styles.yusufSection}>
        <LottieView
          source={require('../assets/images/animations/yusuf-waving.json')}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
        <View style={styles.yusufBubble}>
          <Text style={styles.yusufBubbleText}>
            {currentQuestion.type === 'mc_ar_to_en' && 'What does this mean?'}
            {currentQuestion.type === 'mc_en_to_ar' && 'Say it in Arabic!'}
            {currentQuestion.type === 'audio' && 'What did you hear?'}
          </Text>
        </View>
      </View>

      {/* Question card */}
      <View style={styles.questionCard}>
        {currentQuestion.type === 'mc_ar_to_en' && (
          <View style={styles.arabicQuestion}>
            <Text style={styles.arabicBig} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.4}>{stripTashkeel(currentQuestion.arabic)}</Text>
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

      {/* Feedback banner */}
      {selectedAnswer && (
        <Animated.View entering={FadeIn} style={styles.feedbackBanner}>
          <Text style={[styles.feedbackText, { color: isCorrect ? '#00732F' : '#E24B4A' }]}>
            {feedbackRef.current}
          </Text>
        </Animated.View>
      )}

      {/* Answer options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, i) => {
          let bgColor = '#161616';
          let borderColor = '#2a2a2a';
          let textColor = '#fff';
          let isOptionCorrect = false;
          let isOptionWrong = false;

          if (selectedAnswer) {
            if (option === currentQuestion.correctAnswer) {
              bgColor = 'rgba(0,115,47,0.15)';
              borderColor = '#00732F';
              textColor = '#00732F';
              isOptionCorrect = true;
            } else if (option === selectedAnswer && !isCorrect) {
              bgColor = 'rgba(226,75,74,0.15)';
              borderColor = '#E24B4A';
              textColor = '#E24B4A';
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#2a2a2a' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 11, color: '#555', marginTop: 1 },
  scoreCounter: { flexDirection: 'row', alignItems: 'center' },
  scoreCorrect: { fontSize: 14, fontWeight: '700', color: '#00732F' },
  scoreWrong: { fontSize: 14, fontWeight: '700', color: '#E24B4A' },

  // Progress
  progressWrap: { paddingHorizontal: 20, marginBottom: 12 },
  progressBg: { height: 4, backgroundColor: '#1a1a1a', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00897B', borderRadius: 2 },

  // Yusuf section
  yusufSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, gap: 12 },
  yusufBubble: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a', padding: 14 },
  yusufBubbleText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Question card
  questionCard: { marginHorizontal: 20, backgroundColor: '#111', borderRadius: 20, padding: 24, marginBottom: 8, borderWidth: 0.5, borderColor: '#1e1e1e', minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  arabicQuestion: { alignItems: 'center' },
  arabicBig: { fontSize: 48, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  romanText: { fontSize: 16, color: '#00897B', fontWeight: '500' },
  englishQuestion: { alignItems: 'center' },
  englishBig: { fontSize: 28, fontWeight: '700', color: '#fff', textAlign: 'center' },
  audioButton: { alignItems: 'center', padding: 12 },
  audioIcon: { fontSize: 44, marginBottom: 8 },
  audioText: { fontSize: 14, color: '#00897B', fontWeight: '600' },

  // Feedback
  feedbackBanner: { paddingHorizontal: 20, paddingVertical: 8, marginBottom: 4, alignItems: 'center' },
  feedbackText: { fontSize: 16, fontWeight: '700' },

  // Options
  optionsContainer: { paddingHorizontal: 20, gap: 10 },
  optionBtn: { padding: 18, borderRadius: 16, borderWidth: 2, borderColor: '#2a2a2a', backgroundColor: '#161616', flexDirection: 'row', alignItems: 'center', minHeight: 64 },
  optionLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionLetterCorrect: { backgroundColor: '#00732F' },
  optionLetterWrong: { backgroundColor: '#E24B4A' },
  optionLetterText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  optionText: { fontSize: 16, fontWeight: '600', flex: 1 },
  correctIcon: { fontSize: 18, color: '#00732F' },
  wrongIcon: { fontSize: 18, color: '#E24B4A' },

  // Completion
  completionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  gradeText: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  scoreText: { fontSize: 64, fontWeight: '800', color: '#00897B', lineHeight: 72 },
  scoreSub: { fontSize: 16, color: '#555', marginBottom: 32 },
  completionStats: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 32, gap: 24, borderWidth: 0.5, borderColor: '#1e1e1e' },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '800', color: '#00897B' },
  statLabel: { fontSize: 11, color: '#555', textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 0.5, backgroundColor: '#2a2a2a' },
  doneButton: { width: '100%', height: 56, backgroundColor: '#00897B', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  doneButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  retryButton: { width: '100%', height: 48, alignItems: 'center', justifyContent: 'center' },
  retryText: { color: '#555', fontSize: 15 },
});
