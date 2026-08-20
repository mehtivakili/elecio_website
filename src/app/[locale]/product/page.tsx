import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ProductShowcase } from '@/components/product/ProductShowcase';
import type { AppLocale } from '@/i18n/routing';
import { localizedPageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, productJsonLd, jsonLdScript } from '@/lib/structured-data';

const TITLE = {
  fa: 'ElecIO Smart DNC | انتقال بی‌سیم برنامه CNC و گزارش تولید',
  en: 'ElecIO Smart DNC | Wireless CNC Transfer & Production Reporting',
} as const;
const DESCRIPTION = {
  fa: 'مشخصات کامل ElecIO Smart DNC: انتقال بی‌سیم NC، محافظت پورت سریال، ۸ گیگابایت حافظه، LSV2، نرم‌افزار ویندوز، اندروید و وب و گزارش زمان کار و توقف CNC.',
  en: 'Complete ElecIO Smart DNC specifications: wireless NC transfer, serial-port protection, 8GB storage, LSV2, Windows, Android and Web software, and CNC runtime reporting.',
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const key = locale === 'fa' ? 'fa' : 'en';
  return localizedPageMetadata(locale, 'product', TITLE[key], DESCRIPTION[key], '/images/tech-pair.webp');
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const key = locale === 'fa' ? 'fa' : 'en';
  const breadcrumb = breadcrumbJsonLd([
    { name: locale === 'fa' ? 'خانه' : 'Home', path: `/${locale}` },
    { name: locale === 'fa' ? 'محصول' : 'Product', path: `/${locale}/product` },
  ]);
  const product = productJsonLd(locale, { name: 'ElecIO Smart DNC', description: DESCRIPTION[key], image: '/images/tech-pair.webp' });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(product) }} />
      <ProductShowcase locale={locale as AppLocale} />
    </>
  );
}
