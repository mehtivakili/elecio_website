'use client';

import { useTranslations } from 'next-intl';
import { FilePdfOutlined, PlayCircleOutlined, CodeOutlined, FileProtectOutlined } from '@ant-design/icons';
import { Link } from '@/i18n/navigation';
import { RevealOnScroll } from './RevealOnScroll';
import styles from './LearningSection.module.css';

type Item = { title: string; body: string; href: string; external: boolean };

const ICONS = [FilePdfOutlined, FileProtectOutlined, PlayCircleOutlined, CodeOutlined];

/**
 * Unlike BlogPreview, these four tiles are real, live destinations today — the two PDFs already
 * ship from public/downloads/ (Phase 6), and the video/protocol links point at real content on
 * the business-owner and programmer persona pages. Not a placeholder section.
 */
export function LearningSection() {
  const t = useTranslations('learning');
  const items = t.raw('items') as Item[];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <RevealOnScroll className={styles.head}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
        </RevealOnScroll>

        <div className={styles.grid}>
          {items.map((item, i) => {
            const Icon = ICONS[i];
            const card = (
              <>
                <span className={styles.cardIcon}>
                  <Icon />
                </span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardBody}>{item.body}</p>
              </>
            );
            return (
              <RevealOnScroll key={item.title} delayMs={i * 80} className={styles.cardWrap}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.card}>
                    {card}
                  </a>
                ) : (
                  <Link href={item.href} className={styles.card}>
                    {card}
                  </Link>
                )}
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
