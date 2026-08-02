import type { Word } from '../../constants/words';
import type {
  CommercialAccess,
  CurriculumContentType,
  CurriculumRoute,
  CurriculumUnit,
  DialectMissionContent,
  MissionCurriculumItem,
  MissionKind,
  SupportedDialect,
} from './types';

export const LEGACY_UNIT1_MISSION_IDS = [
  'basic_words',
  'greetings',
  'intro',
  'quiz_u1',
] as const;

export type LegacyUnit1MissionId = typeof LEGACY_UNIT1_MISSION_IDS[number];

export interface Unit1MissionDefinition {
  missionId: string;
  missionKind: MissionKind;
  title: string;
  subtitle?: string;
  route: CurriculumRoute;
  homeHref: string;
  commercialAccess?: CommercialAccess;
  contentRefKey?: string;
  sceneImageKey?: string;
}

const MISSION_ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

function assertMissionId(missionId: string) {
  if (!MISSION_ID_PATTERN.test(missionId)) {
    throw new Error(`Invalid Unit 1 mission ID: ${missionId}`);
  }
}

function getRouteContentType(route: CurriculumRoute): CurriculumContentType {
  if (route.screen === 'lesson') return 'lesson';
  if (route.screen === 'scenario') return 'scenario';
  if (route.screen === 'writing') return 'writing';
  return 'quiz';
}

export function getMissionContentType(missionKind: MissionKind): CurriculumContentType {
  if (missionKind === 'guided_dialogue' || missionKind === 'scenario') return 'scenario';
  if (missionKind === 'review' || missionKind === 'challenge') return 'quiz';
  return 'lesson';
}

export function buildUnit1MissionItems(
  dialect: SupportedDialect,
  definitions: readonly Unit1MissionDefinition[],
  acceptedTransliterationProfile: string,
): MissionCurriculumItem[] {
  const seen = new Set<string>();
  return definitions.map(definition => {
    assertMissionId(definition.missionId);
    const contentType = getMissionContentType(definition.missionKind);
    if (getRouteContentType(definition.route) !== contentType) {
      throw new Error(`Route does not support Unit 1 mission kind: ${definition.missionId}`);
    }
    if (
      (definition.route.screen === 'lesson' || definition.route.screen === 'scenario')
      && definition.route.params.type !== definition.missionId
    ) {
      throw new Error(`Route type must match Unit 1 mission ID: ${definition.missionId}`);
    }
    if (seen.has(definition.missionId)) {
      throw new Error(`Duplicate Unit 1 mission ID: ${definition.missionId}`);
    }
    seen.add(definition.missionId);
    return {
      dialect,
      unitId: 'unit-1',
      contentId: definition.missionId,
      contentType,
      title: definition.title,
      subtitle: definition.subtitle,
      route: definition.route,
      homeHref: definition.homeHref,
      availability: 'available',
      commercialAccess: definition.commercialAccess ?? 'free',
      missionId: definition.missionId,
      missionKind: definition.missionKind,
      contentRef: {
        source: 'dialect-mission',
        key: definition.contentRefKey ?? definition.missionId,
      },
      quizUnit: contentType === 'quiz'
        && (definition.route.screen === 'quiz' || definition.route.screen === 'quiz-unit2')
        ? definition.route.params.unit
        : undefined,
      acceptedTransliterationProfile,
      sceneImageKey: definition.sceneImageKey,
    };
  });
}

export function buildMissionItems(
  dialect: SupportedDialect,
  unitId: string,
  definitions: readonly Unit1MissionDefinition[],
  acceptedTransliterationProfile: string,
): MissionCurriculumItem[] {
  return buildUnit1MissionItems(dialect, definitions, acceptedTransliterationProfile).map(item => ({
    ...item,
    unitId,
  }));
}

type LegacyUnit1CurriculumOptions = {
  dialect: SupportedDialect;
  acceptedTransliterationProfile: string;
  quizScreen: 'quiz' | 'quiz-unit2';
  quizUnit?: string;
  quizSubtitle: string;
};

export function buildLegacyUnit1CurriculumUnit({
  dialect,
  acceptedTransliterationProfile,
  quizScreen,
  quizUnit,
  quizSubtitle,
}: LegacyUnit1CurriculumOptions): CurriculumUnit {
  const quizParams = quizUnit ? { unit: quizUnit } : {};
  const quizHref = quizScreen === 'quiz'
    ? (quizUnit ? `/quiz?unit=${quizUnit}` : '/quiz')
    : `/quiz-unit2?unit=${quizUnit}`;
  const definitions: Unit1MissionDefinition[] = [
    {
      missionId: 'basic_words',
      missionKind: 'lesson',
      title: 'Basic Words',
      subtitle: '3 mins',
      route: { screen: 'lesson', params: { type: 'basic_words' } },
      homeHref: '/lesson?type=basic_words',
    },
    {
      missionId: 'greetings',
      missionKind: 'lesson',
      title: 'Common Greetings',
      subtitle: '3 mins',
      route: { screen: 'lesson', params: { type: 'greetings' } },
      homeHref: '/lesson?type=greetings',
    },
    {
      missionId: 'intro',
      missionKind: 'lesson',
      title: 'Introduce Yourself',
      subtitle: '4 mins',
      route: { screen: 'lesson', params: { type: 'intro' } },
      homeHref: '/lesson?type=intro',
    },
    {
      missionId: 'quiz_u1',
      missionKind: 'challenge',
      title: 'Unit 1 Quiz',
      subtitle: quizSubtitle,
      route: { screen: quizScreen, params: quizParams },
      homeHref: quizHref,
    },
  ];

  return {
    dialect,
    unitId: 'unit-1',
    title: 'Unit 1: First Words',
    availability: 'available',
    items: buildUnit1MissionItems(dialect, definitions, acceptedTransliterationProfile),
  };
}

export function createMissionContentRegistry(
  entries: readonly DialectMissionContent[],
): Record<string, DialectMissionContent> {
  const registry: Record<string, DialectMissionContent> = {};
  entries.forEach(entry => {
    assertMissionId(entry.missionId);
    if (Object.prototype.hasOwnProperty.call(registry, entry.missionId)) {
      throw new Error(`Duplicate mission content ID: ${entry.missionId}`);
    }
    registry[entry.missionId] = entry;
  });
  return registry;
}

export function createLegacyUnit1MissionContent(input: {
  basicWords: Word[];
  greetings: Word[];
  intro: Word[];
}): Record<LegacyUnit1MissionId, DialectMissionContent> {
  return createMissionContentRegistry([
    { missionId: 'basic_words', missionKind: 'lesson', lessonWords: input.basicWords, reviewable: false },
    { missionId: 'greetings', missionKind: 'lesson', lessonWords: input.greetings, reviewable: false },
    { missionId: 'intro', missionKind: 'lesson', lessonWords: input.intro, reviewable: false },
    { missionId: 'quiz_u1', missionKind: 'challenge', reviewable: false },
  ]) as Record<LegacyUnit1MissionId, DialectMissionContent>;
}
