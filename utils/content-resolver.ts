import { getDialectContent, type DialectContent } from '../data/content-registry';
import {
  getDialectCurriculum,
  isSupportedCurriculumDialect,
  type CurriculumContentType,
  type CurriculumItem,
  type DialectMissionContent,
  type ResolvedContent,
  type SupportedDialect,
} from '../data/curriculum';

type ResolveContentInput = {
  dialect: string;
  unitId?: string;
  contentId: string | null | undefined;
  contentType?: CurriculumContentType;
};

export type MissingContentDiagnostic = {
  dialect: SupportedDialect;
  unitId?: string;
  contentId: string | null | undefined;
  contentType?: CurriculumContentType;
  reason: string;
};

function normalizeDialect(dialect: string): SupportedDialect | null {
  return isSupportedCurriculumDialect(dialect) ? dialect : null;
}

export function normalizePublicContentId(contentId: string | null | undefined) {
  if (!contentId) return null;
  if (contentId === 'basic-words' || contentId === 'basic') return 'basic_words';
  return contentId;
}

export function getCurriculumMissionId(item: CurriculumItem) {
  return item.missionId ?? item.contentId;
}

export function getMissionContentForItem(
  item: CurriculumItem,
  content: DialectContent,
): DialectMissionContent | null {
  if (!item.contentRef) return null;
  if (!item.missionId || item.missionId !== item.contentId) return null;
  if (item.contentRef.source !== 'dialect-mission') return null;
  const missionContent = content.missions[item.contentRef.key];
  if (!missionContent) return null;
  if (missionContent.missionId !== getCurriculumMissionId(item)) return null;
  if (!item.missionKind || missionContent.missionKind !== item.missionKind) return null;
  return missionContent;
}

export function resolveCurriculumItem(
  item: CurriculumItem,
  content: DialectContent,
): ResolvedContent | null {
  const missionContent = item.contentRef
    ? getMissionContentForItem(item, content) ?? undefined
    : undefined;
  if (item.contentRef && !missionContent) return null;

  if (item.missionKind === 'guided_dialogue' || item.missionKind === 'scenario') {
    const dialogue = missionContent?.dialogue ?? [];
    if (dialogue.length === 0) return null;
    return {
      item,
      missionContent,
      dialogue,
      sceneImage: content.sceneImages[item.sceneImageId ?? item.sceneImageKey ?? item.scenarioName ?? ''],
    };
  }

  if (item.contentType === 'lesson') {
    const lessonWords = missionContent?.lessonWords ?? item.lessonWords;
    if (!lessonWords || lessonWords.length === 0) return null;
    return { item, missionContent, lessonWords };
  }

  if (item.contentType === 'scenario') {
    if (!item.scenarioName) return null;
    const dialogue = content.scenarios[item.scenarioName] ?? [];
    if (dialogue.length === 0) return null;
    return {
      item,
      missionContent,
      dialogue,
      sceneImage: content.sceneImages[item.sceneImageId ?? item.sceneImageKey ?? item.scenarioName],
    };
  }

  return { item, missionContent };
}

export function shouldReserveScenarioImageSpace(item: CurriculumItem, sceneImage: unknown) {
  return item.missionKind !== 'guided_dialogue' || Boolean(sceneImage);
}

export function getDialectCurriculumItems(dialect: string, includeUnavailable = false): CurriculumItem[] {
  const supportedDialect = normalizeDialect(dialect);
  if (!supportedDialect) return [];
  return getDialectCurriculum(supportedDialect).units.flatMap(unit =>
    includeUnavailable ? unit.items : unit.items.filter(item => item.availability !== 'unavailable')
  );
}

export function getDialectProgressionItems(dialect: string): CurriculumItem[] {
  return getDialectCurriculumItems(dialect).filter(item => item.availability !== 'unavailable');
}

export function getDialectContentMeta(
  dialect: string,
  contentId: string | null | undefined,
  contentType?: CurriculumContentType,
) {
  const normalized = normalizePublicContentId(contentId);
  if (!normalized) return null;
  const items = getDialectCurriculumItems(dialect, true);
  const direct = items.find(item =>
    (item.contentId === normalized || item.missionId === normalized)
      && (!contentType || item.contentType === contentType)
  );
  if (direct) return direct;
  if (dialect === 'msa' && (normalized === 'dubai_challenge' || normalized === 'quiz_u1')) {
    return items.find(item => item.contentId === 'first_arabic_challenge' && (!contentType || item.contentType === contentType)) ?? null;
  }
  return null;
}

export function isContentAvailableForDialect(dialect: string, contentId: string | null | undefined, contentType?: CurriculumContentType) {
  const item = getDialectContentMeta(dialect, contentId, contentType);
  return Boolean(
    item
      && item.availability !== 'unavailable'
      && resolveCurriculumItem(item, getDialectContent(dialect)),
  );
}

export function getMissingContentDiagnostic(input: ResolveContentInput): MissingContentDiagnostic | null {
  const dialect = normalizeDialect(input.dialect);
  if (!dialect) {
    return { ...input, dialect: 'gulf', reason: `Unsupported curriculum dialect: ${input.dialect}` };
  }
  const item = getDialectContentMeta(dialect, input.contentId, input.contentType);
  if (!item) {
    return { ...input, dialect, reason: 'No curriculum item exists for this dialect/content pair.' };
  }
  if (item.availability === 'unavailable') {
    return { ...input, dialect, reason: 'Curriculum item is marked unavailable for this dialect.' };
  }
  if (!resolveCurriculumItem(item, getDialectContent(dialect))) {
    return { ...input, dialect, reason: 'Dialect mission content is missing or incompatible.' };
  }
  return null;
}

export function resolveContent(input: ResolveContentInput): ResolvedContent | null {
  const isDevelopment = (globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ === true;
  const dialect = normalizeDialect(input.dialect);
  if (!dialect) {
    if (isDevelopment) {
      console.warn('[content-resolver] Missing dialect content:', {
        ...input,
        reason: `Unsupported curriculum dialect: ${input.dialect}`,
      });
    }
    return null;
  }
  const diagnostic = getMissingContentDiagnostic({ ...input, dialect });
  if (diagnostic) {
    if (isDevelopment) {
      console.warn('[content-resolver] Missing dialect content:', diagnostic);
    }
    return null;
  }

  const item = getDialectContentMeta(dialect, input.contentId, input.contentType);
  if (!item) return null;
  return resolveCurriculumItem(item, getDialectContent(dialect));
}
