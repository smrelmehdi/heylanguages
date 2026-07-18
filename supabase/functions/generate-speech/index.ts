const VOICE_CONFIG = {
  gulf: { voiceId: 'rUaPbzcZIu8df8iNL9WZ', modelId: 'eleven_multilingual_v2' },
  egyptian: { voiceId: 'LXrTqFIgiubkrMkwvOUr', modelId: 'eleven_v3' },
  msa: { voiceId: 'xvhpbk8otnNHtT3fjCpr', modelId: 'eleven_v3' },
} as const;

type SpeechDialect = keyof typeof VOICE_CONFIG;
type ErrorCode =
  | 'method_not_allowed'
  | 'origin_not_allowed'
  | 'authentication_required'
  | 'rate_limited'
  | 'quota_unavailable'
  | 'invalid_json'
  | 'invalid_request'
  | 'invalid_text'
  | 'unsupported_dialect'
  | 'unapproved_override'
  | 'server_configuration_error'
  | 'speech_provider_error';

const MAX_TEXT_LENGTH = 500;
const RATE_LIMIT = 12;

// Optimized for pronunciation consistency in language-learning audio.
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
};

function approvedOrigins() {
  return new Set((Deno.env.get('GENERATE_SPEECH_ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean));
}

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
  if (origin && approvedOrigins().has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function isOriginAllowed(req: Request) {
  const origin = req.headers.get('origin');
  // Native clients do not send a browser Origin header.
  return !origin || approvedOrigins().has(origin);
}

function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });
}

function errorResponse(req: Request, status: number, code: ErrorCode, message: string): Response {
  return jsonResponse(req, { error: { code, message } }, status);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let index = 0; index < bytes.byteLength; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary);
}

async function authenticatedUserId(req: Request): Promise<string | null> {
  const authorization = req.headers.get('authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authorization?.startsWith('Bearer ') || !supabaseUrl || !anonKey) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: anonKey },
  });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null) as { id?: unknown } | null;
  return typeof user?.id === 'string' && user.id.length > 0 ? user.id : null;
}

async function consumeSpeechQuota(userId: string): Promise<boolean | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return null;
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_speech_quota`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_user_id: userId, p_limit: RATE_LIMIT, p_window_seconds: 60 }),
  });
  if (!response.ok) return null;
  const allowed = await response.json().catch(() => null);
  return typeof allowed === 'boolean' ? allowed : null;
}

Deno.serve(async (req: Request) => {
  if (!isOriginAllowed(req)) return errorResponse(req, 403, 'origin_not_allowed', 'This origin is not allowed.');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return errorResponse(req, 405, 'method_not_allowed', 'Only POST requests are supported.');

  const userId = await authenticatedUserId(req).catch(() => null);
  // Guests intentionally fail closed. Production lessons should use packaged local audio.
  if (!userId) return errorResponse(req, 401, 'authentication_required', 'Sign in to use fallback speech generation.');
  const quotaAllowed = await consumeSpeechQuota(userId).catch(() => null);
  if (quotaAllowed === null) {
    console.error('[generate-speech] quota check unavailable', { userId });
    return errorResponse(req, 503, 'quota_unavailable', 'Speech generation is temporarily unavailable.');
  }
  if (!quotaAllowed) return errorResponse(req, 429, 'rate_limited', 'Too many speech requests. Please wait and try again.');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 400, 'invalid_json', 'Request body must be valid JSON.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return errorResponse(req, 400, 'invalid_request', 'Request body must be an object.');
  }

  const payload = body as Record<string, unknown>;
  if ('voiceId' in payload || 'modelId' in payload || 'voice_id' in payload || 'model_id' in payload) {
    return errorResponse(req, 400, 'unapproved_override', 'Voice and model overrides are not supported.');
  }
  if (typeof payload.text !== 'string' || payload.text.trim().length === 0 || payload.text.includes('\u0000')) {
    return errorResponse(req, 400, 'invalid_text', 'Text must be a non-empty string.');
  }
  if (payload.text.length > MAX_TEXT_LENGTH) {
    return errorResponse(req, 400, 'invalid_text', `Text must be ${MAX_TEXT_LENGTH} characters or fewer.`);
  }
  if (typeof payload.dialect !== 'string' || !(payload.dialect in VOICE_CONFIG)) {
    return errorResponse(req, 400, 'unsupported_dialect', 'A supported dialect is required.');
  }

  const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!elevenLabsApiKey) {
    return errorResponse(req, 500, 'server_configuration_error', 'Speech generation is temporarily unavailable.');
  }

  const dialect = payload.dialect as SpeechDialect;
  const config = VOICE_CONFIG[dialect];
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': elevenLabsApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: payload.text.trim(),
        model_id: config.modelId,
        voice_settings: DEFAULT_VOICE_SETTINGS,
      }),
    });
    if (!response.ok) {
      console.error('[generate-speech] provider failure', { status: response.status, dialect, userId });
      return errorResponse(req, 502, 'speech_provider_error', 'Speech generation failed. Please try again.');
    }
    return jsonResponse(req, {
      audioBase64: arrayBufferToBase64(await response.arrayBuffer()),
      contentType: 'audio/mpeg',
    });
  } catch {
    console.error('[generate-speech] provider request failed', { dialect, userId });
    return errorResponse(req, 502, 'speech_provider_error', 'Speech generation failed. Please try again.');
  }
});
