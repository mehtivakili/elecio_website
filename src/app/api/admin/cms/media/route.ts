import { createHash, randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { requireStaffPermission } from '@/server/auth/staff-flow';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';
import { consumeSharedRateLimit } from '@/server/services/shared-rate-limit';
import { knex } from '@/server/db/knex';
import { writeAuditEvent } from '@/server/audit/write-audit-event';

export const runtime = 'nodejs';
const MAX = 10 * 1024 * 1024;
const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requireStaffPermission('media', 'create');
    const limit = await consumeSharedRateLimit('cms:media', principal.userId, { limit: 20, windowSeconds: 3600 });
    if (!limit.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    const form = await request.formData(); const file = form.get('file');
    if (!(file instanceof File) || file.size <= 0 || file.size > MAX || !allowed.has(file.type)) return NextResponse.json({ error: 'invalid_file' }, { status: 400 });
    const input = Buffer.from(await file.arrayBuffer());
    const probe = sharp(input, { limitInputPixels: 40_000_000, failOn: 'warning' }); const meta = await probe.metadata();
    if (!meta.width || !meta.height || !['jpeg', 'png', 'webp', 'avif'].includes(meta.format ?? '')) return NextResponse.json({ error: 'invalid_image' }, { status: 400 });
    const id = randomUUID();
    const requestedSlug = String(form.get('slug') ?? '').normalize('NFC').toLowerCase().trim();
    const safeSlug = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(requestedSlug) ? requestedSlug.slice(0, 120) : 'article-image';
    const kind = form.get('kind') === 'body' ? 'body' : 'cover';
    const filename = `${safeSlug}-${kind}-${id.slice(0, 8)}.webp`;
    const output = await probe.rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer({ resolveWithObject: true });
    const relative = `/uploads/${filename}`; const directory = path.resolve(process.cwd(), 'public', 'uploads'); const target = path.resolve(directory, filename);
    if (!target.startsWith(`${directory}${path.sep}`)) throw new Error('INVALID_PATH');
    await mkdir(directory, { recursive: true }); await writeFile(target, output.data, { flag: 'wx' });
    const checksum = createHash('sha256').update(output.data).digest('hex');
    await knex('media_assets').insert({ id, storage_key: `local:${filename}`, public_path: relative, mime_type: 'image/webp', byte_size: output.data.length, width: output.info.width, height: output.info.height, checksum_sha256: checksum, alt_fa: String(form.get('altFa') ?? '').trim().slice(0, 500) || null, alt_en: String(form.get('altEn') ?? '').trim().slice(0, 500) || null, caption_fa: String(form.get('captionFa') ?? '').trim().slice(0, 2000) || null, caption_en: String(form.get('captionEn') ?? '').trim().slice(0, 2000) || null, uploaded_by: principal.userId });
    await writeAuditEvent({ actorUserId: principal.userId, actorRole: principal.role, action: 'media.created', resource: 'media_asset', resourceId: id, outcome: 'success', metadata: { mime: 'image/webp', bytes: output.data.length, width: output.info.width, height: output.info.height } });
    return NextResponse.json({ id, path: relative, width: output.info.width, height: output.info.height }, { status: 201 });
  } catch { return NextResponse.json({ error: 'invalid_image' }, { status: 400 }); }
}

export async function GET() {
  try { await requireStaffPermission('media', 'read'); const assets = await knex('media_assets').select('id', 'public_path', 'mime_type', 'byte_size', 'width', 'height', 'alt_fa', 'alt_en', 'caption_fa', 'caption_en', 'created_at').orderBy('created_at', 'desc').limit(100); return NextResponse.json({ assets }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'forbidden' }, { status: 403 }); }
}

export async function DELETE(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requireStaffPermission('media', 'delete'); const body = await request.json().catch(() => null); const id = typeof body?.id === 'string' ? body.id : '';
    const asset = await knex('media_assets').where({ id }).first(); if (!asset) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const references = await knex('posts').where({ cover_image_path: asset.public_path }).count<{ count: string }[]>('* as count').first();
    if (Number(references?.count ?? 0) > 0) return NextResponse.json({ error: 'media_in_use' }, { status: 409 });
    if (!String(asset.storage_key).startsWith('local:')) return NextResponse.json({ error: 'external_storage_delete_required' }, { status: 409 });
    const directory = path.resolve(process.cwd(), 'public', 'uploads'); const target = path.resolve(process.cwd(), 'public', String(asset.public_path).replace(/^\//, ''));
    if (!target.startsWith(`${directory}${path.sep}`)) throw new Error('INVALID_PATH');
    await unlink(target).catch(error => { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }); await knex('media_assets').where({ id }).delete();
    await writeAuditEvent({ actorUserId: principal.userId, actorRole: principal.role, action: 'media.deleted', resource: 'media_asset', resourceId: id, outcome: 'success' }); return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'delete_failed' }, { status: 400 }); }
}
