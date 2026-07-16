/* eslint-disable @typescript-eslint/no-var-requires */

import { dirname, relative, resolve } from 'path';

export type AudioTarget = {
  id: string;
  dialect: 'gulf' | 'egyptian' | 'msa' | 'maghrebi' | 'levantine';
  kind: 'lesson' | 'scenario' | 'quiz' | 'alphabet';
  sourceKey: string;
  index: number;
  line?: number;
  speaker?: 'waiter' | 'user' | 'driver' | 'receptionist' | 'staff' | 'pharmacist' | 'barber' | 'airport_staff';
  displayArabic?: string;
  audioText: string;
  evalTarget?: string;
  transliteration?: string;
  english?: string;
  audioPath: string;
};

type AudioCatalogFilter = {
  dialect?: string;
  kind?: string;
  sourceKey?: string;
};

const CORE_SCENARIOS = [
  ['cafe', 'CAFE_DIALOGUE', 'CAFE_DIALOGUE_MSA', 'CAFE_DIALOGUE_EG', 'cafe'],
  ['taxi', 'TAXI_DIALOGUE', 'TAXI_DIALOGUE_MSA', 'TAXI_DIALOGUE_EG', 'taxi'],
  ['hotel', 'HOTEL_DIALOGUE', 'HOTEL_DIALOGUE_MSA', 'HOTEL_DIALOGUE_EG', 'hotel'],
  ['restaurant', 'RESTAURANT_DIALOGUE', 'RESTAURANT_DIALOGUE_MSA', 'RESTAURANT_DIALOGUE_EG', 'restaurant'],
  ['supermarket', 'SUPERMARKET_DIALOGUE', 'SUPERMARKET_DIALOGUE_MSA', 'SUPERMARKET_DIALOGUE_EG', 'supermarket'],
  ['pharmacy', 'PHARMACY_DIALOGUE', 'PHARMACY_DIALOGUE_MSA', 'PHARMACY_DIALOGUE_EG', 'pharmacy'],
  ['barbershop', 'BARBERSHOP_DIALOGUE', 'BARBERSHOP_DIALOGUE_MSA', 'BARBERSHOP_DIALOGUE_EG', 'barbershop'],
  ['airport', 'AIRPORT_DIALOGUE', 'AIRPORT_DIALOGUE_MSA', 'AIRPORT_DIALOGUE_EG', 'airport'],
] as const;

const ROOT = process.cwd();
const ASSET_RE = /\.(mp3|wav|m4a|png|jpe?g|webp|gif|svg|ttf|otf)$/i;
const UNIT_4_LESSONS = [
  ['numbers-1-5', 'NUMBERS_1_5_WORDS'],
  ['numbers-6-10', 'NUMBERS_6_10_WORDS'],
  ['numbers-11-20', 'NUMBERS_11_20_WORDS'],
  ['numbers-tens', 'NUMBERS_TENS_WORDS'],
  ['numbers-age', 'NUMBERS_AGE_WORDS'],
  ['numbers-prices', 'NUMBERS_PRICES_WORDS'],
  ['numbers-phone', 'NUMBERS_PHONE_WORDS'],
  ['numbers-hours', 'NUMBERS_HOURS_WORDS'],
  ['numbers-minutes', 'NUMBERS_MINUTES_WORDS'],
  ['numbers-days', 'NUMBERS_DAYS_WORDS'],
  ['numbers-months', 'NUMBERS_MONTHS_WORDS'],
  ['numbers-dates', 'NUMBERS_DATES_WORDS'],
  ['numbers-ordering', 'NUMBERS_ORDERING_WORDS'],
  ['numbers-together', 'NUMBERS_TOGETHER_WORDS'],
] as const;
const UNIT_4_SOURCE_KEYS = new Set(UNIT_4_LESSONS.map(([sourceKey]) => sourceKey));

const UNIT_5_LESSONS = [
  ['grammar-pronouns',      'GRAMMAR_PRONOUNS_WORDS'],
  ['grammar-this-that',     'GRAMMAR_THIS_THAT_WORDS'],
  ['grammar-possessives',   'GRAMMAR_POSSESSIVES_WORDS'],
  ['grammar-present-verbs', 'GRAMMAR_PRESENT_VERBS_WORDS'],
  ['grammar-past-verbs',    'GRAMMAR_PAST_VERBS_WORDS'],
  ['grammar-want-need',     'GRAMMAR_WANT_NEED_WORDS'],
  ['grammar-questions',     'GRAMMAR_QUESTIONS_WORDS'],
  ['grammar-negation',      'GRAMMAR_NEGATION_WORDS'],
  ['grammar-adjectives',    'GRAMMAR_ADJECTIVES_WORDS'],
  ['grammar-sentences',     'GRAMMAR_SENTENCES_WORDS'],
] as const;
const UNIT_5_SOURCE_KEYS = new Set(UNIT_5_LESSONS.map(([sourceKey]) => sourceKey));

