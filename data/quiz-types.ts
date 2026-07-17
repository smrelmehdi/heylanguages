export type QuizFormat =
  | 'scene_replay'
  | 'fill_conversation'
  | 'listening'
  | 'emoji_match'
  | 'transliteration_type'   // Tier 3+: type the transliteration from memory
  | 'arabic_select';          // Tier 4+: read Arabic script, no transliteration hints

interface BaseQuestion {
  id: string;
  format: QuizFormat;
  scenarioSource: string;
  xpValue: number;
}

export interface SceneReplayQuestion extends BaseQuestion {
  format: 'scene_replay';
  sceneImage: any;
  audioFile: any | null;
  audioText: string;
  prompt: string;
  options: { arabic: string; transliteration: string; isCorrect: boolean }[];
}

export interface FillConversationQuestion extends BaseQuestion {
  format: 'fill_conversation';
  dialogue: {
    speaker: 'yusuf' | 'npc';
    arabic: string;
    transliteration: string;
    isBlank: boolean;
  }[];
  options: { arabic: string; transliteration: string; isCorrect: boolean }[];
}

export interface ListeningQuestion extends BaseQuestion {
  format: 'listening';
  audioFile: any | null;
  audioText: string;
  options: { arabic: string; transliteration: string; isCorrect: boolean }[];
}

export interface EmojiMatchQuestion extends BaseQuestion {
  format: 'emoji_match';
  pairs: { arabic: string; transliteration: string; emoji: string }[];
}

/**
 * Tier 3+ — User hears audio and sees Arabic, then types the transliteration from memory.
 * Graded with fuzzy matching (see utils/quiz-level.ts gradeTransliteration).
 */
export interface TransliterationTypeQuestion extends BaseQuestion {
  format: 'transliteration_type';
  arabic: string;           // Arabic script shown (displayArabic)
  audioFile: any | null;
  audioText: string;
  english: string;          // English meaning shown for context
  correctAnswer: string;    // The canonical transliteration to match against
  acceptedAnswers?: string[];
  hintFirstWord: string;    // First word of correctAnswer revealed on hint tap
}

/**
 * Tier 4+ — User hears audio and picks from Arabic-script-only options.
 * No transliteration shown — forces recognition of the Arabic script.
 */
export interface ArabicSelectQuestion extends BaseQuestion {
  format: 'arabic_select';
  audioFile: any | null;
  audioText: string;
  english: string;
  options: { arabic: string; isCorrect: boolean }[];
}

export type QuizQuestion =
  | SceneReplayQuestion
  | FillConversationQuestion
  | ListeningQuestion
  | EmojiMatchQuestion
  | TransliterationTypeQuestion
  | ArabicSelectQuestion;
