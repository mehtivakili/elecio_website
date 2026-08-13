import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createInvitationToken, hashInvitationToken, requireRecentStaffPermission } from '@/server/auth/staff-flow';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';
import { knex } from '@/server/db/knex';
import { sendTransactionalEmail } from '@/server/email';
import { writeAuditEvent } from '@/server/audit/write-audit-event';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requireRecentStaffPermission('staff', 'create');
    if (principal.role !== 'owner') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    const body = await request.json().catch(() => null); const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : ''; const role = body?.role;
    const locale = body?.locale === 'fa' ? 'fa' : 'en';
    if (!/^\S+@\S+\.\S+$/.test(email) || !name || name.length > 160 || !['support', 'editor', 'admin'].includes(role)) return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    if (await knex('auth_users').whereRaw('lower(email) = ?', [email]).first()) return NextResponse.json({ error: 'unavailable' }, { status: 409 });
    await knex('staff_invitations').whereRaw('lower(email) = ?', [email]).whereNull('accepted_at').whereNull('revoked_at').update({ revoked_at: knex.fn.now() });
    const token = createInvitationToken(); const id = randomUUID(); const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await knex('staff_invitations').insert({ id, email, name, role, token_hash: hashInvitationToken(token), invited_by: principal.userId, expires_at: expiresAt });
    const base = process.env.BETTER_AUTH_URL?.replace(/\/$/, ''); if (!base) { await knex('staff_invitations').where({ id }).delete(); return NextResponse.json({ error: 'not_configured' }, { status: 503 }); }
    const url = `${base}/${locale}/admin/invite?token=${encodeURIComponent(token)}`;
    try { await sendTransactionalEmail({ to: email, subject: 'Your Elecio staff invitation', text: `Accept your invitation within 48 hours: ${url}`, html: `<p>You were invited to Elecio staff.</p><p><a href="${url}">Accept invitation</a></p><p>This link expires in 48 hours.</p>` }); }
    catch { await knex('staff_invitations').where({ id }).delete(); return NextResponse.json({ error: 'email_unavailable' }, { status: 503 }); }
    await writeAuditEvent({ actorUserId: principal.userId, actorRole: principal.role, action: 'staff.invited', resource: 'staff_invitation', resourceId: id, outcome: 'success', metadata: { role } });
    return NextResponse.json({ ok: true, expiresAt, ...(process.env.NODE_ENV !== 'production' ? { developmentInviteUrl: url } : {}) }, { status: 201 });
  } catch { return NextResponse.json({ error: 'forbidden' }, { status: 403 }); }
}
