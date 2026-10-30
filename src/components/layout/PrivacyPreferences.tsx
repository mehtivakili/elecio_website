'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ANALYTICS_CONSENT_KEY } from '@/lib/telemetry';
import styles from './PrivacyPreferences.module.css';

export function PrivacyPreferences() {
  const locale = useLocale();
  const [choice, setChoice] = useState<string | null>('loading');
  useEffect(() => {
    queueMicrotask(() => setChoice(window.localStorage.getItem(ANALYTICS_CONSENT_KEY)));
  }, []);
  const fa = locale === 'fa';
  if (choice === 'loading') return null;
  if (choice) {
    return <button type="button" className={styles.manage} onClick={() => { window.localStorage.removeItem(ANALYTICS_CONSENT_KEY); setChoice(null); }}>{fa ? 'تنظیم حریم خصوصی' : 'Privacy settings'}</button>;
  }
  const choose = (value: 'granted' | 'denied') => {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    setChoice(value);
  };
  return (
    <aside className={styles.banner} aria-label={fa ? 'تنظیمات حریم خصوصی' : 'Privacy preferences'}>
      <p>{fa ? 'بازدید صفحات را بدون کوکی و به‌صورت ناشناس می‌شماریم؛ هیچ IP، شماره، ایمیل یا حساب کاربری ذخیره نمی‌شود. با اجازه شما، اقدام‌هایی مثل دانلود و ارسال پیام را هم به‌صورت ناشناس می‌شماریم. «فقط ضروری» هر دو را غیرفعال می‌کند.' : 'We count page visits anonymously, without cookies. No IP address, phone number, email or account is stored. With your permission, we also count anonymous actions such as downloads and contact requests. “Necessary only” turns both off.'}</p>
      <div>
        <button type="button" onClick={() => choose('denied')}>{fa ? 'فقط ضروری' : 'Necessary only'}</button>
        <button type="button" className={styles.accept} onClick={() => choose('granted')}>{fa ? 'اجازه آمار ناشناس' : 'Allow anonymous metrics'}</button>
      </div>
    </aside>
  );
}
