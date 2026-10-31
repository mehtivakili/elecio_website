import 'dotenv/config';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { knex } from '../src/server/db/knex';
import { plainText, sanitizeDocument, type RichDocument } from '../src/server/content/document';
import { persianQueueReadiness } from '../src/server/content/publication-queue';
import { publicationQueueSchemaReady } from '../src/server/db/publication-queue-schema';

// Articles EC-011..EC-020 are generated as JSON (same content as the Word files in
// deliverables/Persian_SEO_Publication_Queue) so the published text and the reviewed text match.
type Media = { file: string; kind: 'cover' | 'body'; alt: string; caption: string };
type Article = {
  code: string; slug: string; title: string; excerpt: string; seoTitle: string; seoDescription: string;
  focusKeyword: string; secondaryKeywords: string; schemaType: 'Article' | 'TechArticle';
  category: { slug: string; nameFa: string; nameEn: string; sortOrder: number };
  tags: Array<[string, string, string]>; media: [Media, Media, Media]; body: RichDocument;
};

const CONTENT_DIR = path.resolve('scripts/content/fa-ec-011-020');
const only = process.argv.slice(2).filter((arg) => /^EC-\d{3}$/.test(arg));
const articles: Article[] = readdirSync(CONTENT_DIR)
  .filter((file) => file.endsWith('.json') && (!only.length || only.includes(file.replace('.json', ''))))
  .sort()
  .map((file) => JSON.parse(readFileSync(path.join(CONTENT_DIR, file), 'utf8')) as Article);

const emptyDocument: RichDocument = { type: 'doc', content: [{ type: 'paragraph' }] };

function tomorrowAtNine(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}

function missingImages(): string[] {
  return articles.flatMap((article) => article.media
    .filter((asset) => !existsSync(path.resolve('public/uploads', asset.file)))
    .map((asset) => `${article.code}: public/uploads/${asset.file}`));
}

