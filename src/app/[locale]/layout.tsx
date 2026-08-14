import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import faIR from 'antd/locale/fa_IR';
import enUS from 'antd/locale/en_US';
import { routing, type AppLocale } from '@/i18n/routing';
import { AppThemeProvider } from '@/components/layout/AppThemeProvider';
import { InlineScript } from '@/components/layout/InlineScript';
import { CustomScrollbar } from '@/components/layout/CustomScrollbar';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import '../globals.css';
import { SITE_URL } from '@/lib/seo';

// Runs before hydration so a returning visitor who chose light mode never sees a dark->light
// flash — reads the same localStorage key theme-context.tsx writes to, and sets the same
// `data-theme` attribute globals.css keys its light-mode token overrides off of.
const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem('elecio-theme');if(m==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  // hero.slides is an array (round 8, doc/journey.md — the hero became a carousel), so page
  // metadata uses the first slide's copy — the one every visitor sees on first paint.
  const first = t.raw('slides')[0] as { kicker: string; headlineStart: string; headlineHighlight: string; subheadline: string };
  return {
    metadataBase: new URL(SITE_URL),
    title: `${first.kicker} — ${first.headlineStart} ${first.headlineHighlight}`,
    description: first.subheadline,
    alternates: { canonical: `/${locale}`, languages: { fa: '/fa', en: '/en', 'x-default': '/fa' } },
    openGraph: { siteName: 'Elecio', type: 'website', locale: locale === 'fa' ? 'fa_IR' : 'en_US', images: [{ url: '/images/hero-slide-en-1.webp', width: 1920, height: 1080, alt: 'Elecio Smart DNC' }] },
    twitter: { card: 'summary_large_image' },
  };
}

const antdLocales: Record<AppLocale, typeof faIR> = { fa: faIR, en: enUS };
const dirByLocale: Record<AppLocale, 'rtl' | 'ltr'> = { fa: 'rtl', en: 'ltr' };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this request (next-intl requirement when reading the locale
  // outside of the middleware-populated request context) — see next-intl App Router docs.
  setRequestLocale(locale);

  const dir = dirByLocale[locale as AppLocale];

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <InlineScript html={THEME_INIT_SCRIPT} />
      </head>
      <body>
        <CustomScrollbar />
        <a href="#main-content" className="skip-link">{locale === 'fa' ? 'رفتن به محتوای اصلی' : 'Skip to main content'}</a>
        <NextIntlClientProvider>
          <AntdRegistry>
            <AppThemeProvider direction={dir} locale={antdLocales[locale as AppLocale]}>
              <SiteHeader />
              <div id="main-content" className="page-content">{children}</div>
              <SiteFooter />
            </AppThemeProvider>
          </AntdRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
