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
  audio?: any;
  unit?: number;
  voiceId?: string;
  modelId?: string;
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

const EGYPTIAN_UNIT_4_LESSONS = [
  ['numbers-1-5', 'NUMBERS_1_5_WORDS_EG'],
  ['numbers-6-10', 'NUMBERS_6_10_WORDS_EG'],
  ['numbers-11-20', 'NUMBERS_11_20_WORDS_EG'],
  ['numbers-tens', 'NUMBERS_TENS_WORDS_EG'],
  ['numbers-100-1000', 'NUMBERS_100_1000_WORDS_EG'],
  ['numbers-phone', 'NUMBERS_PHONE_WORDS_EG'],
  ['numbers-prices', 'NUMBERS_PRICES_WORDS_EG'],
  ['numbers-time', 'NUMBERS_TIME_WORDS_EG'],
  ['numbers-age', 'NUMBERS_AGE_WORDS_EG'],
  ['numbers-together', 'NUMBERS_TOGETHER_WORDS_EG'],
] as const;

const EGYPTIAN_UNIT_5_LESSONS = [
  ['grammar-pronouns', 'GRAMMAR_PRONOUNS_WORDS_EG'],
  ['grammar-this-that', 'GRAMMAR_THIS_THAT_WORDS_EG'],
  ['grammar-possessives', 'GRAMMAR_POSSESSIVES_WORDS_EG'],
  ['grammar-questions', 'GRAMMAR_QUESTIONS_WORDS_EG'],
  ['grammar-negation', 'GRAMMAR_NEGATION_WORDS_EG'],
  ['grammar-present', 'GRAMMAR_PRESENT_WORDS_EG'],
  ['grammar-past', 'GRAMMAR_PAST_WORDS_EG'],
  ['grammar-future', 'GRAMMAR_FUTURE_WORDS_EG'],
  ['grammar-adjectives', 'GRAMMAR_ADJECTIVES_WORDS_EG'],
  ['grammar-prepositions', 'GRAMMAR_PREPOSITIONS_WORDS_EG'],
  ['grammar-sentences', 'GRAMMAR_SENTENCES_WORDS_EG'],
] as const;
const EGYPTIAN_UNIT_4_SOURCE_KEYS = new Set(EGYPTIAN_UNIT_4_LESSONS.map(([sourceKey]) => sourceKey));
const EGYPTIAN_UNIT_5_SOURCE_KEYS = new Set(EGYPTIAN_UNIT_5_LESSONS.map(([sourceKey]) => sourceKey));
const EGYPTIAN_UNIT_6_SCENARIOS = [
  ['cafe-order', 'EGYPTIAN_CAFE_ORDER_SCENARIO'],
  ['restaurant-order', 'EGYPTIAN_RESTAURANT_ORDER_SCENARIO'],
  ['everyday-supermarket', 'EGYPTIAN_SUPERMARKET_SCENARIO'],
  ['everyday-taxi', 'EGYPTIAN_TAXI_SCENARIO'],
  ['directions', 'EGYPTIAN_DIRECTIONS_SCENARIO'],
  ['everyday-pharmacy', 'EGYPTIAN_PHARMACY_SCENARIO'],
  ['phone-repair', 'EGYPTIAN_PHONE_REPAIR_SCENARIO'],
  ['everyday-hotel', 'EGYPTIAN_HOTEL_SCENARIO'],
  ['everyday-airport', 'EGYPTIAN_AIRPORT_SCENARIO'],
  ['phone-call', 'EGYPTIAN_PHONE_CALL_SCENARIO'],
] as const;
const EGYPTIAN_UNIT_6_SOURCE_KEYS = new Set(EGYPTIAN_UNIT_6_SCENARIOS.map(([sourceKey]) => sourceKey));

