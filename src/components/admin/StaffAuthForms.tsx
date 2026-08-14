'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import styles from './Admin.module.css';

async function json(response: Response) { return response.json().catch(() => ({})); }
export function StaffLoginForm({ locale, allowLocalDemo = false }: { locale: string; allowLocalDemo?: boolean }) {
  const en = locale === 'en';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const normalizedEmail = allowLocalDemo && email.trim().toLowerCase() === 'admin@admin'
      ? 'admin@admin.local'
      : email;
    const response = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password, rememberMe: false }),
    });
    if (!response.ok) {
      setError(en ? 'Invalid staff credentials.' : 'اطلاعات ورود کارکنان نادرست است.');
      setBusy(false);
      return;
    }
    const status = await json(await fetch('/api/staff-auth/status'));
    if (!status.authenticated) {
      setError(en ? 'This account does not have active staff access.' : 'این حساب دسترسی فعال کارکنان ندارد.');
      setBusy(false);
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return <form className={styles.form} onSubmit={submit}><label className={styles.label}>{en?'Work email':'ایمیل کاری'}<input className={styles.input} type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label className={styles.label}>{en?'Password':'گذرواژه'}<input className={styles.input} type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>{error&&<p role="alert" className={styles.error}>{error}</p>}<button className={styles.button} disabled={busy}>{busy?(en?'Signing in…':'در حال ورود…'):(en?'Secure staff sign in':'ورود امن کارکنان')}</button><a href={`/${locale}/admin/forgot-password`} className={styles.muted}>{en?'Forgot password?':'گذرواژه را فراموش کرده‌اید؟'}</a></form>;
}

export function InviteAcceptForm({ locale, token }: {locale:string;token:string}) {const en=locale==='en';const router=useRouter();const[password,setPassword]=useState('');const[confirm,setConfirm]=useState('');const[error,setError]=useState('');const[busy,setBusy]=useState(false);async function submit(event:FormEvent){event.preventDefault();if(password!==confirm){setError(en?'Passwords do not match.':'گذرواژه‌ها یکسان نیستند.');return;}setBusy(true);const response=await fetch('/api/staff-auth/accept-invite',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,password,locale})});if(!response.ok){setError(en?'This invitation is invalid or expired.':'این دعوت‌نامه نامعتبر یا منقضی است.');setBusy(false);return;}router.replace('/admin');router.refresh();}return <form className={styles.form} onSubmit={submit}><p className={styles.muted}>{en?'Use at least 14 characters with upper/lowercase, a number, and a symbol.':'حداقل ۱۴ نویسه شامل حروف بزرگ و کوچک لاتین، عدد و نماد استفاده کنید.'}</p><label className={styles.label}>{en?'New password':'گذرواژه جدید'}<input className={styles.input} type="password" autoComplete="new-password" minLength={14} value={password} onChange={e=>setPassword(e.target.value)} required /></label><label className={styles.label}>{en?'Confirm password':'تکرار گذرواژه'}<input className={styles.input} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required /></label>{error&&<p className={styles.error} role="alert">{error}</p>}<button className={styles.button} disabled={busy}>{en?'Accept and secure account':'پذیرش و ایمن‌سازی حساب'}</button></form>;}
