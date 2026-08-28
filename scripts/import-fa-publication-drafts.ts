import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { knex } from '../src/server/db/knex';
import { plainText, sanitizeDocument, type RichDocument, type RichNode } from '../src/server/content/document';

type ImageDefinition = {
  file: string;
  kind: 'cover' | 'body';
  alt: string;
  caption: string;
  afterHeading?: string;
};

type DraftDefinition = {
  code: string;
  source: string;
  slug: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  secondaryKeywords: string;
  category: { slug: string; nameFa: string; nameEn: string; sortOrder: number };
  tags: Array<[slug: string, nameFa: string, nameEn: string]>;
  firstContentHeading: string;
  images: [ImageDefinition, ImageDefinition, ImageDefinition];
};

const drafts: DraftDefinition[] = [
  {
    code: 'EC-004',
    source: 'deliverables/Persian_SEO_Publication_Queue/EC-004-اتوماسیون-صنعتی-چیست/EC-004-اتوماسیون-صنعتی-چیست.docx',
    slug: 'اتوماسیون-صنعتی-چیست',
    title: 'اتوماسیون صنعتی چیست؟ اجزا، سطوح و کاربردها',
    excerpt: 'اتوماسیون صنعتی با پیوند حسگر، PLC، HMI، شبکه و سامانه‌های مدیریتی، فرایند تولید را پایش و کنترل می‌کند. در این راهنما با اجزا، سطوح، مزایا، ریسک‌ها و نقشه شروع یک پروژه اتوماسیون آشنا شوید.',
    seoTitle: 'اتوماسیون صنعتی چیست؟ اجزا، سطوح و کاربردها',
    seoDescription: 'اتوماسیون صنعتی چیست و چگونه کار می‌کند؟ اجزای اصلی، سطوح کارخانه، نقش PLC و شبکه، کاربردها، مزایا، ریسک‌ها و مسیر اجرای پروژه را کاربردی بخوانید.',
    focusKeyword: 'اتوماسیون صنعتی چیست',
    secondaryKeywords: 'اتوماسیون صنعتی، سیستم کنترل صنعتی، PLC، HMI، SCADA، شبکه صنعتی، کارخانه هوشمند، سطوح اتوماسیون، تجهیزات اتوماسیون صنعتی',
    category: { slug: 'industrial-automation', nameFa: 'اتوماسیون صنعتی', nameEn: 'Industrial Automation', sortOrder: 17 },
    tags: [
      ['industrial-automation', 'اتوماسیون صنعتی', 'Industrial automation'],
      ['plc', 'PLC', 'PLC'], ['hmi', 'HMI', 'HMI'], ['scada', 'SCADA', 'SCADA'],
      ['industrial-network', 'شبکه صنعتی', 'Industrial network'], ['smart-factory', 'کارخانه هوشمند', 'Smart factory'],
    ],
    firstContentHeading: 'اتوماسیون صنعتی چیست؟',
    images: [
      {
        file: 'اتوماسیون-صنعتی-چیست-cover-hd.webp', kind: 'cover',
        alt: 'خط تولید خودکار با ربات، نوار نقاله و حسگرهای اتوماسیون صنعتی',
        caption: 'نمونه یک سلول تولید خودکار ایمن با ربات صنعتی، حسگرها و نوار نقاله',
      },
      {
        file: 'اتوماسیون-صنعتی-چیست-body-monitoring-hd.webp', kind: 'body',
        alt: 'مهندس اتوماسیون در حال پایش خط تولید از طریق HMI و رایانه صنعتی',
        caption: 'پایش فرایند و وضعیت تجهیزات از بیرون سلول ایمنی با HMI و نرم‌افزار مهندسی',
        afterHeading: 'اتوماسیون صنعتی چگونه کار می‌کند؟',
      },
      {
        file: 'اتوماسیون-صنعتی-چیست-body-field-devices-hd.webp', kind: 'body',
        alt: 'حسگرها و عملگرهای پنوماتیکی در یک خط تولید خودکار',
        caption: 'حسگرهای میدان و عملگر پنوماتیکی، ارتباط سیستم کنترل با فرایند واقعی را برقرار می‌کنند',
        afterHeading: 'اجزای اصلی اتوماسیون صنعتی',
      },
    ],
  },
  {
    code: 'EC-005',
    source: 'deliverables/Persian_SEO_Publication_Queue/EC-005-plc-چیست/EC-005-PLC-چیست.docx',
    slug: 'plc-چیست',
    title: 'PLC چیست؟ راهنمای کنترل‌گر منطقی برنامه‌پذیر',
    excerpt: 'PLC کنترل‌گر صنعتی مقاومی است که ورودی‌ها را می‌خواند، برنامه را اجرا می‌کند و خروجی‌ها را به‌روزرسانی می‌کند. این راهنما اجزا، چرخه اسکن، I/O، زبان‌های برنامه‌نویسی و معیارهای انتخاب PLC را توضیح می‌دهد.',
    seoTitle: 'PLC چیست؟ اجزا، چرخه اسکن و راهنمای انتخاب',
    seoDescription: 'PLC چیست و چگونه کار می‌کند؟ با CPU، ورودی و خروجی، چرخه اسکن، Ladder Logic، ارتباط با HMI و SCADA و معیارهای انتخاب PLC مناسب آشنا شوید.',
    focusKeyword: 'PLC چیست',
    secondaryKeywords: 'پی ال سی چیست، کنترل‌گر منطقی برنامه‌پذیر، برنامه نویسی PLC، ورودی و خروجی PLC، چرخه اسکن PLC، Ladder Logic، انتخاب PLC، تابلو کنترل صنعتی',
    category: { slug: 'industrial-automation', nameFa: 'اتوماسیون صنعتی', nameEn: 'Industrial Automation', sortOrder: 17 },
    tags: [
      ['plc', 'PLC', 'PLC'], ['plc-programming', 'برنامه‌نویسی PLC', 'PLC programming'],
      ['industrial-automation', 'اتوماسیون صنعتی', 'Industrial automation'], ['industrial-io', 'ورودی و خروجی صنعتی', 'Industrial I/O'],
      ['ladder-logic', 'Ladder Logic', 'Ladder Logic'], ['control-panel', 'تابلو کنترل', 'Control panel'],
    ],
    firstContentHeading: 'PLC چیست و چه کاری انجام می‌دهد؟',
    images: [
      {
        file: 'plc-چیست-cover-hd.webp', kind: 'cover',
        alt: 'ماژول PLC و ورودی و خروجی‌ها در تابلو کنترل صنعتی',
        caption: 'چیدمان ماژولار PLC، ورودی و خروجی و ترمینال‌ها روی ریل تابلو کنترل',
      },
      {
        file: 'plc-چیست-body-scan-cycle-hd.webp', kind: 'body',
        alt: 'بررسی چرخه اسکن PLC روی رایانه متصل به میز آزمایش اتوماسیون',
        caption: 'چرخه اسکن PLC ورودی‌ها را می‌خواند، منطق را اجرا و سپس خروجی‌ها را به‌روزرسانی می‌کند',
        afterHeading: 'PLC چگونه کار می‌کند؟ آشنایی با چرخه اسکن',
      },
      {
        file: 'plc-چیست-body-io-modules-hd.webp', kind: 'body',
        alt: 'ماژول‌های دیجیتال و آنالوگ ورودی و خروجی PLC در تابلو صنعتی',
        caption: 'ماژول‌های I/O واسط میان CPU کنترل‌گر و حسگرها و عملگرهای میدان هستند',
        afterHeading: 'ورودی و خروجی PLC چیست؟',
      },
    ],
  },
  {
    code: 'EC-006',
    source: 'deliverables/Persian_SEO_Publication_Queue/EC-006-تراش-cnc-چیست/EC-006-تراش-CNC-چیست.docx',
    slug: 'تراش-cnc-چیست',
    title: 'تراش CNC چیست؟ اجزا، عملیات و نکات انتخاب',
    excerpt: 'تراش CNC قطعه دورانی را با کنترل دقیق ابزار روی محورهای X و Z ماشین‌کاری می‌کند. در این راهنما اجزا، عملیات، محور C، ابزار و اینسرت، آفست‌ها و معیارهای انتخاب دستگاه را بررسی می‌کنیم.',
    seoTitle: 'تراش CNC چیست؟ اجزا، عملیات و راهنمای انتخاب',
    seoDescription: 'تراش CNC چیست و چگونه کار می‌کند؟ اجزای دستگاه، عملیات تراشکاری، محور C، ابزار و اینسرت، آفست ابزار و نکات مهم انتخاب و خرید را بخوانید.',
    focusKeyword: 'تراش CNC چیست',
    secondaryKeywords: 'دستگاه تراش CNC، تراشکاری CNC، اجزای تراش CNC، محور C تراش، تارت ابزار، آفست ابزار، اینسرت تراشکاری، خرید تراش CNC',
    category: { slug: 'cnc-machines', nameFa: 'دستگاه‌های CNC', nameEn: 'CNC Machines', sortOrder: 16 },
    tags: [
      ['cnc-turning', 'تراش CNC', 'CNC turning'], ['cnc-lathe', 'دستگاه تراش CNC', 'CNC lathe'],
      ['cnc-machine', 'دستگاه CNC', 'CNC machine'], ['turning-tools', 'ابزار تراشکاری', 'Turning tools'],
      ['tool-offset', 'آفست ابزار', 'Tool offset'], ['cnc-buying-guide', 'راهنمای انتخاب CNC', 'CNC buying guide'],
    ],
    firstContentHeading: 'تراش CNC چیست و چگونه کار می‌کند؟',
    images: [
      {
        file: 'تراش-cnc-چیست-cover-hd.webp', kind: 'cover',
        alt: 'دستگاه تراش CNC محصور و مدرن در کارگاه ماشین‌کاری',
        caption: 'نمای کلی یک مرکز تراش CNC محصور با کنترلر و نقاله براده',
      },
      {
        file: 'تراش-cnc-چیست-body-cutting-zone-hd.webp', kind: 'body',
        alt: 'برش قطعه استوانه‌ای با ابزار تارت داخل دستگاه تراش CNC محصور',
        caption: 'عملیات روتراشی قطعه استوانه‌ای با ابزار ایندکس‌پذیر در محفظه بسته',
        afterHeading: 'تراش CNC چیست و چگونه کار می‌کند؟',
      },
      {
        file: 'تراش-cnc-چیست-body-setup-offsets-hd.webp', kind: 'body',
        alt: 'اپراتور در حال تنظیم آفست ابزار و مسیر تراش روی کنترلر CNC',
        caption: 'بررسی تارت، هندسه ابزار و آفست‌ها پیش از اجرای برنامه تراشکاری',
        afterHeading: 'آفست ابزار و صفر قطعه در تراش CNC',
      },
    ],
  },
  {
    code: 'EC-007',
    source: 'deliverables/Persian_SEO_Publication_Queue/EC-007-ماشین-کاری-چیست/EC-007-ماشین-کاری-چیست.docx',
    slug: 'ماشین-کاری-چیست',
    title: 'ماشین‌کاری چیست؟ فرایندها، ابزارها و کاربردها',
    excerpt: 'ماشین‌کاری با برداشت کنترل‌شده ماده، قطعه را به شکل و دقت موردنظر می‌رساند. این راهنما تراش، فرز، سوراخ‌کاری و سنگ‌زنی، ابزار برش، پارامترها، کیفیت سطح و نقش CNC را توضیح می‌دهد.',
    seoTitle: 'ماشین‌کاری چیست؟ فرایندها، ابزارها و کاربردها',
    seoDescription: 'ماشین‌کاری چیست؟ با فرایندهای تراش، فرز، سوراخ‌کاری و سنگ‌زنی، ابزار برش، سرعت و پیشروی، دقت، کیفیت سطح و نقش CNC در تولید آشنا شوید.',
    focusKeyword: 'ماشین کاری چیست',
    secondaryKeywords: 'ماشین‌کاری، فرایند ماشین کاری، تراشکاری، فرزکاری، سوراخ کاری، سنگ زنی، ابزار برش، پارامترهای برش، کیفیت سطح، ماشین کاری CNC',
    category: { slug: 'machining', nameFa: 'ماشین‌کاری', nameEn: 'Machining', sortOrder: 15 },
    tags: [
      ['machining', 'ماشین‌کاری', 'Machining'], ['cnc-machining', 'ماشین‌کاری CNC', 'CNC machining'],
      ['turning', 'تراشکاری', 'Turning'], ['milling', 'فرزکاری', 'Milling'],
      ['cutting-tools', 'ابزار برش', 'Cutting tools'], ['quality-control', 'کنترل کیفیت', 'Quality control'],
    ],
    firstContentHeading: 'ماشین‌کاری چیست و چه تفاوتی با سایر فرایندهای ساخت دارد؟',
    images: [
      {
        file: 'ماشین-کاری-چیست-cover-hd.webp', kind: 'cover',
        alt: 'قطعات دقیق تراش و فرزکاری شده در کارگاه ماشین‌کاری CNC',
        caption: 'نمونه قطعات دقیق تولیدشده با فرایندهای تراش، فرز و سوراخ‌کاری',
      },
      {
        file: 'ماشین-کاری-چیست-body-processes-tools-hd.webp', kind: 'body',
        alt: 'ابزارها و قطعات نمونه فرایندهای تراش فرز سوراخ‌کاری و سنگ‌زنی',
        caption: 'ابزار و نمونه قطعات مربوط به فرایندهای اصلی ماشین‌کاری',
        afterHeading: 'فرایندهای اصلی ماشین‌کاری',
      },
      {
        file: 'ماشین-کاری-چیست-body-quality-control-hd.webp', kind: 'body',
        alt: 'اندازه‌گیری قطعه ماشین‌کاری شده با میکرومتر روی میز کنترل کیفیت',
        caption: 'کنترل قطر و دقت ابعادی قطعه ماشین‌کاری‌شده با میکرومتر',
        afterHeading: 'دقت ابعادی و کیفیت سطح در ماشین‌کاری چگونه کنترل می‌شود؟',
      },
    ],
  },
];

