import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
} from 'react-native-reanimated';
import type { SceneReplayQuestion } from '../../data/quiz-types';
import type { QuizAnswerResult } from '../../utils/quiz-scoring';
import { speakArabic, playLocalAudio, stopAudio } from '../../utils/tts';
import { theme } from '../../constants/theme';

interface Props {
  question: SceneReplayQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (result: QuizAnswerResult) => void;
  showTranslit?: boolean;
}

export default function SceneReplay({ question, answerResult, onAnswer, showTranslit = true }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [translitRevealed, setTranslitRevealed] = useState(false);
  const [isStartingAudio, setIsStartingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const playQuestionAudio = async () => {
    if (isStartingAudio) return;
    setIsStartingAudio(true);
    setAudioError(null);
    try {
      if (question.audioFile) await playLocalAudio(question.audioFile);
      else await speakArabic(question.audioText);
    } catch {
      setAudioError('Audio did not start. Tap to retry.');
    } finally {
      setTimeout(() => setIsStartingAudio(false), 250);
    }
  };

  // Auto-play audio on mount
  useEffect(() => {
    const t = setTimeout(() => {
      playQuestionAudio();
    }, 400);
    return () => {
      clearTimeout(t);
      stopAudio();
    };
  }, []);

  const handleSelect = (index: number) => {
    if (selected !== null || answerResult !== 'none') return;
    setSelected(index);
    onAnswer({ correct: question.options[index].isCorrect, usedHint: translitRevealed });
  };

  const handleReplay = () => {
    playQuestionAudio();
  };

  return (
    <View style={styles.container}>
      {/* Scene image */}
      <Pressable onPress={handleReplay} disabled={isStartingAudio}>
        <Image source={question.sceneImage} style={styles.image} resizeMode="cover" />
        <View style={styles.replayBadge}>
          <Text style={styles.replayText}>{isStartingAudio ? 'Starting…' : '🔊 Tap to replay'}</Text>
        </View>
      </Pressable>
      {audioError && <Text style={styles.audioError}>{audioError}</Text>}

      {/* Prompt */}
      <Text style={styles.prompt}>{question.prompt}</Text>

      {/* Transliteration reveal button for Tier 3+ */}
      {!showTranslit && !translitRevealed && answerResult === 'none' && (
        <Pressable style={styles.revealBtn} onPress={() => setTranslitRevealed(true)}>
          <Text style={styles.revealBtnText}>👁 Reveal transliteration</Text>
        </Pressable>
      )}

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
            showTranslit={showTranslit || translitRevealed || answerResult !== 'none'}
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

function OptionCard({ arabic, transliteration, showTranslit, bg, border, textColor, romanColor, onPress, disabled, pulse, shake }: any) {
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
        {showTranslit && <Text style={[styles.optionRoman, { color: romanColor }]}>{transliteration}</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  image: { width: '100%', height: 180, borderRadius: theme.radii.lg, marginBottom: 4 },
  replayBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: theme.radii.sm, paddingHorizontal: 10, paddingVertical: 4 },
  replayText: { color: theme.colors.textPrimary, fontSize: theme.fontSize.label },
  audioError: { fontSize: 13, color: theme.colors.accentWarm, textAlign: 'center' },
  prompt: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 4 },
  revealBtn: { alignSelf: 'center', backgroundColor: 'rgba(255, 170, 0, 0.08)', borderRadius: theme.radii.pill, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255, 170, 0, 0.25)' },
  revealBtnText: { fontSize: 13, color: theme.colors.accentWarm },
  option: { minHeight: 56, borderRadius: theme.radii.sm, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center' },
  optionArabic: { fontSize: 17, fontWeight: theme.fontWeight.medium, textAlign: 'center' },
  optionRoman: { fontSize: theme.fontSize.caption, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
});
