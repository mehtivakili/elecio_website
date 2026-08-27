import { Link } from '@/i18n/navigation';
import { PublicationQueue } from '@/components/admin/PublicationQueue';
import styles from '@/components/admin/Admin.module.css';
import { requireStaffPermission } from '@/server/auth/staff-flow';
import { persianQueueReadiness } from '@/server/content/publication-queue';
import { knex } from '@/server/db/knex';
import { publicationQueueSchemaReady } from '@/server/db/publication-queue-schema';

export default async function Content({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const en = locale === 'en';
  await requireStaffPermission('content', 'read');
  const queueSchemaReady = await publicationQueueSchemaReady(knex);
  const postColumns = [
    'id', 'slug', 'title_fa', 'title_en', 'body_fa', 'status', 'translation_status',
    'current_revision_number', 'scheduled_for', 'focus_keyword_fa', 'seo_title_fa',
    'seo_description_fa', 'category_id', 'cover_image_path', 'cover_alt_fa', 'robots_index',
  ];
  if (queueSchemaReady) postColumns.push('publication_queue_active');
  const [rows, settings, categories, tags, partners, testimonials] = await Promise.all([
    knex('posts').select(...postColumns).orderBy('updated_at', 'desc').limit(100),
    queueSchemaReady ? knex('publication_queue_settings').where({ id: 1 }).first() : Promise.resolve(null),
    knex('categories').count<{ count: string }[]>('* as count').first(),
    knex('tags').count<{ count: string }[]>('* as count').first(),
    knex('partners').count<{ count: string }[]>('* as count').first(),
    knex('testimonials').count<{ count: string }[]>('* as count').first(),
  ]);
  const now = new Date();
  const posts = rows.map((post) => {
    const queueActive = Boolean(post.publication_queue_active && post.scheduled_for && new Date(post.scheduled_for) > now);
    return {
      id: post.id, slug: post.slug, title: en ? post.title_en : post.title_fa, status: post.status,
      revision: post.current_revision_number, translationStatus: post.translation_status,
      scheduledFor: post.scheduled_for ? new Date(post.scheduled_for).toISOString() : null,
      queueActive, canQueue: queueActive || post.status === 'draft', missing: persianQueueReadiness(post),
    };
  });
  const firstQueued = posts.filter((post) => post.queueActive && post.scheduledFor).sort((a, b) => String(a.scheduledFor).localeCompare(String(b.scheduledFor)))[0];
  const cadence = [2, 3, 4].includes(Number(settings?.cadence_days)) ? Number(settings.cadence_days) as 2 | 3 | 4 : 3;
  const firstPublishAt = firstQueued?.scheduledFor ?? (settings?.first_publish_at ? new Date(settings.first_publish_at).toISOString() : null);

  return <>
    <header className={styles.head}><span className={styles.eyebrow}>Editorial</span><h1>{en ? 'Content operations' : 'عملیات محتوا'}</h1><p className={styles.muted}>{en ? 'Draft, review, queue, and publish articles with explicit SEO controls.' : 'پیش‌نویس، بازبینی، صف‌بندی و انتشار مقاله با کنترل شفاف سئو.'}</p><Link className={styles.button} href="/admin/content/new">{en ? 'New article' : 'مقاله جدید'}</Link></header>
    <div className={styles.grid}>{[[en ? 'Categories' : 'دسته‌ها', categories?.count], [en ? 'Tags' : 'برچسب‌ها', tags?.count], [en ? 'Partners' : 'همکاران', partners?.count], [en ? 'Testimonials' : 'نظرات مشتریان', testimonials?.count]].map(([label, value]) => <article className={styles.card} key={label}><span>{label}</span><strong className={styles.metric}>{value ?? 0}</strong></article>)}</div>
    <div style={{ marginTop: '1rem' }}>{queueSchemaReady
      ? <PublicationQueue locale={locale} posts={posts} cadenceDays={cadence} firstPublishAt={firstPublishAt} />
      : <section className={styles.card} role="status"><strong>{en ? 'Publication queue unavailable' : 'صف انتشار هنوز فعال نیست'}</strong><p className={styles.muted}>{en ? 'Run the pending database migration with the dedicated migrator credential.' : 'مایگریشن دیتابیس را با حساب اختصاصی migrator اجرا کنید؛ سایر بخش‌های مدیریت محتوا همچنان قابل استفاده‌اند.'}</p></section>}
    </div>
  </>;
}
