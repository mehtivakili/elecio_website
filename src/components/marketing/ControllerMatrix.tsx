'use client';

import { useTranslations } from 'next-intl';
import { RevealOnScroll } from './RevealOnScroll';
import styles from './ControllerMatrix.module.css';

const CONTROLLERS = ['FANUC', 'SIEMENS', 'HEIDENHAIN', 'MITSUBISHI', 'HAAS', 'CHARMILLES'];

/** Real supported-controller list from the product catalog, plus its own honest caveat about
 * final compatibility being verified per-machine — not overpromising blanket support. */
export function ControllerMatrix() {
  const t = useTranslations('controllers');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <RevealOnScroll className={styles.head}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
        </RevealOnScroll>

        <RevealOnScroll className={styles.grid}>
          {CONTROLLERS.map((c) => (
            <span key={c} className={styles.chip}>
              {c}
            </span>
          ))}
        </RevealOnScroll>

        <RevealOnScroll className={styles.caveat}>{t('caveat')}</RevealOnScroll>
      </div>
    </section>
  );
}
