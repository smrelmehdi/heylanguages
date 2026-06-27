const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const VOICE_GULF = 'rUaPbzcZIu8df8iNL9WZ';
const MAX_TEXT_LENGTH = 500;

type ErrorCode =
  | 'method_not_allowed'
  | 'invalid_json'
  | 'invalid_text'
  | 'invalid_voice_id'
  | 'missing_elevenlabs_key'
  | 'elevenlabs_request_failed';

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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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
  const text = payload.text;
  const voiceId = payload.voiceId;

  if (typeof text !== 'string' || text.trim().length === 0) {
    return errorResponse(400, 'invalid_text', 'text must be a non-empty string.');
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return errorResponse(400, 'invalid_text', `text must be ${MAX_TEXT_LENGTH} characters or fewer.`);
  }

  if (voiceId !== undefined && (typeof voiceId !== 'string' || voiceId.trim().length === 0)) {
    return errorResponse(400, 'invalid_voice_id', 'voiceId must be a non-empty string when provided.');
  }

  const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!elevenLabsApiKey) {
    return errorResponse(500, 'missing_elevenlabs_key', 'ELEVENLABS_API_KEY is not configured.');
  }

  const effectiveVoiceId = typeof voiceId === 'string' ? voiceId : VOICE_GULF;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${effectiveVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.85,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!response.ok) {
      console.error('[generate-speech] ElevenLabs request failed:', {
        status: response.status,
      });
      return errorResponse(502, 'elevenlabs_request_failed', 'ElevenLabs request failed.');
    }

    const audioBase64 = arrayBufferToBase64(await response.arrayBuffer());
    return jsonResponse({
      audioBase64,
      contentType: 'audio/mpeg',
    });
  } catch (error) {
    console.error('[generate-speech] request error:', error);
    return errorResponse(502, 'elevenlabs_request_failed', 'ElevenLabs request failed.');
  }
});
