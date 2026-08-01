import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { MeaningSelectQuestion } from '../../data/quiz-types';
import type { QuizAnswerResult } from '../../utils/quiz-scoring';

export default function MeaningSelect({ question, answerResult, onAnswer }: { question: MeaningSelectQuestion; answerResult: 'none'|'correct'|'wrong'; onAnswer: (result: QuizAnswerResult) => void }) {
  const [selected, setSelected] = useState<number|null>(null);
  return <View style={styles.container}>
    <Text style={styles.instruction}>Choose the correct meaning:</Text><Text style={styles.arabic}>{question.arabic}</Text>
    <View style={styles.options}>{question.options.map((option,index) => {
      const correct = answerResult !== 'none' && option.isCorrect;
      const wrong = answerResult !== 'none' && selected === index && !option.isCorrect;
      return <Pressable key={option.meaning} disabled={selected !== null} style={[styles.option, correct && styles.correct, wrong && styles.wrong]} onPress={() => { if (selected !== null) return; setSelected(index); onAnswer({ correct: option.isCorrect }); }}><Text style={styles.meaning}>{option.meaning}</Text></Pressable>;
    })}</View>
    {answerResult !== 'none' && <Text style={styles.feedback}>{question.transliteration}</Text>}
  </View>;
}
const styles = StyleSheet.create({ container:{ gap:14 }, instruction:{ color:theme.colors.textSecondary,textAlign:'center',fontSize:theme.fontSize.heading }, arabic:{ color:theme.colors.textPrimary,textAlign:'center',fontSize:30,lineHeight:44,writingDirection:'rtl' }, options:{ gap:10 }, option:{ minHeight:58,borderWidth:1.5,borderColor:theme.colors.borderDefault,borderRadius:theme.radii.md,padding:14,justifyContent:'center' }, correct:{ borderColor:theme.colors.accentSuccess }, wrong:{ borderColor:theme.colors.accentDanger }, meaning:{ color:theme.colors.textPrimary,textAlign:'center',fontSize:theme.fontSize.body }, feedback:{ color:theme.colors.textSecondary,textAlign:'center',writingDirection:'ltr',fontSize:theme.fontSize.body,lineHeight:18,fontWeight:theme.fontWeight.medium,fontStyle:'italic',flexShrink:1 } });
