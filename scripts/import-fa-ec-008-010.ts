import 'dotenv/config';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { knex } from '../src/server/db/knex';
import { plainText, sanitizeDocument, type RichDocument, type RichNode } from '../src/server/content/document';
import { persianQueueReadiness } from '../src/server/content/publication-queue';
import { publicationQueueSchemaReady } from '../src/server/db/publication-queue-schema';

type Media = { file: string; kind: 'cover' | 'body'; alt: string; caption: string };
type Article = {
  code: string; slug: string; title: string; excerpt: string; seoTitle: string; seoDescription: string;
  focusKeyword: string; secondaryKeywords: string; schemaType: 'Article' | 'TechArticle';
  category: { slug: string; nameFa: string; nameEn: string; sortOrder: number };
  tags: Array<[string, string, string]>; media: [Media, Media, Media]; body: RichDocument;
};

const text = (value: string, href?: string): RichNode => ({
  type: 'text', text: value, ...(href ? { marks: [{ type: 'link', attrs: { href } }] } : {}),
});
const p = (...content: Array<string | RichNode>): RichNode => ({
  type: 'paragraph', content: content.map((item) => typeof item === 'string' ? text(item) : item),
});
const h = (level: 2 | 3 | 4, value: string): RichNode => ({ type: 'heading', attrs: { level }, content: [text(value)] });
const ul = (...items: string[]): RichNode => ({
  type: 'bulletList', content: items.map((item) => ({ type: 'listItem', content: [p(item)] })),
});
const image = (file: string, alt: string, caption: string): RichNode => ({
  type: 'image', attrs: { src: `/uploads/${file}`, alt, title: caption },
});
const table = (headers: string[], rows: string[][]): RichNode => ({
  type: 'table',
  content: [headers, ...rows].map((row, rowIndex) => ({
    type: 'tableRow',
    content: row.map((value) => ({
      type: rowIndex === 0 ? 'tableHeader' : 'tableCell',
      content: [p(value)],
    })),
  })),
});
const doc = (...content: RichNode[]): RichDocument => sanitizeDocument({ type: 'doc', content });

const mastercamMedia: [Media, Media, Media] = [
  { file: 'مسترکم-چیست-cover-hd.webp', kind: 'cover', alt: 'ایستگاه برنامه‌نویسی CAM با مدل سه‌بعدی قطعه و مسیر ابزار دستگاه CNC', caption: 'آماده‌سازی مدل، مسیر ابزار و خروجی قابل اجرا برای ماشین CNC در یک گردش کار CAD/CAM' },
  { file: 'مسترکم-چیست-body-cad-cam-workflow-hd.webp', kind: 'body', alt: 'گردش کار طراحی CAD و ساخت مسیر ابزار CAM برای قطعه CNC روی دو نمایشگر', caption: 'مدل هندسی، تعریف ابزار و مسیر ماشین‌کاری باید پیش از تولید کد نهایی با یکدیگر سازگار شوند' },
  { file: 'مسترکم-چیست-body-simulation-hd.webp', kind: 'body', alt: 'بررسی شبیه‌سازی برداشت براده و برخورد ابزار پیش از اجرای برنامه CNC', caption: 'شبیه‌سازی و بازبینی، بخشی از کنترل ریسک پیش از انتقال برنامه به دستگاه است' },
];

const powermillMedia: [Media, Media, Media] = [
  { file: 'پاورمیل-چیست-cover-hd.webp', kind: 'cover', alt: 'شبیه‌سازی مسیرهای ابزار خشن‌کاری و پرداخت روی قالب صنعتی پیچیده', caption: 'برنامه‌ریزی مسیر ابزار برای خشن‌کاری و پرداخت هندسه‌های پیچیده در محیط CAM' },
  { file: 'پاورمیل-چیست-body-roughing-hd.webp', kind: 'body', alt: 'مسیرهای خشن‌کاری لایه‌ای و برداشت بار روی حفره یک قالب فولادی', caption: 'هدف خشن‌کاری، برداشت پایدار حجم اصلی ماده با کنترل بار ابزار و باقی‌مانده است' },
  { file: 'پاورمیل-چیست-body-finishing-hd.webp', kind: 'body', alt: 'پرداخت سطح آزاد با فرز سرکروی و کنترل جهت ابزار چندمحوره', caption: 'فاصله مسیر، جهت ابزار و هندسه هولدر روی کیفیت سطح و ایمنی پرداخت اثر می‌گذارند' },
];

const buyingMedia: [Media, Media, Media] = [
  { file: 'راهنمای-خرید-فرز-cnc-cover-hd.webp', kind: 'cover', alt: 'کارشناس در حال بازرسی فنی دستگاه فرز CNC پیش از خرید', caption: 'خرید مطمئن فرز CNC به تطبیق نیاز تولید، تست عملی دستگاه و بررسی پشتیبانی وابسته است' },
  { file: 'راهنمای-خرید-فرز-cnc-body-spindle-test-hd.webp', kind: 'body', alt: 'اندازه‌گیری لنگی اسپیندل فرز CNC با ساعت اندیکاتور و میله آزمون', caption: 'اندازه‌گیری لنگی و بررسی وضعیت اسپیندل باید توسط فرد متخصص و روی دستگاه متوقف انجام شود' },
  { file: 'راهنمای-خرید-فرز-cnc-body-controller-inspection-hd.webp', kind: 'body', alt: 'بررسی کنترلر، تابلو برق و اتصال انتقال برنامه دستگاه فرز CNC', caption: 'کنترلر، سلامت تابلو و روش انتقال برنامه بخشی از هزینه و قابلیت بهره‌برداری واقعی دستگاه‌اند' },
];

