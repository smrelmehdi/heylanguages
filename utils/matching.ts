import { selectWithAttemptSeed } from './quiz-selection';

export type MatchingPairInput = {
  arabic: string;
  transliteration: string;
  meaning: string;
};

export type MatchingColumnItem = {
  pairId: string;
  label: string;
  secondaryLabel?: string;
};

export type MatchingSelection = {
  side: 'arabic' | 'english';
  pairId: string;
};

export type MatchingState = {
  selected: MatchingSelection | null;
  matchedPairIds: string[];
};

export type MatchingTransition = {
  state: MatchingState;
  outcome: 'selected' | 'cleared' | 'correct' | 'wrong' | 'complete' | 'ignored';
  attemptedPairIds?: [string, string];
};

// Keep matching cards content-sized inside independently scrolling quiz layouts.
export const MATCHING_ITEM_LAYOUT = Object.freeze({
  width: '100%' as const,
  minHeight: 58,
  flexGrow: 0,
  flexShrink: 0,
});

function rotate<T>(items: T[], offset: number) {
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function avoidOppositePairs(left: MatchingColumnItem[], right: MatchingColumnItem[]) {
  if (right.length < 2) return right;
  for (let offset = 0; offset < right.length; offset += 1) {
    const candidate = rotate(right, offset);
    if (candidate.every((item, index) => item.pairId !== left[index]?.pairId)) return candidate;
  }

  const rightByPairId = new Map(right.map(item => [item.pairId, item]));
  return left.map((_, index) => {
    const nextPairId = left[(index + 1) % left.length].pairId;
    return rightByPairId.get(nextPairId)!;
  });
}

export function buildMatchingColumns(pairs: MatchingPairInput[], questionId: string) {
  const indexed = pairs.map((pair, index) => ({
    pairId: `${questionId}:pair:${index}`,
    pair,
  }));
  const arabic = selectWithAttemptSeed(
    indexed.map(({ pairId, pair }) => ({
      pairId,
      label: pair.arabic,
      secondaryLabel: pair.transliteration,
    })),
    indexed.length,
    questionId,
    'matching-arabic-column',
    item => item.pairId,
  );
  const independentlyShuffledEnglish = selectWithAttemptSeed(
    indexed.map(({ pairId, pair }) => ({ pairId, label: pair.meaning })),
    indexed.length,
    questionId,
    'matching-english-column',
    item => item.pairId,
  );

  return {
    arabic,
    english: avoidOppositePairs(arabic, independentlyShuffledEnglish),
  };
}

export function selectMatchingItem(
  state: MatchingState,
  selection: MatchingSelection,
  totalPairs: number,
): MatchingTransition {
  if (state.matchedPairIds.includes(selection.pairId)) {
    return { state, outcome: 'ignored' };
  }

  if (!state.selected) {
    return { state: { ...state, selected: selection }, outcome: 'selected' };
  }

  if (state.selected.side === selection.side) {
    const selected = state.selected.pairId === selection.pairId ? null : selection;
    return { state: { ...state, selected }, outcome: selected ? 'selected' : 'cleared' };
  }

  if (state.selected.pairId !== selection.pairId) {
    return {
      state: { ...state, selected: null },
      outcome: 'wrong',
      attemptedPairIds: [state.selected.pairId, selection.pairId],
    };
  }

  const matchedPairIds = [...state.matchedPairIds, selection.pairId];
  return {
    state: { selected: null, matchedPairIds },
    outcome: matchedPairIds.length === totalPairs ? 'complete' : 'correct',
  };
}
