import Image from 'next/image';
import type { CSSProperties } from 'react';
import { Link } from '@/i18n/navigation';
import { controllerDocumentGroups } from '@/data/cnc-documents';
import { controllerBrandProfiles } from '@/data/controller-brands';
import styles from './DocumentsLibrary.module.css';

export function DocumentsLibrary({ locale }: { locale: string }) {
  const en = locale === 'en';
  const numberLocale = en ? 'en-US' : 'fa-IR';

  return (
    <div className={styles.library}>
      <nav className={styles.steps} aria-label={en ? 'Document navigation' : 'مسیر دسترسی به اسناد'}>
        <span className={styles.activeStep}><b>{en ? '01' : '۰۱'}</b><span>{en ? 'Controller brand' : 'برند کنترلر'}</span></span>
        <i aria-hidden="true" />
        <span><b>{en ? '02' : '۰۲'}</b><span>{en ? 'Exact model' : 'مدل دقیق'}</span></span>
        <i aria-hidden="true" />
        <span><b>{en ? '03' : '۰۳'}</b><span>{en ? 'Model documents' : 'اسناد مدل'}</span></span>
      </nav>

      <section className={styles.brandSection} aria-labelledby="document-brands-title">
        <div className={styles.sectionHeading}>
          <div><span>{en ? 'CONTROLLER LIBRARY' : 'کتابخانه کنترلرها'}</span><h2 id="document-brands-title">{en ? 'Choose the controller manufacturer' : 'سازنده کنترلر را انتخاب کنید'}</h2><p>{en ? 'Each manufacturer now has a dedicated page with its exact controller families.' : 'هر سازنده صفحه مستقل دارد و مدل‌های دقیق آن در مرحله بعد نمایش داده می‌شوند.'}</p></div>
        </div>
        <div className={styles.brandGrid}>
          {controllerBrandProfiles.map((brand) => {
            const groups = controllerDocumentGroups.filter((group) => group.brand === brand.id);
            const count = groups.reduce((sum, group) => sum + group.documents.length, 0);
            return <Link key={brand.id} className={styles.brandCard} data-brand={brand.id} href={`/documents/${brand.id}`} style={{ '--brand-accent': brand.accent } as CSSProperties}>
              <span className={styles.brandTop}><span className={styles.brandLogo}><Image src={brand.logo} alt={`${brand.name} logo`} width={brand.logoWidth} height={brand.logoHeight} /></span></span>
              <small>{en ? brand.taglineEn : brand.taglineFa}</small>
              <span className={styles.brandStats}><b>{groups.length.toLocaleString(numberLocale)}</b> {en ? 'families' : 'خانواده'} · <b>{count.toLocaleString(numberLocale)}</b> {en ? 'documents' : 'سند'}</span>
              <span className={styles.selectLabel}>{en ? 'Open manufacturer page' : 'ورود به صفحه سازنده'} <i aria-hidden="true">{en ? '→' : '←'}</i></span>
            </Link>;
          })}
        </div>
      </section>
    </div>
  );
}
