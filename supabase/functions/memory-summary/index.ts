const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ErrorCode =
  | 'method_not_allowed'
  | 'invalid_json'
  | 'invalid_transcript'
  | 'missing_anthropic_key'
  | 'anthropic_request_failed'
  | 'invalid_anthropic_response';

type MemorySummary = {
  personal_facts: string[];
  weak_words: string[];
  strong_words: string[];
  last_session_summary: string;
};

const HAIKU_MEMORY_PROMPT = `You are a memory system for a Gulf Arabic learning app.
Read this conversation transcript and the existing user memory.
Return ONLY a JSON object, no other text:
{
  "personal_facts": string[],
  "weak_words": string[],
  "strong_words": string[],
  "last_session_summary": string
}

Rules:
- personal_facts: facts about the user (name, origin, job, interests). Max 5 items, dedupe with existing.
- weak_words: Arabic words the user got wrong, mispronounced, or confused. Max 10.
- strong_words: Arabic words the user used correctly and fluently. Max 10.
- last_session_summary: 2-3 sentences describing what happened this session.
- Be concise. Merge with existing memory — don't duplicate facts already known.`;

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

function asStringArray(value: unknown, maxLength: number): string[] {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string').slice(0, maxLength)
    : [];
}

function parseMemorySummary(raw: string): MemorySummary | null {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      personal_facts: asStringArray(parsed.personal_facts, 5),
      weak_words: asStringArray(parsed.weak_words, 10),
      strong_words: asStringArray(parsed.strong_words, 10),
      last_session_summary:
        typeof parsed.last_session_summary === 'string' ? parsed.last_session_summary : '',
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Only POST requests are supported.');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'invalid_json', 'Request body must be valid JSON.');
  }

  const payload = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const transcript = payload.transcript;
  const existingMemory = payload.existingMemory ?? {};

  if (typeof transcript !== 'string' || transcript.trim().length === 0) {
    return errorResponse(400, 'invalid_transcript', 'transcript must be a non-empty string.');
  }

  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    return errorResponse(500, 'missing_anthropic_key', 'ANTHROPIC_API_KEY is not configured.');
  }

  const userMessage =
    `Existing memory:\n${JSON.stringify(existingMemory)}\n\n` +
    `This session's transcript:\n${transcript}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: HAIKU_MEMORY_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('[memory-summary] Anthropic request failed:', {
        status: response.status,
        error: data?.error?.type ?? data?.error?.message ?? null,
      });
      return errorResponse(502, 'anthropic_request_failed', 'Anthropic request failed.');
    }

    const raw = typeof data?.content?.[0]?.text === 'string'
      ? data.content[0].text.trim()
      : '';
    const summary = parseMemorySummary(raw);

    if (!summary) {
      return errorResponse(502, 'invalid_anthropic_response', 'Anthropic returned invalid JSON.');
    }

    return jsonResponse(summary);
  } catch (error) {
    console.error('[memory-summary] request error:', error);
    return errorResponse(502, 'anthropic_request_failed', 'Anthropic request failed.');
  }
});
