import { getDialectContentMeta, getDialectProgressionItems, normalizePublicContentId } from './content-resolver';
import type { SupportedDialect } from '../data/curriculum';

export type CompletionKeyParts = {
  dialect: SupportedDialect;
  unitId: string;
  contentId: string;
};

export function buildCompletionKey(dialect: string, unitId: string, contentId: string) {
  return `${dialect}:${unitId}:${normalizePublicContentId(contentId) ?? contentId}`;
}

export function parseCompletionKey(key: string): CompletionKeyParts | null {
  const parts = key.split(':');
  if (parts.length !== 3) return null;
  const [dialect, unitId, contentId] = parts;
  if (dialect !== 'gulf' && dialect !== 'egyptian' && dialect !== 'msa') return null;
  if (!unitId || !contentId) return null;
  return { dialect, unitId, contentId };
}

export function getCanonicalCompletionKey(dialect: string, contentId: string | null | undefined) {
  const item = getDialectContentMeta(dialect, contentId);
  if (!item || item.availability === 'unavailable') return null;
  return buildCompletionKey(item.dialect, item.unitId, item.contentId);
}

export function getCompletionKeyCandidates(dialect: string, contentId: string | null | undefined) {
  const item = getDialectContentMeta(dialect, contentId);
  if (!item || item.availability === 'unavailable') return [];
  const canonical = buildCompletionKey(item.dialect, item.unitId, item.contentId);
  const candidates = [canonical];
  // Legacy unqualified progress belongs to Gulf only. This preserves existing
  // users without letting Gulf completion unlock Egyptian/MSA content.
  if (item.dialect === 'gulf') {
    candidates.push(item.contentId);
    if (item.contentId === 'basic_words') candidates.push('basic-words', 'basic');
  }
  return candidates;
}

export function hasCompletedContent(dialect: string, contentId: string | null | undefined, completedContentIds: Iterable<string>) {
  const completed = new Set(completedContentIds);
  return getCompletionKeyCandidates(dialect, contentId).some(key => completed.has(key));
}

export function getPreviousProgressionContentId(dialect: string, contentId: string | null | undefined) {
  const normalized = normalizePublicContentId(contentId);
  if (!normalized) return null;
  const order = getDialectProgressionItems(dialect);
  const index = order.findIndex(item => item.contentId === normalized);
  if (index < 0) return null;
  return index > 0 ? order[index - 1]?.contentId ?? null : null;
}

export function getFirstProgressionContentId(dialect: string) {
  return getDialectProgressionItems(dialect)[0]?.contentId ?? null;
}
