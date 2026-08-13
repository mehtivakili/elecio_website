import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PersonaHero } from '@/components/marketing/PersonaHero';
import { ControllerMatrix } from '@/components/marketing/ControllerMatrix';
import { FeatureList } from '@/components/marketing/FeatureList';
import { FinalCta } from '@/components/marketing/FinalCta';
import { localizedPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'personaPages.programmer' });
  return localizedPageMetadata(locale, 'for/programmers', `${t('eyebrow')} — ${t('headline')}`, t('subheadline'));
}

export default async function ProgrammersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('personaPages.programmer');

  return (
    <main>
      <PersonaHero
        eyebrow={t('eyebrow')}
        headline={t('headline')}
        subheadline={t('subheadline')}
        primaryLabel={t('ctaPrimary')}
        secondaryLabel={t('ctaSecondary')}
      />
      <ControllerMatrix />
      <FeatureList namespace="protocolSpecs" />
      <FinalCta />
    </main>
  );
}
