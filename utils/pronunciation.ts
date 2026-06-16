import { supabase } from './supabase';

export type PronunciationResult = {
  result: 'pass' | 'close' | 'fail';
  feedback: string;
};

type SpeechContext = 'onboarding' | 'lesson' | 'scenario';

type EvaluateSpeechResponse = {
  result?: unknown;
  feedback?: unknown;
  score?: unknown;
  transcript?: unknown;
  error?: unknown;
};

const FALLBACK_RESULT: PronunciationResult = {
  result: 'fail',
  feedback: 'Couldn’t check that. Try again.',
};

function normalizeResult(value: unknown): PronunciationResult['result'] {
  return value === 'pass' || value === 'close' || value === 'fail' ? value : 'fail';
}

export async function evaluatePronunciation(
  recordingUri: string,
  targetText: string,
  dialect: string,
  context: SpeechContext = 'lesson',
): Promise<PronunciationResult> {
  const form = new FormData();
  form.append('file', {
    uri: recordingUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);
  form.append('targetText', targetText);
  form.append('dialect', dialect);
  form.append('context', context);

  try {
    const { data, error } = await supabase.functions.invoke<EvaluateSpeechResponse>(
      'evaluate-speech',
      { body: form },
    );

    if (error) {
      console.warn('[pronunciation] evaluate-speech error:', error.message);
      return FALLBACK_RESULT;
    }

    if (data?.error) {
      console.warn('[pronunciation] evaluate-speech returned error:', data.error);
      return FALLBACK_RESULT;
    }

    return {
      result: normalizeResult(data?.result),
      feedback:
        typeof data?.feedback === 'string' && data.feedback.trim().length > 0
          ? data.feedback.trim()
          : FALLBACK_RESULT.feedback,
    };
  } catch (err: any) {
    console.warn('[pronunciation] evaluate-speech request failed:', err?.message ?? err);
    return FALLBACK_RESULT;
  }
}
