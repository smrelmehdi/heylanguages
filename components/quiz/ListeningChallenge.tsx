import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming,
} from 'react-native-reanimated';
import type { ListeningQuestion } from '../../data/quiz-types';
import { speakArabic, playLocalAudio } from '../../utils/tts';

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
        <Text style={[styles.replayCount, replaysLeft === 0 && { color: '#555' }]}>
          {replaysLeft > 0
            ? `${replaysLeft} replay${replaysLeft !== 1 ? 's' : ''} left`
            : 'No replays left'}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {question.options.map((opt, i) => {
          let bg = '#161616';
          let border = '#2a2a2a';
          let textColor = '#fff';
          let romanColor = '#555';

          if (answerResult !== 'none' && selected !== null) {
            if (opt.isCorrect) {
              bg = 'rgba(0,115,47,0.15)'; border = '#00732F'; textColor = '#00732F'; romanColor = '#00732F';
            } else if (i === selected && !opt.isCorrect) {
              bg = 'rgba(211,47,47,0.15)'; border = '#D32F2F'; textColor = '#D32F2F'; romanColor = '#D32F2F';
            }
          } else if (i === selected) {
            border = '#00897B';
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
  prompt: { fontSize: 15, fontWeight: '700', color: '#fff', textAlign: 'center' },
  playArea: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  playBtn: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#00897B',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#00897B', shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  playBtnDisabled: { backgroundColor: '#1a1a1a', shadowOpacity: 0 },
  speakerIcon: { fontSize: 38 },
  replayCount: { fontSize: 13, color: '#00897B', fontWeight: '600' },
  options: { gap: 10 },
  option: {
    minHeight: 56, borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center',
  },
  optionArabic: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  optionRoman: { fontSize: 12, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
});
