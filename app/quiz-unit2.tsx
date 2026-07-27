import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { type ReactNode, useEffect, useRef, useState } from 'react';
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
import type { QuizQuestion } from '../data/quiz-types';
import { getQuizContentId } from '../utils/access';
import { recordActivity } from '../utils/streak';
import { supabase } from '../utils/supabase';

import ArabicSelect from '../components/quiz/ArabicSelect';
import EmojiMatch from '../components/quiz/EmojiMatch';
import FillConversation from '../components/quiz/FillConversation';
import ListeningChallenge from '../components/quiz/ListeningChallenge';
import QuizIntro from '../components/quiz/QuizIntro';
import QuizProgress from '../components/quiz/QuizProgress';
import QuizResults from '../components/quiz/QuizResults';
import SceneReplay from '../components/quiz/SceneReplay';
import TransliterationInput from '../components/quiz/TransliterationInput';
import { theme } from '../constants/theme';
import type { Word } from '../constants/words';
import type { ArabicSelectQuestion, TransliterationTypeQuestion } from '../data/quiz-types';
import { MSA_UNIT3_QUIZ_WORDS } from '../data/msa-alphabet-audio';
import { getDialectCurriculumItems } from '../utils/content-resolver';
import { buildCompletionKey, parseCompletionKey } from '../utils/progression';
import { buildPhase1ReviewQuestions, getPhase1ReviewAttemptScope, isDedicatedReviewRoute } from '../utils/phase1-review';
import { createScopedAttemptSeedCache, finishQuizAttempt, startFreshQuizAttempt, type ScopedAttemptSeed } from '../utils/quiz-attempt';
import { persistQuizPass } from '../utils/quiz-completion';
import { selectWithAttemptSeed, stableQuizHash } from '../utils/quiz-selection';
import { ARABIC_SELECT_XP, getQuizTier, getQuizTierInfo, TYPING_QUESTION_XP, type QuizTierInfo } from '../utils/quiz-level';
import {
  getPassingScore,
  getQuestionAttemptXp,
  getQuizMaxXp,
  getQuizPassed,
  type QuizAnswerResult,
} from '../utils/quiz-scoring';

type Phase = 'intro' | 'quiz' | 'redrill' | 'results';

const UNIT2_PART1_SCENARIOS = ['Cafe', 'Taxi', 'Hotel'];
const UNIT2_PART2_SCENARIOS = ['Restaurant', 'Supermarket', 'Pharmacy', 'Barbershop'];
const EGYPTIAN_UNIT6_SCENARIOS = [
  'EgyptianCafeOrder',
  'EgyptianRestaurantOrder',
  'EgyptianEverydaySupermarket',
  'EgyptianEverydayTaxi',
  'EgyptianDirections',
  'EgyptianEverydayPharmacy',
  'EgyptianPhoneRepair',
  'EgyptianEverydayHotel',
  'EgyptianEverydayAirport',
  'EgyptianPhoneCall',
];
const EGYPTIAN_UNIT8_SCENARIOS = [
  'EgyptianDoctorAppointment',
  'EgyptianHospitalReception',
  'EgyptianDescribingPain',
  'EgyptianPharmacyEmergency',
  'EgyptianCallingAmbulance',
  'EgyptianPoliceHelp',
  'EgyptianLostPhone',
  'EgyptianLostChild',
  'EgyptianCarProblem',
  'EgyptianUrgentHelp',
];
const EGYPTIAN_UNIT10_SCENARIOS = [
  'EgyptianNeighborVisit',
  'EgyptianBrunch',
  'EgyptianRoadTrip',
  'EgyptianBirthdayInvitation',
  'EgyptianBirthdayParty',
  'EgyptianGivingGift',
  'EgyptianTakingPhotos',
  'EgyptianRememberingTrip',
  'EgyptianSayingGoodbye',
  'EgyptianStayingInTouch',
];
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
const SUPPORTED_TIERED_QUIZ_UNITS = new Set(['review', '1', '2', '3', '2p1', '2p2', '4', '5', '6', '7', '8', '9', '10']);
let currentAttemptSelectionSeed = 'initial';

type WordLessonEntry = {
  id: string;
  words: Word[];
};

type QuizAttemptPlan = {
  attempt: ScopedAttemptSeed;
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

function QuizAccessGate({
  isReview,
  contentId,
  contentLabel,
  children,
}: {
  isReview: boolean;
  contentId: string | null;
  contentLabel: string;
  children: ReactNode;
}) {
  if (isReview) return <>{children}</>;
  return (
    <PremiumRouteGate contentId={contentId} contentType="quiz" contentLabel={contentLabel}>
      {children}
    </PremiumRouteGate>
  );
}

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
  const distractors = seededSelection(uniqueWords(words, correct), 3, wordKey(correct), wordKey);
  return shuffle([
    { arabic: wordArabic(correct), transliteration: correct.transliteration, isCorrect: true },
    ...shuffle(distractors).map(word => ({
      arabic: wordArabic(word),
      transliteration: word.transliteration,
      isCorrect: false,
    })),
  ]);
}

function lessonWordsFor(word: Word, lessons: WordLessonEntry[]) {
  const key = wordKey(word);
  return lessons.find(lesson => lesson.words.some(candidate => wordKey(candidate) === key))?.words ?? [];
}

function balancedWords(lessons: WordLessonEntry[], count: number, seed: string) {
  const orderedLessons = seededSelection(lessons, lessons.length, `${seed}:lessons`, lesson => lesson.id);
  const pools = orderedLessons.map(lesson => seededSelection(
    uniqueWords(lesson.words),
    lesson.words.length,
    `${seed}:${lesson.id}`,
    wordKey,
  ));
  const selected: Word[] = [];
  for (let round = 0; selected.length < count && pools.some(pool => round < pool.length); round += 1) {
    pools.forEach(pool => {
      const word = pool[round];
      if (word && selected.length < count && !selected.some(item => wordKey(item) === wordKey(word))) selected.push(word);
    });
  }
  return selected;
}

function matchingWords(lessons: WordLessonEntry[], count: number, seed: string) {
  const candidates = balancedWords(lessons, lessons.flatMap(lesson => lesson.words).length, seed);
  const seenArabic = new Set<string>();
  const seenMeanings = new Set<string>();
  const selected: Word[] = [];
  candidates.forEach(word => {
    const arabic = wordArabic(word).trim();
    const meaning = word.english.trim().toLowerCase();
    if (!arabic || !meaning || seenArabic.has(arabic) || seenMeanings.has(meaning) || selected.length >= count) return;
    seenArabic.add(arabic);
    seenMeanings.add(meaning);
    selected.push(word);
  });
  return selected;
}

function distinctMeaningPairs(words: Word[]) {
  const seenArabic = new Set<string>();
  const seenMeanings = new Set<string>();
  const pairs = words.flatMap(word => {
    const arabic = wordArabic(word).trim();
    const meaning = word.english.trim();
    const normalizedMeaning = meaning.toLowerCase();
    if (!arabic || !meaning || seenArabic.has(arabic) || seenMeanings.has(normalizedMeaning)) return [];
    seenArabic.add(arabic);
    seenMeanings.add(normalizedMeaning);
    return [{ arabic, transliteration: word.transliteration, meaning }];
  });
  return pairs.length === words.length ? pairs : [];
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
  const questions: QuizQuestion[] = [];

  const listeningLimit = 10;
  balancedWords(lessons, listeningLimit, `${unitKey}:listening`).forEach((word, index) => {
    const options = makeWordOptions(word, lessonWordsFor(word, lessons));
    if (options.length !== 4) return;
    questions.push({
      id: `${unitKey}_listen_${stableQuizHash(wordKey(word)).toString(36)}`,
      format: 'listening',
      scenarioSource: unitKey,
      xpValue: 10,
      audioFile: word.audio ?? null,
      audioText: wordAudioText(word),
      options,
    });
  });

  const emojiChunks = ['one', 'two']
    .map(seed => matchingWords(lessons, 4, `${unitKey}:match:${seed}`))
    .filter(chunk => chunk.length === 4);

  emojiChunks.forEach((chunk, chunkIndex) => {
    const pairs = distinctMeaningPairs(chunk);
    if (pairs.length !== 4) return;
    questions.push({
      id: `${unitKey}_match_${stableQuizHash(pairs.map(pair => pair.arabic).sort().join('|')).toString(36)}`,
      format: 'emoji_match',
      scenarioSource: unitKey,
      xpValue: 10,
      pairs,
    });
  });

  if (tier.hasTyping) {
    balancedWords(lessons, 3, `${unitKey}:typing`).forEach((word, index) => {
      const firstWord = word.transliteration.trim().split(/[\s-]/)[0] ?? '';
      questions.push({
        id: `${unitKey}_translit_${stableQuizHash(wordKey(word)).toString(36)}`,
        format: 'transliteration_type',
        scenarioSource: unitKey,
        xpValue: TYPING_QUESTION_XP,
        arabic: wordArabic(word),
        audioFile: word.audio ?? null,
        audioText: wordAudioText(word),
        english: word.english,
        correctAnswer: word.transliteration,
        acceptedAnswers: acceptedAnswersForWord(word),
        hintFirstWord: firstWord,
      } satisfies TransliterationTypeQuestion);
    });
  }

  if (tier.hasArabicSelect) {
    balancedWords(lessons, 3, `${unitKey}:arabic-select`).forEach((word, index) => {
      const distractors = seededSelection(
        uniqueWords(lessonWordsFor(word, lessons), word),
        3,
        wordKey(word),
        wordKey,
      );
      if (distractors.length !== 3) return;
      questions.push({
        id: `${unitKey}_arabic_select_${stableQuizHash(wordKey(word)).toString(36)}`,
        format: 'arabic_select',
        scenarioSource: unitKey,
        xpValue: ARABIC_SELECT_XP,
        english: word.english,
        options: shuffle([
          { arabic: wordArabic(word), isCorrect: true },
          ...distractors.map(distractor => ({
            arabic: wordArabic(distractor),
            isCorrect: false,
          })),
        ]),
      } satisfies ArabicSelectQuestion);
    });
  }

  const supportedQuestions = questions.filter(question => tier.formats.includes(question.format));
  return capQuestionsForTier(shuffleNoAdjacentFormats(supportedQuestions), tier);
}

