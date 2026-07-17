import { getDialectContent } from '../data/content-registry';
import { getDialectCurriculum, isSupportedCurriculumDialect, type CurriculumContentType, type CurriculumItem, type ResolvedContent, type SupportedDialect } from '../data/curriculum';

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
  return getDialectCurriculumItems(dialect, true).find(item =>
    item.contentId === normalized && (!contentType || item.contentType === contentType)
  ) ?? null;
}

export function isContentAvailableForDialect(dialect: string, contentId: string | null | undefined, contentType?: CurriculumContentType) {
  const item = getDialectContentMeta(dialect, contentId, contentType);
  return Boolean(item && item.availability !== 'unavailable');
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
  return null;
}

export function resolveContent(input: ResolveContentInput): ResolvedContent | null {
  const dialect = normalizeDialect(input.dialect);
  if (!dialect) {
    if (__DEV__) {
      console.warn('[content-resolver] Missing dialect content:', {
        ...input,
        reason: `Unsupported curriculum dialect: ${input.dialect}`,
      });
    }
    return null;
  }
  const diagnostic = getMissingContentDiagnostic({ ...input, dialect });
  if (diagnostic) {
    if (__DEV__) {
      console.warn('[content-resolver] Missing dialect content:', diagnostic);
    }
    return null;
  }

  const item = getDialectContentMeta(dialect, input.contentId, input.contentType);
  if (!item) return null;
  const content = getDialectContent(dialect);

  if (item.contentType === 'lesson') {
    const lessonWords = item.lessonWords ?? (item.lessonKey ? content.lessons[item.lessonKey] : undefined);
    if (!lessonWords || lessonWords.length === 0) return null;
    return { item, lessonWords };
  }

  if (item.contentType === 'scenario') {
    if (!item.scenarioName) return null;
    const dialogue = content.scenarios[item.scenarioName] ?? [];
    if (dialogue.length === 0) return null;
    return {
      item,
      dialogue,
      sceneImage: content.sceneImages[item.sceneImageKey ?? item.scenarioName],
    };
  }

  return { item };
}
