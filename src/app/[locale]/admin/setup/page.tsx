import { redirect } from 'next/navigation';
import { getStaffPrincipal } from '@/server/auth/staff-flow';

export default async function SetupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const staff = await getStaffPrincipal();
  redirect(staff ? `/${locale}/admin` : `/${locale}/admin/login`);
}
