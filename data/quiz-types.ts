export type QuizFormat = 'scene_replay' | 'fill_conversation' | 'listening' | 'emoji_match';

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

export type QuizQuestion =
  | SceneReplayQuestion
  | FillConversationQuestion
  | ListeningQuestion
  | EmojiMatchQuestion;
