'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import styles from './Admin.module.css';

type QueuePost = {
  id: number; title: string; slug: string; status: string; revision: number;
  translationStatus: string; scheduledFor: string | null; queueActive: boolean; canQueue: boolean; missing: string[];
};

const missingLabels: Record<string, string> = {
  slug: 'آدرس', title_fa: 'عنوان فارسی', body_fa: 'متن فارسی', focus_keyword_fa: 'کیورد اصلی',
  seo_title_fa: 'عنوان سئو', seo_description_fa: 'توضیح سئو', category_id: 'دسته‌بندی',
  cover_image_path: 'تصویر شاخص', cover_alt_fa: 'متن جایگزین تصویر', robots_index: 'اجازه ایندکس', translation_status: 'نسخه فارسی',
};

function localInputValue(value: string | null) {
  const date = value ? new Date(value) : new Date(Date.now() + 3 * 86_400_000);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function PublicationQueue({ locale, posts, cadenceDays, firstPublishAt }: {
  locale: string; posts: QueuePost[]; cadenceDays: 2 | 3 | 4; firstPublishAt: string | null;
}) {
  const en = locale === 'en';
  const router = useRouter();
  const [cadence, setCadence] = useState(cadenceDays);
  const [first, setFirst] = useState(localInputValue(firstPublishAt));
  const [busy, setBusy] = useState<number | 'settings' | null>(null);
  const [message, setMessage] = useState('');

  async function update(payload: Record<string, unknown>, key: number | 'settings') {
    setBusy(key); setMessage('');
    const response = await fetch('/api/admin/cms/publication-queue', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      const missing = Array.isArray(result.missing) ? result.missing.map((item: string) => missingLabels[item] ?? item).join('، ') : result.error;
      setMessage(en ? `Queue update failed: ${missing}` : `افزودن به صف ممکن نشد: ${missing}`);
    } else {
      setMessage(en ? 'Publication queue updated.' : 'صف انتشار به‌روزرسانی شد.');
      router.refresh();
    }
    setBusy(null);
  }

  return <>
    <section className={styles.card}>
      <div className={styles.queueHeader}>
        <div><span className={styles.eyebrow}>Publication automation</span><h2>{en ? 'Active publication queue' : 'صف فعال انتشار'}</h2><p className={styles.muted}>{en ? 'The first item publishes at the selected time; each next item follows after the chosen cadence.' : 'مورد اول در زمان انتخابی منتشر می‌شود و هر مورد بعدی با فاصله تعیین‌شده انتشار می‌یابد.'}</p></div>
        <div className={styles.queueControls}>
          <label className={styles.label}>{en ? 'Cadence' : 'فاصله انتشار'}<select className={styles.select} value={cadence} onChange={(event) => setCadence(Number(event.target.value) as 2 | 3 | 4)}><option value={2}>{en ? 'Every 2 days' : 'هر ۲ روز'}</option><option value={3}>{en ? 'Every 3 days' : 'هر ۳ روز'}</option><option value={4}>{en ? 'Every 4 days' : 'هر ۴ روز'}</option></select></label>
          <label className={styles.label}>{en ? 'First publication' : 'اولین انتشار'}<input className={styles.input} type="datetime-local" value={first} onChange={(event) => setFirst(event.target.value)} /></label>
          <button className={styles.button} disabled={busy !== null} onClick={() => update({ cadenceDays: cadence, firstPublishAt: new Date(first).toISOString() }, 'settings')}>{en ? 'Apply schedule' : 'اعمال زمان‌بندی'}</button>
        </div>
      </div>
      {message && <p className={styles.status} role="status">{message}</p>}
    </section>
      <div className={styles.tableWrap} style={{ marginTop: '1rem' }}><table className={styles.table}><thead><tr><th>#</th><th>{en ? 'Title' : 'عنوان'}</th><th>Slug</th><th>{en ? 'Revision' : 'نسخه'}</th><th>{en ? 'Publication' : 'انتشار'}</th><th>{en ? 'Active queue' : 'صف فعال'}</th><th></th></tr></thead><tbody>{posts.map((post) => <tr key={post.id}><td>{post.id}</td><td><strong>{post.title}</strong><br/><small>{post.translationStatus}</small>{post.missing.length > 0 && !post.queueActive && post.canQueue && <small className={styles.queueMissing}>{en ? `Missing: ${post.missing.join(', ')}` : `نیازمند: ${post.missing.map((item) => missingLabels[item] ?? item).join('، ')}`}</small>}</td><td dir="ltr">{post.slug}</td><td>{post.revision}</td><td><span className={styles.status}>{post.queueActive ? (en ? 'queued' : 'در صف') : post.status}{post.scheduledFor ? ` · ${new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(post.scheduledFor))}` : ''}</span></td><td><label className={styles.switchLabel}><input type="checkbox" checked={post.queueActive} disabled={busy !== null || !post.canQueue || (!post.queueActive && post.missing.length > 0)} onChange={(event) => update({ id: post.id, active: event.target.checked }, post.id)} /><span>{post.queueActive ? (en ? 'Active' : 'فعال') : post.canQueue ? (en ? 'Inactive' : 'غیرفعال') : (en ? 'Published' : 'منتشرشده')}</span></label></td><td><a className={`${styles.button} ${styles.secondary}`} href={`/${locale}/admin/content/${post.id}`}>{en ? 'Edit' : 'ویرایش'}</a></td></tr>)}</tbody></table>{posts.length === 0 && <p className={styles.card}>{en ? 'No posts yet.' : 'هنوز نوشته‌ای وجود ندارد.'}</p>}</div>
  </>;
}