const EGYPTIAN_UNIT_7_LESSONS = [
  ['work-introduction', 'WORK_INTRODUCTION_WORDS_EG'],
  ['job-titles', 'JOB_TITLES_WORDS_EG'],
  ['workplace-places', 'WORKPLACE_PLACES_WORDS_EG'],
  ['office-objects', 'OFFICE_OBJECTS_WORDS_EG'],
  ['daily-routine', 'DAILY_ROUTINE_WORDS_EG'],
  ['schedules', 'SCHEDULES_WORDS_EG'],
  ['meetings', 'MEETINGS_WORDS_EG'],
  ['requests-at-work', 'REQUESTS_AT_WORK_WORDS_EG'],
  ['problems-at-work', 'PROBLEMS_AT_WORK_WORDS_EG'],
  ['workplace-conversation', 'WORKPLACE_CONVERSATION_WORDS_EG'],
] as const;
const EGYPTIAN_UNIT_7_SOURCE_KEYS = new Set(EGYPTIAN_UNIT_7_LESSONS.map(([sourceKey]) => sourceKey));

const EGYPTIAN_UNIT_8_SCENARIOS = [
  ['doctor-appointment', 'EGYPTIAN_DOCTOR_APPOINTMENT_SCENARIO'],
  ['hospital-reception', 'EGYPTIAN_HOSPITAL_RECEPTION_SCENARIO'],
  ['describing-pain', 'EGYPTIAN_DESCRIBING_PAIN_SCENARIO'],
  ['pharmacy-emergency', 'EGYPTIAN_PHARMACY_EMERGENCY_SCENARIO'],
  ['calling-ambulance', 'EGYPTIAN_CALLING_AMBULANCE_SCENARIO'],
  ['police-help', 'EGYPTIAN_POLICE_HELP_SCENARIO'],
  ['lost-phone', 'EGYPTIAN_LOST_PHONE_SCENARIO'],
  ['lost-child', 'EGYPTIAN_LOST_CHILD_SCENARIO'],
  ['car-problem', 'EGYPTIAN_CAR_PROBLEM_SCENARIO'],
  ['urgent-help', 'EGYPTIAN_URGENT_HELP_SCENARIO'],
] as const;
const EGYPTIAN_UNIT_8_SOURCE_KEYS = new Set(EGYPTIAN_UNIT_8_SCENARIOS.map(([sourceKey]) => sourceKey));

const EGYPTIAN_UNIT_9_LESSONS = [
  ['invitations', 'INVITATIONS_WORDS_EG'],
  ['accepting-and-refusing', 'ACCEPTING_REFUSING_WORDS_EG'],
  ['visiting-friends', 'VISITING_FRIENDS_WORDS_EG'],
  ['family-visit', 'FAMILY_VISIT_WORDS_EG'],
  ['cafe-with-friends', 'CAFE_WITH_FRIENDS_WORDS_EG'],
  ['football', 'FOOTBALL_WORDS_EG'],
  ['gaming', 'GAMING_WORDS_EG'],
  ['social-media', 'SOCIAL_MEDIA_WORDS_EG'],
  ['weekend-plans', 'WEEKEND_PLANS_WORDS_EG'],
  ['making-plans', 'MAKING_PLANS_WORDS_EG'],
] as const;
const EGYPTIAN_UNIT_9_SOURCE_KEYS = new Set(EGYPTIAN_UNIT_9_LESSONS.map(([sourceKey]) => sourceKey));

const EGYPTIAN_UNIT_10_SCENARIOS = [
  ['neighbor-visit', 'EGYPTIAN_NEIGHBOR_VISIT_SCENARIO'],
  ['brunch', 'EGYPTIAN_BRUNCH_SCENARIO'],
  ['road-trip', 'EGYPTIAN_ROAD_TRIP_SCENARIO'],
  ['birthday-invitation', 'EGYPTIAN_BIRTHDAY_INVITATION_SCENARIO'],
  ['birthday-party', 'EGYPTIAN_BIRTHDAY_PARTY_SCENARIO'],
  ['giving-a-gift', 'EGYPTIAN_GIVING_GIFT_SCENARIO'],
  ['taking-photos', 'EGYPTIAN_TAKING_PHOTOS_SCENARIO'],
  ['remembering-the-trip', 'EGYPTIAN_REMEMBERING_TRIP_SCENARIO'],
  ['saying-goodbye', 'EGYPTIAN_SAYING_GOODBYE_SCENARIO'],
  ['staying-in-touch', 'EGYPTIAN_STAYING_IN_TOUCH_SCENARIO'],
] as const;
const EGYPTIAN_UNIT_10_SOURCE_KEYS = new Set(EGYPTIAN_UNIT_10_SCENARIOS.map(([sourceKey]) => sourceKey));

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
        audioPath: word.audioPath ?? toRelativeAudioPath(word.audio) ?? `assets/audio/${folder}/${i + 1}.mp3`,
        audio: word.audio,
        voiceId: word.voiceId,
        modelId: word.modelId,
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
        audioPath: turn.audioPath ?? toRelativeAudioPath(turn.audio) ?? `assets/audio/${folder}/${filePrefix}${fileIndex}.mp3`,
        audio: turn.audio,
        voiceId: turn.voiceId,
        modelId: turn.modelId,
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