type PhraseOption = { arabic: string; transliteration: string; isCorrect: boolean };

function phraseOption(arabic: string, transliteration: string, isCorrect = false): PhraseOption {
  return { arabic, transliteration, isCorrect };
}

function wordOption(word: Word, isCorrect = false): PhraseOption {
  return phraseOption(wordArabic(word), word.transliteration, isCorrect);
}

function makePhraseOptions(correct: PhraseOption, distractors: PhraseOption[]) {
  const seen = new Set([correct.arabic]);
  const uniqueDistractors = seededSelection(distractors.filter(option => {
    if (seen.has(option.arabic)) return false;
    seen.add(option.arabic);
    return true;
  }), 3, correct.arabic, option => option.arabic);

  return shuffle([
    { ...correct, isCorrect: true },
    ...uniqueDistractors.map(option => ({ ...option, isCorrect: false })),
  ]);
}

function findWord(words: Word[], arabic: string, transliteration?: string) {
  return words.find(word =>
    wordArabic(word) === arabic && (!transliteration || word.transliteration === transliteration)
  ) ?? words.find(word => wordArabic(word) === arabic);
}

function acceptedAnswersForWord(word: Word) {
  const answers = new Set(word.acceptedTransliterations ?? []);
  answers.delete(word.transliteration);
  return [...answers];
}

function makeWordSceneQuestion(
  id: string,
  scenarioSource: string,
  prompt: string,
  correct: Word,
  distractors: Word[],
  sceneImage: any,
): QuizQuestion {
  return {
    id,
    format: 'scene_replay',
    scenarioSource,
    xpValue: 10,
    sceneImage,
    audioFile: correct.audio ?? null,
    audioText: wordAudioText(correct),
    prompt,
    options: makePhraseOptions(wordOption(correct), distractors.map(word => wordOption(word))),
  };
}

function makeWordListeningQuestion(
  id: string,
  scenarioSource: string,
  correct: Word,
  distractors: Word[],
): QuizQuestion {
  return {
    id,
    format: 'listening',
    scenarioSource,
    xpValue: 10,
    audioFile: correct.audio ?? null,
    audioText: wordAudioText(correct),
    options: makePhraseOptions(wordOption(correct), distractors.map(word => wordOption(word))),
  };
}

function makeFillQuestion(
  id: string,
  scenarioSource: string,
  prompt: string,
  correct: PhraseOption,
  distractors: PhraseOption[],
): QuizQuestion {
  return {
    id,
    format: 'fill_conversation',
    scenarioSource,
    xpValue: 10,
    dialogue: [
      { speaker: 'npc', arabic: prompt, transliteration: '', isBlank: false },
      { speaker: 'yusuf', arabic: correct.arabic, transliteration: correct.transliteration, isBlank: true },
    ],
    options: makePhraseOptions(correct, distractors),
  };
}

function makeEmojiQuestion(
  id: string,
  scenarioSource: string,
  pairs: { arabic: string; transliteration: string; meaning: string }[],
): QuizQuestion {
  return {
    id,
    format: 'emoji_match',
    scenarioSource,
    xpValue: 10,
    pairs: pairs.map(pair => ({
      arabic: pair.arabic,
      transliteration: pair.transliteration,
      meaning: pair.meaning,
    })),
  };
}

function makeTransliterationQuestion(id: string, scenarioSource: string, word: Word): QuizQuestion {
  return {
    id,
    format: 'transliteration_type',
    scenarioSource,
    xpValue: TYPING_QUESTION_XP,
    arabic: wordArabic(word),
    audioFile: word.audio ?? null,
    audioText: wordAudioText(word),
    english: word.english,
    correctAnswer: word.transliteration,
    acceptedAnswers: acceptedAnswersForWord(word),
    hintFirstWord: word.transliteration.trim().split(/[\s-]/)[0] ?? '',
  } satisfies TransliterationTypeQuestion;
}

function makeArabicSelectQuestion(
  id: string,
  scenarioSource: string,
  correct: Word,
  distractors: Word[],
): QuizQuestion {
  return {
    id,
    format: 'arabic_select',
    scenarioSource,
    xpValue: ARABIC_SELECT_XP,
    english: correct.english,
    options: makePhraseOptions(wordOption(correct), distractors.map(word => wordOption(word)))
      .map(option => ({ arabic: option.arabic, isCorrect: option.isCorrect })),
  } satisfies ArabicSelectQuestion;
}

function getGenericQuizSceneImage(content: DialectContent) {
  return content.sceneImages['cairo-cafe-interior']
    ?? content.sceneImages.Cafe
    ?? content.sceneImages['cairo-restaurant-interior']
    ?? content.sceneImages.Restaurant
    ?? content.sceneImages['cairo-supermarket-interior']
    ?? content.sceneImages.Supermarket
    ?? content.sceneImages['cairo-taxi-interior']
    ?? content.sceneImages.Taxi
    ?? Object.values(content.sceneImages).find(Boolean)
    ?? null;
}

function getScenarioSceneImage(content: DialectContent, dialect: string, scenarioName: string) {
  const item = getDialectCurriculumItems(dialect)
    .find(candidate => candidate.contentType === 'scenario' && candidate.scenarioName === scenarioName);
  return (item?.sceneImageId ? content.sceneImages[item.sceneImageId] : undefined)
    ?? content.sceneImages[scenarioName]
    ?? null;
}

