import { requireStaffPermission } from '@/server/auth/staff-flow';
import { knex } from '@/server/db/knex';
import { ContentLibraryManager } from '@/components/admin/ContentLibraryManager';
import styles from '@/components/admin/Admin.module.css';

export default async function ContentLibrary({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; const en = locale === 'en'; await requireStaffPermission('content', 'manage');
  const [category, tag, partner, testimonial] = await Promise.all([
    knex('categories').select('*').orderBy('sort_order'), knex('tags').select('*').orderBy(en ? 'name_en' : 'name_fa'),
    knex('partners').select('*').orderBy('sort_order'), knex('testimonials').select('*').orderBy('sort_order'),
  ]);
  return <><header className={styles.head}><span className={styles.eyebrow}>Content library</span><h1>{en ? 'Taxonomy and social proof' : 'ساختار محتوا و اعتبار اجتماعی'}</h1><p className={styles.muted}>{en ? 'Manage the reusable data that powers articles and marketing sections.' : 'داده‌های مشترک مقاله‌ها و بخش‌های بازاریابی را مدیریت کنید.'}</p></header><ContentLibraryManager locale={locale} data={{ category, tag, partner, testimonial }}/></>;
}