const articles: Article[] = [
  {
    code: 'EC-008', slug: 'مسترکم-چیست', title: 'مسترکم چیست؟ کاربرد Mastercam در برنامه‌نویسی CNC',
    excerpt: 'مسترکم یک نرم‌افزار CAD/CAM برای ساخت مسیر ابزار، شبیه‌سازی ماشین‌کاری و تولید خروجی متناسب با کنترلر CNC است. در این راهنما گردش کار، انواع عملیات، نقش پست‌پروسسور و نکات یادگیری آن را بررسی می‌کنیم.',
    seoTitle: 'مسترکم چیست؟ کاربرد Mastercam در برنامه‌نویسی CNC',
    seoDescription: 'مسترکم چگونه مسیر ابزار و جی‌کد تولید می‌کند؟ گردش کار CAD/CAM، انتخاب ابزار، پست‌پروسسور، شبیه‌سازی و نکات یادگیری Mastercam را کاربردی بخوانید.',
    focusKeyword: 'مسترکم چیست', secondaryKeywords: 'Mastercam، آموزش مسترکم، برنامه نویسی CNC، نرم افزار CAM، مسیر ابزار، پست پروسسور، شبیه سازی CNC', schemaType: 'TechArticle',
    category: { slug: 'cnc-programming', nameFa: 'برنامه‌نویسی CNC', nameEn: 'CNC Programming', sortOrder: 15 },
    tags: [['mastercam', 'مسترکم', 'Mastercam'], ['cam', 'نرم‌افزار CAM', 'CAM software'], ['cnc-programming', 'برنامه‌نویسی CNC', 'CNC programming'], ['toolpath', 'مسیر ابزار', 'Toolpath'], ['post-processor', 'پست‌پروسسور', 'Post processor'], ['cnc-simulation', 'شبیه‌سازی CNC', 'CNC simulation']],
    media: mastercamMedia,
    body: doc(
      p('مسترکم چیست؟ Mastercam یک مجموعه نرم‌افزاری CAD/CAM است که برنامه‌نویس با آن هندسه قطعه را آماده می‌کند، ابزار و شرایط برش را تعریف می‌کند، مسیر حرکت ابزار را می‌سازد و پس از شبیه‌سازی، فایل قابل فهم برای کنترلر دستگاه CNC می‌گیرد. ارزش نرم‌افزار فقط در ترسیم چند خط مسیر نیست؛ نتیجه خوب زمانی به دست می‌آید که مدل، بست و صفر قطعه، طول ابزار، محدودیت‌های ماشین و پست‌پروسسور درست تعریف شده باشند. این مقاله مسیر عملی از دریافت مدل تا تحویل برنامه کنترل‌شده به اپراتور را توضیح می‌دهد.'),
      h(2, 'مسترکم چیست و چه کاری انجام می‌دهد؟'),
      p('مسترکم میان طراحی قطعه و اجرای آن روی ماشین قرار می‌گیرد. ورودی می‌تواند مدل سه‌بعدی، نقشه دوبعدی یا هندسه‌ای باشد که در خود محیط نرم‌افزار ساخته و اصلاح شده است. برنامه‌نویس بر اساس جنس قطعه، ماشین، ابزارهای موجود و کیفیت مورد انتظار، عملیات را تعریف می‌کند. خروجی میانی یک مسیر ابزار قابل محاسبه و شبیه‌سازی است و خروجی نهایی، برنامه NC تولیدشده توسط پست‌پروسسور مناسب همان ماشین و کنترلر است.'),
      ul('طراحی و اصلاح هندسه دوبعدی و سه‌بعدی برای ساخت', 'تعریف خام، فیکسچر، ابزار، هولدر و صفر قطعه', 'ایجاد عملیات فرزکاری، تراشکاری یا ماشین‌کاری چندمحوره متناسب با مجوز و ماژول', 'شبیه‌سازی برداشت ماده و بررسی حرکت ابزار', 'تولید کد NC با پست‌پروسسور تأییدشده'),
      h(2, 'گردش کار CAD/CAM در مسترکم'),
      image(mastercamMedia[1].file, mastercamMedia[1].alt, mastercamMedia[1].caption),
      p('یک گردش کار قابل اعتماد با شناخت ماشین و نقشه شروع می‌شود، نه با انتخاب اولین استراتژی مسیر ابزار. ابتدا واحد اندازه‌گیری، دستگاه مختصات، تلرانس‌ها و جهت قطعه بررسی می‌شوند. سپس خام و فیکسچر تعریف می‌شوند تا نرم‌افزار بتواند باقی‌مانده ماده و خطر برخورد را بهتر ارزیابی کند. ابزار باید با قطر، طول برشی، بیرون‌زدگی و هولدر واقعی ثبت شود. در پایان نیز نتیجه شبیه‌سازی و فایل خروجی باید طبق رویه کارگاه بازبینی شود.'),
      table(['مرحله', 'ورودی اصلی', 'خروجی قابل کنترل', 'ریسک رایج'], [
        ['آماده‌سازی مدل', 'مدل یا نقشه، واحد و تلرانس', 'هندسه تمیز و جهت صحیح', 'سطح باز، هندسه تکراری یا واحد اشتباه'],
        ['تعریف Setup', 'خام، فیکسچر و صفر قطعه', 'محدوده واقعی ماشین‌کاری', 'صفر نامنطبق با بستن قطعه'],
        ['ابزار و عملیات', 'ابزار، هولدر و پارامتر برش', 'مسیر ابزار محاسبه‌شده', 'بیرون‌زدگی غیرواقعی یا بار زیاد'],
        ['شبیه‌سازی', 'مسیرها و مدل ماشین', 'گزارش برخورد و باقی‌مانده', 'نادیده‌گرفتن بست یا هولدر'],
        ['Post', 'پست متناسب با کنترلر', 'فایل NC', 'کد نامتناسب با ماشین مقصد'],
      ]),
      h(2, 'مسیر ابزار چگونه انتخاب می‌شود؟'),
      p('انتخاب مسیر ابزار به شکل قطعه، مقدار باربرداری، صلبیت ماشین، طول ابزار و هدف عملیات بستگی دارد. برای کف و دیواره‌های ساده، مسیرهای دوبعدی می‌توانند سریع و قابل پیش‌بینی باشند. در حفره‌ها و حجم‌های بزرگ، مسیرهای خشن‌کاری با درگیری کنترل‌شده ابزار مفیدند. سطوح آزاد به مسیرهای سه‌بعدی و کنترل دقیق گام جانبی نیاز دارند. نام یک استراتژی به‌تنهایی کیفیت را تضمین نمی‌کند؛ جهت برش، ورود و خروج، تلرانس محاسباتی و مقدار باقی‌مانده نیز باید متناسب تنظیم شوند.'),
      table(['هدف عملیات', 'تمرکز تنظیمات', 'کنترل قبل از اجرا'], [
        ['خشن‌کاری', 'بار پایدار، عمق و عرض برش، تخلیه براده', 'باقی‌مانده یکنواخت و طول ابزار'],
        ['نیمه‌پرداخت', 'حذف پله‌ها و یکنواخت‌کردن بار', 'مقدار Stock برای پرداخت'],
        ['پرداخت', 'گام جانبی، تلرانس و جهت برش', 'کیفیت سطح و تماس هولدر'],
        ['سوراخ‌کاری', 'نوع سیکل، عمق امن و خروج براده', 'مختصات، نوک مته و صفحه امن'],
      ]),
      h(2, 'پست‌پروسسور؛ پل میان CAM و کنترلر'),
      p('پست‌پروسسور اطلاعات عمومی مسیر ابزار را به قالبی تبدیل می‌کند که کنترلر مشخص دستگاه انتظار دارد؛ از ساختار شماره ابزار و آفست‌ها تا سیکل‌ها، فرمان‌های کمکی و حرکت محورهای دورانی. استفاده از پستی که صرفاً نام کنترلر مشابهی دارد کافی نیست. پست باید برای سینماتیک ماشین، گزینه‌های فعال کنترلر و استانداردهای کارگاه آزموده و تأیید شده باشد. هر تغییر پست نیز باید با برنامه آزمایشی، شبیه‌سازی مستقل و اجرای کنترل‌شده اعتبارسنجی شود.'),
      h(2, 'شبیه‌سازی و کنترل برنامه پیش از اجرا'),
      image(mastercamMedia[2].file, mastercamMedia[2].alt, mastercamMedia[2].caption),
      p('Backplot جهت حرکت مسیر را نشان می‌دهد، اما برای ارزیابی کامل‌تر باید برداشت ماده، ابزار، هولدر، خام و فیکسچر در شبیه‌سازی حضور داشته باشند. در ماشین‌کاری چندمحوره، مدل ماشین و محدودیت کورس محورها اهمیت بیشتری دارد. حتی پس از شبیه‌سازی CAM، اجرای Dry Run، Single Block و کاهش Feed Override طبق دستورالعمل ایمنی کارگاه جایگزین‌ناپذیر است.'),
      ul('صفر قطعه و جهت محورها را با Setup Sheet تطبیق دهید', 'شماره ابزار، آفست طول و قطر را کنترل کنید', 'حرکت‌های Rapid نزدیک قطعه و بست را بازبینی کنید', 'هشدار برخورد هولدر، کورس محور و باقی‌مانده را بررسی کنید', 'نسخه فایل تأییدشده را با نام‌گذاری مشخص به دستگاه منتقل کنید'),
      h(2, 'برای یادگیری مسترکم از کجا شروع کنیم؟'),
      p('یادگیری را با یک قطعه ساده دوبعدی، یک Setup و چند ابزار واقعی شروع کنید. ابتدا مفهوم مختصات، Planeها، خام، Linking و Compensation را بفهمید و بعد سراغ مسیرهای سه‌بعدی و چندمحوره بروید. تمرین باید همراه با خواندن نقشه، انتخاب ابزار، محاسبه شرایط برش و تحلیل کد خروجی باشد. حفظ‌کردن محل فرمان‌ها بدون فهم فرآیند، در پروژه واقعی به خطاهای پرهزینه منجر می‌شود.'),
      table(['سطح', 'تمرین پیشنهادی', 'معیار قبولی'], [
        ['مقدماتی', 'پروفیل، پاکت و سوراخ‌کاری یک صفحه', 'صفر صحیح و مسیر بدون حرکت اضافه'],
        ['میانی', 'چند Setup و باقی‌مانده‌تراشی', 'انتقال دقیق بین مراحل و ابزارها'],
        ['پیشرفته', 'سطوح آزاد یا چندمحوره', 'کنترل برخورد، کیفیت سطح و زمان سیکل'],
      ]),
      h(2, 'پرسش‌های متداول درباره مسترکم'),
      h(3, 'آیا مسترکم خودش جی‌کد تولید می‌کند؟'), p('مسیر ابزار در محیط CAM ساخته می‌شود و پست‌پروسسور آن را به برنامه NC متناسب با ماشین و کنترلر تبدیل می‌کند. بنابراین صحت پست و تنظیمات ماشین حیاتی است.'),
      h(3, 'آیا بدون دانستن جی‌کد می‌توان با مسترکم کار کرد؟'), p('می‌توان مسیر ساخت، اما شناخت ساختار برنامه، آفست‌ها و فرمان‌های پایه برای بازبینی خروجی و رفع خطا ضروری است.'),
      h(3, 'آیا شبیه‌سازی مسترکم اجرای امن را تضمین می‌کند؟'), p('خیر. شبیه‌سازی ریسک را کاهش می‌دهد، اما فقط به اندازه صحت مدل ماشین، ابزار، بست و تنظیمات معتبر است و باید با کنترل‌های کارگاهی تکمیل شود.'),
      h(2, 'منابع و گام بعدی'),
      p(text('صفحه رسمی Mastercam', 'https://www.mastercam.com/'), ' برای شناخت نسخه‌ها و منابع آموزشی رسمی مناسب است. برای درک بهتر کد خروجی، ', text('راهنمای جی‌کد', '/fa/blog/جی-کد-چیست'), ' و برای انتقال کنترل‌شده فایل به ماشین، ', text('راهکار انتقال برنامه CNC الِسیو', '/fa/product'), ' را ببینید.'),
    ),
  },
  {
    code: 'EC-009', slug: 'پاورمیل-چیست', title: 'پاورمیل چیست؟ کاربرد PowerMill در ماشین‌کاری CNC',
    excerpt: 'پاورمیل نرم‌افزار CAM تخصصی برای برنامه‌ریزی ماشین‌کاری قطعات، قالب‌ها و سطوح پیچیده است. این راهنما آماده‌سازی مدل، خشن‌کاری، پرداخت، شبیه‌سازی و تولید خروجی ایمن را توضیح می‌دهد.',
    seoTitle: 'پاورمیل چیست؟ کاربرد PowerMill در ماشین‌کاری CNC',
    seoDescription: 'PowerMill برای ساخت مسیر ابزار قطعات پیچیده چگونه استفاده می‌شود؟ خشن‌کاری، پرداخت، ماشین‌کاری چندمحوره، شبیه‌سازی و خروجی G-code را بررسی کنید.',
    focusKeyword: 'پاورمیل چیست', secondaryKeywords: 'PowerMill، آموزش پاورمیل، ماشین کاری سه بعدی، نرم افزار CAM، خشن کاری قالب، پرداخت CNC، ماشین کاری پنج محور', schemaType: 'TechArticle',
    category: { slug: 'cnc-programming', nameFa: 'برنامه‌نویسی CNC', nameEn: 'CNC Programming', sortOrder: 15 },
    tags: [['powermill', 'پاورمیل', 'PowerMill'], ['cam', 'نرم‌افزار CAM', 'CAM software'], ['mold-machining', 'ماشین‌کاری قالب', 'Mold machining'], ['roughing', 'خشن‌کاری', 'Roughing'], ['finishing', 'پرداخت', 'Finishing'], ['five-axis', 'ماشین‌کاری پنج‌محور', 'Five-axis machining']],
    media: powermillMedia,
    body: doc(
      p('پاورمیل چیست؟ Autodesk PowerMill نرم‌افزار CAM برای ساخت و بهینه‌سازی مسیر ابزار در ماشین‌کاری قطعات و سطوح پیچیده است؛ حوزه‌ای که در آن کنترل برخورد، باقی‌مانده ماده، کیفیت سطح و جهت ابزار اهمیت زیادی دارد. کاربران آن معمولاً در قالب‌سازی، قطعات صنعتی با هندسه آزاد و پروژه‌های سه یا پنج‌محوره فعالیت می‌کنند. خروجی خوب فقط با انتخاب یک استراتژی آماده حاصل نمی‌شود؛ مدل تمیز، خام و فیکسچر دقیق، ابزار و هولدر واقعی، حدود ماشین و پست‌پروسسور معتبر اجزای یک فرآیند مطمئن هستند.'),
      h(2, 'پاورمیل چیست و برای چه پروژه‌هایی مناسب است؟'),
      p('پاورمیل بر برنامه‌ریزی ساخت تمرکز دارد. مدل قطعه وارد می‌شود، نواحی ماشین‌کاری و سطوح محافظ مشخص می‌شوند، خام و ابزار تعریف می‌شوند و استراتژی‌های خشن‌کاری، نیمه‌پرداخت و پرداخت ساخته می‌شوند. در پروژه‌های چندمحوره، جهت محور ابزار و محدودیت حرکت ماشین نیز وارد محاسبه می‌شوند. برای قطعات ساده دوبعدی ممکن است ابزار سبک‌تری کافی باشد؛ مزیت پاورمیل زمانی پررنگ‌تر است که هندسه پیچیده، دسترسی محدود یا کنترل دقیق سطح مطرح باشد.'),
      table(['نوع پروژه', 'نیاز اصلی', 'چرا CAM پیشرفته مهم است؟'], [
        ['قالب و حفره عمیق', 'برداشت حجم و پرداخت سطح آزاد', 'کنترل باقی‌مانده و طول ابزار'],
        ['الکترود', 'جزئیات کوچک و نواحی شیب‌دار', 'تفکیک ناحیه و تلرانس دقیق'],
        ['قطعه پنج‌محوره', 'کنترل جهت ابزار و دسترسی', 'مدیریت برخورد هولدر و کورس محورها'],
        ['قطعه بزرگ', 'کاهش زمان بدون افزایش ریسک', 'تقسیم ناحیه و بهینه‌سازی حرکت‌های رابط'],
      ]),
      h(2, 'آماده‌سازی مدل، خام و فیکسچر'),
      p('پیش از محاسبه مسیر، مدل باید از نظر سطح‌های معیوب، شکاف‌ها، جهت نرمال و واحد اندازه‌گیری بررسی شود. سپس خام واقعی، سطوح فیکسچر و نواحی ممنوع تعریف می‌شوند. اگر خام با وضعیت واقعی بین مراحل یکسان نباشد، زمان تخمینی و تشخیص برخورد قابل اعتماد نخواهد بود. در پروژه‌های چند مرحله‌ای بهتر است باقی‌مانده عملیات قبلی به‌عنوان Stock مرحله بعد استفاده شود.'),
      ul('سیستم مختصات و جهت Z را با روش بستن قطعه هماهنگ کنید', 'سطوح تماس گیره، فک، پیچ و بست را در مدل برخورد وارد کنید', 'ابزار و هولدر را با طول بیرون‌زدگی واقعی بسازید', 'تلرانس مدل و مسیر را متناسب با کیفیت نقشه انتخاب کنید'),
      h(2, 'خشن‌کاری در پاورمیل'),
      image(powermillMedia[1].file, powermillMedia[1].alt, powermillMedia[1].caption),
      p('در خشن‌کاری هدف برداشتن حجم اصلی ماده با بار قابل پیش‌بینی و حفظ عمر ابزار است. گام عمقی، درگیری جانبی، ورود به ماده، مسیرهای اتصال و مقدار Stock باقی‌مانده باید با جنس قطعه، توان اسپیندل و صلبیت مجموعه هماهنگ شوند. مسیر کوتاه‌تر همیشه بهتر نیست؛ حرکتی که تغییر بار شدید یا گیرکردن براده ایجاد کند ممکن است زمان توقف و هزینه ابزار را افزایش دهد.'),
      table(['پارامتر خشن‌کاری', 'اثر', 'نشانه تنظیم نامناسب'], [
        ['Stepdown', 'عمق هر لایه و بار محوری', 'لرزش، بار زیاد یا تعداد لایه غیرضروری'],
        ['Stepover', 'درگیری جانبی و نرخ برداشت', 'بار ناپایدار در گوشه‌ها'],
        ['Stock to leave', 'ماده لازم برای مراحل بعد', 'پرداخت ناقص یا زمان اضافی'],
        ['ورود و اتصال', 'نحوه تماس ابزار با ماده', 'ضربه، حرکت هوایی یا نزدیک‌شدن خطرناک'],
      ]),
      h(2, 'پرداخت سطوح و کنترل کیفیت'),
      image(powermillMedia[2].file, powermillMedia[2].alt, powermillMedia[2].caption),
      p('در پرداخت، فاصله واقعی رد ابزار روی سطح مهم‌تر از ظاهر مسیر روی صفحه است. شیب سطح، قطر مؤثر ابزار سرکروی، گام جانبی، تلرانس و جهت حرکت بر ارتفاع scallop و کیفیت نهایی اثر می‌گذارند. تقسیم قطعه به نواحی کم‌شیب، پرشیب، گوشه و Rest Material می‌تواند نتیجه یکنواخت‌تری ایجاد کند. در پنج‌محور، تغییر نرم جهت ابزار و فاصله هولدر از قطعه باید همراه با محدودیت سینماتیکی ماشین کنترل شود.'),
      table(['مرحله', 'هدف', 'کنترل کلیدی'], [
        ['نیمه‌پرداخت', 'یکنواخت‌کردن باقی‌مانده', 'Stock ثابت برای ابزار پرداخت'],
        ['پرداخت اصلی', 'رسیدن به فرم و کیفیت سطح', 'Stepover، تلرانس و جهت برش'],
        ['Rest finishing', 'حذف ماده گوشه‌ها', 'قطر ابزار قبلی و ناحیه باقی‌مانده'],
        ['پولیش ماشینی محدود', 'کاهش رد ابزار', 'ریسک تغییر فرم و زمان سیکل'],
      ]),
      h(2, 'شبیه‌سازی، برخورد و محدودیت ماشین'),
      p('شبیه‌سازی باید بیش از نمایش نوک ابزار باشد. شفت، هولدر، کله‌گی، فیکسچر و در صورت امکان مدل سینماتیکی ماشین باید بررسی شوند. هشدار برخورد را نباید بدون علت روشن خاموش کرد. همچنین حرکت‌های بین مسیرها، نزدیک‌شدن سریع، بازپیچی محور دورانی و نقطه تعویض ابزار از نقاطی هستند که به بازبینی ویژه نیاز دارند.'),
      ul('برخورد ابزار و هولدر با قطعه، خام و بست', 'باقی‌مانده بیش از حد یا بریدن ناخواسته مدل', 'عبور از حدود خطی و دورانی ماشین', 'تغییر جهت ناگهانی ابزار و حرکت رابط طولانی', 'هماهنگی شماره ابزار و آفست با Setup Sheet'),
      h(2, 'خروجی G-code و نقش پست‌پروسسور'),
      p('پاورمیل مسیر محاسباتی را آماده می‌کند، اما تبدیل آن به فرمان‌های کنترلر بر عهده پست‌پروسسور است. پست باید با مدل ماشین، کنترلر، گزینه‌های نرم‌افزاری و استانداردهای کارگاه تطبیق داده و آزموده شود. به‌ویژه در پنج‌محور، تعریف نادرست محورهای دورانی یا نقطه مرکز ابزار می‌تواند خروجی خطرناک ایجاد کند. برنامه جدید باید ابتدا در محیط امن، با شبیه‌سازی تکمیلی و رویه‌های Dry Run و Single Block بررسی شود.'),
      h(2, 'پرسش‌های متداول درباره پاورمیل'),
      h(3, 'تفاوت پاورمیل با نرم‌افزار CAD چیست؟'), p('CAD برای ایجاد و اصلاح هندسه محصول است؛ پاورمیل عمدتاً برای برنامه‌ریزی فرآیند ماشین‌کاری و ساخت مسیر ابزار از آن هندسه استفاده می‌شود.'),
      h(3, 'آیا پاورمیل فقط برای پنج‌محور است؟'), p('خیر. می‌توان مسیرهای سه‌محوره و پروژه‌های دیگر را نیز برنامه‌ریزی کرد، اما قابلیت‌های کنترل هندسه پیچیده و چندمحوره از کاربردهای مهم آن هستند.'),
      h(3, 'آیا خروجی پاورمیل مستقیماً قابل اجراست؟'), p('فقط وقتی پست‌پروسسور، تنظیمات ماشین و فرآیند بازبینی برای همان دستگاه تأیید شده باشند. فایل خروجی ناشناخته نباید بدون کنترل روی ماشین اجرا شود.'),
      h(2, 'منابع و گام بعدی'),
      p(text('صفحه رسمی Autodesk PowerMill', 'https://www.autodesk.com/products/powermill/overview'), ' مرجع معرفی قابلیت‌ها و مستندات محصول است. برای شناخت ساختار فایل خروجی، ', text('مقاله جی‌کد چیست', '/fa/blog/جی-کد-چیست'), ' و برای مدیریت انتقال نسخه تأییدشده، ', text('راهکار الِسیو', '/fa/product'), ' را مطالعه کنید.'),
    ),
  },
  {
    code: 'EC-010', slug: 'راهنمای-خرید-فرز-cnc', title: 'راهنمای خرید فرز CNC؛ چک‌لیست فنی و هزینه‌ها',
    excerpt: 'برای خرید فرز CNC باید نیاز قطعه، کورس محورها، اسپیندل، دقت، کنترلر، وضعیت مکانیکی، خدمات و هزینه کل مالکیت را کنار هم سنجید. این چک‌لیست انتخاب دستگاه نو یا کارکرده را عملی‌تر می‌کند.',
    seoTitle: 'راهنمای خرید فرز CNC؛ چک‌لیست فنی و هزینه‌ها',
    seoDescription: 'پیش از خرید فرز CNC چه چیزهایی را بررسی کنیم؟ محورها، اسپیندل، دقت، کنترلر، خدمات، تست عملی، دستگاه نو یا کارکرده و هزینه کل مالکیت را مقایسه کنید.',
    focusKeyword: 'راهنمای خرید فرز CNC', secondaryKeywords: 'خرید فرز CNC، قیمت فرز CNC، فرز CNC کارکرده، تست فرز CNC، کنترلر CNC، اسپیندل فرز، هزینه نگهداری CNC', schemaType: 'Article',
    category: { slug: 'cnc-machines', nameFa: 'دستگاه‌های CNC', nameEn: 'CNC Machines', sortOrder: 16 },
    tags: [['cnc-buying-guide', 'راهنمای خرید CNC', 'CNC buying guide'], ['cnc-mill', 'فرز CNC', 'CNC mill'], ['used-cnc', 'CNC کارکرده', 'Used CNC'], ['spindle', 'اسپیندل', 'Spindle'], ['cnc-controller', 'کنترلر CNC', 'CNC controller'], ['machine-maintenance', 'نگهداری ماشین', 'Machine maintenance']],
    media: buyingMedia,
    body: doc(
      p('راهنمای خرید فرز CNC باید از قطعه و ظرفیت واقعی کارگاه شروع شود، نه از تعداد گزینه‌های کاتالوگ. ابعاد قطعه، جنس، تلرانس، تیراژ، تعداد Setup و ابزارهای موردنیاز تعیین می‌کنند چه کورس، اسپیندل، کنترلر و تجهیزات جانبی ارزش پرداخت دارند. در دستگاه کارکرده، وضعیت مکانیکی و دسترسی به خدمات گاهی از سال ساخت مهم‌تر است. این راهنما یک مسیر مرحله‌به‌مرحله برای تعریف نیاز، مقایسه پیشنهادها، تست عملی و برآورد هزینه کل مالکیت ارائه می‌کند.'),
      h(2, 'نیاز کارگاه را پیش از استعلام مشخص کنید'),
      p('یک نمونه نماینده از قطعات فعلی و احتمالی آینده انتخاب کنید. بزرگ‌ترین قطعه همیشه معیار کافی نیست؛ وزن، جنس، عمق حفره، تعداد ابزار، زمان سیکل و دقت نیز مهم‌اند. محدودیت برق، هوای فشرده، فونداسیون، مسیر حمل، ارتفاع در ورودی و توان تیم نگهداری باید پیش از قرارداد بررسی شوند. ظرفیت اضافه معقول مفید است، اما خرید قابلیت‌هایی که هیچ برنامه تولیدی برای آن‌ها وجود ندارد سرمایه را قفل می‌کند.'),
      table(['پرسش نیازسنجی', 'داده‌ای که باید ثبت شود', 'اثر بر انتخاب'], [
        ['چه قطعاتی تولید می‌شوند؟', 'ابعاد، وزن، جنس و هندسه', 'کورس، میز، گشتاور و تعداد محور'],
        ['کیفیت مورد انتظار چیست؟', 'تلرانس و زبری سطح', 'ساختار، اسپیندل، کنترل حرارتی و ابزار'],
        ['حجم تولید چقدر است؟', 'تیراژ و زمان تحویل', 'تعویض ابزار، براده‌برداری و اتوماسیون'],
        ['زیرساخت کارگاه چیست؟', 'برق، هوا، فضا و جرثقیل', 'هزینه نصب و امکان بهره‌برداری'],
      ]),
      h(2, 'مشخصات فنی مهم در خرید فرز CNC'),
      p('کورس محورها باید علاوه بر ابعاد قطعه، فضای فیکسچر و دسترسی ابزار را پوشش دهد. ابعاد میز، ظرفیت بار و فاصله دماغه اسپیندل تا میز را با Setup واقعی تطبیق دهید. حداکثر دور اسپیندل بدون توجه به توان و گشتاور در دور کاری معیار کاملی نیست. تعداد و نوع مخروط ابزار، ظرفیت خشاب، سرعت تعویض و دسترسی ابزارهای جایگزین نیز روی بهره‌وری اثر مستقیم دارند.'),
      table(['مشخصه', 'چه چیزی را مقایسه کنیم؟', 'خطای رایج'], [
        ['کورس و میز', 'X/Y/Z، فاصله اسپیندل، بار مجاز', 'مقایسه فقط با اندازه خام قطعه'],
        ['اسپیندل', 'دور، توان پیوسته، گشتاور و خنک‌کاری', 'تمرکز روی حداکثر RPM'],
        ['خشاب ابزار', 'ظرفیت، نوع مخروط و زمان تعویض', 'نادیده‌گرفتن ابزارهای رزرو'],
        ['دقت', 'شرایط اندازه‌گیری و گزارش تست', 'اعتماد به عدد کاتالوگ بدون آزمون'],
        ['براده و کولانت', 'نقاله، فیلتراسیون و حجم مخزن', 'کم‌اهمیت دانستن توقف نظافت'],
      ]),
      h(2, 'کنترلر، برنامه‌نویسی و انتقال فایل'),
      image(buyingMedia[2].file, buyingMedia[2].alt, buyingMedia[2].caption),
      p('کنترلر باید برای مهارت اپراتورها، نوع برنامه‌ها و خدمات موجود در منطقه مناسب باشد. ظرفیت حافظه، نوع ارتباط شبکه یا USB، پشتیبانی از DNC، مدیریت آفست، سیکل‌های موردنیاز و گزینه‌های فعال نرم‌افزاری را مستند کنید. نام خانواده کنترلر کافی نیست؛ مدل دقیق، نسخه نرم‌افزار و optionهای فعال تفاوت ایجاد می‌کنند. روش انتقال فایل نیز باید کنترل نسخه، سطح دسترسی و نسخه پشتیبان را پوشش دهد.'),
      ul('یک برنامه واقعی کارگاه را روی کنترلر باز و بررسی کنید', 'حداکثر اندازه فایل و روش اجرای برنامه بزرگ را آزمایش کنید', 'وضعیت پورت‌ها، شبکه و تهیه نسخه پشتیبان پارامترها را ثبت کنید', 'دسترسی به آموزش، تعمیرکار و قطعات کنترلر را پیش از خرید بسنجید'),
      h(2, 'تست سلامت دستگاه کارکرده'),
      image(buyingMedia[1].file, buyingMedia[1].alt, buyingMedia[1].caption),
      p('بازرسی دستگاه کارکرده باید توسط فرد متخصص و با ابزار اندازه‌گیری مناسب انجام شود. سابقه سرویس، ساعات روشن‌بودن و کارکرد اسپیندل، آلارم‌های ثبت‌شده، نشتی‌ها، وضعیت روانکاری و صدای محورها سرنخ می‌دهند، اما جای آزمون هندسی و برش را نمی‌گیرند. دستگاه باید در شرایط پایدار حرارتی تست شود و روش و نتیجه اندازه‌گیری ثبت شوند.'),
      table(['آزمون', 'روش کلی', 'چه چیزی آشکار می‌کند؟'], [
        ['لنگی اسپیندل', 'میله آزمون و ساعت اندیکاتور توسط متخصص', 'وضعیت مخروط، بلبرینگ و مونتاژ'],
        ['لقی و تکرارپذیری', 'حرکت رفت‌وبرگشت و اندازه‌گیری مستقل', 'Backlash، انکودر و انتقال حرکت'],
        ['هندسه محورها', 'ابزار کالیبره و روش استاندارد مناسب', 'عمودبودن، صافی و خطای موقعیت'],
        ['برش آزمایشی', 'قطعه و ابزار مشخص با اندازه‌گیری نتیجه', 'رفتار کل سیستم زیر بار'],
        ['تعویض ابزار', 'چند چرخه پیوسته', 'سلامت خشاب، بازو و سنسورها'],
      ]),
      p('حد پذیرش باید پیش از تست و بر اساس نقشه قطعات شما تعیین شود. یک عدد عمومی برای همه کارگاه‌ها معنی ندارد. هنگام اندازه‌گیری، الزامات ایمنی سازنده رعایت شود و هیچ آزمونی روی محور یا اسپیندل در حال حرکت با تماس دست انجام نشود.'),
      h(2, 'فرز CNC نو یا کارکرده؟'),
      table(['معیار', 'دستگاه نو', 'دستگاه کارکرده'], [
        ['سرمایه اولیه', 'بیشتر و قابل برنامه‌ریزی', 'کمتر، اما وابسته به وضعیت واقعی'],
        ['گارانتی و راه‌اندازی', 'معمولاً روشن‌تر', 'وابسته به فروشنده و قرارداد'],
        ['زمان تأمین', 'ممکن است طولانی‌تر باشد', 'در صورت سلامت معمولاً کوتاه‌تر'],
        ['ریسک توقف', 'در شروع کمتر', 'نیازمند ذخیره تعمیر و قطعه'],
        ['تناسب دقیق با نیاز', 'امکان انتخاب optionها', 'محدود به پیکربندی موجود'],
      ]),
      p('دستگاه کارکرده زمانی انتخاب خوبی است که تست مستقل، سوابق قابل اتکا، قطعات و سرویس در دسترس و بودجه تعمیرات پیش‌بینی شده باشند. دستگاه نو زمانی مزیت بیشتری دارد که زمان توقف بسیار پرهزینه است، فرآیند به قابلیت مشخصی وابسته است یا تیم کارگاه به آموزش و راه‌اندازی رسمی نیاز دارد.'),
      h(2, 'هزینه کل مالکیت را چگونه حساب کنیم؟'),
      p('قیمت خرید فقط یکی از اجزاست. حمل و بیمه، جرثقیل، فونداسیون، برق و ترانس، کمپرسور یا چیلر، ابزارگیر و ابزار، فیکسچر، نرم‌افزار، آموزش، مواد مصرفی، سرویس دوره‌ای، قطعات یدکی و هزینه توقف باید در یک دوره مشخص جمع شوند. درآمد از دست‌رفته هنگام نصب یا خرابی نیز برای دستگاهی که گلوگاه تولید است اهمیت دارد.'),
      table(['گروه هزینه', 'نمونه اقلام', 'زمان وقوع'], [
        ['خرید و تحویل', 'قیمت، حمل، بیمه و تخلیه', 'ابتدای پروژه'],
        ['آماده‌سازی', 'فونداسیون، برق، هوا و شبکه', 'پیش از راه‌اندازی'],
        ['تجهیز فرآیند', 'ابزارگیر، ابزار، فیکسچر و اندازه‌گیری', 'شروع و توسعه تولید'],
        ['بهره‌برداری', 'انرژی، کولانت، سرویس و اپراتور', 'ماهانه یا سالانه'],
        ['ریسک', 'خرابی، قطعه یدکی و توقف تولید', 'ذخیره احتمالی'],
      ]),
      h(2, 'چک‌لیست نهایی پیش از قرارداد'),
      ul('نیاز قطعات و ظرفیت سه‌ساله مستند شده است', 'مدل دقیق کنترلر و همه optionها در پیش‌فاکتور آمده‌اند', 'تست هندسی و برش با معیار پذیرش مکتوب انجام شده است', 'دامنه نصب، آموزش، گارانتی و زمان پاسخ سرویس روشن است', 'لیست اقلام همراه، ابزارگیرها، متعلقات و قطعات یدکی ثبت شده است', 'هزینه کل مالکیت و سناریوی توقف با گزینه‌های دیگر مقایسه شده است', 'شرایط پرداخت به تحویل، نصب و پذیرش نهایی متصل است'),
      h(2, 'پرسش‌های متداول خرید فرز CNC'),
      h(3, 'مهم‌ترین معیار خرید فرز CNC چیست؟'), p('تناسب دستگاه با قطعات و فرآیند واقعی کارگاه مهم‌ترین معیار است. مشخصات بزرگ‌تر همیشه به معنی انتخاب اقتصادی‌تر یا دقیق‌تر نیست.'),
      h(3, 'آیا ساعت کارکرد برای ارزیابی دستگاه کارکرده کافی است؟'), p('خیر. ساعت کارکرد باید کنار سوابق سرویس، وضعیت اسپیندل و محورها، آلارم‌ها، آزمون هندسی و برش عملی بررسی شود.'),
      h(3, 'قبل از خرید چه قطعه‌ای را تست کنیم؟'), p('قطعه‌ای نماینده انتخاب کنید که ویژگی‌های مهم تولید شما مانند تلرانس، سوراخ‌کاری، پرداخت سطح و تعویض ابزار را در یک آزمون قابل اندازه‌گیری پوشش دهد.'),
      h(2, 'گام بعدی'),
      p('برای شناخت ساختمان و کاربرد دستگاه، ', text('مقاله فرز CNC چیست', '/fa/blog/فرز-cnc-چیست'), ' را ببینید. برای بررسی روش انتقال امن برنامه و ثبت نسخه‌های اجراشده، ', text('راهکار Smart DNC الِسیو', '/fa/product'), ' را مطالعه کنید یا از ', text('صفحه تماس', '/fa/contact'), ' برای مشاوره استفاده کنید.'),
    ),
  },
];

