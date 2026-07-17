import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import type { TransliterationTypeQuestion } from '../../data/quiz-types';
import { gradeTransliteration, type TransliterationGradeStatus } from '../../utils/quiz-level';
import type { QuizAnswerResult } from '../../utils/quiz-scoring';
import { playLocalAudio, speakArabic, stopAudio } from '../../utils/tts';

interface Props {
  question: TransliterationTypeQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (result: QuizAnswerResult) => void;
}

export default function TransliterationInput({ question, answerResult, onAnswer }: Props) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [grade, setGrade] = useState<TransliterationGradeStatus | null>(null);
  const [matchedAnswer, setMatchedAnswer] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isStartingAudio, setIsStartingAudio] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Shake animation for wrong answers
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Auto-play audio on mount
  const playQuestionAudio = async () => {
    if (isStartingAudio) return;
    setIsStartingAudio(true);
    setAudioError(null);
    try {
      if (question.audioFile) await playLocalAudio(question.audioFile);
      else await speakArabic(question.audioText);
    } catch {
      setAudioError('Audio did not start. Tap to retry.');
    } finally {
      setTimeout(() => setIsStartingAudio(false), 250);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      playQuestionAudio();
    }, 350);
    return () => {
      clearTimeout(t);
      stopAudio();
    };
  }, []);

  const handleReplay = () => {
    playQuestionAudio();
  };

  const handleSubmit = () => {
    if (submitted || answerResult !== 'none') return;
    const trimmed = input.trim();
    if (trimmed.length === 0) return;

    Keyboard.dismiss();
    const result = gradeTransliteration(trimmed, question.correctAnswer, question.acceptedAnswers);
    setGrade(result.status);
    setMatchedAnswer(result.matchedAnswer ?? null);
    setSubmitted(true);

    const isCorrect = result.status === 'correct' || result.status === 'close';

    if (!isCorrect) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }

    onAnswer({
      correct: isCorrect,
      quality: result.status === 'close' ? 'close' : isCorrect ? 'correct' : 'wrong',
      usedHint: hintRevealed,
    });
  };

  const inputBorderColor =
    !submitted ? theme.colors.borderDefault :
    grade === 'incorrect' || grade === 'arabic_input' || grade === 'empty' ? theme.colors.accentDanger :
    theme.colors.accentSuccess;

  const inputBg =
    !submitted ? theme.colors.bgSurface :
    grade === 'incorrect' || grade === 'arabic_input' || grade === 'empty' ? 'rgba(229, 107, 111, 0.08)' :
    'rgba(125, 217, 154, 0.08)';

  return (
    <View style={styles.container}>
      {/* Arabic phrase */}
      <Pressable style={styles.arabicCard} onPress={handleReplay} disabled={isStartingAudio}>
        <Text style={styles.arabicText}>{question.arabic}</Text>
        <Text style={styles.replayHint}>{isStartingAudio ? 'Starting audio…' : '🔊 Tap to hear again'}</Text>
      </Pressable>
      {audioError && <Text style={styles.audioError}>{audioError}</Text>}

      {/* English meaning context */}
      <Text style={styles.english}>"{question.english}"</Text>

      {/* Instruction */}
      <Text style={styles.instruction}>Type the transliteration</Text>

      {/* Input + hint row */}
      <Animated.View style={shakeStyle}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { borderColor: inputBorderColor, backgroundColor: inputBg }]}
          value={input}
          onChangeText={setInput}
          placeholder="e.g. ahlan wa sahlan"
          placeholderTextColor={theme.colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={!submitted}
        />
      </Animated.View>

      {/* Hint row */}
      <View style={styles.hintRow}>
        {!submitted && !hintRevealed && (
          <Pressable style={styles.hintBtn} onPress={() => setHintRevealed(true)}>
            <Text style={styles.hintBtnText}>💡 Reveal first word</Text>
          </Pressable>
        )}
        {hintRevealed && !submitted && (
          <View style={styles.hintReveal}>
            <Text style={styles.hintRevealLabel}>Hint: </Text>
            <Text style={styles.hintRevealText}>{question.hintFirstWord}…</Text>
          </View>
        )}
      </View>

      {/* Answer feedback */}
      {submitted && grade !== null && (
        <View style={[
          styles.feedback,
          grade === 'incorrect' || grade === 'arabic_input' || grade === 'empty' ? styles.feedbackWrong : styles.feedbackCorrect,
        ]}>
          {grade === 'correct' && (
            <Text style={[styles.feedbackText, { color: theme.colors.accentSuccess }]}>
              ✓ Perfect!
            </Text>
          )}
          {grade === 'close' && (
            <>
              <Text style={[styles.feedbackText, { color: theme.colors.accentSuccess }]}>
                ✓ Close enough!
              </Text>
              <Text style={styles.feedbackCorrectAnswer}>
                Correct: {question.correctAnswer}
              </Text>
            </>
          )}
          {grade === 'arabic_input' && (
            <>
              <Text style={[styles.feedbackText, { color: theme.colors.accentDanger }]}>
                Type the pronunciation using English letters.
              </Text>
              <Text style={styles.feedbackCorrectAnswer}>
                Answer: {question.correctAnswer}
              </Text>
            </>
          )}
          {(grade === 'incorrect' || grade === 'empty') && (
            <>
              <Text style={[styles.feedbackText, { color: theme.colors.accentDanger }]}>
                ✗ Not quite
              </Text>
              <Text style={styles.feedbackCorrectAnswer}>
                Answer: {question.correctAnswer}
              </Text>
            </>
          )}
          {grade === 'close' && matchedAnswer && matchedAnswer !== question.correctAnswer && (
            <Text style={styles.feedbackCorrectAnswer}>
              Accepted: {matchedAnswer}
            </Text>
          )}
        </View>
      )}

      {/* Submit button */}
      {!submitted && (
        <Pressable
          style={[styles.submitBtn, input.trim().length === 0 && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={input.trim().length === 0}
        >
          <Text style={styles.submitBtnText}>Check ✓</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },

  arabicCard: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radii.md,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    gap: 6,
  },
  arabicText: {
    fontSize: 36,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    writingDirection: 'rtl',
    fontFamily: undefined, // system Arabic font
  },
  replayHint: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
  },
  audioError: {
    fontSize: 13,
    color: theme.colors.accentWarm,
    textAlign: 'center',
  },

  english: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  instruction: {
    fontSize: theme.fontSize.label,
    color: theme.colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  input: {
    borderWidth: 1.5,
    borderRadius: theme.radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: 'left',
  },

  hintRow: { minHeight: 28, alignItems: 'flex-start' },
  hintBtn: {
    backgroundColor: 'rgba(255, 170, 0, 0.08)',
    borderRadius: theme.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 0, 0.3)',
  },
  hintBtnText: { fontSize: 13, color: theme.colors.accentWarm },
  hintReveal: { flexDirection: 'row', alignItems: 'center' },
  hintRevealLabel: { fontSize: 13, color: theme.colors.textTertiary },
  hintRevealText: { fontSize: 13, color: theme.colors.accentWarm, fontStyle: 'italic' },

  feedback: {
    borderRadius: theme.radii.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(125, 217, 154, 0.08)',
    borderColor: theme.colors.accentSuccess,
  },
  feedbackWrong: {
    backgroundColor: 'rgba(229, 107, 111, 0.08)',
    borderColor: theme.colors.accentDanger,
  },
  feedbackText: { fontSize: 14, fontWeight: theme.fontWeight.medium },
  feedbackCorrectAnswer: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

  submitBtn: {
    height: 50,
    backgroundColor: theme.colors.accentPrimary,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 16, fontWeight: theme.fontWeight.medium, color: theme.colors.bgBase },
});
