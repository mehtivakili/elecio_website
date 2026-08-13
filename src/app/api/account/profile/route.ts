import { NextRequest, NextResponse } from 'next/server';
import { requirePrincipal } from '@/server/auth/authorization';
import { knex } from '@/server/db/knex';
import { writeAuditEvent } from '@/server/audit/write-audit-event';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const principal = await requirePrincipal();
    const profile = await knex('auth_users as u').join('user_profiles as p', 'p.user_id', 'u.id')
      .select('u.name', 'u.phone_number as phoneNumber', 'p.company_name as companyName', 'p.locale')
      .where('u.id', principal.userId).first();
    return NextResponse.json(profile, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }
}

export async function PATCH(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requirePrincipal();
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const companyName = typeof body?.companyName === 'string' ? body.companyName.trim() : '';
    const locale = body?.locale === 'en' ? 'en' : body?.locale === 'fa' ? 'fa' : null;
    if (!name || name.length > 160 || companyName.length > 200 || !locale) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }
    await knex.transaction(async (trx) => {
      await trx('auth_users').where({ id: principal.userId }).update({ name, updated_at: trx.fn.now() });
      await trx('user_profiles').where({ user_id: principal.userId })
        .update({ company_name: companyName || null, locale, updated_at: trx.fn.now() });
    });
    await writeAuditEvent({ actorUserId: principal.userId, actorRole: principal.role,
      action: 'profile.updated', resource: 'profile', resourceId: principal.userId, outcome: 'success' });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }
}