const emptyDocument: RichDocument = { type: 'doc', content: [{ type: 'paragraph' }] };

function tomorrowAtNine(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}

async function main() {
  if (process.argv.includes('--dry-run')) {
    for (const article of articles) {
      const missing = persianQueueReadiness({
        slug: article.slug, title_fa: article.title, body_fa: article.body,
        cover_image_path: `/uploads/${article.media[0].file}`, cover_alt_fa: article.media[0].alt,
        seo_title_fa: article.seoTitle, seo_description_fa: article.seoDescription,
        focus_keyword_fa: article.focusKeyword, category_id: 1, robots_index: true, translation_status: 'fa_only',
      });
      const imageSizes = [];
      for (const asset of article.media) {
        const metadata = await sharp(path.resolve('public/uploads', asset.file)).metadata();
        imageSizes.push(`${asset.file}=${metadata.width}x${metadata.height}`);
      }
      const words = plainText(article.body).split(/\s+/).filter(Boolean).length;
      const tables = (article.body.content ?? []).filter((node) => node.type === 'table').length;
      if (missing.length || tables < 3 || words < 500) {
        throw new Error(`${article.code} not ready: missing=${missing.join(',') || 'none'}, words=${words}, tables=${tables}`);
      }
      process.stdout.write(`${article.code}: ready; ${words} words; ${tables} tables; ${imageSizes.join('; ')}\n`);
    }
    return;
  }

  if (!await publicationQueueSchemaReady(knex)) {
    throw new Error('Publication queue schema is missing. Run `npm run db:migrate` before importing EC-008 through EC-010.');
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
        const storageKey = `generated/${article.slug}/${asset.kind}/${asset.file}`;
        await trx('media_assets').insert({
          id: randomUUID(), storage_key: storageKey, public_path: `/uploads/${asset.file}`, mime_type: 'image/webp',
          byte_size: bytes.length, width: 1536, height: 1024,
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

    for (const article of imported) {
      await trx('posts').where({ id: article.id }).update({
        status: 'published', publication_queue_active: true, queued_at: trx.fn.now(),
        scheduled_for: nextSlot, published_at: nextSlot, updated_at: trx.fn.now(),
      });
      Object.assign(article, { scheduledFor: nextSlot.toISOString() });
      nextSlot = new Date(nextSlot.getTime() + cadenceDays * 86_400_000);
    }
    if (!existing.length && imported.length) {
      await trx('publication_queue_settings').where({ id: 1 }).update({
        first_publish_at: (imported[0] as typeof imported[0] & { scheduledFor: string }).scheduledFor,
        updated_at: trx.fn.now(),
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
