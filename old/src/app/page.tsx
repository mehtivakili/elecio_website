'use client';

import { useEffect } from 'react';
import { HeroSection, LogoRollingBar, StatsSection, DeviceFeaturesSection, WirelessFeaturesSection, MobileFeaturesSection, MonitoringSection, FileManagementSection, GuaranteeSection, CustomerSatisfactionSection, SetupGuideSection } from '@/components/landing';

export default function Home() {
  useEffect(() => {
    // Handle hash navigation on page load
    const handleHashNavigation = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        const element = document.querySelector(hash);
        if (element) {
          // Wait for page to fully load
          setTimeout(() => {
            const topbarHeight = 80;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - topbarHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          }, 100);
        }
      }
    };

    // Run on mount and after a short delay to ensure DOM is ready
    handleHashNavigation();
    const timeout = setTimeout(handleHashNavigation, 300);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main>
      <HeroSection />
      <LogoRollingBar />
      <StatsSection />
      <DeviceFeaturesSection />
      <WirelessFeaturesSection />
      <MobileFeaturesSection />
      <MonitoringSection />
      <FileManagementSection />
      <GuaranteeSection />
      <SetupGuideSection />
      <CustomerSatisfactionSection />
    </main>
  );
}