function buildEgyptianUnit7Quiz(lessons: WordLessonEntry[], content: DialectContent, tier: QuizTierInfo): QuizQuestion[] {
  const allWords = uniqueWords(lessons.flatMap(lessonItem => lessonItem.words));
  const sceneImage = getGenericQuizSceneImage(content);
  const byLesson = new Map<string, QuizQuestion[]>();
  const addLessonQuestion = (lessonId: string, question: QuizQuestion) => {
    const questions = byLesson.get(lessonId) ?? [];
    questions.push(question);
    byLesson.set(lessonId, questions);
  };

  lessons.forEach(lessonItem => {
    const lessonWords = uniqueWords(lessonItem.words);
    if (lessonWords.length === 0) return;
    const primary = lessonItem.id === 'job-titles'
      ? findWord(lessonWords, 'زميلي') ?? lessonWords[0]
      : lessonWords[0];
    const secondary = lessonItem.id === 'job-titles'
      ? findWord(lessonWords, 'زميلتي') ?? lessonWords[1] ?? primary
      : lessonWords[1] ?? primary;
    const typing = lessonWords[2] ?? primary;
    const arabicSelect = lessonWords[3] ?? secondary;
    const distractorsFor = (word: Word) => seededSelection(
      uniqueWords(lessonWords, word),
      3,
      `${lessonItem.id}:${wordKey(word)}`,
      wordKey,
    );
    const source = `egyptian-unit-7:${lessonItem.id}`;

    addLessonQuestion(lessonItem.id, makeWordSceneQuestion(
      `eg_u7_${lessonItem.id}_scene`, source,
      `Choose the Egyptian workplace phrase for: ${primary.english}`,
      primary, distractorsFor(primary), sceneImage,
    ));
    addLessonQuestion(lessonItem.id, makeWordListeningQuestion(
      `eg_u7_${lessonItem.id}_listen`, source,
      secondary, distractorsFor(secondary),
    ));
    addLessonQuestion(lessonItem.id, makeTransliterationQuestion(
      `eg_u7_${lessonItem.id}_translit`, source, typing,
    ));
    addLessonQuestion(lessonItem.id, makeArabicSelectQuestion(
      `eg_u7_${lessonItem.id}_arabic_select`, source,
      arabicSelect, distractorsFor(arabicSelect),
    ));
  });

  const workFillSpecs = [
    { lessonId: 'requests-at-work', prompt: 'الكمبيوتر مش شغال. هتطلب مساعدة إزاي؟', answer: 'ممكن تساعدني؟', distractors: ['ممكن تستنى دقيقة؟', 'كلمني لما تخلص', 'خلينا نتكلم بعدين'] },
    { lessonId: 'requests-at-work', prompt: 'زميلك قال إن الملف عنده. هتطلبه إزاي؟', answer: 'ابعتلي الملف لو سمحت', distractors: ['اكتب اسمك هنا', 'كلمني لما تخلص', 'ممكن تستنى دقيقة؟'] },
    { lessonId: 'requests-at-work', prompt: 'زميلك مشغول دلوقتي. هترد بإيه؟', answer: 'خلينا نتكلم بعدين', distractors: ['ابعتلي الملف لو سمحت', 'اكتب اسمك هنا', 'ممكن تساعدني؟'] },
    { lessonId: 'schedules', prompt: 'الاجتماع الساعة عشرة. هتأكد المعاد إزاي؟', answer: 'المعاد مناسب', distractors: ['المعاد اتغير', 'أنا متأخر شوية', 'هخلص إمتى؟'] },
    { lessonId: 'schedules', prompt: 'الاجتماع بدأ وإنت لسه واصل. هتقول إيه؟', answer: 'أنا متأخر شوية', distractors: ['المعاد مناسب', 'الساعة كام؟', 'المعاد اتغير'] },
    { lessonId: 'problems-at-work', prompt: 'المشكلة لسه موجودة. محتاج تعمل إيه؟', answer: 'محتاج أكلم الدعم', distractors: ['النت فاصل', 'الملف مش موجود', 'نسيت الباسورد'] },
  ] as const;
  workFillSpecs.forEach((spec, index) => {
    const word = findWord(allWords, spec.answer);
    if (!word) return;
    const distractors = spec.distractors
      .map(arabic => findWord(allWords, arabic))
      .filter((item): item is Word => Boolean(item));
    addLessonQuestion(spec.lessonId, makeFillQuestion(
      `eg_u7_fill_${index + 1}`,
      `egyptian-unit-7:${spec.lessonId}`,
      spec.prompt,
      wordOption(word),
      distractors.map(item => wordOption(item)),
    ));
  });

  const matchWords = ['زميلي', 'زميلتي', 'المكتب', 'الكمبيوتر']
    .map(arabic => findWord(allWords, arabic))
    .filter((item): item is Word => Boolean(item));
  let matchQuestion: QuizQuestion | null = null;
  if (matchWords.length === 4) {
    matchQuestion = makeEmojiQuestion(
      'eg_u7_workplace_match',
      'egyptian-unit-7',
      matchWords.map(word => ({
        arabic: wordArabic(word),
        transliteration: word.transliteration,
        meaning: word.english,
      })),
    );
  }

  const lessonIds = lessons.map(lessonItem => lessonItem.id);
  const selected: QuizQuestion[] = [];
  const used = new Set<string>();
  const add = (lessonId: string, formats: QuizQuestion['format'][]) => {
    const question = (byLesson.get(lessonId) ?? []).find(candidate =>
      formats.includes(candidate.format) && tier.formats.includes(candidate.format) && !used.has(candidate.id)
    );
    if (!question) return;
    selected.push(question);
    used.add(question.id);
  };
  const addMatch = () => {
    if (matchQuestion && tier.formats.includes(matchQuestion.format) && !used.has(matchQuestion.id)) {
      selected.push(matchQuestion);
      used.add(matchQuestion.id);
    }
  };

  const baseFormats: QuizQuestion['format'][][] = tier.tier === 1
    ? lessonIds.map((_, index) => [index % 2 === 0 ? 'scene_replay' : 'listening'])
    : tier.tier === 2
      ? lessonIds.map((id, index) =>
          ['schedules', 'requests-at-work', 'problems-at-work'].includes(id)
            ? ['fill_conversation', index % 2 === 0 ? 'scene_replay' : 'listening']
            : [index % 2 === 0 ? 'scene_replay' : 'listening'])
      : tier.tier === 3
        ? lessonIds.map((id, index) =>
            ['schedules', 'requests-at-work', 'problems-at-work'].includes(id)
              ? ['fill_conversation', 'listening']
              : [index % 2 === 0 ? 'scene_replay' : 'listening'])
        : lessonIds.map((id, index) =>
            index === 1 || index === 6
              ? ['arabic_select', 'listening']
              : ['schedules', 'requests-at-work', 'problems-at-work'].includes(id)
                ? ['fill_conversation', 'listening']
                : [index % 2 === 0 ? 'scene_replay' : 'listening']);

  lessonIds.forEach((lessonId, index) => add(lessonId, baseFormats[index]));
  if (tier.tier >= 2) addMatch();
  if (tier.tier === 2) {
    add('requests-at-work', ['fill_conversation']);
  } else if (tier.tier === 3) {
    ['work-introduction', 'job-titles', 'daily-routine', 'meetings'].forEach(id => add(id, ['transliteration_type']));
  } else if (tier.tier >= 4) {
    ['work-introduction', 'office-objects', 'daily-routine', 'workplace-conversation'].forEach(id => add(id, ['transliteration_type']));
    ['workplace-places', 'requests-at-work', 'problems-at-work'].forEach(id => add(id, ['arabic_select']));
  }

  return shuffleNoAdjacentFormats(selected);
}

function buildEgyptianUnit4Quiz(lessons: WordLessonEntry[], content: DialectContent, tier: QuizTierInfo): QuizQuestion[] {
  const words = uniqueWords(lessons.flatMap(lesson => lesson.words));
  const sceneImage = getGenericQuizSceneImage(content);
  const w = (arabic: string, transliteration?: string) => findWord(words, arabic, transliteration);
  const questions: QuizQuestion[] = [];

  const one = w('واحد');
  const two = w('اتنين');
  const three = w('تلاتة');
  const four = w('أربعة');
  const five = w('خمسة');
  const eight = w('تمانية');
  const thirteen = w('تلتاشر');
  const fourteen = w('أربعتاشر');
  const seventeen = w('سبعتاشر');
  const nineteen = w('تسعتاشر');
  const twenty = w('عشرين');
  const thirty = w('تلاتين');
  const forty = w('أربعين');
  const hundred = w('مية');
  const thousand = w('ألف');
  const phone = w('صفر واحد صفر');
  const bill = w('الحساب كام؟');
  const pound = w('جنيه');
  const time = w('الساعة كام؟');
  const oneOClock = w('الساعة واحدة');
  const half = w('ونص');
  const ageQuestion = w('عندك كام سنة؟');
  const ageAnswer = w('عندي عشرين سنة');
  const twentyOne = w('واحد وعشرين');
  const fortyFive = w('خمسة وأربعين');

  if (sceneImage && one && two && three && four) {
    questions.push(makeWordSceneQuestion('eg_u4_recognition_one', 'egyptian-unit-4', 'Choose the Egyptian number for: One', one, [two, three, four], sceneImage));
  }
  if (sceneImage && thirteen && fourteen && seventeen && nineteen) {
    questions.push(makeWordSceneQuestion('eg_u4_recognition_thirteen', 'egyptian-unit-4', 'Choose: Thirteen', thirteen, [fourteen, seventeen, nineteen], sceneImage));
  }
  if (sceneImage && hundred && thousand && thirty && forty) {
    questions.push(makeWordSceneQuestion('eg_u4_recognition_hundred', 'egyptian-unit-4', 'Choose: One hundred', hundred, [thousand, thirty, forty], sceneImage));
  }
  if (five && eight && two && three) {
    questions.push(makeWordListeningQuestion('eg_u4_listen_five', 'egyptian-unit-4', five, [eight, two, three]));
  }
  if (twenty && thirty && forty && hundred) {
    questions.push(makeWordListeningQuestion('eg_u4_listen_twenty', 'egyptian-unit-4', twenty, [thirty, forty, hundred]));
  }
  if (time && oneOClock && bill && ageQuestion) {
    questions.push(makeWordListeningQuestion('eg_u4_listen_time_question', 'egyptian-unit-4', time, [oneOClock, bill, ageQuestion]));
  }
  if (phone) {
    questions.push(makeFillQuestion(
      'eg_u4_phone_prefix',
      'egyptian-unit-4',
      "Which phrase says: 'My number starts with 010'?",
      wordOption(phone),
      [phraseOption('صفر اتنين صفر', 'sifr itnein sifr'), phraseOption('صفر واحد اتنين', 'sifr waahid itnein'), phraseOption('واحد صفر صفر', 'waahid sifr sifr')],
    ));
  }
  if (bill && pound && time && ageQuestion) {
    questions.push(makeFillQuestion(
      'eg_u4_price_question',
      'egyptian-unit-4',
      'في الكاشير، أسأل:',
      wordOption(bill),
      [wordOption(pound), wordOption(time), wordOption(ageQuestion)],
    ));
  }
  if (ageAnswer && twentyOne && fortyFive && oneOClock) {
    questions.push(makeFillQuestion(
      'eg_u4_age_answer',
      'egyptian-unit-4',
      "How do you say: 'I am twenty years old'?",
      wordOption(ageAnswer),
      [phraseOption('عندي واحد وعشرين سنة', 'andi waahid w ishreen sana'), phraseOption('عندي خمسة وأربعين سنة', 'andi khamsa w arbaeen sana'), phraseOption('عندي تلاتين سنة', 'andi talateen sana')],
    ));
  }
  if (oneOClock && time && half && ageQuestion) {
    questions.push(makeFillQuestion(
      'eg_u4_time_answer',
      'egyptian-unit-4',
      "How do you say: 'It is one o'clock'?",
      wordOption(oneOClock),
      [phraseOption('الساعة اتنين', "is-saa'a itnein"), phraseOption('الساعة واحدة ونص', "is-saa'a waahda w noss"), phraseOption('الساعة تلاتة', "is-saa'a talaata")],
    ));
  }

  if (tier.tier >= 2 && thirteen && twenty && hundred && thousand) {
    questions.push(makeEmojiQuestion('eg_u4_match_values', 'egyptian-unit-4', [
      { arabic: wordArabic(thirteen), transliteration: thirteen.transliteration, meaning: '13' },
      { arabic: wordArabic(twenty), transliteration: twenty.transliteration, meaning: '20' },
      { arabic: wordArabic(hundred), transliteration: hundred.transliteration, meaning: '100' },
      { arabic: wordArabic(thousand), transliteration: thousand.transliteration, meaning: '1000' },
    ]));
  }
  if (tier.tier >= 2 && phone && bill && time && ageAnswer) {
    questions.push(makeEmojiQuestion('eg_u4_match_contexts', 'egyptian-unit-4', [
      { arabic: wordArabic(phone), transliteration: phone.transliteration, meaning: 'phone' },
      { arabic: wordArabic(bill), transliteration: bill.transliteration, meaning: 'price' },
      { arabic: wordArabic(time), transliteration: time.transliteration, meaning: 'time' },
      { arabic: wordArabic(ageAnswer), transliteration: ageAnswer.transliteration, meaning: 'age' },
    ]));
  }

  if (tier.hasTyping) {
    [thirteen, bill, fortyFive].filter((word): word is Word => Boolean(word)).forEach((word, index) => {
      questions.push(makeTransliterationQuestion(`eg_u4_translit_${index + 1}`, 'egyptian-unit-4', word));
    });
  }

  if (tier.hasArabicSelect) {
    const selectSets = [
      [seventeen, thirteen, fourteen, nineteen],
      [fortyFive, twentyOne, hundred, thousand],
      [half, time, oneOClock, ageQuestion],
    ] as const;
    selectSets.forEach((set, index) => {
      const [correct, ...distractors] = set.filter((word): word is Word => Boolean(word));
      if (correct && distractors.length >= 3) {
        questions.push(makeArabicSelectQuestion(`eg_u4_arabic_select_${index + 1}`, 'egyptian-unit-4', correct, distractors));
      }
    });
  }

  const supportedCustom = questions.filter(question => tier.formats.includes(question.format));
  const genericFill = buildWordUnitQuiz('egyptian-unit4', lessons, tier);
  return capQuestionsForTier(
    shuffleNoAdjacentFormats([...supportedCustom, ...genericFill.filter(question => !supportedCustom.some(item => item.id === question.id))]),
    tier,
  );
}

