'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { sendPageView } from '@/lib/telemetry';

// next/navigation's pathname keeps the /fa or /en prefix, which the beacon route needs.
export function PageViewTracker() {
  const pathname = usePathname();
  // Guards against Strict Mode's double effect run and re-renders that keep the same path.
  const lastSent = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;
    sendPageView(pathname);
  }, [pathname]);
  return null;
}