const UNIT_7_LESSONS = [
  ['work-office',     'WORK_OFFICE_WORDS'],
  ['work-greetings',  'WORK_GREETINGS_WORDS'],
  ['work-meeting',    'WORK_MEETING_WORDS'],
  ['work-phone',      'WORK_PHONE_WORDS'],
  ['work-email',      'WORK_EMAIL_WORDS'],
  ['work-schedule',   'WORK_SCHEDULE_WORDS'],
  ['work-problems',   'WORK_PROBLEMS_WORDS'],
  ['work-smalltalk',  'WORK_SMALLTALK_WORDS'],
  ['work-salary',     'WORK_SALARY_WORDS'],
  ['work-leaving',    'WORK_LEAVING_WORDS'],
] as const;
const UNIT_7_SOURCE_KEYS = new Set(UNIT_7_LESSONS.map(([sourceKey]) => sourceKey));

const UNIT_9_LESSONS = [
  ['social-greetings',   'SOCIAL_GREETINGS_WORDS'],
  ['social-family',      'SOCIAL_FAMILY_WORDS'],
  ['social-invitations', 'SOCIAL_INVITATIONS_WORDS'],
  ['social-ramadan',     'SOCIAL_RAMADAN_WORDS'],
  ['social-compliments', 'SOCIAL_COMPLIMENTS_WORDS'],
  ['social-emotions',    'SOCIAL_EMOTIONS_WORDS'],
  ['social-weddings',    'SOCIAL_WEDDINGS_WORDS'],
  ['social-condolences', 'SOCIAL_CONDOLENCES_WORDS'],
  ['social-religion',    'SOCIAL_RELIGION_WORDS'],
  ['social-manners',     'SOCIAL_MANNERS_WORDS'],
] as const;
const UNIT_9_SOURCE_KEYS = new Set(UNIT_9_LESSONS.map(([sourceKey]) => sourceKey));

const Module: any = require('module');
const realRequire = Module.prototype.require;
if (!Module.prototype.__heyYusufAudioCatalogAssetHook) {
  Module.prototype.require = function (id: string) {
    if (typeof id === 'string' && ASSET_RE.test(id)) {
      try {
        return resolve(dirname(this.filename), id);
      } catch {
        return id;
      }
    }
    return realRequire.call(this, id);
  };
  Module.prototype.__heyYusufAudioCatalogAssetHook = true;
}

function toRelativeAudioPath(audio: unknown): string | null {
  if (typeof audio !== 'string') return null;
  return relative(ROOT, audio);
}

function getAudioText(item: any): string {
  return item.audioText ?? item.evalTarget ?? item.displayArabic ?? item.arabic;
}

function buildLessonTargets(
  dialect: AudioTarget['dialect'],
  sourceKey: string,
  words: any[],
  folder: string,
): AudioTarget[] {
  return words
    .map((word, i) => {
      const audioText = getAudioText(word);
      if (typeof audioText !== 'string' || !audioText.trim()) return null;

      return {
        id: `${dialect}:lesson:${sourceKey}:${i + 1}`,
        dialect,
        kind: 'lesson',
        sourceKey,
        index: i,
        line: i + 1,
        displayArabic: word.displayArabic,
        audioText: audioText.trim(),
        evalTarget: word.evalTarget,
        transliteration: word.transliteration,
        english: word.english,
        audioPath: toRelativeAudioPath(word.audio) ?? `assets/audio/${folder}/${i + 1}.mp3`,
      } satisfies AudioTarget;
    })
    .filter(Boolean) as AudioTarget[];
}

function buildScenarioTargets(
  dialect: AudioTarget['dialect'],
  sourceKey: string,
  turns: any[],
  folder: string,
): AudioTarget[] {
  let waiterIndex = 0;
  let userIndex = 0;

  return turns
    .map((turn, i) => {
      const audioText = getAudioText(turn);
      if (typeof audioText !== 'string' || !audioText.trim()) return null;

      const isWaiter = turn.type === 'waiter';
      const fileIndex = isWaiter ? ++waiterIndex : ++userIndex;
      const filePrefix = isWaiter ? 'w' : 'u';
      const speaker = sourceKey === 'taxi' && isWaiter ? 'driver' : turn.type;

      return {
        id: `${dialect}:scenario:${sourceKey}:${i}`,
        dialect,
        kind: 'scenario',
        sourceKey,
        index: i,
        line: i,
        speaker,
        displayArabic: turn.displayArabic,
        audioText: audioText.trim(),
        evalTarget: turn.evalTarget,
        transliteration: turn.transliteration,
        english: turn.english,
        audioPath: toRelativeAudioPath(turn.audio) ?? `assets/audio/${folder}/${filePrefix}${fileIndex}.mp3`,
      } satisfies AudioTarget;
    })
    .filter(Boolean) as AudioTarget[];
}

