import { SecurityPanel } from '@/components/account/SecurityPanel';
import { requirePrincipal } from '@/server/auth/authorization';
import { knex } from '@/server/db/knex';
import styles from '@/components/account/Account.module.css';

export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; const en = locale === 'en'; const principal = await requirePrincipal();
  const [rows, pending] = await Promise.all([
    knex('auth_sessions').select('id', 'created_at', 'updated_at', 'expires_at', 'user_agent').where({ user_id: principal.userId }).where('expires_at', '>', knex.fn.now()).orderBy('updated_at', 'desc'),
    knex('account_deletion_requests').where({ user_id: principal.userId, status: 'pending' }).first(),
  ]);
  const sessions = rows.map((session) => ({ id: session.id, current: session.id === principal.sessionId, createdAt: session.created_at, lastActiveAt: session.updated_at, expiresAt: session.expires_at, device: String(session.user_agent ?? '').slice(0, 180) || 'Unknown device' }));
  return <section className={styles.card}><h2>{en ? 'Sessions and account security' : 'نشست‌ها و امنیت حساب'}</h2><p className={styles.muted}>{en ? 'Review signed-in devices and revoke access you no longer recognize.' : 'دستگاه‌های واردشده را بررسی کنید و دسترسی ناشناس را ببندید.'}</p><SecurityPanel locale={locale} initialSessions={sessions} initialDeletion={Boolean(pending)} /></section>;
}
