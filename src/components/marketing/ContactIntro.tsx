'use client';

import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export function ContactIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <Title level={1}>{title}</Title>
      <Paragraph type="secondary">{subtitle}</Paragraph>
    </>
  );
}
