import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Knex dynamically `require()`s every dialect driver it supports (oracledb, sqlite3, tedious,
  // ...) even though we only ever use 'mysql2' — bundling it would make Next try to statically
  // resolve all of those. Keeping it (and objection/mysql2) external makes Node `require()` it at
  // runtime instead, where the unused dialect branches simply never execute.
  serverExternalPackages: ['better-auth', 'knex', 'mysql2', 'objection', 'redis'],
  images: {
    // Old-site asset domains we still reference for the two software-download links until
    // Phase 7 rehosts them ourselves — see src/server/db/models/DownloadRequest.ts.
    remotePatterns: [{ protocol: 'https', hostname: 'storage.webprohost.ir' }],
  },
  async headers() {
    return [
      {
        source: '/3d/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
