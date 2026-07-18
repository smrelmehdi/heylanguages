import type { CurriculumItem, DialectCurriculum } from './types';
import { buildSharedWritingItems } from './shared';
import {
  NUMBERS_100_1000_WORDS_EG,
  NUMBERS_11_20_WORDS_EG,
  NUMBERS_1_5_WORDS_EG,
  NUMBERS_6_10_WORDS_EG,
  NUMBERS_AGE_WORDS_EG,
  NUMBERS_PHONE_WORDS_EG,
  NUMBERS_PRICES_WORDS_EG,
  NUMBERS_TENS_WORDS_EG,
  NUMBERS_TIME_WORDS_EG,
  NUMBERS_TOGETHER_WORDS_EG,
} from '../egyptian-numbers';
import {
  GRAMMAR_ADJECTIVES_WORDS_EG,
  GRAMMAR_FUTURE_WORDS_EG,
  GRAMMAR_NEGATION_WORDS_EG,
  GRAMMAR_PAST_WORDS_EG,
  GRAMMAR_POSSESSIVES_WORDS_EG,
  GRAMMAR_PREPOSITIONS_WORDS_EG,
  GRAMMAR_PRESENT_WORDS_EG,
  GRAMMAR_PRONOUNS_WORDS_EG,
  GRAMMAR_QUESTIONS_WORDS_EG,
  GRAMMAR_SENTENCES_WORDS_EG,
  GRAMMAR_THIS_THAT_WORDS_EG,
} from '../egyptian-grammar';
import { EGYPTIAN_UNIT6_SCENARIOS } from '../egyptian-unit6';
import { EGYPTIAN_UNIT7_LESSONS } from '../egyptian-work';

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
  unitId: string,
  contentId: string,
  title: string,
  lessonKey: CurriculumItem['lessonKey'],
  lessonWords?: CurriculumItem['lessonWords'],
  commercialAccess: 'free' | 'premium' = 'free',
  subtitle?: string,
): CurriculumItem => ({
  dialect,
  unitId,
  contentId,
  contentType: 'lesson',
  title,
  subtitle: subtitle ?? (contentId === 'intro' ? '4 mins' : '3 mins'),
  route: { screen: 'lesson', params: { type: contentId } },
  homeHref: `/lesson?type=${contentId}`,
  availability: 'available',
  commercialAccess,
  lessonKey,
  lessonWords,
  acceptedTransliterationProfile: 'egyptian',
});

const scenario = (
  contentId: string,
  title: string,
  scenarioName: string,
  commercialAccess: 'free' | 'premium' = 'free',
  unitId = 'unit-2',
  metadata?: Pick<CurriculumItem, 'description' | 'setting' | 'objective' | 'sceneImageId' | 'sceneEntranceImageId'>,
): CurriculumItem => ({
  dialect,
  unitId,
  contentId,
  contentType: 'scenario',
  title,
  subtitle: scenarioName === 'Cafe' || scenarioName === 'Taxi' ? '4 mins' : '3 mins',
  route: { screen: 'scenario', params: { type: scenarioName } },
  homeHref: SCENARIO_HOME_HREFS[scenarioName] ?? `/scenario?type=${scenarioName}`,
  availability: 'available',
  commercialAccess,
  scenarioName,
  sceneImageKey: scenarioName,
  ...metadata,
  acceptedTransliterationProfile: 'egyptian',
});

