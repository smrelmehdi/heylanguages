import { Check, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import type { EmojiMatchQuestion } from '../../data/quiz-types';
import {
  buildMatchingColumns,
  selectMatchingItem,
  type MatchingColumnItem,
  type MatchingSelection,
  type MatchingState,
} from '../../utils/matching';
import type { QuizAnswerResult } from '../../utils/quiz-scoring';

interface Props {
  question: EmojiMatchQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (result: QuizAnswerResult) => void;
  showTranslit?: boolean;
}

const INITIAL_STATE: MatchingState = { selected: null, matchedPairIds: [] };
const WRONG_FEEDBACK_MS = 650;

export default function EmojiMatch({ question, answerResult, onAnswer, showTranslit = false }: Props) {
  const columns = useMemo(
    () => buildMatchingColumns(question.pairs, question.id),
    [question.id, question.pairs],
  );
  const [matchingState, setMatchingState] = useState<MatchingState>(INITIAL_STATE);
  const matchingStateRef = useRef<MatchingState>(INITIAL_STATE);
  const hadWrongAttemptRef = useRef(false);
  const [wrongPairIds, setWrongPairIds] = useState<string[]>([]);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
  }, []);

  const handleSelection = (selection: MatchingSelection) => {
    if (answerResult !== 'none' || wrongPairIds.length > 0) return;
    const transition = selectMatchingItem(matchingStateRef.current, selection, question.pairs.length);
    matchingStateRef.current = transition.state;
    setMatchingState(transition.state);

    if (transition.outcome === 'wrong' && transition.attemptedPairIds) {
      hadWrongAttemptRef.current = true;
      setWrongPairIds(transition.attemptedPairIds);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = setTimeout(() => setWrongPairIds([]), WRONG_FEEDBACK_MS);
    } else {
      setWrongPairIds([]);
    }

    if (transition.outcome === 'complete') {
      onAnswer({ correct: !hadWrongAttemptRef.current });
    }
  };

  const selectedSide = matchingState.selected?.side;
  const hint = selectedSide === 'arabic'
    ? 'Now choose the English meaning'
    : selectedSide === 'english'
      ? 'Now choose the Arabic phrase'
      : wrongPairIds.length > 0
        ? 'Those do not match. Try again.'
        : 'Tap an item in either column';

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Match each Arabic phrase to its meaning</Text>

      <View style={styles.columnHeaders}>
        <Text style={[styles.columnHeader, styles.englishHeader]}>English</Text>
        <View style={styles.headerDivider} />
        <Text style={[styles.columnHeader, styles.arabicHeader]}>العربية</Text>
      </View>

      <View style={styles.rows}>
        {columns.english.map((englishItem, index) => {
          const arabicItem = columns.arabic[index];
          return (
            <View style={styles.row} key={`matching-row-${index}`}>
              <MatchCard
                item={englishItem}
                side="english"
                selected={matchingState.selected?.side === 'english' && matchingState.selected.pairId === englishItem.pairId}
                matched={matchingState.matchedPairIds.includes(englishItem.pairId)}
                matchNumber={matchingState.matchedPairIds.indexOf(englishItem.pairId) + 1}
                wrong={wrongPairIds.includes(englishItem.pairId)}
                disabled={matchingState.matchedPairIds.includes(englishItem.pairId)}
                onPress={() => handleSelection({ side: 'english', pairId: englishItem.pairId })}
              />
              <View style={styles.rowDivider} />
              <MatchCard
                item={arabicItem}
                side="arabic"
                showSecondary={showTranslit}
                selected={matchingState.selected?.side === 'arabic' && matchingState.selected.pairId === arabicItem.pairId}
                matched={matchingState.matchedPairIds.includes(arabicItem.pairId)}
                matchNumber={matchingState.matchedPairIds.indexOf(arabicItem.pairId) + 1}
                wrong={wrongPairIds.includes(arabicItem.pairId)}
                disabled={matchingState.matchedPairIds.includes(arabicItem.pairId)}
                onPress={() => handleSelection({ side: 'arabic', pairId: arabicItem.pairId })}
              />
            </View>
          );
        })}
      </View>

      <Text
        style={[styles.hint, wrongPairIds.length > 0 && styles.wrongHint]}
        accessibilityLiveRegion="polite"
      >
        {hint}
      </Text>
      <Text style={styles.progressHint}>
        {matchingState.matchedPairIds.length} of {question.pairs.length} matched
      </Text>
    </View>
  );
}

