import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { knex } from '@/server/db/knex';
import { listPublishedPosts } from '@/server/content/post-repository';
import { brandedImagePath } from '@/lib/branded-image';
import styles from '@/components/blog/Blog.module.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'en' ? 'CNC knowledge and field guides | Elecio' : 'دانش CNC و راهنماهای عملی | Elecio',
    description: locale === 'en'
      ? 'Practical CNC networking, file transfer, controller, and workshop operations guides from Elecio.'
      : 'راهنماهای عملی شبکه CNC، انتقال فایل، کنترلرها و عملیات کارگاهی از Elecio.',
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { fa: '/fa/blog', en: '/en/blog', 'x-default': '/fa/blog' },
    },
  };
}

export default async function BlogPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  const en = locale === 'en';
  const [posts, categories] = await Promise.all([
    listPublishedPosts(locale, category),
    knex('categories').select('slug', en ? 'name_en as name' : 'name_fa as name').orderBy('sort_order'),
  ]);
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const hasMorePosts = posts.length > 12;

  return (
    <main className={styles.index}>
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>Elecio journal</span>
          <h1>{en ? 'Clearer CNC work.' : 'کار روشن‌تر با CNC.'}</h1>
          <p className={styles.muted}>
            {en
              ? 'Field-tested guides for controllers, shop-floor networking, transfer reliability, and production visibility.'
              : 'راهنماهای آزموده‌شده برای کنترلرها، شبکه کارگاه، انتقال مطمئن فایل و دید بهتر تولید.'}
          </p>
        </header>

        {categories.length > 0 && (
          <nav className={styles.filters} aria-label={en ? 'Topics' : 'موضوع‌ها'}>
            <Link href="/blog" aria-current={!category ? 'page' : undefined}>{en ? 'All' : 'همه'}</Link>
            {categories.map((item) => (
              <Link
                key={item.slug}
                href={`/blog?category=${item.slug}`}
                aria-current={category === item.slug ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}

        <div className={styles.listToolbar}>
          <strong>{en ? 'Latest articles' : 'تازه‌ترین مقاله‌ها'}</strong>
          <span id="blog-scroll-hint">
            {hasMorePosts
              ? (en ? 'Scroll this section for more' : 'برای دیدن مطالب بیشتر، این بخش را اسکرول کنید')
              : `${posts.length.toLocaleString(locale)} ${en ? 'articles' : 'مطلب'}`}
          </span>
        </div>

        <section
          className={styles.grid}
          aria-label={en ? 'Latest articles' : 'تازه‌ترین مقاله‌ها'}
          aria-describedby="blog-scroll-hint"
          tabIndex={posts.length > 0 ? 0 : undefined}
        >
          {posts.map((post, index) => (
            <article className={styles.card} key={post.id}>
              <Link className={styles.cardLink} href={`/blog/${post.slug}`}>
                <div className={styles.media}>
                  {post.cover_image_path ? (
                    <Image
                      className={styles.cover}
                      src={brandedImagePath(post.cover_image_path)}
                      alt={post.title}
                      width={640}
                      height={360}
                      sizes="(max-width: 460px) 100vw, (max-width: 820px) 50vw, (max-width: 1150px) 33vw, 25vw"
                      priority={index < 2}
                      unoptimized
                    />
                  ) : (
                    <span className={styles.coverFallback} aria-hidden="true">E</span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span>{post.category_name ?? (en ? 'Guide' : 'راهنما')}</span>
                    <time dateTime={new Date(post.published_at).toISOString()}>
                      {dateFormatter.format(new Date(post.published_at))}
                    </time>
                  </div>
                  <h2>{post.title}</h2>
                  <p className={styles.muted}>{post.excerpt}</p>
                  <span className={styles.cardAction}>
                    {en ? 'Read article' : 'مطالعه مقاله'}
                    <span aria-hidden="true">{en ? '→' : '←'}</span>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </section>

        {posts.length === 0 && (
          <div className={styles.empty}>
            <h2>{en ? 'No published guides yet' : 'هنوز راهنمایی منتشر نشده است'}</h2>
            <p className={styles.muted}>
              {en ? 'Published, reviewed articles will appear here.' : 'مقاله‌های بررسی و منتشرشده اینجا نمایش داده می‌شوند.'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
