import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requirePrincipal } from '@/server/auth/authorization';
import { Link } from '@/i18n/navigation';
import { LogoutButton } from '@/components/account/LogoutButton';
import styles from '@/components/account/Account.module.css';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function AccountLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: value } = await params; const locale = value === 'en' ? 'en' : 'fa'; try { await requirePrincipal(); } catch { redirect(`/${locale}/login`); }
  const en = locale === 'en'; return <main className={styles.page}><div className={styles.shell}><header className={styles.accountHead}><div><span className={styles.eyebrow}>{en ? 'Your Elecio' : 'Elecio شما'}</span><h1 className={styles.title}>{en ? 'Account' : 'حساب کاربری'}</h1></div><LogoutButton locale={locale} /></header><nav className={styles.nav} aria-label={en ? 'Account navigation' : 'ناوبری حساب'}><Link href="/account">{en ? 'Overview' : 'نمای کلی'}</Link><Link href="/account/profile">{en ? 'Profile' : 'پروفایل'}</Link><Link href="/account/security">{en ? 'Security' : 'امنیت'}</Link></nav>{children}</div></main>;
}
