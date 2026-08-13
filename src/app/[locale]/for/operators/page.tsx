import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PersonaHero } from '@/components/marketing/PersonaHero';
import { FeatureList } from '@/components/marketing/FeatureList';
import { FinalCta } from '@/components/marketing/FinalCta';
import { localizedPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'personaPages.operator' });
  return localizedPageMetadata(locale, 'for/operators', `${t('eyebrow')} — ${t('headline')}`, t('subheadline'));
}

export default async function OperatorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('personaPages.operator');

  return (
    <main>
      <PersonaHero
        eyebrow={t('eyebrow')}
        headline={t('headline')}
        subheadline={t('subheadline')}
        primaryLabel={t('ctaPrimary')}
        secondaryLabel={t('ctaSecondary')}
      />
      <FeatureList namespace="operatorFeatures" />
      <FinalCta />
    </main>
  );
}
