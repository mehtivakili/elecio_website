import { redirect } from 'next/navigation';
import { getStaffPrincipal } from '@/server/auth/staff-flow';
import { can } from '@/server/auth/rbac';
import { Link } from '@/i18n/navigation';
import { AdminLogout } from '@/components/admin/AdminLogout';
import styles from '@/components/admin/Admin.module.css';

export default async function PanelLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {
  const {locale}=await params; const staff=await getStaffPrincipal();
  if(!staff)redirect(`/${locale}/admin/login`);
  const en=locale==='en';
  const links=[
    ['/admin',en?'Dashboard':'داشبورد',true],
    ['/admin/leads',en?'Leads':'سرنخ‌ها',can(staff.role,'leads','read','all')||can(staff.role,'leads','read','assigned')],
    ['/admin/content',en?'Content':'محتوا',can(staff.role,'content','read')],
    ['/admin/content/library',en?'Content library':'کتابخانه محتوا',can(staff.role,'content','manage')],
    ['/admin/media',en?'Media':'رسانه',can(staff.role,'media','read')],
    ['/admin/customers',en?'Customers':'مشتریان',can(staff.role,'users','read')],
    ['/admin/staff',en?'Staff':'کارکنان',can(staff.role,'staff','read')],
    ['/admin/integrations',en?'Systems':'سامانه‌ها',can(staff.role,'integrations','read')],
    ['/admin/audit',en?'Audit':'ممیزی',can(staff.role,'audit','read')],
  ] as const;
  return <main className={styles.page}><div className={styles.shell}><aside className={styles.sidebar}><Link href="/admin" className={styles.brand}>ELECIO / ADMIN</Link><small className={styles.muted}>{staff.role}</small><nav className={styles.nav}>{links.filter(([, ,show])=>show).map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav><div style={{marginTop:'1rem'}}><AdminLogout locale={locale}/></div></aside><section className={styles.content}>{children}</section></div></main>;
}
