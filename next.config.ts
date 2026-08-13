import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Knex dynamically `require()`s every dialect driver it supports (oracledb, sqlite3, tedious,
  // ...) even though we only ever use 'pg' — bundling it would make Next try to statically
  // resolve all of those. Keeping it (and objection/pg) external makes Node `require()` it at
  // runtime instead, where the unused dialect branches simply never execute.
  serverExternalPackages: ['better-auth', 'knex', 'objection', 'pg', 'redis'],
  images: {
    // Old-site asset domains we still reference for the two software-download links until
    // Phase 7 rehosts them ourselves — see src/server/db/models/DownloadRequest.ts.
    remotePatterns: [{ protocol: 'https', hostname: 'storage.webprohost.ir' }],
  },
};

export default withNextIntl(nextConfig);
