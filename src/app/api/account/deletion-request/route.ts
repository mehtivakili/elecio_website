import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requirePrincipal } from '@/server/auth/authorization';
import { knex } from '@/server/db/knex';
import { writeAuditEvent } from '@/server/audit/write-audit-event';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const principal = await requirePrincipal();
    const request = await knex('account_deletion_requests').select('id', 'status', 'requested_at as requestedAt')
      .where({ user_id: principal.userId }).orderBy('requested_at', 'desc').first();
    return NextResponse.json({ request: request ?? null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }
}

export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requirePrincipal();
    const body = await request.json().catch(() => null);
    const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 1000) : null;
    const existing = await knex('account_deletion_requests').where({ user_id: principal.userId, status: 'pending' }).first();
    if (!existing) await knex('account_deletion_requests').insert({ id: randomUUID(), user_id: principal.userId, reason });
    await writeAuditEvent({ actorUserId: principal.userId, actorRole: principal.role, action: 'account.deletion_requested',
      resource: 'user', resourceId: principal.userId, outcome: 'success' });
    return NextResponse.json({ ok: true }, { status: existing ? 200 : 201 });
  } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }
}

export async function DELETE(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requirePrincipal();
    await knex('account_deletion_requests').where({ user_id: principal.userId, status: 'pending' })
      .update({ status: 'cancelled', resolved_at: knex.fn.now() });
    await writeAuditEvent({ actorUserId: principal.userId, actorRole: principal.role, action: 'account.deletion_cancelled',
      resource: 'user', resourceId: principal.userId, outcome: 'success' });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }
}
