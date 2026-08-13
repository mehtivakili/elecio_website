import type { Metadata } from 'next';
import { VerifyForm } from '@/components/account/VerifyForm';
import styles from '@/components/account/Account.module.css';
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function VerifyPage({ params, searchParams }: { params: Promise<{ locale: 'fa' | 'en' }>; searchParams: Promise<{ intent?: string; phone?: string }> }) { const { locale } = await params; const query = await searchParams; const en = locale === 'en'; return <main className={styles.page}><section className={styles.authCard}><span className={styles.eyebrow}>{en ? 'Verification' : 'تأیید شماره'}</span><h1 className={styles.title}>{en ? 'Enter your secure code' : 'کد امن را وارد کنید'}</h1><VerifyForm locale={locale} initialIntent={query.intent ?? ''} maskedPhone={query.phone ?? ''} /></section></main>; }
