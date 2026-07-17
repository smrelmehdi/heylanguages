/**
 * Quiz Tier Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Determines how hard a quiz session should be based on what the user has
 * already completed in the curriculum — not XP, not time, but actual mastery.
 *
 * Tiers (ascending):
 *  1 Starter  — default, no prerequisites
 *  2 Explorer — Unit 1 complete (words + greetings + intro)
 *  3 Reader   — 5+ Arabic alphabet families learned (Unit 3 in progress)
 *  4 Arabic Reader — All 14 Arabic alphabet families learned (Unit 3 complete)
 *
 * What each tier changes:
 *  • Available question formats
 *  • Whether transliteration is visible in answer options (the "training wheel")
 *  • Whether typing questions are included
 */

export type QuizTier = 1 | 2 | 3 | 4;

export interface QuizTierInfo {
  tier: QuizTier;
  label: string;
  icon: string;
  tagline: string;
  /** Formats the quiz engine may generate for this tier */
  formats: string[];
  /** Show/hide transliteration in multiple-choice option cards */
  showTranslit: boolean;
  /** Whether typing-answer questions are injected */
  hasTyping: boolean;
  /** Whether Arabic-script-only questions are injected */
  hasArabicSelect: boolean;
}

const ALPHABET_FAMILIES = [
  'alif_family', 'ba_family', 'jeem_family', 'dal_family', 'ra_family',
  'seen_family', 'sad_family', 'taa_family', 'ayn_family', 'fa_family',
  'kaf_family', 'meem_family', 'ha_family', 'ya_family',
] as const;

const UNIT1_IDS = ['basic_words', 'greetings', 'intro'] as const;

export function getQuizTier(completedIds: Iterable<string>): QuizTier {
  const completed = new Set(completedIds);
  const alphabetCount = ALPHABET_FAMILIES.filter(f => completed.has(f)).length;
  if (alphabetCount >= 14) return 4;
  if (alphabetCount >= 5)  return 3;
  if (UNIT1_IDS.every(id => completed.has(id))) return 2;
  return 1;
}

export function getQuizTierInfo(tier: QuizTier): QuizTierInfo {
  switch (tier) {
    case 1: return {
      tier: 1, label: 'Starter', icon: '🌱',
      tagline: 'Listen & recognise — no reading required yet',
      formats: ['listening', 'scene_replay'],
      showTranslit: true, hasTyping: false, hasArabicSelect: false,
    };
    case 2: return {
      tier: 2, label: 'Explorer', icon: '🗺️',
      tagline: 'Full dialogue practice with transliteration',
      formats: ['listening', 'scene_replay', 'fill_conversation', 'emoji_match'],
      showTranslit: true, hasTyping: false, hasArabicSelect: false,
    };
    case 3: return {
      tier: 3, label: 'Reader', icon: '📖',
      tagline: 'Transliteration hidden — tap to reveal if you need it',
      formats: ['listening', 'scene_replay', 'fill_conversation', 'emoji_match', 'transliteration_type'],
      showTranslit: false, hasTyping: true, hasArabicSelect: false,
    };
    case 4: return {
      tier: 4, label: 'Arabic Reader', icon: '📖',
      tagline: 'Read Arabic script without transliteration',
      formats: ['listening', 'scene_replay', 'fill_conversation', 'emoji_match', 'transliteration_type', 'arabic_select'],
      showTranslit: false, hasTyping: true, hasArabicSelect: true,
    };
  }
}

/** How many XP a typing question awards (more effort = more reward) */
export const TYPING_QUESTION_XP = 15;
export const ARABIC_SELECT_XP = 15;

export type TransliterationGradeStatus =
  | 'correct'
  | 'close'
  | 'incorrect'
  | 'empty'
  | 'arabic_input';

export type TransliterationGradeResult = {
  status: TransliterationGradeStatus;
  matchedAnswer?: string;
  canonicalAnswer: string;
  distance?: number;
};

/**
 * Normalize a transliteration string for fuzzy comparison.
 * Strips punctuation, collapses whitespace, lowercases.
 */
export function normalizeTranslit(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\w\s]/g, '')   // strip punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function containsArabic(raw: string) {
  return /[\u0600-\u06FF]/.test(raw);
}

/**
 * Simple Levenshtein distance between two strings.
 * Used to accept close-enough transliteration answers.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Grade a user's transliteration input against the correct answer.
 * Returns 'correct' | 'close' | 'wrong'.
 * 'close' counts as correct in scoring but shows corrective feedback.
 */
export function gradeTransliteration(
  userInput: string,
  correctAnswer: string,
  acceptedAnswers: string[] = [],
): TransliterationGradeResult {
  const canonicalAnswer = correctAnswer;
  if (userInput.trim().length === 0) {
    return { status: 'empty', canonicalAnswer };
  }
  if (containsArabic(userInput)) {
    return { status: 'arabic_input', canonicalAnswer };
  }

  const userN = normalizeTranslit(userInput);
  if (userN.length === 0) {
    return { status: 'empty', canonicalAnswer };
  }

  const answers = [correctAnswer, ...acceptedAnswers]
    .map(answer => ({ raw: answer, normalized: normalizeTranslit(answer) }))
    .filter(answer => answer.normalized.length > 0);

  const exact = answers.find(answer => answer.normalized === userN);
  if (exact) {
    return { status: 'correct', matchedAnswer: exact.raw, canonicalAnswer, distance: 0 };
  }

  let best = { raw: correctAnswer, normalized: normalizeTranslit(correctAnswer), distance: Number.POSITIVE_INFINITY };
  answers.forEach(answer => {
    const distance = levenshtein(userN, answer.normalized);
    if (distance < best.distance) best = { ...answer, distance };
  });

  const expectedLength = best.normalized.length;
  const tolerance =
    expectedLength <= 3 ? 0 :
    expectedLength <= 7 ? 1 :
    Math.min(3, Math.max(1, Math.floor(expectedLength * 0.18)));

  if (best.distance <= tolerance) {
    return {
      status: 'close',
      matchedAnswer: best.raw,
      canonicalAnswer,
      distance: best.distance,
    };
  }

  return {
    status: 'incorrect',
    matchedAnswer: best.raw,
    canonicalAnswer,
    distance: best.distance,
  };
}
