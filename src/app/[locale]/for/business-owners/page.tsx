import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PersonaExperience, type PersonaPageCopy } from '@/components/marketing/PersonaExperience';
import { TrustBadges } from '@/components/marketing/TrustBadges';
import { RoiFormula } from '@/components/marketing/RoiFormula';
import { VideoTestimonials } from '@/components/marketing/VideoTestimonials';
import { PartnerStrip } from '@/components/marketing/PartnerStrip';
import { FinalCta } from '@/components/marketing/FinalCta';
import { localizedPageMetadata } from '@/lib/seo';
import { PERSONA_STORY_IMAGES } from '@/lib/site-constants';
import type { AppLocale } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'personaPages.businessOwner' });
  return localizedPageMetadata(locale, 'for/business-owners', `${t('eyebrow')} — ${t('headline')}`, t('subheadline'));
}

export default async function BusinessOwnersPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('personaPages.businessOwner');
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
      <PersonaExperience
        copy={copy}
        images={PERSONA_STORY_IMAGES[locale][0]}
        tone="owner"
        heroFooter={<TrustBadges />}
      />
      <RoiFormula />
      <VideoTestimonials />
      <PartnerStrip />
      <FinalCta />
    </main>
  );
}
