import type { Metadata } from 'next';
import { DocumentsLibrary } from '@/components/documents/DocumentsLibrary';
import styles from './page.module.css';

export function generateStaticParams() {
  return [{ locale: 'fa' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  return {
    title: en ? 'CNC manuals and official documentation | Elecio' : 'منوال‌ها و اسناد رسمی CNC | Elecio',
    description: en
      ? 'A structured library of official FANUC, HEIDENHAIN, Siemens, Mitsubishi, and Haas CNC manuals.'
      : 'کتابخانه منظم منوال‌ها و اسناد رسمی کنترلرهای CNC از FANUC، HEIDENHAIN، Siemens، Mitsubishi و Haas.',
    alternates: {
      canonical: `/${locale}/documents`,
      languages: { fa: '/fa/documents', en: '/en/documents', 'x-default': '/fa/documents' },
    },
  };
}

export default async function DocumentsPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ model?: string; query?: string }>;
}) {
  const { locale } = await params;
  const { model, query } = await searchParams;
  const en = locale === 'en';

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>{en ? 'Elecio document center' : 'مرکز اسناد Elecio'}</span>
            <h1>{en ? 'The right CNC manual, without the hunt.' : 'منوال درست CNC، بدون جست‌وجوی پراکنده.'}</h1>
            <p>
              {en
                ? 'Verified document numbers and links to the original manufacturers. Files stay with the OEM and are not mirrored on Elecio.'
                : 'شماره دقیق اسناد و لینک منبع اصلی سازندگان؛ فایل‌ها روی سرور Elecio کپی نشده‌اند و مستقیماً از مرجع رسمی باز می‌شوند.'}
            </p>
          </div>
        </header>

        <DocumentsLibrary locale={locale} initialModel={model} initialQuery={query} />
      </div>
    </main>
  );
}
