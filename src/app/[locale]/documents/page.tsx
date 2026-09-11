import type { Metadata } from 'next';
import { DocumentsLibrary } from '@/components/documents/DocumentsLibrary';
import { controllerDocumentGroups } from '@/data/cnc-documents';
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

export default async function DocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const en = locale === 'en';
  const documentCount = controllerDocumentGroups.reduce((sum, group) => sum + group.documents.length, 0);

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
          <dl className={styles.stats}>
            <div><dt>{en ? 'Manufacturers' : 'سازنده'}</dt><dd>5</dd></div>
            <div><dt>{en ? 'Controller families' : 'خانواده کنترلر'}</dt><dd>{controllerDocumentGroups.length.toLocaleString(locale)}</dd></div>
            <div><dt>{en ? 'Document records' : 'رکورد سند'}</dt><dd>{documentCount.toLocaleString(locale)}</dd></div>
          </dl>
        </header>

        <aside className={styles.notice}>
          <span aria-hidden="true">✓</span>
          <p>
            <strong>{en ? 'Official-source policy' : 'سیاست منبع رسمی'}</strong>
            {en
              ? ' Direct PDF links are used only when the manufacturer publishes them. FANUC legacy manuals open in MyPortal and require sign-in; use the exact document number shown.'
              : ' لینک مستقیم PDF فقط زمانی استفاده شده که خود سازنده آن را منتشر کرده باشد. منوال‌های قدیمی FANUC در MyPortal باز می‌شوند و نیاز به ورود دارند؛ شماره دقیق نمایش‌داده‌شده را جست‌وجو کنید.'}
          </p>
        </aside>

        <DocumentsLibrary locale={locale} />
      </div>
    </main>
  );
}
