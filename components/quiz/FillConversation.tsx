import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming,
} from 'react-native-reanimated';
import type { FillConversationQuestion } from '../../data/quiz-types';
import { theme } from '../../constants/theme';

interface Props {
  question: FillConversationQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (correct: boolean) => void;
}

export default function FillConversation({ question, answerResult, onAnswer }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selectedIndex !== null || answerResult !== 'none') return;
    setSelectedIndex(index);
    onAnswer(question.options[index].isCorrect);
  };

  const filledOption = selectedIndex !== null ? question.options[selectedIndex] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Complete the conversation</Text>

      {/* Dialogue bubbles */}
      <View style={styles.dialogue}>
        {question.dialogue.map((turn, i) => {
          const isYusuf = turn.speaker === 'yusuf';
          if (turn.isBlank) {
            return (
              <BlankBubble
                key={i}
                isYusuf={isYusuf}
                filled={filledOption}
                answerResult={answerResult}
                isCorrect={filledOption?.isCorrect ?? false}
              />
            );
          }
          return (
            <View key={i} style={[styles.bubbleRow, isYusuf ? styles.leftRow : styles.rightRow]}>
              {isYusuf && <View style={styles.yusufDot}><Text style={styles.yusufDotText}>Y</Text></View>}
              <View style={[styles.bubble, isYusuf ? styles.yusufBubble : styles.npcBubble]}>
                <Text style={[styles.bubbleArabic, isYusuf ? styles.yusufText : styles.npcText]}>{turn.arabic}</Text>
                <Text style={[styles.bubbleRoman, isYusuf ? styles.yusufRoman : styles.npcRoman]}>{turn.transliteration}</Text>
              </View>
              {!isYusuf && <Text style={styles.npcEmoji}>👤</Text>}
            </View>
          );
        })}
      </View>

      {/* Options */}
      <View style={styles.options}>
        {question.options.map((opt, i) => {
          let bg: string = theme.colors.bgSurface;
          let border: string = theme.colors.borderDefault;
          let textColor: string = theme.colors.textPrimary;
          let romanColor: string = theme.colors.textTertiary;

          if (answerResult !== 'none' && selectedIndex !== null) {
            if (opt.isCorrect) {
              bg = 'rgba(125, 217, 154, 0.15)'; border = theme.colors.accentSuccess; textColor = theme.colors.accentSuccess; romanColor = theme.colors.accentSuccess;
            } else if (i === selectedIndex && !opt.isCorrect) {
              bg = 'rgba(229, 107, 111, 0.15)'; border = theme.colors.accentDanger; textColor = theme.colors.accentDanger; romanColor = theme.colors.accentDanger;
            }
          } else if (i === selectedIndex) {
            border = theme.colors.borderAccent;
          }

          return (
            <Pressable
              key={i}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(i)}
              disabled={selectedIndex !== null}
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

function BlankBubble({ isYusuf, filled, answerResult, isCorrect }: {
  isYusuf: boolean;
  filled: { arabic: string; transliteration: string } | null;
  answerResult: 'none' | 'correct' | 'wrong';
  isCorrect: boolean;
}) {
  const scale = useSharedValue(1);
  const borderColor =
    answerResult === 'correct' ? theme.colors.accentSuccess :
    answerResult === 'wrong' ? theme.colors.accentDanger :
    theme.colors.borderAccent;

  if (answerResult === 'correct' && filled) {
    scale.value = withSequence(
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 150 }),
    );
  }

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={[styles.bubbleRow, isYusuf ? styles.leftRow : styles.rightRow]}>
      {isYusuf && <View style={styles.yusufDot}><Text style={styles.yusufDotText}>Y</Text></View>}
      <Animated.View style={[
        styles.bubble,
        styles.blankBubble,
        isYusuf ? styles.yusufBubble : styles.npcBubble,
        { borderColor, borderStyle: filled ? 'solid' : 'dashed' },
        animStyle,
      ]}>
        {filled ? (
          <>
            <Text style={[styles.bubbleArabic, { color: isCorrect ? theme.colors.accentSuccess : theme.colors.accentDanger }]}>{filled.arabic}</Text>
            <Text style={[styles.bubbleRoman, { color: isCorrect ? theme.colors.accentSuccess : theme.colors.accentDanger, opacity: 0.8 }]}>{filled.transliteration}</Text>
          </>
        ) : (
          <Text style={styles.blankPlaceholder}>· · ·</Text>
        )}
      </Animated.View>
      {!isYusuf && <Text style={styles.npcEmoji}>👤</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  prompt: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center' },

  dialogue: { gap: 10, backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.borderDefault },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  leftRow: { justifyContent: 'flex-start' },
  rightRow: { justifyContent: 'flex-end' },

  yusufDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.accentPrimary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  yusufDotText: { fontSize: 12, fontWeight: theme.fontWeight.medium, color: theme.colors.bgBase },
  npcEmoji: { fontSize: 22 },

  bubble: { maxWidth: '75%', borderRadius: theme.radii.sm, padding: 12, borderWidth: 1 },
  yusufBubble: { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderDefault },
  npcBubble: { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.borderDefault },
  blankBubble: { borderColor: theme.colors.borderAccent, minWidth: 120, alignItems: 'center' },

  bubbleArabic: { fontSize: 16, fontWeight: theme.fontWeight.medium },
  yusufText: { color: theme.colors.textPrimary },
  npcText: { color: theme.colors.textPrimary },
  bubbleRoman: { fontSize: theme.fontSize.label, fontStyle: 'italic', marginTop: 2 },
  yusufRoman: { color: theme.colors.textAccent, opacity: 0.8 },
  npcRoman: { color: theme.colors.textSecondary },
  blankPlaceholder: { fontSize: 20, color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium, letterSpacing: 4, paddingVertical: 4 },

  options: { gap: 10 },
  option: { minHeight: 56, borderRadius: theme.radii.sm, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center' },
  optionArabic: { fontSize: 16, fontWeight: theme.fontWeight.medium, textAlign: 'center' },
  optionRoman: { fontSize: theme.fontSize.caption, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
});
