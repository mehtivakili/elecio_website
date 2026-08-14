import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/marketing/Hero';
import { AboutProduct } from '@/components/marketing/hero3d';
import { FeatureList } from '@/components/marketing/FeatureList';
import { StatsSection } from '@/components/marketing/StatsSection';
import { PersonaGrid } from '@/components/marketing/PersonaGrid';
import { SupportedMachines } from '@/components/marketing/SupportedMachines';
import { VideoTestimonials } from '@/components/marketing/VideoTestimonials';
import { LearningSection } from '@/components/marketing/LearningSection';
import { BlogPreview } from '@/components/marketing/BlogPreview';
import { PartnerStrip } from '@/components/marketing/PartnerStrip';
import { FinalCta } from '@/components/marketing/FinalCta';
import { ProductSectionDock } from '@/components/product/ProductSectionDock';
import { ShopFloorStory } from '@/components/marketing/ShopFloorStory';
import { HomeReturnScrollReset } from '@/components/marketing/HomeReturnScrollReset';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const en = locale === 'en';
  const dockItems = [
    { id: 'home-start', label: en ? 'Start' : 'شروع' },
    { id: 'shop-floor-story', label: en ? 'How it works' : 'نحوه کار' },
    { id: 'home-solutions', label: en ? 'Solutions' : 'راهکارها' },
    { id: 'home-proof', label: en ? 'Results' : 'نتایج' },
    { id: 'home-learning', label: en ? 'Learn' : 'یادگیری' },
    { id: 'home-contact', label: en ? 'Contact' : 'ارتباط' },
  ];

  return (
    <main>
      <HomeReturnScrollReset />
      <ProductSectionDock items={dockItems} ariaLabel={en ? 'Home page sections' : 'بخش‌های صفحه اصلی'} />
      {/* Photo-only top hero — the interactive 3D device lives in AboutProduct further down,
          not at the top (doc/journey.md 2026-08-07). */}
      <div id="home-start"><Hero /></div>
      <ShopFloorStory />
      <div id="home-solutions"><PersonaGrid /><AboutProduct /><FeatureList /></div>
      <div id="home-proof"><StatsSection /><SupportedMachines /><VideoTestimonials /></div>
      <div id="home-learning"><LearningSection /><BlogPreview /><PartnerStrip /></div>
      <div id="home-contact"><FinalCta /></div>
    </main>
  );
}