const python = process.env.PYTHON_BIN ?? (process.platform === 'win32' ? 'python' : 'python3');
const emptyDocument: RichDocument = { type: 'doc', content: [{ type: 'paragraph' }] };

const textOf = (node: RichNode): string => node.type === 'text' ? node.text ?? '' : (node.content ?? []).map(textOf).join('');
const textNode = (text: string, href?: string): RichNode => ({
  type: 'text', text, ...(href ? { marks: [{ type: 'link', attrs: { href } }] } : {}),
});
const paragraph = (...content: RichNode[]): RichNode => ({ type: 'paragraph', content });
const imageNode = (image: ImageDefinition): RichNode => ({
  type: 'image', attrs: { src: `/uploads/${image.file}`, alt: image.alt, title: image.caption },
});

const linkRules = [
  { match: 'اتوماسیون صنعتی', label: 'راهنمای اتوماسیون صنعتی', href: '/fa/blog/اتوماسیون-صنعتی-چیست' },
  { match: 'تراش CNC', label: 'راهنمای تراش CNC', href: '/fa/blog/تراش-cnc-چیست' },
  { match: 'فرز CNC', label: 'راهنمای فرز CNC', href: '/fa/blog/فرز-cnc-چیست' },
  { match: 'دستگاه CNC', label: 'راهنمای دستگاه CNC', href: '/fa/blog/دستگاه-cnc-چیست' },
  { match: 'PLC', label: 'راهنمای PLC', href: '/fa/blog/plc-چیست' },
  { match: 'نرم‌افزار', label: 'نرم‌افزارهای صنعتی الکسیو', href: '/fa/software' },
  { match: 'محصولات', label: 'محصولات و راهکارهای CNC', href: '/fa/product' },
  { match: 'مجله', label: 'مجله فنی الکسیو', href: '/fa/blog' },
  { match: 'مقالات', label: 'مقالات فنی الکسیو', href: '/fa/blog' },
];

