import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PersonaExperience, type PersonaPageCopy } from '@/components/marketing/PersonaExperience';
import { FeatureList } from '@/components/marketing/FeatureList';
import { FinalCta } from '@/components/marketing/FinalCta';
import { localizedPageMetadata } from '@/lib/seo';
import { PERSONA_STORY_IMAGES } from '@/lib/site-constants';
import type { AppLocale } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'personaPages.operator' });
  return localizedPageMetadata(locale, 'for/operators', `${t('eyebrow')} — ${t('headline')}`, t('subheadline'));
}

export default async function OperatorsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('personaPages.operator');
  const copy: PersonaPageCopy = {
    eyebrow: t('eyebrow'),
    headline: t('headline'),
    subheadline: t('subheadline'),
    ctaPrimary: t('ctaPrimary'),
    ctaSecondary: t('ctaSecondary'),
    imageAlts: t.raw('imageAlts'),
    heroHighlights: t.raw('heroHighlights'),
    story: t.raw('story'),
    outcomes: t.raw('outcomes'),
  };

  return (
    <main>
      <PersonaExperience copy={copy} images={PERSONA_STORY_IMAGES[locale][2]} tone="operator" />
      <FeatureList namespace="operatorFeatures" />
      <FinalCta />
    </main>
  );
}
