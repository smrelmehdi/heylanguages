import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
} from 'react-native-reanimated';
import type { SceneReplayQuestion } from '../../data/quiz-types';
import { speakArabic, playLocalAudio } from '../../utils/tts';
import { theme } from '../../constants/theme';

interface Props {
  question: SceneReplayQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (correct: boolean) => void;
}

export default function SceneReplay({ question, answerResult, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  // Auto-play audio on mount
  useEffect(() => {
    const t = setTimeout(() => {
      if (question.audioFile) playLocalAudio(question.audioFile);
      else speakArabic(question.audioText);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (index: number) => {
    if (selected !== null || answerResult !== 'none') return;
    setSelected(index);
    onAnswer(question.options[index].isCorrect);
  };

  const handleReplay = () => {
    if (question.audioFile) playLocalAudio(question.audioFile);
    else speakArabic(question.audioText);
  };

  return (
    <View style={styles.container}>
      {/* Scene image */}
      <Pressable onPress={handleReplay}>
        <Image source={question.sceneImage} style={styles.image} resizeMode="cover" />
        <View style={styles.replayBadge}>
          <Text style={styles.replayText}>🔊 Tap to replay</Text>
        </View>
      </Pressable>

      {/* Prompt */}
      <Text style={styles.prompt}>{question.prompt}</Text>

      {/* Options */}
      {question.options.map((opt, i) => {
        let bg = theme.colors.bgSurface;
        let border = theme.colors.borderDefault;
        let textColor = theme.colors.textPrimary;
        let romanColor = theme.colors.textTertiary;

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
          <OptionCard
            key={i}
            arabic={opt.arabic}
            transliteration={opt.transliteration}
            bg={bg}
            border={border}
            textColor={textColor}
            romanColor={romanColor}
            onPress={() => handleSelect(i)}
            disabled={selected !== null}
            pulse={answerResult === 'correct' && opt.isCorrect}
            shake={answerResult === 'wrong' && i === selected && !opt.isCorrect}
          />
        );
      })}
    </View>
  );
}

function OptionCard({ arabic, transliteration, bg, border, textColor, romanColor, onPress, disabled, pulse, shake }: any) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (pulse) {
      scale.value = withSequence(
        withTiming(1.04, { duration: 150 }),
        withTiming(1, { duration: 150 }),
      );
    }
  }, [pulse]);

  useEffect(() => {
    if (shake) {
      translateX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
  }, [shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
  }));

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View style={[styles.option, { backgroundColor: bg, borderColor: border }, animStyle]}>
        <Text style={[styles.optionArabic, { color: textColor }]}>{arabic}</Text>
        <Text style={[styles.optionRoman, { color: romanColor }]}>{transliteration}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  image: { width: '100%', height: 180, borderRadius: theme.radii.lg, marginBottom: 4 },
  replayBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: theme.radii.sm, paddingHorizontal: 10, paddingVertical: 4 },
  replayText: { color: theme.colors.textPrimary, fontSize: theme.fontSize.label },
  prompt: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 4 },
  option: { minHeight: 56, borderRadius: theme.radii.sm, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center' },
  optionArabic: { fontSize: 17, fontWeight: theme.fontWeight.medium, textAlign: 'center' },
  optionRoman: { fontSize: theme.fontSize.caption, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
});
