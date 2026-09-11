import { NextRequest, NextResponse } from 'next/server';
import { controllerDocumentGroups } from '@/data/cnc-documents';
import { searchPublishedPosts } from '@/server/content/post-repository';

type SearchKind = 'page' | 'article' | 'document';
type SearchResult = {
  id: string;
  kind: SearchKind;
  title: string;
  description: string;
  meta: string;
  href: string;
  score: number;
};

const pages = [
  { href: '/', fa: ['خانه', 'صفحه اصلی', 'السیو', 'CNC', 'دی ان سی'], en: ['Home', 'Elecio', 'CNC', 'DNC'], descriptionFa: 'معرفی راهکار Elecio Smart DNC و امکانات اصلی', descriptionEn: 'Elecio Smart DNC overview and key capabilities' },
  { href: '/product', fa: ['محصول', 'مشخصات فنی', 'اسمارت DNC', 'انتقال فایل', 'گزارش تولید', 'حافظه'], en: ['Product', 'Specifications', 'Smart DNC', 'File transfer', 'Production reporting', 'Storage'], descriptionFa: 'مشخصات، قابلیت‌ها و سازگاری محصول Elecio Smart DNC', descriptionEn: 'Specifications, capabilities and compatibility of Elecio Smart DNC' },
  { href: '/software', fa: ['نرم افزار', 'دانلود', 'ویندوز', 'اندروید', 'وب', 'انتقال برنامه'], en: ['Software', 'Download', 'Windows', 'Android', 'Web', 'Program transfer'], descriptionFa: 'نرم‌افزارهای انتقال برنامه و مدیریت دستگاه‌های CNC', descriptionEn: 'CNC program transfer and device management software' },
  { href: '/blog', fa: ['بلاگ', 'مقاله', 'آموزش', 'راهنما', 'دانش CNC'], en: ['Blog', 'Articles', 'Training', 'Guides', 'CNC knowledge'], descriptionFa: 'مقاله‌ها و راهنماهای عملی CNC', descriptionEn: 'Practical CNC articles and field guides' },
  { href: '/documents', fa: ['اسناد', 'منوال', 'کاتالوگ', 'راهنمای کنترلر', 'PDF'], en: ['Documents', 'Manuals', 'Catalogs', 'Controller guides', 'PDF'], descriptionFa: 'منوال‌ها و اسناد کنترلرهای CNC', descriptionEn: 'CNC controller manuals and documentation' },
  { href: '/about', fa: ['درباره ما', 'درباره Elecio', 'شرکت', 'تیم'], en: ['About', 'About Elecio', 'Company', 'Team'], descriptionFa: 'درباره Elecio و مسیر توسعه محصول', descriptionEn: 'About Elecio and the product journey' },
  { href: '/contact', fa: ['تماس', 'ارتباط', 'پشتیبانی', 'فروش', 'شماره تماس'], en: ['Contact', 'Support', 'Sales', 'Phone'], descriptionFa: 'ارتباط با فروش و پشتیبانی Elecio', descriptionEn: 'Contact Elecio sales and support' },
  { href: '/for/programmers', fa: ['برنامه نویس CNC', 'انتقال برنامه', 'اپراتور برنامه', 'DNC'], en: ['CNC programmer', 'Program transfer', 'DNC'], descriptionFa: 'راهکارهای Elecio برای برنامه‌نویسان CNC', descriptionEn: 'Elecio solutions for CNC programmers' },
  { href: '/for/operators', fa: ['اپراتور', 'کاربر دستگاه', 'تولید', 'توقف دستگاه'], en: ['Operator', 'Machine user', 'Production', 'Downtime'], descriptionFa: 'ابزارهای مناسب اپراتورهای دستگاه CNC', descriptionEn: 'Tools for CNC machine operators' },
  { href: '/for/business-owners', fa: ['مدیر', 'صاحب کارگاه', 'گزارش کارکرد', 'مدیریت تولید'], en: ['Owner', 'Workshop manager', 'Runtime report', 'Production management'], descriptionFa: 'دید مدیریتی و گزارش عملکرد ماشین‌آلات', descriptionEn: 'Management visibility and machine performance reporting' },
] as const;

const brandAliases: Record<string, string> = {
  fanuc: 'FANUC فانوک فنوک',
  heidenhain: 'HEIDENHAIN هایدن هاین هایدنهاین',
  siemens: 'SIEMENS زیمنس سینومریک SINUMERIK',
  mitsubishi: 'MITSUBISHI میتسوبیشی ملداس MELDAS',
  haas: 'HAAS هاس',
};

