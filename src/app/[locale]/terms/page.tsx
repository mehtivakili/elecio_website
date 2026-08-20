import type { Metadata } from 'next';
import styles from '@/components/account/Account.module.css';
import { localizedPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === 'en' ? 'Terms of Service | Elecio' : 'شرایط استفاده | Elecio';
  const description = locale === 'en'
    ? 'Terms governing use of the Elecio website and customer account.'
    : 'شرایط حاکم بر استفاده از وب‌سایت و حساب مشتری Elecio.';
  return localizedPageMetadata(locale, 'terms', title, description);
}

export default async function TermsPage({ params }: { params: Promise<{ locale: 'fa' | 'en' }> }) { const { locale } = await params; const en = locale === 'en'; return <main className={styles.page}><article className={`${styles.shell} ${styles.card}`}><span className={styles.eyebrow}>2026-08-13</span><h1>{en ? 'Terms of Service' : 'شرایط استفاده'}</h1><p>{en ? 'These terms govern use of the Elecio website and customer account. Use the account lawfully, keep access to your mobile number secure, and do not attempt to disrupt or misuse the service.' : 'این شرایط استفاده از وب‌سایت و حساب مشتری Elecio را تنظیم می‌کند. از حساب به‌شکل قانونی استفاده کنید، دسترسی به شماره موبایل خود را امن نگه دارید و برای اختلال یا سوءاستفاده از سرویس تلاش نکنید.'}</p><p>{en ? 'Product specifications and availability may change. A commercial order is governed by its signed quotation or contract. Contact Elecio for questions or account requests.' : 'مشخصات و موجودی محصول ممکن است تغییر کند. سفارش تجاری تابع پیش‌فاکتور یا قرارداد امضاشده است. برای پرسش‌ها یا درخواست‌های حساب با Elecio تماس بگیرید.'}</p></article></main>; }
