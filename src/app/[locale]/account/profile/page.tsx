import { requirePrincipal } from '@/server/auth/authorization';
import { knex } from '@/server/db/knex';
import { ProfileForm } from '@/components/account/ProfileForm';
import styles from '@/components/account/Account.module.css';
export default async function ProfilePage({ params }: { params: Promise<{ locale: 'fa' | 'en' }> }) { const { locale } = await params; const principal = await requirePrincipal(); const profile = await knex('auth_users as u').join('user_profiles as p', 'p.user_id', 'u.id').select('u.name', 'u.phone_number as phoneNumber', 'p.company_name as companyName').where('u.id', principal.userId).first(); return <section className={styles.card}><h2>{locale === 'en' ? 'Profile details' : 'مشخصات پروفایل'}</h2><ProfileForm initial={profile} locale={locale} /></section>; }
