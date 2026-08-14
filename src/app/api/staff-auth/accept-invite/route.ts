import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/config';
import { hashInvitationToken, staffInternalHeaders, strongPassword } from '@/server/auth/staff-flow';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';
import { knex } from '@/server/db/knex';
import { writeAuditEvent } from '@/server/audit/write-audit-event';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await request.json().catch(() => null); const token = typeof body?.token === 'string' ? body.token : ''; const password = typeof body?.password === 'string' ? body.password : '';
  if (!token || !strongPassword(password)) return NextResponse.json({ error: 'invalid_or_expired' }, { status: 400 });
  const invitation = await knex('staff_invitations').where({ token_hash: hashInvitationToken(token), accepted_at: null, revoked_at: null }).where('expires_at', '>', knex.fn.now()).first();
  if (!invitation) return NextResponse.json({ error: 'invalid_or_expired' }, { status: 400 });
  try {
    const authResponse = await auth.api.signUpEmail({ body: { email: invitation.email, name: invitation.name, password }, headers: staffInternalHeaders(request.headers), asResponse: true });
    const payload = await authResponse.clone().json(); if (!authResponse.ok || !payload?.user?.id) return NextResponse.json({ error: 'invalid_or_expired' }, { status: 400 });
    await knex.transaction(async (trx) => {
      const accepted = await trx('staff_invitations').where({ id: invitation.id, accepted_at: null, revoked_at: null }).update({ accepted_at: trx.fn.now() });
      if (accepted !== 1) throw new Error('Invitation consumed');
      await trx('auth_users').where({ id: payload.user.id }).update({ email_verified: true, updated_at: trx.fn.now() });
      await trx('user_profiles').where({ user_id: payload.user.id }).update({ role: invitation.role, is_active: true, locale: body?.locale === 'fa' ? 'fa' : 'en', updated_at: trx.fn.now() });
    });
    await writeAuditEvent({ actorUserId: payload.user.id, actorRole: invitation.role, action: 'staff.invitation_accepted', resource: 'staff_invitation', resourceId: invitation.id, outcome: 'success' });
    const response = NextResponse.json({ ok: true });
    const cookies = typeof authResponse.headers.getSetCookie === 'function' ? authResponse.headers.getSetCookie() : [authResponse.headers.get('set-cookie')].filter(Boolean) as string[];
    for (const cookie of cookies) response.headers.append('set-cookie', cookie); response.headers.set('Cache-Control', 'no-store'); return response;
  } catch { return NextResponse.json({ error: 'invalid_or_expired' }, { status: 400 }); }
}
