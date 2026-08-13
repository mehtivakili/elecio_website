'use client';
import { FormEvent, useState } from 'react';
import styles from './Account.module.css';

export function ProfileForm({ initial, locale }: { initial: { name: string; companyName: string | null; phoneNumber: string }; locale: string }) {
  const en = locale === 'en'; const [name, setName] = useState(initial.name); const [company, setCompany] = useState(initial.companyName ?? ''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function save(event: FormEvent) { event.preventDefault(); setBusy(true); setMessage(''); const response = await fetch('/api/account/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, companyName: company, locale }) }); setMessage(response.ok ? (en ? 'Profile saved.' : 'پروفایل ذخیره شد.') : (en ? 'Could not save profile.' : 'ذخیره پروفایل ممکن نشد.')); setBusy(false); }
  return <form className={styles.form} onSubmit={save}><label className={styles.label}>{en ? 'Name' : 'نام'}<input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} maxLength={160} required /></label><label className={styles.label}>{en ? 'Company' : 'شرکت'}<input className={styles.input} value={company} onChange={(e) => setCompany(e.target.value)} maxLength={200} /></label><label className={styles.label}>{en ? 'Verified mobile' : 'موبایل تأییدشده'}<input className={styles.input} value={initial.phoneNumber} disabled dir="ltr" /></label>{message && <p role="status" className={responseClass(message, en)}>{message}</p>}<button className={styles.button} disabled={busy}>{en ? 'Save profile' : 'ذخیره پروفایل'}</button></form>;
}
function responseClass(message: string, en: boolean) { return message.includes(en ? 'saved' : 'ذخیره شد') ? styles.success : styles.error; }
