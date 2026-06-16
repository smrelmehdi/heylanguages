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
  | 'invalid_context';

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
  const dialect = String(formData.get('dialect') ?? '').trim();
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

  return jsonResponse({
    result: 'close',
    feedback: 'Speech check endpoint is working.',
    score: 80,
    transcript: '',
    debug: {
      targetText,
      dialect,
      context,
    },
  });
});
