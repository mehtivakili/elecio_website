'use client';

import { Typography } from 'antd';
import styles from './PageStub.module.css';

const { Title, Paragraph } = Typography;

/**
 * Placeholder for routes that exist in the site map (doc/plan.md §6) but whose real content is a
 * later phase — persona-page copy in particular needs your sign-off before it's written for
 * real (doc/business_path.md launch checklist). This keeps navigation honest (no dead links)
 * without faking finished content.
 */
export function PageStub({ title, note }: { title: string; note: string }) {
  return (
    <div className={styles.wrap}>
      <Title level={1}>{title}</Title>
      <Paragraph type="secondary">{note}</Paragraph>
    </div>
  );
}
