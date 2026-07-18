import type { CurriculumItem, DialectCurriculum } from './types';
import { buildSharedWritingItems } from './shared';
import { MSA_UNIT2_SCENARIOS } from '../msa-dialogues';
import { MSA_UNIT4_LESSONS } from '../msa-numbers';
import { MSA_UNIT5_LESSONS } from '../msa-grammar';
import { MSA_UNIT6_SCENARIOS } from '../msa-unit6';
import { MSA_UNIT7_LESSONS } from '../msa-work';
import { MSA_UNIT8_SCENARIOS } from '../msa-emergencies';
import { MSA_UNIT9_LESSONS } from '../msa-social';
import { MSA_UNIT10_SCENARIOS } from '../msa-friends';

const dialect = 'msa' as const;

const lesson = (
  unitId: string,
  contentId: string,
  title: string,
  lessonWords?: CurriculumItem['lessonWords'],
  lessonKey?: CurriculumItem['lessonKey'],
  commercialAccess: 'free' | 'premium' = 'free',
): CurriculumItem => ({
  dialect, unitId, contentId, contentType: 'lesson', title, subtitle: contentId === 'intro' ? '4 mins' : '3 mins',
  route: { screen: 'lesson', params: { type: contentId } }, homeHref: `/lesson?type=${contentId}`,
  availability: 'available', commercialAccess, lessonKey, lessonWords, acceptedTransliterationProfile: 'msa',
});

const scenario = (
  unitId: string,
  item: { contentId: string; scenarioName: string; title: string; description: string; setting: string; objective: string; imageKey: string },
  commercialAccess: 'free' | 'premium',
): CurriculumItem => ({
  dialect, unitId, contentId: item.contentId, contentType: 'scenario', title: item.title, subtitle: '4 mins',
  route: { screen: 'scenario', params: { type: item.scenarioName } }, homeHref: `/scenario?type=${item.scenarioName}`,
  availability: 'available', commercialAccess, scenarioName: item.scenarioName, sceneImageKey: item.imageKey,
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
    { dialect, unitId: 'unit-1', title: 'Unit 1: First Words', availability: 'available', items: [
      lesson('unit-1', 'basic_words', 'Basic Words', undefined, 'basic'),
      lesson('unit-1', 'greetings', 'Common Greetings', undefined, 'greetings'),
      lesson('unit-1', 'intro', 'Introduce Yourself', undefined, 'intro'),
      quiz(1, 'free'),
    ] },
    { dialect, unitId: 'unit-2', title: 'Unit 2: Everyday Situations', availability: 'available', items: [
      ...MSA_UNIT2_SCENARIOS.map(item => scenario('unit-2', item, 'free')),
      quiz(2, 'free'),
    ] },
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
