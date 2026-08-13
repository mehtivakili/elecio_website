import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactIntro } from '@/components/marketing/ContactIntro';
import { ContactForm } from '@/components/marketing/ContactForm';
import styles from './page.module.css';
import { localizedPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contactPage' });
  return localizedPageMetadata(locale, 'contact', `${t('title')} | Elecio`, t('subtitle'));
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contactPage');

  return (
    <div className={styles.wrap}>
      <ContactIntro title={t('title')} subtitle={t('subtitle')} />
      <ContactForm />
    </div>
  );
}
