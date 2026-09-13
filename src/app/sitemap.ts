import type { MetadataRoute } from 'next';
import { knex } from '@/server/db/knex';
import { SITE_URL } from '@/lib/seo';
import { controllerBrandProfiles } from '@/data/controller-brands';
import { controllerDocumentGroups } from '@/data/cnc-documents';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contentUpdatedAt = new Date(process.env.NEXT_PUBLIC_CONTENT_UPDATED_AT ?? '2026-08-13T00:00:00.000Z');
  const paths = ['', '/product', '/software', '/about', '/contact', '/blog', '/documents', '/for/business-owners', '/for/operators', '/for/programmers', '/privacy', '/terms'];
  const staticRows = paths.flatMap((path) => ['fa', 'en'].map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: contentUpdatedAt,
    changeFrequency: path === '/blog' ? 'daily' as const : 'monthly' as const,
    priority: path === '' ? 1 : path === '/product' ? 0.9 : path === '/privacy' || path === '/terms' ? 0.3 : 0.7,
    alternates: { languages: { fa: `${SITE_URL}/fa${path}`, en: `${SITE_URL}/en${path}`, 'x-default': `${SITE_URL}/fa${path}` } },
  })));
  const documentRows = ['fa', 'en'].flatMap((locale) => [
    ...controllerBrandProfiles.map((brand) => ({ url: `${SITE_URL}/${locale}/documents/${brand.id}`, lastModified: contentUpdatedAt, changeFrequency: 'monthly' as const, priority: 0.72 })),
    ...controllerDocumentGroups.map((group) => ({ url: `${SITE_URL}/${locale}/documents/${group.brand}/${group.id}`, lastModified: contentUpdatedAt, changeFrequency: 'monthly' as const, priority: 0.68 })),
  ]);

  try {
    const posts = await knex('posts')
      .select('slug', 'translation_status', 'updated_at')
      .where({ status: 'published' })
      .where(function publishedByNow() {
        this.whereNull('scheduled_for').orWhere('scheduled_for', '<=', knex.fn.now());
      });
    const articles = posts.flatMap((post) => {
      const locales = post.translation_status === 'fa_only' ? ['fa'] : post.translation_status === 'en_only' ? ['en'] : ['fa', 'en'];
      return locales.map((locale) => ({
        url: `${SITE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
        alternates: post.translation_status === 'complete'
          ? { languages: { fa: `${SITE_URL}/fa/blog/${post.slug}`, en: `${SITE_URL}/en/blog/${post.slug}`, 'x-default': `${SITE_URL}/fa/blog/${post.slug}` } }
          : undefined,
      }));
    });
    return [...staticRows, ...documentRows, ...articles];
  } catch {
    return [...staticRows, ...documentRows];
  }
}
