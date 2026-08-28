import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { knex } from '../src/server/db/knex';
import { plainText, sanitizeDocument, type RichDocument, type RichNode } from '../src/server/content/document';

const slug = 'دستگاه-cnc-چیست';
const source = path.resolve('deliverables/Persian_SEO_Publication_Queue/EC-002-دستگاه-cnc-چیست/EC-002-دستگاه-CNC-چیست.docx');
const python = process.env.PYTHON_BIN ?? (process.platform === 'win32' ? 'python' : 'python3');
const emptyDocument: RichDocument = { type: 'doc', content: [{ type: 'paragraph' }] };

const textOf = (node: RichNode): string => node.type === 'text' ? node.text ?? '' : (node.content ?? []).map(textOf).join('');
const textNode = (text: string, href?: string): RichNode => ({
  type: 'text', text, ...(href ? { marks: [{ type: 'link', attrs: { href } }] } : {}),
});
const paragraph = (...content: RichNode[]): RichNode => ({ type: 'paragraph', content });
const imageNode = (src: string, alt: string, title: string): RichNode => ({ type: 'image', attrs: { src, alt, title } });

function insertAfterHeading(document: RichDocument, heading: string, node: RichNode) {
  const index = (document.content ?? []).findIndex((item) => item.type === 'heading' && textOf(item).trim() === heading);
  if (index < 0) throw new Error(`Heading not found: ${heading}`);
  document.content?.splice(index + 1, 0, node);
}

function prepareDocument(document: RichDocument): RichDocument {
  const replacements = new Map<string, RichNode>([
    ['[پیشنهاد لینک داخلی با متن لینک «جی کد چیست؟ راهنمای کامل G-code برای دستگاه CNC» به صفحه /fa/blog/جی-کد-چیست]', paragraph(
      textNode('برای آشنایی با زبان فرمان ماشین و ساختار برنامه، راهنمای '),
      textNode('جی کد چیست؟ راهنمای کامل G-code برای دستگاه CNC', '/fa/blog/جی-کد-چیست'),
      textNode(' را نیز مطالعه کنید.'),
    )],
    ['[پیشنهاد لینک داخلی با متن لینک «راهکار انتقال برنامه CNC» به صفحه /fa/product]', paragraph(
      textNode('برای مدیریت نسخه‌ها و رساندن فایل صحیح به ماشین صحیح، '),
      textNode('راهکار انتقال برنامه CNC', '/fa/product'),
      textNode(' را بررسی کنید.'),
    )],
    ['[پیشنهاد لینک داخلی با متن لینک «مقالات و آموزش‌های CNC» به صفحه /fa/blog]', paragraph(
      textNode('برای ادامه مطالعه، مجموعه '),
      textNode('مقالات و آموزش‌های CNC', '/fa/blog'),
      textNode(' را ببینید.'),
    )],
  ]);

  for (let index = 0; index < (document.content ?? []).length; index += 1) {
    const replacement = replacements.get(textOf(document.content![index]).trim());
    if (replacement) document.content![index] = replacement;
  }

  insertAfterHeading(document, 'دستگاه CNC چگونه کار می‌کند؟', imageNode(
    '/uploads/دستگاه-cnc-چیست-body-workflow-hd.webp',
    'اپراتور در حال بررسی مسیر ابزار پیش از اجرای برنامه روی دستگاه CNC',
    'بازبینی Toolpath و برنامه پیش از اجرای کنترل‌شده روی ماشین CNC',
  ));
  insertAfterHeading(document, 'اجزای اصلی دستگاه CNC', imageNode(
    '/uploads/دستگاه-cnc-چیست-body-components-hd.webp',
    'نمای اجزای اصلی دستگاه CNC شامل اسپیندل، میز، قطعه و کنترلر',
    'نمای کلی محفظه ماشین، اسپیندل، میز کار و کنترلر CNC',
  ));

  return sanitizeDocument(document);
}