function prepareDocument(document: RichDocument, definition: DraftDefinition): RichDocument {
  const content = document.content ?? [];
  const startIndex = content.findIndex((node) => node.type === 'heading' && textOf(node).trim() === definition.firstContentHeading);
  if (startIndex < 0) throw new Error(`${definition.code}: first article heading was not found.`);
  document.content = content.slice(startIndex);

  document.content = document.content.map((node) => {
    const text = textOf(node).trim();
    if (!text.startsWith('[پیشنهاد لینک داخلی')) return node;
    const rule = linkRules.find(({ match }) => text.includes(match));
    if (!rule) return paragraph(textNode('برای ادامه مطالعه، '), textNode('مجله فنی الکسیو', '/fa/blog'), textNode(' را ببینید.'));
    return paragraph(textNode('برای اطلاعات تکمیلی، '), textNode(rule.label, rule.href), textNode(' را مطالعه کنید.'));
  });

  for (const image of definition.images.filter((item) => item.kind === 'body')) {
    const headingIndex = document.content.findIndex((node) => node.type === 'heading' && textOf(node).trim() === image.afterHeading);
    if (headingIndex < 0) throw new Error(`${definition.code}: image heading was not found: ${image.afterHeading}`);
    document.content.splice(headingIndex + 1, 0, imageNode(image));
  }
  return sanitizeDocument(document);
}

