import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { PhraseArrangementQuestion } from '../../data/quiz-types';
import type { QuizAnswerResult } from '../../utils/quiz-scoring';

export default function PhraseArrangement({ question, answerResult, onAnswer }: { question: PhraseArrangementQuestion; answerResult: 'none' | 'correct' | 'wrong'; onAnswer: (result: QuizAnswerResult) => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  useEffect(() => setSelected([]), [question.id]);
  const remaining = question.tokens.map((token, index) => ({ token, index })).filter(({ index }) => !selected.includes(index));
  const submit = () => {
    const answer = selected.map(index => question.tokens[index]);
    onAnswer({ correct: answer.length === question.correctTokens.length && answer.every((token, index) => token === question.correctTokens[index]) });
  };
  return <View style={styles.container}>
    <Text style={styles.prompt}>{question.prompt}</Text>
    <View style={[styles.answer, answerResult === 'correct' && styles.correct, answerResult === 'wrong' && styles.wrong]}>
      {selected.length ? selected.map((index, position) => <Pressable key={`${index}-${position}`} onPress={() => answerResult === 'none' && setSelected(values => values.filter((_, itemIndex) => itemIndex !== position))}><Text style={styles.token}>{question.tokens[index]}</Text></Pressable>) : <Text style={styles.placeholder}>Tap the words in order</Text>}
    </View>
    <View style={styles.tokens}>{remaining.map(({ token, index }) => <Pressable key={index} style={styles.tokenButton} disabled={answerResult !== 'none'} onPress={() => setSelected(values => [...values, index])}><Text style={styles.token}>{token}</Text></Pressable>)}</View>
    {answerResult === 'none' ? <Pressable style={[styles.submit, selected.length !== question.tokens.length && styles.disabled]} disabled={selected.length !== question.tokens.length} onPress={submit}><Text style={styles.submitText}>Check answer</Text></Pressable> : <View style={styles.feedback}><Text style={styles.feedbackArabic}>{question.correctTokens.join(' ')}</Text><Text style={styles.feedbackTransliteration}>{question.transliteration}</Text></View>}
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: 18 }, prompt: { fontSize: theme.fontSize.heading, color: theme.colors.textPrimary, textAlign: 'center', fontWeight: theme.fontWeight.medium },
  answer: { minHeight: 72, borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.colors.borderAccent, borderRadius: theme.radii.lg, padding: 14, flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center' }, correct: { borderColor: theme.colors.accentSuccess }, wrong: { borderColor: theme.colors.accentDanger }, placeholder: { color: theme.colors.textTertiary },
  tokens: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }, tokenButton: { backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault, borderRadius: theme.radii.md, paddingHorizontal: 18, paddingVertical: 12 }, token: { color: theme.colors.textPrimary, fontSize: 22, writingDirection: 'rtl' },
  submit: { alignSelf: 'center', backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.pill, paddingHorizontal: 28, paddingVertical: 12 }, disabled: { opacity: 0.4 }, submitText: { color: theme.colors.bgBase, fontWeight: theme.fontWeight.medium }, feedback: { alignItems: 'center', gap: 3, paddingHorizontal: 8 }, feedbackArabic: { color: theme.colors.textPrimary, textAlign: 'center', writingDirection: 'rtl', fontSize: 18, lineHeight: 27, fontWeight: theme.fontWeight.medium }, feedbackTransliteration: { color: theme.colors.textSecondary, textAlign: 'center', writingDirection: 'ltr', fontSize: theme.fontSize.body, lineHeight: 18, fontWeight: theme.fontWeight.medium, fontStyle: 'italic', flexShrink: 1 },
});
