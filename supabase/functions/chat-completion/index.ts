const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ErrorCode =
  | 'method_not_allowed'
  | 'invalid_json'
  | 'invalid_system'
  | 'invalid_messages'
  | 'missing_anthropic_key'
  | 'anthropic_request_failed';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
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

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string'
  );
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
  const system = payload.system;
  const messages = payload.messages;
  const maxTokens = payload.maxTokens;

  if (typeof system !== 'string' || system.trim().length === 0) {
    return errorResponse(400, 'invalid_system', 'system must be a non-empty string.');
  }

  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isChatMessage)) {
    return errorResponse(
      400,
      'invalid_messages',
      'messages must be a non-empty array of user/assistant messages.',
    );
  }

  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    return errorResponse(500, 'missing_anthropic_key', 'ANTHROPIC_API_KEY is not configured.');
  }

  const tokenLimit = typeof maxTokens === 'number' && Number.isFinite(maxTokens) && maxTokens > 0
    ? Math.floor(maxTokens)
    : 200;

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
        max_tokens: tokenLimit,
        system,
        messages,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('[chat-completion] Anthropic request failed:', {
        status: response.status,
        error: data?.error?.type ?? data?.error?.message ?? null,
      });
      return errorResponse(502, 'anthropic_request_failed', 'Anthropic request failed.');
    }

    const text = typeof data?.content?.[0]?.text === 'string'
      ? data.content[0].text
      : '';

    return jsonResponse({ text });
  } catch (error) {
    console.error('[chat-completion] request error:', error);
    return errorResponse(502, 'anthropic_request_failed', 'Anthropic request failed.');
  }
});
