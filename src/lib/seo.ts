import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || 'https://elecio.ir').replace(/\/$/, '');
export const SITE_NAME = 'Elecio';

export function localizedPageMetadata(
  locale: string,
  path: string,
  title: string,
  description: string,
  image = '/images/hero-slide-en-1.webp',
): Metadata {
  const suffix = path ? `/${path.replace(/^\//, '')}` : '';
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${suffix}`,
      languages: { fa: `/fa${suffix}`, en: `/en${suffix}`, 'x-default': `/fa${suffix}` },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      title,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}
