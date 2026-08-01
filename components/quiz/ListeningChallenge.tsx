import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence, withTiming,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { useDialect } from '../../contexts/DialectContext';
import type { ListeningQuestion } from '../../data/quiz-types';
import { createAudioPlaybackOwner } from '../../utils/audio-lifecycle';
import type { QuizAnswerResult } from '../../utils/quiz-scoring';
import { playLocalAudioWithTtsFallback, releaseAudioPlaybackOwner } from '../../utils/tts';

const MAX_REPLAYS = 3;

interface Props {
  question: ListeningQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (result: QuizAnswerResult) => void;
  showTranslit?: boolean;
}

export default function ListeningChallenge({ question, answerResult, onAnswer, showTranslit = true }: Props) {
  const { content } = useDialect();
  const audioOwner = useRef(createAudioPlaybackOwner('quiz-listening')).current;
  const [selected, setSelected] = useState<number | null>(null);
  const [translitRevealed, setTranslitRevealed] = useState(false);
  const [isStartingAudio, setIsStartingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  // replays = number of manual replay presses (auto-play on mount doesn't count)
  const [replays, setReplays] = useState(0);
  const btnScale = useSharedValue(1);
  const isMountedRef = useRef(true);
  const resetStartingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doPlay = async () => {
    if (isStartingAudio) return;
    setIsStartingAudio(true);
    setAudioError(null);
    btnScale.value = withSequence(withTiming(0.92, { duration: 80 }), withTiming(1, { duration: 80 }));
    try {
      await playLocalAudioWithTtsFallback(question.audioFile, question.audioText, content.voiceId, { owner: audioOwner });
    } catch {
      if (isMountedRef.current) setAudioError('Audio did not start. Tap to retry.');
    } finally {
      if (isMountedRef.current) {
        resetStartingTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) setIsStartingAudio(false);
        }, 250);
      }
    }
  };

  // Auto-play on mount — does NOT count against replay limit
  useEffect(() => {
    const t = setTimeout(() => doPlay(), 400);
    return () => {
      isMountedRef.current = false;
      clearTimeout(t);
      if (resetStartingTimerRef.current) clearTimeout(resetStartingTimerRef.current);
      releaseAudioPlaybackOwner(audioOwner);
    };
  }, []);

  const handleReplay = () => {
    if (replays >= MAX_REPLAYS || answerResult !== 'none' || isStartingAudio) return;
    setReplays(r => r + 1);
    doPlay();
  };

  const handleSelect = (index: number) => {
    if (selected !== null || answerResult !== 'none') return;
    setSelected(index);
    onAnswer({ correct: question.options[index].isCorrect, usedHint: translitRevealed });
  };

  const replaysLeft = MAX_REPLAYS - replays;
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>What did you hear?</Text>

      {/* Play button */}
      <View style={styles.playArea}>
        <Pressable onPress={handleReplay} disabled={replays >= MAX_REPLAYS || answerResult !== 'none' || isStartingAudio}>
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
              : isStartingAudio
                ? 'Starting audio…'
                : 'No replays left'}
        </Text>
        {audioError && <Text style={styles.audioError}>{audioError}</Text>}
      </View>

      {/* Transliteration reveal for Tier 3+ */}
      {!showTranslit && !translitRevealed && answerResult === 'none' && (
        <Pressable style={styles.revealBtn} onPress={() => setTranslitRevealed(true)}>
          <Text style={styles.revealBtnText}>👁 Reveal transliteration</Text>
        </Pressable>
      )}

      {/* Options */}
      <View style={styles.options}>
        {question.options.map((opt, i) => {
          let bg: string = theme.colors.bgSurface;
          let border: string = theme.colors.borderDefault;
          let textColor: string = theme.colors.textPrimary;
          let romanColor: string = theme.colors.textSecondary;

          if (answerResult !== 'none' && selected !== null) {
            if (opt.isCorrect) {
              bg = 'rgba(125, 217, 154, 0.15)'; border = theme.colors.accentSuccess; textColor = theme.colors.accentSuccess; romanColor = theme.colors.accentSuccess;
            } else if (i === selected && !opt.isCorrect) {
              bg = 'rgba(229, 107, 111, 0.15)'; border = theme.colors.accentDanger; textColor = theme.colors.accentDanger; romanColor = theme.colors.accentDanger;
            }
          } else if (i === selected) {
            border = theme.colors.borderAccent;
          }

          const showRoman = showTranslit || translitRevealed || answerResult !== 'none';
          return (
            <Pressable
              key={i}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(i)}
              disabled={selected !== null}
            >
              <Text style={[styles.optionArabic, { color: textColor }]}>{opt.arabic}</Text>
              {showRoman && <Text style={[styles.optionRoman, { color: romanColor }]}>{opt.transliteration}</Text>}
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
  audioError: { fontSize: 13, color: theme.colors.accentWarm, textAlign: 'center' },
  revealBtn: { alignSelf: 'center', backgroundColor: 'rgba(255, 170, 0, 0.08)', borderRadius: theme.radii.pill, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255, 170, 0, 0.25)', marginBottom: 4 },
  revealBtnText: { fontSize: 13, color: theme.colors.accentWarm },
  options: { gap: 10 },
  option: {
    minHeight: 56, borderRadius: theme.radii.sm, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center',
  },
  optionArabic: { fontSize: 17, fontWeight: theme.fontWeight.medium, textAlign: 'center' },
  optionRoman: { fontSize: theme.fontSize.body, lineHeight: 18, fontWeight: theme.fontWeight.medium, textAlign: 'center', writingDirection: 'ltr', fontStyle: 'italic', marginTop: 3, flexShrink: 1 },
});