function buildAlphabetTargets(): AudioTarget[] {
  const { ALPHABET_AUDIO } = require('../data/alphabet-audio');

  return ALPHABET_AUDIO.map((letter: any, i: number) => {
    return {
      id: `gulf:alphabet:letters:${letter.id ?? i + 1}`,
      dialect: 'gulf',
      kind: 'alphabet',
      sourceKey: 'alphabet',
      index: i,
      line: letter.index ?? i + 1,
      displayArabic: letter.displayArabic,
      audioText: letter.audioText,
      evalTarget: letter.evalTarget,
      transliteration: letter.transliteration,
      english: letter.english,
      audioPath: letter.audioPath,
    } satisfies AudioTarget;
  });
}

export function getAudioCatalog(): AudioTarget[] {
  const words = require('../constants/words');
  const { BASIC_WORDS, GREETINGS_WORDS, INTRO_WORDS } = words;
  const gulfDialogues = require('../data/gulf-dialogues');
  const egyptianWords = require('../data/egyptian-words');
  const egyptianDialogues = require('../data/egyptian-dialogues');
  const msaWords = require('../data/msa-words');
  const msaDialogues = require('../data/msa-dialogues');

  return [
    ...buildLessonTargets('gulf', 'basic-words', BASIC_WORDS, 'basic-words'),
    ...buildLessonTargets('gulf', 'greetings', GREETINGS_WORDS, 'greetings'),
    ...buildLessonTargets('gulf', 'intro', INTRO_WORDS, 'intro'),
    ...UNIT_4_LESSONS.flatMap(([sourceKey, exportName]) =>
      buildLessonTargets('gulf', sourceKey, words[exportName] ?? [], `unit-4/${sourceKey}`),
    ),
    ...UNIT_5_LESSONS.flatMap(([sourceKey, exportName]) =>
      buildLessonTargets('gulf', sourceKey, words[exportName] ?? [], `unit-5/${sourceKey}`),
    ),
    ...UNIT_7_LESSONS.flatMap(([sourceKey, exportName]) =>
      buildLessonTargets('gulf', sourceKey, words[exportName] ?? [], `unit-7/${sourceKey}`),
    ),
    ...UNIT_9_LESSONS.flatMap(([sourceKey, exportName]) =>
      buildLessonTargets('gulf', sourceKey, words[exportName] ?? [], `unit-9/${sourceKey}`),
    ),
    ...buildLessonTargets('msa', 'basic-words', msaWords.BASIC_WORDS_MSA ?? [], 'msa/basic-words'),
    ...buildLessonTargets('msa', 'greetings', msaWords.GREETINGS_WORDS_MSA ?? [], 'msa/greetings'),
    ...buildLessonTargets('msa', 'intro', msaWords.INTRO_WORDS_MSA ?? [], 'msa/intro'),
    ...buildLessonTargets('egyptian', 'basic-words', egyptianWords.BASIC_WORDS_EG ?? [], 'egyptian/basic-words'),
    ...buildLessonTargets('egyptian', 'greetings', egyptianWords.GREETINGS_WORDS_EG ?? [], 'egyptian/greetings'),
    ...buildLessonTargets('egyptian', 'intro', egyptianWords.INTRO_WORDS_EG ?? [], 'egyptian/intro'),
    ...buildAlphabetTargets(),
    ...CORE_SCENARIOS.flatMap(([sourceKey, gulfExport]) =>
      buildScenarioTargets('gulf', sourceKey, gulfDialogues[gulfExport] ?? [], sourceKey),
    ),
    ...CORE_SCENARIOS.flatMap(([sourceKey, _gulfExport, msaExport, _egyptianExport, folder]) =>
      buildScenarioTargets('msa', sourceKey, msaDialogues[msaExport] ?? [], `msa/${folder}`),
    ),
    ...CORE_SCENARIOS.flatMap(([sourceKey, _gulfExport, _msaExport, egyptianExport, folder]) =>
      buildScenarioTargets('egyptian', sourceKey, egyptianDialogues[egyptianExport] ?? [], `egyptian/${folder}`),
    ),
  ];
}

export function getAudioTargets(filter: AudioCatalogFilter = {}): AudioTarget[] {
  return getAudioCatalog().filter(target => {
    if (filter.dialect && target.dialect !== filter.dialect) return false;
    if (filter.kind && target.kind !== filter.kind) return false;
    if (filter.sourceKey) {
      if (filter.sourceKey === 'unit-4') {
        if (!UNIT_4_SOURCE_KEYS.has(target.sourceKey as any)) return false;
      } else if (filter.sourceKey === 'unit-5') {
        if (!UNIT_5_SOURCE_KEYS.has(target.sourceKey as any)) return false;
      } else if (filter.sourceKey === 'unit-7') {
        if (!UNIT_7_SOURCE_KEYS.has(target.sourceKey as any)) return false;
      } else if (filter.sourceKey === 'unit-9') {
        if (!UNIT_9_SOURCE_KEYS.has(target.sourceKey as any)) return false;
      } else if (target.sourceKey !== filter.sourceKey) {
        return false;
      }
    }
    return true;
  });
}
