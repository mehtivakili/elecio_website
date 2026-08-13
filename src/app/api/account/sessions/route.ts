import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/config';
import { requirePrincipal } from '@/server/auth/authorization';
import { knex } from '@/server/db/knex';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function copyCookies(from: Response, to: NextResponse) {
  const values = typeof from.headers.getSetCookie === 'function'
    ? from.headers.getSetCookie() : [from.headers.get('set-cookie')].filter(Boolean) as string[];
  for (const value of values) to.headers.append('set-cookie', value);
}

export async function GET() {
  try {
    const principal = await requirePrincipal();
    const sessions = await knex('auth_sessions').select('id', 'created_at', 'updated_at', 'expires_at', 'user_agent')
      .where({ user_id: principal.userId }).where('expires_at', '>', knex.fn.now()).orderBy('updated_at', 'desc');
    return NextResponse.json({ sessions: sessions.map((session) => ({
      id: session.id, current: session.id === principal.sessionId, createdAt: session.created_at,
      lastActiveAt: session.updated_at, expiresAt: session.expires_at,
      device: String(session.user_agent ?? '').slice(0, 180) || 'Unknown device',
    })) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }
}

export async function DELETE(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requirePrincipal();
    const body = await request.json().catch(() => null);
    const action = body?.action;
    let result: Response;
    if (action === 'others') result = await auth.api.revokeOtherSessions({ headers: request.headers, asResponse: true });
    else if (action === 'all') result = await auth.api.revokeSessions({ headers: request.headers, asResponse: true });
    else if (typeof body?.sessionId === 'string') {
      const owned = await knex('auth_sessions').select('token').where({ id: body.sessionId, user_id: principal.userId }).first();
      if (!owned) return NextResponse.json({ error: 'not_found' }, { status: 404 });
      result = await auth.api.revokeSession({ body: { token: owned.token }, headers: request.headers, asResponse: true });
    } else return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    const response = NextResponse.json({ ok: result.ok }, { status: result.ok ? 200 : result.status });
    copyCookies(result, response);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }
}