function buildMsaCurriculumTargets(): AudioTarget[] {
  const { MSA_CURRICULUM } = require('../data/curriculum/msa');
  const { getDialectContent } = require('../data/content-registry');
  const { resolveCurriculumItem } = require('../utils/content-resolver') as typeof import('../utils/content-resolver');
  const { ALPHABET_AUDIO_MSA, MSA_WRITING_EXAMPLE_WORDS } = require('../data/msa-alphabet-audio');
  const content = getDialectContent('msa');
  const targets: AudioTarget[] = [];
  let alphabetAdded = false;

  for (const unit of MSA_CURRICULUM.units) {
    const unitNumber = Number(unit.unitId.replace('unit-', ''));
    for (const item of unit.items) {
      const resolvedItem = resolveCurriculumItem(item, content);
      if (resolvedItem?.lessonWords) {
        targets.push(...buildLessonTargets('msa', item.contentId, resolvedItem.lessonWords, `msa/unit-${unitNumber}/${item.contentId}`)
          .map(target => ({ ...target, unit: unitNumber })));
      } else if (resolvedItem?.dialogue) {
        targets.push(...buildScenarioTargets('msa', item.contentId, resolvedItem.dialogue, `msa/unit-${unitNumber}/${item.contentId}`)
          .map(target => ({ ...target, unit: unitNumber })));
      } else if (item.contentType === 'writing' && !alphabetAdded) {
        alphabetAdded = true;
        targets.push(...ALPHABET_AUDIO_MSA.map((letter: any, index: number) => ({
          id: `msa:alphabet:${letter.id}`,
          dialect: 'msa' as const,
          kind: 'alphabet' as const,
          sourceKey: 'alphabet',
          index,
          line: index + 1,
          displayArabic: letter.displayArabic,
          audioText: letter.audioText,
          evalTarget: letter.evalTarget,
          transliteration: letter.transliteration,
          english: letter.english,
          audioPath: letter.audioPath,
          audio: letter.audio,
          unit: 3,
          voiceId: letter.voiceId,
          modelId: letter.modelId,
        })));
        targets.push(...buildLessonTargets('msa', 'writing-examples', MSA_WRITING_EXAMPLE_WORDS, 'msa/unit-3/writing-examples')
          .map(target => ({ ...target, unit: 3 })));
      }
    }
  }
  return targets;
}

