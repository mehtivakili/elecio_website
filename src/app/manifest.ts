import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Elecio Smart DNC',
    short_name: 'Elecio',
    description: 'Secure CNC file transfer, networking, and production visibility.',
    start_url: '/fa',
    display: 'standalone',
    background_color: '#0a0c10',
    theme_color: '#0a0c10',
    icons: [{ src: '/icon.png', sizes: '256x256', type: 'image/png' }],
  };
}
