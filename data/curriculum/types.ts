import type { Word } from '../../constants/words';
import type { DialogueTurn } from '../content-registry';

export type SupportedDialect = 'gulf' | 'egyptian' | 'msa';
export type CurriculumContentType = 'lesson' | 'scenario' | 'writing' | 'quiz';
export type CurriculumAvailability = 'available' | 'shared' | 'unavailable';
export type CommercialAccess = 'free' | 'premium';

export type CurriculumRoute =
  | { screen: 'lesson'; params: { type: string } }
  | { screen: 'scenario'; params: { type: string } }
  | { screen: 'writing'; params: { family: string } }
  | { screen: 'quiz'; params: { unit?: string } }
  | { screen: 'quiz-unit2'; params: { unit?: string } };

export interface CurriculumItem {
  dialect: SupportedDialect;
  unitId: string;
  contentId: string;
  contentType: CurriculumContentType;
  title: string;
  subtitle?: string;
  route: CurriculumRoute;
  homeHref: string;
  availability: CurriculumAvailability;
  commercialAccess: CommercialAccess;
  sharedContentKey?: string;
  lessonKey?: 'basic' | 'greetings' | 'intro';
  lessonWords?: Word[];
  scenarioName?: string;
  quizUnit?: string;
  sceneImageKey?: string;
  sceneImageId?: string;
  sceneEntranceImageId?: string;
  description?: string;
  setting?: string;
  objective?: string;
  acceptedTransliterationProfile?: string;
}

export interface CurriculumUnit {
  dialect: SupportedDialect;
  unitId: string;
  title: string;
  availability: CurriculumAvailability;
  items: CurriculumItem[];
}

export interface DialectCurriculum {
  dialect: SupportedDialect;
  units: CurriculumUnit[];
}

export interface ResolvedContent {
  item: CurriculumItem;
  lessonWords?: Word[];
  dialogue?: DialogueTurn[];
  sceneImage?: any;
}
