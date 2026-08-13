'use client';

import { useTranslations } from 'next-intl';
import { SUPPORTED_CONTROLLERS } from '@/lib/site-constants';
import { RevealOnScroll } from './RevealOnScroll';
import styles from './SupportedMachines.module.css';

/**
 * The homepage's "supported machines" showcase. No official controller-brand logo image assets
 * exist anywhere in this project (checked media/ and old/public/), and fetching real trademarked
 * logos off the web without permission isn't something to do here — so each controller renders as
 * a styled wordmark card instead of an image logo, same honest approach ControllerMatrix already
 * uses on the programmer persona page, just bigger and more visual for the homepage.
 */
export function SupportedMachines() {
  const t = useTranslations('supportedMachines');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <RevealOnScroll className={styles.head}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
        </RevealOnScroll>

        <RevealOnScroll className={styles.grid}>
          {SUPPORTED_CONTROLLERS.map((name) => (
            <div key={name} className={styles.card}>
              <span className={`${styles.wordmark} latin`}>{name}</span>
            </div>
          ))}
        </RevealOnScroll>

        <RevealOnScroll className={styles.caveat}>{t('caveat')}</RevealOnScroll>
      </div>
    </section>
  );
}
