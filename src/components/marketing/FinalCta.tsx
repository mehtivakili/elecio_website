'use client';

import { useTranslations } from 'next-intl';
import { Button } from 'antd';
import { RevealOnScroll } from './RevealOnScroll';
import { Link } from '@/i18n/navigation';
import { ORDER_URL } from '@/lib/site-constants';
import styles from './FinalCta.module.css';

export function FinalCta() {
  const t = useTranslations('finalCta');

  return (
    <section className={styles.section}>
      <RevealOnScroll className={styles.container}>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.subtitle}>{t('subtitle')}</p>
        <div className={styles.actions}>
          <Button type="primary" size="large" href={ORDER_URL} target="_blank" rel="noopener noreferrer">
            {t('ctaPrimary')}
          </Button>
          <Link href="/contact">
            <Button size="large" className={styles.ghostBtn}>
              {t('ctaSecondary')}
            </Button>
          </Link>
        </div>
      </RevealOnScroll>
    </section>
  );
}
