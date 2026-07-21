import assert from 'node:assert/strict';
import {
  buildMatchingColumns,
  MATCHING_ITEM_LAYOUT,
  selectMatchingItem,
  type MatchingPairInput,
  type MatchingState,
} from '../utils/matching';

const pairs: MatchingPairInput[] = [
  { arabic: 'مرحبا', transliteration: 'marhaban', meaning: 'Hello' },
  { arabic: 'شكرا', transliteration: 'shukran', meaning: 'Thank you' },
  { arabic: 'نعم', transliteration: "na'am", meaning: 'Yes' },
  { arabic: 'لا', transliteration: 'laa', meaning: 'No' },
];

function testIndependentColumns() {
  const columns = buildMatchingColumns(pairs, 'shuffle-test');
  assert.equal(columns.arabic.length, pairs.length);
  assert.equal(columns.english.length, pairs.length);
  assert.notDeepEqual(
    columns.arabic.map(item => item.pairId),
    columns.english.map(item => item.pairId),
    'The independently shuffled columns should not use the same order',
  );
  columns.arabic.forEach((item, index) => {
    assert.notEqual(item.pairId, columns.english[index].pairId, 'A correct pair must not start opposite');
  });
}

function testExactPairCorrectness() {
  const initial: MatchingState = { selected: null, matchedPairIds: [] };
  const selected = selectMatchingItem(initial, { side: 'english', pairId: 'pair-a' }, 2);
  const matched = selectMatchingItem(selected.state, { side: 'arabic', pairId: 'pair-a' }, 2);
  assert.equal(matched.outcome, 'correct');
  assert.deepEqual(matched.state.matchedPairIds, ['pair-a']);

  const completeSelected = selectMatchingItem(matched.state, { side: 'arabic', pairId: 'pair-b' }, 2);
  const complete = selectMatchingItem(completeSelected.state, { side: 'english', pairId: 'pair-b' }, 2);
  assert.equal(complete.outcome, 'complete');
}

function testWrongPairReset() {
  const initial: MatchingState = { selected: null, matchedPairIds: [] };
  const selected = selectMatchingItem(initial, { side: 'arabic', pairId: 'pair-a' }, 2);
  const wrong = selectMatchingItem(selected.state, { side: 'english', pairId: 'pair-b' }, 2);
  assert.equal(wrong.outcome, 'wrong');
  assert.equal(wrong.state.selected, null);
  assert.deepEqual(wrong.state.matchedPairIds, []);
  assert.deepEqual(wrong.attemptedPairIds, ['pair-a', 'pair-b']);
}

function testDuplicateLabelsUsePairIdentity() {
  const duplicatePairs: MatchingPairInput[] = [
    { arabic: 'تمام', transliteration: 'tamaam', meaning: 'Okay' },
    { arabic: 'تمام', transliteration: 'tamaam', meaning: 'Okay' },
  ];
  const columns = buildMatchingColumns(duplicatePairs, 'duplicate-test');
  assert.equal(new Set(columns.arabic.map(item => item.pairId)).size, 2);

  const first = columns.arabic[0];
  const otherMeaning = columns.english.find(item => item.pairId !== first.pairId)!;
  const selected = selectMatchingItem(
    { selected: null, matchedPairIds: [] },
    { side: 'arabic', pairId: first.pairId },
    2,
  );
  const wrong = selectMatchingItem(
    selected.state,
    { side: 'english', pairId: otherMeaning.pairId },
    2,
  );
  assert.equal(wrong.outcome, 'wrong', 'Duplicate visible labels must still match by pair identity');
}

function testMobileLayoutContract() {
  const longPairs: MatchingPairInput[] = [
    {
      arabic: 'لو سمحت، ممكن تقول لي أقرب محطة مترو فين؟',
      transliteration: 'law samaht',
      meaning: 'Excuse me, could you tell me where the nearest metro station is?',
    },
    { arabic: 'شكرا على مساعدتك', transliteration: 'shukran', meaning: 'Thank you for your help' },
    { arabic: 'الحساب لو سمحت', transliteration: 'el-hisaab', meaning: 'The bill, please' },
    { arabic: 'مع السلامة', transliteration: 'maa es-salaama', meaning: 'Goodbye and take care' },
  ];
  const columns = buildMatchingColumns(longPairs, 'mobile-layout-test');
  assert.equal(columns.arabic.length, 4, 'Four Arabic cards must render');
  assert.equal(columns.english.length, 4, 'Four English cards must render');
  longPairs.forEach(pair => {
    assert(columns.arabic.some(item => item.label === pair.arabic), 'Arabic text must remain visible');
    assert(columns.english.some(item => item.label === pair.meaning), 'English text must remain visible');
  });
  assert.equal(MATCHING_ITEM_LAYOUT.flexGrow, 0, 'Cards must not grow to fill vertical space');
  assert.equal(MATCHING_ITEM_LAYOUT.flexShrink, 0, 'Cards must keep stable content-sized touch targets');
  assert.equal(MATCHING_ITEM_LAYOUT.width, '100%', 'Cards should fill only their column width');
  assert(MATCHING_ITEM_LAYOUT.minHeight >= 44, 'Cards need an accessible minimum touch height');
  assert(!('height' in MATCHING_ITEM_LAYOUT), 'Cards must not use fixed or screen-height sizing');
}

testIndependentColumns();
testExactPairCorrectness();
testWrongPairReset();
testDuplicateLabelsUsePairIdentity();
testMobileLayoutContract();

console.log('Matching interaction tests passed.');