const quiz = (
  unitId: string,
  contentId: string,
  title: string,
  quizUnit: string | undefined,
  screen: 'quiz' | 'quiz-unit2',
  commercialAccess: 'free' | 'premium' = 'free',
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
  commercialAccess,
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
        lesson('unit-1', 'basic_words', 'Basic Words', 'basic'),
        lesson('unit-1', 'greetings', 'Common Greetings', 'greetings'),
        lesson('unit-1', 'intro', 'Introduce Yourself', 'intro'),
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
    {
      dialect,
      unitId: 'unit-4',
      title: 'Unit 4: Numbers & Counting',
      availability: 'available',
      items: [
        lesson('unit-4', 'numbers-1-5', 'Numbers 1-5', undefined, NUMBERS_1_5_WORDS_EG, 'free'),
        lesson('unit-4', 'numbers-6-10', 'Numbers 6-10', undefined, NUMBERS_6_10_WORDS_EG, 'free'),
        lesson('unit-4', 'numbers-11-20', 'Numbers 11-20', undefined, NUMBERS_11_20_WORDS_EG, 'free'),
        lesson('unit-4', 'numbers-tens', 'Tens', undefined, NUMBERS_TENS_WORDS_EG, 'premium'),
        lesson('unit-4', 'numbers-100-1000', 'Hundreds & Thousands', undefined, NUMBERS_100_1000_WORDS_EG, 'premium'),
        lesson('unit-4', 'numbers-phone', 'Phone Numbers', undefined, NUMBERS_PHONE_WORDS_EG, 'premium'),
        lesson('unit-4', 'numbers-prices', 'Prices & Money', undefined, NUMBERS_PRICES_WORDS_EG, 'premium'),
        lesson('unit-4', 'numbers-time', 'Telling the Time', undefined, NUMBERS_TIME_WORDS_EG, 'premium'),
        lesson('unit-4', 'numbers-age', 'Talking About Age', undefined, NUMBERS_AGE_WORDS_EG, 'premium'),
        lesson('unit-4', 'numbers-together', 'Putting Numbers Together', undefined, NUMBERS_TOGETHER_WORDS_EG, 'premium'),
        quiz('unit-4', 'quiz_u4', 'Unit 4 Quiz', '4', 'quiz-unit2', 'premium'),
      ],
    },
    {
      dialect,
      unitId: 'unit-5',
      title: 'Unit 5: Grammar Basics',
      availability: 'available',
      items: [
        lesson('unit-5', 'grammar-pronouns', 'Pronouns', undefined, GRAMMAR_PRONOUNS_WORDS_EG, 'free'),
        lesson('unit-5', 'grammar-this-that', 'This & That', undefined, GRAMMAR_THIS_THAT_WORDS_EG, 'free'),
        lesson('unit-5', 'grammar-possessives', 'My, Your, His, Her', undefined, GRAMMAR_POSSESSIVES_WORDS_EG, 'free'),
        lesson('unit-5', 'grammar-questions', 'Asking Questions', undefined, GRAMMAR_QUESTIONS_WORDS_EG, 'premium'),
        lesson('unit-5', 'grammar-negation', 'Negation', undefined, GRAMMAR_NEGATION_WORDS_EG, 'premium'),
        lesson('unit-5', 'grammar-present', 'Present Tense', undefined, GRAMMAR_PRESENT_WORDS_EG, 'premium'),
        lesson('unit-5', 'grammar-past', 'Past Tense', undefined, GRAMMAR_PAST_WORDS_EG, 'premium'),
        lesson('unit-5', 'grammar-future', 'Future Tense', undefined, GRAMMAR_FUTURE_WORDS_EG, 'premium'),
        lesson('unit-5', 'grammar-adjectives', 'Adjectives', undefined, GRAMMAR_ADJECTIVES_WORDS_EG, 'premium'),
        lesson('unit-5', 'grammar-prepositions', 'Prepositions', undefined, GRAMMAR_PREPOSITIONS_WORDS_EG, 'premium'),
        lesson('unit-5', 'grammar-sentences', 'Building Sentences', undefined, GRAMMAR_SENTENCES_WORDS_EG, 'premium'),
        quiz('unit-5', 'quiz_u5', 'Unit 5 Quiz', '5', 'quiz-unit2', 'premium'),
      ],
    },
    {
      dialect,
      unitId: 'unit-6',
      title: 'Unit 6: Everyday Scenarios',
      availability: 'available',
      items: [
        ...EGYPTIAN_UNIT6_SCENARIOS.map(item => scenario(
          item.contentId,
          item.title,
          item.scenarioName,
          'premium',
          'unit-6',
          {
            description: item.description,
            setting: item.setting,
            objective: item.objective,
            sceneImageId: item.imageId,
            sceneEntranceImageId: item.entranceImageId,
          },
        )),
        quiz('unit-6', 'quiz_u6', 'Unit 6 Quiz', '6', 'quiz-unit2', 'premium'),
      ],
    },
    {
      dialect,
      unitId: 'unit-7',
      title: 'Unit 7: Work & Daily Life',
      availability: 'available',
      items: [
        ...EGYPTIAN_UNIT7_LESSONS.map(item => lesson(
          'unit-7',
          item.contentId,
          item.title,
          undefined,
          item.words,
          'premium',
          '4 mins',
        )),
        quiz('unit-7', 'quiz_u7', 'Unit 7 Quiz', '7', 'quiz-unit2', 'premium'),
      ],
    },
    { dialect, unitId: 'unit-8', title: 'Unit 8: Emergencies & Help', availability: 'unavailable', items: [] },
    { dialect, unitId: 'unit-9', title: 'Unit 9: Social & Culture', availability: 'unavailable', items: [] },
    { dialect, unitId: 'unit-10', title: 'Unit 10: Making Friends', availability: 'unavailable', items: [] },
  ],
};
