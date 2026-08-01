import type { DialectContent, DialogueTurn } from '../data/content-registry';
import type { CurriculumItem } from '../data/curriculum';
import type { QuizQuestion } from '../data/quiz-types';
import { getDialectCurriculumItems, getMissionContentForItem } from './content-resolver';
import { selectWithAttemptSeed, stableQuizHash } from './quiz-selection';
import { buildMissionSrsItemId, type MissionSrsSkill } from './srs';

const PHASE1_REVIEW_LANGUAGE_PAIR = 'en-ar';

export function getPhase1ReviewAttemptScope(dialect: string) {
  return `${PHASE1_REVIEW_LANGUAGE_PAIR}:${dialect}:review`;
}

const displayTurnArabic = (turn: DialogueTurn) => turn.displayArabic ?? turn.arabic;
const turnAudioText = (turn: DialogueTurn) => turn.audioText ?? turn.displayArabic ?? turn.arabic;
const turnKey = (turn: DialogueTurn) => displayTurnArabic(turn).replace(/\s+/g, ' ').trim();

const GENERIC_TURN_ARABIC = [
  'السلام عليكم',
  'وعليكم السلام',
  'أهلاً',
  'أهلاً بك',
  'أهلاً وسهلاً',
  'كيف حالك',
  'بخير، الله يسلمك',
  'شكراً',
  'شكراً جزيلاً',
  'تفضل',
  'حسناً',
  'مع السلامة',
];

const GENERIC_TURN_ENGLISH = [
  'peace be upon you',
  'and upon you peace',
  'hello',
  'welcome',
  'welcome to you',
  'how are you',
  'fine god keep you safe',
  'thank you',
  'thank you very much',
  'thanks',
  'here you go',
  'alright',
  'goodbye',
];

function isGenericTurn(turn: DialogueTurn) {
  const arabic = turnKey(turn).replace(/[،.!؟?]/g, '').trim();
  const english = turn.english.toLowerCase().replace(/[,.!?]/g, '').trim();
  return GENERIC_TURN_ARABIC.includes(arabic) || GENERIC_TURN_ENGLISH.includes(english);
}

function meaningfulTurns(turns: DialogueTurn[]) {
  const filtered = turns.filter(turn => !isGenericTurn(turn));
  return filtered.length > 0 ? filtered : turns;
}

