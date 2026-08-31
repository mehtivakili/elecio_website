import { randomInt } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';
import { requireStaffPermission } from '@/server/auth/staff-flow';
import { writeAuditEvent } from '@/server/audit/write-audit-event';
import { instagramSchemaReady } from '@/server/db/instagram-schema';
import { knex } from '@/server/db/knex';

const MAX_CAPTION_LENGTH = 2_200;
const MAX_MEDIA_ITEMS = 10;
const allowedMediaPath = /^\/(?:uploads|images\/instagram\/carousels)\/[A-Za-z0-9_./-]+$/;

function captionOf(value: unknown): string {
  if (typeof value !== 'string') throw new Error('invalid_caption');
  const caption = value.trim();
  if (!caption || caption.length > MAX_CAPTION_LENGTH) throw new Error('invalid_caption');
  return caption;
}

function scheduleOf(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const scheduledFor = new Date(String(value));
  if (Number.isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) throw new Error('schedule_must_be_future');
  return scheduledFor;
}

function mediaOf(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_MEDIA_ITEMS) throw new Error('invalid_media');
  const media = value.map((item) => String(item));
  if (media.some((item) => !allowedMediaPath.test(item))) throw new Error('invalid_media_path');
  return media;
}

async function requireSchema() {
  if (!await instagramSchemaReady(knex)) throw new Error('instagram_migration_required');
}

export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requireStaffPermission('social', 'create');
    await requireSchema();
    const body = await request.json().catch(() => null);
    const caption = captionOf(body?.caption);
    const media = mediaOf(body?.mediaPaths);
    const scheduledFor = scheduleOf(body?.scheduledFor);
    const postId = await knex.transaction(async (trx) => {
      const highestOrder = await trx('social_instagram_posts')
        .where({ profile_id: 1 })
        .max<{ maxOrder: string | number | null }>('display_order as maxOrder')
        .first();
      const [id] = await trx('social_instagram_posts').insert({
        profile_id: 1,
        caption,
        status: scheduledFor ? 'scheduled' : 'draft',
        display_order: Number(highestOrder?.maxOrder ?? 0) + 1,
        like_count: randomInt(900, 3_501),
        scheduled_for: scheduledFor,
        created_by: principal.userId,
        updated_by: principal.userId,
      });
      await trx('social_instagram_post_media').insert(media.map((publicPath, index) => ({
        post_id: id,
        public_path: publicPath,
        media_type: 'image',
        alt_text: `Instagram carousel slide ${index + 1}`,
        sort_order: index,
      })));
      return Number(id);
    });
    await writeAuditEvent({
      actorUserId: principal.userId,
      actorRole: principal.role,
      action: 'social.instagram_post_created',
      resource: 'instagram_post',
      resourceId: String(postId),
      outcome: 'success',
      metadata: { mediaCount: media.length, scheduled: Boolean(scheduledFor) },
    });
    const created = await knex('social_instagram_posts').select('like_count').where({ id: postId }).first();
    return NextResponse.json({ id: postId, likes: Number(created?.like_count ?? 900), status: scheduledFor ? 'scheduled' : 'draft', scheduledFor: scheduledFor?.toISOString() ?? null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'create_failed' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requireStaffPermission('social', 'update');
    await requireSchema();
    const body = await request.json().catch(() => null);
    const id = Number(body?.id);
    if (!Number.isInteger(id) || id < 1) throw new Error('invalid_post');
    const scheduledFor = scheduleOf(body?.scheduledFor);
    const post = await knex('social_instagram_posts').select('status').where({ id, profile_id: 1 }).first();
    if (!post) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (['publishing', 'published'].includes(post.status)) return NextResponse.json({ error: 'published_post_locked' }, { status: 409 });
    await knex('social_instagram_posts').where({ id }).update({
      status: scheduledFor ? 'scheduled' : 'draft',
      scheduled_for: scheduledFor,
      last_publish_error: null,
      updated_by: principal.userId,
      updated_at: knex.fn.now(),
    });
    await writeAuditEvent({
      actorUserId: principal.userId,
      actorRole: principal.role,
      action: scheduledFor ? 'social.instagram_post_scheduled' : 'social.instagram_schedule_cleared',
      resource: 'instagram_post',
      resourceId: String(id),
      outcome: 'success',
      metadata: { scheduledFor: scheduledFor?.toISOString() ?? null },
    });
    return NextResponse.json({ ok: true, status: scheduledFor ? 'scheduled' : 'draft', scheduledFor: scheduledFor?.toISOString() ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'update_failed' }, { status: 400 });
  }
}