const media = [
  {
    file: 'دستگاه-cnc-چیست-cover-hd.webp', kind: 'cover',
    alt: 'دستگاه CNC مدرن با محفظه بسته در کارگاه صنعتی',
    caption: 'نمای عمومی یک مرکز ماشین‌کاری CNC محصور و مدرن در کارگاه صنعتی',
  },
  {
    file: 'دستگاه-cnc-چیست-body-workflow-hd.webp', kind: 'body',
    alt: 'اپراتور در حال بررسی مسیر ابزار پیش از اجرای برنامه روی دستگاه CNC',
    caption: 'بازبینی Toolpath و برنامه پیش از اجرای کنترل‌شده روی ماشین CNC',
  },
  {
    file: 'دستگاه-cnc-چیست-body-components-hd.webp', kind: 'body',
    alt: 'نمای اجزای اصلی دستگاه CNC شامل اسپیندل، میز، قطعه و کنترلر',
    caption: 'نمای کلی محفظه ماشین، اسپیندل، میز کار و کنترلر CNC',
  },
];

async function main() {
  const extracted = execFileSync(python, ['scripts/extract-publication-docx.py', source], {
    encoding: 'utf8', maxBuffer: 4_000_000, env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  const bodyFa = prepareDocument(sanitizeDocument(JSON.parse(extracted)));
  const serializedBody = JSON.stringify(bodyFa);
  if (serializedBody.length > 60_000) throw new Error(`Article JSON is too large for the current TEXT column: ${serializedBody.length} bytes`);

  const result = await knex.transaction(async (trx) => {
    const author = await trx('auth_users as u')
      .join('user_profiles as p', 'p.user_id', 'u.id')
      .select('u.id')
      .whereIn('p.role', ['owner', 'admin', 'editor', 'support'])
      .where('p.is_active', true)
      .orderByRaw("FIELD(p.role, 'owner', 'admin', 'editor', 'support')")
      .first();
    if (!author) throw new Error('No active CMS staff author exists.');

    await trx('categories').insert({
      slug: 'cnc-machines', name_fa: 'دستگاه‌های CNC', name_en: 'CNC Machines', sort_order: 16,
    }).onConflict('slug').merge({ name_fa: 'دستگاه‌های CNC', name_en: 'CNC Machines' });
    const category = await trx('categories').select('id').where({ slug: 'cnc-machines' }).first();

    const tagDefinitions = [
      ['cnc-machine', 'دستگاه CNC', 'CNC machine'], ['cnc', 'CNC', 'CNC'],
      ['cnc-machining', 'ماشین‌کاری CNC', 'CNC machining'], ['cnc-controller', 'کنترلر CNC', 'CNC controller'],
      ['cnc-milling', 'فرز CNC', 'CNC milling'], ['cnc-turning', 'تراش CNC', 'CNC turning'],
      ['cnc-safety', 'ایمنی CNC', 'CNC safety'], ['cnc-buying-guide', 'راهنمای انتخاب CNC', 'CNC buying guide'],
    ];
    for (const [tagSlug, nameFa, nameEn] of tagDefinitions) {
      await trx('tags').insert({ slug: tagSlug, name_fa: nameFa, name_en: nameEn })
        .onConflict('slug').merge({ name_fa: nameFa, name_en: nameEn });
    }
    const tags = await trx('tags').select('id').whereIn('slug', tagDefinitions.map(([tagSlug]) => tagSlug));

    for (const asset of media) {
      const bytes = readFileSync(path.resolve('public/uploads', asset.file));
      const storageKey = `generated/${slug}/${asset.kind}/${asset.file}`;
      await trx('media_assets').insert({
        id: randomUUID(), storage_key: storageKey, public_path: `/uploads/${asset.file}`,
        mime_type: 'image/webp', byte_size: bytes.length, width: 1536, height: 1024,
        checksum_sha256: createHash('sha256').update(bytes).digest('hex'),
        alt_fa: asset.alt, alt_en: null, caption_fa: asset.caption, caption_en: null, uploaded_by: author.id,
      }).onConflict('storage_key').ignore();
    }

    const current = await trx('posts').where({ slug }).first();
    const revisionNumber = current ? Number(current.current_revision_number) + 1 : 1;
    const fields = {
      slug, category_id: category.id, author_user_id: current?.author_user_id ?? author.id, updated_by: author.id,
      title_fa: 'دستگاه CNC چیست؟ راهنمای کامل انواع، کاربرد و انتخاب CNC', title_en: '',
      excerpt_fa: 'دستگاه CNC با کنترل عددی کامپیوتری، عملیات ساخت را دقیق و تکرارپذیر اجرا می‌کند. در این راهنما با نحوه کار، اجزا، انواع، کاربردها، هزینه‌ها و معیارهای انتخاب CNC آشنا شوید.', excerpt_en: '',
      body_fa: serializedBody, body_en: JSON.stringify(emptyDocument),
      cover_image_path: '/uploads/دستگاه-cnc-چیست-cover-hd.webp',
      cover_alt_fa: media[0].alt, cover_alt_en: '', cover_caption_fa: media[0].caption, cover_caption_en: '',
      seo_title_fa: 'دستگاه CNC چیست؟ انواع، کاربرد و راهنمای انتخاب', seo_title_en: '',
      seo_description_fa: 'دستگاه CNC چیست و چگونه کار می‌کند؟ با اجزای اصلی، انواع فرز و تراش، کاربردها، هزینه‌های پنهان، نکات ایمنی و معیارهای انتخاب CNC مناسب آشنا شوید.', seo_description_en: '',
      focus_keyword_fa: 'دستگاه CNC', focus_keyword_en: '',
      secondary_keywords_fa: 'CNC چیست، ماشین CNC، انواع دستگاه CNC، فرز CNC، تراش CNC، کنترلر CNC، قیمت دستگاه CNC، خرید دستگاه CNC، ماشین‌کاری CNC', secondary_keywords_en: '',
      canonical_url_fa: '/fa/blog/دستگاه-cnc-چیست', canonical_url_en: '', robots_index: true, schema_type: 'TechArticle',
      og_title_fa: 'دستگاه CNC چیست؟ راهنمای عملی شناخت و انتخاب CNC', og_title_en: '',
      og_description_fa: 'از سازوکار و اجزای CNC تا انواع ماشین، هزینه مالکیت، ایمنی و چک‌لیست انتخاب دستگاه مناسب کارگاه.', og_description_en: '',
      translation_status: 'fa_only', status: 'draft', published_at: null, scheduled_for: null,
      publication_queue_active: false, queued_at: null,
      current_revision_number: revisionNumber, updated_at: trx.fn.now(),
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
    await trx('post_tags').insert(tags.map(({ id }) => ({ post_id: postId, tag_id: id })))
      .onConflict().ignore();
    const post = await trx('posts').where({ id: postId }).first();
    await trx('post_revisions').insert({
      post_id: postId, revision_number: revisionNumber, created_by: author.id,
      change_summary: 'Imported complete Persian CNC machine guide with editable tables, SEO metadata, internal links, FAQ and three optimized images',
      snapshot: JSON.stringify({
        slug: post.slug, categoryId: post.category_id, titleFa: post.title_fa, titleEn: post.title_en,
        excerptFa: post.excerpt_fa, excerptEn: post.excerpt_en, bodyFa, bodyEn: emptyDocument,
        coverImagePath: post.cover_image_path, coverAltFa: post.cover_alt_fa, coverAltEn: post.cover_alt_en,
        coverCaptionFa: post.cover_caption_fa, coverCaptionEn: post.cover_caption_en,
        seoTitleFa: post.seo_title_fa, seoTitleEn: post.seo_title_en,
        seoDescriptionFa: post.seo_description_fa, seoDescriptionEn: post.seo_description_en,
        focusKeywordFa: post.focus_keyword_fa, focusKeywordEn: post.focus_keyword_en,
        secondaryKeywordsFa: post.secondary_keywords_fa, secondaryKeywordsEn: post.secondary_keywords_en,
        canonicalUrlFa: post.canonical_url_fa, canonicalUrlEn: post.canonical_url_en,
        robotsIndex: Boolean(post.robots_index), schemaType: post.schema_type,
        ogTitleFa: post.og_title_fa, ogTitleEn: post.og_title_en,
        ogDescriptionFa: post.og_description_fa, ogDescriptionEn: post.og_description_en,
        status: post.status, translationStatus: post.translation_status,
        scheduledFor: post.scheduled_for, tagIds: tags.map(({ id }) => id),
      }),
    });
    return { postId, revisionNumber };
  });

  const tableCount = (bodyFa.content ?? []).filter((node) => node.type === 'table').length;
  process.stdout.write(`Draft ${slug} imported as post ${result.postId}, revision ${result.revisionNumber}; ${plainText(bodyFa).split(/\s+/).length} Persian words, ${tableCount} tables and 2 body images.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Import failed'}\n`);
  process.exitCode = 1;
}).finally(() => knex.destroy());
