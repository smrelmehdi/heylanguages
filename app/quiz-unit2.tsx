import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { feedbackCorrect, feedbackWrong } from '../utils/feedback';
import { getDueItemIds, getQuizSrsSummary, prioritizeQuizItems, recordQuizSrsResult, type QuizSrsSummary } from '../utils/srs';

import PremiumRouteGate from '../components/PremiumRouteGate';
import { useDialect } from '../contexts/DialectContext';
import { useXP } from '../contexts/XPContext';
import type { DialectContent, DialogueTurn } from '../data/content-registry';
import { QUIZ_PART1_QUESTIONS } from '../data/quiz-part1';
import { QUIZ_PART2_QUESTIONS } from '../data/quiz-part2';
import type { QuizQuestion } from '../data/quiz-types';
import { QUIZ_UNIT6_QUESTIONS } from '../data/quiz-unit6';
import { getQuizContentId } from '../utils/access';
import { recordActivity } from '../utils/streak';
import { supabase } from '../utils/supabase';

import EmojiMatch from '../components/quiz/EmojiMatch';
import FillConversation from '../components/quiz/FillConversation';
import ListeningChallenge from '../components/quiz/ListeningChallenge';
import QuizIntro from '../components/quiz/QuizIntro';
import QuizProgress from '../components/quiz/QuizProgress';
import QuizResults from '../components/quiz/QuizResults';
import SceneReplay from '../components/quiz/SceneReplay';
import TransliterationInput from '../components/quiz/TransliterationInput';
import ArabicSelect from '../components/quiz/ArabicSelect';
import { theme } from '../constants/theme';
import type { Word } from '../constants/words';
import { getQuizTier, getQuizTierInfo, TYPING_QUESTION_XP, ARABIC_SELECT_XP, type QuizTierInfo } from '../utils/quiz-level';
import type { ArabicSelectQuestion, TransliterationTypeQuestion } from '../data/quiz-types';
import {
  getPassingScore,
  getQuestionAttemptXp,
  getQuizMaxXp,
  getQuizPassed,
  type QuizAnswerResult,
} from '../utils/quiz-scoring';
import { getDialectCurriculumItems } from '../utils/content-resolver';
import { buildCompletionKey, getCompletionKeyCandidates, parseCompletionKey } from '../utils/progression';

type Phase = 'intro' | 'quiz' | 'redrill' | 'results';

const UNIT2_PART1_SCENARIOS = ['Cafe', 'Taxi', 'Hotel'];
const UNIT2_PART2_SCENARIOS = ['Restaurant', 'Supermarket', 'Pharmacy'];
const UNIT8_SCENARIOS = [
  'LostInCity',
  'CarBreakdown',
  'PoliceStation',
  'HospitalEmergency',
  'LostWallet',
  'FlightProblem',
  'AskingForHelp',
];
const UNIT10_SCENARIOS = [
  'FriendsNewNeighbor',
  'FriendsFootball',
  'FriendsGaming',
  'FriendsWeekend',
  'FriendsSocialMedia',
  'FriendsRoadTrip',
  'FriendsBirthday',
  'FriendsFarewell',
];
const EMOJI_POOL = ['☕', '🚕', '🏨', '🍽️', '🛒', '💊', '💬', '👋'];
const SUPPORTED_TIERED_QUIZ_UNITS = new Set(['review', '2p1', '2p2', '6', '7', '8', '9', '10']);

type WordLessonEntry = {
  id: string;
  words: Word[];
};

type QuizAttemptPlan = {
  questions: QuizQuestion[];
  tierInfo: QuizTierInfo;
  srsSummary: QuizSrsSummary | null;
  maxXp: number;
};

type InitialAttemptResult = {
  correctCount: number;
  score: number;
  passed: boolean;
  attemptXp: number;
  missedCount: number;
};

const displayTurnArabic = (turn: DialogueTurn) => turn.displayArabic ?? turn.arabic;
const turnAudioText = (turn: DialogueTurn) => turn.audioText ?? turn.displayArabic ?? turn.arabic;
const turnKey = (turn: DialogueTurn) => displayTurnArabic(turn).replace(/\s+/g, ' ').trim();
const wordArabic = (word: Word) => word.displayArabic ?? word.arabic;
const wordAudioText = (word: Word) => word.audioText ?? word.displayArabic ?? word.arabic;
const wordKey = (word: Word) => wordArabic(word).replace(/\s+/g, ' ').trim();

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

