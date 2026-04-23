import { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import type { EmojiMatchQuestion } from '../../data/quiz-types';
import { theme } from '../../constants/theme';

// Match identifier colors — intentionally distinct hues so each connection line is visually separable.
// First two tokens align with the theme (teal + amber); purple and orange stay literal as game distinguishers.
const MATCH_COLORS = [theme.colors.accentPrimary, theme.colors.accentWarm, '#9C27B0', '#FF9800'];
const ITEM_HEIGHT = 64;
const ITEM_GAP = 10;
const COL_GAP = 20;

// Center Y of item at given index in column
const getItemCenterY = (index: number) =>
  index * (ITEM_HEIGHT + ITEM_GAP) + ITEM_HEIGHT / 2;

interface Match { left: number; right: number; colorIndex: number }

interface Props {
  question: EmojiMatchQuestion;
  answerResult: 'none' | 'correct' | 'wrong';
  onAnswer: (correct: boolean) => void;
}

export default function EmojiMatch({ question, answerResult, onAnswer }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  // Account for card padding (20px each side from quiz screen) + this component's container
  const containerWidth = screenWidth - 40;
  const colWidth = (containerWidth - COL_GAP) / 2;

  // Shuffle right column once on mount — only show emoji, not transliteration
  const rightItems = useMemo(() => {
    const arr = [...question.pairs.map((p, i) => ({ emoji: p.emoji, originalIndex: i }))];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [evaluated, setEvaluated] = useState(false);

  const isLeftMatched = (i: number) => matches.some(m => m.left === i);
  const isRightMatched = (j: number) => matches.some(m => m.right === j);
  const getMatchColor = (side: 'left' | 'right', i: number) => {
    const m = matches.find(m => side === 'left' ? m.left === i : m.right === i);
    return m ? MATCH_COLORS[m.colorIndex] : null;
  };

  const containerHeight = 4 * ITEM_HEIGHT + 3 * ITEM_GAP;

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

    if (newMatches.length === 4) {
      setEvaluated(true);
      // Correct = every left phrase's emoji matches the right item's emoji
      const allCorrect = newMatches.every(m =>
        question.pairs[m.left].emoji === rightItems[m.right].emoji
      );
      onAnswer(allCorrect);
    }
  };

  // SVG line endpoints — right edge of left col to left edge of right col
  const lineX1 = colWidth;
  const lineX2 = colWidth + COL_GAP;

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Match each phrase to its meaning</Text>

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
                onPress={() => handleLeftTap(i)}
                disabled={isLeftMatched(i) || evaluated}
                answerResult={answerResult}
                isCorrect={pairCorrect}
              />
            );
          })}
        </View>

        {/* Right column — Emoji only (no transliteration revealed) */}
        <View style={[styles.column, { width: colWidth }]}>
          {rightItems.map((item, j) => {
            const color = getMatchColor('right', j);
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
                onPress={() => handleRightTap(j)}
                disabled={isRightMatched(j) || selectedLeft === null || evaluated}
                answerResult={answerResult}
                isCorrect={pairCorrect}
              />
            );
          })}
        </View>
      </View>

      {!evaluated && (
        <Text style={styles.hint}>
          {selectedLeft !== null
            ? 'Now tap the matching emoji \u2192'
            : 'Tap an Arabic phrase to start'}
        </Text>
      )}
    </View>
  );
}

function MatchItem({
  primaryLabel,
  secondaryLabel,
  matchColor,
  isSelected,
  onPress,
  disabled,
  answerResult,
  isCorrect,
}: {
  primaryLabel: string;
  secondaryLabel: string | null;
  matchColor: string | null;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
  answerResult: 'none' | 'correct' | 'wrong';
  isCorrect: boolean | null;
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

  if (isSelected) {
    borderColor = theme.colors.borderAccent;
    bg = 'rgba(61, 212, 192, 0.12)';
  }
  if (matchColor) {
    borderColor = matchColor;
    bg = `${matchColor}18`;
  }
  if (answerResult !== 'none' && isCorrect === true) {
    borderColor = theme.colors.accentSuccess;
    bg = 'rgba(125, 217, 154, 0.15)';
  }
  if (answerResult !== 'none' && isCorrect === false && matchColor) {
    borderColor = theme.colors.accentDanger;
    bg = 'rgba(229, 107, 111, 0.15)';
  }

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View style={[
        styles.matchItem,
        { height: ITEM_HEIGHT, borderColor, backgroundColor: bg },
        animStyle,
      ]}>
        <Text style={styles.matchPrimary} numberOfLines={1} adjustsFontSizeToFit>
          {primaryLabel}
        </Text>
        {secondaryLabel ? (
          <Text style={styles.matchSecondary} numberOfLines={1}>{secondaryLabel}</Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  prompt: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center' },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { gap: ITEM_GAP },
  matchItem: {
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  matchPrimary: {
    fontSize: 20,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  matchSecondary: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'center',
  },
  hint: { fontSize: theme.fontSize.caption, color: theme.colors.textTertiary, textAlign: 'center', fontStyle: 'italic' },
});
