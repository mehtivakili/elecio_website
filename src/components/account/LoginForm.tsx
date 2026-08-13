'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import styles from './Account.module.css';

export function LoginForm({ locale }: { locale: string }) {
  const en = locale === 'en';
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/customer-auth/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: phone, locale, acceptTerms: terms, acceptPrivacy: privacy }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error === 'rate_limited' ? (en ? 'Please wait before requesting another code.' : 'لطفاً پیش از درخواست دوباره کمی صبر کنید.') : (en ? 'We could not send the code. Try again shortly.' : 'ارسال کد ممکن نشد. کمی بعد دوباره تلاش کنید.'));
      router.push(`/verify?intent=${encodeURIComponent(result.intentId)}&phone=${encodeURIComponent(result.maskedPhone)}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Error'); } finally { setBusy(false); }
  }
  return <form className={styles.form} onSubmit={submit}>
    <label className={styles.label}>{en ? 'Mobile number' : 'شماره موبایل'}
      <input className={styles.input} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912 123 4567" required />
    </label>
    <label className={styles.check}><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} required /><span>{en ? 'I accept the Terms of Service.' : 'شرایط استفاده را می‌پذیرم.'} <a href={`/${locale}/terms`} target="_blank">{en ? 'Read terms' : 'مطالعه شرایط'}</a></span></label>
    <label className={styles.check}><input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} required /><span>{en ? 'I accept the Privacy Notice.' : 'اطلاعیه حریم خصوصی را می‌پذیرم.'} <a href={`/${locale}/privacy`} target="_blank">{en ? 'Read privacy notice' : 'مطالعه حریم خصوصی'}</a></span></label>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <button className={styles.button} disabled={busy || !terms || !privacy}>{busy ? (en ? 'Sending…' : 'در حال ارسال…') : (en ? 'Continue with a code' : 'ادامه با کد یک‌بارمصرف')}</button>
  </form>;
}
