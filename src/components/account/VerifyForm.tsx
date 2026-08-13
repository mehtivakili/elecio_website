'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import styles from './Account.module.css';

export function VerifyForm({ locale, initialIntent, maskedPhone }: { locale: string; initialIntent: string; maskedPhone: string }) {
  const en = locale === 'en'; const router = useRouter();
  const [intent, setIntent] = useState(initialIntent); const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(60); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => { if (seconds <= 0) return; const timer = window.setInterval(() => setSeconds((v) => v - 1), 1000); return () => clearInterval(timer); }, [seconds]);
  async function verify(event: FormEvent) { event.preventDefault(); setBusy(true); setError(''); try {
    const response = await fetch('/api/customer-auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intentId: intent, code }) });
    if (!response.ok) throw new Error(en ? 'The code is invalid or expired.' : 'کد نادرست یا منقضی شده است.');
    router.replace('/account'); router.refresh();
  } catch (cause) { setError(cause instanceof Error ? cause.message : 'Error'); } finally { setBusy(false); } }
  async function resend() { setBusy(true); setError(''); try { const response = await fetch('/api/customer-auth/resend-otp', { method: 'POST' }); const result = await response.json(); if (!response.ok) throw new Error(en ? 'A new code could not be sent yet.' : 'هنوز امکان ارسال کد جدید نیست.'); setIntent(result.intentId); setSeconds(60); setCode(''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Error'); } finally { setBusy(false); } }
  return <form className={styles.form} onSubmit={verify}>
    <p className={styles.muted}>{en ? `Code sent to ${maskedPhone}` : `کد به ${maskedPhone} ارسال شد`}</p>
    <label className={styles.label}>{en ? 'Six-digit code' : 'کد شش‌رقمی'}<input className={`${styles.input} ${styles.otp}`} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9۰-۹٠-٩]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} autoFocus required /></label>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <button className={styles.button} disabled={busy || code.length !== 6}>{busy ? (en ? 'Checking…' : 'در حال بررسی…') : (en ? 'Verify and continue' : 'تأیید و ادامه')}</button>
    <div className={styles.row}><a className={`${styles.button} ${styles.secondary}`} href={`/${locale}/login`}>{en ? 'Edit number' : 'ویرایش شماره'}</a><button type="button" className={`${styles.button} ${styles.secondary}`} disabled={busy || seconds > 0} onClick={resend}>{seconds > 0 ? `${en ? 'Resend in' : 'ارسال مجدد تا'} ${seconds}` : (en ? 'Resend code' : 'ارسال دوباره کد')}</button></div>
  </form>;
}
