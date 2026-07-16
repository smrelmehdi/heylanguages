import { supabase } from './supabase';

export type PronunciationResult = {
  result: 'pass' | 'close' | 'fail' | 'unavailable';
  feedback: string;
  score?: number;
  transcript?: string;
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
  result: 'unavailable',
  feedback: 'Could not check pronunciation. You can continue.',
};

function normalizeResult(value: unknown): PronunciationResult['result'] {
  return value === 'pass' || value === 'close' || value === 'fail' || value === 'unavailable'
    ? value
    : 'fail';
}

function normalizeScore(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : undefined;
}

export async function evaluatePronunciation(
  recordingUri: string,
  targetText: string,
  dialect: string,
  context: SpeechContext = 'lesson',
  hint?: string,
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
  if (hint) form.append('hint', hint);

  try {
    if (__DEV__) {
      console.log('[pronunciation:start]', {
        targetText,
        dialect,
        context,
      });
    }

    const { data, error } = await supabase.functions.invoke<EvaluateSpeechResponse>(
      'evaluate-speech',
      { body: form },
    );

    if (error) {
      if (__DEV__) {
        // Try to extract the actual response body for easier diagnosis
        const ctx = (error as any)?.context;
        const bodyText: string = ctx instanceof Response
          ? await ctx.clone().text().catch(() => '(unreadable)')
          : '(no context)';
        console.warn('[pronunciation:http-error]', {
          status: ctx instanceof Response ? ctx.status : 'unknown',
          body: bodyText,
          targetText,
          dialect,
          context,
        });
      }
      return FALLBACK_RESULT;
    }

    if (data?.error) {
      console.warn('[pronunciation] evaluate-speech returned error:', data.error);
      if (__DEV__) {
        console.warn('[pronunciation:unavailable]', {
          targetText,
          dialect,
          context,
          message: String(data.error),
        });
        console.warn('[pronunciation:error]', {
          error: data.error,
          targetText,
          dialect,
          context,
        });
      }
      return FALLBACK_RESULT;
    }

    const score = normalizeScore(data?.score);
    const transcript = typeof data?.transcript === 'string' ? data.transcript.trim() : undefined;
    const result = {
      result: normalizeResult(data?.result),
      feedback:
        typeof data?.feedback === 'string' && data.feedback.trim().length > 0
          ? data.feedback.trim()
          : FALLBACK_RESULT.feedback,
      ...(score !== undefined ? { score } : {}),
      ...(transcript ? { transcript } : {}),
    };

    if (__DEV__) {
      console.log('[pronunciation:result]', {
        result: result.result,
        score,
        feedback: result.feedback,
        transcript: result.transcript,
        targetText,
        dialect,
        context,
      });
    }

    return result;
  } catch (err: any) {
    console.warn('[pronunciation] evaluate-speech request failed:', err?.message ?? err);
    if (__DEV__) {
      const error = err;
      console.warn('[pronunciation:unavailable]', {
        targetText,
        dialect,
        context,
        message: error?.message ?? String(error),
      });
      console.warn('[pronunciation:error]', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        targetText,
        dialect,
        context,
        error,
      });
    }
    return FALLBACK_RESULT;
  }
}
