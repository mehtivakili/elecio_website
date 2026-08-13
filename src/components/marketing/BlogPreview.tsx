'use client';

import { useTranslations } from 'next-intl';
import { Button } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link } from '@/i18n/navigation';
import { RevealOnScroll } from './RevealOnScroll';
import styles from './BlogPreview.module.css';

type Item = { tag: string; title: string };

/**
 * The blog engine itself is Phase 7 (doc/plan.md) — `/blog` is still a stub. These cards are
 * genuinely upcoming article topics, not fabricated posts: no invented publish dates, author
 * names, or view counts, and each is explicitly labeled "coming soon" rather than presented as
 * already live, which is what would make this section mock in a misleading sense instead of a
 * fair teaser.
 */
export function BlogPreview() {
  const t = useTranslations('blogPreview');
  const items = t.raw('items') as Item[];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <RevealOnScroll className={styles.head}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </RevealOnScroll>

        <div className={styles.grid}>
          {items.map((item, i) => (
            <RevealOnScroll key={item.title} delayMs={i * 90} className={styles.card}>
              <span className={styles.cardIcon}>
                <FileTextOutlined />
              </span>
              <span className={styles.cardTag}>{item.tag}</span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <span className={styles.cardSoon}>{t('comingSoon')}</span>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll className={styles.actions}>
          <Link href="/blog">
            <Button size="large" icon={<ArrowLeftOutlined />} iconPlacement="end">
              {t('cta')}
            </Button>
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
