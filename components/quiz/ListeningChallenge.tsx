import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming,
} from 'react-native-reanimated';
import type { ListeningQuestion } from '../../data/quiz-types';
import { speakArabic, playLocalAudio } from '../../utils/tts';
import { theme } from '../../constants/theme';

const MAX_REPLAYS = 3;

interface Props {
  question: ListeningQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (correct: boolean) => void;
}

export default function ListeningChallenge({ question, answerResult, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  // replays = number of manual replay presses (auto-play on mount doesn't count)
  const [replays, setReplays] = useState(0);
  const btnScale = useSharedValue(1);

  const doPlay = () => {
    btnScale.value = withSequence(withTiming(0.92, { duration: 80 }), withTiming(1, { duration: 80 }));
    if (question.audioFile) playLocalAudio(question.audioFile);
    else speakArabic(question.audioText);
  };

  // Auto-play on mount — does NOT count against replay limit
  useEffect(() => {
    const t = setTimeout(() => doPlay(), 400);
    return () => clearTimeout(t);
  }, []);

  const handleReplay = () => {
    if (replays >= MAX_REPLAYS || answerResult !== 'none') return;
    setReplays(r => r + 1);
    doPlay();
  };

  const handleSelect = (index: number) => {
    if (selected !== null || answerResult !== 'none') return;
    setSelected(index);
    onAnswer(question.options[index].isCorrect);
  };

  const replaysLeft = MAX_REPLAYS - replays;
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>What did you hear?</Text>

      {/* Play button */}
      <View style={styles.playArea}>
        <Pressable onPress={handleReplay} disabled={replays >= MAX_REPLAYS || answerResult !== 'none'}>
          <Animated.View style={[
            styles.playBtn,
            (replays >= MAX_REPLAYS || answerResult !== 'none') && styles.playBtnDisabled,
            btnStyle,
          ]}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </Animated.View>
        </Pressable>
        <Text style={[styles.replayCount, replaysLeft === 0 && { color: theme.colors.textTertiary }]}>
          {replaysLeft > 0
            ? `${replaysLeft} replay${replaysLeft !== 1 ? 's' : ''} left`
            : 'No replays left'}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {question.options.map((opt, i) => {
          let bg: string = theme.colors.bgSurface;
          let border: string = theme.colors.borderDefault;
          let textColor: string = theme.colors.textPrimary;
          let romanColor: string = theme.colors.textTertiary;

          if (answerResult !== 'none' && selected !== null) {
            if (opt.isCorrect) {
              bg = 'rgba(125, 217, 154, 0.15)'; border = theme.colors.accentSuccess; textColor = theme.colors.accentSuccess; romanColor = theme.colors.accentSuccess;
            } else if (i === selected && !opt.isCorrect) {
              bg = 'rgba(229, 107, 111, 0.15)'; border = theme.colors.accentDanger; textColor = theme.colors.accentDanger; romanColor = theme.colors.accentDanger;
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
              <Text style={[styles.optionArabic, { color: textColor }]}>{opt.arabic}</Text>
              <Text style={[styles.optionRoman, { color: romanColor }]}>{opt.transliteration}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  prompt: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center' },
  playArea: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  playBtn: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.colors.accentPrimary, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  playBtnDisabled: { backgroundColor: theme.colors.bgSurface, shadowOpacity: 0 },
  speakerIcon: { fontSize: 38 },
  replayCount: { fontSize: theme.fontSize.body, color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium },
  options: { gap: 10 },
  option: {
    minHeight: 56, borderRadius: theme.radii.sm, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center',
  },
  optionArabic: { fontSize: 17, fontWeight: theme.fontWeight.medium, textAlign: 'center' },
  optionRoman: { fontSize: theme.fontSize.caption, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
});