export function getAudioCatalog(): AudioTarget[] {
  const words = require('../constants/words');
  const { BASIC_WORDS, GREETINGS_WORDS, INTRO_WORDS } = words;
  const gulfDialogues = require('../data/gulf-dialogues');
  const egyptianWords = require('../data/egyptian-words');
  const egyptianDialogues = require('../data/egyptian-dialogues');
  const egyptianUnit6 = require('../data/egyptian-unit6');
  const egyptianWork = require('../data/egyptian-work');
  const egyptianEmergencies = require('../data/egyptian-emergencies');
  const egyptianSocial = require('../data/egyptian-social');
  const egyptianFriends = require('../data/egyptian-friends');
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
    ...buildMsaCurriculumTargets(),
    ...buildLessonTargets('egyptian', 'basic-words', egyptianWords.BASIC_WORDS_EG ?? [], 'egyptian/basic-words'),
    ...buildLessonTargets('egyptian', 'greetings', egyptianWords.GREETINGS_WORDS_EG ?? [], 'egyptian/greetings'),
    ...buildLessonTargets('egyptian', 'intro', egyptianWords.INTRO_WORDS_EG ?? [], 'egyptian/intro'),
    ...EGYPTIAN_UNIT_4_LESSONS.flatMap(([sourceKey, exportName]) =>
      buildLessonTargets('egyptian', sourceKey, egyptianWords[exportName] ?? [], `egyptian/unit-4/${sourceKey}`),
    ),
    ...EGYPTIAN_UNIT_5_LESSONS.flatMap(([sourceKey, exportName]) =>
      buildLessonTargets('egyptian', sourceKey, egyptianWords[exportName] ?? [], `egyptian/unit-5/${sourceKey}`),
    ),
    ...EGYPTIAN_UNIT_6_SCENARIOS.flatMap(([sourceKey, exportName]) =>
      buildScenarioTargets('egyptian', sourceKey, egyptianUnit6[exportName]?.dialogue ?? [], `egyptian/unit-6/${sourceKey}`),
    ),
    ...EGYPTIAN_UNIT_7_LESSONS.flatMap(([sourceKey, exportName]) =>
      buildLessonTargets('egyptian', sourceKey, egyptianWork[exportName] ?? [], `egyptian/unit-7/${sourceKey}`),
    ),
    ...EGYPTIAN_UNIT_8_SCENARIOS.flatMap(([sourceKey, exportName]) =>
      buildScenarioTargets('egyptian', sourceKey, egyptianEmergencies[exportName]?.dialogue ?? [], `egyptian/unit-8/${sourceKey}`),
    ),
    ...EGYPTIAN_UNIT_9_LESSONS.flatMap(([sourceKey, exportName]) =>
      buildLessonTargets('egyptian', sourceKey, egyptianSocial[exportName] ?? [], `egyptian/unit-9/${sourceKey}`),
    ),
    ...EGYPTIAN_UNIT_10_SCENARIOS.flatMap(([sourceKey, exportName]) =>
      buildScenarioTargets('egyptian', sourceKey, egyptianFriends[exportName]?.dialogue ?? [], `egyptian/unit-10/${sourceKey}`),
    ),
    ...buildAlphabetTargets(),
    ...CORE_SCENARIOS.flatMap(([sourceKey, gulfExport]) =>
      buildScenarioTargets('gulf', sourceKey, gulfDialogues[gulfExport] ?? [], sourceKey),
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
        if (!UNIT_4_SOURCE_KEYS.has(target.sourceKey as any) && !EGYPTIAN_UNIT_4_SOURCE_KEYS.has(target.sourceKey as any)) return false;
      } else if (filter.sourceKey === 'unit-5') {
        if (!UNIT_5_SOURCE_KEYS.has(target.sourceKey as any) && !EGYPTIAN_UNIT_5_SOURCE_KEYS.has(target.sourceKey as any)) return false;
      } else if (filter.sourceKey === 'egyptian-unit-6') {
        if (target.dialect !== 'egyptian' || !EGYPTIAN_UNIT_6_SOURCE_KEYS.has(target.sourceKey as any)) return false;
      } else if (filter.sourceKey === 'egyptian-unit-7') {
        if (target.dialect !== 'egyptian' || !EGYPTIAN_UNIT_7_SOURCE_KEYS.has(target.sourceKey as any)) return false;
      } else if (filter.sourceKey === 'egyptian-unit-8') {
        if (target.dialect !== 'egyptian' || !EGYPTIAN_UNIT_8_SOURCE_KEYS.has(target.sourceKey as any)) return false;
      } else if (filter.sourceKey === 'egyptian-unit-9') {
        if (target.dialect !== 'egyptian' || !EGYPTIAN_UNIT_9_SOURCE_KEYS.has(target.sourceKey as any)) return false;
      } else if (filter.sourceKey === 'egyptian-unit-10') {
        if (target.dialect !== 'egyptian' || !EGYPTIAN_UNIT_10_SOURCE_KEYS.has(target.sourceKey as any)) return false;
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
