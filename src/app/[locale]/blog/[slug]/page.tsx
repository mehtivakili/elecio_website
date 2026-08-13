import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound, permanentRedirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getPublishedPost, getSlugRedirect } from '@/server/content/post-repository';
import { extractFaq } from '@/server/content/document';
import { RichContent } from '@/components/blog/RichContent';
import styles from '@/components/blog/Blog.module.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPublishedPost(locale, slug);
  if (!post) return {};
  const other = locale === 'fa' ? 'en' : 'fa';
  const languages = post.translationStatus === 'complete'
    ? { fa: `/fa/blog/${post.slug}`, en: `/en/blog/${post.slug}` }
    : { [locale]: `/${locale}/blog/${post.slug}` };
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    robots: { index: post.robotsIndex, follow: post.robotsIndex },
    alternates: { canonical: post.canonicalUrl ?? `/${locale}/blog/${post.slug}`, languages },
    openGraph: {
      type: 'article', title: post.ogTitle, description: post.ogDescription,
      publishedTime: post.publishedAt, modifiedTime: post.updatedAt,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      alternateLocale: post.translationStatus === 'complete' ? [other === 'fa' ? 'fa_IR' : 'en_US'] : undefined,
      images: post.coverImagePath ? [{ url: post.coverImagePath, alt: post.coverAlt }] : [],
    },
    twitter: { card: 'summary_large_image', title: post.ogTitle, description: post.ogDescription, images: post.coverImagePath ? [post.coverImagePath] : [] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const en = locale === 'en';
  const post = await getPublishedPost(locale, slug);
  if (!post) {
    const moved = await getSlugRedirect(slug);
    if (moved) permanentRedirect(`/${locale}/blog/${moved.slug}`);
    notFound();
  }
  const origin = process.env.BETTER_AUTH_URL ?? 'https://elecio.ir';
  const articleJsonLd = {
    '@context': 'https://schema.org', '@type': post.schemaType, headline: post.title,
    description: post.seoDescription, datePublished: post.publishedAt, dateModified: post.updatedAt,
    author: post.authorName ? { '@type': 'Person', name: post.authorName } : undefined,
    publisher: { '@type': 'Organization', name: 'ElecIO', url: origin },
    image: post.coverImagePath ? new URL(post.coverImagePath, origin).href : undefined,
    mainEntityOfPage: new URL(post.canonicalUrl ?? `/${locale}/blog/${post.slug}`, origin).href,
  };
  const faq = extractFaq(post.body);
  const faqJsonLd = faq.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  } : null;
  const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
  return <main className={styles.article}><article>
    <header className={`${styles.articleHead} ${styles.articleWrap}`}><span className={styles.eyebrow}>{post.categoryName ?? (en ? 'Elecio guide' : 'راهنمای Elecio')}</span><h1>{post.title}</h1><p className={styles.muted}>{post.excerpt}</p><div className={styles.meta}><span>{post.authorName}</span><time dateTime={post.publishedAt}>{new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(post.publishedAt))}</time></div></header>
    {post.coverImagePath && <figure className={styles.articleCover}><Image src={post.coverImagePath} alt={post.coverAlt} width={1600} height={900} priority />{post.coverCaption && <figcaption>{post.coverCaption}</figcaption>}</figure>}
    <div className={`${styles.articleWrap} ${styles.prose}`}><RichContent document={post.body} /><div className={styles.tags}>{post.tags.map((tag) => <span key={tag.slug}>{tag.name}</span>)}</div><p><Link href="/blog">← {en ? 'All guides' : 'همه راهنماها'}</Link></p></div>
  </article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(articleJsonLd) }} />{faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(faqJsonLd) }} />}</main>;
}
