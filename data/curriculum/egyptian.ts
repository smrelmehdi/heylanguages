import type { CurriculumItem, DialectCurriculum } from './types';
import { buildSharedWritingItems } from './shared';

const dialect = 'egyptian' as const;

const SCENARIO_HOME_HREFS: Record<string, string> = {
  Cafe: '/scenario-intro?type=Cafe',
  Taxi: '/scenario-intro-taxi',
  Hotel: '/scenario-intro-hotel',
  Restaurant: '/scenario-intro-restaurant',
  Supermarket: '/scenario-intro-supermarket',
  Pharmacy: '/scenario-intro-pharmacy',
  Barbershop: '/scenario-intro-barbershop',
  Airport: '/scenario-intro-airport',
};

const lesson = (
  contentId: string,
  title: string,
  lessonKey: CurriculumItem['lessonKey'],
): CurriculumItem => ({
  dialect,
  unitId: 'unit-1',
  contentId,
  contentType: 'lesson',
  title,
  subtitle: contentId === 'intro' ? '4 mins' : '3 mins',
  route: { screen: 'lesson', params: { type: contentId } },
  homeHref: `/lesson?type=${contentId}`,
  availability: 'available',
  commercialAccess: 'free',
  lessonKey,
  acceptedTransliterationProfile: 'egyptian',
});

const scenario = (
  contentId: string,
  title: string,
  scenarioName: string,
): CurriculumItem => ({
  dialect,
  unitId: 'unit-2',
  contentId,
  contentType: 'scenario',
  title,
  subtitle: scenarioName === 'Cafe' || scenarioName === 'Taxi' ? '4 mins' : '3 mins',
  route: { screen: 'scenario', params: { type: scenarioName } },
  homeHref: SCENARIO_HOME_HREFS[scenarioName] ?? `/scenario?type=${scenarioName}`,
  availability: 'available',
  commercialAccess: 'free',
  scenarioName,
  sceneImageKey: scenarioName,
  acceptedTransliterationProfile: 'egyptian',
});

const quiz = (
  unitId: string,
  contentId: string,
  title: string,
  quizUnit: string | undefined,
  screen: 'quiz' | 'quiz-unit2',
): CurriculumItem => ({
  dialect,
  unitId,
  contentId,
  contentType: 'quiz',
  title,
  subtitle:
    contentId === 'quiz_u1' ? 'Test what you learned · +150 XP' :
    contentId === 'quiz_u2_p1' ? 'Café, Taxi, Hotel · +150 XP' :
    contentId === 'quiz_u2_p2' ? 'Restaurant, Supermarket, Pharmacy · +150 XP' :
    undefined,
  route: { screen, params: quizUnit ? { unit: quizUnit } : {} },
  homeHref: screen === 'quiz'
    ? (quizUnit ? `/quiz?unit=${quizUnit}` : '/quiz')
    : `/quiz-unit2?unit=${quizUnit}`,
  availability: 'available',
  commercialAccess: 'free',
  quizUnit,
  acceptedTransliterationProfile: 'egyptian',
});

export const EGYPTIAN_CURRICULUM: DialectCurriculum = {
  dialect,
  units: [
    {
      dialect,
      unitId: 'unit-1',
      title: 'Unit 1: First Words',
      availability: 'available',
      items: [
        lesson('basic_words', 'Basic Words', 'basic'),
        lesson('greetings', 'Common Greetings', 'greetings'),
        lesson('intro', 'Introduce Yourself', 'intro'),
        quiz('unit-1', 'quiz_u1', 'Unit 1 Quiz', undefined, 'quiz'),
      ],
    },
    {
      dialect,
      unitId: 'unit-2',
      title: 'Unit 2: Real Life Situations',
      availability: 'available',
      items: [
        scenario('cafe', 'Café Ordering', 'Cafe'),
        scenario('taxi', 'Taxi Ride', 'Taxi'),
        scenario('hotel', 'Hotel Check-in', 'Hotel'),
        quiz('unit-2', 'quiz_u2_p1', 'Unit 2 Quiz · Part 1', '2p1', 'quiz-unit2'),
        scenario('restaurant', 'Restaurant', 'Restaurant'),
        scenario('supermarket', 'Supermarket', 'Supermarket'),
        scenario('pharmacy', 'Pharmacy', 'Pharmacy'),
        quiz('unit-2', 'quiz_u2_p2', 'Unit 2 Quiz · Part 2', '2p2', 'quiz-unit2'),
        scenario('barbershop', 'Barbershop', 'Barbershop'),
        scenario('airport', 'Airport', 'Airport'),
      ],
    },
    {
      dialect,
      unitId: 'unit-3',
      title: 'Unit 3: Arabic Writing',
      availability: 'shared',
      items: [...buildSharedWritingItems(dialect)],
    },
    { dialect, unitId: 'unit-4', title: 'Unit 4: Numbers & Counting', availability: 'unavailable', items: [] },
    { dialect, unitId: 'unit-5', title: 'Unit 5: Grammar Basics', availability: 'unavailable', items: [] },
    { dialect, unitId: 'unit-6', title: 'Unit 6: Daily Life Scenarios', availability: 'unavailable', items: [] },
    { dialect, unitId: 'unit-7', title: 'Unit 7: Work & Business', availability: 'unavailable', items: [] },
    { dialect, unitId: 'unit-8', title: 'Unit 8: Emergencies & Help', availability: 'unavailable', items: [] },
    { dialect, unitId: 'unit-9', title: 'Unit 9: Social & Culture', availability: 'unavailable', items: [] },
    { dialect, unitId: 'unit-10', title: 'Unit 10: Making Friends', availability: 'unavailable', items: [] },
  ],
};
