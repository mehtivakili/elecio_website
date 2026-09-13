import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { DocumentList } from '@/components/documents/DocumentList';
import { getControllerBrand } from '@/data/controller-brands';
import { controllerDocumentGroups, getControllerDocumentGroup } from '@/data/cnc-documents';
import pageStyles from '../../page.module.css';
import styles from '@/components/documents/DocumentsLibrary.module.css';

export const dynamicParams = false;
export function generateStaticParams() { return controllerDocumentGroups.map((group) => ({ brand: group.brand, model: group.id })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; brand: string; model: string }> }): Promise<Metadata> {
  const { locale, brand, model } = await params;
  const group = getControllerDocumentGroup(brand, model);
  if (!group) return {};
  const en = locale === 'en';
  const path = `/${locale}/documents/${brand}/${model}`;
  return { title: en ? `${group.model} manuals | Elecio` : `منوال و اسناد ${group.model} | Elecio`, description: en ? group.descriptionEn : group.descriptionFa, alternates: { canonical: path, languages: { fa: `/fa/documents/${brand}/${model}`, en: `/en/documents/${brand}/${model}`, 'x-default': `/fa/documents/${brand}/${model}` } } };
}

export default async function ControllerModelPage({ params, searchParams }: { params: Promise<{ locale: string; brand: string; model: string }>; searchParams: Promise<{ query?: string }> }) {
  const { locale, brand: brandId, model } = await params;
  const { query } = await searchParams;
  const brand = getControllerBrand(brandId);
  const group = getControllerDocumentGroup(brandId, model);
  if (!brand || !group) notFound();
  const en = locale === 'en';
  const numberLocale = en ? 'en-US' : 'fa-IR';
  const profile = group.technicalProfile;
  const kinds = new Set(group.documents.map((document) => document.kind));
  const officialCount = group.documents.filter((document) => (document.source ?? (document.access === 'archive' ? 'unofficial' : 'official')) === 'official').length;
  const related = controllerDocumentGroups.filter((item) => item.brand === brand.id && item.id !== group.id).slice(0, 3);
  return <main className={pageStyles.page} style={{ '--brand-accent': brand.accent } as CSSProperties}>
    <div className={pageStyles.wrap}>
      <nav className={styles.breadcrumbs}><Link href="/documents">{en ? 'Documents' : 'اسناد'}</Link><span>/</span><Link href={`/documents/${brand.id}`}>{brand.name}</Link><span>/</span><b dir="ltr">{group.model}</b></nav>
      <article className={styles.documentSection} data-brand={brand.id} id="document-results" style={{ '--brand-accent': brand.accent } as CSSProperties}>
        <header className={styles.documentHero}>
          <div><span className={styles.documentBrandLockup}><Image src={brand.logo} alt={`${brand.name} logo`} width={brand.logoWidth} height={brand.logoHeight} /></span><h1 id="selected-model-title" dir="ltr">{group.model}</h1><p>{en ? group.descriptionEn : group.descriptionFa}</p><div className={styles.modelFacts}><span><b>{group.documents.length.toLocaleString(numberLocale)}</b>{en ? 'Available documents' : 'سند موجود'}</span><span><b>{kinds.size.toLocaleString(numberLocale)}</b>{en ? 'Document types' : 'نوع سند'}</span><span><b>{officialCount.toLocaleString(numberLocale)}</b>{en ? 'Official sources' : 'منبع رسمی'}</span><span><b>{brand.name}</b>{en ? 'Manufacturer' : 'سازنده'}</span></div></div>
          <Link className={styles.changeButton} href={`/documents/${brand.id}`}>{en ? 'All models' : 'همه مدل‌ها'}</Link>
        </header>
        {profile && <section className={styles.technicalProfile} aria-labelledby="technical-profile-title">
          <div className={styles.profileHeader}>
            <div><span>{en ? 'PRACTICAL CONTROLLER PROFILE' : 'اطلاعات کاربردی کنترلر'}</span><h2 id="technical-profile-title">{en ? 'Choose the right manual before service' : 'قبل از سرویس، منوال درست را انتخاب کنید'}</h2></div>
            <div className={styles.availability}><strong>{profile.availabilityPercent.toLocaleString(numberLocale)}{en ? '%' : '٪'}</strong><span>{en ? 'Estimated source coverage' : 'پوشش تقریبی منابع'}</span></div>
          </div>
          <dl className={styles.profileFacts}>
            <div><dt>{en ? 'Machine applications' : 'کاربردهای رایج'}</dt><dd>{(en ? profile.machineTypesEn : profile.machineTypesFa).join(en ? ', ' : '، ')}</dd></div>
            <div><dt>{en ? 'Transfer interfaces' : 'رابط‌های انتقال'}</dt><dd dir="ltr">{profile.interfaces.join(' · ')}</dd></div>
            <div><dt>{en ? 'Version scope' : 'محدوده نسخه'}</dt><dd dir="ltr">{profile.softwareRange}</dd></div>
            <div><dt>{en ? 'Useful software' : 'نرم‌افزارهای کاربردی'}</dt><dd dir="ltr">{profile.tools.join(' · ')}</dd></div>
          </dl>
          <div className={styles.workflowNotes}>
            <article><span>{en ? '01' : '۰۱'}</span><div><h3>{en ? 'Identify' : 'شناسایی دقیق'}</h3><p>{en ? profile.identificationEn : profile.identificationFa}</p></div></article>
            <article><span>{en ? '02' : '۰۲'}</span><div><h3>{en ? 'Back up' : 'بکاپ امن'}</h3><p>{en ? profile.backupEn : profile.backupFa}</p></div></article>
            <article><span>{en ? '03' : '۰۳'}</span><div><h3>{en ? 'Transfer' : 'انتقال فایل'}</h3><p>{en ? profile.transferEn : profile.transferFa}</p></div></article>
          </div>
          <p className={styles.profileCaution}><b>{en ? 'Important:' : 'نکته مهم:'}</b> {en ? profile.cautionEn : profile.cautionFa}</p>
          <div className={styles.sourceLegend}><span data-source="official">{en ? 'Official: manufacturer or authorized regional source' : 'رسمی: سازنده یا نمایندگی منطقه‌ای معتبر'}</span><span data-source="unofficial">{en ? 'Unofficial: third-party mirror or archive; verify revision' : 'غیررسمی: آرشیو یا Mirror شخص ثالث؛ Revision را بررسی کنید'}</span></div>
        </section>}
        <DocumentList group={group} locale={locale} initialQuery={query} />
      </article>
      {related.length > 0 && <aside className={styles.related}><div className={styles.sectionHeading}><div><span>{en ? 'RELATED MODELS' : 'مدل‌های مرتبط'}</span><h2>{en ? `More ${brand.name} families` : `سایر مدل‌های ${brand.name}`}</h2></div></div><div>{related.map((item) => <Link key={item.id} href={`/documents/${brand.id}/${item.id}`}><b dir="ltr">{item.model}</b><span>{item.documents.length.toLocaleString(en ? 'en-US' : 'fa-IR')} {en ? 'documents' : 'سند'}</span></Link>)}</div></aside>}
    </div>
  </main>;
}
