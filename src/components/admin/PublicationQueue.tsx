'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import styles from './Admin.module.css';

type QueuePost = {
  id: number;
  title: string;
  slug: string;
  status: string;
  revision: number;
  translationStatus: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  queueActive: boolean;
  canQueue: boolean;
  missing: string[];
};

const missingLabels: Record<string, string> = {
  slug: 'آدرس', title_fa: 'عنوان فارسی', body_fa: 'متن فارسی', focus_keyword_fa: 'کیورد اصلی',
  seo_title_fa: 'عنوان سئو', seo_description_fa: 'توضیح سئو', category_id: 'دسته‌بندی',
  cover_image_path: 'تصویر شاخص', cover_alt_fa: 'متن جایگزین تصویر', body_images: 'دو تصویر داخل متن',
  body_image_alt: 'متن جایگزین تصاویر متن', robots_index: 'اجازه ایندکس', translation_status: 'نسخه فارسی',
};

function initialSchedule(value: string | null, cadence: number) {
  const date = value ? new Date(value) : new Date(Date.now() + cadence * 86_400_000);
  const offset = date.getTimezoneOffset() * 60_000;
  const local = new Date(date.getTime() - offset).toISOString();
  return { date: local.slice(0, 10), time: value ? local.slice(11, 16) : '09:00' };
}

