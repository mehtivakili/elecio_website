'use client';

import { useTranslations } from 'next-intl';
import { SafetyCertificateOutlined, SyncOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import styles from './TrustBadges.module.css';

const ICONS = [SafetyCertificateOutlined, SyncOutlined, CustomerServiceOutlined];

export function TrustBadges() {
  const t = useTranslations('trust');
  const items = t.raw('items') as string[];

  return (
    <div className={styles.row}>
      {items.map((label, i) => {
        const Icon = ICONS[i];
        return (
          <span key={label} className={styles.badge}>
            <Icon /> {label}
          </span>
        );
      })}
    </div>
  );
}
