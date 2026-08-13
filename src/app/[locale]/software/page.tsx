import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PersonaHero } from '@/components/marketing/PersonaHero';
import { FeatureList } from '@/components/marketing/FeatureList';
import { DownloadForm } from '@/components/marketing/DownloadForm';
import { FinalCta } from '@/components/marketing/FinalCta';
import styles from './page.module.css';
import { localizedPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'softwarePage' });
  return localizedPageMetadata(locale, 'software', `${t('eyebrow')} — ${t('headline')}`, t('subheadline'), '/images/software/software-transfer.webp');
}

export default async function SoftwarePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('softwarePage');
  const nav = await getTranslations('nav');

  return (
    <main>
      <PersonaHero
        eyebrow={t('eyebrow')}
        headline={t('headline')}
        subheadline={t('subheadline')}
        primaryLabel={nav('order')}
        secondaryLabel={nav('contact')}
      />
      <FeatureList namespace="softwareFeatures" />
      <section className={styles.downloadSection}>
        <div className={styles.downloadCard}>
          <h2 className={styles.downloadTitle}>{t('downloadTitle')}</h2>
          <DownloadForm />
        </div>
      </section>
      <FinalCta />
    </main>
  );
}
