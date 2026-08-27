import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaffPermission } from "@/server/auth/staff-flow";
import { hasTrustedRequestOrigin } from "@/server/auth/customer-flow";
import {
  isValidSlug,
  sanitizeDocument,
  plainText,
} from "@/server/content/document";
import { knex } from "@/server/db/knex";
import { writeAuditEvent } from "@/server/audit/write-audit-event";
import { documentImageStats } from "@/server/content/publication-queue";
const statuses = ["draft", "published"];
const translations = ["fa_only", "en_only", "complete"];
function value(
  body: Record<string, unknown>,
  key: string,
  max: number,
  required = false,
) {
  const result =
    typeof body[key] === "string" ? body[key].trim().slice(0, max) : "";
  if (required && !result) throw new Error(`INVALID_${key}`);
  return result || null;
}
function safeCanonical(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const raw = value.trim().slice(0, 2048);
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  const parsed = new URL(raw);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('INVALID_CANONICAL');
  return parsed.href;
}
function publicationImageError(status: string, translationStatus: string, bodyFa: unknown, bodyEn: unknown) {
  if (status !== 'published') return null;
  for (const [locale, enabled, document] of [
    ['fa', translationStatus !== 'en_only', bodyFa],
    ['en', translationStatus !== 'fa_only', bodyEn],
  ] as const) {
    if (!enabled) continue;
    const stats = documentImageStats(document);
    if (stats.count < 2) return `insufficient_body_images_${locale}`;
    if (stats.missingAlt > 0) return `missing_body_image_alt_${locale}`;
  }
  return null;
}
async function snapshot(trx: typeof knex, id: number) {
  const post = await trx("posts").where({ id }).first();
  const tags = await trx("post_tags").where({ post_id: id }).pluck("tag_id");
  return {
    slug: post.slug,
    categoryId: post.category_id,
    titleFa: post.title_fa,
    titleEn: post.title_en,
    excerptFa: post.excerpt_fa,
    excerptEn: post.excerpt_en,
    bodyFa: JSON.parse(post.body_fa),
    bodyEn: JSON.parse(post.body_en),
    coverImagePath: post.cover_image_path,
    coverAltFa: post.cover_alt_fa,
    coverAltEn: post.cover_alt_en,
    coverCaptionFa: post.cover_caption_fa,
    coverCaptionEn: post.cover_caption_en,
    seoTitleFa: post.seo_title_fa,
    seoTitleEn: post.seo_title_en,
    seoDescriptionFa: post.seo_description_fa,
    seoDescriptionEn: post.seo_description_en,
    focusKeywordFa: post.focus_keyword_fa,
    focusKeywordEn: post.focus_keyword_en,
    secondaryKeywordsFa: post.secondary_keywords_fa,
    secondaryKeywordsEn: post.secondary_keywords_en,
    canonicalUrlFa: post.canonical_url_fa,
    canonicalUrlEn: post.canonical_url_en,
    robotsIndex: post.robots_index,
    schemaType: post.schema_type,
    ogTitleFa: post.og_title_fa,
    ogTitleEn: post.og_title_en,
    ogDescriptionFa: post.og_description_fa,
    ogDescriptionEn: post.og_description_en,
    status: post.status,
    translationStatus: post.translation_status,
    scheduledFor: post.scheduled_for,
    tagIds: tags,
  };
}
export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = await request.json();
    const targetStatus = statuses.includes(body.status) ? body.status : "draft";
    const principal = await requireStaffPermission("content", "create");
    if (targetStatus === "published") {
      await requireStaffPermission("content", "publish");
    }
    const slug = String(body.slug ?? "").trim();
    if (!isValidSlug(slug))
      return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
    const bodyFa = sanitizeDocument(body.bodyFa);
    const bodyEn = sanitizeDocument(body.bodyEn);
    const translationStatus = translations.includes(body.translationStatus)
      ? body.translationStatus
      : "complete";
    if (
      targetStatus === "published" &&
      translationStatus === "complete" &&
      (!plainText(bodyFa) || !plainText(bodyEn))
    ) {
      return NextResponse.json(
        { error: "incomplete_translation" },
        { status: 400 },
      );
    }
    const imageError = publicationImageError(targetStatus, translationStatus, bodyFa, bodyEn);
    if (imageError) return NextResponse.json({ error: imageError }, { status: 400 });
    const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
    if (scheduledFor && Number.isNaN(scheduledFor.getTime())) {
      return NextResponse.json({ error: "invalid_schedule" }, { status: 400 });
    }
    const result = await knex.transaction(async (trx) => {
      const [postId] = await trx("posts")
        .insert({
          slug,
          category_id: Number(body.categoryId) || null,
          author_user_id: principal.userId,
          updated_by: principal.userId,
          title_fa: value(
            body,
            "titleFa",
            240,
            translationStatus !== "en_only",
          ),
          title_en: value(
            body,
            "titleEn",
            240,
            translationStatus !== "fa_only",
          ),
          excerpt_fa: value(body, "excerptFa", 1000),
          excerpt_en: value(body, "excerptEn", 1000),
          body_fa: JSON.stringify(bodyFa),
          body_en: JSON.stringify(bodyEn),
          cover_image_path: value(body, "coverImagePath", 2048),
          cover_alt_fa: value(body, "coverAltFa", 500),
          cover_alt_en: value(body, "coverAltEn", 500),
          cover_caption_fa: value(body, "coverCaptionFa", 2000),
          cover_caption_en: value(body, "coverCaptionEn", 2000),
          seo_title_fa: value(body, "seoTitleFa", 240),
          seo_title_en: value(body, "seoTitleEn", 240),
          seo_description_fa: value(body, "seoDescriptionFa", 500),
          seo_description_en: value(body, "seoDescriptionEn", 500),
          focus_keyword_fa: value(body, "focusKeywordFa", 240),
          focus_keyword_en: value(body, "focusKeywordEn", 240),
          secondary_keywords_fa: value(body, "secondaryKeywordsFa", 2000),
          secondary_keywords_en: value(body, "secondaryKeywordsEn", 2000),
          canonical_url_fa: safeCanonical(body.canonicalUrlFa),
          canonical_url_en: safeCanonical(body.canonicalUrlEn),
          robots_index: body.robotsIndex !== false,
          schema_type: ['Article', 'BlogPosting', 'TechArticle'].includes(body.schemaType) ? body.schemaType : 'Article',
          og_title_fa: value(body, "ogTitleFa", 240),
          og_title_en: value(body, "ogTitleEn", 240),
          og_description_fa: value(body, "ogDescriptionFa", 500),
          og_description_en: value(body, "ogDescriptionEn", 500),
          status: targetStatus,
          translation_status: translationStatus,
          scheduled_for: scheduledFor,
          published_at: targetStatus === "published" ? trx.fn.now() : null,
          current_revision_number: 1,
        });
      const post = { id: postId, slug };
      const tagIds: number[] = Array.isArray(body.tagIds)
        ? body.tagIds.map(Number).filter(Number.isInteger)
        : [];
      if (tagIds.length)
        await trx("post_tags")
          .insert(tagIds.map((tag_id) => ({ post_id: post.id, tag_id })))
          .onConflict()
          .ignore();
      await trx("post_revisions").insert({
        post_id: post.id,
        revision_number: 1,
        created_by: principal.userId,
        change_summary:
          targetStatus === "published" ? "Initial publication" : "Initial draft",
        snapshot: JSON.stringify(await snapshot(trx, post.id)),
      });
      return post;
    });
    await writeAuditEvent({
      actorUserId: principal.userId,
      actorRole: principal.role,
      action:
        targetStatus === "published" ? "content.published" : "content.created",
      resource: "post",
      resourceId: String(result.id),
      outcome: "success",
    });
    if (targetStatus === "published") {
      for (const locale of ["fa", "en"]) {
        revalidatePath(`/${locale}/blog`);
        revalidatePath(`/${locale}/blog/${result.slug}`);
      }
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "invalid_request" },
      { status: 400 },
    );
  }
}
export async function PATCH(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = await request.json();
    const targetStatus = statuses.includes(body.status) ? body.status : "draft";
    const principal = await requireStaffPermission(
      "content",
      targetStatus === "published" ? "publish" : "update",
    );
    const id = Number(body.id);
    const current = await knex("posts").where({ id }).first();
    if (!current)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    const slug = String(body.slug ?? "").trim();
    if (!isValidSlug(slug))
      return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
    const bodyFa = sanitizeDocument(body.bodyFa);
    const bodyEn = sanitizeDocument(body.bodyEn);
    const translationStatus = translations.includes(body.translationStatus)
      ? body.translationStatus
      : "complete";
    if (
      targetStatus === "published" &&
      translationStatus === "complete" &&
      (!plainText(bodyFa) || !plainText(bodyEn))
    )
      return NextResponse.json(
        { error: "incomplete_translation" },
        { status: 400 },
      );
    const imageError = publicationImageError(targetStatus, translationStatus, bodyFa, bodyEn);
    if (imageError) return NextResponse.json({ error: imageError }, { status: 400 });
    const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
    if (scheduledFor && Number.isNaN(scheduledFor.getTime()))
      return NextResponse.json({ error: "invalid_schedule" }, { status: 400 });
    await knex.transaction(async (trx) => {
      if (current.slug !== slug)
        await trx("post_slug_history")
          .insert({ post_id: id, old_slug: current.slug })
          .onConflict("old_slug")
          .ignore();
      const next = current.current_revision_number + 1;
      await trx("posts")
        .where({ id })
        .update({
          slug,
          category_id: Number(body.categoryId) || null,
          updated_by: principal.userId,
          title_fa: value(
            body,
            "titleFa",
            240,
            translationStatus !== "en_only",
          ),
          title_en: value(
            body,
            "titleEn",
            240,
            translationStatus !== "fa_only",
          ),
          excerpt_fa: value(body, "excerptFa", 1000),
          excerpt_en: value(body, "excerptEn", 1000),
          body_fa: JSON.stringify(bodyFa),
          body_en: JSON.stringify(bodyEn),
          cover_image_path: value(body, "coverImagePath", 2048),
          cover_alt_fa: value(body, "coverAltFa", 500),
          cover_alt_en: value(body, "coverAltEn", 500),
          cover_caption_fa: value(body, "coverCaptionFa", 2000),
          cover_caption_en: value(body, "coverCaptionEn", 2000),
          seo_title_fa: value(body, "seoTitleFa", 240),
          seo_title_en: value(body, "seoTitleEn", 240),
          seo_description_fa: value(body, "seoDescriptionFa", 500),
          seo_description_en: value(body, "seoDescriptionEn", 500),
          focus_keyword_fa: value(body, "focusKeywordFa", 240),
          focus_keyword_en: value(body, "focusKeywordEn", 240),
          secondary_keywords_fa: value(body, "secondaryKeywordsFa", 2000),
          secondary_keywords_en: value(body, "secondaryKeywordsEn", 2000),
          canonical_url_fa: safeCanonical(body.canonicalUrlFa),
          canonical_url_en: safeCanonical(body.canonicalUrlEn),
          robots_index: body.robotsIndex !== false,
          schema_type: ['Article', 'BlogPosting', 'TechArticle'].includes(body.schemaType) ? body.schemaType : 'Article',
          og_title_fa: value(body, "ogTitleFa", 240),
          og_title_en: value(body, "ogTitleEn", 240),
          og_description_fa: value(body, "ogDescriptionFa", 500),
          og_description_en: value(body, "ogDescriptionEn", 500),
          status: targetStatus,
          translation_status: translationStatus,
          scheduled_for: scheduledFor,
          published_at:
            targetStatus === "published"
              ? (current.published_at ?? trx.fn.now())
              : null,
          publication_queue_active: false,
          queued_at: null,
          current_revision_number: next,
          updated_at: trx.fn.now(),
        });
      await trx("post_tags").where({ post_id: id }).delete();
      const tagIds: number[] = Array.isArray(body.tagIds)
        ? body.tagIds.map(Number).filter(Number.isInteger)
        : [];
      if (tagIds.length)
        await trx("post_tags")
          .insert(tagIds.map((tag_id) => ({ post_id: id, tag_id })))
          .onConflict()
          .ignore();
      await trx("post_revisions").insert({
        post_id: id,
        revision_number: next,
        created_by: principal.userId,
        change_summary: value(body, "changeSummary", 500),
        snapshot: JSON.stringify(await snapshot(trx, id)),
      });
    });
    for (const locale of ["fa", "en"]) {
      revalidatePath(`/${locale}/blog`);
      revalidatePath(`/${locale}/blog/${current.slug}`);
      revalidatePath(`/${locale}/blog/${slug}`);
    }
    await writeAuditEvent({
      actorUserId: principal.userId,
      actorRole: principal.role,
      action:
        targetStatus === "published" ? "content.published" : "content.revised",
      resource: "post",
      resourceId: String(id),
      outcome: "success",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "invalid_request" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const principal = await requireStaffPermission('content', 'delete');
    const body = await request.json().catch(() => null); const id = Number(body?.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
    const post = await knex('posts').select('slug').where({ id }).first();
    if (!post) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    await knex('posts').where({ id }).delete();
    for (const locale of ['fa', 'en']) { revalidatePath(`/${locale}/blog`); revalidatePath(`/${locale}/blog/${post.slug}`); }
    await writeAuditEvent({ actorUserId: principal.userId, actorRole: principal.role, action: 'content.deleted', resource: 'post', resourceId: String(id), outcome: 'success', metadata: { slug: post.slug } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'delete_failed' }, { status: 400 }); }
}
