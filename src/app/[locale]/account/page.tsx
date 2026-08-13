import { requirePrincipal } from '@/server/auth/authorization';
import { knex } from '@/server/db/knex';
import styles from '@/components/account/Account.module.css';

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params; const locale = value === 'en' ? 'en' : 'fa'; const en = locale === 'en'; const principal = await requirePrincipal();
  const [user, contacts, downloads, consents] = await Promise.all([
    knex('auth_users').select('name', 'phone_number').where({ id: principal.userId }).first(),
    knex('contact_submissions').select('id', 'status', 'created_at').where({ user_id: principal.userId }).orderBy('created_at', 'desc').limit(5),
    knex('download_requests').select('id', 'resource', 'created_at').where({ user_id: principal.userId }).orderBy('created_at', 'desc').limit(5),
    knex('user_consents').select('document_type', 'document_version', 'accepted_at').where({ user_id: principal.userId, withdrawn_at: null }).orderBy('accepted_at', 'desc'),
  ]);
  return <><section className={styles.card}><h2>{en ? `Welcome, ${user?.name}` : `${user?.name}، خوش آمدید`}</h2><p className={styles.muted} dir="ltr">{user?.phone_number}</p></section><div className={styles.grid} style={{ marginTop: '1rem' }}><section className={styles.card}><span className={styles.metric}>{contacts.length}</span><h3>{en ? 'Recent support requests' : 'درخواست‌های پشتیبانی اخیر'}</h3><ul className={styles.list}>{contacts.map((item) => <li key={item.id}>{en ? 'Request' : 'درخواست'} #{item.id} · {item.status}</li>)}</ul></section><section className={styles.card}><span className={styles.metric}>{downloads.length}</span><h3>{en ? 'Protected downloads' : 'دانلودهای ثبت‌شده'}</h3><ul className={styles.list}>{downloads.map((item) => <li key={item.id}>{String(item.resource).replaceAll('_', ' ')}</li>)}</ul></section><section className={styles.card}><span className={styles.metric}>{consents.length}</span><h3>{en ? 'Active consents' : 'رضایت‌های فعال'}</h3><ul className={styles.list}>{consents.map((item) => <li key={`${item.document_type}-${item.document_version}`}>{item.document_type} · {item.document_version}</li>)}</ul></section></div></>;
}
