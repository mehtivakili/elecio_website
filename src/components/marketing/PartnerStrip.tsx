'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { RevealOnScroll } from './RevealOnScroll';
import { PARTNERS } from '@/lib/site-constants';
import styles from './PartnerStrip.module.css';

export function PartnerStrip() {
  const t = useTranslations('partners');

  return (
    <section className={styles.section}>
      <RevealOnScroll className={styles.container}>
        <p className={styles.label}>{t('label')}</p>
        <div className={styles.row}>
          {PARTNERS.map((partner) => (
            <Image key={partner.name} src={partner.logo} alt={partner.name} width={180} height={72} sizes="180px" className={styles.logo} />
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
