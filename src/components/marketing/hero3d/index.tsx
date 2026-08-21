'use client';

import dynamic from 'next/dynamic';

// WebGL must never attempt to render on the server — dynamic + ssr:false keeps Three.js out of
// the SSR pass entirely instead of risking a hydration mismatch.
export const AboutProduct = dynamic(() => import('./AboutProduct').then((m) => m.AboutProduct), {
  ssr: false,
  loading: () => <div style={{ height: '230vh', background: 'var(--ink)' }} />,
});
