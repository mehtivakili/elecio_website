import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ProductShowcase } from '@/components/product/ProductShowcase';
import type { AppLocale } from '@/i18n/routing';
import { localizedPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === 'fa'
    ? 'ElecIO Smart DNC | انتقال بی‌سیم برنامه CNC و گزارش تولید'
    : 'ElecIO Smart DNC | Wireless CNC Transfer & Production Reporting';
  const description = locale === 'fa'
    ? 'مشخصات کامل ElecIO Smart DNC: انتقال بی‌سیم NC، محافظت پورت سریال، ۸ گیگابایت حافظه، LSV2، نرم‌افزار ویندوز، اندروید و وب و گزارش زمان کار و توقف CNC.'
    : 'Complete ElecIO Smart DNC specifications: wireless NC transfer, serial-port protection, 8GB storage, LSV2, Windows, Android and Web software, and CNC runtime reporting.';
  return localizedPageMetadata(locale, 'product', title, description, '/images/tech-pair.webp');
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProductShowcase locale={locale as AppLocale} />;
}
