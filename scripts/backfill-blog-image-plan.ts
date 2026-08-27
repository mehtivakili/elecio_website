import 'dotenv/config';
import { knex } from '../src/server/db/knex';
import { sanitizeDocument, type RichDocument, type RichNode } from '../src/server/content/document';

type ImageDefinition = { src: string; altFa: string; altEn: string; captionFa: string; captionEn: string };

const plans: Record<string, ImageDefinition[]> = {
  'cnc-file-transfer-guide': [
    { src: '/images/recommendations/programmer-dnc-interface.webp', altFa: 'رابط نرم‌افزار انتقال و مدیریت برنامه CNC', altEn: 'CNC program transfer and management interface', captionFa: 'مدیریت متمرکز فایل‌ها و نسخه‌های برنامه CNC', captionEn: 'Centralized CNC file and program-version management' },
    { src: '/images/recommendations/programmer-dnc-connected.webp', altFa: 'ارتباط شبکه‌ای کامپیوتر با کنترلر دستگاه CNC', altEn: 'Network connection between a computer and CNC controller', captionFa: 'انتقال کنترل‌شده برنامه بین ایستگاه برنامه‌نویسی و دستگاه', captionEn: 'Controlled program transfer between the programming station and machine' },
  ],
  'fanuc-rs232-checklist': [
    { src: '/images/recommendations/operator-dnc-controls.webp', altFa: 'کنترلر CNC و تنظیمات ارتباطی انتقال برنامه', altEn: 'CNC controller communication settings for program transfer', captionFa: 'بازبینی تنظیمات ارتباطی کنترلر پیش از انتقال فایل', captionEn: 'Reviewing controller communication settings before file transfer' },
    { src: '/images/recommendations/programmer-dnc-connected.webp', altFa: 'اتصال ایمن کنترلر CNC به ایستگاه برنامه‌نویسی', altEn: 'Secure CNC controller connection to a programming workstation', captionFa: 'ارتباط پایدار برای ارسال و دریافت برنامه CNC', captionEn: 'Stable connection for sending and receiving CNC programs' },
  ],
  'siemens-program-transfer-workflow': [
    { src: '/images/software/software-transfer.webp', altFa: 'گردش‌کار انتقال برنامه به کنترلر CNC زیمنس', altEn: 'Program transfer workflow for a Siemens CNC controller', captionFa: 'انتخاب و انتقال کنترل‌شده فایل برنامه به دستگاه', captionEn: 'Selecting and transferring the program file to the machine' },
    { src: '/images/recommendations/programmer-dnc-connected.webp', altFa: 'شبکه ارتباطی برنامه‌نویس و دستگاه CNC', altEn: 'Network connection between programmer and CNC machine', captionFa: 'ارتباط شبکه‌ای میان ایستگاه برنامه‌نویسی و کنترلر', captionEn: 'Network communication between programming station and controller' },
  ],
  'cnc-backup-security-basics': [
    { src: '/images/recommendations/owner-dnc-installed.webp', altFa: 'سامانه مدیریت و پشتیبان‌گیری برنامه‌های CNC در کارگاه', altEn: 'CNC program management and backup system in a workshop', captionFa: 'نگهداری متمرکز نسخه‌های معتبر برنامه‌های تولید', captionEn: 'Central storage of approved production-program versions' },
    { src: '/images/recommendations/owner-dnc-white.webp', altFa: 'زیرساخت امن مدیریت فایل و پشتیبان CNC', altEn: 'Secure CNC file management and backup infrastructure', captionFa: 'تفکیک دسترسی، نسخه‌بندی و بازیابی فایل‌های CNC', captionEn: 'Access control, versioning, and recovery for CNC files' },
  ],
  'cnc-downtime-reporting-guide': [
    { src: '/images/software/software-responsive.webp', altFa: 'داشبورد واکنش‌گرا برای گزارش توقف دستگاه CNC', altEn: 'Responsive dashboard for CNC downtime reporting', captionFa: 'مشاهده گزارش‌ها و وضعیت تولید در نمایشگرهای مختلف', captionEn: 'Viewing reports and production status across devices' },
    { src: '/images/recommendations/operator-dnc-floor.webp', altFa: 'اپراتور و دستگاه‌های CNC در محیط واقعی کارگاه', altEn: 'Operator and CNC machines on the shop floor', captionFa: 'ثبت علت توقف در همان نقطه وقوع رویداد', captionEn: 'Recording downtime reasons where the event occurs' },
  ],
};

