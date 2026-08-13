'use client';

import { useTranslations } from 'next-intl';
import { RevealOnScroll } from './RevealOnScroll';
import styles from './FeatureList.module.css';

type Item = { title: string; body: string };

/**
 * A numbered list — allys.mu's "What We Offer?" treatment (big index number, thin divider
 * rules) rather than a card grid. Numbering here is legitimate, not decorative: these are
 * enumerated real features/specs, not an arbitrary sequence. `namespace` defaults to the
 * homepage's `features` set; the programmer persona page reuses this same component against a
 * `protocolSpecs` namespace instead of duplicating the layout.
 */
export function FeatureList({ namespace = 'features' }: { namespace?: string }) {
  const t = useTranslations(namespace);
  const items = t.raw('items') as Item[];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <RevealOnScroll className={styles.head}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
        </RevealOnScroll>

        <div className={styles.list}>
          {items.map((item, i) => (
            <RevealOnScroll key={i} className={styles.row} delayMs={i * 80}>
              <span className={`${styles.index} tabular`}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className={styles.rowTitle}>{item.title}</h3>
                <p className={styles.rowBody}>{item.body}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
