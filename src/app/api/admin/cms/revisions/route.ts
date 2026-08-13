import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { writeAuditEvent } from '@/server/audit/write-audit-event';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';
import { requireStaffPermission } from '@/server/auth/staff-flow';
import { isValidSlug, sanitizeDocument } from '@/server/content/document';
import { knex } from '@/server/db/knex';

export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requireStaffPermission('content', 'update');
    const body = await request.json().catch(() => null);
    const postId = Number(body?.postId);
    const revisionNumber = Number(body?.revisionNumber);
    const [current, revision] = await Promise.all([
      knex('posts').where({ id: postId }).first(),
      knex('post_revisions').where({ post_id: postId, revision_number: revisionNumber }).first(),
    ]);
    if (!current || !revision) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const snap = typeof revision.snapshot === 'string' ? JSON.parse(revision.snapshot) : revision.snapshot;
    if (!isValidSlug(snap.slug)) throw new Error('invalid_snapshot');
    sanitizeDocument(snap.bodyFa);
    sanitizeDocument(snap.bodyEn);

    await knex.transaction(async (trx) => {
      const next = current.current_revision_number + 1;
      if (current.slug !== snap.slug) {
        await trx('post_slug_history').insert({ post_id: postId, old_slug: current.slug }).onConflict('old_slug').ignore();
      }
      await trx('posts').where({ id: postId }).update({
        slug: snap.slug,
        category_id: snap.categoryId ?? null,
        title_fa: snap.titleFa,
        title_en: snap.titleEn,
        excerpt_fa: snap.excerptFa,
        excerpt_en: snap.excerptEn,
        body_fa: JSON.stringify(snap.bodyFa),
        body_en: JSON.stringify(snap.bodyEn),
        cover_image_path: snap.coverImagePath,
        cover_alt_fa: snap.coverAltFa,
        cover_alt_en: snap.coverAltEn,
        cover_caption_fa: snap.coverCaptionFa,
        cover_caption_en: snap.coverCaptionEn,
        seo_title_fa: snap.seoTitleFa,
        seo_title_en: snap.seoTitleEn,
        seo_description_fa: snap.seoDescriptionFa,
        seo_description_en: snap.seoDescriptionEn,
        // Revisions created before the SEO-control migration must not erase newer SEO data.
        focus_keyword_fa: snap.focusKeywordFa ?? current.focus_keyword_fa,
        focus_keyword_en: snap.focusKeywordEn ?? current.focus_keyword_en,
        secondary_keywords_fa: snap.secondaryKeywordsFa ?? current.secondary_keywords_fa,
        secondary_keywords_en: snap.secondaryKeywordsEn ?? current.secondary_keywords_en,
        canonical_url_fa: snap.canonicalUrlFa ?? current.canonical_url_fa,
        canonical_url_en: snap.canonicalUrlEn ?? current.canonical_url_en,
        robots_index: snap.robotsIndex ?? current.robots_index,
        schema_type: snap.schemaType ?? current.schema_type ?? 'Article',
        og_title_fa: snap.ogTitleFa ?? current.og_title_fa,
        og_title_en: snap.ogTitleEn ?? current.og_title_en,
        og_description_fa: snap.ogDescriptionFa ?? current.og_description_fa,
        og_description_en: snap.ogDescriptionEn ?? current.og_description_en,
        status: 'draft',
        translation_status: snap.translationStatus ?? 'complete',
        scheduled_for: null,
        published_at: null,
        updated_by: principal.userId,
        current_revision_number: next,
        updated_at: trx.fn.now(),
      });
      await trx('post_tags').where({ post_id: postId }).delete();
      if (Array.isArray(snap.tagIds) && snap.tagIds.length) {
        await trx('post_tags').insert(snap.tagIds.map((tag_id: number) => ({ post_id: postId, tag_id }))).onConflict().ignore();
      }
      await trx('post_revisions').insert({ post_id: postId, revision_number: next, created_by: principal.userId, change_summary: `Restored revision ${revisionNumber}`, snapshot: JSON.stringify({ ...snap, status: 'draft' }) });
    });

    for (const locale of ['fa', 'en']) {
      revalidatePath(`/${locale}/blog`);
      revalidatePath(`/${locale}/blog/${current.slug}`);
    }
    await writeAuditEvent({ actorUserId: principal.userId, actorRole: principal.role, action: 'content.revision_restored', resource: 'post', resourceId: String(postId), outcome: 'success', metadata: { revisionNumber } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'invalid_revision' }, { status: 400 });
  }
}
