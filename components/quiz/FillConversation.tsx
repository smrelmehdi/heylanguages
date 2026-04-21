import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming,
} from 'react-native-reanimated';
import type { FillConversationQuestion } from '../../data/quiz-types';

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
          let bg = '#161616';
          let border = '#2a2a2a';
          let textColor = '#fff';
          let romanColor = '#555';

          if (answerResult !== 'none' && selectedIndex !== null) {
            if (opt.isCorrect) {
              bg = 'rgba(0,115,47,0.15)'; border = '#00732F'; textColor = '#00732F'; romanColor = '#00732F';
            } else if (i === selectedIndex && !opt.isCorrect) {
              bg = 'rgba(211,47,47,0.15)'; border = '#D32F2F'; textColor = '#D32F2F'; romanColor = '#D32F2F';
            }
          } else if (i === selectedIndex) {
            border = '#00897B';
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
    answerResult === 'correct' ? '#00732F' :
    answerResult === 'wrong' ? '#D32F2F' :
    '#00897B';

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
            <Text style={[styles.bubbleArabic, { color: isCorrect ? '#00732F' : '#D32F2F' }]}>{filled.arabic}</Text>
            <Text style={[styles.bubbleRoman, { color: isCorrect ? '#00732F' : '#D32F2F', opacity: 0.8 }]}>{filled.transliteration}</Text>
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
  prompt: { fontSize: 15, fontWeight: '700', color: '#fff', textAlign: 'center' },

  dialogue: { gap: 10, backgroundColor: '#111', borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: '#1e1e1e' },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  leftRow: { justifyContent: 'flex-start' },
  rightRow: { justifyContent: 'flex-end' },

  yusufDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#00897B', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  yusufDotText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  npcEmoji: { fontSize: 22 },

  bubble: { maxWidth: '75%', borderRadius: 14, padding: 12, borderWidth: 1.5 },
  yusufBubble: { backgroundColor: '#0d1f1e', borderColor: '#00897B' },
  npcBubble: { backgroundColor: '#1A1A1A', borderColor: '#2a2a2a' },
  blankBubble: { borderColor: '#00897B', minWidth: 120, alignItems: 'center' },

  bubbleArabic: { fontSize: 16, fontWeight: '700' },
  yusufText: { color: '#fff' },
  npcText: { color: '#fff' },
  bubbleRoman: { fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  yusufRoman: { color: '#00897B', opacity: 0.8 },
  npcRoman: { color: '#777' },
  blankPlaceholder: { fontSize: 20, color: '#00897B', fontWeight: '700', letterSpacing: 4, paddingVertical: 4 },

  options: { gap: 10 },
  option: { minHeight: 56, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center' },
  optionArabic: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  optionRoman: { fontSize: 12, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
});
