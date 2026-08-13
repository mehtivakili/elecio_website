import { NextResponse } from 'next/server';
import { requireStaffPermission } from '@/server/auth/staff-flow';
import { knex } from '@/server/db/knex';
export const dynamic = 'force-dynamic';
export async function GET() { try { await requireStaffPermission('content', 'read'); const [drafts, leads, deletions, failedAuth] = await Promise.all([
  knex('posts').where({ status: 'draft' }).count<{ count: string }[]>('* as count').first(),
  knex('contact_submissions').where({ status: 'new' }).count<{ count: string }[]>('* as count').first(),
  knex('account_deletion_requests').where({ status: 'pending' }).count<{ count: string }[]>('* as count').first(),
  knex('audit_events').where({ outcome: 'failure' }).where('created_at', '>', knex.raw("now() - interval '24 hours'")).count<{ count: string }[]>('* as count').first(),
]); return NextResponse.json({ drafts: Number(drafts?.count ?? 0), newLeads: Number(leads?.count ?? 0), deletionRequests: Number(deletions?.count ?? 0), failedAuth24h: Number(failedAuth?.count ?? 0), smsConfigured: process.env.SMS_PROVIDER === 'kavenegar' }, { headers: { 'Cache-Control': 'no-store' } }); } catch { return NextResponse.json({ error: 'forbidden' }, { status: 403 }); } }
