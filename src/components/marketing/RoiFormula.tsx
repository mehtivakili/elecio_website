'use client';

import { useTranslations } from 'next-intl';
import { RevealOnScroll } from './RevealOnScroll';
import styles from './RoiFormula.module.css';

/**
 * The exact downtime-reporting formula from the product catalog (page 6) — a real mechanism the
 * device implements, not a marketing invention. See doc/plan.md §4 / Phase 4.
 */
export function RoiFormula() {
  const t = useTranslations('roi');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <RevealOnScroll className={styles.head}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
          <p className={styles.body}>{t('body')}</p>
        </RevealOnScroll>

        <RevealOnScroll className={styles.formulaBox}>
          <div className={styles.formulaRow}>
            <span className={styles.chip}>{t('shiftTime')}</span>
            <span className={styles.op}>−</span>
            <span className={styles.chip}>{t('actualRunTime')}</span>
            <span className={styles.op}>=</span>
            <span className={`${styles.chip} ${styles.result}`}>{t('reviewableTime')}</span>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
