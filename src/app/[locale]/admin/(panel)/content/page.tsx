import { Link } from '@/i18n/navigation';
import { PublicationQueue } from '@/components/admin/PublicationQueue';
import styles from '@/components/admin/Admin.module.css';
import { requireStaffPermission } from '@/server/auth/staff-flow';
import { persianQueueReadiness, type PublicationCadence } from '@/server/content/publication-queue';
import { knex } from '@/server/db/knex';
import { publicationQueueSchemaReady } from '@/server/db/publication-queue-schema';

export default async function Content({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const en = locale === 'en';
  await requireStaffPermission('content', 'read');
  const queueSchemaReady = await publicationQueueSchemaReady(knex);
  const postColumns = [
    'id', 'slug', 'title_fa', 'title_en', 'body_fa', 'status', 'translation_status',
    'current_revision_number', 'scheduled_for', 'published_at', 'focus_keyword_fa', 'seo_title_fa',
    'seo_description_fa', 'category_id', 'cover_image_path', 'cover_alt_fa', 'robots_index',
  ];
  if (queueSchemaReady) postColumns.push('publication_queue_active');
  const [rows, settings] = await Promise.all([
    knex('posts').select(...postColumns).orderBy('updated_at', 'desc').limit(100),
    queueSchemaReady ? knex('publication_queue_settings').where({ id: 1 }).first() : Promise.resolve(null),
  ]);
  const now = new Date();
  const posts = rows.map((post) => {
    const scheduledFor = post.scheduled_for ? new Date(post.scheduled_for).toISOString() : null;
    const queueActive = Boolean(post.publication_queue_active && scheduledFor && new Date(scheduledFor) > now);
    return {
      id: post.id,
      slug: post.slug,
      title: (en ? post.title_en : post.title_fa) || post.title_fa || post.title_en,
      status: post.status,
      revision: post.current_revision_number,
      translationStatus: post.translation_status,
      scheduledFor,
      publishedAt: post.published_at ? new Date(post.published_at).toISOString() : null,
      queueActive,
      canQueue: queueActive || post.status === 'draft',
      missing: persianQueueReadiness(post),
    };
  });
  const publishedPosts = posts.filter((post) => post.status === 'published' && !post.queueActive && (!post.scheduledFor || new Date(post.scheduledFor) <= now));
  const draftPosts = posts.filter((post) => post.status === 'draft' || Boolean(post.scheduledFor && new Date(post.scheduledFor) > now));
  const firstQueued = draftPosts.filter((post) => post.queueActive && post.scheduledFor).sort((a, b) => String(a.scheduledFor).localeCompare(String(b.scheduledFor)))[0];
  const cadence = [1, 2, 3, 4].includes(Number(settings?.cadence_days)) ? Number(settings.cadence_days) as PublicationCadence : 3;
  const firstPublishAt = firstQueued?.scheduledFor ?? (settings?.first_publish_at ? new Date(settings.first_publish_at).toISOString() : null);
  const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const stats = [
    [en ? 'All articles' : 'کل مطالب', posts.length],
    [en ? 'Published' : 'منتشرشده', publishedPosts.length],
    [en ? 'Unpublished drafts' : 'پیش‌نویس منتشرنشده', draftPosts.length],
    [en ? 'Active queue' : 'صف فعال', draftPosts.filter((post) => post.queueActive).length],
  ] as const;

  return <>
    <header className={styles.head}>
      <span className={styles.eyebrow}>Editorial</span>
      <h1>{en ? 'Content operations' : 'عملیات محتوا'}</h1>
      <p className={styles.muted}>{en ? 'Review published work and schedule unpublished drafts from one page.' : 'مطالب منتشرشده را ببینید و پیش‌نویس‌های منتشرنشده را از همین صفحه زمان‌بندی کنید.'}</p>
      <Link className={styles.button} href="/admin/content/new">{en ? 'New article' : 'مقاله جدید'}</Link>
    </header>
    <div className={styles.grid}>{stats.map(([label, value]) => <article className={styles.card} key={label}><span>{label}</span><strong className={styles.metric}>{value.toLocaleString(locale)}</strong></article>)}</div>
    <div style={{ marginTop: '1rem' }}>{queueSchemaReady
      ? <PublicationQueue locale={locale} publishedPosts={publishedPosts} draftPosts={draftPosts} cadenceDays={cadence} firstPublishAt={firstPublishAt} serverNow={now.toISOString()} serverTimeZone={serverTimeZone} />
      : <section className={styles.card} role="status"><strong>{en ? 'Publication queue unavailable' : 'صف انتشار هنوز فعال نیست'}</strong><p className={styles.muted}>{en ? 'Run the pending database migration with the dedicated migrator credential.' : 'مایگریشن دیتابیس را با حساب اختصاصی migrator اجرا کنید؛ سایر بخش‌های مدیریت محتوا همچنان قابل استفاده‌اند.'}</p></section>}
    </div>
  </>;
}