export function PublicationQueue({ locale, publishedPosts, draftPosts, cadenceDays, firstPublishAt }: {
  locale: string;
  publishedPosts: QueuePost[];
  draftPosts: QueuePost[];
  cadenceDays: 2 | 3 | 4;
  firstPublishAt: string | null;
}) {
  const en = locale === 'en';
  const router = useRouter();
  const initial = initialSchedule(firstPublishAt, cadenceDays);
  const [cadence, setCadence] = useState(cadenceDays);
  const [firstDate, setFirstDate] = useState(initial.date);
  const [firstTime, setFirstTime] = useState(initial.time);
  const [busy, setBusy] = useState<number | 'settings' | null>(null);
  const [message, setMessage] = useState('');

  function selectedFirstPublishAt() {
    return new Date(`${firstDate}T${firstTime}`).toISOString();
  }

  async function update(payload: Record<string, unknown>, key: number | 'settings') {
    setBusy(key);
    setMessage('');
    const response = await fetch('/api/admin/cms/publication-queue', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      const missing = Array.isArray(result.missing) ? result.missing.map((item: string) => missingLabels[item] ?? item).join('، ') : result.error;
      setMessage(en ? `Queue update failed: ${missing}` : `به‌روزرسانی صف ممکن نشد: ${missing}`);
    } else {
      setMessage(en ? 'Publication schedule updated.' : 'زمان‌بندی انتشار به‌روزرسانی شد.');
      router.refresh();
    }
    setBusy(null);
  }

  function updateQueue(postId: number, active: boolean) {
    return update({ id: postId, active, cadenceDays: cadence, firstPublishAt: selectedFirstPublishAt() }, postId);
  }

  const formatDate = (value: string | null) => value
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : '—';

  return <div className={styles.contentSections}>
    <section>
      <div className={styles.sectionHead}>
        <div><span className={styles.eyebrow}>Published</span><h2>{en ? 'Published articles' : 'مطالب منتشرشده'}</h2></div>
        <span className={styles.countBadge}>{publishedPosts.length.toLocaleString(locale)}</span>
      </div>
      <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>#</th><th>{en ? 'Title' : 'عنوان'}</th><th>{en ? 'Published at' : 'زمان انتشار'}</th><th>{en ? 'Revision' : 'نسخه'}</th><th></th></tr></thead><tbody>
        {publishedPosts.map((post) => <tr key={post.id}><td>{post.id}</td><td><strong>{post.title}</strong><br/><small dir="ltr">/{locale}/blog/{post.slug}</small></td><td><span className={`${styles.status} ${styles.publishedStatus}`}>{en ? 'Published' : 'منتشرشده'}</span><br/><small>{formatDate(post.publishedAt ?? post.scheduledFor)}</small></td><td>{post.revision}</td><td><div className={styles.actions}><a className={`${styles.button} ${styles.secondary}`} href={`/${locale}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">{en ? 'View' : 'مشاهده'}</a><a className={`${styles.button} ${styles.secondary}`} href={`/${locale}/admin/content/${post.id}`}>{en ? 'Edit' : 'ویرایش'}</a></div></td></tr>)}
      </tbody></table>{publishedPosts.length === 0 && <p className={styles.emptyState}>{en ? 'No article has been published yet.' : 'هنوز مطلبی منتشر نشده است.'}</p>}</div>
    </section>

    <section className={styles.card}>
      <div className={styles.queueHeader}>
        <div><span className={styles.eyebrow}>Publication automation</span><h2>{en ? 'Queue schedule' : 'تنظیمات صف انتشار'}</h2><p className={styles.muted}>{en ? 'Choose the first date and time. Every active draft is published automatically at the selected interval.' : 'تاریخ و ساعت اولین انتشار را مشخص کنید؛ هر پیش‌نویسی که تاگل صف آن روشن باشد با فاصله انتخاب‌شده خودکار منتشر می‌شود.'}</p></div>
        <div className={styles.queueControls}>
          <label className={styles.label}>{en ? 'Interval' : 'فاصله انتشار'}<select className={styles.select} value={cadence} onChange={(event) => setCadence(Number(event.target.value) as 2 | 3 | 4)}><option value={2}>{en ? 'Every 2 days' : 'هر ۲ روز'}</option><option value={3}>{en ? 'Every 3 days' : 'هر ۳ روز'}</option><option value={4}>{en ? 'Every 4 days' : 'هر ۴ روز'}</option></select></label>
          <label className={styles.label}>{en ? 'First date' : 'تاریخ اولین انتشار'}<input className={styles.input} type="date" value={firstDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setFirstDate(event.target.value)} /></label>
          <label className={styles.label}>{en ? 'Publish time' : 'ساعت انتشار'}<input className={styles.input} type="time" value={firstTime} onChange={(event) => setFirstTime(event.target.value)} /></label>
          <button className={styles.button} disabled={busy !== null || !firstDate || !firstTime} onClick={() => update({ cadenceDays: cadence, firstPublishAt: selectedFirstPublishAt() }, 'settings')}>{en ? 'Save schedule' : 'ذخیره تنظیمات'}</button>
        </div>
      </div>
      {message && <p className={styles.status} role="status">{message}</p>}
    </section>

    <section>
      <div className={styles.sectionHead}>
        <div><span className={styles.eyebrow}>Drafts</span><h2>{en ? 'Unpublished drafts' : 'پیش‌نویس‌های منتشرنشده'}</h2><p className={styles.muted}>{en ? 'Turn on the queue for drafts that should be published automatically.' : 'برای مطالبی که باید خودکار منتشر شوند، تاگل صف فعال را روشن کنید.'}</p></div>
        <span className={styles.countBadge}>{draftPosts.length.toLocaleString(locale)}</span>
      </div>
      <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>#</th><th>{en ? 'Draft' : 'پیش‌نویس'}</th><th>Slug</th><th>{en ? 'Scheduled publication' : 'نوبت انتشار'}</th><th>{en ? 'Active queue' : 'صف فعال'}</th><th></th></tr></thead><tbody>
        {draftPosts.map((post) => {
          const toggleDisabled = busy !== null || !post.canQueue || (!post.queueActive && post.missing.length > 0) || !firstDate || !firstTime;
          const toggleTitle = post.missing.length > 0 && !post.queueActive
            ? (en ? `Complete required fields: ${post.missing.join(', ')}` : `ابتدا موارد ضروری را کامل کنید: ${post.missing.map((item) => missingLabels[item] ?? item).join('، ')}`)
            : undefined;
          return <tr key={post.id}><td>{post.id}</td><td><strong>{post.title}</strong><br/><small>{post.translationStatus} · {en ? 'revision' : 'نسخه'} {post.revision}</small>{post.missing.length > 0 && !post.queueActive && post.canQueue && <small className={styles.queueMissing}>{en ? `Missing: ${post.missing.join(', ')}` : `نیازمند: ${post.missing.map((item) => missingLabels[item] ?? item).join('، ')}`}</small>}</td><td dir="ltr">{post.slug}</td><td>{post.scheduledFor ? <><span className={styles.status}>{post.queueActive ? (en ? 'Queued' : 'در صف') : (en ? 'Manually scheduled' : 'زمان‌بندی دستی')}</span><br/><small>{formatDate(post.scheduledFor)}</small></> : <span className={styles.muted}>—</span>}</td><td><label className={`${styles.switchLabel} ${toggleDisabled ? styles.switchDisabled : ''}`} title={toggleTitle}><input className={styles.switchInput} type="checkbox" role="switch" aria-label={en ? `Automatic publication for ${post.title}` : `انتشار خودکار ${post.title}`} checked={post.queueActive} disabled={toggleDisabled} onChange={(event) => updateQueue(post.id, event.target.checked)} /><span className={styles.switchTrack} aria-hidden="true"><span className={styles.switchThumb} /></span><span className={styles.switchText}>{busy === post.id ? (en ? 'Saving…' : 'در حال ذخیره…') : post.queueActive ? (en ? 'Active' : 'فعال') : post.canQueue ? (en ? 'Inactive' : 'غیرفعال') : (en ? 'Manual schedule' : 'زمان‌بندی دستی')}</span></label></td><td><a className={`${styles.button} ${styles.secondary}`} href={`/${locale}/admin/content/${post.id}`}>{en ? 'Edit' : 'ویرایش'}</a></td></tr>;
        })}
      </tbody></table>{draftPosts.length === 0 && <p className={styles.emptyState}>{en ? 'There are no unpublished drafts.' : 'پیش‌نویس منتشرنشده‌ای وجود ندارد.'}</p>}</div>
    </section>
  </div>;
}