function uniqueWords(words: Word[], correct?: Word) {
  const seen = new Set<string>();
  if (correct) seen.add(wordKey(correct));
  return words.filter(word => {
    const key = wordKey(word);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function makeWordOptions(correct: Word, words: Word[]) {
  const distractors = uniqueWords(words, correct).slice(0, 3);
  return shuffle([
    { arabic: wordArabic(correct), transliteration: correct.transliteration, isCorrect: true },
    ...shuffle(distractors).map(word => ({
      arabic: wordArabic(word),
      transliteration: word.transliteration,
      isCorrect: false,
    })),
  ]);
}

function contextEmoji(word: Word, fallbackIndex: number) {
  const firstSymbol = Array.from(word.context.trim())[0];
  return firstSymbol && firstSymbol.length > 0 ? firstSymbol : EMOJI_POOL[fallbackIndex % EMOJI_POOL.length] ?? '💬';
}

function representativeWords(lessons: WordLessonEntry[]) {
  const firstPass = lessons.flatMap(lesson => [
    lesson.words[0],
    lesson.words[3],
    lesson.words[6],
  ].filter((word): word is Word => Boolean(word)));
  return uniqueWords([...firstPass, ...lessons.flatMap(lesson => lesson.words)]);
}

function targetQuestionCount(tier: QuizTierInfo) {
  if (tier.tier >= 4) return 18;
  if (tier.tier >= 3) return 15;
  if (tier.tier >= 2) return 12;
  return 10;
}

function capQuestionsForTier(questions: QuizQuestion[], tier: QuizTierInfo) {
  return questions.slice(0, Math.min(targetQuestionCount(tier), questions.length));
}

function buildWordUnitQuiz(unitKey: string, lessons: WordLessonEntry[], tier: QuizTierInfo): QuizQuestion[] {
  const allWords = uniqueWords(lessons.flatMap(lesson => lesson.words));
  const selectedWords = representativeWords(lessons);
  const questions: QuizQuestion[] = [];

  const listeningLimit = tier.tier >= 2 ? 10 : 8;
  selectedWords.slice(0, listeningLimit).forEach((word, index) => {
    questions.push({
      id: `${unitKey}_listen_${index + 1}`,
      format: 'listening',
      scenarioSource: unitKey,
      xpValue: 10,
      audioFile: word.audio ?? null,
      audioText: wordAudioText(word),
      options: makeWordOptions(word, allWords),
    });
  });

  const emojiChunks = [
    selectedWords.slice(10, 14),
    selectedWords.slice(14, 18),
  ].filter(chunk => chunk.length === 4);

  emojiChunks.forEach((chunk, chunkIndex) => {
    questions.push({
      id: `${unitKey}_emoji_${chunkIndex + 1}`,
      format: 'emoji_match',
      scenarioSource: unitKey,
      xpValue: 10,
      pairs: chunk.map((word, index) => ({
        arabic: wordArabic(word),
        transliteration: word.transliteration,
        emoji: contextEmoji(word, chunkIndex * 4 + index),
      })),
    });
  });

  if (tier.hasTyping) {
    selectedWords.slice(18, 21).forEach((word, index) => {
      const firstWord = word.transliteration.trim().split(/[\s-]/)[0] ?? '';
      questions.push({
        id: `${unitKey}_translit_${index + 1}`,
        format: 'transliteration_type',
        scenarioSource: unitKey,
        xpValue: TYPING_QUESTION_XP,
        arabic: wordArabic(word),
        audioFile: word.audio ?? null,
        audioText: wordAudioText(word),
        english: word.english,
        correctAnswer: word.transliteration,
        acceptedAnswers: transliterationAlternatives(word.transliteration),
        hintFirstWord: firstWord,
      } satisfies TransliterationTypeQuestion);
    });
  }

  if (tier.hasArabicSelect) {
    selectedWords.slice(21, 24).forEach((word, index) => {
      questions.push({
        id: `${unitKey}_arabic_select_${index + 1}`,
        format: 'arabic_select',
        scenarioSource: unitKey,
        xpValue: ARABIC_SELECT_XP,
        audioFile: word.audio ?? null,
        audioText: wordAudioText(word),
        english: word.english,
        options: shuffle([
          { arabic: wordArabic(word), isCorrect: true },
          ...uniqueWords(allWords, word).slice(0, 3).map(distractor => ({
            arabic: wordArabic(distractor),
            isCorrect: false,
          })),
        ]),
      } satisfies ArabicSelectQuestion);
    });
  }

  return capQuestionsForTier(shuffleNoAdjacentFormats(questions), tier);
}

function getWordLessonsForUnit(dialect: string, unitId: string): WordLessonEntry[] {
  return getDialectCurriculumItems(dialect)
    .filter(item => item.unitId === unitId && item.contentType === 'lesson' && item.lessonWords)
    .map(item => ({ id: item.contentId, words: item.lessonWords ?? [] }));
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

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeOptions(correct: DialogueTurn, distractors: DialogueTurn[], fallbackDistractors: DialogueTurn[] = []) {
  const wrongTurns = uniqueTurns([...meaningfulTurns(distractors), ...distractors, ...fallbackDistractors], correct)
    .slice(0, 3);
  return shuffle([
    { arabic: displayTurnArabic(correct), transliteration: correct.transliteration, isCorrect: true },
    ...shuffle(wrongTurns)
      .map(turn => ({ arabic: displayTurnArabic(turn), transliteration: turn.transliteration, isCorrect: false })),
  ]);
}

function transliterationAlternatives(canonical: string) {
  const normalized = canonical.toLowerCase();
  const variants = new Set<string>();
  const addVariant = (from: RegExp, to: string) => variants.add(canonical.replace(from, to));

  if (normalized.includes('shukran')) addVariant(/shukran/ig, 'shokran');
  if (normalized.includes('shokran')) addVariant(/shokran/ig, 'shukran');
  if (normalized.includes('hatha')) addVariant(/hatha/ig, 'hadha');
  if (normalized.includes('hadha')) addVariant(/hadha/ig, 'hatha');
  if (normalized.includes('ayez')) {
    addVariant(/ayez/ig, 'ayiz');
    addVariant(/ayez/ig, 'aayiz');
  }
  if (normalized.includes('ayiz')) {
    addVariant(/ayiz/ig, 'ayez');
    addVariant(/ayiz/ig, 'aayiz');
  }
  if (normalized.includes('aayiz')) {
    addVariant(/aayiz/ig, 'ayez');
    addVariant(/aayiz/ig, 'ayiz');
  }
  if (normalized.includes('izzayak')) {
    addVariant(/izzayak/ig, 'ezzayak');
    addVariant(/izzayak/ig, 'ezayak');
  }
  if (normalized.includes('ezzayak')) {
    addVariant(/ezzayak/ig, 'izzayak');
    addVariant(/ezzayak/ig, 'ezayak');
  }
  if (normalized.includes('ezayak')) {
    addVariant(/ezayak/ig, 'izzayak');
    addVariant(/ezayak/ig, 'ezzayak');
  }

  variants.delete(canonical);
  return [...variants];
}

function buildDialectUnit2Quiz(
  scenarioNames: string[],
  content: DialectContent,
  dialect: string,
  tier?: QuizTierInfo,
): QuizQuestion[] {
  const scenarioEntries = scenarioNames
    .map(name => ({ name, turns: content.scenarios[name] ?? [] }))
    .filter(entry => entry.turns.length > 0);
  const allTurns = scenarioEntries.flatMap(entry => entry.turns);
  const userTurns = allTurns.filter(turn => turn.type === 'user');
  const npcTurns = allTurns.filter(turn => turn.type !== 'user');
  const questions: QuizQuestion[] = [];

  scenarioEntries.forEach((entry, scenarioIndex) => {
    const sceneImage = content.sceneImages[entry.name] ?? null;
    const scenarioUserTurns = entry.turns.filter(turn => turn.type === 'user');
    const scenarioNpcTurns = entry.turns.filter(turn => turn.type !== 'user');
    const scenarioQuestionTurns = uniqueTurns([...scenarioUserTurns, ...scenarioNpcTurns]);
    const followUpPair = selectFollowUpPair(entry.turns);

    if (followUpPair) {
      const { promptTurn, answerTurn } = followUpPair;
      questions.push({
        id: `${dialect}_${entry.name}_scene`,
        format: 'scene_replay',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: 10,
        sceneImage,
        audioFile: promptTurn.audio ?? null,
        audioText: turnAudioText(promptTurn),
        prompt: 'What is the correct response?',
        options: makeOptions(answerTurn, scenarioUserTurns, userTurns),
      });
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
      questions.push({
        id: `${dialect}_${entry.name}_fill`,
        format: 'fill_conversation',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: 10,
        dialogue,
        options: makeOptions(blankTurn, scenarioUserTurns, userTurns),
      });
    }

    const listeningCandidates = meaningfulTurns(scenarioUserTurns);
    const listeningTurn = listeningCandidates[scenarioIndex % Math.max(1, listeningCandidates.length)];
    if (listeningTurn) {
      questions.push({
        id: `${dialect}_${entry.name}_listen`,
        format: 'listening',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: 10,
        audioFile: listeningTurn.audio ?? null,
        audioText: turnAudioText(listeningTurn),
        options: makeOptions(listeningTurn, scenarioQuestionTurns, [...userTurns, ...npcTurns]),
      });
    }
  });

  const representativeUserTurns = uniqueTurns([
    ...scenarioEntries
      .map(entry => meaningfulTurns(entry.turns.filter(turn => turn.type === 'user'))[0])
      .filter((turn): turn is DialogueTurn => Boolean(turn)),
    ...meaningfulTurns(userTurns),
    ...userTurns,
  ]);
  const pairs = representativeUserTurns.slice(0, 4).map((turn, index) => ({
    arabic: displayTurnArabic(turn),
    transliteration: turn.transliteration,
    emoji: EMOJI_POOL[index] ?? '💬',
  }));
  if (pairs.length === 4) {
    questions.push({
      id: `${dialect}_${scenarioNames.join('_')}_emoji`,
      format: 'emoji_match',
      scenarioSource: scenarioNames.join(',').toLowerCase(),
      xpValue: 10,
      pairs,
    });
  }

  // ── Tier 3+: Transliteration typing questions (1 per scenario) ───────────
  if (tier && tier.hasTyping) {
    scenarioEntries.forEach(entry => {
      const candidate = meaningfulTurns(entry.turns.filter(t => t.type === 'user'))[0];
      if (!candidate || !candidate.transliteration) return;
      const firstWord = candidate.transliteration.trim().split(/[\s-]/)[0] ?? '';
      questions.push({
        id: `${dialect}_${entry.name}_translit`,
        format: 'transliteration_type',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: TYPING_QUESTION_XP,
        arabic: displayTurnArabic(candidate),
        audioFile: candidate.audio ?? null,
        audioText: turnAudioText(candidate),
        english: candidate.english,
        correctAnswer: candidate.transliteration,
        acceptedAnswers: transliterationAlternatives(candidate.transliteration),
        hintFirstWord: firstWord,
      } satisfies TransliterationTypeQuestion);
    });
  }

  // ── Tier 4+: Arabic-select questions (read script, no transliteration) ──
  if (tier && tier.hasArabicSelect) {
    scenarioEntries.forEach(entry => {
      const candidates = meaningfulTurns(entry.turns.filter(t => t.type !== 'user'));
      const target = candidates[0];
      if (!target) return;
      const distractors = uniqueTurns(
        [...meaningfulTurns(userTurns), ...npcTurns],
        target,
      ).slice(0, 3);
      if (distractors.length < 2) return;
      questions.push({
        id: `${dialect}_${entry.name}_arabic_select`,
        format: 'arabic_select',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: ARABIC_SELECT_XP,
        audioFile: target.audio ?? null,
        audioText: turnAudioText(target),
        english: target.english,
        options: shuffle([
          { arabic: displayTurnArabic(target), isCorrect: true },
          ...distractors.map(d => ({ arabic: displayTurnArabic(d), isCorrect: false })),
        ]),
      } satisfies ArabicSelectQuestion);
    });
  }

  return questions;
}

function buildScenarioUnitQuiz(
  unitKey: string,
  scenarioNames: string[],
  content: DialectContent,
  dialect: string,
  tier: QuizTierInfo,
) {
  const sourceQuestions = buildDialectUnit2Quiz(scenarioNames, content, dialect, tier)
    .filter(question => tier.formats.includes(question.format))
    .map(question => ({
      ...question,
      id: `${unitKey}_${question.id}`,
      scenarioSource: `${unitKey}:${question.scenarioSource}`,
    }));
  return capQuestionsForTier(shuffleNoAdjacentFormats(sourceQuestions), tier);
}

// ── Shuffle: no two same formats adjacent ────────────────────────────────────
function shuffleNoAdjacentFormats(questions: QuizQuestion[]): QuizQuestion[] {
  const arr = [...questions];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i].format === arr[i + 1].format) {
      for (let j = i + 2; j < arr.length; j++) {
        if (arr[j].format !== arr[i].format) {
          [arr[i + 1], arr[j]] = [arr[j], arr[i + 1]];
          break;
        }
      }
    }
  }
  return arr;
}

export default function QuizUnit2Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unit } = useLocalSearchParams<{ unit?: string }>();
  const { dialect, content } = useDialect();
  const { addXP } = useXP();
  const requestedUnit = unit ?? '2p1';
  const routeContentId = getQuizContentId(requestedUnit);
  const isSupportedQuizUnit = SUPPORTED_TIERED_QUIZ_UNITS.has(requestedUnit);

  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerResult, setAnswerResult] = useState<'none' | 'correct' | 'wrong'>('none');
  const [xpEarned, setXpEarned] = useState(0);
  const [xpFloatKey, setXpFloatKey] = useState(0);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [lastAwardedXp, setLastAwardedXp] = useState(0);
  const [srsSummary, setSrsSummary] = useState<QuizSrsSummary | null>(null);
  const [tierInfo, setTierInfo] = useState<QuizTierInfo>(getQuizTierInfo(1));
  const [attemptPlan, setAttemptPlan] = useState<QuizAttemptPlan | null>(null);
  const [isPlanningAttempt, setIsPlanningAttempt] = useState(true);
  const [maxXp, setMaxXp] = useState(0);
  const [persistedXpAdded, setPersistedXpAdded] = useState(0);
  const [initialResult, setInitialResult] = useState<InitialAttemptResult | null>(null);
  const [correctedPracticeCount, setCorrectedPracticeCount] = useState(0);
  const isRedrillRef = useRef(false);
  const redrillQueueRef = useRef<QuizQuestion[]>([]);
  const [redrillCount, setRedrillCount] = useState(0);

  // Refs to avoid stale closures when reading final state in timeouts
  const xpRef = useRef(0);
  const correctIdsRef = useRef(new Set<string>());
  const wrongIdsRef = useRef(new Set<string>());
  const correctedPracticeIdsRef = useRef(new Set<string>());
  const awardedQuestionIdsRef = useRef(new Set<string>());

  // Card entrance animation
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(18);
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  useEffect(() => {
    cardOpacity.value = 0; cardY.value = 18;
    cardOpacity.value = withTiming(1, { duration: 280 });
    cardY.value = withTiming(0, { duration: 280 });
  }, [currentIndex]);

  const quizTitle =
    requestedUnit === 'review' ? 'Review Quiz' :
    requestedUnit === '2p2' ? 'Unit 2 Quiz · Part 2' :
    requestedUnit === '2p1' ? 'Unit 2 Quiz · Part 1' :
    requestedUnit === '6'   ? 'Unit 6 Quiz' :
    requestedUnit === '7'   ? 'Unit 7 Quiz' :
    requestedUnit === '8'   ? 'Unit 8 Quiz' :
    requestedUnit === '9'   ? 'Unit 9 Quiz' :
    requestedUnit === '10'  ? 'Unit 10 Quiz' :
    'Unit 2 Quiz';

  const buildAttemptPlan = async (): Promise<QuizAttemptPlan | null> => {
    if (requestedUnit === 'review') {
      const allScenarioNames = Object.keys(content.scenarios);
      const allDialectQuestions = buildDialectUnit2Quiz(allScenarioNames, content, dialect);
      const dueIds = await getDueItemIds();
      const dueQuestions = allDialectQuestions.filter(q => dueIds.has(q.id));
      const selected = shuffleNoAdjacentFormats(dueQuestions).slice(0, 10);
      if (selected.length === 0) return null;
      return {
        questions: selected,
        tierInfo: getQuizTierInfo(1),
        srsSummary: await getQuizSrsSummary(selected.map(q => q.id)),
        maxXp: getQuizMaxXp(selected),
      };
    }

    const completedRaw = await AsyncStorage.getItem('guest_progress');
    const completedMap: Record<string, boolean> = completedRaw ? JSON.parse(completedRaw) : {};
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: prog } = await supabase
          .from('scenario_progress')
          .select('scenario, completed')
          .eq('user_id', session.user.id);
        if (prog) prog.forEach(p => { if (p.completed) completedMap[p.scenario] = true; });
      }
    } catch { /* non-fatal */ }

    const completedContentIds = Object.keys(completedMap)
      .filter(k => completedMap[k])
      .map(k => parseCompletionKey(k)?.contentId ?? k);
    const tier = getQuizTier(completedContentIds);
    const currentTierInfo = getQuizTierInfo(tier);
    if (!['2p1', '2p2', '6', '7', '8', '9', '10'].includes(requestedUnit)) return null;

    const scenarioNames = requestedUnit === '2p2' ? UNIT2_PART2_SCENARIOS : UNIT2_PART1_SCENARIOS;
    const dialectQuestions = buildDialectUnit2Quiz(scenarioNames, content, dialect, currentTierInfo);
    const base =
      requestedUnit === '6' && dialect === 'gulf' ? QUIZ_UNIT6_QUESTIONS :
      requestedUnit === '6' ? [] :
      requestedUnit === '7' && dialect === 'gulf' ? buildWordUnitQuiz('unit7', getWordLessonsForUnit(dialect, 'unit-7'), currentTierInfo) :
      requestedUnit === '7' ? [] :
      requestedUnit === '8' && dialect === 'gulf' ? buildScenarioUnitQuiz('unit8', UNIT8_SCENARIOS, content, dialect, currentTierInfo) :
      requestedUnit === '8' ? [] :
      requestedUnit === '9' && dialect === 'gulf' ? buildWordUnitQuiz('unit9', getWordLessonsForUnit(dialect, 'unit-9'), currentTierInfo) :
      requestedUnit === '9' ? [] :
      requestedUnit === '10' && dialect === 'gulf' ? buildScenarioUnitQuiz('unit10', UNIT10_SCENARIOS, content, dialect, currentTierInfo) :
      requestedUnit === '10' ? [] :
      dialect === 'gulf' && requestedUnit === '2p1' && QUIZ_PART1_QUESTIONS.length > 0 ? QUIZ_PART1_QUESTIONS :
      dialect === 'gulf' && requestedUnit === '2p2' && QUIZ_PART2_QUESTIONS.length > 0 ? QUIZ_PART2_QUESTIONS :
      dialectQuestions;

    if (base.length === 0) return null;
    const prioritized = await prioritizeQuizItems(base, question => question.id);
    const shuffled = shuffleNoAdjacentFormats(prioritized);
    return {
      questions: shuffled,
      tierInfo: currentTierInfo,
      srsSummary: await getQuizSrsSummary(shuffled.map(question => question.id)),
      maxXp: getQuizMaxXp(shuffled),
    };
  };

  useEffect(() => {
    if (phase !== 'intro') return;
    let cancelled = false;
    setIsPlanningAttempt(true);
    buildAttemptPlan()
      .then(plan => {
        if (cancelled) return;
        setAttemptPlan(plan);
        if (plan) {
          setTierInfo(plan.tierInfo);
          setSrsSummary(plan.srsSummary);
          setMaxXp(plan.maxXp);
        }
      })
      .catch(error => {
        console.warn('Quiz plan error:', error);
        if (!cancelled) setAttemptPlan(null);
      })
      .finally(() => {
        if (!cancelled) setIsPlanningAttempt(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestedUnit, dialect, content, phase]);

  // ── Start ────────────────────────────────────────────────────────────────
  const resetAttemptState = () => {
    isRedrillRef.current = false;
    redrillQueueRef.current = [];
    correctedPracticeIdsRef.current.clear();
    correctIdsRef.current.clear();
    wrongIdsRef.current.clear();
    awardedQuestionIdsRef.current.clear();
    xpRef.current = 0;
    setInitialResult(null);
    setCorrectedPracticeCount(0);
    setPersistedXpAdded(0);
    setLastAwardedXp(0);
    setShowXpFloat(false);
    setXpEarned(0);
    setRedrillCount(0);
    setCurrentIndex(0);
    setAnswerResult('none');
  };

  const beginQuizWithPlan = (plan: QuizAttemptPlan) => {
    resetAttemptState();
    setAllQuestions(plan.questions);
    setQuestions(plan.questions);
    setTierInfo(plan.tierInfo);
    setSrsSummary(plan.srsSummary);
    setMaxXp(plan.maxXp);
    setPhase('quiz');
  };

  const startQuiz = async () => {
    const plan = attemptPlan ?? await buildAttemptPlan();
    if (!plan) {
      Alert.alert(
        requestedUnit === 'review' ? 'All caught up! 🎉' : 'Quiz unavailable',
        requestedUnit === 'review'
          ? 'No items are due for review right now. Come back later.'
          : 'This dialect does not have quiz content available yet.'
      );
      if (requestedUnit === 'review') router.back();
      return;
    }
    beginQuizWithPlan(plan);
  };

  // ── Answer handler ───────────────────────────────────────────────────────
  const handleAnswer = (answer: boolean | QuizAnswerResult) => {
    if (answerResult !== 'none') return;

    const normalizedAnswer = typeof answer === 'boolean' ? { correct: answer } : answer;
    const q = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const isRemediation = isRedrillRef.current;
    if (!isRemediation) {
      recordQuizSrsResult(q.id, normalizedAnswer.correct).catch(console.warn);
    }

    if (normalizedAnswer.correct) {
      const questionXp = awardedQuestionIdsRef.current.has(q.id)
        ? 0
        : getQuestionAttemptXp(q, normalizedAnswer, { isRemediation });
      if (questionXp > 0) {
        awardedQuestionIdsRef.current.add(q.id);
        xpRef.current += questionXp;
        setLastAwardedXp(questionXp);
      }
      if (isRemediation) {
        correctedPracticeIdsRef.current.add(q.id);
        setCorrectedPracticeCount(correctedPracticeIdsRef.current.size);
      } else {
        correctIdsRef.current.add(q.id);
      }
      setXpEarned(xpRef.current);
      if (questionXp > 0) {
        setShowXpFloat(true);
        setXpFloatKey(k => k + 1);
      }
      feedbackCorrect();
    } else {
      if (!isRedrillRef.current && !redrillQueueRef.current.some(r => r.id === q.id)) {
        wrongIdsRef.current.add(q.id);
        redrillQueueRef.current.push(q);
      }
      feedbackWrong();
    }

    setAnswerResult(normalizedAnswer.correct ? 'correct' : 'wrong');

    setTimeout(() => {
      setShowXpFloat(false);
      setAnswerResult('none');

      if (isLastQuestion) {
        if (!isRedrillRef.current) {
          const initialCorrectCount = correctIdsRef.current.size;
          const initialPassed = getQuizPassed(initialCorrectCount, allQuestions.length);
          const frozenResult: InitialAttemptResult = {
            correctCount: initialCorrectCount,
            score: Math.round((initialCorrectCount / allQuestions.length) * 100),
            passed: initialPassed,
            attemptXp: xpRef.current,
            missedCount: wrongIdsRef.current.size,
          };
          setInitialResult(frozenResult);
          if (initialPassed) {
            saveQuizCompletion(frozenResult).then(setPersistedXpAdded).catch(console.warn);
          }
          setPhase('results');
        } else {
          setPhase('results');
        }
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, normalizedAnswer.correct ? 500 : 2000);
  };

  // ── Save to DB ───────────────────────────────────────────────────────────
  const saveQuizCompletion = async (result: InitialAttemptResult): Promise<number> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const unitId = requestedUnit === '2p1' || requestedUnit === '2p2' ? 'unit-2' : `unit-${requestedUnit}`;
      if (!routeContentId) return 0;
      const scenarioKey = buildCompletionKey(dialect, unitId, routeContentId);
      const legacyCandidates = getCompletionKeyCandidates(dialect, routeContentId);

      if (!session) {
        const raw = await AsyncStorage.getItem('guest_progress');
        const progress = raw ? JSON.parse(raw) : {};
        const alreadyCompleted = legacyCandidates.some(key => progress[key] === true);
        progress[scenarioKey] = true;
        await AsyncStorage.setItem('guest_progress', JSON.stringify(progress));
        if (!alreadyCompleted && result.attemptXp > 0) {
          await addXP(result.attemptXp);
        }
        await recordActivity();
        return alreadyCompleted ? 0 : result.attemptXp;
      }

      const userId = session.user.id;
      const { data: existing } = await supabase
        .from('scenario_progress')
        .select('id, attempts')
        .eq('user_id', userId)
        .in('scenario', legacyCandidates.length > 0 ? legacyCandidates : [scenarioKey])
        .maybeSingle();

      if (!existing) {
        await supabase.from('scenario_progress').insert({
          user_id: userId,
          scenario: scenarioKey,
          dialect,
          completed: true,
          best_score: result.score,
          attempts: 1,
        });
      } else {
        await supabase.from('scenario_progress').update({
          completed: true,
          best_score: Math.max(result.score, 0),
          attempts: (existing.attempts ?? 0) + 1,
        }).eq('id', existing.id);
      }

      if (!existing && result.attemptXp > 0) await addXP(result.attemptXp);

      await recordActivity();
      return !existing ? result.attemptXp : 0;
    } catch (err) {
      console.warn('Quiz save error:', err);
      return 0;
    }
  };

  // ── Retry missed questions ───────────────────────────────────────────────
  const handlePracticeMistakes = () => {
    const missed = allQuestions.filter(q => wrongIdsRef.current.has(q.id));
    if (missed.length === 0) return;
    const shuffled = shuffleNoAdjacentFormats(missed);
    correctedPracticeIdsRef.current.clear();
    setCorrectedPracticeCount(0);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setAnswerResult('none');
    isRedrillRef.current = true;
    setRedrillCount(shuffled.length);
    setPhase('redrill');
  };

  const handleRetryFullQuiz = async () => {
    setPhase('intro');
    setAttemptPlan(null);
    setIsPlanningAttempt(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (!isSupportedQuizUnit || (requestedUnit !== 'review' && !routeContentId)) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.unavailableWrap}>
          <Text style={styles.unavailableTitle}>Quiz unavailable</Text>
          <Text style={styles.unavailableSub}>This quiz is not available yet.</Text>
          <Pressable style={styles.unavailableBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.unavailableBtnText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'intro') {
    return (
      <PremiumRouteGate contentId={routeContentId} contentType="quiz" contentLabel={quizTitle}>
        <Stack.Screen options={{ headerShown: false }} />
        <QuizIntro
          title={quizTitle}
          tier={tierInfo}
          questionCount={attemptPlan?.questions.length ?? 0}
          maxXp={attemptPlan?.maxXp ?? 0}
          isLoading={isPlanningAttempt}
          onStart={startQuiz}
        />
      </PremiumRouteGate>
    );
  }

  if (phase === 'results') {
    return (
      <PremiumRouteGate contentId={routeContentId} contentType="quiz" contentLabel={quizTitle}>
        <Stack.Screen options={{ headerShown: false }} />
        <QuizResults
          correct={initialResult?.correctCount ?? 0}
          total={allQuestions.length}
          passingScore={getPassingScore(allQuestions.length)}
          passed={initialResult?.passed ?? false}
          xpEarned={initialResult?.attemptXp ?? 0}
          maxXp={maxXp}
          persistedXpAdded={persistedXpAdded}
          hasMissed={(initialResult?.missedCount ?? 0) > 0}
          missedCount={initialResult?.missedCount ?? 0}
          correctedCount={correctedPracticeCount}
          srsSummary={srsSummary}
          onPracticeMistakes={handlePracticeMistakes}
          onRetryFull={handleRetryFullQuiz}
          onHome={() => router.replace('/(tabs)')}
        />
      </PremiumRouteGate>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return (
      <PremiumRouteGate contentId={routeContentId} contentType="quiz" contentLabel={quizTitle}>
        <Stack.Screen options={{ headerShown: false }} />
      </PremiumRouteGate>
    );
  }

  return (
    <PremiumRouteGate contentId={routeContentId} contentType="quiz" contentLabel={quizTitle}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => Alert.alert(
              'Leave Quiz?',
              'Your progress will be lost.',
              [
                { text: 'Keep Going', style: 'cancel' },
                { text: 'Leave', style: 'destructive', onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)') },
              ]
            )}
          >
            <ArrowLeft color={theme.colors.textPrimary} size={18} />
          </Pressable>

          <Text style={styles.headerTitle}>{quizTitle}</Text>

          <View style={styles.xpCounter}>
            <Text style={styles.xpCounterText}>⚡{xpEarned}</Text>
          </View>
        </View>

        {/* Progress */}
        <QuizProgress current={currentIndex + 1} total={questions.length} />

        {/* Redrill banner — shown when fixing mistakes */}
        {phase === 'redrill' && (
          <View style={styles.redrillBanner}>
            <Text style={styles.redrillBannerText}>🔁 Fix Your Mistakes — {redrillCount} to clear</Text>
          </View>
        )}

        {/* Question card */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 40, 56) },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.card, cardStyle]} key={`card-${currentIndex}`}>

            {/* Format badge */}
            <View style={styles.formatBadge}>
              <Text style={styles.formatBadgeText}>{formatBadgeLabel(currentQuestion.format)}</Text>
            </View>

            {/* Question content */}
            {currentQuestion.format === 'scene_replay' && (
              <SceneReplay
                key={`sr-${currentIndex}`}
                question={currentQuestion}
                answerResult={answerResult}
                onAnswer={handleAnswer}
                showTranslit={tierInfo.showTranslit}
              />
            )}
            {currentQuestion.format === 'fill_conversation' && (
              <FillConversation
                key={`fc-${currentIndex}`}
                question={currentQuestion}
                answerResult={answerResult}
                onAnswer={handleAnswer}
                showTranslit={tierInfo.showTranslit}
              />
            )}
            {currentQuestion.format === 'listening' && (
              <ListeningChallenge
                key={`ls-${currentIndex}`}
                question={currentQuestion}
                answerResult={answerResult}
                onAnswer={handleAnswer}
                showTranslit={tierInfo.showTranslit}
              />
            )}
            {currentQuestion.format === 'emoji_match' && (
              <EmojiMatch
                key={`em-${currentIndex}`}
                question={currentQuestion}
                answerResult={answerResult}
                onAnswer={handleAnswer}
              />
            )}
            {currentQuestion.format === 'transliteration_type' && (
              <TransliterationInput
                key={`ti-${currentIndex}`}
                question={currentQuestion}
                answerResult={answerResult}
                onAnswer={handleAnswer}
              />
            )}
            {currentQuestion.format === 'arabic_select' && (
              <ArabicSelect
                key={`as-${currentIndex}`}
                question={currentQuestion}
                answerResult={answerResult}
                onAnswer={handleAnswer}
              />
            )}

          </Animated.View>

          {/* Answer result banner */}
          {answerResult !== 'none' && (
            <View style={[styles.resultBanner, answerResult === 'correct' ? styles.correctBanner : styles.wrongBanner]}>
              <Text style={[styles.resultBannerText, answerResult === 'correct' ? styles.correctText : styles.wrongText]}>
                {answerResult === 'correct' ? '✓ Correct!' : '✗ Not quite — see the answer above'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* XP Float */}
        {showXpFloat && <XPFloat key={xpFloatKey} amount={lastAwardedXp} />}

      </SafeAreaView>
    </PremiumRouteGate>
  );
}

// ── XP Float animation ───────────────────────────────────────────────────────
function XPFloat({ amount }: { amount: number }) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(0, { duration: 700 });
    translateY.value = withTiming(-60, { duration: 700 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.xpFloatWrap, style]} pointerEvents="none">
      <Text style={styles.xpFloatText}>+{amount} XP</Text>
    </Animated.View>
  );
}

