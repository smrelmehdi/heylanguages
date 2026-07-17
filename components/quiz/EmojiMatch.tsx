import { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import type { EmojiMatchQuestion } from '../../data/quiz-types';
import { theme } from '../../constants/theme';
import type { QuizAnswerResult } from '../../utils/quiz-scoring';

// Match identifier colors — intentionally distinct hues so each connection line is visually separable.
// First two tokens align with the theme (teal + amber); purple and orange stay literal as game distinguishers.
const MATCH_COLORS = [theme.colors.accentPrimary, theme.colors.accentWarm, '#9C27B0', '#FF9800'];
const ITEM_HEIGHT = 72;
const ITEM_GAP = 10;
const COL_GAP = 16;
const COMPACT_WIDTH = 390;
const COMPACT_FONT_SCALE = 1.12;

// Center Y of item at given index in column
const getItemCenterY = (index: number) =>
  index * (ITEM_HEIGHT + ITEM_GAP) + ITEM_HEIGHT / 2;

interface Match { left: number; right: number; colorIndex: number }

interface Props {
  question: EmojiMatchQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (result: QuizAnswerResult) => void;
}

export default function EmojiMatch({ question, answerResult, onAnswer }: Props) {
  const { width: screenWidth, fontScale } = useWindowDimensions();
  // Account for card padding (20px each side from quiz screen) + this component's container
  const containerWidth = Math.max(0, screenWidth - 40);
  const compactLayout = screenWidth < COMPACT_WIDTH || fontScale >= COMPACT_FONT_SCALE;
  const colWidth = (containerWidth - COL_GAP) / 2;

  // Shuffle right column per question — only show emoji, not transliteration.
  const rightItems = useMemo(() => {
    const arr = [...question.pairs.map((p, i) => ({ emoji: p.emoji, originalIndex: i }))];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [question.id, question.pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [evaluated, setEvaluated] = useState(false);

  const isLeftMatched = (i: number) => matches.some(m => m.left === i);
  const isRightMatched = (j: number) => matches.some(m => m.right === j);
  const getMatchColor = (side: 'left' | 'right', i: number) => {
    const m = matches.find(m => side === 'left' ? m.left === i : m.right === i);
    return m ? MATCH_COLORS[m.colorIndex] : null;
  };

  const containerHeight = question.pairs.length * ITEM_HEIGHT + (question.pairs.length - 1) * ITEM_GAP;

  const handleLeftTap = (i: number) => {
    if (evaluated || answerResult !== 'none') return;
    if (isLeftMatched(i)) return;
    setSelectedLeft(prev => prev === i ? null : i);
  };

  const handleRightTap = (j: number) => {
    if (evaluated || answerResult !== 'none') return;
    if (isRightMatched(j) || selectedLeft === null) return;

    const newMatch: Match = { left: selectedLeft, right: j, colorIndex: matches.length };
    const newMatches = [...matches, newMatch];
    setMatches(newMatches);
    setSelectedLeft(null);

    if (newMatches.length === question.pairs.length) {
      setEvaluated(true);
      // Correct = every left phrase's emoji matches the right item's emoji
      const allCorrect = newMatches.every(m =>
        question.pairs[m.left].emoji === rightItems[m.right].emoji
      );
      onAnswer({ correct: allCorrect });
    }
  };

  // SVG line endpoints — right edge of left col to left edge of right col
  const lineX1 = colWidth;
  const lineX2 = colWidth + COL_GAP;

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Match each phrase to its meaning</Text>

      {compactLayout ? (
        <View style={styles.compactStack}>
          <View style={styles.compactGroup}>
            <Text style={styles.columnLabel}>Arabic phrases</Text>
            {question.pairs.map((pair, i) => {
              const color = getMatchColor('left', i);
              const isSelected = selectedLeft === i;
              const matched = isLeftMatched(i);
              const pairCorrect = answerResult !== 'none'
                ? matches.some(m => m.left === i && question.pairs[m.left].emoji === rightItems[m.right].emoji)
                : null;
              return (
                <MatchItem
                  key={i}
                  primaryLabel={pair.arabic}
                  secondaryLabel={pair.transliteration}
                  matchColor={color}
                  isSelected={isSelected}
                  isMatched={matched}
                  onPress={() => handleLeftTap(i)}
                  disabled={matched || evaluated}
                  answerResult={answerResult}
                  isCorrect={pairCorrect}
                  side="left"
                  index={i}
                  compact
                />
              );
            })}
          </View>

          <View style={styles.compactGroup}>
            <Text style={styles.columnLabel}>Meanings</Text>
            <View style={styles.emojiGrid}>
              {rightItems.map((item, j) => {
                const color = getMatchColor('right', j);
                const matched = isRightMatched(j);
                const pairCorrect = answerResult !== 'none'
                  ? matches.some(m => m.right === j && question.pairs[m.left].emoji === rightItems[m.right].emoji)
                  : null;
                return (
                  <MatchItem
                    key={j}
                    primaryLabel={item.emoji}
                    secondaryLabel={null}
                    matchColor={color}
                    isSelected={false}
                    isMatched={matched}
                    onPress={() => handleRightTap(j)}
                    disabled={matched || selectedLeft === null || evaluated}
                    answerResult={answerResult}
                    isCorrect={pairCorrect}
                    side="right"
                    index={j}
                    compact
                    containerStyle={styles.emojiGridItem}
                  />
                );
              })}
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.grid, { width: containerWidth, height: containerHeight }]}>
          {/* SVG connection lines */}
          <Svg
            width={containerWidth}
            height={containerHeight}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          >
            {matches.map((m) => (
              <Line
                key={`${m.left}-${m.right}`}
                x1={lineX1}
                y1={getItemCenterY(m.left)}
                x2={lineX2}
                y2={getItemCenterY(m.right)}
                stroke={MATCH_COLORS[m.colorIndex % MATCH_COLORS.length]}
                strokeWidth={2.5}
                strokeOpacity={0.85}
              />
            ))}
          </Svg>

          {/* Left column — Arabic phrases with transliteration */}
          <View style={[styles.column, { width: colWidth }]}>
            {question.pairs.map((pair, i) => {
              const color = getMatchColor('left', i);
              const isSelected = selectedLeft === i;
              const matched = isLeftMatched(i);
              const pairCorrect = answerResult !== 'none'
                ? matches.some(m => m.left === i && question.pairs[m.left].emoji === rightItems[m.right].emoji)
                : null;
              return (
                <MatchItem
                  key={i}
                  primaryLabel={pair.arabic}
                  secondaryLabel={pair.transliteration}
                  matchColor={color}
                  isSelected={isSelected}
                  isMatched={matched}
                  onPress={() => handleLeftTap(i)}
                  disabled={matched || evaluated}
                  answerResult={answerResult}
                  isCorrect={pairCorrect}
                  side="left"
                  index={i}
                />
              );
            })}
          </View>

          {/* Right column — Emoji only (no transliteration revealed) */}
          <View style={[styles.column, { width: colWidth }]}>
            {rightItems.map((item, j) => {
              const color = getMatchColor('right', j);
              const matched = isRightMatched(j);
              const pairCorrect = answerResult !== 'none'
                ? matches.some(m => m.right === j && question.pairs[m.left].emoji === rightItems[m.right].emoji)
                : null;
              return (
                <MatchItem
                  key={j}
                  primaryLabel={item.emoji}
                  secondaryLabel={null}
                  matchColor={color}
                  isSelected={false}
                  isMatched={matched}
                  onPress={() => handleRightTap(j)}
                  disabled={matched || selectedLeft === null || evaluated}
                  answerResult={answerResult}
                  isCorrect={pairCorrect}
                  side="right"
                  index={j}
                />
              );
            })}
          </View>
        </View>
      )}

      {!evaluated && (
        <Text style={styles.hint}>
          {selectedLeft !== null
            ? 'Now tap the matching emoji'
            : 'Tap an Arabic phrase to start'}
        </Text>
      )}

      <Text style={styles.progressHint}>
        {matches.length} of {question.pairs.length} matched
      </Text>
    </View>
  );
}

function MatchItem({
  primaryLabel,
  secondaryLabel,
  matchColor,
  isSelected,
  isMatched,
  onPress,
  disabled,
  answerResult,
  isCorrect,
  side,
  index,
  compact = false,
  containerStyle,
}: {
  primaryLabel: string;
  secondaryLabel: string | null;
  matchColor: string | null;
  isSelected: boolean;
  isMatched: boolean;
  onPress: () => void;
  disabled: boolean;
  answerResult: 'none' | 'correct' | 'wrong';
  isCorrect: boolean | null;
  side: 'left' | 'right';
  index: number;
  compact?: boolean;
  containerStyle?: ViewStyle;
}) {
  const scale = useSharedValue(1);

  if (answerResult !== 'none' && isCorrect === true) {
    scale.value = withSequence(
      withTiming(1.06, { duration: 120 }),
      withTiming(1, { duration: 120 }),
    );
  }

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  let borderColor: string = theme.colors.borderDefault;
  let bg: string = theme.colors.bgSurface;
  let stateLabel = '';

  if (isSelected) {
    borderColor = theme.colors.borderAccent;
    bg = 'rgba(61, 212, 192, 0.12)';
    stateLabel = 'Selected';
  }
  if (matchColor) {
    borderColor = matchColor;
    bg = `${matchColor}18`;
    stateLabel = 'Matched';
  }
  if (answerResult !== 'none' && isCorrect === true) {
    borderColor = theme.colors.accentSuccess;
    bg = 'rgba(125, 217, 154, 0.15)';
    stateLabel = 'Correct';
  }
  if (answerResult !== 'none' && isCorrect === false && matchColor) {
    borderColor = theme.colors.accentDanger;
    bg = 'rgba(229, 107, 111, 0.15)';
    stateLabel = 'Try again';
  }

  const accessibilityLabel = [
    side === 'left' ? 'Arabic phrase' : 'Emoji meaning',
    `${index + 1}`,
    primaryLabel,
    secondaryLabel,
    stateLabel,
  ].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isSelected || isMatched, disabled }}
    >
      <Animated.View style={[
        styles.matchItem,
        compact ? styles.matchItemCompact : { height: ITEM_HEIGHT },
        { borderColor, backgroundColor: bg },
        animStyle,
      ]}>
        <Text
          style={[
            styles.matchPrimary,
            side === 'left' && styles.arabicText,
            side === 'right' && styles.emojiText,
          ]}
          numberOfLines={compact ? 3 : 2}
        >
          {primaryLabel}
        </Text>
        {secondaryLabel ? (
          <Text style={styles.matchSecondary} numberOfLines={compact ? 2 : 1}>
            {secondaryLabel}
          </Text>
        ) : null}
        <Text style={[styles.matchState, !stateLabel && styles.matchStateHidden]}>
          {stateLabel || ' '}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: 12 },
  prompt: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center' },
  grid: { alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  column: { gap: ITEM_GAP },
  compactStack: { alignSelf: 'stretch', gap: 14 },
  compactGroup: { alignSelf: 'stretch', gap: 8 },
  columnLabel: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ITEM_GAP,
  },
  emojiGridItem: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  matchItem: {
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  matchItemCompact: {
    minHeight: 64,
  },
  matchPrimary: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  arabicText: {
    writingDirection: 'rtl',
  },
  emojiText: {
    fontSize: 28,
    lineHeight: 32,
  },
  matchSecondary: {
    fontSize: theme.fontSize.caption,
    lineHeight: 16,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  matchState: {
    minHeight: 14,
    marginTop: 3,
    fontSize: 10,
    lineHeight: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  matchStateHidden: {
    opacity: 0,
  },
  hint: { fontSize: theme.fontSize.caption, color: theme.colors.textTertiary, textAlign: 'center', fontStyle: 'italic' },
  progressHint: { fontSize: theme.fontSize.caption, color: theme.colors.textTertiary, textAlign: 'center' },
});
