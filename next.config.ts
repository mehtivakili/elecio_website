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
  async redirects() {
    return [
      // Keep exactly one crawlable origin. Serving the full site on both hosts creates a
      // duplicate URL for every page and makes Google choose a canonical on our behalf.
      {
        source: '/',
        has: [{ type: 'host', value: 'www.elecio.co' }],
        destination: 'https://elecio.co/fa',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.elecio.co' }],
        destination: 'https://elecio.co/:path*',
        permanent: true,
      },
      // The root is a language-selection alias, not a separate page. A permanent redirect
      // agrees with the x-default canonical target and gives crawlers a stable signal.
      {
        source: '/',
        destination: '/fa',
        permanent: true,
      },
      // Every other public page is reachable at a bare, locale-less path too (old links,
      // typed URLs, historical sitemap entries). Without these, next-intl's proxy still
      // 307s them to /fa/... on every request — Search Console reports each as a page
      // whose only content is a redirect. Listing literal sources (rather than an
      // open-ended regex) keeps /api, /_next, and static assets out of scope.
      {
        source: '/product',
        destination: '/fa/product',
        permanent: true,
      },
      {
        source: '/software',
        destination: '/fa/software',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/fa/about',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/fa/contact',
        permanent: true,
      },
      {
        source: '/blog',
        destination: '/fa/blog',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/fa/blog/:slug',
        permanent: true,
      },
      {
        source: '/for/business-owners',
        destination: '/fa/for/business-owners',
        permanent: true,
      },
      {
        source: '/for/operators',
        destination: '/fa/for/operators',
        permanent: true,
      },
      {
        source: '/for/programmers',
        destination: '/fa/for/programmers',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/fa/privacy',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/fa/terms',
        permanent: true,
      },
    ];
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
