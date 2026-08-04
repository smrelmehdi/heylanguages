import { createClient } from 'npm:@supabase/supabase-js@2';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function authenticatedUserId(req: Request) {
  const authorization = req.headers.get('authorization');
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authorization?.startsWith('Bearer ') || !url || !anonKey) return null;
  const response = await fetch(`${url}/auth/v1/user`, { headers: { Authorization: authorization, apikey: anonKey } });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null) as { id?: unknown; is_anonymous?: unknown } | null;
  return typeof user?.id === 'string' && user.id && user.is_anonymous !== true ? user.id : null;
}

Deno.serve(async req => {
  if (req.method !== 'POST') return json({ error: { code: 'method_not_allowed' } }, 405);
  const userId = await authenticatedUserId(req).catch(() => null);
  if (!userId) return json({ error: { code: 'authentication_required' } }, 401);
  const rawBody = await req.text();
  let body: unknown = {};
  try { body = rawBody.trim() ? JSON.parse(rawBody) : {}; }
  catch { return json({ error: { code: 'invalid_request' } }, 400); }
  if (!body || typeof body !== 'object' || Object.keys(body).length > 0) {
    return json({ error: { code: 'invalid_request' } }, 400);
  }
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return json({ error: { code: 'server_configuration_error' } }, 500);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: dataError } = await admin.rpc('delete_account_data', { p_user_id: userId });
  if (dataError) {
    console.error('[delete-account] data cleanup failed', { userId, code: dataError.code });
    return json({ error: { code: 'deletion_failed' } }, 500);
  }
  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError && !authError.message.toLowerCase().includes('not found')) {
    console.error('[delete-account] auth cleanup failed', { userId, status: authError.status });
    return json({ error: { code: 'auth_deletion_failed' } }, 500);
  }
  return json({ deleted: true });
});
