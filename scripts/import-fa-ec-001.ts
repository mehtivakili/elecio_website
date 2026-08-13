import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { knex } from '../src/server/db/knex';
import { plainText, sanitizeDocument, type RichDocument, type RichNode } from '../src/server/content/document';

const slug = 'cnc-file-transfer-guide';
const publicationDirectory = path.resolve('deliverables/publications');

const linkedParagraph = (before: string, anchor: string, href: string, after = ''): RichNode => ({
  type: 'paragraph', content: [
    ...(before ? [{ type: 'text', text: before } as RichNode] : []),
    { type: 'text', text: anchor, marks: [{ type: 'link', attrs: { href } }] },
    ...(after ? [{ type: 'text', text: after } as RichNode] : []),
  ],
});

function addAfterHeading(document: RichDocument, heading: string, paragraph: RichNode) {
  const nodes = document.content ?? [];
  const index = nodes.findIndex((node) => node.type === 'heading' && plainText({ type: 'doc', content: [node] }) === heading);
  if (index >= 0) nodes.splice(index + 1, 0, paragraph);
}

async function main() {
  const sourceName = readdirSync(publicationDirectory).find((name) => name.endsWith('.docx') && !name.startsWith('Elecio_EN'));
  if (!sourceName) throw new Error('Persian EC-001 publication DOCX was not found.');
  const extracted = execFileSync('python', ['scripts/extract-publication-docx.py', path.join(publicationDirectory, sourceName)], {
    encoding: 'utf8', maxBuffer: 4_000_000, env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  const bodyFa = sanitizeDocument(JSON.parse(extracted));
  addAfterHeading(bodyFa, 'مدیریت متمرکز انتقال برنامه با Smart DNC', linkedParagraph('برای بررسی جزئیات محصول، ', 'Smart DNC برای انتقال برنامه CNC', '/fa/product', ' را ببینید.'));
  addAfterHeading(bodyFa, 'شبکه CNC چیست و چه زمانی ارزش ایجاد می‌کند؟', linkedParagraph('با ', 'نرم‌افزار مدیریت و انتقال فایل CNC', '/fa/software', ' می‌توان گردش فایل و ارتباط ماشین‌ها را متمرکز کرد.'));
  addAfterHeading(bodyFa, 'جمع‌بندی', linkedParagraph('برای بررسی کنترلر و شرایط کارگاه، ', 'با تیم ElecIO گفتگو کنید', '/fa/contact', '.'));

  const current = await knex('posts').where({ slug }).first();
  if (!current) throw new Error(`Post ${slug} does not exist.`);
  const tags = await knex('tags').select('id').whereIn('slug', [
    'cnc-file-transfer', 'cnc-program-transfer', 'dnc', 'nc-file-transfer',
    'rs232', 'cnc-networking', 'cnc-communication', 'cnc-program-management',
  ]);

  await knex.transaction(async (trx) => {
    const nextRevision = Number(current.current_revision_number) + 1;
    await trx('posts').where({ id: current.id }).update({
      title_fa: 'انتقال فایل CNC؛ راهنمای کامل ارسال برنامه NC، شبکه CNC و DNC',
      excerpt_fa: 'راهنمای جامع انتخاب و راه‌اندازی روش انتقال فایل CNC با USB، RS-232، شبکه و DNC؛ از کنترل نسخه و سازگاری کنترلر تا رفع خطاهای رایج.',
      body_fa: JSON.stringify(bodyFa),
      cover_alt_fa: 'انتقال فایل CNC و مدیریت برنامه‌های NC با Smart DNC در کارگاه',
      seo_title_fa: 'انتقال فایل CNC؛ راهنمای ارسال برنامه NC و راه‌اندازی DNC',
      seo_description_fa: 'راهنمای کامل انتقال فایل CNC و ارسال برنامه NC با USB، RS232، شبکه و DNC؛ همراه با مقایسه روش‌ها، تنظیمات ارتباطی، خطاهای رایج و نکات انتخاب راهکار مناسب.',
      focus_keyword_fa: 'انتقال فایل CNC',
      secondary_keywords_fa: 'انتقال برنامه CNC، ارسال فایل NC، شبکه CNC، ارسال برنامه به CNC، انتقال فایل CNC با RS232، DNC چیست، ارتباط CNC با کامپیوتر، مدیریت برنامه‌های NC',
      canonical_url_fa: '/fa/blog/cnc-file-transfer-guide',
      og_title_fa: 'انتقال فایل CNC؛ از USB و RS232 تا شبکه و DNC',
      og_description_fa: 'روش‌های انتقال برنامه CNC، تنظیمات ضروری، مقایسه راهکارها و خطاهای رایج را در یک راهنمای کاربردی بررسی کنید.',
      translation_status: 'complete',
      status: 'published',
      published_at: current.published_at ?? trx.fn.now(),
      scheduled_for: null,
      robots_index: true,
      updated_by: current.updated_by,
      current_revision_number: nextRevision,
      updated_at: trx.fn.now(),
    });
    await trx('post_tags').where({ post_id: current.id }).delete();
    await trx('post_tags').insert(tags.map(({ id }) => ({ post_id: current.id, tag_id: id })));
    const updated = await trx('posts').where({ id: current.id }).first();
    await trx('post_revisions').insert({
      post_id: current.id, revision_number: nextRevision, created_by: current.updated_by,
      change_summary: 'Imported complete Persian EC-001 publication and published bilingual article',
      snapshot: JSON.stringify({
        slug: updated.slug, categoryId: updated.category_id, titleFa: updated.title_fa, titleEn: updated.title_en,
        excerptFa: updated.excerpt_fa, excerptEn: updated.excerpt_en, bodyFa, bodyEn: JSON.parse(updated.body_en),
        coverImagePath: updated.cover_image_path, coverAltFa: updated.cover_alt_fa, coverAltEn: updated.cover_alt_en,
        coverCaptionFa: updated.cover_caption_fa, coverCaptionEn: updated.cover_caption_en,
        seoTitleFa: updated.seo_title_fa, seoTitleEn: updated.seo_title_en,
        seoDescriptionFa: updated.seo_description_fa, seoDescriptionEn: updated.seo_description_en,
        focusKeywordFa: updated.focus_keyword_fa, focusKeywordEn: updated.focus_keyword_en,
        secondaryKeywordsFa: updated.secondary_keywords_fa, secondaryKeywordsEn: updated.secondary_keywords_en,
        canonicalUrlFa: updated.canonical_url_fa, canonicalUrlEn: updated.canonical_url_en,
        robotsIndex: updated.robots_index, schemaType: updated.schema_type,
        ogTitleFa: updated.og_title_fa, ogTitleEn: updated.og_title_en,
        ogDescriptionFa: updated.og_description_fa, ogDescriptionEn: updated.og_description_en,
        status: updated.status, translationStatus: updated.translation_status, scheduledFor: updated.scheduled_for,
        tagIds: tags.map(({ id }) => id),
      }),
    });
  });
  process.stdout.write(`Imported ${sourceName}: ${plainText(bodyFa).split(/\s+/).length} Persian words; bilingual post published.\n`);
}

main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'Import failed'}\n`); process.exitCode = 1; }).finally(() => knex.destroy());
