import type { DialectContent } from '../data/content-registry';
import type { CurriculumItem } from '../data/curriculum';
import { resolveCurriculumItem } from './content-resolver';

export type CurriculumMemorySource = {
  items: readonly CurriculumItem[];
  content: DialectContent;
};

export function normalizeCurriculumMemoryWord(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[.,!?؟،؛:"'()[\]{}…\-_/\\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildCurriculumWordUnitIndex(sources: readonly CurriculumMemorySource[]) {
  const index = new Map<string, number>();

  sources.forEach(({ items, content }) => {
    items.forEach(item => {
      const unit = Number(item.unitId.replace('unit-', ''));
      if (!Number.isFinite(unit)) return;
      resolveCurriculumItem(item, content)?.lessonWords?.forEach(word => {
        [word.arabic, word.displayArabic, word.evalTarget, word.audioText]
          .filter((value): value is string => Boolean(value))
          .forEach(value => {
            const normalized = normalizeCurriculumMemoryWord(value);
            if (!normalized) return;
            index.set(normalized, Math.min(index.get(normalized) ?? unit, unit));
          });
      });
    });
  });

  return index;
}
