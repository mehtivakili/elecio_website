import { redirect } from 'next/navigation';
import { getStaffPrincipal } from '@/server/auth/staff-flow';
import { StaffLoginForm } from '@/components/admin/StaffAuthForms';
import styles from '@/components/admin/Admin.module.css';

export default async function AdminLogin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const staff = await getStaffPrincipal();
  if (staff) redirect(`/${locale}/admin`);
  const en = locale === 'en';
  const demo = process.env.NODE_ENV === 'development' && process.env.ALLOW_INSECURE_DEV_ADMIN === 'true';

  return <main className={styles.page}><section className={styles.auth}><span className={styles.eyebrow}>Elecio secure operations</span><h1>{en?'Staff sign in':'ورود کارکنان'}</h1><p className={styles.muted}>{en?'Invite-only access with protected server-side sessions.':'دسترسی فقط با دعوت‌نامه و نشست‌های محافظت‌شده سمت سرور.'}</p>{demo&&<p role="note" className={styles.devNotice}>{en?'Local development only: admin@admin / admin.':'فقط در محیط توسعه: admin@admin / admin.'}</p>}<StaffLoginForm locale={locale} allowLocalDemo={demo}/></section></main>;
}
