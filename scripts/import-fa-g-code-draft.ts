import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { knex } from '../src/server/db/knex';
import { plainText, sanitizeDocument, type RichDocument, type RichNode } from '../src/server/content/document';

const slug = 'جی-کد-چیست';
const source = path.resolve('deliverables/Persian_SEO_Publication_Queue/EC-001-جی-کد-چیست/EC-001-جی-کد-چیست.docx');
const emptyDocument: RichDocument = { type: 'doc', content: [{ type: 'paragraph' }] };

const textOf = (node: RichNode): string => node.type === 'text' ? node.text ?? '' : (node.content ?? []).map(textOf).join('');
const textNode = (text: string, href?: string): RichNode => ({
  type: 'text', text, ...(href ? { marks: [{ type: 'link', attrs: { href } }] } : {}),
});
const paragraph = (...content: RichNode[]): RichNode => ({ type: 'paragraph', content });
const imageNode = (src: string, alt: string, title: string): RichNode => ({ type: 'image', attrs: { src, alt, title } });

function insertAfterHeading(document: RichDocument, heading: string, ...nodes: RichNode[]) {
  const index = (document.content ?? []).findIndex((node) => node.type === 'heading' && textOf(node).trim() === heading);
  if (index < 0) throw new Error(`Heading not found: ${heading}`);
  document.content?.splice(index + 1, 0, ...nodes);
}

function prepareDocument(document: RichDocument): RichDocument {
  const nodes = document.content ?? [];
  nodes.splice(2, 0,
    { type: 'heading', attrs: { level: 2 }, content: [textNode('در این مقاله می‌خوانید')] },
    { type: 'bulletList', content: [
      'تعریف جی کد و نقش آن در CNC', 'ساختار بلوک‌ها، آدرس‌ها و پارامترها', 'تفاوت G-code و M-code',
      'کدهای G و M پرکاربرد', 'نمونه برنامه G-code', 'تفاوت برنامه‌نویسی دستی و CAM',
      'خطاهای رایج و روش پیشگیری', 'انتقال امن فایل و چک‌لیست اجرا', 'مسیر یادگیری و پرسش‌های متداول',
    ].map((item) => ({ type: 'listItem', content: [paragraph(textNode(item))] })) },
  );

  const codeIndex = nodes.findIndex((node) => node.type === 'paragraph' && textOf(node).startsWith('%O1001'));
  if (codeIndex >= 0) nodes[codeIndex] = {
    type: 'codeBlock', content: [textNode(`%
O1001 (SIMPLE EXAMPLE)
G21 G17 G90 G40 G49 G80
G54
T01 M06
S2500 M03
G00 X0 Y0
G43 H01 Z20.0
M08
G00 Z5.0
G01 Z-1.0 F100
G01 X40.0 F300
G01 Y20.0
G01 X0.0
G01 Y0.0
G00 Z20.0
M09
M05
G49
M30
%`)],
  };

  const internalLinks = new Map<string, RichNode>([
    ['[پیشنهاد لینک داخلی با متن لینک «راهکار انتقال برنامه CNC» به صفحه /fa/product]', paragraph(textNode('برای مدیریت بهتر نسخه‌ها و رساندن فایل درست به دستگاه درست، '), textNode('راهکار انتقال برنامه CNC', '/fa/product'), textNode(' را بررسی کنید.'))],
    ['[پیشنهاد لینک داخلی با متن لینک «راهنمای برنامه‌نویسان CNC» به صفحه /fa/for/programmers]', paragraph(textNode('اگر برنامه‌نویس یا اپراتور CNC هستید، مطالب بخش '), textNode('راهنمای برنامه‌نویسان CNC', '/fa/for/programmers'), textNode(' می‌تواند ادامه مسیر یادگیری شما باشد.'))],
    ['[پیشنهاد لینک داخلی با متن لینک «مقالات و آموزش‌های CNC» به صفحه /fa/blog]', paragraph(textNode('برای مطالعه موضوعات مرتبط، مجموعه '), textNode('مقالات و آموزش‌های CNC', '/fa/blog'), textNode(' را ببینید.'))],
  ]);
  for (let index = 0; index < nodes.length; index += 1) {
    const replacement = internalLinks.get(textOf(nodes[index]).trim());
    if (replacement) nodes[index] = replacement;
  }

  const sourceIndex = nodes.findIndex((node) => node.type === 'heading' && textOf(node).trim() === 'منابع فنی برای مطالعه بیشتر');
  if (sourceIndex >= 0) {
    nodes.splice(sourceIndex + 1, nodes.length - sourceIndex - 1, {
      type: 'bulletList', content: [
        ['مستندات G-code در LinuxCNC', 'https://linuxcnc.org/docs/html/gcode/g-code.html'],
        ['مرور ساختار برنامه‌نویسی G-code در LinuxCNC', 'https://www.linuxcnc.org/docs/2.9/html/gcode/overview.html'],
        ['فهرست رسمی کدهای G در کنترلر Haas', 'https://www.haascnc.com/service/codes-settings.type=gcode.machine=mill.html'],
        ['راهنمای برنامه‌نویسی SINUMERIK زیمنس', 'https://cache.industry.siemens.com/dl/files/686/64930686/att_46680/v1/PGA_0212_en_en-US.pdf'],
      ].map(([label, href]) => ({ type: 'listItem', content: [paragraph(textNode(label, href))] })),
    });
  }

  insertAfterHeading(document, 'ساختار یک برنامه G-code چگونه است؟', imageNode(
    '/uploads/جی-کد-چیست-body-coordinate-toolpath.webp',
    'نمایش محورهای X و Y و Z و مسیر حرکت ابزار در برنامه جی کد CNC',
    'رابطه محورهای مختصات، ابزار و مسیر تعریف‌شده در G-code',
  ));
  insertAfterHeading(document, 'چگونه فایل G-code را امن‌تر به دستگاه CNC منتقل کنیم؟', imageNode(
    '/uploads/جی-کد-چیست-body-safe-review.webp',
    'اپراتور CNC در حال شبیه‌سازی و بازبینی امن برنامه جی کد پیش از اجرا',
    'بازبینی مسیر ابزار با حفاظ بسته پیش از اجرای برنامه CNC',
  ));
  return sanitizeDocument(document);
}

