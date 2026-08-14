import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PersonaExperience, type PersonaPageCopy } from '@/components/marketing/PersonaExperience';
import { ControllerMatrix } from '@/components/marketing/ControllerMatrix';
import { FeatureList } from '@/components/marketing/FeatureList';
import { FinalCta } from '@/components/marketing/FinalCta';
import { localizedPageMetadata } from '@/lib/seo';
import { PERSONA_STORY_IMAGES } from '@/lib/site-constants';
import type { AppLocale } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'personaPages.programmer' });
  return localizedPageMetadata(locale, 'for/programmers', `${t('eyebrow')} — ${t('headline')}`, t('subheadline'));
}

export default async function ProgrammersPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('personaPages.programmer');
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
      <PersonaExperience copy={copy} images={PERSONA_STORY_IMAGES[locale][1]} tone="programmer" />
      <ControllerMatrix />
      <FeatureList namespace="protocolSpecs" />
      <FinalCta />
    </main>
  );
}
