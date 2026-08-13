'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import styles from './Admin.module.css';

type Row = Record<string, string | number | boolean | null> & { id: number };
type Kind = 'category' | 'tag' | 'partner' | 'testimonial';

function payload(kind: Kind, form: FormData, id?: number) {
  const body: Record<string, FormDataEntryValue | boolean | number> = Object.fromEntries(form.entries());
  body.kind = kind;
  if (id) body.id = id;
  if (kind === 'partner' || kind === 'testimonial') body.isActive = form.has('isActive');
  return body;
}

function Fields({ kind, row, en }: { kind: Kind; row?: Row; en: boolean }) {
  if (kind === 'category' || kind === 'tag') return <>
    <input className={styles.input} name="slug" dir="ltr" defaultValue={String(row?.slug ?? '')} placeholder={kind === 'category' ? 'cnc-guides' : 'fanuc'} required />
    <input className={styles.input} name="nameFa" defaultValue={String(row?.name_fa ?? '')} placeholder="نام فارسی" required />
    <input className={styles.input} name="nameEn" defaultValue={String(row?.name_en ?? '')} placeholder="English name" required />
    {kind === 'category' && <input className={styles.input} name="sortOrder" type="number" defaultValue={Number(row?.sort_order ?? 0)} placeholder={en ? 'Sort order' : 'ترتیب'} />}
  </>;
  if (kind === 'partner') return <>
    <input className={styles.input} name="name" defaultValue={String(row?.name ?? '')} placeholder={en ? 'Partner name' : 'نام همکار'} required />
    <input className={styles.input} name="logoPath" dir="ltr" defaultValue={String(row?.logo_path ?? '')} placeholder="/partners/logo.webp" required />
    <input className={styles.input} name="websiteUrl" dir="ltr" type="url" defaultValue={String(row?.website_url ?? '')} placeholder="https://" />
    <input className={styles.input} name="sortOrder" type="number" defaultValue={Number(row?.sort_order ?? 0)} placeholder={en ? 'Sort order' : 'ترتیب'} />
    <label><input name="isActive" type="checkbox" defaultChecked={row ? Boolean(row.is_active) : true} /> {en ? 'Visible' : 'نمایش داده شود'}</label>
  </>;
  return <>
    <input className={styles.input} name="customerName" defaultValue={String(row?.customer_name ?? '')} placeholder={en ? 'Customer name' : 'نام مشتری'} required />
    <input className={styles.input} name="companyName" defaultValue={String(row?.company_name ?? '')} placeholder={en ? 'Company' : 'شرکت'} />
    <textarea className={styles.textarea} name="quoteFa" defaultValue={String(row?.quote_fa ?? '')} placeholder="متن فارسی" />
    <textarea className={styles.textarea} name="quoteEn" defaultValue={String(row?.quote_en ?? '')} placeholder="English quote" />
    <input className={styles.input} name="videoUrl" dir="ltr" type="url" defaultValue={String(row?.video_url ?? '')} placeholder="https://www.aparat.com/..." />
    <input className={styles.input} name="avatarPath" dir="ltr" defaultValue={String(row?.avatar_path ?? '')} placeholder="/images/customer.webp" />
    <input className={styles.input} name="sortOrder" type="number" defaultValue={Number(row?.sort_order ?? 0)} placeholder={en ? 'Sort order' : 'ترتیب'} />
    <label><input name="isActive" type="checkbox" defaultChecked={row ? Boolean(row.is_active) : true} /> {en ? 'Visible' : 'نمایش داده شود'}</label>
  </>;
}

export function ContentLibraryManager({ locale, data }: { locale: string; data: Record<Kind, Row[]> }) {
  const en = locale === 'en';
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  async function save(kind: Kind, event: FormEvent<HTMLFormElement>, id?: number) {
    event.preventDefault();
    const key = id ? `${kind}-${id}` : kind;
    setBusy(key); setMessage('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/content-library', {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload(kind, form, id)),
    });
    const result = await response.json();
    setBusy('');
    if (!response.ok) {
      setMessage(`${en ? 'Could not save' : 'ذخیره انجام نشد'}: ${result.error}`);
      return;
    }
    if (!id) event.currentTarget.reset();
    setMessage(en ? 'Changes saved.' : 'تغییرات ذخیره شد.');
    router.refresh();
  }

  async function remove(kind: Kind, id: number) {
    if (!window.confirm(en ? 'Delete this item? Existing article relationships may be detached.' : 'این مورد حذف شود؟ ممکن است ارتباط آن با مقاله‌ها برداشته شود.')) return;
    setBusy(`${kind}-${id}`);
    const response = await fetch('/api/admin/content-library', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, id }),
    });
    setBusy('');
    if (response.ok) router.refresh();
    else setMessage(en ? 'Delete failed.' : 'حذف انجام نشد.');
  }

  const title = (kind: Kind) => ({
    category: en ? 'Categories' : 'دسته‌بندی‌ها', tag: en ? 'Tags' : 'برچسب‌ها',
    partner: en ? 'Partners' : 'همکاران', testimonial: en ? 'Testimonials' : 'نظرات مشتریان',
  })[kind];
  const label = (kind: Kind, row: Row) => kind === 'category' || kind === 'tag'
    ? `${row.name_fa} / ${row.name_en} · ${row.slug}`
    : kind === 'partner' ? String(row.name) : `${row.customer_name}${row.company_name ? ` · ${row.company_name}` : ''}`;

  return <>
    {message && <p className={styles.status} role="status">{message}</p>}
    <div className={styles.libraryGrid}>{(['category', 'tag', 'partner', 'testimonial'] as Kind[]).map(kind => <section className={styles.card} key={kind}>
      <h2>{title(kind)}</h2>
      <form className={styles.form} onSubmit={event => save(kind, event)}>
        <Fields kind={kind} en={en} />
        <button className={styles.button} disabled={busy === kind}>{en ? `Add ${kind}` : 'افزودن'}</button>
      </form>
      <div className={styles.compactList}>{data[kind].map(row => <details className={styles.listItem} key={row.id}>
        <summary>{label(kind, row)}</summary>
        <form className={styles.form} onSubmit={event => save(kind, event, row.id)}>
          <Fields kind={kind} row={row} en={en} />
          <div className={styles.actions}>
            <button className={styles.button} disabled={busy === `${kind}-${row.id}`}>{en ? 'Save changes' : 'ذخیره تغییرات'}</button>
            <button type="button" className={`${styles.button} ${styles.danger}`} disabled={busy === `${kind}-${row.id}`} onClick={() => remove(kind, row.id)}>{en ? 'Delete' : 'حذف'}</button>
          </div>
        </form>
      </details>)}</div>
    </section>)}</div>
  </>;
}
