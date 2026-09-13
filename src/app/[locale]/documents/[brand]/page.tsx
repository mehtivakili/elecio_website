import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { controllerBrandProfiles, getControllerBrand } from '@/data/controller-brands';
import { getControllerGroupsByBrand } from '@/data/cnc-documents';
import pageStyles from '../page.module.css';
import styles from '@/components/documents/DocumentsLibrary.module.css';

export const dynamicParams = false;
export function generateStaticParams() { return controllerBrandProfiles.map((brand) => ({ brand: brand.id })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; brand: string }> }): Promise<Metadata> {
  const { locale, brand: brandId } = await params;
  const brand = getControllerBrand(brandId);
  if (!brand) return {};
  const en = locale === 'en';
  return { title: en ? `${brand.name} CNC manuals | Elecio` : `منوال‌ها و اسناد ${brand.name} | Elecio`, description: en ? brand.descriptionEn : brand.descriptionFa, alternates: { canonical: `/${locale}/documents/${brand.id}`, languages: { fa: `/fa/documents/${brand.id}`, en: `/en/documents/${brand.id}`, 'x-default': `/fa/documents/${brand.id}` } } };
}

export default async function ControllerBrandPage({ params }: { params: Promise<{ locale: string; brand: string }> }) {
  const { locale, brand: brandId } = await params;
  const brand = getControllerBrand(brandId);
  if (!brand) notFound();
  const en = locale === 'en';
  const groups = getControllerGroupsByBrand(brand.id);
  const numberLocale = en ? 'en-US' : 'fa-IR';
  return <main className={pageStyles.page} style={{ '--brand-accent': brand.accent } as CSSProperties}>
    <div className={pageStyles.wrap}>
      <nav className={styles.breadcrumbs}><Link href="/documents">{en ? 'Documents' : 'اسناد'}</Link><span>/</span><b>{brand.name}</b></nav>
      <header className={styles.brandPageHero}>
        <div className={styles.pageLogo}><Image src={brand.logo} alt={`${brand.name} logo`} width={brand.logoWidth} height={brand.logoHeight} priority /></div>
        <div><span>{en ? 'CONTROLLER MANUFACTURER' : 'سازنده کنترلر'}</span><h1>{en ? `${brand.name} controller library` : `کتابخانه کنترلرهای ${brand.name}`}</h1><p>{en ? brand.descriptionEn : brand.descriptionFa}</p></div>
        <dl><div><dt>{en ? 'Families' : 'خانواده‌ها'}</dt><dd>{groups.length.toLocaleString(numberLocale)}</dd></div><div><dt>{en ? 'Documents' : 'اسناد'}</dt><dd>{groups.reduce((sum, group) => sum + group.documents.length, 0).toLocaleString(numberLocale)}</dd></div></dl>
      </header>
      <section className={styles.modelSection} aria-labelledby="models-heading">
        <div className={styles.sectionHeading}><div><span>{en ? 'SELECT EXACT MODEL' : 'انتخاب مدل دقیق'}</span><h2 id="models-heading">{en ? `${brand.name} controller families` : `خانواده‌های کنترلر ${brand.name}`}</h2><p>{en ? 'Open a model to see its details, supported documents and official sources.' : 'برای مشاهده اطلاعات، اسناد موجود و منابع رسمی، مدل دقیق را باز کنید.'}</p></div></div>
        <div className={styles.modelGrid}>{groups.map((group) => <Link key={group.id} className={styles.modelCard} data-brand={group.brand} href={`/documents/${brand.id}/${group.id}`} style={{ '--brand-accent': brand.accent } as CSSProperties}>
          <span className={styles.modelTop}><span className={styles.modelBrandLogo}><Image src={brand.logo} alt="" width={brand.logoWidth} height={brand.logoHeight} /></span><span className={styles.modelNumber}>{group.documents.length.toLocaleString(numberLocale)} {en ? 'documents' : 'سند'}</span></span>
          <h3 dir="ltr">{group.model}</h3><p>{en ? group.descriptionEn : group.descriptionFa}</p><span className={styles.selectLabel}>{en ? 'Open model page' : 'ورود به صفحه مدل'} <i aria-hidden="true">{en ? '→' : '←'}</i></span>
        </Link>)}</div>
      </section>
    </div>
  </main>;
}
