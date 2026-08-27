import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';
import { requireStaffPermission } from '@/server/auth/staff-flow';
import { writeAuditEvent } from '@/server/audit/write-audit-event';
import { isPublicationCadence, persianQueueReadiness, scheduleQueueSlots } from '@/server/content/publication-queue';
import { knex } from '@/server/db/knex';
import { publicationQueueSchemaReady } from '@/server/db/publication-queue-schema';

async function settleDueItems(trx: typeof knex) {
  await trx('posts')
    .where({ publication_queue_active: true })
    .whereNotNull('scheduled_for')
    .where('scheduled_for', '<=', trx.fn.now())
    .update({ publication_queue_active: false, queued_at: null, updated_at: trx.fn.now() });
}

async function reflowQueue(trx: typeof knex, cadenceDays: 2 | 3 | 4, requestedStart?: Date | null) {
  if (requestedStart && requestedStart <= new Date()) throw new Error('FIRST_PUBLICATION_MUST_BE_FUTURE');
  const queued = await trx('posts')
    .select('id', 'scheduled_for')
    .where({ publication_queue_active: true })
    .orderByRaw('scheduled_for is null')
    .orderBy('scheduled_for', 'asc')
    .orderBy('queued_at', 'asc')
    .orderBy('id', 'asc');
  if (!queued.length) {
    await trx('publication_queue_settings').where({ id: 1 }).update({ first_publish_at: requestedStart ?? null, cadence_days: cadenceDays, updated_at: trx.fn.now() });
    return;
  }
  const minimum = new Date(Date.now() + 5 * 60 * 1000);
  const existingStart = queued[0].scheduled_for ? new Date(queued[0].scheduled_for) : null;
  const firstPublishAt = requestedStart ?? (existingStart && existingStart > minimum ? existingStart : new Date(Date.now() + cadenceDays * 86_400_000));
  if (firstPublishAt <= new Date()) throw new Error('FIRST_PUBLICATION_MUST_BE_FUTURE');
  const slots = scheduleQueueSlots(firstPublishAt, cadenceDays, queued.length);
  for (let index = 0; index < queued.length; index += 1) {
    await trx('posts').where({ id: queued[index].id }).update({
      status: 'published', scheduled_for: slots[index], published_at: slots[index], updated_at: trx.fn.now(),
    });
  }
  await trx('publication_queue_settings').where({ id: 1 }).update({
    cadence_days: cadenceDays, first_publish_at: slots[0], updated_at: trx.fn.now(),
  });
}

export async function PATCH(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requireStaffPermission('content', 'publish');
    if (!await publicationQueueSchemaReady(knex)) {
      return NextResponse.json({ error: 'publication_queue_migration_required' }, { status: 503 });
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    const settingsOnly = body.id === undefined;
    const result = await knex.transaction(async (trx) => {
      await settleDueItems(trx as typeof knex);
      const settings = await trx('publication_queue_settings').where({ id: 1 }).first();
      const cadenceDays = Number(body.cadenceDays ?? settings?.cadence_days ?? 3);
      if (!isPublicationCadence(cadenceDays)) throw new Error('INVALID_CADENCE');
      let requestedStart: Date | null | undefined;
      if (settingsOnly || body.firstPublishAt !== undefined) {
        requestedStart = new Date(String(body.firstPublishAt ?? ''));
        if (Number.isNaN(requestedStart.getTime())) throw new Error('INVALID_FIRST_PUBLICATION');
      } else {
        const id = Number(body.id);
        if (!Number.isInteger(id)) throw new Error('INVALID_POST');
        const post = await trx('posts').where({ id }).first();
        if (!post) throw new Error('POST_NOT_FOUND');
        if (body.active === true) {
          if (post.status !== 'draft' && !post.publication_queue_active) throw new Error('ONLY_DRAFTS_CAN_BE_QUEUED');
          const missing = persianQueueReadiness(post);
          if (missing.length) return { error: 'SEO_NOT_READY', missing } as const;
          await trx('posts').where({ id }).update({ publication_queue_active: true, queued_at: trx.fn.now(), updated_at: trx.fn.now() });
        } else if (post.publication_queue_active && (!post.scheduled_for || new Date(post.scheduled_for) > new Date())) {
          await trx('posts').where({ id }).update({
            publication_queue_active: false, queued_at: null, status: 'draft', scheduled_for: null, published_at: null, updated_at: trx.fn.now(),
          });
        }
      }
      await reflowQueue(trx as typeof knex, cadenceDays, requestedStart);
      return { ok: true } as const;
    });
    if ('error' in result) return NextResponse.json(result, { status: 400 });
    for (const locale of ['fa', 'en']) revalidatePath(`/${locale}/blog`);
    revalidatePath('/fa/admin/content');
    revalidatePath('/en/admin/content');
    await writeAuditEvent({
      actorUserId: principal.userId, actorRole: principal.role,
      action: settingsOnly ? 'content.queue_configured' : (body.active ? 'content.queued' : 'content.dequeued'),
      resource: settingsOnly ? 'publication_queue' : 'post', resourceId: settingsOnly ? '1' : String(body.id), outcome: 'success',
      metadata: settingsOnly ? { cadenceDays: body.cadenceDays, firstPublishAt: body.firstPublishAt } : { active: body.active },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'queue_update_failed' }, { status: 400 });
  }
}