function formatBadgeLabel(format: string): string {
  switch (format) {
    case 'scene_replay':         return '🎭 Scene Replay';
    case 'fill_conversation':    return '💬 Fill the Blank';
    case 'listening':            return '🎧 Listening';
    case 'emoji_match':          return '🔗 Emoji Match';
    case 'transliteration_type': return '⌨️ Type It';
    case 'arabic_select':        return '✍️ Read Arabic';
    default:                     return '';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.bgSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderDefault },
  headerTitle: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  xpCounter: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: theme.colors.borderDefault },
  xpCounterText: { color: theme.colors.accentWarm, fontSize: 13, fontWeight: theme.fontWeight.medium },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 12 },

  card: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 20, borderWidth: 1, borderColor: theme.colors.borderDefault, gap: 16 },
  formatBadge: { alignSelf: 'flex-start', backgroundColor: theme.colors.bgElevated, borderRadius: theme.radii.pill, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: theme.colors.borderDefault },
  formatBadgeText: { fontSize: theme.fontSize.caption, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium, letterSpacing: 1.5, textTransform: 'uppercase' },

  resultBanner: { borderRadius: theme.radii.sm, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', gap: 4 },
  correctBanner: { backgroundColor: 'rgba(125, 217, 154, 0.12)', borderWidth: 1, borderColor: theme.colors.accentSuccess },
  wrongBanner: { backgroundColor: 'rgba(229, 107, 111, 0.12)', borderWidth: 1, borderColor: theme.colors.accentDanger },
  resultBannerText: { fontSize: 14, fontWeight: theme.fontWeight.medium },
  correctText: { color: theme.colors.accentSuccess },
  wrongText: { color: theme.colors.accentDanger },

  xpFloatWrap: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 160 },
  xpFloatText: { fontSize: 22, fontWeight: theme.fontWeight.medium, color: theme.colors.accentWarm },

  redrillBanner: { backgroundColor: 'rgba(255, 170, 0, 0.08)', borderBottomWidth: 1, borderColor: 'rgba(255, 170, 0, 0.3)', paddingHorizontal: 20, paddingVertical: 8, alignItems: 'center' },
  redrillBannerText: { fontSize: 13, color: theme.colors.accentWarm, fontWeight: theme.fontWeight.medium },

  unavailableWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xxl },
  unavailableTitle: { fontSize: 24, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  unavailableSub: { fontSize: theme.fontSize.body, color: theme.colors.textSecondary, marginBottom: 24, textAlign: 'center' },
  unavailableBtn: { width: '100%', height: 54, backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.lg, alignItems: 'center', justifyContent: 'center' },
  unavailableBtnText: { color: theme.colors.bgBase, fontSize: 16, fontWeight: theme.fontWeight.medium },
});
