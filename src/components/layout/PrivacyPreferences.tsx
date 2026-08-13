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
      <p>{fa ? 'با اجازه شما فقط آمار کلی و ناشناسِ اقدام‌ها را می‌شماریم؛ هیچ شماره، ایمیل یا شناسه‌ای ثبت نمی‌شود.' : 'With your permission, we count anonymous aggregate actions only. No phone, email, user, session, or device identifier is stored.'}</p>
      <div>
        <button type="button" onClick={() => choose('denied')}>{fa ? 'فقط ضروری' : 'Necessary only'}</button>
        <button type="button" className={styles.accept} onClick={() => choose('granted')}>{fa ? 'اجازه آمار ناشناس' : 'Allow anonymous metrics'}</button>
      </div>
    </aside>
  );
}
