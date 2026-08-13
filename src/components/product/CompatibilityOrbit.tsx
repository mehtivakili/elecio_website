'use client';

import dynamic from 'next/dynamic';

export type CompatibilityOrbitProps = {
  eyebrow: string;
  title: string;
  body: string;
  caveat: string;
  protocols: string[];
};

export const CompatibilityOrbit = dynamic(
  () => import('./CompatibilityOrbitClient').then((module) => module.CompatibilityOrbitClient),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: '100svh', background: '#080b10' }} />,
  },
);
