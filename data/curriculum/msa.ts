import type { CurriculumItem, CurriculumUnit, DialectCurriculum, Unit1BlueprintRole } from './types';
import { buildSharedWritingItems } from './shared';
import {
  MSA_DESCRIBE_THE_WORLD_DEFINITION,
  MSA_EVERYDAY_OBJECTS_DEFINITION,
  MSA_FIRST_ARABIC_WORDS_DEFINITION,
  MSA_FOOD_AND_DRINKS_DEFINITION,
  MSA_NUMBERS_AND_MONEY_DEFINITION,
  MSA_PEOPLE_AROUND_YOU_DEFINITION,
  MSA_POLITE_LIKE_A_LOCAL_DEFINITION,
  MSA_WHERE_HERE_THERE_DEFINITION,
  MSA_INTRODUCE_YOURSELF_DEFINITION,
  MSA_HOW_ARE_YOU_DEFINITION,
  MSA_BIG_REVIEW_DEFINITION,
  MSA_FIRST_CAFE_CONVERSATION_DEFINITION,
  MSA_FIRST_ARABIC_CHALLENGE_DEFINITION,
} from '../msa-unit1';
import { MSA_UNIT2_SCENARIOS } from '../msa-dialogues';
import { MSA_UNIT4_LESSONS } from '../msa-numbers';
import { MSA_UNIT5_LESSONS } from '../msa-grammar';
import { MSA_UNIT6_SCENARIOS } from '../msa-unit6';
import { MSA_UNIT7_LESSONS } from '../msa-work';
import { MSA_UNIT8_SCENARIOS } from '../msa-emergencies';
import { MSA_UNIT9_LESSONS } from '../msa-social';
import { MSA_UNIT10_SCENARIOS } from '../msa-friends';
import { buildLegacyUnit1CurriculumUnit, buildUnit1MissionItems } from './unit1';
import { buildMissionItems } from './unit1';
import { MSA_UNIT2_V2_DEFINITIONS } from '../msa-unit2-v2';

const dialect = 'msa' as const;

export type MsaUnit1CurriculumVersion = 'legacy' | 'v2';
export type MsaUnit2CurriculumVersion = 'legacy' | 'v2';

type MsaUnit1BlueprintEntry = {
  missionId: string;
  role: Unit1BlueprintRole;
};

/**
 * Final MSA Unit 1 v2 order. Legacy rows remain in the legacy curriculum and
 * content registry, but are intentionally not visible here.
 */
export const MSA_UNIT1_V2_BLUEPRINT: readonly MsaUnit1BlueprintEntry[] = [
  { missionId: 'first_arabic_words', role: 'native_mission' },
  { missionId: 'polite_like_a_local', role: 'native_mission' },
  { missionId: 'people_around_you', role: 'native_mission' },
  { missionId: 'everyday_objects', role: 'native_mission' },
  { missionId: 'food_and_drinks', role: 'native_mission' },
  { missionId: 'describe_the_world', role: 'native_mission' },
  { missionId: 'numbers_and_money', role: 'native_mission' },
  { missionId: 'where_here_there', role: 'native_mission' },
  { missionId: 'introduce_yourself', role: 'native_mission' },
  { missionId: 'how_are_you', role: 'native_mission' },
  { missionId: 'big_review', role: 'native_mission' },
  { missionId: 'first_cafe_conversation', role: 'native_mission' },
  { missionId: 'first_arabic_challenge', role: 'native_mission' },
];

