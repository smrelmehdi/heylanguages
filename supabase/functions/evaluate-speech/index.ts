const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ErrorCode =
  | 'method_not_allowed'
  | 'invalid_content_type'
  | 'invalid_form_data'
  | 'missing_file'
  | 'missing_target_text'
  | 'invalid_context'
  | 'missing_openai_key'
  | 'transcription_failed';

type EvaluationResult = {
  result: 'pass' | 'close' | 'fail';
  feedback: string;
  score: number;
  transcript: string;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function errorResponse(status: number, code: ErrorCode, message: string): Response {
  return jsonResponse({ error: { code, message } }, status);
}

function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + substitutionCost,
      );
    }
    for (let j = 0; j <= b.length; j++) previous[j] = current[j];
  }

  return previous[b.length];
}

function similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLength = Math.max(a.length, b.length);
  return (maxLength - levenshteinDistance(a, b)) / maxLength;
}

function characterOverlapRatio(transcript: string, target: string): number {
  const transcriptChars = new Set([...transcript.replace(/\s/g, '')]);
  const targetChars = [...new Set([...target.replace(/\s/g, '')])];
  if (targetChars.length === 0) return 0;
  const overlap = targetChars.filter(char => transcriptChars.has(char)).length;
  return overlap / targetChars.length;
}

function scoreCloseMatch(score: number): number {
  if (score >= 0.85) return 85;
  if (score >= 0.75) return 80;
  return 70;
}

function isOnboardingPass(
  normalizedTranscript: string,
  compactTranscript: string,
  compactTarget: string,
): boolean {
  const acceptedTargets = compactTarget === 'سلام'
    ? [compactTarget, 'السلام']
    : [compactTarget];
  const transcriptTokens = normalizedTranscript.split(' ').filter(Boolean);

  return acceptedTargets.some(target =>
    compactTranscript === target || transcriptTokens.includes(target)
  );
}

function evaluateTranscript(transcript: string, targetText: string, context: string): EvaluationResult {
  const normalizedTranscript = normalizeArabic(transcript);
  const normalizedTarget = normalizeArabic(targetText);
  const compactTranscript = normalizedTranscript.replace(/\s/g, '');
  const compactTarget = normalizedTarget.replace(/\s/g, '');
  const tooShortLength = Math.max(2, Math.ceil(compactTarget.length * 0.4));
  const isOnboarding = context === 'onboarding';
  const isPass = isOnboarding
    ? isOnboardingPass(normalizedTranscript, compactTranscript, compactTarget)
    : normalizedTranscript.includes(normalizedTarget) || compactTranscript.includes(compactTarget);

  let result: EvaluationResult['result'];
  let score: number;
  let feedback: string;

  if (!compactTarget) {
    result = 'fail';
    score = 0;
    feedback = 'No valid target phrase was provided.';
  } else if (!compactTranscript) {
    result = 'fail';
    score = 0;
    feedback = "I couldn't hear anything clearly. Try saying it once more.";
  } else if (compactTranscript.length < tooShortLength) {
    result = 'fail';
    score = isOnboarding ? 10 : 20;
    feedback = 'That was too short to check. Try the full phrase once more.';
  } else if (isPass) {
    result = 'pass';
    score = 95;
    feedback = 'Great pronunciation.';
  } else {
    const transcriptWords = normalizedTranscript.split(' ').filter(Boolean);
    const wordScores = transcriptWords.map(word => similarity(word, compactTarget));
    const fullScore = Math.max(
      similarity(compactTranscript, compactTarget),
      ...wordScores,
    );

    if (fullScore >= 0.65) {
      result = 'close';
      score = scoreCloseMatch(fullScore);
      feedback = 'Close. Try it once more with the full phrase.';
    } else {
      result = 'fail';
      if (isOnboarding) {
        score = characterOverlapRatio(compactTranscript, compactTarget) >= 0.25 ? 25 : 15;
      } else {
        score = characterOverlapRatio(compactTranscript, compactTarget) >= 0.25 ? 45 : 30;
      }
      feedback = "Not quite. Listen once, then try saying it again.";
    }
  }

  return {
    result,
    feedback,
    score,
    transcript,
  };
}

async function transcribeAudio(file: File, openAiApiKey: string): Promise<string> {
  const transcriptionForm = new FormData();
  transcriptionForm.append('file', file, file.name || 'recording.m4a');
  transcriptionForm.append('model', 'whisper-1');
  transcriptionForm.append('language', 'ar');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: transcriptionForm,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('[evaluate-speech] OpenAI transcription failed:', {
      status: response.status,
      body: data,
    });
    throw new Error(`OpenAI transcription failed with status ${response.status}`);
  }

  return typeof data?.text === 'string' ? data.text.trim() : '';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Only POST requests are supported.');
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    return errorResponse(400, 'invalid_content_type', 'Request must use multipart/form-data.');
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse(400, 'invalid_form_data', 'Could not parse multipart form data.');
  }

  const file = formData.get('file');
  const targetText = String(formData.get('targetText') ?? '').trim();
  const context = String(formData.get('context') ?? '').trim();
  const allowedContexts = new Set(['onboarding', 'lesson', 'scenario']);

  if (!(file instanceof File) || file.size === 0) {
    return errorResponse(400, 'missing_file', 'A non-empty audio file is required.');
  }

  if (!targetText) {
    return errorResponse(400, 'missing_target_text', 'targetText is required.');
  }

  if (!allowedContexts.has(context)) {
    return errorResponse(
      400,
      'invalid_context',
      'context must be one of: onboarding, lesson, scenario.',
    );
  }

  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiApiKey) {
    return errorResponse(500, 'missing_openai_key', 'OPENAI_API_KEY is not configured.');
  }

  try {
    const transcript = await transcribeAudio(file, openAiApiKey);
    return jsonResponse(evaluateTranscript(transcript, targetText, context));
  } catch (error) {
    console.error('[evaluate-speech] transcription error:', error);
    return errorResponse(502, 'transcription_failed', 'Could not transcribe audio.');
  }
});
