import type { ReactNode } from 'react';
import { Button } from 'antd';
import { Link } from '@/i18n/navigation';
import { ORDER_URL } from '@/lib/site-constants';
import styles from './PersonaHero.module.css';

export function PersonaHero({
  eyebrow,
  headline,
  subheadline,
  primaryLabel,
  secondaryLabel,
  children,
}: {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryLabel: string;
  secondaryLabel: string;
  children?: ReactNode;
}) {
  return (
    <header className={styles.hero}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.headline}>{headline}</h1>
        <p className={styles.sub}>{subheadline}</p>
        <div className={styles.actions}>
          <Button type="primary" size="large" href={ORDER_URL} target="_blank" rel="noopener noreferrer">
            {primaryLabel}
          </Button>
          <Link href="/contact">
            <Button size="large" className={styles.ghostBtn}>
              {secondaryLabel}
            </Button>
          </Link>
        </div>
        {children}
      </div>
    </header>
  );
}
