const TASHKEEL_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL_RE = /\u0640/g;
const PUNCTUATION_RE = /[\p{P}\p{S}]/gu;

export function normalizeArabicForAudioQa(text: string): string {
  return text
    .toLowerCase()
    .replace(TASHKEEL_RE, '')
    .replace(TATWEEL_RE, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(PUNCTUATION_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function looseArabicForAudioQa(text: string): string {
  return normalizeArabicForAudioQa(text).replace(/ة/g, 'ه');
}

export function levenshteinDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j] + substitutionCost,
      );
    }
    for (let j = 0; j <= b.length; j++) previous[j] = current[j];
  }

  return previous[b.length];
}

export function similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLength = Math.max(a.length, b.length);
  return (maxLength - levenshteinDistance(a, b)) / maxLength;
}

export function isAcceptedAudioVariant(target: string, transcript: string): boolean {
  const normalizedTarget = normalizeArabicForAudioQa(target);
  const normalizedTranscript = normalizeArabicForAudioQa(transcript);
  const variants: Record<string, string[]> = {
    مشكور: ['مشكور', 'شكرا', 'تسلم'],
    شكرا: ['شكرا', 'مشكور', 'تسلم'],
    'السلام عليكم': ['السلام عليكم', 'سلام عليكم', 'السلام'],
    'وعليكم السلام': ['وعليكم السلام', 'وعليكم', 'السلام'],
    اي: ['اي', 'ايوه', 'نعم'],
    لا: ['لا'],
  };

  return (variants[normalizedTarget] ?? [normalizedTarget]).includes(normalizedTranscript);
}
