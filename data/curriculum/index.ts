import { EGYPTIAN_CURRICULUM } from './egyptian';
import { GULF_CURRICULUM } from './gulf';
import { MSA_CURRICULUM } from './msa';
import type { DialectCurriculum, SupportedDialect } from './types';

export type {
  CommercialAccess,
  CurriculumAvailability,
  CurriculumContentType,
  CurriculumItem,
  CurriculumContentReference,
  CurriculumRoute,
  CurriculumUnit,
  DialectMissionContent,
  DialectCurriculum,
  MissionCurriculumItem,
  MissionKind,
  ResolvedContent,
  SupportedDialect,
} from './types';

export {
  buildLegacyUnit1CurriculumUnit,
  buildUnit1MissionItems,
  createLegacyUnit1MissionContent,
  createMissionContentRegistry,
  getMissionContentType,
  LEGACY_UNIT1_MISSION_IDS,
} from './unit1';
export type { LegacyUnit1MissionId, Unit1MissionDefinition } from './unit1';

export const CURRICULUM_BY_DIALECT: Record<SupportedDialect, DialectCurriculum> = {
  gulf: GULF_CURRICULUM,
  egyptian: EGYPTIAN_CURRICULUM,
  msa: MSA_CURRICULUM,
};

export function isSupportedCurriculumDialect(value: string): value is SupportedDialect {
  return value === 'gulf' || value === 'egyptian' || value === 'msa';
}

export function getDialectCurriculum(dialect: string): DialectCurriculum {
  if (!isSupportedCurriculumDialect(dialect)) {
    throw new Error(`Unsupported curriculum dialect: ${dialect}`);
  }
  return CURRICULUM_BY_DIALECT[dialect];
}