async function importDraft(definition: DraftDefinition, dryRun = false) {
  const extracted = execFileSync(python, ['scripts/extract-publication-docx.py', path.resolve(definition.source)], {
    encoding: 'utf8', maxBuffer: 4_000_000, env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  const bodyFa = prepareDocument(sanitizeDocument(JSON.parse(extracted)), definition);
  const serializedBody = JSON.stringify(bodyFa);
  if (Buffer.byteLength(serializedBody, 'utf8') > 64_000) {
    throw new Error(`${definition.code}: article JSON exceeds the current TEXT column capacity.`);
  }
  const tableCount = (bodyFa.content ?? []).filter((node) => node.type === 'table').length;
  const wordCount = plainText(bodyFa).split(/\s+/).filter(Boolean).length;
  if (dryRun) {
    process.stdout.write(`${definition.code}: validated ${wordCount} Persian words, ${tableCount} tables, 2 body images and ${Buffer.byteLength(serializedBody, 'utf8')} JSON bytes.\n`);
    return;
  }

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
      slug: definition.category.slug, name_fa: definition.category.nameFa,
      name_en: definition.category.nameEn, sort_order: definition.category.sortOrder,
    }).onConflict('slug').merge({ name_fa: definition.category.nameFa, name_en: definition.category.nameEn });
    const category = await trx('categories').select('id').where({ slug: definition.category.slug }).first();

    for (const [slug, nameFa, nameEn] of definition.tags) {
      await trx('tags').insert({ slug, name_fa: nameFa, name_en: nameEn })
        .onConflict('slug').merge({ name_fa: nameFa, name_en: nameEn });
    }
    const tags = await trx('tags').select('id').whereIn('slug', definition.tags.map(([slug]) => slug));

    for (const image of definition.images) {
      const bytes = readFileSync(path.resolve('public/uploads', image.file));
      const storageKey = `generated/${definition.slug}/${image.kind}/${image.file}`;
      await trx('media_assets').insert({
        id: randomUUID(), storage_key: storageKey, public_path: `/uploads/${image.file}`,
        mime_type: 'image/webp', byte_size: bytes.length, width: 1536, height: 1024,
        checksum_sha256: createHash('sha256').update(bytes).digest('hex'),
        alt_fa: image.alt, alt_en: null, caption_fa: image.caption, caption_en: null, uploaded_by: author.id,
      }).onConflict('storage_key').merge({
        public_path: `/uploads/${image.file}`, byte_size: bytes.length,
        checksum_sha256: createHash('sha256').update(bytes).digest('hex'), alt_fa: image.alt, caption_fa: image.caption,
      });
    }

    const current = await trx('posts').where({ slug: definition.slug }).first();
    const revisionNumber = current ? Number(current.current_revision_number) + 1 : 1;
    const cover = definition.images[0];
    const fields = {
      slug: definition.slug, category_id: category.id, author_user_id: current?.author_user_id ?? author.id, updated_by: author.id,
      title_fa: definition.title, title_en: '', excerpt_fa: definition.excerpt, excerpt_en: '',
      body_fa: serializedBody, body_en: JSON.stringify(emptyDocument),
      cover_image_path: `/uploads/${cover.file}`, cover_alt_fa: cover.alt, cover_alt_en: '',
      cover_caption_fa: cover.caption, cover_caption_en: '',
      seo_title_fa: definition.seoTitle, seo_title_en: '', seo_description_fa: definition.seoDescription, seo_description_en: '',
      focus_keyword_fa: definition.focusKeyword, focus_keyword_en: '',
      secondary_keywords_fa: definition.secondaryKeywords, secondary_keywords_en: '',
      canonical_url_fa: `/fa/blog/${definition.slug}`, canonical_url_en: '', robots_index: true, schema_type: 'TechArticle',
      og_title_fa: definition.seoTitle, og_title_en: '', og_description_fa: definition.seoDescription, og_description_en: '',
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
    await trx('post_tags').insert(tags.map(({ id }) => ({ post_id: postId, tag_id: id }))).onConflict().ignore();
    const post = await trx('posts').where({ id: postId }).first();
    await trx('post_revisions').insert({
      post_id: postId, revision_number: revisionNumber, created_by: author.id,
      change_summary: `Imported ${definition.code} complete Persian draft with editable content, SEO metadata, internal links and three optimized images`,
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

  process.stdout.write(`${definition.code}: draft ${definition.slug} imported as post ${result.postId}, revision ${result.revisionNumber}; ${wordCount} Persian words, ${tableCount} tables and 2 body images.\n`);
}

async function main() {
  const args = process.argv.slice(2).map((value) => value.toUpperCase());
  const dryRun = args.includes('--DRY-RUN');
  const requested = args.filter((value) => value.startsWith('EC-'));
  const selected = requested.length ? drafts.filter(({ code }) => requested.includes(code)) : drafts;
  if (!selected.length) throw new Error(`No matching draft code. Available: ${drafts.map(({ code }) => code).join(', ')}`);
  for (const definition of selected) await importDraft(definition, dryRun);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Import failed'}\n`);
  process.exitCode = 1;
}).finally(() => knex.destroy());
