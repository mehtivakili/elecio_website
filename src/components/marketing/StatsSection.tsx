'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { UserOutlined, ToolOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { COMPANY_STATS } from '@/lib/site-constants';
import { RevealOnScroll } from './RevealOnScroll';
import styles from './StatsSection.module.css';

const ICONS = { customers: UserOutlined, devices: ToolOutlined, hours: ClockCircleOutlined, satisfaction: CheckCircleOutlined };

/**
 * Real, audited numbers (site-constants.ts COMPANY_STATS, sourced from the old site's
 * StatsSection.tsx). Values are pre-formatted Persian-numeral strings (۱۵۰+, ۲.۵M+, ...), so
 * rather than a numeric ticker (which would mean parsing Persian digits back out and reformatting
 * mid-animation, real complexity for a decorative effect), each card just animates in once on
 * scroll-into-view via a CSS transition — same "arrives once" feel, no digit-parsing edge cases.
 */
export function StatsSection() {
  const locale = useLocale();
  const t = useTranslations('stats');
  const tItems = useTranslations('stats.items');
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <RevealOnScroll className={styles.head}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
        </RevealOnScroll>

        <div ref={ref} className={styles.grid}>
          {COMPANY_STATS.map((stat, i) => {
            const Icon = ICONS[stat.key];
            const value = locale === 'fa'
              ? stat.value.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]).replace('.', '٫')
              : stat.value;
            return (
              <RevealOnScroll key={stat.key} delayMs={i * 90} className={styles.card}>
                <span className={styles.icon}>
                  <Icon />
                </span>
                <span className={`${styles.value} ${started ? styles.valueIn : ''} tabular`}>
                  {value}
                  <span className={styles.suffix}>{stat.suffix}</span>
                </span>
                <span className={styles.label}>{tItems(stat.key)}</span>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