async function main() {
  if (!articles.length) throw new Error(`No article JSON found in ${CONTENT_DIR}`);
  const absent = missingImages();
  if (absent.length) {
    throw new Error(`Images are missing. Generate them from images/prompts-exact.txt in each article folder, then copy the -hd.webp files to public/uploads:\n${absent.join('\n')}`);
  }

  if (process.argv.includes('--dry-run')) {
    for (const article of articles) {
      const body = sanitizeDocument(article.body);
      const missing = persianQueueReadiness({
        slug: article.slug, title_fa: article.title, body_fa: body,
        cover_image_path: `/uploads/${article.media[0].file}`, cover_alt_fa: article.media[0].alt,
        seo_title_fa: article.seoTitle, seo_description_fa: article.seoDescription,
        focus_keyword_fa: article.focusKeyword, category_id: 1, robots_index: true, translation_status: 'fa_only',
      });
      const imageSizes = [];
      for (const asset of article.media) {
        const metadata = await sharp(path.resolve('public/uploads', asset.file)).metadata();
        imageSizes.push(`${asset.file}=${metadata.width}x${metadata.height}`);
      }
      const words = plainText(body).split(/\s+/).filter(Boolean).length;
      const tables = (body.content ?? []).filter((node) => node.type === 'table').length;
      const size = JSON.stringify(body).length;
      if (missing.length || tables < 2 || words < 1500 || size > 60_000) {
        throw new Error(`${article.code} not ready: missing=${missing.join(',') || 'none'}, words=${words}, tables=${tables}, json=${size}`);
      }
      process.stdout.write(`${article.code}: ready; ${words} words; ${tables} tables; ${imageSizes.join('; ')}\n`);
    }
    return;
  }

  if (!await publicationQueueSchemaReady(knex)) {
    throw new Error('Publication queue schema is missing. Run `npm run db:migrate` before importing EC-011 through EC-020.');
  }

  const summary = await knex.transaction(async (trx) => {
    const author = await trx('auth_users').select('id').orderBy('created_at').first();
    if (!author) throw new Error('No CMS author exists. Create an admin user before importing.');
    const imported: Array<{ id: number; code: string; slug: string; words: number; tables: number }> = [];

    for (const article of articles) {
      await trx('categories').insert({
        slug: article.category.slug, name_fa: article.category.nameFa, name_en: article.category.nameEn, sort_order: article.category.sortOrder,
      }).onConflict('slug').merge({ name_fa: article.category.nameFa, name_en: article.category.nameEn });
      const category = await trx('categories').select('id').where({ slug: article.category.slug }).first();

      for (const [slug, nameFa, nameEn] of article.tags) {
        await trx('tags').insert({ slug, name_fa: nameFa, name_en: nameEn }).onConflict('slug').merge({ name_fa: nameFa, name_en: nameEn });
      }
      const tags = await trx('tags').select('id').whereIn('slug', article.tags.map(([slug]) => slug));

      for (const asset of article.media) {
        const bytes = readFileSync(path.resolve('public/uploads', asset.file));
        const metadata = await sharp(bytes).metadata();
        const storageKey = `generated/${article.slug}/${asset.kind}/${asset.file}`;
        await trx('media_assets').insert({
          id: randomUUID(), storage_key: storageKey, public_path: `/uploads/${asset.file}`, mime_type: 'image/webp',
          byte_size: bytes.length, width: metadata.width ?? 1536, height: metadata.height ?? 1024,
          checksum_sha256: createHash('sha256').update(bytes).digest('hex'),
          alt_fa: asset.alt, alt_en: null, caption_fa: asset.caption, caption_en: null, uploaded_by: author.id,
        }).onConflict('storage_key').merge({
          public_path: `/uploads/${asset.file}`, byte_size: bytes.length,
          checksum_sha256: createHash('sha256').update(bytes).digest('hex'), alt_fa: asset.alt, caption_fa: asset.caption,
        });
      }

      const bodyFa = sanitizeDocument(article.body);
      const serializedBody = JSON.stringify(bodyFa);
      if (serializedBody.length > 60_000) throw new Error(`${article.code} JSON is too large: ${serializedBody.length} bytes`);
      const current = await trx('posts').where({ slug: article.slug }).first();
      if (current?.status === 'published' && !current.publication_queue_active) {
        throw new Error(`${article.code} (${article.slug}) is already live; refusing to move it back into the queue.`);
      }
      const revisionNumber = current ? Number(current.current_revision_number) + 1 : 1;
      const fields = {
        slug: article.slug, category_id: category.id, author_user_id: current?.author_user_id ?? author.id,
        title_fa: article.title, title_en: '', excerpt_fa: article.excerpt, excerpt_en: '',
        body_fa: serializedBody, body_en: JSON.stringify(emptyDocument),
        cover_image_path: `/uploads/${article.media[0].file}`, cover_alt_fa: article.media[0].alt, cover_alt_en: '',
        cover_caption_fa: article.media[0].caption, cover_caption_en: '',
        seo_title_fa: article.seoTitle, seo_title_en: '', seo_description_fa: article.seoDescription, seo_description_en: '',
        focus_keyword_fa: article.focusKeyword, focus_keyword_en: '', secondary_keywords_fa: article.secondaryKeywords, secondary_keywords_en: '',
        canonical_url_fa: `/fa/blog/${article.slug}`, canonical_url_en: '', robots_index: true, schema_type: article.schemaType,
        og_title_fa: article.seoTitle, og_title_en: '', og_description_fa: article.seoDescription, og_description_en: '',
        translation_status: 'fa_only', status: 'draft', published_at: null, scheduled_for: null,
        publication_queue_active: false, queued_at: null,
        updated_by: author.id, current_revision_number: revisionNumber, updated_at: trx.fn.now(),
      };

      let postId: number;
      if (current) {
        postId = Number(current.id);
        await trx('posts').where({ id: postId }).update(fields);
        await trx('post_tags').where({ post_id: postId }).delete();
      } else {
        const [insertedId] = await trx('posts').insert(fields);
        postId = Number(insertedId);
      }
      await trx('post_tags').insert(tags.map(({ id }) => ({ post_id: postId, tag_id: id })));
      const post = await trx('posts').where({ id: postId }).first();
      await trx('post_revisions').insert({
        post_id: postId, revision_number: revisionNumber, created_by: author.id,
        change_summary: `Imported publication-ready Persian article ${article.code} with editable tables, SEO metadata, FAQ and three optimized images`,
        snapshot: JSON.stringify({
          slug: post.slug, categoryId: post.category_id, titleFa: post.title_fa, titleEn: post.title_en,
          excerptFa: post.excerpt_fa, excerptEn: post.excerpt_en, bodyFa, bodyEn: emptyDocument,
          coverImagePath: post.cover_image_path, coverAltFa: post.cover_alt_fa, coverAltEn: post.cover_alt_en,
          coverCaptionFa: post.cover_caption_fa, coverCaptionEn: post.cover_caption_en,
          seoTitleFa: post.seo_title_fa, seoTitleEn: post.seo_title_en, seoDescriptionFa: post.seo_description_fa,
          seoDescriptionEn: post.seo_description_en, focusKeywordFa: post.focus_keyword_fa, focusKeywordEn: post.focus_keyword_en,
          secondaryKeywordsFa: post.secondary_keywords_fa, secondaryKeywordsEn: post.secondary_keywords_en,
          canonicalUrlFa: post.canonical_url_fa, canonicalUrlEn: post.canonical_url_en, robotsIndex: Boolean(post.robots_index),
          schemaType: post.schema_type, ogTitleFa: post.og_title_fa, ogTitleEn: post.og_title_en,
          ogDescriptionFa: post.og_description_fa, ogDescriptionEn: post.og_description_en,
          status: post.status, translationStatus: post.translation_status, scheduledFor: post.scheduled_for, tagIds: tags.map(({ id }) => id),
        }),
      });
      imported.push({
        id: postId, code: article.code, slug: article.slug,
        words: plainText(bodyFa).split(/\s+/).filter(Boolean).length,
        tables: (bodyFa.content ?? []).filter((node) => node.type === 'table').length,
      });
    }

    // Queue after whatever is already scheduled, keeping the configured cadence (default every 3 days).
    const now = new Date();
    const settings = await trx('publication_queue_settings').where({ id: 1 }).first();
    const cadenceDays = [1, 2, 3, 4].includes(Number(settings?.cadence_days)) ? Number(settings.cadence_days) : 3;
    const existing = await trx('posts').select('scheduled_for')
      .where({ publication_queue_active: true }).whereNotIn('id', imported.map(({ id }) => id))
      .whereNotNull('scheduled_for').where('scheduled_for', '>', now).orderBy('scheduled_for', 'asc');
    const lastExisting = existing.at(-1)?.scheduled_for ? new Date(existing.at(-1).scheduled_for) : null;
    const configuredStart = settings?.first_publish_at ? new Date(settings.first_publish_at) : null;
    let nextSlot = lastExisting
      ? new Date(lastExisting.getTime() + cadenceDays * 86_400_000)
      : configuredStart && configuredStart > new Date(Date.now() + 5 * 60_000) ? configuredStart : tomorrowAtNine();

    const firstSlot = nextSlot;
    for (const article of imported) {
      await trx('posts').where({ id: article.id }).update({
        status: 'published', publication_queue_active: true, queued_at: trx.fn.now(),
        scheduled_for: nextSlot, published_at: nextSlot, updated_at: trx.fn.now(),
      });
      Object.assign(article, { scheduledFor: nextSlot.toISOString() });
      nextSlot = new Date(nextSlot.getTime() + cadenceDays * 86_400_000);
    }
    if (!existing.length && imported.length) {
      // Pass the Date itself: MySQL DATETIME rejects the ISO string with "T" and "Z".
      await trx('publication_queue_settings').where({ id: 1 }).update({
        first_publish_at: firstSlot, updated_at: trx.fn.now(),
      });
    }
    return { cadenceDays, imported };
  });

  for (const article of summary.imported) {
    const scheduledFor = (article as typeof article & { scheduledFor: string }).scheduledFor;
    process.stdout.write(`${article.code} ${article.slug}: post ${article.id}; ${article.words} words; ${article.tables} tables; queued ${scheduledFor}\n`);
  }
  process.stdout.write(`Queue cadence: every ${summary.cadenceDays} day(s).\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : 'Import failed'}\n`);
  process.exitCode = 1;
}).finally(() => knex.destroy());