export function resolveMsaUnit1CurriculumVersion({
  requestedVersion = process.env.EXPO_PUBLIC_MSA_UNIT1_CURRICULUM_VERSION,
  appEnv = process.env.EXPO_PUBLIC_APP_ENV,
  isLocalDevelopment = (globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ === true,
}: {
  requestedVersion?: string;
  appEnv?: string;
  isLocalDevelopment?: boolean;
} = {}): MsaUnit1CurriculumVersion {
  if (requestedVersion !== 'v2' || appEnv === 'production') return 'legacy';
  if (appEnv === 'development' || appEnv === 'preview') return 'v2';
  return isLocalDevelopment ? 'v2' : 'legacy';
}

export function buildMsaUnit1CurriculumUnit(
  version: MsaUnit1CurriculumVersion = resolveMsaUnit1CurriculumVersion(),
): CurriculumUnit {
  const legacyUnit = buildLegacyUnit1CurriculumUnit({
    dialect,
    acceptedTransliterationProfile: 'msa',
    quizScreen: 'quiz-unit2',
    quizUnit: '1',
    quizSubtitle: 'Test what you learned',
  });
  if (version === 'legacy') return legacyUnit;

  const nativeItems = buildUnit1MissionItems(
    dialect,
    [
      MSA_FIRST_ARABIC_WORDS_DEFINITION,
      MSA_POLITE_LIKE_A_LOCAL_DEFINITION,
      MSA_PEOPLE_AROUND_YOU_DEFINITION,
      MSA_EVERYDAY_OBJECTS_DEFINITION,
      MSA_FOOD_AND_DRINKS_DEFINITION,
      MSA_DESCRIBE_THE_WORLD_DEFINITION,
      MSA_NUMBERS_AND_MONEY_DEFINITION,
      MSA_WHERE_HERE_THERE_DEFINITION,
      MSA_INTRODUCE_YOURSELF_DEFINITION,
      MSA_HOW_ARE_YOU_DEFINITION,
      MSA_BIG_REVIEW_DEFINITION,
      MSA_FIRST_CAFE_CONVERSATION_DEFINITION,
      MSA_FIRST_ARABIC_CHALLENGE_DEFINITION,
    ],
    'msa',
  );
  const itemsById = new Map(
    nativeItems.map(item => [item.contentId, item]),
  );

  return {
    ...legacyUnit,
    items: MSA_UNIT1_V2_BLUEPRINT.map(entry => {
      const item = itemsById.get(entry.missionId);
      if (!item) throw new Error(`Missing MSA Unit 1 blueprint item: ${entry.missionId}`);
      return { ...item, unit1BlueprintRole: entry.role };
    }),
  };
}

export function resolveMsaUnit2CurriculumVersion({
  requestedVersion = process.env.EXPO_PUBLIC_MSA_UNIT2_CURRICULUM_VERSION,
  appEnv = process.env.EXPO_PUBLIC_APP_ENV,
  isLocalDevelopment = (globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ === true,
}: { requestedVersion?: string; appEnv?: string; isLocalDevelopment?: boolean } = {}): MsaUnit2CurriculumVersion {
  if (requestedVersion !== 'v2' || appEnv === 'production') return 'legacy';
  if (appEnv === 'development' || appEnv === 'preview') return 'v2';
  return isLocalDevelopment ? 'v2' : 'legacy';
}

export function buildMsaUnit2CurriculumUnit(version: MsaUnit2CurriculumVersion = resolveMsaUnit2CurriculumVersion()): CurriculumUnit {
  if (version === 'legacy') return { dialect, unitId: 'unit-2', title: 'Unit 2: Everyday Situations', availability: 'available', items: [
    ...MSA_UNIT2_SCENARIOS.map(item => scenario('unit-2', item, 'free')),
    quiz(2, 'free'),
  ] };
  return {
    dialect,
    unitId: 'unit-2',
    title: 'Build Short Sentences',
    subtitle: 'Combine words for everyday life at home.',
    availability: 'available',
    items: buildMissionItems(dialect, 'unit-2', MSA_UNIT2_V2_DEFINITIONS, 'msa'),
  };
}

const lesson = (
  unitId: string,
  contentId: string,
  title: string,
  lessonWords?: CurriculumItem['lessonWords'],
  contentRef?: CurriculumItem['contentRef'],
  commercialAccess: 'free' | 'premium' = 'free',
): CurriculumItem => ({
  dialect, unitId, contentId, contentType: 'lesson', title, subtitle: contentId === 'intro' ? '4 mins' : '3 mins',
  route: { screen: 'lesson', params: { type: contentId } }, homeHref: `/lesson?type=${contentId}`,
  availability: 'available', commercialAccess, contentRef, lessonWords, acceptedTransliterationProfile: 'msa',
});

const scenario = (
  unitId: string,
  item: { contentId: string; scenarioName: string; title: string; description: string; setting: string; objective: string; imageKey: string; entranceImageKey?: string },
  commercialAccess: 'free' | 'premium',
): CurriculumItem => ({
  dialect, unitId, contentId: item.contentId, contentType: 'scenario', title: item.title, subtitle: '4 mins',
  route: { screen: 'scenario', params: { type: item.scenarioName } }, homeHref: `/scenario?type=${item.scenarioName}`,
  availability: 'available', commercialAccess, scenarioName: item.scenarioName, sceneImageKey: item.imageKey,
  sceneEntranceImageId: item.entranceImageKey,
  description: item.description, setting: item.setting, objective: item.objective, acceptedTransliterationProfile: 'msa',
});

const quiz = (unit: number, commercialAccess: 'free' | 'premium'): CurriculumItem => ({
  dialect, unitId: `unit-${unit}`, contentId: `quiz_u${unit}`, contentType: 'quiz', title: `Unit ${unit} Quiz`,
  subtitle: 'Test what you learned', route: { screen: 'quiz-unit2', params: { unit: String(unit) } },
  homeHref: `/quiz-unit2?unit=${unit}`, availability: 'available', commercialAccess,
  quizUnit: String(unit), acceptedTransliterationProfile: 'msa',
});

const lessonItems = (
  unit: number,
  items: ReadonlyArray<{ contentId: string; title: string; words: CurriculumItem['lessonWords'] } | readonly [string, string, CurriculumItem['lessonWords']]>,
  freePreviewCount = 0,
) => items.map((item, index) => {
  const [contentId, title, words] = 'contentId' in item
    ? [item.contentId, item.title, item.words]
    : item;
  return lesson(`unit-${unit}`, contentId, title, words, undefined, index < freePreviewCount ? 'free' : 'premium');
});

export const MSA_CURRICULUM: DialectCurriculum = {
  dialect,
  units: [
    buildMsaUnit1CurriculumUnit(),
    buildMsaUnit2CurriculumUnit(),
    { dialect, unitId: 'unit-3', title: 'Unit 3: Arabic Writing', availability: 'shared', items: [
      ...buildSharedWritingItems(dialect), quiz(3, 'free'),
    ] },
    { dialect, unitId: 'unit-4', title: 'Unit 4: Numbers & Counting', availability: 'available', items: [
      ...lessonItems(4, MSA_UNIT4_LESSONS, 3), quiz(4, 'premium'),
    ] },
    { dialect, unitId: 'unit-5', title: 'Unit 5: Grammar Basics', availability: 'available', items: [
      ...lessonItems(5, MSA_UNIT5_LESSONS, 3), quiz(5, 'premium'),
    ] },
    { dialect, unitId: 'unit-6', title: 'Unit 6: Practical Scenarios', availability: 'available', items: [
      ...MSA_UNIT6_SCENARIOS.map(item => scenario('unit-6', item, 'premium')), quiz(6, 'premium'),
    ] },
    { dialect, unitId: 'unit-7', title: 'Unit 7: Work & Daily Life', availability: 'available', items: [
      ...lessonItems(7, MSA_UNIT7_LESSONS), quiz(7, 'premium'),
    ] },
    { dialect, unitId: 'unit-8', title: 'Unit 8: Emergencies & Help', availability: 'available', items: [
      ...MSA_UNIT8_SCENARIOS.map(item => scenario('unit-8', item, 'premium')), quiz(8, 'premium'),
    ] },
    { dialect, unitId: 'unit-9', title: 'Unit 9: Social Life', availability: 'available', items: [
      ...lessonItems(9, MSA_UNIT9_LESSONS), quiz(9, 'premium'),
    ] },
    { dialect, unitId: 'unit-10', title: 'Unit 10: Friends, Celebrations & Farewell', availability: 'available', items: [
      ...MSA_UNIT10_SCENARIOS.map(item => scenario('unit-10', item, 'premium')), quiz(10, 'premium'),
    ] },
  ],
};