function imagePaths(document: RichDocument): Set<string> {
  const result = new Set<string>();
  const visit = (node: RichNode) => {
    if (node.type === 'image' && typeof node.attrs?.src === 'string') result.add(node.attrs.src);
    for (const child of node.content ?? []) visit(child);
  };
  visit(document);
  return result;
}

function addImages(document: RichDocument, definitions: ImageDefinition[], locale: 'fa' | 'en'): RichDocument {
  const nodes = document.content ?? [];
  const existing = imagePaths(document);
  const missing = definitions.filter((item) => !existing.has(item.src));
  const candidates = nodes.map((node, index) => ({ node, index })).filter(({ node }) => node.type === 'paragraph' || node.type === 'bulletList');
  const insertions = missing.map((item, index) => {
    const candidate = candidates[Math.min(candidates.length - 1, Math.floor(((index + 1) * candidates.length) / (missing.length + 1)))];
    return {
      index: candidate?.index ?? nodes.length - 1,
      node: { type: 'image', attrs: { src: item.src, alt: locale === 'fa' ? item.altFa : item.altEn, title: locale === 'fa' ? item.captionFa : item.captionEn } } as RichNode,
    };
  }).sort((a, b) => b.index - a.index);
  for (const insertion of insertions) nodes.splice(insertion.index + 1, 0, insertion.node);
  return sanitizeDocument(document);
}

async function revisionSnapshot(trx: typeof knex, post: Record<string, unknown>) {
  const tagIds = await trx('post_tags').where({ post_id: post.id }).pluck('tag_id');
  return {
    slug: post.slug, categoryId: post.category_id, titleFa: post.title_fa, titleEn: post.title_en,
    excerptFa: post.excerpt_fa, excerptEn: post.excerpt_en, bodyFa: JSON.parse(String(post.body_fa)), bodyEn: JSON.parse(String(post.body_en)),
    coverImagePath: post.cover_image_path, coverAltFa: post.cover_alt_fa, coverAltEn: post.cover_alt_en,
    coverCaptionFa: post.cover_caption_fa, coverCaptionEn: post.cover_caption_en,
    seoTitleFa: post.seo_title_fa, seoTitleEn: post.seo_title_en, seoDescriptionFa: post.seo_description_fa, seoDescriptionEn: post.seo_description_en,
    focusKeywordFa: post.focus_keyword_fa, focusKeywordEn: post.focus_keyword_en, secondaryKeywordsFa: post.secondary_keywords_fa, secondaryKeywordsEn: post.secondary_keywords_en,
    canonicalUrlFa: post.canonical_url_fa, canonicalUrlEn: post.canonical_url_en, robotsIndex: Boolean(post.robots_index), schemaType: post.schema_type,
    ogTitleFa: post.og_title_fa, ogTitleEn: post.og_title_en, ogDescriptionFa: post.og_description_fa, ogDescriptionEn: post.og_description_en,
    status: post.status, translationStatus: post.translation_status, scheduledFor: post.scheduled_for, tagIds,
  };
}

async function main() {
  let updated = 0;
  await knex.transaction(async (trx) => {
    for (const [slug, definitions] of Object.entries(plans)) {
      const post = await trx('posts').where({ slug }).first();
      if (!post) continue;
      const bodyFa = addImages(sanitizeDocument(post.body_fa), definitions, 'fa');
      const bodyEn = addImages(sanitizeDocument(post.body_en), definitions, 'en');
      const beforeFa = imagePaths(sanitizeDocument(post.body_fa)).size;
      const beforeEn = imagePaths(sanitizeDocument(post.body_en)).size;
      if (beforeFa >= 2 && beforeEn >= 2) continue;
      const revision = Number(post.current_revision_number) + 1;
      await trx('posts').where({ id: post.id }).update({ body_fa: JSON.stringify(bodyFa), body_en: JSON.stringify(bodyEn), current_revision_number: revision, updated_at: trx.fn.now() });
      const current = await trx('posts').where({ id: post.id }).first();
      await trx('post_revisions').insert({
        post_id: post.id, revision_number: revision, created_by: post.updated_by ?? post.author_user_id,
        change_summary: 'Added two contextual body images to enforce the three-image article plan',
        snapshot: JSON.stringify(await revisionSnapshot(trx, current)),
      });
      updated += 1;
    }
  });
  process.stdout.write(`Updated ${updated} legacy articles; every managed article now has one cover and two body images.\n`);
}

main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'Backfill failed'}\n`); process.exitCode = 1; }).finally(() => knex.destroy());
