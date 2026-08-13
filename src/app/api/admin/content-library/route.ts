import { NextRequest, NextResponse } from 'next/server';
import { requireStaffPermission } from '@/server/auth/staff-flow';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';
import { isValidSlug } from '@/server/content/document';
import { knex } from '@/server/db/knex';
import { writeAuditEvent } from '@/server/audit/write-audit-event';

type Kind = 'category' | 'tag' | 'partner' | 'testimonial';
const kinds: Kind[] = ['category', 'tag', 'partner', 'testimonial'];
const tables: Record<Kind, string> = { category: 'categories', tag: 'tags', partner: 'partners', testimonial: 'testimonials' };
const text = (value: unknown, max: number, required = false) => {
  const result = typeof value === 'string' ? value.trim().slice(0, max) : '';
  if (required && !result) throw new Error('required_field');
  return result || null;
};
const safeUrl = (value: unknown, required = false) => {
  const result = text(value, 2048, required);
  if (!result) return null;
  const url = new URL(result);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid_url');
  return url.href;
};
function kindOf(value: unknown): Kind {
  if (!kinds.includes(value as Kind)) throw new Error('invalid_kind');
  return value as Kind;
}
function dataFor(kind: Kind, body: Record<string, unknown>) {
  if (kind === 'category' || kind === 'tag') {
    const slug = String(body.slug ?? '').trim().toLowerCase();
    if (!isValidSlug(slug)) throw new Error('invalid_slug');
    return { slug, name_fa: text(body.nameFa, 160, true), name_en: text(body.nameEn, 160, true), ...(kind === 'category' ? { sort_order: Number(body.sortOrder) || 0 } : {}) };
  }
  if (kind === 'partner') return {
    name: text(body.name, 200, true), logo_path: text(body.logoPath, 2048, true), website_url: safeUrl(body.websiteUrl),
    sort_order: Number(body.sortOrder) || 0, is_active: body.isActive !== false,
  };
  return {
    customer_name: text(body.customerName, 200, true), company_name: text(body.companyName, 200),
    quote_fa: text(body.quoteFa, 4000), quote_en: text(body.quoteEn, 4000), video_url: safeUrl(body.videoUrl),
    avatar_path: text(body.avatarPath, 2048), sort_order: Number(body.sortOrder) || 0, is_active: body.isActive !== false,
  };
}
async function principalAndBody(request: NextRequest, action: 'create' | 'update' | 'delete') {
  if (!hasTrustedRequestOrigin(request)) throw new Error('forbidden');
  const principal = await requireStaffPermission('content', action);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) throw new Error('invalid_json');
  return { principal, body, kind: kindOf(body.kind) };
}
async function audit(principal: Awaited<ReturnType<typeof requireStaffPermission>>, action: string, kind: Kind, id: number) {
  await writeAuditEvent({ actorUserId: principal.userId, actorRole: principal.role, action, resource: kind, resourceId: String(id), outcome: 'success' });
}
export async function POST(request: NextRequest) {
  try {
    const { principal, body, kind } = await principalAndBody(request, 'create');
    const [row] = await knex(tables[kind]).insert(dataFor(kind, body)).returning(['id']);
    await audit(principal, 'content_library.created', kind, row.id);
    return NextResponse.json({ id: row.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'invalid_request' }, { status: 400 });
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const { principal, body, kind } = await principalAndBody(request, 'update');
    const id = Number(body.id); if (!Number.isInteger(id)) throw new Error('invalid_id');
    const updated = await knex(tables[kind]).where({ id }).update({ ...dataFor(kind, body), updated_at: knex.fn.now() });
    if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    await audit(principal, 'content_library.updated', kind, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'invalid_request' }, { status: 400 });
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const { principal, body, kind } = await principalAndBody(request, 'delete');
    const id = Number(body.id); if (!Number.isInteger(id)) throw new Error('invalid_id');
    const deleted = await knex(tables[kind]).where({ id }).delete();
    if (!deleted) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    await audit(principal, 'content_library.deleted', kind, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'invalid_request' }, { status: 400 });
  }
}