function buildEgyptianUnit5Quiz(lessons: WordLessonEntry[], content: DialectContent, tier: QuizTierInfo): QuizQuestion[] {
  const words = uniqueWords(lessons.flatMap(lesson => lesson.words));
  const sceneImage = getGenericQuizSceneImage(content);
  const w = (arabic: string, transliteration?: string) => findWord(words, arabic, transliteration);
  const questions: QuizQuestion[] = [];

  const ana = w('أنا');
  const inta = w('إنت');
  const inti = w('إنتي');
  const humma = w('هما');
  const da = w('ده');
  const di = w('دي');
  const dool = w('دول');
  const kitaabi = w('كتابي');
  const kitaabak = w('كتابك', 'kitaabak');
  const eih = w('إيه؟');
  const fein = w('فين؟');
  const mish = w('مش');
  const maArafsh = w('ما أعرفش');
  const maYinfa = w('ما ينفعش');
  const baruuh = w('أنا بروح');
  const bitruuh = w('إنت بتروح');
  const ruht = w('أنا رحت');
  const raah = w('هو راح');
  const haruuh = w('هروح');
  const hanruuh = w('هنروح');
  const kwayyis = w('كويس');
  const kwayyisa = w('كويسة');
  const fi = w('في');
  const ala = w('على');
  const ganb = w('جنب');
  const sentence = w('العربية دي كبيرة شوية');

  if (sceneImage && ana && inta && inti && humma) {
    questions.push(makeWordSceneQuestion('eg_u5_pronoun_ana', 'egyptian-unit-5', 'Choose the Egyptian pronoun for: I / me', ana, [inta, inti, humma], sceneImage));
  }
  if (sceneImage && da && di && dool && eih) {
    questions.push(makeWordSceneQuestion('eg_u5_demonstrative_di', 'egyptian-unit-5', 'Choose the feminine form: This / that', di, [da, dool, eih], sceneImage));
  }
  if (kitaabi && kitaabak && eih && fein) {
    questions.push(makeWordListeningQuestion('eg_u5_listen_kitaabi', 'egyptian-unit-5', kitaabi, [kitaabak, eih, fein]));
  }
  if (haruuh && hanruuh && ruht && baruuh) {
    questions.push(makeWordListeningQuestion('eg_u5_listen_future', 'egyptian-unit-5', haruuh, [hanruuh, ruht, baruuh]));
  }
  if (ana && inta && inti && humma) {
    questions.push(makeFillQuestion(
      'eg_u5_choose_pronoun',
      'egyptian-unit-5',
      "Complete the Egyptian sentence for: 'I am from Egypt.'",
      wordOption(ana),
      [wordOption(inta), wordOption(inti), wordOption(humma)],
    ));
  }
  if (da && di && dool) {
    questions.push(makeFillQuestion(
      'eg_u5_choose_demonstrative',
      'egyptian-unit-5',
      '... عربية',
      wordOption(di),
      [wordOption(da), wordOption(dool), phraseOption('هو', 'huwwa')],
    ));
  }
  if (mish && maArafsh && maYinfa && eih) {
    questions.push(makeFillQuestion(
      'eg_u5_complete_negation',
      'egyptian-unit-5',
      'أنا ... فاهم',
      wordOption(mish),
      [wordOption(maArafsh), wordOption(maYinfa), wordOption(eih)],
    ));
  }
  if (baruuh && bitruuh && ruht && haruuh) {
    questions.push(makeFillQuestion(
      'eg_u5_present_marker',
      'egyptian-unit-5',
      'إنت ... فين؟',
      wordOption(bitruuh),
      [wordOption(baruuh), wordOption(ruht), wordOption(haruuh)],
    ));
  }
  if (raah && ruht && baruuh && haruuh) {
    questions.push(makeFillQuestion(
      'eg_u5_past_tense',
      'egyptian-unit-5',
      'هو ... الشغل',
      wordOption(raah),
      [wordOption(ruht), wordOption(baruuh), wordOption(haruuh)],
    ));
  }
  if (sentence && kwayyis && kwayyisa && da) {
    questions.push(makeFillQuestion(
      'eg_u5_sentence_order',
      'egyptian-unit-5',
      'اختار الجملة الصحيحة نحويًا:',
      wordOption(sentence),
      [
        phraseOption('العربية ده كبيرة شوية', 'il-arabeyya da kibiira shwayya'),
        phraseOption('العربية دي كبير شوية', 'il-arabeyya di kibiir shwayya'),
        phraseOption('العربية دول كبيرة شوية', 'il-arabeyya dool kibiira shwayya'),
      ],
    ));
  }

  if (tier.tier >= 2 && da && di && dool && humma) {
    questions.push(makeEmojiQuestion('eg_u5_match_demonstratives', 'egyptian-unit-5', [
      { arabic: wordArabic(da), transliteration: da.transliteration, meaning: 'this (m.)' },
      { arabic: wordArabic(di), transliteration: di.transliteration, meaning: 'this (f.)' },
      { arabic: wordArabic(dool), transliteration: dool.transliteration, meaning: 'these' },
      { arabic: wordArabic(humma), transliteration: humma.transliteration, meaning: 'they' },
    ]));
  }
  if (tier.tier >= 2 && fi && ala && ganb && fein) {
    questions.push(makeEmojiQuestion('eg_u5_match_prepositions', 'egyptian-unit-5', [
      { arabic: wordArabic(fi), transliteration: fi.transliteration, meaning: 'in / at' },
      { arabic: wordArabic(ala), transliteration: ala.transliteration, meaning: 'on' },
      { arabic: wordArabic(ganb), transliteration: ganb.transliteration, meaning: 'next to' },
      { arabic: wordArabic(fein), transliteration: fein.transliteration, meaning: 'where?' },
    ]));
  }

  if (tier.hasTyping) {
    [maArafsh, bitruuh, sentence].filter((word): word is Word => Boolean(word)).forEach((word, index) => {
      questions.push(makeTransliterationQuestion(`eg_u5_translit_${index + 1}`, 'egyptian-unit-5', word));
    });
  }

  if (tier.hasArabicSelect) {
    const selectSets = [
      [mish, maArafsh, maYinfa, eih],
      [haruuh, baruuh, ruht, hanruuh],
      [sentence, da, di, dool],
    ] as const;
    selectSets.forEach((set, index) => {
      const [correct, ...distractors] = set.filter((word): word is Word => Boolean(word));
      if (correct && distractors.length >= 3) {
        questions.push(makeArabicSelectQuestion(`eg_u5_arabic_select_${index + 1}`, 'egyptian-unit-5', correct, distractors));
      }
    });
  }

  const supportedCustom = questions.filter(question => tier.formats.includes(question.format));
  const genericFill = buildWordUnitQuiz('egyptian-unit5', lessons, tier);
  return capQuestionsForTier(
    shuffleNoAdjacentFormats([...supportedCustom, ...genericFill.filter(question => !supportedCustom.some(item => item.id === question.id))]),
    tier,
  );
}

