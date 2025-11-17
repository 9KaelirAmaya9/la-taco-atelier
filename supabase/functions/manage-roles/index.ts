const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    ...init,
  });
}

function getUserIdFromJWT(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const json = JSON.parse(decoded);
    return json.sub || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Missing or invalid Authorization header' }, { status: 401 });
  }
  const token = authHeader.slice('Bearer '.length);
  const requesterId = getUserIdFromJWT(token);
  if (!requesterId) {
    return jsonResponse({ error: 'Invalid user token' }, { status: 401 });
  }

  const { action, targetUserId, role } = await req.json().catch(() => ({}));

  const rest = (path: string, init?: RequestInit) =>
    fetch(`${supabaseUrl}/rest/v1${path}`, {
      ...init,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });

  try {
    if (action === 'bootstrap') {
      // Check if any admin exists
      const countRes = await rest(`/user_roles?role=eq.admin&select=id`);
      if (!countRes.ok) return jsonResponse({ error: 'Count failed' }, { status: 500 });
      const rows = await countRes.json();
      if (!Array.isArray(rows)) return jsonResponse({ error: 'Invalid response' }, { status: 500 });

      if (rows.length === 0) {
        const insRes = await rest(`/user_roles`, {
          method: 'POST',
          body: JSON.stringify({ user_id: requesterId, role: 'admin' }),
        });
        if (!insRes.ok) {
          const err = await insRes.text();
          return jsonResponse({ error: 'Insert failed', details: err }, { status: 500 });
        }
        return jsonResponse({ success: true, message: 'Admin role granted to current user.' });
      }
      return jsonResponse({ success: false, message: 'Admin already exists. Use grant endpoint.' }, { status: 409 });
    }

    // Validate requester is admin
    const rolesRes = await rest(`/user_roles?user_id=eq.${requesterId}&select=role`);
    if (!rolesRes.ok) return jsonResponse({ error: 'Role check failed' }, { status: 500 });
    const requesterRoles = await rolesRes.json();
    const isAdmin = Array.isArray(requesterRoles) && requesterRoles.some((r: any) => r.role === 'admin');
    if (!isAdmin) {
      return jsonResponse({ error: 'Admin privileges required' }, { status: 403 });
    }

    if (action === 'grant') {
      if (!targetUserId || !role) {
        return jsonResponse({ error: 'targetUserId and role are required' }, { status: 400 });
      }
      const res = await rest(`/user_roles`, {
        method: 'POST',
        body: JSON.stringify({ user_id: targetUserId, role }),
      });
      if (!res.ok) return jsonResponse({ error: 'Grant failed', details: await res.text() }, { status: 500 });
      return jsonResponse({ success: true });
    }

    if (action === 'revoke') {
      if (!targetUserId || !role) {
        return jsonResponse({ error: 'targetUserId and role are required' }, { status: 400 });
      }
      const res = await rest(`/user_roles?user_id=eq.${targetUserId}&role=eq.${role}`, {
        method: 'DELETE',
      });
      if (!res.ok) return jsonResponse({ error: 'Revoke failed', details: await res.text() }, { status: 500 });
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('manage-roles error:', e);
    return jsonResponse({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
});

