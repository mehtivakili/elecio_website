'use client';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import styles from './Account.module.css';
export function LogoutButton({ locale }: { locale: string }) { const [busy, setBusy] = useState(false); const router = useRouter(); async function logout() { setBusy(true); await fetch('/api/account/sessions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'all' }) }); router.replace('/login'); router.refresh(); } return <button className={`${styles.button} ${styles.secondary}`} disabled={busy} onClick={logout}>{locale === 'en' ? 'Log out' : 'خروج'}</button>; }