const documentKindAliases: Record<string, string> = {
  operator: 'operator اپراتوری راهنمای کاربر',
  maintenance: 'maintenance نگهداری تعمیرات سرویس',
  parameter: 'parameter پارامتر تنظیمات',
  connection: 'connection اتصال کابل سیم بندی',
  programming: 'programming برنامه نویسی',
  diagnostics: 'diagnostics عیب یابی خطا آلارم',
  reference: 'reference مرجع کاتالوگ',
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ۀة]/g, 'ه')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[\u064B-\u065F\u0670\u200c]/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function relevance(query: string, title: string, searchable: string) {
  const normalizedTitle = normalize(title);
  const normalizedSearchable = normalize(searchable);
  const terms = query.split(' ').filter((term) => term.length > 1);
  if (!terms.length) return 0;
  if (!terms.every((term) => normalizedSearchable.includes(term))) return 0;
  let score = normalizedTitle === query ? 120 : normalizedTitle.startsWith(query) ? 90 : normalizedTitle.includes(query) ? 70 : 20;
  for (const term of terms) {
    if (normalizedTitle.startsWith(term)) score += 18;
    else if (normalizedTitle.includes(term)) score += 10;
  }
  return score;
}

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale') === 'en' ? 'en' : 'fa';
  const rawQuery = request.nextUrl.searchParams.get('q')?.slice(0, 80) ?? '';
  const query = normalize(rawQuery);
  if (query.replaceAll(' ', '').length < 3) return NextResponse.json({ results: [] });
  const en = locale === 'en';
  const terms = query.split(' ').filter((term) => term.length > 1).slice(0, 6);
  if (!terms.length) return NextResponse.json({ results: [] });

  const pageResults: SearchResult[] = pages.flatMap((page) => {
    const keywords = en ? page.en : page.fa;
    const title = keywords[0];
    const description = en ? page.descriptionEn : page.descriptionFa;
    const score = relevance(query, title, `${keywords.join(' ')} ${description}`);
    return score ? [{ id: `page:${page.href}`, kind: 'page', title, description, meta: en ? 'Site section' : 'بخش سایت', href: page.href, score }] : [];
  });

  const documentResults: SearchResult[] = [];
  for (const group of controllerDocumentGroups) {
    const description = en ? group.descriptionEn : group.descriptionFa;
    const groupTitle = `${group.brandLabel} ${group.model}`;
    const groupSearch = `${groupTitle} ${brandAliases[group.brand]} ${description} ${group.documents.map((document) => `${document.title} ${document.documentNumber ?? ''} ${documentKindAliases[document.kind]}`).join(' ')}`;
    const groupScore = relevance(query, groupTitle, groupSearch);
    if (groupScore) {
      documentResults.push({ id: `model:${group.id}`, kind: 'document', title: groupTitle, description, meta: en ? `${group.documents.length} documents` : `${group.documents.length.toLocaleString('fa-IR')} سند`, href: `/documents?model=${encodeURIComponent(group.id)}#document-results`, score: groupScore + 8 });
    }
    for (const document of group.documents) {
      const title = document.title;
      const search = `${title} ${document.documentNumber ?? ''} ${documentKindAliases[document.kind]}`;
      const score = relevance(query, title, search);
      if (!score) continue;
      documentResults.push({ id: `document:${group.id}:${document.documentNumber ?? document.title}`, kind: 'document', title, description: groupTitle, meta: document.documentNumber ?? (en ? 'CNC manual' : 'منوال CNC'), href: `/documents?model=${encodeURIComponent(group.id)}&query=${encodeURIComponent(document.documentNumber ?? document.title)}#document-results`, score: score + 12 });
    }
  }

  let articleResults: SearchResult[] = [];
  try {
    const posts = await searchPublishedPosts(locale, terms);
    articleResults = posts.map((post): SearchResult => ({
      id: `article:${post.id}`,
      kind: 'article',
      title: String(post.title),
      description: String(post.excerpt ?? ''),
      meta: String(post.category_name ?? (en ? 'Article' : 'مقاله')),
      href: `/blog/${post.slug}`,
      score: relevance(query, String(post.title), `${post.title} ${post.excerpt ?? ''} ${post.category_name ?? ''} ${post.slug}`) + 10,
    })).filter((result) => result.score > 10);
  } catch {
    articleResults = [];
  }

  const results = [
    ...pageResults.sort((a, b) => b.score - a.score).slice(0, 4),
    ...articleResults.sort((a, b) => b.score - a.score).slice(0, 5),
    ...documentResults.sort((a, b) => b.score - a.score).slice(0, 6),
  ].sort((a, b) => b.score - a.score).slice(0, 12).map(({ score: _score, ...result }) => result);

  return NextResponse.json({ results });
}