function uniqueTurns(turns: DialogueTurn[], correct?: DialogueTurn) {
  const seen = new Set<string>();
  if (correct) seen.add(turnKey(correct));
  return turns.filter(turn => {
    const key = turnKey(turn);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createSelection(attemptSeed: string) {
  const select = <T,>(items: T[], count: number, seed: string, keyFor: (item: T) => string) =>
    selectWithAttemptSeed(items, count, attemptSeed, seed, keyFor);
  const shuffle = <T,>(items: T[]) => select(items, items.length, 'shuffle', item => JSON.stringify(item));
  return { select, shuffle };
}

function turnResponseShape(turn: DialogueTurn) {
  return /[?؟]\s*$/.test(displayTurnArabic(turn).trim()) || /[?]\s*$/.test(turn.english.trim())
    ? 'question'
    : 'response';
}

function selectFollowUpPair(turns: DialogueTurn[]) {
  const pairs = turns
    .map((promptTurn, index) => ({ promptTurn, answerTurn: turns[index + 1] }))
    .filter(pair => pair.promptTurn.type !== 'user' && pair.answerTurn?.type === 'user');

  return pairs.find(pair => !isGenericTurn(pair.promptTurn) && !isGenericTurn(pair.answerTurn))
    ?? pairs.find(pair => !isGenericTurn(pair.answerTurn))
    ?? pairs[0]
    ?? null;
}

function selectBlankTurn(turns: DialogueTurn[]) {
  const userTurnsWithIndex = turns
    .map((turn, index) => ({ turn, index }))
    .filter(({ turn }) => turn.type === 'user');

  return userTurnsWithIndex.find(({ turn, index }) => index > 0 && !isGenericTurn(turn))
    ?? userTurnsWithIndex.find(({ turn }) => !isGenericTurn(turn))
    ?? userTurnsWithIndex[0]
    ?? null;
}

function getScenarioSceneImage(content: DialectContent, dialect: string, scenarioName: string) {
  const item = getDialectCurriculumItems(dialect)
    .find(candidate => candidate.contentType === 'scenario' && candidate.scenarioName === scenarioName);
  return (item?.sceneImageId ? content.sceneImages[item.sceneImageId] : undefined)
    ?? content.sceneImages[scenarioName]
    ?? null;
}

type ReviewDialogueEntry = {
  name: string;
  turns: DialogueTurn[];
  item?: CurriculumItem;
};

function getReviewQuestionId(
  dialect: string,
  entry: ReviewDialogueEntry,
  skill: MissionSrsSkill,
  legacySuffix: string,
  missionVariantId = legacySuffix,
) {
  if (!entry.item?.missionId) return `${dialect}_${entry.name}_${legacySuffix}`;
  return buildMissionSrsItemId({
    languagePair: PHASE1_REVIEW_LANGUAGE_PAIR,
    dialect,
    unitId: entry.item.unitId,
    missionId: entry.item.missionId,
    skill,
    variantId: missionVariantId,
  });
}

function getMissionReviewEntries(
  content: DialectContent,
  items: readonly CurriculumItem[],
): ReviewDialogueEntry[] {
  return items.flatMap(item => {
    const mission = getMissionContentForItem(item, content);
    if (!mission?.reviewable || !mission.dialogue?.length) return [];
    return [{ name: item.missionId ?? item.contentId, turns: mission.dialogue, item }];
  });
}

/**
 * Temporary Phase 1A review bank. Home and Daily Review must call this exact
 * builder with the same attempt seed so the badge only counts servable IDs.
 */
export function buildPhase1ReviewQuestions(
  content: DialectContent,
  dialect: string,
  attemptSeed: string,
  curriculumItems: readonly CurriculumItem[] = getDialectCurriculumItems(dialect),
): QuizQuestion[] {
  const { select, shuffle } = createSelection(attemptSeed);
  const scenarioNames = Object.keys(content.scenarios);
  const legacyScenarioEntries: ReviewDialogueEntry[] = scenarioNames
    .map(name => ({ name, turns: content.scenarios[name] ?? [] }))
    .filter(entry => entry.turns.length > 0);
  const missionEntries = getMissionReviewEntries(content, curriculumItems);
  const scenarioEntries = [...legacyScenarioEntries, ...missionEntries];
  const allTurns = legacyScenarioEntries.flatMap(entry => entry.turns);
  const userTurns = allTurns.filter(turn => turn.type === 'user');
  const questions: QuizQuestion[] = [];

  const makeOptions = (correct: DialogueTurn, distractors: DialogueTurn[]) => {
    const seenMeanings = new Set([correct.english.trim().toLowerCase()]);
    const contextual = uniqueTurns([...meaningfulTurns(distractors), ...distractors], correct)
      .filter(turn => {
        const meaning = turn.english.trim().toLowerCase();
        if (!meaning || seenMeanings.has(meaning)) return false;
        seenMeanings.add(meaning);
        return true;
      });
    const sameShape = contextual.filter(turn => turnResponseShape(turn) === turnResponseShape(correct));
    const primary = select(sameShape, 3, `${turnKey(correct)}:same-shape`, turnKey);
    const primaryKeys = new Set(primary.map(turnKey));
    const wrongTurns = [
      ...primary,
      ...select(
        contextual.filter(turn => !primaryKeys.has(turnKey(turn))),
        3 - primary.length,
        `${turnKey(correct)}:same-scenario`,
        turnKey,
      ),
    ];
    return shuffle([
      { arabic: displayTurnArabic(correct), transliteration: correct.transliteration, isCorrect: true },
      ...shuffle(wrongTurns)
        .map(turn => ({ arabic: displayTurnArabic(turn), transliteration: turn.transliteration, isCorrect: false })),
    ]);
  };

  scenarioEntries.forEach(entry => {
    const sceneImage = entry.item
      ? content.sceneImages[entry.item.sceneImageId ?? entry.item.sceneImageKey ?? ''] ?? null
      : getScenarioSceneImage(content, dialect, entry.name);
    const scenarioUserTurns = entry.turns.filter(turn => turn.type === 'user');
    const scenarioNpcTurns = entry.turns.filter(turn => turn.type !== 'user');
    const scenarioQuestionTurns = uniqueTurns([...scenarioUserTurns, ...scenarioNpcTurns]);
    const followUpPair = selectFollowUpPair(entry.turns);

    if (followUpPair) {
      const { promptTurn, answerTurn } = followUpPair;
      const options = makeOptions(answerTurn, scenarioUserTurns);
      if (promptTurn.audio && options.length === 4) {
        questions.push({
          id: getReviewQuestionId(dialect, entry, 'scenario_usage', 'scene'),
          format: 'scene_replay',
          scenarioSource: entry.name.toLowerCase(),
          xpValue: 10,
          sceneImage,
          audioFile: promptTurn.audio ?? null,
          audioText: turnAudioText(promptTurn),
          prompt: `After “${promptTurn.english}”, which learner response comes next?`,
          options,
        });
      }
    }

    const blank = selectBlankTurn(entry.turns);
    if (blank) {
      const blankTurn = blank.turn;
      const start = Math.max(0, blank.index - 1);
      const dialogue = entry.turns.slice(start, Math.min(entry.turns.length, blank.index + 2)).map((turn, offset) => ({
        speaker: turn.type === 'user' ? 'yusuf' as const : 'npc' as const,
        arabic: displayTurnArabic(turn),
        transliteration: turn.transliteration,
        isBlank: start + offset === blank.index,
      }));
      const options = makeOptions(blankTurn, scenarioUserTurns);
      if (options.length === 4) {
        questions.push({
          id: getReviewQuestionId(dialect, entry, 'scenario_usage', 'fill'),
          format: 'fill_conversation',
          scenarioSource: entry.name.toLowerCase(),
          xpValue: 10,
          dialogue,
          options,
        });
      }
    }

    const listeningCandidates = meaningfulTurns(scenarioUserTurns).filter(turn => Boolean(turn.audio));
    select(listeningCandidates, 3, `${dialect}:${entry.name}:listening`, turnKey).forEach(listeningTurn => {
      const options = makeOptions(listeningTurn, scenarioQuestionTurns.filter(turn => turn.type === listeningTurn.type));
      if (options.length !== 4) return;
      questions.push({
        id: getReviewQuestionId(
          dialect,
          entry,
          'listening',
          `listen_${stableQuizHash(turnKey(listeningTurn)).toString(36)}`,
          `listen-${stableQuizHash(listeningTurn.audioPath ?? turnKey(listeningTurn)).toString(36)}`,
        ),
        format: 'listening',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: 10,
        audioFile: listeningTurn.audio ?? null,
        audioText: turnAudioText(listeningTurn),
        options,
      });
    });
  });

  const representativeUserTurns = uniqueTurns([
    ...scenarioEntries
      .map(entry => select(meaningfulTurns(entry.turns.filter(turn => turn.type === 'user')), 1, `${dialect}:${entry.name}:match`, turnKey)[0])
      .filter((turn): turn is DialogueTurn => Boolean(turn)),
    ...meaningfulTurns(userTurns),
    ...userTurns,
  ]);
  const pairs = select(representativeUserTurns, 4, `${dialect}:${scenarioNames.join(':')}:match`, turnKey).map(turn => ({
    arabic: displayTurnArabic(turn),
    transliteration: turn.transliteration,
    meaning: turn.english,
  }));
  if (pairs.length === 4 && new Set(pairs.map(pair => pair.meaning.trim().toLowerCase())).size === 4) {
    questions.push({
      id: `${dialect}_${scenarioNames.join('_')}_emoji`,
      format: 'emoji_match',
      scenarioSource: scenarioNames.join(',').toLowerCase(),
      xpValue: 10,
      pairs,
    });
  }

  missionEntries.forEach(entry => {
    const missionTurns = uniqueTurns(meaningfulTurns(entry.turns.filter(turn => turn.type === 'user')));
    const missionPairs = select(missionTurns, 4, `${dialect}:${entry.name}:mission-match`, turnKey).map(turn => ({
      arabic: displayTurnArabic(turn),
      transliteration: turn.transliteration,
      meaning: turn.english,
    }));
    if (missionPairs.length !== 4 || new Set(missionPairs.map(pair => pair.meaning.trim().toLowerCase())).size !== 4) {
      return;
    }
    questions.push({
      id: getReviewQuestionId(dialect, entry, 'recognition', 'match', 'match'),
      format: 'emoji_match',
      scenarioSource: entry.name.toLowerCase(),
      xpValue: 10,
      pairs: missionPairs,
    });
  });

  return questions;
}

export function isDedicatedReviewRoute(unit: string | undefined) {
  return unit === 'review';
}
