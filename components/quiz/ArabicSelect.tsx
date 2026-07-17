import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import type { ArabicSelectQuestion } from '../../data/quiz-types';
import type { QuizAnswerResult } from '../../utils/quiz-scoring';
import { playLocalAudio, speakArabic, stopAudio } from '../../utils/tts';

interface Props {
  question: ArabicSelectQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (result: QuizAnswerResult) => void;
}

export default function ArabicSelect({ question, answerResult, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isStartingAudio, setIsStartingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const btnScale = useSharedValue(1);

  const doPlay = async () => {
    if (isStartingAudio) return;
    setIsStartingAudio(true);
    setAudioError(null);
    btnScale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withTiming(1, { duration: 80 }),
    );
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
    const t = setTimeout(doPlay, 350);
    return () => {
      clearTimeout(t);
      stopAudio();
    };
  }, []);

  const handleSelect = (index: number) => {
    if (selected !== null || answerResult !== 'none') return;
    setSelected(index);
    onAnswer({ correct: question.options[index].isCorrect });
  };

  const playBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Instruction */}
      <Text style={styles.instruction}>Which Arabic phrase did you hear?</Text>

      {/* English meaning for context */}
      <Text style={styles.english}>"{question.english}"</Text>

      {/* Audio button */}
      <View style={styles.playArea}>
        <Pressable onPress={doPlay} disabled={answerResult !== 'none' || isStartingAudio}>
          <Animated.View style={[styles.playBtn, playBtnStyle]}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </Animated.View>
        </Pressable>
        <Text style={styles.playLabel}>{isStartingAudio ? 'Starting audio…' : 'Tap to hear again'}</Text>
        {audioError && <Text style={styles.audioError}>{audioError}</Text>}
      </View>

      {/* Arabic-only options — no transliteration */}
      <View style={styles.options}>
        {question.options.map((opt, i) => {
          let bg = theme.colors.bgSurface;
          let border = theme.colors.borderDefault;
          let textColor = theme.colors.textPrimary;

          if (answerResult !== 'none' && selected !== null) {
            if (opt.isCorrect) {
              bg = 'rgba(125, 217, 154, 0.15)';
              border = theme.colors.accentSuccess;
              textColor = theme.colors.accentSuccess;
            } else if (i === selected && !opt.isCorrect) {
              bg = 'rgba(229, 107, 111, 0.15)';
              border = theme.colors.accentDanger;
              textColor = theme.colors.accentDanger;
            }
          } else if (i === selected) {
            border = theme.colors.borderAccent;
          }

          return (
            <Pressable
              key={i}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(i)}
              disabled={selected !== null}
            >
              <Text style={[styles.optionArabic, { color: textColor }]}>
                {opt.arabic}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Challenge badge */}
      <View style={styles.challengeBadge}>
        <Text style={styles.challengeText}>✍️ Arabic reading challenge — no transliteration</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },

  instruction: {
    fontSize: theme.fontSize.heading,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  english: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  playArea: { alignItems: 'center', gap: 6 },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1.5,
    borderColor: theme.colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerIcon: { fontSize: 28 },
  playLabel: { fontSize: theme.fontSize.caption, color: theme.colors.textTertiary },
  audioError: { fontSize: 13, color: theme.colors.accentWarm, textAlign: 'center' },

  options: { gap: 10 },
  option: {
    borderWidth: 1.5,
    borderRadius: theme.radii.md,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionArabic: {
    fontSize: 22,
    textAlign: 'center',
    writingDirection: 'rtl',
  },

  challengeBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(156, 39, 176, 0.08)',
    borderRadius: theme.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.3)',
  },
  challengeText: {
    fontSize: theme.fontSize.caption,
    color: '#9C27B0',
    fontWeight: theme.fontWeight.medium,
  },
});