const media = [
  { file: 'جی-کد-چیست-cover.webp', kind: 'cover', alt: 'کنترلر و دستگاه فرز CNC برای اجرای برنامه جی کد', caption: 'کنترلر CNC، مسیر ابزار و قطعه ماشین‌کاری‌شده در گردش‌کار G-code' },
  { file: 'جی-کد-چیست-body-coordinate-toolpath.webp', kind: 'body', alt: 'نمایش محورهای X و Y و Z و مسیر حرکت ابزار در برنامه جی کد CNC', caption: 'رابطه محورهای مختصات، ابزار و مسیر تعریف‌شده در G-code' },
  { file: 'جی-کد-چیست-body-safe-review.webp', kind: 'body', alt: 'اپراتور CNC در حال شبیه‌سازی و بازبینی امن برنامه جی کد پیش از اجرا', caption: 'بازبینی مسیر ابزار با حفاظ بسته پیش از اجرای برنامه CNC' },
];

async function main() {
  const extracted = execFileSync('python', ['scripts/extract-publication-docx.py', source], {
    encoding: 'utf8', maxBuffer: 4_000_000, env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  const bodyFa = prepareDocument(sanitizeDocument(JSON.parse(extracted)));
  const serializedBody = JSON.stringify(bodyFa);
  if (serializedBody.length > 60_000) throw new Error(`Article JSON is too large for the current TEXT column: ${serializedBody.length} bytes`);

  const result = await knex.transaction(async (trx) => {
    const author = await trx('auth_users').select('id').orderBy('created_at').first();
    if (!author) throw new Error('No CMS author exists. Create an admin user before importing.');

    await trx('categories').insert({ slug: 'cnc-programming', name_fa: 'برنامه‌نویسی CNC', name_en: 'CNC Programming', sort_order: 15 })
      .onConflict('slug').merge({ name_fa: 'برنامه‌نویسی CNC', name_en: 'CNC Programming' });
    const category = await trx('categories').select('id').where({ slug: 'cnc-programming' }).first();

    const tagDefinitions = [
      ['g-code', 'جی کد', 'G-code'], ['cnc-programming', 'برنامه‌نویسی CNC', 'CNC programming'],
      ['cnc-program', 'برنامه CNC', 'CNC program'], ['g-codes', 'کدهای G', 'G-codes'],
      ['m-codes', 'کدهای M', 'M-codes'], ['cnc-controller', 'کنترلر CNC', 'CNC controller'],
      ['nc-file', 'فایل NC', 'NC file'],
    ];
    for (const [tagSlug, nameFa, nameEn] of tagDefinitions) {
      await trx('tags').insert({ slug: tagSlug, name_fa: nameFa, name_en: nameEn }).onConflict('slug').merge({ name_fa: nameFa, name_en: nameEn });
    }
    const tags = await trx('tags').select('id').whereIn('slug', tagDefinitions.map(([tagSlug]) => tagSlug));

    for (const asset of media) {
      const bytes = readFileSync(path.resolve('public/uploads', asset.file));
      const storageKey = `generated/${slug}/${asset.kind}/${asset.file}`;
      await trx('media_assets').insert({
        id: randomUUID(), storage_key: storageKey, public_path: `/uploads/${asset.file}`, mime_type: 'image/webp',
        byte_size: bytes.length, width: 600, height: 400, checksum_sha256: createHash('sha256').update(bytes).digest('hex'),
        alt_fa: asset.alt, alt_en: null, caption_fa: asset.caption, caption_en: null, uploaded_by: author.id,
      }).onConflict('storage_key').ignore();
    }

    const current = await trx('posts').where({ slug }).first();
    const revisionNumber = current ? Number(current.current_revision_number) + 1 : 1;
    const fields = {
      slug, category_id: category.id, author_user_id: current?.author_user_id ?? author.id,
      title_fa: 'جی کد چیست؟ راهنمای کامل G-code برای دستگاه CNC', title_en: '',
      excerpt_fa: 'جی کد زبان فرمان دستگاه CNC است. در این راهنمای کاربردی با ساختار G-code، کدهای G و M، نمونه برنامه، خطاهای رایج و روش اجرای امن آشنا شوید.', excerpt_en: '',
      body_fa: serializedBody, body_en: JSON.stringify(emptyDocument),
      cover_image_path: '/uploads/جی-کد-چیست-cover.webp',
      cover_alt_fa: media[0].alt, cover_alt_en: '', cover_caption_fa: media[0].caption, cover_caption_en: '',
      seo_title_fa: 'جی کد چیست؟ آموزش G-code و کدهای پرکاربرد CNC', seo_title_en: '',
      seo_description_fa: 'جی کد زبان فرمان دستگاه CNC است. با ساختار G-code، کدهای G و M، نمونه برنامه، خطاهای رایج، شبیه‌سازی و روش انتقال و اجرای امن فایل آشنا شوید.', seo_description_en: '',
      focus_keyword_fa: 'جی کد', focus_keyword_en: '',
      secondary_keywords_fa: 'G-code، کدهای G و M، برنامه CNC، برنامه‌نویسی CNC، کنترلر CNC، فایل NC، انتقال برنامه CNC', secondary_keywords_en: '',
      canonical_url_fa: '/fa/blog/جی-کد-چیست', canonical_url_en: '', robots_index: true, schema_type: 'TechArticle',
      og_title_fa: 'جی کد چیست؟ راهنمای کاربردی G-code برای CNC', og_title_en: '',
      og_description_fa: 'ساختار جی کد، کدهای پرکاربرد، نمونه برنامه، خطاهای رایج و چک‌لیست اجرای امن برنامه CNC را مرحله‌به‌مرحله یاد بگیرید.', og_description_en: '',
      translation_status: 'fa_only', status: 'draft', published_at: null, scheduled_for: null,
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
      change_summary: 'Imported complete Persian G-code article with editable tables, SEO metadata, internal links, FAQ and optimized images',
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
    return { postId, revisionNumber };
  });

  process.stdout.write(`Draft ${slug} imported as post ${result.postId}, revision ${result.revisionNumber}; ${plainText(bodyFa).split(/\s+/).length} Persian words, 5 tables and 2 body images.\n`);
}

main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'Import failed'}\n`); process.exitCode = 1; }).finally(() => knex.destroy());
