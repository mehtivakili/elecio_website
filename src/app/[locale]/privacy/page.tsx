import type { Metadata } from 'next';
import styles from '@/components/account/Account.module.css';
import { localizedPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === 'en' ? 'Privacy Notice | Elecio' : 'اطلاعیه حریم خصوصی | Elecio';
  const description = locale === 'en'
    ? 'How Elecio processes account, session, and support data, and how to review or delete it.'
    : 'نحوه پردازش داده‌های حساب، نشست و پشتیبانی توسط Elecio و روش بازبینی یا حذف آن.';
  return localizedPageMetadata(locale, 'privacy', title, description);
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: 'fa' | 'en' }> }) { const { locale } = await params; const en = locale === 'en'; return <main className={styles.page}><article className={`${styles.shell} ${styles.card}`}><span className={styles.eyebrow}>2026-08-13</span><h1>{en ? 'Privacy Notice' : 'اطلاعیه حریم خصوصی'}</h1><p>{en ? 'Elecio processes your mobile number for secure sign-in, your profile details when provided, consent evidence, active sessions, requested downloads, and support history. Security logs use minimized or keyed hashes where configured; OTP codes are never stored by Elecio application code or written to logs.' : 'Elecio شماره موبایل را برای ورود امن، مشخصات اختیاری پروفایل، شواهد رضایت، نشست‌های فعال، دانلودهای درخواستی و سوابق پشتیبانی پردازش می‌کند. گزارش‌های امنیتی در صورت پیکربندی از هش حداقلی و کلیددار استفاده می‌کنند؛ کد یک‌بارمصرف در کد برنامه Elecio ذخیره یا در گزارش‌ها نوشته نمی‌شود.'}</p><p>{en ? 'You can review profile, consent, history, and sessions in your account and submit or cancel a deletion request. Operational retention and deletion are subject to legal and security obligations.' : 'در حساب خود می‌توانید پروفایل، رضایت‌ها، سوابق و نشست‌ها را ببینید و درخواست حذف را ثبت یا لغو کنید. نگهداری و حذف عملیاتی تابع تعهدات قانونی و امنیتی است.'}</p></article></main>; }