function MatchCard({
  item,
  side,
  showSecondary = false,
  selected,
  matched,
  matchNumber,
  wrong,
  disabled,
  onPress,
}: {
  item: MatchingColumnItem;
  side: 'arabic' | 'english';
  showSecondary?: boolean;
  selected: boolean;
  matched: boolean;
  matchNumber: number;
  wrong: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (!wrong) return;
    translateX.value = withSequence(
      withTiming(-4, { duration: 60 }),
      withTiming(4, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  }, [wrong, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const stateText = matched ? 'Matched' : wrong ? 'Not a match' : selected ? 'Selected' : '';

  return (
    <Pressable
      style={styles.cardPressable}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${side === 'arabic' ? 'Arabic phrase' : 'English meaning'}: ${item.label}${stateText ? `, ${stateText}` : ''}`}
      accessibilityState={{ selected, disabled }}
    >
      <Animated.View
        style={[
          styles.card,
          selected && styles.cardSelected,
          matched && styles.cardMatched,
          wrong && styles.cardWrong,
          animatedStyle,
        ]}
      >
        <View style={styles.cardContent}>
          <Text style={[styles.cardText, side === 'arabic' ? styles.arabicText : styles.englishText]}>
            {item.label}
          </Text>
          {showSecondary && item.secondaryLabel ? (
            <Text style={styles.transliterationText}>{item.secondaryLabel}</Text>
          ) : null}
        </View>
        <View style={styles.stateMarker} accessible={false}>
          {matched ? (
            <View style={styles.matchBadge}>
              <Check size={13} color={theme.colors.accentSuccess} strokeWidth={3} />
              <Text style={styles.matchNumber}>{matchNumber}</Text>
            </View>
          ) : wrong ? (
            <X size={18} color={theme.colors.accentDanger} strokeWidth={3} />
          ) : selected ? (
            <View style={styles.selectedDot} />
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: 12 },
  prompt: {
    fontSize: theme.fontSize.heading,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 25,
  },
  columnHeaders: { direction: 'ltr', flexDirection: 'row', alignItems: 'center', gap: 8 },
  columnHeader: {
    flex: 1,
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  englishHeader: { textAlign: 'left', writingDirection: 'ltr' },
  arabicHeader: { textAlign: 'right', writingDirection: 'rtl', textTransform: 'none' },
  headerDivider: { width: 1, height: 16, backgroundColor: theme.colors.borderDefault },
  rows: { gap: 10 },
  row: { direction: 'ltr', flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  rowDivider: { width: 1, backgroundColor: theme.colors.borderDefault },
  cardPressable: { flex: 1, minWidth: 0 },
  card: {
    minHeight: 72,
    height: '100%',
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.borderAccent,
    backgroundColor: 'rgba(61, 212, 192, 0.12)',
  },
  cardMatched: {
    borderColor: theme.colors.accentSuccess,
    backgroundColor: 'rgba(125, 217, 154, 0.14)',
  },
  cardWrong: {
    borderColor: theme.colors.accentDanger,
    backgroundColor: 'rgba(229, 107, 111, 0.14)',
  },
  cardContent: { flex: 1, minWidth: 0 },
  cardText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  englishText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  arabicText: {
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  transliterationText: {
    marginTop: 3,
    color: theme.colors.textTertiary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  stateMarker: {
    width: 30,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.borderAccent,
  },
  matchBadge: {
    minWidth: 28,
    height: 24,
    paddingHorizontal: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: theme.colors.accentSuccess,
  },
  matchNumber: {
    color: theme.colors.accentSuccess,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: theme.fontWeight.medium,
  },
  hint: {
    minHeight: 18,
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  wrongHint: { color: theme.colors.accentDanger, fontWeight: theme.fontWeight.medium },
  progressHint: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
