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

// Apply dialect-specific phonetic equivalences before comparing.
// Egyptian: ق is often realised as a glottal stop; Whisper may transcribe it as ء/أ or drop it.
// Gulf: no major letter substitutions, but accept ك/چ variation.
function dialectNormalize(text: string, dialect: string): string {
  if (dialect === 'egyptian') {
    return text.replace(/ق/g, 'ء').replace(/[أإآء]/g, 'ا');
  }
  return text;
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

// For scenario mode: extract the key content words (4+ chars) from a phrase.
// Short words like ال، في، من، على are common connectors — scoring is more robust
// when it focuses on the distinctive content words only.
function extractContentWords(text: string): string[] {
  return text.split(' ').filter(w => w.length >= 3);
}

// In scenario mode the user may say extra words around the phrase, or drop
// connector words. We check whether the majority of content words in the
// target are present in the transcript (in any order).
function scenarioContentMatch(normalizedTranscript: string, normalizedTarget: string): { matched: number; total: number } {
  const targetWords = extractContentWords(normalizedTarget);
  if (targetWords.length === 0) return { matched: 0, total: 0 };
  const transcriptWords = normalizedTranscript.split(' ').filter(Boolean);
  const matched = targetWords.filter(tw =>
    transcriptWords.some(trw => similarity(trw, tw) >= 0.80)
  ).length;
  return { matched, total: targetWords.length };
}

function evaluateTranscript(transcript: string, targetText: string, context: string, dialect = 'gulf'): EvaluationResult {
  const normalizedTranscript = normalizeArabic(transcript);
  const normalizedTarget = normalizeArabic(targetText);
  const compactTranscript = normalizedTranscript.replace(/\s/g, '');
  const compactTarget = normalizedTarget.replace(/\s/g, '');
  const tooShortLength = Math.max(2, Math.ceil(compactTarget.length * 0.4));
  const isOnboarding = context === 'onboarding';
  const isScenario = context === 'scenario';

  // Exact / contained match (works for both directions: user says more or user
  // says exactly the expected phrase)
  const exactPass = compactTranscript === compactTarget ||
    normalizedTranscript.split(' ').some(w => w === normalizedTarget) ||
    normalizedTranscript.includes(normalizedTarget) ||
    compactTranscript.includes(compactTarget) ||
    normalizedTarget.includes(normalizedTranscript);   // user said a clean subset
  // Dialect-aware match (e.g. Egyptian ق→ء equivalence)
  const dialectTarget = dialectNormalize(normalizedTarget, dialect);
  const dialectTranscript = dialectNormalize(normalizedTranscript, dialect);
  const dialectPass = dialectTarget !== normalizedTarget &&
    (dialectTranscript === dialectTarget || dialectTranscript.includes(dialectTarget));

  // Scenario-specific: majority of content words present
  const contentMatch = isScenario ? scenarioContentMatch(normalizedTranscript, normalizedTarget) : null;
  const contentPassRatio = contentMatch && contentMatch.total > 0 ? contentMatch.matched / contentMatch.total : 0;

  const isPass = isOnboarding
    ? isOnboardingPass(normalizedTranscript, compactTranscript, compactTarget)
    : exactPass || dialectPass || (isScenario && contentPassRatio >= 0.80);

  const isContentClose = isScenario && !isPass && contentPassRatio >= 0.50;

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
  } else if (isContentClose) {
    // Scenario: got most of the content words, just not perfectly
    result = 'close';
    score = Math.round(55 + contentPassRatio * 30); // 55–85 range
    feedback = 'Almost there. Try to include all the words.';
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
      } else if (isScenario) {
        // Scenario is more forgiving on failure — user gets partial credit
        score = characterOverlapRatio(compactTranscript, compactTarget) >= 0.25 ? 50 : 35;
        feedback = "Not quite. Listen to Yusuf, then try again.";
      } else {
        score = characterOverlapRatio(compactTranscript, compactTarget) >= 0.25 ? 45 : 30;
        feedback = "Not quite. Listen once, then try saying it again.";
      }
      if (!feedback) feedback = "Not quite. Listen once, then try saying it again.";
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
  const dialect = String(formData.get('dialect') ?? 'gulf').trim();
  const hint = String(formData.get('hint') ?? '').trim(); // English translation (optional)
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
    const evalResult = evaluateTranscript(transcript, targetText, context, dialect);
    // Enrich failed feedback with the English meaning when available
    if (hint && evalResult.result === 'fail') {
      evalResult.feedback = `Not quite. The phrase means "${hint}". Listen once and try again.`;
    }
    return jsonResponse(evalResult);
  } catch (error) {
    console.error('[evaluate-speech] transcription error:', error);
    return errorResponse(502, 'transcription_failed', 'Could not transcribe audio.');
  }
});
