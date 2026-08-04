import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import type { Word } from '../constants/words';
import type { DialectContent, DialogueTurn } from '../data/content-registry';
import type { CurriculumItem, SupportedDialect } from '../data/curriculum';

(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = true;
process.env.EXPO_PUBLIC_SUPABASE_URL ??= 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??= 'test-anon-key';
delete process.env.EXPO_PUBLIC_MSA_UNIT1_CURRICULUM_VERSION;

const extensions = (Module as typeof Module & {
  _extensions: Record<string, (module: { exports: unknown }, filename: string) => void>;
})._extensions;
for (const extension of ['.mp3', '.png', '.jpg', '.jpeg', '.webp']) {
  extensions[extension] = (module, filename) => {
    module.exports = filename;
  };
}

const moduleLoader = Module as typeof Module & {
  _load: (request: string, parent: unknown, isMain: boolean) => unknown;
};
const originalLoad = moduleLoader._load;
moduleLoader._load = function loadForMissionTests(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') {
    return {
      __esModule: true,
      default: {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
      },
    };
  }
  if (request === 'expo-asset') {
    return {
      Asset: {
        fromModule: (assetId: number) => ({
          hash: `asset-${assetId}`,
          name: `asset-${assetId}`,
          type: 'mp3',
          uri: `bundle://${assetId}`,
          localUri: `bundle://${assetId}`,
          downloadAsync: async () => {},
        }),
      },
    };
  }
  if (request === 'expo-file-system/legacy') {
    return {
      documentDirectory: 'file:///documents/',
      getInfoAsync: async () => ({ exists: false }),
      readDirectoryAsync: async () => [],
      makeDirectoryAsync: async () => {},
      copyAsync: async () => {},
      moveAsync: async () => {},
      deleteAsync: async () => {},
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const { getDialectContent } = require('../data/content-registry') as typeof import('../data/content-registry');
const {
  MSA_DESCRIBE_THE_WORLD,
  MSA_DESCRIBE_THE_WORLD_MISSION,
  MSA_DESCRIBE_THE_WORLD_ROUNDS,
  MSA_EVERYDAY_OBJECTS,
  MSA_EVERYDAY_OBJECTS_MISSION,
  MSA_EVERYDAY_OBJECTS_ROUNDS,
  MSA_FIRST_ARABIC_WORDS,
  MSA_FIRST_ARABIC_WORDS_MISSION,
  MSA_FIRST_ARABIC_WORDS_ROUNDS,
  MSA_FOOD_AND_DRINKS,
  MSA_FOOD_AND_DRINKS_MISSION,
  MSA_FOOD_AND_DRINKS_ROUNDS,
  MSA_NUMBERS_AND_MONEY,
  MSA_NUMBERS_AND_MONEY_MISSION,
  MSA_NUMBERS_AND_MONEY_ROUNDS,
  MSA_PEOPLE_AROUND_YOU,
  MSA_PEOPLE_AROUND_YOU_MISSION,
  MSA_PEOPLE_AROUND_YOU_ROUNDS,
  MSA_POLITE_LIKE_A_LOCAL,
  MSA_POLITE_LIKE_A_LOCAL_MISSION,
  MSA_POLITE_LIKE_A_LOCAL_ROUNDS,
  MSA_WHERE_HERE_THERE,
  MSA_WHERE_HERE_THERE_MISSION,
  MSA_WHERE_HERE_THERE_ROUNDS,
  MSA_INTRODUCE_YOURSELF_MISSION,
  MSA_HOW_ARE_YOU_MISSION,
  MSA_BIG_REVIEW_MISSION,
  MSA_FIRST_CAFE_CONVERSATION_MISSION,
  MSA_FIRST_ARABIC_CHALLENGE_MISSION,
} = require('../data/msa-unit1') as typeof import('../data/msa-unit1');
const {
  buildUnit1MissionItems,
  createMissionContentRegistry,
  getDialectCurriculum,
  getMissionContentType,
  LEGACY_UNIT1_MISSION_IDS,
} = require('../data/curriculum') as typeof import('../data/curriculum');
const {
  buildMsaUnit1CurriculumUnit,
  MSA_UNIT1_V2_BLUEPRINT,
  resolveMsaUnit1CurriculumVersion,
} = require('../data/curriculum/msa') as typeof import('../data/curriculum/msa');
const {
  getDialectCurriculumItems,
  getDialectContentMeta,
  resolveContent,
  resolveCurriculumItem,
  shouldReserveScenarioImageSpace,
} = require('../utils/content-resolver') as typeof import('../utils/content-resolver');
const {
  getContentAccess,
  getScenarioContentId,
} = require('../utils/access') as typeof import('../utils/access');
const {
  buildCompletionKey,
  getCompletionKeyCandidates,
  getPreviousProgressionContentIdFromItems,
} = require('../utils/progression') as typeof import('../utils/progression');
const { buildOfflineManifestFilesForCurriculum } = require('../utils/offline-pack') as typeof import('../utils/offline-pack');
const {
  buildMissionSrsItemId,
  buildMissionVocabularySrsItemId,
} = require('../utils/srs') as typeof import('../utils/srs');
const { buildPhase1ReviewQuestions } = require('../utils/phase1-review') as typeof import('../utils/phase1-review');
const { buildCurriculumWordUnitIndex } = require('../utils/curriculum-memory') as typeof import('../utils/curriculum-memory');
const { getQuizPassedAtThreshold } = require('../utils/quiz-scoring') as typeof import('../utils/quiz-scoring');
const { buildMsaBigReviewQuestions, buildMsaFirstArabicChallengeQuestions } = require('../data/msa-unit1-quizzes') as typeof import('../data/msa-unit1-quizzes');
const { GULF_UNIT1_MISSIONS, GULF_FIRST_CAFE_DIALOGUE } = require('../data/gulf-unit1') as typeof import('../data/gulf-unit1');
const { buildGulfBigReviewQuestions, buildGulfFirstArabicChallengeQuestions } = require('../data/gulf-unit1-quizzes') as typeof import('../data/gulf-unit1-quizzes');
const { buildGulfUnit1CurriculumUnit, resolveGulfUnit1CurriculumVersion } = require('../data/curriculum/gulf') as typeof import('../data/curriculum/gulf');
const { buildEgyptianUnit1CurriculumUnit, resolveEgyptianUnit1CurriculumVersion } = require('../data/curriculum/egyptian') as typeof import('../data/curriculum/egyptian');
const { EGYPTIAN_FIRST_CAFE_DIALOGUE } = require('../data/egyptian-unit1') as typeof import('../data/egyptian-unit1');
const { buildEgyptianBigReviewQuestions, buildEgyptianFirstArabicChallengeQuestions } = require('../data/egyptian-unit1-quizzes') as typeof import('../data/egyptian-unit1-quizzes');
const { MSA_UNIT2_V2_DEFINITIONS } = require('../data/msa-unit2-v2') as typeof import('../data/msa-unit2-v2');
const { GULF_UNIT2_V2_DEFINITIONS } = require('../data/gulf-unit2-v2') as typeof import('../data/gulf-unit2-v2');
const { EGYPTIAN_UNIT2_V2_DEFINITIONS } = require('../data/egyptian-unit2-v2') as typeof import('../data/egyptian-unit2-v2');
const { getMissionDisplayTitle, getMissionIconKey, hasUnsafeMissionTitleGlyph } = require('../utils/mission-display') as typeof import('../utils/mission-display');

const DIALECTS: SupportedDialect[] = ['gulf', 'egyptian', 'msa'];
const LEGACY_LESSON_KEYS = ['basic', 'greetings', 'intro'] as const;
const MSA_V2_NATIVE_MISSION_IDS = [
  'first_arabic_words',
  'polite_like_a_local',
  'people_around_you',
  'everyday_objects',
  'food_and_drinks',
  'describe_the_world',
  'numbers_and_money',
  'where_here_there',
  'introduce_yourself',
  'how_are_you',
  'big_review',
  'first_cafe_conversation',
  'first_arabic_challenge',
] as const;
const MSA_V2_FINAL_ORDER = MSA_V2_NATIVE_MISSION_IDS;

function testMsaV2FlagSafetyAndBridge() {
  assert.equal(resolveMsaUnit1CurriculumVersion(), 'legacy');
  assert.equal(resolveMsaUnit1CurriculumVersion({
    requestedVersion: 'v2',
    appEnv: 'production',
    isLocalDevelopment: true,
  }), 'legacy');
  assert.equal(resolveMsaUnit1CurriculumVersion({
    requestedVersion: 'v2',
    appEnv: 'development',
    isLocalDevelopment: false,
  }), 'v2');
  assert.equal(resolveMsaUnit1CurriculumVersion({
    requestedVersion: 'v2',
    appEnv: 'preview',
    isLocalDevelopment: false,
  }), 'v2');
  assert.equal(resolveMsaUnit1CurriculumVersion({
    requestedVersion: 'v2',
    appEnv: 'staging',
    isLocalDevelopment: false,
  }), 'legacy');
  assert.equal(resolveMsaUnit1CurriculumVersion({
    requestedVersion: 'v2',
    isLocalDevelopment: false,
  }), 'legacy');
  assert.equal(resolveMsaUnit1CurriculumVersion({
    requestedVersion: 'v2',
    isLocalDevelopment: true,
  }), 'v2');
  assert.equal(resolveMsaUnit1CurriculumVersion({
    requestedVersion: 'V2',
    appEnv: 'development',
    isLocalDevelopment: true,
  }), 'legacy');

  const legacyUnit = buildMsaUnit1CurriculumUnit('legacy');
  const v2Unit = buildMsaUnit1CurriculumUnit('v2');
  assert.deepEqual(legacyUnit.items.map(item => item.contentId), [...LEGACY_UNIT1_MISSION_IDS]);
  assert.deepEqual(v2Unit.items.map(item => item.contentId), [...MSA_V2_FINAL_ORDER]);
  assert.equal(v2Unit.items.length, 13);
  assert.deepEqual(v2Unit.items.map(item => item.unit1BlueprintRole), MSA_V2_NATIVE_MISSION_IDS.map(() => 'native_mission'));
  assert.deepEqual(MSA_UNIT1_V2_BLUEPRINT.map(entry => entry.missionId), v2Unit.items.map(item => item.contentId));
  MSA_V2_FINAL_ORDER.forEach((contentId, index) => {
    assert.equal(
      getPreviousProgressionContentIdFromItems(v2Unit.items, contentId),
      index === 0 ? null : MSA_V2_FINAL_ORDER[index - 1],
    );
  });

  const msaCurriculum = getDialectCurriculum('msa');
  const originalUnit = msaCurriculum.units[0];
  msaCurriculum.units[0] = v2Unit;
  try {
    v2Unit.items.forEach((item, index) => {
      const previousContentId = index === 0 ? null : v2Unit.items[index - 1].contentId;
      assert.deepEqual(getContentAccess({
        dialect: 'msa',
        unitId: item.unitId,
        contentId: item.contentId,
        contentType: item.contentType,
        isPremium: false,
        isTestingUnlocked: false,
        completedContentIds: [],
      }), previousContentId === null
        ? { allowed: true, reason: 'free' }
        : {
          allowed: false,
          reason: 'previous_incomplete',
          requiredPreviousContentId: previousContentId,
        });

      if (previousContentId !== null) {
        assert.deepEqual(getContentAccess({
          dialect: 'msa',
          unitId: item.unitId,
          contentId: item.contentId,
          contentType: item.contentType,
          isPremium: false,
          isTestingUnlocked: false,
          completedContentIds: [buildCompletionKey('msa', 'unit-1', previousContentId)],
        }), { allowed: true, reason: 'free' });
      }
    });
  } finally {
    msaCurriculum.units[0] = originalUnit;
  }

  LEGACY_UNIT1_MISSION_IDS.forEach(contentId => {
    assert.equal(
      buildCompletionKey('msa', 'unit-1', contentId),
      `msa:unit-1:${contentId}`,
    );
  });
}

function testFirstArabicWordsMissionDataAndIsolation() {
  assert.equal(MSA_FIRST_ARABIC_WORDS_MISSION.missionId, 'first_arabic_words');
  assert.equal(MSA_FIRST_ARABIC_WORDS_MISSION.missionKind, 'lesson');
  assert.equal(MSA_FIRST_ARABIC_WORDS_MISSION.audioMode, 'none');
  assert.equal(MSA_FIRST_ARABIC_WORDS_MISSION.reviewable, false);
  assert.equal(MSA_FIRST_ARABIC_WORDS_MISSION.objective, 'Introduce 20 standalone beginner words.');
  assert.equal(MSA_FIRST_ARABIC_WORDS_MISSION.completionMessage, 'You already know 20 Arabic words.');
  assert.deepEqual(MSA_FIRST_ARABIC_WORDS_ROUNDS.map(round => round.title), [
    'Greetings and answers',
    'People',
    'Place and time',
  ]);
  assert.deepEqual(MSA_FIRST_ARABIC_WORDS_ROUNDS.map(round => round.words.length), [8, 5, 7]);
  assert.equal(MSA_FIRST_ARABIC_WORDS.length, 20);
  assert.deepEqual(MSA_FIRST_ARABIC_WORDS.map(word => [
    word.displayArabic,
    word.transliteration,
    word.english,
  ]), [
    ['سلام', 'salaam', 'Hello'],
    ['مرحباً', 'marhaban', 'Hello'],
    ['أهلاً', 'ahlan', 'Hi / Welcome'],
    ['نعم', 'naʿam', 'Yes'],
    ['لا', 'laa', 'No'],
    ['ربما', 'rubbamaa', 'Maybe'],
    ['حسناً', 'hasanan', 'Okay'],
    ['طبعاً', 'tabʿan', 'Of course'],
    ['أنا', 'anaa', 'I'],
    ['أنتَ', 'anta', 'You (male)'],
    ['أنتِ', 'anti', 'You (female)'],
    ['هو', 'huwa', 'He'],
    ['هي', 'hiya', 'She'],
    ['هنا', 'hunaa', 'Here'],
    ['هناك', 'hunaaka', 'There'],
    ['الآن', 'al-aan', 'Now'],
    ['اليوم', 'al-yawm', 'Today'],
    ['غداً', 'ghadan', 'Tomorrow'],
    ['مَن', 'man', 'Who'],
    ['أين', 'ayna', 'Where'],
  ]);
  assert.equal(new Set(MSA_FIRST_ARABIC_WORDS.map(word => word.conceptId)).size, 20);
  MSA_FIRST_ARABIC_WORDS.forEach(word => {
    assert.equal(/\s/u.test((word.displayArabic ?? word.arabic).trim()), false);
    assert.equal(word.displayArabic, word.evalTarget);
    assert.equal(Object.prototype.hasOwnProperty.call(word, 'audio'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(word, 'audioPath'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(word, 'audioText'), false);
  });

  const msaContent = getDialectContent('msa');
  const gulfContent = getDialectContent('gulf');
  const egyptianContent = getDialectContent('egyptian');
  assert.notEqual(msaContent.missions.first_arabic_words, MSA_FIRST_ARABIC_WORDS_MISSION);
  assert.equal(msaContent.missions.first_arabic_words.audioMode, 'default');
  assert.notEqual(gulfContent.missions.first_arabic_words, MSA_FIRST_ARABIC_WORDS_MISSION);
  assert.notEqual(egyptianContent.missions.first_arabic_words, MSA_FIRST_ARABIC_WORDS_MISSION);

  const v2Item = buildMsaUnit1CurriculumUnit('v2').items[0];
  const resolved = resolveCurriculumItem(v2Item, msaContent);
  assert.equal(resolved?.missionContent, msaContent.missions.first_arabic_words);
  assert.notEqual(resolved?.lessonWords, MSA_FIRST_ARABIC_WORDS);
  assert.ok(resolved?.lessonWords?.every(word => word.audio != null));
  assert.equal(resolveCurriculumItem(v2Item, gulfContent), null);
  assert.equal(resolveCurriculumItem(v2Item, egyptianContent), null);
  assert.equal(
    getDialectCurriculum('msa').units[0].items.some(item => item.contentId === 'first_arabic_words'),
    false,
  );
}

function testPoliteLikeALocalMissionDataAndIsolation() {
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_MISSION.missionId, 'polite_like_a_local');
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_MISSION.missionKind, 'lesson');
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_MISSION.audioMode, 'none');
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_MISSION.reviewable, false);
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_MISSION.completionMessage, 'You can now be polite and ask for help in Arabic.');
  assert.deepEqual(MSA_POLITE_LIKE_A_LOCAL_ROUNDS.map(round => round.roundId), [
    'courtesy',
    'friendly_responses',
    'when_you_need_help',
  ]);
  assert.deepEqual(MSA_POLITE_LIKE_A_LOCAL_ROUNDS.map(round => round.title), [
    'Courtesy',
    'Friendly responses',
    'When you need help',
  ]);
  assert.deepEqual(MSA_POLITE_LIKE_A_LOCAL_ROUNDS.map(round => round.words.length), [8, 8, 8]);
  assert.equal(MSA_POLITE_LIKE_A_LOCAL.length, 24);
  assert.deepEqual(MSA_POLITE_LIKE_A_LOCAL.map(word => [
    word.displayArabic,
    word.transliteration,
    word.english,
  ]), [
    ['شكراً', 'shukran', 'Thank you'],
    ['شكراً جزيلاً', 'shukran jaziilan', 'Thank you very much'],
    ['عفواً', 'ʿafwan', 'You’re welcome / Excuse me'],
    ['عذراً', 'ʿudhran', 'Excuse me'],
    ['من فضلك', 'min fadlik', 'Please'],
    ['آسف', 'aasif', 'Sorry (male)'],
    ['آسفة', 'aasifa', 'Sorry (female)'],
    ['لا بأس', 'laa ba’s', 'No problem'],
    ['تفضل', 'tafaddal', 'Here you go (to a male)'],
    ['تفضلي', 'tafaddali', 'Here you go (to a female)'],
    ['بكل سرور', 'bikulli suruur', 'With pleasure'],
    ['نعم، شكراً', 'naʿam, shukran', 'Yes, thank you'],
    ['لا، شكراً', 'laa, shukran', 'No, thank you'],
    ['حسناً، شكراً', 'hasanan, shukran', 'Okay, thank you'],
    ['ممتاز', 'mumtaaz', 'Excellent'],
    ['جيد جداً', 'jayyid jiddan', 'Very good'],
    ['ساعدني', 'saaʿidnii', 'Help me'],
    ['انتظر قليلاً', 'intazir qaliilan', 'Wait a little'],
    ['تكلم ببطء', 'takallam bibut’', 'Speak slowly'],
    ['لا أفهم', 'laa afham', 'I don’t understand'],
    ['أفهم قليلاً', 'afham qaliilan', 'I understand a little'],
    ['مرة أخرى', 'marratan ukhraa', 'Again'],
    ['بعد إذنك', 'baʿda idhnik', 'Excuse me / With your permission'],
    ['أهلاً وسهلاً', 'ahlan wa sahlan', 'Welcome'],
  ]);
  assert.equal(new Set(MSA_POLITE_LIKE_A_LOCAL.map(word => word.conceptId)).size, 24);
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_ROUNDS[0].words[0], MSA_POLITE_LIKE_A_LOCAL[0]);
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_ROUNDS[0].words[7], MSA_POLITE_LIKE_A_LOCAL[7]);
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_ROUNDS[1].words[0], MSA_POLITE_LIKE_A_LOCAL[8]);
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_ROUNDS[1].words[7], MSA_POLITE_LIKE_A_LOCAL[15]);
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_ROUNDS[2].words[0], MSA_POLITE_LIKE_A_LOCAL[16]);
  assert.equal(MSA_POLITE_LIKE_A_LOCAL_ROUNDS[2].words[7], MSA_POLITE_LIKE_A_LOCAL[23]);
  MSA_POLITE_LIKE_A_LOCAL.forEach(word => {
    assert.equal(word.displayArabic, word.evalTarget);
    assert.equal(Object.prototype.hasOwnProperty.call(word, 'audio'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(word, 'audioPath'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(word, 'audioText'), false);
  });

  const msaContent = getDialectContent('msa');
  const gulfContent = getDialectContent('gulf');
  const egyptianContent = getDialectContent('egyptian');
  assert.notEqual(msaContent.missions.polite_like_a_local, MSA_POLITE_LIKE_A_LOCAL_MISSION);
  assert.notEqual(gulfContent.missions.polite_like_a_local, MSA_POLITE_LIKE_A_LOCAL_MISSION);
  assert.notEqual(egyptianContent.missions.polite_like_a_local, MSA_POLITE_LIKE_A_LOCAL_MISSION);

  const v2Item = buildMsaUnit1CurriculumUnit('v2').items[1];
  assert.equal(v2Item.contentId, 'polite_like_a_local');
  assert.equal(v2Item.title, 'Be Polite Like a Local 😊');
  const resolved = resolveCurriculumItem(v2Item, msaContent);
  assert.equal(resolved?.missionContent, msaContent.missions.polite_like_a_local);
  assert.notEqual(resolved?.lessonWords, MSA_POLITE_LIKE_A_LOCAL);
  assert.ok(resolved?.lessonWords?.every(word => word.audio != null));
  assert.equal(resolveCurriculumItem(v2Item, gulfContent), null);
  assert.equal(resolveCurriculumItem(v2Item, egyptianContent), null);
  assert.equal(
    getDialectCurriculum('msa').units[0].items.some(item => item.contentId === 'polite_like_a_local'),
    false,
  );
}

function testMissionsThreeThroughEightDataAndIsolation() {
  const fixtures = [
    {
      missionId: 'people_around_you',
      title: 'People Around You 👨‍👩‍👧',
      mission: MSA_PEOPLE_AROUND_YOU_MISSION,
      rounds: MSA_PEOPLE_AROUND_YOU_ROUNDS,
      words: MSA_PEOPLE_AROUND_YOU,
      roundIds: ['people', 'family', 'people_you_meet'],
      roundTitles: ['People', 'Family', 'People you meet'],
      completionMessage: 'You can now recognize the people around you in Arabic.',
      entries: [
        ['رجل', 'rajul', 'Man'],
        ['امرأة', 'imra’a', 'Woman'],
        ['طفل', 'tifl', 'Child'],
        ['ولد', 'walad', 'Boy'],
        ['بنت', 'bint', 'Girl'],
        ['شخص', 'shakhs', 'Person'],
        ['صديق', 'sadiiq', 'Friend (male)'],
        ['صديقة', 'sadiiqa', 'Friend (female)'],
        ['أب', 'ab', 'Father'],
        ['أم', 'umm', 'Mother'],
        ['أخ', 'akh', 'Brother'],
        ['أخت', 'ukht', 'Sister'],
        ['زوج', 'zawj', 'Husband'],
        ['زوجة', 'zawja', 'Wife'],
        ['عائلة', '‘aa’ila', 'Family'],
        ['جار', 'jaar', 'Neighbor'],
        ['معلم', 'mu’allim', 'Teacher (male)'],
        ['معلمة', 'mu’allima', 'Teacher (female)'],
        ['طبيب', 'tabiib', 'Doctor (male)'],
        ['طبيبة', 'tabiiba', 'Doctor (female)'],
        ['موظف', 'muwazzaf', 'Employee (male)'],
        ['موظفة', 'muwazzafa', 'Employee (female)'],
        ['زبون', 'zabuun', 'Customer'],
        ['مدير', 'mudiir', 'Manager'],
      ],
    },
    {
      missionId: 'everyday_objects',
      title: 'Everyday Objects 🏠',
      mission: MSA_EVERYDAY_OBJECTS_MISSION,
      rounds: MSA_EVERYDAY_OBJECTS_ROUNDS,
      words: MSA_EVERYDAY_OBJECTS,
      roundIds: ['things_you_carry', 'around_the_house', 'useful_objects'],
      roundTitles: ['Things you carry', 'Around the house', 'Useful objects'],
      completionMessage: 'You can now name 24 everyday things in Arabic.',
      entries: [
        ['هاتف', 'haatif', 'Phone'],
        ['مفتاح', 'miftaah', 'Key'],
        ['كتاب', 'kitaab', 'Book'],
        ['قلم', 'qalam', 'Pen'],
        ['حقيبة', 'haqiiba', 'Bag'],
        ['ساعة', 'saa’a', 'Watch / Clock'],
        ['نظارة', 'nazzaara', 'Glasses'],
        ['حذاء', 'hidhaa’', 'Shoe'],
        ['بيت', 'bayt', 'House'],
        ['غرفة', 'ghurfa', 'Room'],
        ['باب', 'baab', 'Door'],
        ['نافذة', 'naafidha', 'Window'],
        ['كرسي', 'kursii', 'Chair'],
        ['طاولة', 'taawila', 'Table'],
        ['سرير', 'sariir', 'Bed'],
        ['مطبخ', 'matbakh', 'Kitchen'],
        ['حمام', 'hammaam', 'Bathroom'],
        ['سيارة', 'sayyaara', 'Car'],
        ['كوب', 'kuub', 'Cup'],
        ['طبق', 'tabaq', 'Plate'],
        ['ملعقة', 'mil‘aqa', 'Spoon'],
        ['زجاجة', 'zujaaja', 'Bottle'],
        ['قميص', 'qamiis', 'Shirt'],
        ['صورة', 'suura', 'Picture'],
      ],
    },
    {
      missionId: 'food_and_drinks',
      title: 'Food & Drinks ☕',
      mission: MSA_FOOD_AND_DRINKS_MISSION,
      rounds: MSA_FOOD_AND_DRINKS_ROUNDS,
      words: MSA_FOOD_AND_DRINKS,
      roundIds: ['drinks_and_basics', 'food_and_descriptions', 'short_useful_phrases'],
      roundTitles: ['Drinks and basics', 'Food and descriptions', 'Short useful phrases'],
      completionMessage: 'You can now ask for simple food and drinks in Arabic.',
      entries: [
        ['ماء', 'maa’', 'Water'],
        ['قهوة', 'qahwa', 'Coffee'],
        ['شاي', 'shaay', 'Tea'],
        ['عصير', '‘asiir', 'Juice'],
        ['حليب', 'haliib', 'Milk'],
        ['خبز', 'khubz', 'Bread'],
        ['أرز', 'aruzz', 'Rice'],
        ['سكر', 'sukkar', 'Sugar'],
        ['ملح', 'milh', 'Salt'],
        ['لحم', 'lahm', 'Meat'],
        ['دجاج', 'dajaaj', 'Chicken'],
        ['سمك', 'samak', 'Fish'],
        ['فاكهة', 'faakiha', 'Fruit'],
        ['خضروات', 'khudrawaat', 'Vegetables'],
        ['ساخن', 'saakhin', 'Hot'],
        ['بارد', 'baarid', 'Cold'],
        ['أريد ماء', 'uriidu maa’', 'I want water'],
        ['أريد قهوة', 'uriidu qahwa', 'I want coffee'],
        ['ماء بارد', 'maa’ baarid', 'Cold water'],
        ['قهوة ساخنة', 'qahwa saakhina', 'Hot coffee'],
        ['بدون سكر', 'biduun sukkar', 'Without sugar'],
        ['مع حليب', 'ma‘a haliib', 'With milk'],
        ['هذا لذيذ', 'haadhaa ladhiidh', 'This is delicious'],
        ['لا أريد', 'laa uriid', 'I don’t want'],
      ],
    },
    {
      missionId: 'describe_the_world',
      title: 'Describe the World 🎨',
      mission: MSA_DESCRIBE_THE_WORLD_MISSION,
      rounds: MSA_DESCRIBE_THE_WORLD_ROUNDS,
      words: MSA_DESCRIBE_THE_WORLD,
      roundIds: ['colors', 'simple_descriptions', 'short_descriptions'],
      roundTitles: ['Colors', 'Simple descriptions', 'Short descriptions'],
      completionMessage: 'You can now describe simple things in Arabic.',
      entries: [
        ['أحمر', 'ahmar', 'Red'],
        ['أزرق', 'azraq', 'Blue'],
        ['أخضر', 'akhdar', 'Green'],
        ['أصفر', 'asfar', 'Yellow'],
        ['أبيض', 'abyad', 'White'],
        ['أسود', 'aswad', 'Black'],
        ['بني', 'bunnii', 'Brown'],
        ['برتقالي', 'burtuqaalii', 'Orange'],
        ['كبير', 'kabiir', 'Big'],
        ['صغير', 'saghiir', 'Small'],
        ['جديد', 'jadiid', 'New'],
        ['قديم', 'qadiim', 'Old'],
        ['جميل', 'jamiil', 'Beautiful'],
        ['سريع', 'sarii‘', 'Fast'],
        ['بطيء', 'batii’', 'Slow'],
        ['سهل', 'sahl', 'Easy'],
        ['بيت كبير', 'bayt kabiir', 'A big house'],
        ['سيارة جديدة', 'sayyaara jadiida', 'A new car'],
        ['كتاب قديم', 'kitaab qadiim', 'An old book'],
        ['باب صغير', 'baab saghiir', 'A small door'],
        ['قهوة ساخنة', 'qahwa saakhina', 'Hot coffee'],
        ['ماء بارد', 'maa’ baarid', 'Cold water'],
        ['شيء جميل', 'shay’ jamiil', 'A beautiful thing'],
        ['جيد جداً', 'jayyid jiddan', 'Very good'],
      ],
    },
    {
      missionId: 'numbers_and_money',
      title: 'Numbers & Money 🔢',
      mission: MSA_NUMBERS_AND_MONEY_MISSION,
      rounds: MSA_NUMBERS_AND_MONEY_ROUNDS,
      words: MSA_NUMBERS_AND_MONEY,
      roundIds: ['numbers_zero_to_seven', 'more_numbers_and_money', 'buying_something'],
      roundTitles: ['Numbers 0–7', 'More numbers and money', 'Buying something'],
      completionMessage: 'You can now count and understand simple prices in Arabic.',
      entries: [
        ['صفر', 'sifr', 'Zero'],
        ['واحد', 'waahid', 'One'],
        ['اثنان', 'ithnaan', 'Two'],
        ['ثلاثة', 'thalaatha', 'Three'],
        ['أربعة', 'arba‘a', 'Four'],
        ['خمسة', 'khamsa', 'Five'],
        ['ستة', 'sitta', 'Six'],
        ['سبعة', 'sab‘a', 'Seven'],
        ['ثمانية', 'thamaaniya', 'Eight'],
        ['تسعة', 'tis‘a', 'Nine'],
        ['عشرة', '‘ashara', 'Ten'],
        ['درهم', 'dirham', 'Dirham'],
        ['دراهم', 'daraahim', 'Dirhams'],
        ['مال', 'maal', 'Money'],
        ['سعر', 'si‘r', 'Price'],
        ['كم؟', 'kam?', 'How much?'],
        ['كم السعر؟', 'kam as-si‘r?', 'How much is it?'],
        ['خمسة دراهم', 'khamsa daraahim', 'Five dirhams'],
        ['عشرة دراهم', '‘ashara daraahim', 'Ten dirhams'],
        ['هذا غالي', 'haadhaa ghaalii', 'This is expensive'],
        ['هذا رخيص', 'haadhaa rakhiis', 'This is cheap'],
        ['عندي مال', '‘indii maal', 'I have money'],
        ['سعر جيد', 'si‘r jayyid', 'Good price'],
        ['نعم، واحد', 'na‘am, waahid', 'Yes, one'],
      ],
    },
    {
      missionId: 'where_here_there',
      title: 'Where? Here! There! 📍',
      mission: MSA_WHERE_HERE_THERE_MISSION,
      rounds: MSA_WHERE_HERE_THERE_ROUNDS,
      words: MSA_WHERE_HERE_THERE,
      roundIds: ['direction_words', 'position_words', 'ask_and_follow_directions'],
      roundTitles: ['Direction words', 'Position words', 'Ask and follow directions'],
      completionMessage: 'You can now ask where something is and follow simple directions.',
      entries: [
        ['أين', 'ayna', 'Where'],
        ['هنا', 'hunaa', 'Here'],
        ['هناك', 'hunaaka', 'There'],
        ['يمين', 'yamiin', 'Right'],
        ['يسار', 'yasaar', 'Left'],
        ['أمام', 'amaam', 'In front'],
        ['خلف', 'khalf', 'Behind'],
        ['مستقيم', 'mustaqiim', 'Straight'],
        ['فوق', 'fawq', 'Above'],
        ['تحت', 'taht', 'Below'],
        ['داخل', 'daakhil', 'Inside'],
        ['خارج', 'khaarij', 'Outside'],
        ['قريب', 'qariib', 'Near'],
        ['بعيد', 'ba‘iid', 'Far'],
        ['بجانب', 'bijaanib', 'Next to'],
        ['بين', 'bayna', 'Between'],
        ['أين الفندق؟', 'ayna al-funduq?', 'Where is the hotel?'],
        ['أين المطعم؟', 'ayna al-mat‘am?', 'Where is the restaurant?'],
        ['إلى اليمين', 'ilaa al-yamiin', 'To the right'],
        ['إلى اليسار', 'ilaa al-yasaar', 'To the left'],
        ['إلى الأمام', 'ilaa al-amaam', 'Forward'],
        ['قريب من هنا', 'qariib min hunaa', 'Near here'],
        ['بعيد من هنا', 'baʿiid min hunaa', 'Far from here'],
        ['اذهب مستقيماً', 'idhhab mustaqiiman', 'Go straight'],
      ],
    },
  ];

  const msaContent = getDialectContent('msa');
  const gulfContent = getDialectContent('gulf');
  const egyptianContent = getDialectContent('egyptian');
  const v2Unit = buildMsaUnit1CurriculumUnit('v2');
  const allSrsIds: string[] = [];
  const allConceptIds: string[] = [];

  fixtures.forEach((fixture, fixtureIndex) => {
    assert.equal(fixture.mission.missionId, fixture.missionId);
    assert.equal(fixture.mission.missionKind, 'lesson');
    assert.equal(fixture.mission.audioMode, 'none');
    assert.equal(fixture.mission.reviewable, false);
    assert.equal(fixture.mission.completionMessage, fixture.completionMessage);
    assert.deepEqual(fixture.rounds.map(round => round.roundId), fixture.roundIds);
    assert.deepEqual(fixture.rounds.map(round => round.title), fixture.roundTitles);
    assert.deepEqual(fixture.rounds.map(round => round.words.length), [8, 8, 8]);
    assert.equal(fixture.words.length, 24);
    assert.deepEqual(fixture.words.map(word => [
      word.displayArabic,
      word.transliteration,
      word.english,
    ]), fixture.entries);
    assert.equal(new Set(fixture.words.map(word => word.conceptId)).size, 24);

    fixture.rounds.forEach((round, roundIndex) => {
      assert.equal(round.words[0], fixture.words[roundIndex * 8]);
      assert.equal(round.words[7], fixture.words[(roundIndex * 8) + 7]);
      round.words.forEach(word => assert.equal(word.context, round.title));
    });

    fixture.words.forEach(word => {
      const displayArabic = word.displayArabic ?? word.arabic;
      const phraseLength = displayArabic.replace(/[؟،]/gu, '').trim().split(/\s+/u).length;
      assert.ok(phraseLength <= 3, `${fixture.missionId}:${word.conceptId} exceeds three words`);
      assert.equal(word.displayArabic, word.evalTarget);
      assert.equal(Object.prototype.hasOwnProperty.call(word, 'audio'), false);
      assert.equal(Object.prototype.hasOwnProperty.call(word, 'audioPath'), false);
      assert.equal(Object.prototype.hasOwnProperty.call(word, 'audioText'), false);
      allConceptIds.push(word.conceptId);

      allSrsIds.push(buildMissionVocabularySrsItemId({
        languagePair: 'en-ar',
        dialect: 'msa',
        unitId: 'unit-1',
        missionId: fixture.missionId,
        skill: 'recognition',
        conceptId: word.conceptId,
      }));
    });

    assert.notEqual(msaContent.missions[fixture.missionId], fixture.mission);
    assert.notEqual(gulfContent.missions[fixture.missionId], fixture.mission);
    assert.notEqual(egyptianContent.missions[fixture.missionId], fixture.mission);

    const item = v2Unit.items[fixtureIndex + 2];
    assert.equal(item.contentId, fixture.missionId);
    assert.equal(item.title, fixture.title);
    assert.equal(item.contentRef?.key, fixture.missionId);
    assert.equal(buildCompletionKey('msa', item.unitId, item.contentId), `msa:unit-1:${fixture.missionId}`);
    const resolved = resolveCurriculumItem(item, msaContent);
    assert.equal(resolved?.missionContent, msaContent.missions[fixture.missionId]);
    assert.notEqual(resolved?.lessonWords, fixture.words);
    assert.ok(resolved?.lessonWords?.every(word => word.audio != null));
    assert.equal(resolveCurriculumItem(item, gulfContent), null);
    assert.equal(resolveCurriculumItem(item, egyptianContent), null);
    assert.deepEqual(buildOfflineManifestFilesForCurriculum('msa', [item], msaContent), []);
    assert.equal(
      getDialectCurriculum('msa').units[0].items.some(candidate => candidate.contentId === fixture.missionId),
      false,
    );
  });

  assert.equal(allConceptIds.length, 144);
  assert.equal(new Set(allConceptIds).size, 144);
  assert.equal(allSrsIds.length, 144);
  assert.equal(new Set(allSrsIds).size, 144);
  assert.ok(allSrsIds.every(id => id.startsWith('mission:en-ar:msa:unit-1:')));
  const reviewQuestions = buildPhase1ReviewQuestions(
    msaContent,
    'msa',
    'unit1-v2-missions-3-8',
    v2Unit.items.slice(2, 8),
  );
  assert.equal(reviewQuestions.some(question => MSA_V2_NATIVE_MISSION_IDS
    .slice(2)
    .some(missionId => question.id.includes(`:unit-1:${missionId}:`))), false);
}

function testFirstArabicWordsSrsAndOfflineIdentity() {
  const srsIds = MSA_FIRST_ARABIC_WORDS.map(word => buildMissionVocabularySrsItemId({
    languagePair: 'en-ar',
    dialect: 'msa',
    unitId: 'unit-1',
    missionId: 'first_arabic_words',
    skill: 'recognition',
    conceptId: word.conceptId,
  }));
  assert.equal(new Set(srsIds).size, 20);
  assert.equal(
    srsIds[0],
    'mission:en-ar:msa:unit-1:first_arabic_words:recognition:greeting_salaam',
  );
  assert.notEqual(srsIds[0], buildMissionVocabularySrsItemId({
    languagePair: 'en-ar',
    dialect: 'gulf',
    unitId: 'unit-1',
    missionId: 'first_arabic_words',
    skill: 'recognition',
    conceptId: MSA_FIRST_ARABIC_WORDS[0].conceptId,
  }));
  assert.notEqual(
    buildCompletionKey('msa', 'unit-1', 'first_arabic_words'),
    buildCompletionKey('gulf', 'unit-1', 'first_arabic_words'),
  );

  const content = getDialectContent('msa');
  const legacyItems = buildMsaUnit1CurriculumUnit('legacy').items;
  const v2Items = buildMsaUnit1CurriculumUnit('v2').items;
  const firstMissionFiles = buildOfflineManifestFilesForCurriculum('msa', [v2Items[0]], content);
  const legacyFiles = buildOfflineManifestFilesForCurriculum('msa', legacyItems, content);
  const v2Files = buildOfflineManifestFilesForCurriculum('msa', v2Items, content);
  assert.deepEqual(firstMissionFiles, []);
  assert.deepEqual(legacyFiles, []);
  assert.deepEqual(v2Files, []);
}

function testPoliteLikeALocalSrsAndOfflineIdentity() {
  const srsIds = MSA_POLITE_LIKE_A_LOCAL.map(word => buildMissionVocabularySrsItemId({
    languagePair: 'en-ar',
    dialect: 'msa',
    unitId: 'unit-1',
    missionId: 'polite_like_a_local',
    skill: 'recognition',
    conceptId: word.conceptId,
  }));
  assert.equal(new Set(srsIds).size, 24);
  assert.equal(
    srsIds[0],
    'mission:en-ar:msa:unit-1:polite_like_a_local:recognition:courtesy_thank_you',
  );
  assert.ok(srsIds.every(id => id.includes(':msa:unit-1:polite_like_a_local:recognition:')));
  assert.notEqual(
    buildCompletionKey('msa', 'unit-1', 'polite_like_a_local'),
    buildCompletionKey('gulf', 'unit-1', 'polite_like_a_local'),
  );

  const content = getDialectContent('msa');
  const v2Items = buildMsaUnit1CurriculumUnit('v2').items;
  const missionItem = v2Items.find(item => item.contentId === 'polite_like_a_local');
  assert.ok(missionItem);
  assert.deepEqual(buildOfflineManifestFilesForCurriculum('msa', [missionItem], content), []);
}

function testLegacyUnit1Compatibility() {
  DIALECTS.forEach(dialect => {
    const unit = getDialectCurriculum(dialect).units.find(candidate => candidate.unitId === 'unit-1');
    assert.ok(unit);
    assert.deepEqual(unit.items.map(item => item.contentId), [...LEGACY_UNIT1_MISSION_IDS]);
    assert.deepEqual(unit.items.map(item => item.missionId), [...LEGACY_UNIT1_MISSION_IDS]);
    assert.deepEqual(unit.items.map(item => item.missionKind), [
      'lesson',
      'lesson',
      'lesson',
      'challenge',
    ]);
    assert.deepEqual(unit.items.slice(0, 3).map(item => item.route), [
      { screen: 'lesson', params: { type: 'basic_words' } },
      { screen: 'lesson', params: { type: 'greetings' } },
      { screen: 'lesson', params: { type: 'intro' } },
    ]);
    assert.deepEqual(unit.items.slice(0, 3).map(item => item.homeHref), [
      '/lesson?type=basic_words',
      '/lesson?type=greetings',
      '/lesson?type=intro',
    ]);

    const quiz = unit.items[3];
    if (dialect === 'msa') {
      assert.deepEqual(quiz.route, { screen: 'quiz-unit2', params: { unit: '1' } });
      assert.equal(quiz.homeHref, '/quiz-unit2?unit=1');
    } else {
      assert.deepEqual(quiz.route, { screen: 'quiz', params: {} });
      assert.equal(quiz.homeHref, '/quiz');
    }

    const content = getDialectContent(dialect);
    unit.items.slice(0, 3).forEach((item, index) => {
      const resolved = resolveContent({
        dialect,
        unitId: 'unit-1',
        contentId: item.contentId,
        contentType: 'lesson',
      });
      assert.ok(resolved?.lessonWords);
      assert.equal(resolved.lessonWords, content.lessons[LEGACY_LESSON_KEYS[index]]);
      assert.equal(content.missions[item.contentId]?.lessonWords, resolved.lessonWords);
      assert.equal(buildCompletionKey(dialect, item.unitId, item.contentId), `${dialect}:unit-1:${item.contentId}`);
    });
    assert.ok(resolveContent({
      dialect,
      unitId: 'unit-1',
      contentId: 'quiz_u1',
      contentType: 'quiz',
    }));
  });

  assert.deepEqual(getCompletionKeyCandidates('gulf', 'basic_words'), [
    'gulf:unit-1:basic_words',
    'basic_words',
    'basic-words',
    'basic',
  ]);
  assert.deepEqual(getCompletionKeyCandidates('egyptian', 'basic_words'), [
    'egyptian:unit-1:basic_words',
  ]);
}

function makeDialogue(): DialogueTurn[] {
  return Array.from({ length: 8 }, (_, index) => ({
    type: index % 2 === 0 ? 'waiter' as const : 'user' as const,
    arabic: `mission line ${index + 1}`,
    displayArabic: `mission line ${index + 1}`,
    audioText: `mission line ${index + 1}.`,
    evalTarget: `mission line ${index + 1}`,
    transliteration: `mission-line-${index + 1}`,
    english: `Mission meaning ${index + 1}`,
    audio: 900_010 + index,
    audioPath: `assets/audio/msa/unit-1/mission-dialogue/${index + 1}.mp3`,
  }));
}

function createSyntheticMissionFixture() {
  const lessonWord: Word = {
    arabic: 'mission word',
    displayArabic: 'mission word',
    audioText: 'mission word.',
    evalTarget: 'mission word',
    transliteration: 'mission-word',
    english: 'Mission word',
    context: 'Architecture test',
    audio: 900_001,
    audioPath: 'assets/audio/msa/unit-1/mission-vocabulary/1.mp3',
  };
  const dialogue = makeDialogue();
  const items = buildUnit1MissionItems('msa', [
    {
      missionId: 'mission_vocabulary',
      missionKind: 'lesson',
      title: 'Mission Vocabulary',
      route: { screen: 'lesson', params: { type: 'mission_vocabulary' } },
      homeHref: '/lesson?type=mission_vocabulary',
    },
    {
      missionId: 'mission_dialogue',
      missionKind: 'guided_dialogue',
      title: 'Mission Dialogue',
      route: { screen: 'scenario', params: { type: 'mission_dialogue' } },
      homeHref: '/scenario?type=mission_dialogue',
    },
    {
      missionId: 'mission_review',
      missionKind: 'review',
      title: 'Mission Review',
      route: { screen: 'quiz-unit2', params: { unit: '1-review' } },
      homeHref: '/quiz-unit2?unit=1-review',
    },
    {
      missionId: 'mission_scenario',
      missionKind: 'scenario',
      title: 'Mission Scenario',
      route: { screen: 'scenario', params: { type: 'mission_scenario' } },
      homeHref: '/scenario?type=mission_scenario',
    },
    {
      missionId: 'mission_challenge',
      missionKind: 'challenge',
      title: 'Mission Challenge',
      route: { screen: 'quiz-unit2', params: { unit: '1-final' } },
      homeHref: '/quiz-unit2?unit=1-final',
    },
  ], 'msa');
  const missions = createMissionContentRegistry([
    { missionId: 'mission_vocabulary', missionKind: 'lesson', lessonWords: [lessonWord] },
    { missionId: 'mission_dialogue', missionKind: 'guided_dialogue', dialogue, reviewable: true },
    { missionId: 'mission_review', missionKind: 'review' },
    { missionId: 'mission_scenario', missionKind: 'scenario', dialogue },
    { missionId: 'mission_challenge', missionKind: 'challenge' },
  ]);
  const content: DialectContent = {
    voiceId: 'test-voice',
    lessons: {},
    missions,
    scenarios: {},
    sceneImages: {},
    availableLessons: [],
    availableScenarios: [],
  };
  return { items, content, lessonWord, dialogue };
}

function testArbitraryMissionResolutionAndProgression() {
  assert.equal(getMissionContentType('lesson'), 'lesson');
  assert.equal(getMissionContentType('guided_dialogue'), 'scenario');
  assert.equal(getMissionContentType('review'), 'quiz');
  assert.equal(getMissionContentType('scenario'), 'scenario');
  assert.equal(getMissionContentType('challenge'), 'quiz');

  const { items, content, lessonWord, dialogue } = createSyntheticMissionFixture();
  assert.deepEqual(items.map(item => item.contentId), [
    'mission_vocabulary',
    'mission_dialogue',
    'mission_review',
    'mission_scenario',
    'mission_challenge',
  ]);
  assert.equal(resolveCurriculumItem(items[0], content)?.lessonWords?.[0], lessonWord);
  assert.equal(resolveCurriculumItem(items[1], content)?.dialogue, dialogue);
  assert.equal(resolveCurriculumItem(items[2], content)?.item, items[2]);
  assert.equal(resolveCurriculumItem(items[3], content)?.dialogue, dialogue);
  assert.equal(resolveCurriculumItem(items[4], content)?.item, items[4]);
  assert.equal(getScenarioContentId('not-a-real-mission', 'msa'), null);

  const msaUnit1 = getDialectCurriculum('msa').units.find(unit => unit.unitId === 'unit-1')!;
  msaUnit1.items.splice(1, 0, items[1]);
  try {
    assert.equal(getScenarioContentId('mission_dialogue', 'msa'), 'mission_dialogue');
    assert.deepEqual(getContentAccess({
      dialect: 'msa',
      unitId: 'unit-1',
      contentId: 'mission_dialogue',
      contentType: 'scenario',
      isPremium: true,
      isTestingUnlocked: false,
      completedContentIds: [],
    }), { allowed: false, reason: 'unavailable' });
  } finally {
    msaUnit1.items.splice(1, 1);
  }

  const currentUnit1 = getDialectCurriculum('msa').units.find(unit => unit.unitId === 'unit-1')!.items;
  const inserted = [currentUnit1[0], ...items, ...currentUnit1.slice(1)];
  assert.equal(getPreviousProgressionContentIdFromItems(inserted, 'mission_vocabulary'), 'basic_words');
  assert.equal(getPreviousProgressionContentIdFromItems(inserted, 'mission_dialogue'), 'mission_vocabulary');
  assert.equal(getPreviousProgressionContentIdFromItems(inserted, 'greetings'), 'mission_challenge');

  const missingMissionContent: DialectContent = { ...content, missions: {} };
  assert.equal(resolveCurriculumItem(items[0], missingMissionContent), null);
  const mismatchedMissionContent: DialectContent = {
    ...content,
    missions: {
      ...content.missions,
      mission_vocabulary: { missionId: 'mission_vocabulary', missionKind: 'challenge' },
    },
  };
  assert.equal(resolveCurriculumItem(items[0], mismatchedMissionContent), null);

  const mismatchedStableId: CurriculumItem = { ...items[0], contentId: 'different_content_id' };
  assert.equal(resolveCurriculumItem(mismatchedStableId, content), null);
  assert.throws(
    () => buildUnit1MissionItems('msa', [
      {
        missionId: 'duplicate',
        missionKind: 'lesson',
        title: 'One',
        route: { screen: 'lesson', params: { type: 'duplicate' } },
        homeHref: '/lesson?type=duplicate',
      },
      {
        missionId: 'duplicate',
        missionKind: 'lesson',
        title: 'Two',
        route: { screen: 'lesson', params: { type: 'duplicate' } },
        homeHref: '/lesson?type=duplicate',
      },
    ], 'msa'),
    /Duplicate Unit 1 mission ID/,
  );
  assert.throws(
    () => buildUnit1MissionItems('msa', [{
      missionId: '../unsafe',
      missionKind: 'lesson',
      title: 'Unsafe',
      route: { screen: 'lesson', params: { type: '../unsafe' } },
      homeHref: '/lesson?type=../unsafe',
    }], 'msa'),
    /Invalid Unit 1 mission ID/,
  );
  assert.throws(
    () => buildUnit1MissionItems('msa', [{
      missionId: 'wrong_route',
      missionKind: 'guided_dialogue',
      title: 'Wrong route',
      route: { screen: 'lesson', params: { type: 'wrong_route' } },
      homeHref: '/lesson?type=wrong_route',
    }], 'msa'),
    /Route does not support Unit 1 mission kind/,
  );
}

function testMissionOfflineReviewMemoryAndSrs() {
  const { items, content } = createSyntheticMissionFixture();
  const offlineFiles = buildOfflineManifestFilesForCurriculum('msa', items, content);
  assert.equal(offlineFiles.length, 9);
  assert.ok(offlineFiles.some(file => file.logicalPath.endsWith('/mission-vocabulary/1.mp3')));
  assert.equal(offlineFiles.filter(file => file.logicalPath.includes('/mission-dialogue/')).length, 8);

  const questions = buildPhase1ReviewQuestions(content, 'msa', 'unit1-mission-test', items);
  assert.ok(questions.length > 0);
  assert.ok(questions.every(question => question.id.startsWith('mission:en-ar:msa:unit-1:mission_dialogue:')));
  assert.ok(questions.some(question => question.format === 'listening'));
  assert.ok(questions.some(question => question.format === 'fill_conversation'));

  const memoryIndex = buildCurriculumWordUnitIndex([{ items, content }]);
  assert.equal(memoryIndex.get('mission word'), 1);

  const srsId = buildMissionSrsItemId({
    languagePair: 'en-ar',
    dialect: 'msa',
    unitId: 'unit-1',
    missionId: 'mission_dialogue',
    skill: 'listening',
    variantId: 'line-1',
  });
  assert.equal(srsId, 'mission:en-ar:msa:unit-1:mission_dialogue:listening:line-1');
  assert.notEqual(srsId, buildMissionSrsItemId({
    languagePair: 'en-ar',
    dialect: 'egyptian',
    unitId: 'unit-1',
    missionId: 'mission_dialogue',
    skill: 'listening',
    variantId: 'line-1',
  }));
}

function testCurrentReviewOutputIsUnchangedByAdapter() {
  const dialect = 'gulf';
  const content = getDialectContent(dialect);
  const items = getDialectCurriculumItems(dialect);
  const seed = 'unit1-adapter-regression';
  const withAdapter = buildPhase1ReviewQuestions(content, dialect, seed, items);
  const withoutUnit1 = buildPhase1ReviewQuestions(
    content,
    dialect,
    seed,
    items.filter(item => item.unitId !== 'unit-1'),
  );
  assert.deepEqual(withAdapter.map(question => question.id), withoutUnit1.map(question => question.id));
}

function testFinalMissionsAndChallengeGate() {
  const v2Unit = buildMsaUnit1CurriculumUnit('v2');
  const content = getDialectContent('msa');
  const finalMissions = [
    MSA_INTRODUCE_YOURSELF_MISSION,
    MSA_HOW_ARE_YOU_MISSION,
    MSA_BIG_REVIEW_MISSION,
    MSA_FIRST_CAFE_CONVERSATION_MISSION,
    MSA_FIRST_ARABIC_CHALLENGE_MISSION,
  ];
  finalMissions.forEach(mission => {
    assert.equal(mission.audioMode, 'none');
    assert.notEqual(content.missions[mission.missionId], mission);
    assert.equal(
      content.missions[mission.missionId].audioMode,
      mission.missionKind === 'review' || mission.missionKind === 'challenge' ? 'none' : 'default',
    );
    assert.ok(v2Unit.items.some(item => item.contentId === mission.missionId));
  });
  assert.deepEqual(MSA_INTRODUCE_YOURSELF_MISSION.lessonRounds?.map(round => round.words.length), [8, 8, 8]);
  assert.deepEqual(MSA_HOW_ARE_YOU_MISSION.lessonRounds?.map(round => round.words.length), [8, 8, 8]);
  assert.equal(MSA_FIRST_CAFE_CONVERSATION_MISSION.dialogue?.length, 14);
  const cafeItem = v2Unit.items.find(item => item.contentId === 'first_cafe_conversation');
  assert.ok(cafeItem);
  assert.equal(cafeItem.sceneImageKey, 'Cafe');
  const resolvedCafe = resolveCurriculumItem(cafeItem, content);
  assert.equal(resolvedCafe?.sceneImage, content.sceneImages.Cafe);
  assert.equal(shouldReserveScenarioImageSpace(cafeItem, resolvedCafe?.sceneImage), true);
  assert.equal(shouldReserveScenarioImageSpace(cafeItem, null), false);
  const existingCafeItem = getDialectCurriculum('msa').units[1].items.find(item => item.scenarioName === 'Cafe');
  assert.ok(existingCafeItem);
  assert.equal(resolveCurriculumItem(existingCafeItem, content)?.sceneImage, content.sceneImages.Cafe);
  assert.equal(readFileSync(require.resolve('../app/scenario.tsx'), 'utf8').includes('<ScrollView style={styles.bottomPanel}'), true);
  assert.equal(MSA_BIG_REVIEW_MISSION.quizQuestions?.length, 24);
  assert.equal(MSA_FIRST_ARABIC_CHALLENGE_MISSION.quizQuestions?.length, 20);
  assert.equal(MSA_FIRST_ARABIC_CHALLENGE_MISSION.passingScore, 16);
  assert.equal(getQuizPassedAtThreshold(15, 20, 16), false);
  assert.equal(getQuizPassedAtThreshold(16, 20, 16), true);
  assert.equal(v2Unit.items[12].title, 'Your First Arabic Challenge');
  assert.equal(v2Unit.items[12].contentId, 'first_arabic_challenge');

  const reviewA = buildMsaBigReviewQuestions('review-seed-a');
  const reviewARepeat = buildMsaBigReviewQuestions('review-seed-a');
  const reviewB = buildMsaBigReviewQuestions('review-seed-b');
  assert.deepEqual(reviewA, reviewARepeat);
  const positions = reviewA.flatMap(question => 'options' in question
    ? [question.options.findIndex(option => option.isCorrect)]
    : []);
  assert.ok(positions.some(position => position !== 0));
  assert.notDeepEqual(
    reviewA.map(question => 'options' in question ? question.options.map(option => option.isCorrect) : []),
    reviewB.map(question => 'options' in question ? question.options.map(option => option.isCorrect) : []),
  );
  positions.forEach((position, index) => {
    if (index >= 2) assert.ok(!(position === positions[index - 1] && position === positions[index - 2]));
  });
  reviewA.forEach(question => {
    if (!('options' in question)) return;
    const original = MSA_BIG_REVIEW_MISSION.quizQuestions?.find(candidate => candidate.id === question.id);
    assert.ok(original && 'options' in original);
    const correctArabic = original.options.find(option => option.isCorrect);
    assert.deepEqual(question.options.find(option => option.isCorrect), correctArabic);
    assert.equal(new Set(question.options.map(option => 'arabic' in option ? option.arabic : option.meaning)).size, question.options.length);
  });

  const challenge = buildMsaFirstArabicChallengeQuestions('challenge-test');
  const categoryCounts = new Map<string, number>();
  challenge.forEach(question => categoryCounts.set(question.category ?? '', (categoryCounts.get(question.category ?? '') ?? 0) + 1));
  assert.deepEqual(Object.fromEntries(categoryCounts), { mini_situation: 4, best_reply: 4, phrase_arrangement: 4, translation: 4, mixed_situation: 4 });
  assert.ok(challenge.every(question => question.hideTransliterationBeforeAnswer === true));
  assert.equal(challenge.some(question => question.id.includes(':big_review:')), false);

  const semanticIds = finalMissions.flatMap(mission => [
    ...(mission.lessonWords ?? []).map(word => (word as any).conceptId),
    ...(mission.quizQuestions ?? []).map(question => question.id),
  ]);
  assert.equal(new Set(semanticIds).size, semanticIds.length);
  [MSA_BIG_REVIEW_MISSION, MSA_FIRST_ARABIC_CHALLENGE_MISSION].forEach(mission => {
    mission.quizQuestions?.forEach(question => {
      if (!('options' in question)) return;
      const optionKeys = question.options.map(option => 'arabic' in option ? option.arabic : JSON.stringify(option));
      assert.equal(new Set(optionKeys).size, optionKeys.length);
      assert.equal(question.options.filter(option => option.isCorrect).length, 1);
    });
  });

  assert.notEqual(getDialectContent('gulf').missions.introduce_yourself, MSA_INTRODUCE_YOURSELF_MISSION);
  assert.notEqual(getDialectContent('egyptian').missions.first_arabic_challenge, MSA_FIRST_ARABIC_CHALLENGE_MISSION);

  const msaCurriculum = getDialectCurriculum('msa');
  const originalUnit = msaCurriculum.units[0];
  msaCurriculum.units[0] = v2Unit;
  try {
    assert.deepEqual(getContentAccess({ dialect: 'msa', unitId: 'unit-1', contentId: 'first_arabic_challenge', contentType: 'quiz', isPremium: false, isTestingUnlocked: false, completedContentIds: ['msa:unit-1:first_cafe_conversation'] }), { allowed: true, reason: 'free' });
    const firstUnit2 = msaCurriculum.units[1].items[0];
    const denied = getContentAccess({ dialect: 'msa', unitId: firstUnit2.unitId, contentId: firstUnit2.contentId, contentType: firstUnit2.contentType, isPremium: true, isTestingUnlocked: false, completedContentIds: ['msa:unit-1:first_cafe_conversation'] });
    assert.equal(denied.allowed, false);
    assert.equal(denied.reason, 'previous_incomplete');
    assert.equal(denied.requiredPreviousContentId, 'first_arabic_challenge');
    assert.equal(getContentAccess({ dialect: 'msa', unitId: firstUnit2.unitId, contentId: firstUnit2.contentId, contentType: firstUnit2.contentType, isPremium: true, isTestingUnlocked: false, completedContentIds: ['msa:unit-1:first_arabic_challenge'] }).allowed, true);
    assert.equal(getContentAccess({ dialect: 'msa', unitId: firstUnit2.unitId, contentId: firstUnit2.contentId, contentType: firstUnit2.contentType, isPremium: true, isTestingUnlocked: false, completedContentIds: ['gulf:unit-1:first_arabic_challenge'] }).allowed, false);
    assert.equal(getContentAccess({ dialect: 'msa', unitId: firstUnit2.unitId, contentId: firstUnit2.contentId, contentType: firstUnit2.contentType, isPremium: true, isTestingUnlocked: false, completedContentIds: ['msa:unit-1:dubai_challenge'] }).allowed, true);
    assert.equal(getContentAccess({ dialect: 'msa', unitId: firstUnit2.unitId, contentId: firstUnit2.contentId, contentType: firstUnit2.contentType, isPremium: true, isTestingUnlocked: false, completedContentIds: ['msa:unit-1:quiz_u1'] }).allowed, true);
    assert.equal(getDialectContentMeta('msa', 'dubai_challenge', 'quiz')?.contentId, 'first_arabic_challenge');
    assert.equal(getDialectContentMeta('msa', 'quiz_u1', 'quiz')?.contentId, 'first_arabic_challenge');
  } finally {
    msaCurriculum.units[0] = originalUnit;
  }
}

function testGulfUnit1V2() {
  const expected = [...MSA_V2_NATIVE_MISSION_IDS];
  const unit = buildGulfUnit1CurriculumUnit('v2');
  const legacy = buildGulfUnit1CurriculumUnit('legacy');
  const gulf = getDialectContent('gulf');
  const msa = getDialectContent('msa');
  const egyptian = getDialectContent('egyptian');
  assert.equal(resolveGulfUnit1CurriculumVersion({ requestedVersion:'v2', appEnv:'production', isLocalDevelopment:true }), 'legacy');
  assert.equal(resolveGulfUnit1CurriculumVersion({ requestedVersion:'v2', appEnv:'preview', isLocalDevelopment:false }), 'v2');
  assert.equal(resolveGulfUnit1CurriculumVersion({ requestedVersion:'v2', appEnv:'development', isLocalDevelopment:false }), 'v2');
  assert.deepEqual(unit.items.map(item => item.contentId), expected);
  assert.equal(unit.items.length, 13);
  assert.deepEqual(legacy.items.map(item => item.contentId), [...LEGACY_UNIT1_MISSION_IDS]);
  unit.items.forEach((item, index) => {
    const resolved = resolveCurriculumItem(item, gulf);
    assert.ok(resolved, `Gulf mission failed to resolve: ${item.contentId}`);
    assert.equal(resolved?.missionContent?.audioMode, index < 10 || index === 11 ? 'default' : 'none');
    assert.equal(resolved?.missionContent, gulf.missions[item.contentId]);
    assert.notEqual(resolved?.missionContent, msa.missions[item.contentId]);
    assert.notEqual(egyptian.missions[item.contentId], gulf.missions[item.contentId]);
  });
  unit.items.forEach((item,index)=>assert.equal(gulf.missions[item.contentId].pronunciationEnabled,index<10?true:index===11?false:undefined));
  buildMsaUnit1CurriculumUnit('v2').items.forEach((item,index)=>assert.equal(getDialectContent('msa').missions[item.contentId].pronunciationEnabled,index<10||index===11?false:undefined));
  assert.equal(gulf.missions.first_arabic_words.lessonWords?.[1].displayArabic, 'هلا');
  assert.equal(msa.missions.first_arabic_words.lessonWords?.[1].displayArabic, 'مرحباً');
  assert.equal(GULF_FIRST_CAFE_DIALOGUE.length, 14);
  const cafeItem = unit.items[11];
  assert.equal(cafeItem.sceneImageKey, 'Cafe');
  assert.equal(resolveCurriculumItem(cafeItem, gulf)?.sceneImage, gulf.sceneImages.Cafe);

  const review = buildGulfBigReviewQuestions('gulf-review-test');
  const reviewAgain = buildGulfBigReviewQuestions('gulf-review-test');
  assert.deepEqual(review, reviewAgain);
  assert.equal(review.length, 24);
  const positions = review.flatMap(question => 'options' in question ? [question.options.findIndex(option => option.isCorrect)] : []);
  assert.ok(positions.some(position => position !== 0));
  positions.forEach((position,index) => { if(index>=2) assert.ok(!(position===positions[index-1]&&position===positions[index-2])); });

  const challenge = buildGulfFirstArabicChallengeQuestions('gulf-challenge-test');
  assert.equal(challenge.length, 20);
  assert.ok(challenge.every(question => question.hideTransliterationBeforeAnswer));
  assert.equal(challenge.some(question => review.some(reviewQuestion => reviewQuestion.id === question.id)), false);
  const counts:Record<string,number>={}; challenge.forEach(question => { counts[question.category ?? '']=(counts[question.category ?? '']??0)+1; });
  assert.deepEqual(counts, { mini_situation:4, best_reply:4, phrase_arrangement:4, translation:4, mixed_situation:4 });
  [...review,...challenge].forEach(question => { if(!('options' in question))return; const keys=question.options.map(option=>'arabic'in option?option.arabic:'meaning'in option?option.meaning:JSON.stringify(option)); assert.equal(new Set(keys).size,keys.length); assert.equal(question.options.filter(option=>option.isCorrect).length,1); });
  const semanticIds=GULF_UNIT1_MISSIONS.flatMap(mission=>[...(mission.lessonWords??[]).map(word=>(word as any).conceptId),...(mission.quizQuestions??[]).map(question=>question.id)]);
  assert.equal(new Set(semanticIds).size,semanticIds.length);

  const gulfCurriculum=getDialectCurriculum('gulf'); const original=gulfCurriculum.units[0]; gulfCurriculum.units[0]=unit;
  try {
    const unit2=gulfCurriculum.units[1].items[0];
    assert.equal(getContentAccess({dialect:'gulf',unitId:'unit-1',contentId:'first_arabic_challenge',contentType:'quiz',isPremium:false,isTestingUnlocked:false,completedContentIds:['gulf:unit-1:first_cafe_conversation']}).allowed,true);
    const denied=getContentAccess({dialect:'gulf',unitId:unit2.unitId,contentId:unit2.contentId,contentType:unit2.contentType,isPremium:true,isTestingUnlocked:false,completedContentIds:['gulf:unit-1:first_cafe_conversation']}); assert.equal(denied.allowed,false); assert.equal(denied.requiredPreviousContentId,'first_arabic_challenge');
    assert.equal(getContentAccess({dialect:'gulf',unitId:unit2.unitId,contentId:unit2.contentId,contentType:unit2.contentType,isPremium:true,isTestingUnlocked:false,completedContentIds:['gulf:unit-1:first_arabic_challenge']}).allowed,true);
    assert.equal(getContentAccess({dialect:'gulf',unitId:unit2.unitId,contentId:unit2.contentId,contentType:unit2.contentType,isPremium:true,isTestingUnlocked:false,completedContentIds:['gulf:unit-1:quiz_u1']}).allowed,true);
    assert.equal(getContentAccess({dialect:'gulf',unitId:unit2.unitId,contentId:unit2.contentId,contentType:unit2.contentType,isPremium:true,isTestingUnlocked:false,completedContentIds:['msa:unit-1:first_arabic_challenge']}).allowed,false);
  } finally { gulfCurriculum.units[0]=original; }
  assert.equal(getQuizPassedAtThreshold(15,20,16),false); assert.equal(getQuizPassedAtThreshold(16,20,16),true);
  assert.equal(getDialectContentMeta('gulf','dubai_challenge','quiz'),null);
  const lessonSource=readFileSync(require.resolve('../app/lesson.tsx'),'utf8');
  const arabicTextBlock=lessonSource.match(/<Text\s+style=\{\[\s*styles\.arabicBig[\s\S]*?\]\}\s*>\s*\{displayedArabic\}\s*<\/Text>/)?.[0]??'';
  assert.ok(arabicTextBlock,'lesson card must render displayedArabic in the responsive Arabic text block');
  assert.doesNotMatch(arabicTextBlock,/numberOfLines|ellipsizeMode/,'Arabic lesson text must wrap without a line cap or ellipsis');
  assert.doesNotMatch(arabicTextBlock,/adjustsFontSizeToFit|minimumFontScale/,'Arabic lesson text must grow rather than auto-shrink');
  const wordCardStyle=lessonSource.match(/wordCard: \{[^\n]+/)?.[0]??'';
  assert.match(wordCardStyle,/minWidth: 0/);
  assert.match(wordCardStyle,/minHeight: 220/,'lesson card must establish a minimum while retaining natural content height');
  assert.doesNotMatch(wordCardStyle,/(?:^|[, {])height:/,'lesson card must not use a fixed height');
  assert.equal(lessonSource.includes("arabicBig: { width: '100%', minWidth: 0, alignSelf: 'stretch', flexShrink: 1"),true);
  assert.equal(lessonSource.includes("roman: { minWidth: 0, flexShrink: 1"),true,'transliteration must have wrap-safe width and shrinking');
  assert.equal(lessonSource.includes("english: { minWidth: 0, flexShrink: 1"),true,'English meaning must have wrap-safe width and shrinking');
  assert.match(lessonSource,/<Text style=\{styles\.roman\}>\{currentWord\.transliteration\}<\/Text>/,'transliteration must render without restrictive Text props');
  assert.match(lessonSource,/<Text style=\{styles\.english\}>\{currentWord\.english\}<\/Text>/,'English meaning must render without restrictive Text props');
  const scrollStart=lessonSource.indexOf('<ScrollView\n        style={styles.practiceArea}');
  const scrollEnd=lessonSource.indexOf('</ScrollView>',scrollStart);
  const cardPosition=lessonSource.indexOf('<View style={styles.wordCard}>',scrollStart);
  const controlsPosition=lessonSource.indexOf('<View style={styles.controls}>',cardPosition);
  const microphonePosition=lessonSource.indexOf('{isPronunciationEnabled && <View style={styles.primaryActionItem}>',controlsPosition);
  const nextPosition=lessonSource.indexOf('onPress={handleNext}',controlsPosition);
  assert.ok(scrollStart>=0&&scrollEnd>scrollStart,'lesson content must be inside a ScrollView');
  assert.ok(cardPosition>scrollStart&&controlsPosition>cardPosition&&controlsPosition<scrollEnd,'controls must remain in normal vertical flow below the growing card');
  assert.ok(microphonePosition>controlsPosition&&microphonePosition<scrollEnd,'microphone must remain in the scrollable vertical flow');
  assert.ok(nextPosition>controlsPosition&&nextPosition<scrollEnd,'Next must remain in the scrollable vertical flow');
  assert.equal(lessonSource.includes('Speaking practice is optional. Continue when ready.'),false);
  assert.equal(lessonSource.includes('{isPronunciationEnabled && <View style={styles.primaryActionItem}>'),true);
  assert.equal(lessonSource.includes('{!isAudioDisabled && ('),true);
  assert.equal(lessonSource.includes('getLessonEvaluationPayload(currentWord, dialect'),true);
  assert.equal(lessonSource.includes('evaluatePronunciation(stableUri, evaluation.targetText, evaluation.dialect, evaluation.context)'),true);
  assert.equal(lessonSource.includes("const playWordAudio = async () => {\n    if (isAudioDisabled) return;"),true);
  assert.equal(/play(?:Local)?Audio[^\n]*audioRecorder\.uri/.test(lessonSource),false);
}

function testEgyptianUnit1V2Bridge() {
  const unit = buildEgyptianUnit1CurriculumUnit('v2');
  assert.deepEqual(unit.items.map(item => item.contentId), [...MSA_V2_NATIVE_MISSION_IDS]);
  assert.deepEqual(buildEgyptianUnit1CurriculumUnit('legacy').items.map(item => item.contentId), [...LEGACY_UNIT1_MISSION_IDS]);
  assert.equal(resolveEgyptianUnit1CurriculumVersion({ requestedVersion:'v2', appEnv:'production', isLocalDevelopment:true }), 'legacy');
  assert.equal(EGYPTIAN_FIRST_CAFE_DIALOGUE.length, 14);
  assert.equal(buildEgyptianBigReviewQuestions('architecture').length, 24);
  assert.equal(buildEgyptianFirstArabicChallengeQuestions('architecture').length, 20);
  unit.items.forEach((item, index) => {
    const mission = getDialectContent('egyptian').missions[item.contentId];
    assert.ok(mission);
    assert.equal(mission.audioMode, index < 10 || index === 11 ? 'default' : 'none');
    assert.equal(mission.pronunciationEnabled, index < 10 ? true : index === 11 ? false : undefined);
    assert.notEqual(mission, getDialectContent('msa').missions[item.contentId]);
    assert.notEqual(mission, getDialectContent('gulf').missions[item.contentId]);
  });
}

function testAndroidSafeMissionTitlesAndIcons() {
  const supportedIcons = new Set([
    'book-open','circle-check','circle-help','coffee','door-open','hand-helping','hash','heart','home','key',
    'list-checks','map-pin','messages-square','package','palette','shirt','smile','sparkles','sun','trophy','user','users',
  ]);
  const units = [
    buildMsaUnit1CurriculumUnit('v2').items,
    buildGulfUnit1CurriculumUnit('v2').items,
    buildEgyptianUnit1CurriculumUnit('v2').items,
    MSA_UNIT2_V2_DEFINITIONS,
    GULF_UNIT2_V2_DEFINITIONS,
    EGYPTIAN_UNIT2_V2_DEFINITIONS,
  ];
  for (const items of units) {
    for (const item of items) {
      const canonicalTitle = item.title;
      const displayTitle = getMissionDisplayTitle(canonicalTitle);
      const semanticId = item.missionId ?? ('contentId' in item ? item.contentId : '');
      assert.equal(item.title, canonicalTitle, 'display sanitization must not mutate canonical curriculum titles');
      assert.equal(hasUnsafeMissionTitleGlyph(displayTitle), false, `${semanticId} has an unsafe placeholder glyph`);
      assert.doesNotMatch(displayTitle, /(?:👨‍👩‍👧|☀️|✅|🏠|🔑|👕|🧺|🚪|👋|😊|☕|🎨|🔢|📍)$/u);
      assert.ok(supportedIcons.has(getMissionIconKey({
        contentId: semanticId,
        contentType: item.missionKind === 'guided_dialogue' ? 'scenario' : item.missionKind === 'review' || item.missionKind === 'challenge' ? 'quiz' : 'lesson',
        missionKind: item.missionKind,
      })), `${semanticId} must resolve a supported Lucide icon or safe generic fallback`);
    }
  }
  assert.equal(getMissionDisplayTitle('Where Are My Things? 🔑'), 'Where Are My Things?');
  assert.equal(getMissionDisplayTitle('Ready or Missing? ✅'), 'Ready or Missing?');
  assert.equal(getMissionDisplayTitle('How Are You?'), 'How Are You?');

  const learnSource = readFileSync(require.resolve('../app/(tabs)/index.tsx'), 'utf8');
  const lessonSource = readFileSync(require.resolve('../app/lesson.tsx'), 'utf8');
  assert.match(learnSource, /getMissionDisplayTitle\(item\.title\)/);
  assert.match(lessonSource, /getMissionDisplayTitle\(canonicalLessonTitle\)/);
  assert.doesNotMatch(learnSource, /done \? '✅' : '🎯'|🔒 Sign up to unlock|🔒 Complete previous lesson/);
}

function main() {
  testMsaV2FlagSafetyAndBridge();
  testFirstArabicWordsMissionDataAndIsolation();
  testPoliteLikeALocalMissionDataAndIsolation();
  testMissionsThreeThroughEightDataAndIsolation();
  testFirstArabicWordsSrsAndOfflineIdentity();
  testPoliteLikeALocalSrsAndOfflineIdentity();
  testLegacyUnit1Compatibility();
  testArbitraryMissionResolutionAndProgression();
  testMissionOfflineReviewMemoryAndSrs();
  testCurrentReviewOutputIsUnchangedByAdapter();
  testFinalMissionsAndChallengeGate();
  testGulfUnit1V2();
  testEgyptianUnit1V2Bridge();
  testAndroidSafeMissionTitlesAndIcons();
  console.log('Unit 1 mission architecture regression tests passed.');
}

main();
