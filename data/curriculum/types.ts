import type { Word } from '../../constants/words';
import type { DialogueTurn } from '../content-registry';
import type { QuizQuestion } from '../quiz-types';

export type SupportedDialect = 'gulf' | 'egyptian' | 'msa';
export type CurriculumContentType = 'lesson' | 'scenario' | 'writing' | 'quiz';
export type CurriculumAvailability = 'available' | 'shared' | 'unavailable';
export type CommercialAccess = 'free' | 'premium';
export type MissionKind = 'lesson' | 'guided_dialogue' | 'review' | 'scenario' | 'challenge';
/** `none` suppresses playback/TTS and leaves pronunciation practice optional. */
export type MissionAudioMode = 'default' | 'none';
export type Unit1BlueprintRole = 'native_mission' | 'temporary_legacy_compatibility';

export interface MissionLessonWord extends Word {
  conceptId: string;
}

export interface MissionLessonRound {
  roundId: string;
  title: string;
  words: MissionLessonWord[];
}

export interface CurriculumContentReference {
  source: 'dialect-mission';
  key: string;
}

export interface DialectMissionContent {
  missionId: string;
  missionKind: MissionKind;
  lessonWords?: Word[];
  lessonRounds?: MissionLessonRound[];
  dialogue?: DialogueTurn[];
  quizQuestions?: QuizQuestion[];
  passingScore?: number;
  objective?: string;
  completionMessage?: string;
  audioMode?: MissionAudioMode;
  /** Enables recording/evaluation independently of lesson audio playback. */
  pronunciationEnabled?: boolean;
  /** Phase 1 keeps legacy review output unchanged; future missions opt in explicitly. */
  reviewable?: boolean;
}

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
  missionId?: string;
  missionKind?: MissionKind;
  unit1BlueprintRole?: Unit1BlueprintRole;
  contentRef?: CurriculumContentReference;
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

export interface MissionCurriculumItem extends CurriculumItem {
  missionId: string;
  missionKind: MissionKind;
  contentRef: CurriculumContentReference;
}

export interface CurriculumUnit {
  dialect: SupportedDialect;
  unitId: string;
  title: string;
  subtitle?: string;
  availability: CurriculumAvailability;
  items: CurriculumItem[];
}

export interface DialectCurriculum {
  dialect: SupportedDialect;
  units: CurriculumUnit[];
}

export interface ResolvedContent {
  item: CurriculumItem;
  missionContent?: DialectMissionContent;
  lessonWords?: Word[];
  dialogue?: DialogueTurn[];
  sceneImage?: any;
}
