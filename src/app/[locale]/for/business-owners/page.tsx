import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PersonaHero } from '@/components/marketing/PersonaHero';
import { TrustBadges } from '@/components/marketing/TrustBadges';
import { RoiFormula } from '@/components/marketing/RoiFormula';
import { VideoTestimonials } from '@/components/marketing/VideoTestimonials';
import { PartnerStrip } from '@/components/marketing/PartnerStrip';
import { FinalCta } from '@/components/marketing/FinalCta';
import { localizedPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'personaPages.businessOwner' });
  return localizedPageMetadata(locale, 'for/business-owners', `${t('eyebrow')} — ${t('headline')}`, t('subheadline'));
}

export default async function BusinessOwnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('personaPages.businessOwner');

  return (
    <main>
      <PersonaHero
        eyebrow={t('eyebrow')}
        headline={t('headline')}
        subheadline={t('subheadline')}
        primaryLabel={t('ctaPrimary')}
        secondaryLabel={t('ctaSecondary')}
      >
        <TrustBadges />
      </PersonaHero>
      <RoiFormula />
      <VideoTestimonials />
      <PartnerStrip />
      <FinalCta />
    </main>
  );
}