function getWordLessonsForUnit(dialect: string, unitId: string): WordLessonEntry[] {
  return getDialectCurriculumItems(dialect)
    .filter(item => item.unitId === unitId && item.contentType === 'lesson' && item.lessonWords)
    .map(item => ({ id: item.contentId, words: item.lessonWords ?? [] }));
}

function getScenarioNamesForUnit(dialect: string, unitId: string) {
  return getDialectCurriculumItems(dialect)
    .filter(item => item.unitId === unitId && item.contentType === 'scenario' && item.scenarioName)
    .map(item => item.scenarioName as string);
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
  return seededSelection(items, items.length, 'shuffle', item => JSON.stringify(item));
}

function seededSelection<T>(items: T[], count: number, seed: string, keyFor: (item: T) => string) {
  return selectWithAttemptSeed(items, count, currentAttemptSelectionSeed, seed, keyFor);
}

function turnResponseShape(turn: DialogueTurn) {
  return /[?؟]\s*$/.test(displayTurnArabic(turn).trim()) || /[?]\s*$/.test(turn.english.trim())
    ? 'question'
    : 'response';
}

function makeOptions(correct: DialogueTurn, distractors: DialogueTurn[]) {
  const seenMeanings = new Set([correct.english.trim().toLowerCase()]);
  const contextual = uniqueTurns([...meaningfulTurns(distractors), ...distractors], correct)
    .filter(turn => {
      const meaning = turn.english.trim().toLowerCase();
      if (!meaning || seenMeanings.has(meaning)) return false;
      seenMeanings.add(meaning);
      return true;
    });
  const sameShape = contextual.filter(turn => turnResponseShape(turn) === turnResponseShape(correct));
  const primary = seededSelection(sameShape, 3, `${turnKey(correct)}:same-shape`, turnKey);
  const primaryKeys = new Set(primary.map(turnKey));
  const wrongTurns = [
    ...primary,
    ...seededSelection(
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
}

function acceptedAnswersForTurn(turn: DialogueTurn) {
  const answers = new Set(turn.acceptedTransliterations ?? []);
  answers.delete(turn.transliteration);
  return [...answers];
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
  const questions: QuizQuestion[] = [];

  scenarioEntries.forEach(entry => {
    const sceneImage = getScenarioSceneImage(content, dialect, entry.name);
    const scenarioUserTurns = entry.turns.filter(turn => turn.type === 'user');
    const scenarioNpcTurns = entry.turns.filter(turn => turn.type !== 'user');
    const scenarioQuestionTurns = uniqueTurns([...scenarioUserTurns, ...scenarioNpcTurns]);
    const followUpPair = selectFollowUpPair(entry.turns);

    if (followUpPair) {
      const { promptTurn, answerTurn } = followUpPair;
      const options = makeOptions(answerTurn, scenarioUserTurns);
      if (promptTurn.audio && options.length === 4) questions.push({
        id: `${dialect}_${entry.name}_scene`,
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
      if (options.length === 4) questions.push({
        id: `${dialect}_${entry.name}_fill`,
        format: 'fill_conversation',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: 10,
        dialogue,
        options,
      });
    }

    const listeningCandidates = meaningfulTurns(scenarioUserTurns).filter(turn => Boolean(turn.audio));
    seededSelection(listeningCandidates, 3, `${dialect}:${entry.name}:listening`, turnKey).forEach((listeningTurn, listeningIndex) => {
      const options = makeOptions(listeningTurn, scenarioQuestionTurns.filter(turn => turn.type === listeningTurn.type));
      if (options.length !== 4) return;
      questions.push({
        id: `${dialect}_${entry.name}_listen_${stableQuizHash(turnKey(listeningTurn)).toString(36)}`,
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
      .map(entry => seededSelection(meaningfulTurns(entry.turns.filter(turn => turn.type === 'user')), 1, `${dialect}:${entry.name}:match`, turnKey)[0])
      .filter((turn): turn is DialogueTurn => Boolean(turn)),
    ...meaningfulTurns(userTurns),
    ...userTurns,
  ]);
  const pairs = seededSelection(representativeUserTurns, 4, `${dialect}:${scenarioNames.join(':')}:match`, turnKey).map(turn => ({
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

  // ── Tier 3+: Transliteration typing questions (1 per scenario) ───────────
  if (tier && tier.hasTyping) {
    scenarioEntries.forEach(entry => {
      const candidate = seededSelection(meaningfulTurns(entry.turns.filter(t => t.type === 'user')), 1, `${dialect}:${entry.name}:typing`, turnKey)[0];
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
        acceptedAnswers: acceptedAnswersForTurn(candidate),
        hintFirstWord: firstWord,
      } satisfies TransliterationTypeQuestion);
    });
  }

  // ── Tier 4+: Arabic-select questions (read script, no transliteration) ──
  if (tier && tier.hasArabicSelect) {
    scenarioEntries.forEach(entry => {
      const candidates = meaningfulTurns(entry.turns.filter(t => t.type !== 'user'));
      const target = seededSelection(candidates, 1, `${dialect}:${entry.name}:arabic-select`, turnKey)[0];
      if (!target) return;
      const distractors = seededSelection(
        uniqueTurns(entry.turns.filter(turn => turn.type !== 'user'), target),
        3,
        `${entry.name}:${turnKey(target)}`,
        turnKey,
      );
      if (distractors.length < 2) return;
      if (distractors.length === 3) questions.push({
        id: `${dialect}_${entry.name}_arabic_select`,
        format: 'arabic_select',
        scenarioSource: entry.name.toLowerCase(),
        xpValue: ARABIC_SELECT_XP,
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
  const candidates = buildDialectUnit2Quiz(scenarioNames, content, dialect, tier)
    .filter(question => tier.formats.includes(question.format))
    .map(question => ({
      ...question,
      id: `${unitKey}_${question.id}`,
      scenarioSource: `${unitKey}:${question.scenarioSource}`,
    }));
  const selected: QuizQuestion[] = [];
  const used = new Set<string>();
  const add = (question: QuizQuestion | undefined) => {
    if (!question || used.has(question.id)) return;
    selected.push(question);
    used.add(question.id);
  };
  const findForScenario = (scenarioName: string, formats: QuizQuestion['format'][]) =>
    candidates.find(question =>
      question.scenarioSource === `${unitKey}:${scenarioName.toLowerCase()}`
      && formats.includes(question.format)
      && !used.has(question.id)
      && (question.format !== 'scene_replay' || Boolean(question.sceneImage))
    );

  const coverageFormats: QuizQuestion['format'][][] = tier.tier === 1
    ? [['scene_replay', 'listening'], ['listening', 'scene_replay']]
    : [['scene_replay', 'listening'], ['fill_conversation', 'listening'], ['listening', 'scene_replay']];
  scenarioNames.forEach((name, index) => add(findForScenario(name, coverageFormats[index % coverageFormats.length])));

  if (tier.tier >= 2) add(candidates.find(question => question.format === 'emoji_match'));
  if (tier.hasTyping) seededSelection(
    candidates.filter(question => question.format === 'transliteration_type'), 3, `${unitKey}:typing`, question => question.id,
  ).forEach(add);
  if (tier.hasArabicSelect) seededSelection(
    candidates.filter(question => question.format === 'arabic_select'), 3, `${unitKey}:arabic-select`, question => question.id,
  ).forEach(add);

  const target = targetQuestionCount(tier);
  candidates
    .filter(question => !used.has(question.id))
    .forEach(question => { if (selected.length < target) add(question); });
  return shuffleNoAdjacentFormats(selected.slice(0, target));
}

function buildEgyptianUnit6Quiz(content: DialectContent, tier: QuizTierInfo) {
  const candidates = buildDialectUnit2Quiz(EGYPTIAN_UNIT6_SCENARIOS, content, 'egyptian', tier)
    .filter(question => tier.formats.includes(question.format));
  const scenarioSources = EGYPTIAN_UNIT6_SCENARIOS.map(name => name.toLowerCase());
  const selected: QuizQuestion[] = [];
  const used = new Set<string>();
  const add = (scenarioSource: string, formats: QuizQuestion['format'][]) => {
    const question = candidates.find(candidate =>
      candidate.scenarioSource === scenarioSource
      && formats.includes(candidate.format)
      && !used.has(candidate.id)
      && (candidate.format !== 'scene_replay' || Boolean(candidate.sceneImage))
    );
    if (!question) return;
    selected.push(question);
    used.add(question.id);
  };
  const addEmoji = () => {
    const question = candidates.find(candidate => candidate.format === 'emoji_match' && !used.has(candidate.id));
    if (!question) return;
    selected.push(question);
    used.add(question.id);
  };

  const baseFormats: QuizQuestion['format'][][] = tier.tier === 1
    ? [
        ['scene_replay', 'listening'], ['listening'], ['scene_replay', 'listening'], ['listening'], ['listening'],
        ['listening'], ['listening'], ['scene_replay', 'listening'], ['listening'], ['listening'],
      ]
    : tier.tier === 2
      ? [
          ['scene_replay', 'listening'], ['fill_conversation'], ['listening'], ['scene_replay', 'listening'], ['fill_conversation'],
          ['listening'], ['fill_conversation'], ['scene_replay', 'listening'], ['listening'], ['fill_conversation'],
        ]
      : tier.tier === 3
        ? [
            ['scene_replay', 'listening'], ['fill_conversation'], ['listening'], ['transliteration_type'], ['fill_conversation'],
            ['transliteration_type'], ['listening'], ['scene_replay', 'listening'], ['transliteration_type'], ['fill_conversation'],
          ]
        : [
            ['scene_replay', 'listening'], ['arabic_select'], ['listening'], ['transliteration_type'], ['fill_conversation'],
            ['arabic_select'], ['listening'], ['scene_replay', 'listening'], ['transliteration_type'], ['fill_conversation'],
          ];

  scenarioSources.forEach((source, index) => add(source, baseFormats[index]));
  if (tier.tier >= 2) addEmoji();
  if (tier.tier === 2) {
    add(scenarioSources[0], ['listening']);
  } else if (tier.tier === 3) {
    add(scenarioSources[0], ['transliteration_type']);
    add(scenarioSources[1], ['listening']);
    add(scenarioSources[2], ['fill_conversation']);
    add(scenarioSources[7], ['transliteration_type']);
  } else if (tier.tier >= 4) {
    add(scenarioSources[0], ['arabic_select']);
    add(scenarioSources[1], ['transliteration_type']);
    add(scenarioSources[2], ['fill_conversation']);
    add(scenarioSources[4], ['listening']);
    add(scenarioSources[6], ['arabic_select']);
    add(scenarioSources[7], ['transliteration_type']);
    add(scenarioSources[9], ['arabic_select']);
  }

  return shuffleNoAdjacentFormats(selected);
}

function buildBalancedEgyptianScenarioQuiz(
  unitKey: 'unit8' | 'unit10',
  scenarioNames: string[],
  content: DialectContent,
  tier: QuizTierInfo,
) {
  const candidates = buildDialectUnit2Quiz(scenarioNames, content, 'egyptian', tier)
    .filter(question => tier.formats.includes(question.format));
  const selected: QuizQuestion[] = [];
  const used = new Set<string>();
  const sources = scenarioNames.map(name => name.toLowerCase());

  const add = (source: string, formats: QuizQuestion['format'][]) => {
    const question = candidates.find(candidate =>
      candidate.scenarioSource === source
      && formats.includes(candidate.format)
      && !used.has(candidate.id)
      && (candidate.format !== 'scene_replay' || Boolean(candidate.sceneImage))
    );
    if (!question) return false;
    selected.push({
      ...question,
      id: `eg_${unitKey}_${question.id}`,
      scenarioSource: `egyptian-${unitKey}:${question.scenarioSource}`,
    });
    used.add(question.id);
    return true;
  };

  const baseFormats = sources.map((_, index): QuizQuestion['format'][] => {
    if (getScenarioSceneImage(content, 'egyptian', scenarioNames[index])) return ['scene_replay', 'listening'];
    if (tier.tier === 1) return index % 3 === 0 ? ['scene_replay', 'listening'] : ['listening'];
    if (tier.tier === 2) return index % 2 === 0 ? ['fill_conversation', 'listening'] : ['listening'];
    if (tier.tier === 3) {
      if (index % 4 === 2) return ['transliteration_type', 'listening'];
      return index % 2 === 0 ? ['fill_conversation', 'listening'] : ['listening'];
    }
    if (index % 4 === 0) return ['arabic_select', 'listening'];
    if (index % 4 === 1) return ['transliteration_type', 'listening'];
    if (index % 4 === 2) return ['fill_conversation', 'listening'];
    return ['scene_replay', 'listening'];
  });

  sources.forEach((source, index) => add(source, baseFormats[index]));

  const extraFormats: QuizQuestion['format'][] = tier.tier === 1
    ? ['listening', 'scene_replay']
    : tier.tier === 2
      ? ['fill_conversation', 'listening', 'scene_replay']
      : tier.tier === 3
        ? ['transliteration_type', 'fill_conversation', 'listening', 'scene_replay']
        : ['arabic_select', 'transliteration_type', 'fill_conversation', 'listening', 'scene_replay'];

  let round = 0;
  while (selected.length < targetQuestionCount(tier) && round < extraFormats.length * sources.length) {
    const source = sources[round % sources.length];
    const format = extraFormats[Math.floor(round / sources.length) % extraFormats.length];
    add(source, [format]);
    round += 1;
  }

  return shuffleNoAdjacentFormats(selected);
}

const UNIT9_FILL_PROMPTS: Record<string, { prompt: string; answer: string; distractors: string[] }> = {
  invitations: {
    prompt: 'عايز تعزم صاحبك يخرج معاكم. هتقول إيه؟',
    answer: 'تيجي معانا؟',
    distractors: ['للأسف مش هقدر', 'معلش، مرة تانية', 'أشوفك بكرة'],
  },
  'accepting-and-refusing': {
    prompt: 'صاحبك عزمك وإنت موافق. هترد بإيه؟',
    answer: 'ماشي',
    distractors: ['للأسف مش هقدر', 'معلش، مرة تانية', 'ينفع يوم تاني؟'],
  },
  'visiting-friends': {
    prompt: 'رايح تزور صاحبك. هتسأله تجيب إيه؟',
    answer: 'أجيب حاجة معايا؟',
    distractors: ['البيت منور', 'تعبناك معانا', 'أشوفك بكرة'],
  },
  'family-visit': {
    prompt: 'عايز تقول إنكم هتزوروا العيلة الجمعة. هتقول إيه؟',
    answer: 'هنزوركم الجمعة',
    distractors: ['سلم لي على العيلة', 'وحشتونا', 'خليكم على العشا'],
  },
  'cafe-with-friends': {
    prompt: 'وصلتوا الكافيه وعايز تختار مكان. هتسأل إزاي؟',
    answer: 'نقعد فين؟',
    distractors: ['الحساب علينا', 'أنا هطلب قهوة', 'القعدة حلوة هنا'],
  },
  football: {
    prompt: 'عايز تعرف صاحبك بيشجع أنهي فريق. هتسأل إزاي؟',
    answer: 'بتشجع مين؟',
    distractors: ['هنشوف الماتش', 'بلعب كورة', 'كسبنا الماتش'],
  },
  gaming: {
    prompt: 'عايز تلعب مع صاحبك على النت. هتقول إيه؟',
    answer: 'نلعب أونلاين',
    distractors: ['نكمل بكرة', 'استنى، النت بطيء', 'اللعبة دي حلوة'],
  },
  'social-media': {
    prompt: 'عايز صاحبك يبعت لك الصورة على واتساب. هتقول إيه؟',
    answer: 'ابعتلي على واتساب',
    distractors: ['شوفت البوست؟', 'عملت لك فولو', 'هرد عليك بعدين'],
  },
  'weekend-plans': {
    prompt: 'عايز تعرف صاحبك فاضي بكرة ولا لأ. هتسأل إزاي؟',
    answer: 'فاضي بكرة؟',
    distractors: ['أنا عندي وقت', 'نروح فين؟', 'الجو هيبقى حلو'],
  },
  'making-plans': {
    prompt: 'عايز تقترح إنكم تتقابلوا. هتقول إيه؟',
    answer: 'خلينا نتقابل',
    distractors: ['فاضي بكرة؟', 'أنا عندي وقت', 'أشوفك بكرة'],
  },
};

function buildEgyptianUnit9Quiz(lessons: WordLessonEntry[], content: DialectContent, tier: QuizTierInfo) {
  const allWords = uniqueWords(lessons.flatMap(lessonItem => lessonItem.words));
  const candidatesByLesson = new Map<string, QuizQuestion[]>();
  lessons.forEach(lessonItem => {
    const words = uniqueWords(lessonItem.words);
    const primary = words[0];
    const secondary = words[1] ?? primary;
    const reading = words[2] ?? secondary;
    if (!primary || !secondary || !reading) return;
    const source = `egyptian-unit-9:${lessonItem.id}`;
    const distractors = (target: Word) => {
      const contextual = uniqueWords(words, target);
      const contextualKeys = new Set(contextual.map(wordKey));
      const fallback = uniqueWords(allWords, target).filter(word => !contextualKeys.has(wordKey(word)));
      return seededSelection(
        [...contextual, ...fallback],
        3,
        `${lessonItem.id}:${wordKey(target)}`,
        wordKey,
      );
    };
    const questions: QuizQuestion[] = [
      makeWordListeningQuestion(`eg_u9_${lessonItem.id}_listen`, source, primary, distractors(primary)),
      makeTransliterationQuestion(`eg_u9_${lessonItem.id}_translit`, source, secondary),
      makeArabicSelectQuestion(`eg_u9_${lessonItem.id}_arabic`, source, reading, distractors(reading)),
    ];
    const fill = UNIT9_FILL_PROMPTS[lessonItem.id];
    const fillAnswer = fill ? findWord(words, fill.answer) : undefined;
    if (fill && fillAnswer) {
      const fillDistractors = fill.distractors
        .map(arabic => findWord(allWords, arabic))
        .filter((word): word is Word => Boolean(word));
      questions.push(makeFillQuestion(
        `eg_u9_${lessonItem.id}_fill`,
        source,
        fill.prompt,
        wordOption(fillAnswer),
        fillDistractors.map(word => wordOption(word)),
      ));
    }
    const cafeSceneImage = getScenarioSceneImage(content, 'egyptian', 'Cafe');
    if (lessonItem.id === 'cafe-with-friends' && cafeSceneImage) {
      questions.push(makeWordSceneQuestion(
        'eg_u9_cafe_scene', source, 'You are making a plan at a Cairo café. Choose the natural phrase.',
        primary, distractors(primary), cafeSceneImage,
      ));
    }
    candidatesByLesson.set(lessonItem.id, questions);
  });

  const selected: QuizQuestion[] = [];
  const used = new Set<string>();
  const lessonIds = lessons.map(lessonItem => lessonItem.id);
  const add = (lessonId: string, formats: QuizQuestion['format'][]) => {
    const question = (candidatesByLesson.get(lessonId) ?? []).find(candidate =>
      formats.includes(candidate.format) && tier.formats.includes(candidate.format) && !used.has(candidate.id)
    );
    if (!question) return false;
    selected.push(question);
    used.add(question.id);
    return true;
  };

  lessonIds.forEach((lessonId, index) => {
    if (tier.tier === 1) add(lessonId, ['scene_replay', 'listening']);
    else if (tier.tier === 2) add(lessonId, index % 2 === 0 ? ['fill_conversation', 'listening'] : ['listening']);
    else if (tier.tier === 3) add(lessonId, index % 3 === 0 ? ['transliteration_type', 'listening'] : ['fill_conversation', 'listening']);
    else add(lessonId, index % 3 === 0 ? ['arabic_select', 'listening'] : index % 3 === 1 ? ['transliteration_type', 'listening'] : ['fill_conversation', 'listening']);
  });

  const extraFormats: QuizQuestion['format'][] = tier.tier === 1
    ? ['listening']
    : tier.tier === 2
      ? ['fill_conversation', 'listening', 'scene_replay']
      : tier.tier === 3
        ? ['transliteration_type', 'fill_conversation', 'listening']
        : ['arabic_select', 'transliteration_type', 'fill_conversation', 'listening', 'scene_replay'];
  let round = 0;
  while (selected.length < targetQuestionCount(tier) && round < extraFormats.length * lessonIds.length) {
    const lessonId = lessonIds[round % lessonIds.length];
    const format = extraFormats[Math.floor(round / lessonIds.length) % extraFormats.length];
    add(lessonId, [format]);
    round += 1;
  }

  return shuffleNoAdjacentFormats(selected);
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
  const { applyGuestXpSnapshot, refreshFromServer } = useXP();
  const requestedUnit = unit ?? '2p1';
  const attemptScope = requestedUnit === 'review'
    ? getPhase1ReviewAttemptScope(dialect)
    : `${dialect}:${requestedUnit}`;
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
  const [persistenceFailed, setPersistenceFailed] = useState(false);
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
  const attemptSeedCacheRef = useRef<ReturnType<typeof createScopedAttemptSeedCache> | null>(null);
  const activeAttemptRef = useRef<ScopedAttemptSeed | null>(null);
  if (!attemptSeedCacheRef.current) {
    attemptSeedCacheRef.current = createScopedAttemptSeedCache();
  }

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
    requestedUnit === '1'   ? 'Unit 1 Quiz' :
    requestedUnit === '2'   ? 'Unit 2 Quiz' :
    requestedUnit === '3'   ? 'Unit 3 Quiz' :
    requestedUnit === '2p2' ? 'Unit 2 Quiz · Part 2' :
    requestedUnit === '2p1' ? 'Unit 2 Quiz · Part 1' :
    requestedUnit === '4'   ? 'Unit 4 Quiz' :
    requestedUnit === '5'   ? 'Unit 5 Quiz' :
    requestedUnit === '6'   ? 'Unit 6 Quiz' :
    requestedUnit === '7'   ? 'Unit 7 Quiz' :
    requestedUnit === '8'   ? 'Unit 8 Quiz' :
    requestedUnit === '9'   ? 'Unit 9 Quiz' :
    requestedUnit === '10'  ? 'Unit 10 Quiz' :
    'Unit 2 Quiz';

  const buildAttemptPlan = async (): Promise<QuizAttemptPlan | null> => {
    const attempt = await attemptSeedCacheRef.current!.resolve(attemptScope);
    if (!attempt) return null;
    const attemptSeed = attempt.seed;
    currentAttemptSelectionSeed = attemptSeed;

    if (isDedicatedReviewRoute(requestedUnit)) {
      const allDialectQuestions = buildPhase1ReviewQuestions(content, dialect, attemptSeed);
      const dueIds = await getDueItemIds();
      const dueQuestions = allDialectQuestions.filter(q => dueIds.has(q.id));
      const selected = shuffleNoAdjacentFormats(dueQuestions).slice(0, 10);
      if (selected.length === 0) return null;
      return {
        attempt,
        questions: selected,
        tierInfo: getQuizTierInfo(1),
        srsSummary: await getQuizSrsSummary(selected.map(q => q.id)),
        maxXp: 0,
      };
    }

    const completedRaw = await AsyncStorage.getItem('guest_progress');
    const completedMap: Record<string, boolean> = completedRaw ? JSON.parse(completedRaw) : {};
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: prog } = await supabase
          .from('scenario_progress')
          .select('scenario_id, completed_count')
          .eq('user_id', session.user.id);
        if (prog) prog.forEach(p => {
          if ((p.completed_count ?? 0) > 0) completedMap[p.scenario_id] = true;
        });
      }
    } catch { /* non-fatal */ }

    const completedContentIds = Object.keys(completedMap)
      .filter(key => completedMap[key])
      .flatMap(key => {
        const parsed = parseCompletionKey(key);
        if (parsed) return parsed.dialect === dialect ? [parsed.contentId] : [];
        return dialect === 'gulf' ? [key] : [];
      });
    const tier = getQuizTier(completedContentIds);
    const currentTierInfo = getQuizTierInfo(tier);
    if (!['1', '2', '3', '2p1', '2p2', '4', '5', '6', '7', '8', '9', '10'].includes(requestedUnit)) return null;

    const scenarioNames = requestedUnit === '2p2' ? UNIT2_PART2_SCENARIOS : UNIT2_PART1_SCENARIOS;
    const dialectQuestions = buildDialectUnit2Quiz(scenarioNames, content, dialect, currentTierInfo);
    const msaUnitId = `unit-${requestedUnit}`;
    const msaBase = dialect !== 'msa' ? null :
      requestedUnit === '1' ? buildWordUnitQuiz('msa-unit1', [
        { id: 'basic', words: content.lessons.basic ?? [] },
        { id: 'greetings', words: content.lessons.greetings ?? [] },
        { id: 'intro', words: content.lessons.intro ?? [] },
      ], currentTierInfo) :
      requestedUnit === '2' ? buildScenarioUnitQuiz('msa-unit2', getScenarioNamesForUnit(dialect, msaUnitId), content, dialect, currentTierInfo) :
      requestedUnit === '3' ? buildWordUnitQuiz('msa-unit3', [{ id: 'alphabet', words: MSA_UNIT3_QUIZ_WORDS }], currentTierInfo) :
      ['4', '5', '7', '9'].includes(requestedUnit) ? buildWordUnitQuiz(`msa-unit${requestedUnit}`, getWordLessonsForUnit(dialect, msaUnitId), currentTierInfo) :
      ['6', '8', '10'].includes(requestedUnit) ? buildScenarioUnitQuiz(`msa-unit${requestedUnit}`, getScenarioNamesForUnit(dialect, msaUnitId), content, dialect, currentTierInfo) :
      [];
    const base = msaBase ?? (
      requestedUnit === '1' ? buildWordUnitQuiz(`${dialect}-unit1`, [
        { id: 'basic', words: content.lessons.basic ?? [] },
        { id: 'greetings', words: content.lessons.greetings ?? [] },
        { id: 'intro', words: content.lessons.intro ?? [] },
      ], currentTierInfo) :
      requestedUnit === '2' ? buildScenarioUnitQuiz(`${dialect}-unit2`, getScenarioNamesForUnit(dialect, 'unit-2'), content, dialect, currentTierInfo) :
      requestedUnit === '3' ? buildWordUnitQuiz(`${dialect}-unit3`, getWordLessonsForUnit(dialect, 'unit-3'), currentTierInfo) :
      requestedUnit === '4' && dialect === 'egyptian' ? buildEgyptianUnit4Quiz(getWordLessonsForUnit(dialect, 'unit-4'), content, currentTierInfo) :
      requestedUnit === '4' ? buildWordUnitQuiz(`${dialect}-unit4`, getWordLessonsForUnit(dialect, 'unit-4'), currentTierInfo) :
      requestedUnit === '5' && dialect === 'egyptian' ? buildEgyptianUnit5Quiz(getWordLessonsForUnit(dialect, 'unit-5'), content, currentTierInfo) :
      requestedUnit === '5' ? buildWordUnitQuiz(`${dialect}-unit5`, getWordLessonsForUnit(dialect, 'unit-5'), currentTierInfo) :
      requestedUnit === '6' && dialect === 'egyptian' ? buildEgyptianUnit6Quiz(content, currentTierInfo) :
      requestedUnit === '6' && dialect === 'gulf' ? buildScenarioUnitQuiz('gulf-unit6', getScenarioNamesForUnit(dialect, 'unit-6'), content, dialect, currentTierInfo) :
      requestedUnit === '6' ? [] :
      requestedUnit === '7' && dialect === 'egyptian' ? buildEgyptianUnit7Quiz(getWordLessonsForUnit(dialect, 'unit-7'), content, currentTierInfo) :
      requestedUnit === '7' && dialect === 'gulf' ? buildWordUnitQuiz('unit7', getWordLessonsForUnit(dialect, 'unit-7'), currentTierInfo) :
      requestedUnit === '7' ? [] :
      requestedUnit === '8' && dialect === 'egyptian' ? buildBalancedEgyptianScenarioQuiz('unit8', EGYPTIAN_UNIT8_SCENARIOS, content, currentTierInfo) :
      requestedUnit === '8' && dialect === 'gulf' ? buildScenarioUnitQuiz('unit8', UNIT8_SCENARIOS, content, dialect, currentTierInfo) :
      requestedUnit === '8' ? [] :
      requestedUnit === '9' && dialect === 'egyptian' ? buildEgyptianUnit9Quiz(getWordLessonsForUnit(dialect, 'unit-9'), content, currentTierInfo) :
      requestedUnit === '9' && dialect === 'gulf' ? buildWordUnitQuiz('unit9', getWordLessonsForUnit(dialect, 'unit-9'), currentTierInfo) :
      requestedUnit === '9' ? [] :
      requestedUnit === '10' && dialect === 'egyptian' ? buildBalancedEgyptianScenarioQuiz('unit10', EGYPTIAN_UNIT10_SCENARIOS, content, currentTierInfo) :
      requestedUnit === '10' && dialect === 'gulf' ? buildScenarioUnitQuiz('unit10', UNIT10_SCENARIOS, content, dialect, currentTierInfo) :
      requestedUnit === '10' ? [] :
      dialect === 'gulf' && requestedUnit === '2p1' ? buildScenarioUnitQuiz('gulf-unit2p1', UNIT2_PART1_SCENARIOS, content, dialect, currentTierInfo) :
      dialect === 'gulf' && requestedUnit === '2p2' ? buildScenarioUnitQuiz('gulf-unit2p2', UNIT2_PART2_SCENARIOS, content, dialect, currentTierInfo) :
      dialectQuestions
    );

    if (base.length === 0) return null;
    const prioritized = await prioritizeQuizItems(base, question => question.id);
    const shuffled = shuffleNoAdjacentFormats(prioritized);
    return {
      attempt,
      questions: shuffled,
      tierInfo: currentTierInfo,
      srsSummary: await getQuizSrsSummary(shuffled.map(question => question.id)),
      maxXp: getQuizMaxXp(shuffled),
    };
  };

  useEffect(() => {
    if (phase !== 'intro') return;
    let cancelled = false;
    setAttemptPlan(null);
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
    setPersistenceFailed(false);
    setLastAwardedXp(0);
    setShowXpFloat(false);
    setXpEarned(0);
    setRedrillCount(0);
    setCurrentIndex(0);
    setAnswerResult('none');
  };

  const beginQuizWithPlan = (plan: QuizAttemptPlan) => {
    resetAttemptState();
    activeAttemptRef.current = plan.attempt;
    setAllQuestions(plan.questions);
    setQuestions(plan.questions);
    setTierInfo(plan.tierInfo);
    setSrsSummary(plan.srsSummary);
    setMaxXp(plan.maxXp);
    setPhase('quiz');
  };

  const startQuiz = async () => {
    const plan = attemptPlan?.attempt.scope === attemptScope
      ? attemptPlan
      : await buildAttemptPlan();
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
      const questionXp = requestedUnit === 'review' || awardedQuestionIdsRef.current.has(q.id)
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
          const finishInitialAttempt = async () => {
            if (initialPassed && requestedUnit !== 'review') {
              try {
                setPersistedXpAdded(await saveQuizCompletion(frozenResult));
              } catch (error) {
                setPersistenceFailed(true);
                console.warn('Quiz save error:', error);
              }
            }
            if (activeAttemptRef.current) {
              await finishQuizAttempt(activeAttemptRef.current.scope, activeAttemptRef.current.seed);
            }
            setPhase('results');
          };
          finishInitialAttempt().catch(error => {
            console.warn('Quiz finalization error:', error);
            setPhase('results');
          });
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
    const unitId = requestedUnit === '2p1' || requestedUnit === '2p2' ? 'unit-2' : `unit-${requestedUnit}`;
    if (!routeContentId) return 0;
    const scenarioKey = buildCompletionKey(dialect, unitId, routeContentId);
    const persisted = await persistQuizPass({
      completionKey: scenarioKey,
      dialect,
      legacyContentId: routeContentId,
      score: result.score,
      xp: result.attemptXp,
      applyGuestXpSnapshot,
      refreshSignedInXp: refreshFromServer,
    });
    await recordActivity();
    return persisted.xpAwarded;
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
    const seed = await startFreshQuizAttempt(attemptScope);
    attemptSeedCacheRef.current!.set(attemptScope, seed);
    activeAttemptRef.current = null;
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
      <QuizAccessGate isReview={requestedUnit === 'review'} contentId={routeContentId} contentLabel={quizTitle}>
        <Stack.Screen options={{ headerShown: false }} />
        <QuizIntro
          title={quizTitle}
          tier={tierInfo}
          questionCount={attemptPlan?.questions.length ?? 0}
          maxXp={attemptPlan?.maxXp ?? 0}
          isLoading={isPlanningAttempt}
          onStart={startQuiz}
        />
      </QuizAccessGate>
    );
  }

  if (phase === 'results') {
    return (
      <QuizAccessGate isReview={requestedUnit === 'review'} contentId={routeContentId} contentLabel={quizTitle}>
        <Stack.Screen options={{ headerShown: false }} />
        <QuizResults
          correct={initialResult?.correctCount ?? 0}
          total={allQuestions.length}
          passingScore={getPassingScore(allQuestions.length)}
          passed={initialResult?.passed ?? false}
          xpEarned={initialResult?.attemptXp ?? 0}
          maxXp={maxXp}
          persistedXpAdded={persistedXpAdded}
          persistenceFailed={persistenceFailed}
          isReview={requestedUnit === 'review'}
          hasMissed={(initialResult?.missedCount ?? 0) > 0}
          missedCount={initialResult?.missedCount ?? 0}
          correctedCount={correctedPracticeCount}
          srsSummary={srsSummary}
          onPracticeMistakes={handlePracticeMistakes}
          onRetryFull={handleRetryFullQuiz}
          onHome={() => router.replace('/(tabs)')}
        />
      </QuizAccessGate>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return (
      <QuizAccessGate isReview={requestedUnit === 'review'} contentId={routeContentId} contentLabel={quizTitle}>
        <Stack.Screen options={{ headerShown: false }} />
      </QuizAccessGate>
    );
  }

  return (
    <QuizAccessGate isReview={requestedUnit === 'review'} contentId={routeContentId} contentLabel={quizTitle}>
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
                showTranslit={tierInfo.tier === 1 && tierInfo.showTranslit}
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
    </QuizAccessGate>
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
    case 'emoji_match':          return '🔗 Meaning Match';
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
