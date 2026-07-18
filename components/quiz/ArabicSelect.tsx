import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { ArabicSelectQuestion } from '../../data/quiz-types';
import type { QuizAnswerResult } from '../../utils/quiz-scoring';

interface Props {
  question: ArabicSelectQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (result: QuizAnswerResult) => void;
}

export default function ArabicSelect({ question, answerResult, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selected !== null || answerResult !== 'none') return;
    setSelected(index);
    onAnswer({ correct: question.options[index].isCorrect });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Choose the Arabic phrase meaning:</Text>
      <Text style={styles.english}>"{question.english}"</Text>

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
              accessibilityRole="button"
              accessibilityLabel={`Arabic option ${i + 1}: ${opt.arabic}`}
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
