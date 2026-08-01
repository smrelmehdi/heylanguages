export const NO_SPEECH_FEEDBACK = "I couldn't hear you. Try again.";

export type SpeechQualitySignals = {
  confidence?: number;
  noSpeechProbability?: number;
  durationSeconds?: number;
  fileSizeBytes?: number;
};

const HALLUCINATION_PHRASES = [
  'اشتركوا في القناة',
  'اشترك في القناة',
  'لا تنسوا الاشتراك في القناة',
  'شكرا على المشاهدة',
  'ترجمة نانسي قنقر',
] as const;

export function normalizePronunciationTranscript(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const NORMALIZED_HALLUCINATIONS = HALLUCINATION_PHRASES.map(normalizePronunciationTranscript);

export function isKnownSpeechHallucination(transcript: string): boolean {
  const normalized = normalizePronunciationTranscript(transcript);
  return NORMALIZED_HALLUCINATIONS.some(
    phrase => normalized === phrase || normalized.includes(phrase),
  );
}

export function classifyUnusableSpeech(
  transcript: string,
  targetText: string,
  signals: SpeechQualitySignals = {},
): 'no_speech' | 'unusable_audio' | null {
  const normalized = normalizePronunciationTranscript(transcript);
  const normalizedTarget = normalizePronunciationTranscript(targetText);

  if (!normalized || isKnownSpeechHallucination(normalized)) return 'no_speech';

  if (signals.fileSizeBytes !== undefined && signals.fileSizeBytes < 512) return 'unusable_audio';
  if (signals.durationSeconds !== undefined && signals.durationSeconds < 0.18) return 'unusable_audio';
  if (signals.noSpeechProbability !== undefined && signals.noSpeechProbability >= 0.8) return 'no_speech';

  // Preserve valid short Arabic targets when the audio signals do not strongly indicate silence.
  if (normalizedTarget && normalized === normalizedTarget) return null;

  if (signals.noSpeechProbability !== undefined && signals.noSpeechProbability >= 0.6) return 'no_speech';
  if (signals.confidence !== undefined && signals.confidence < 0.2) return 'unusable_audio';

  return null;
}
