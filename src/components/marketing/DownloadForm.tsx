'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Alert, Button, Form, Input, Select } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { HONEYPOT_WRAP_STYLE } from '@/lib/honeypot-style';
import { recordConversion } from '@/lib/telemetry';

const RESOURCES = ['catalog_pdf', 'features_pdf', 'windows_installer', 'android_apk'] as const;

export function DownloadForm() {
  const t = useTranslations('downloadForm');
  const locale = useLocale();
  const [form] = Form.useForm();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const onFinish = async (values: Record<string, string>) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('request failed');
      setDownloadUrl(data.url);
      setStatus('success');
      recordConversion('download_requested', locale);
    } catch {
      setStatus('error');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} disabled={status === 'loading'}>
      {status === 'success' && downloadUrl && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 20 }}
          title={t('success')}
          action={
            <Button type="primary" size="small" icon={<DownloadOutlined />} href={downloadUrl} target="_blank">
              {t('downloadNow')}
            </Button>
          }
        />
      )}
      {status === 'error' && <Alert type="error" showIcon title={t('error')} style={{ marginBottom: 20 }} />}

      <Form.Item name="resource" label={t('resource')} rules={[{ required: true }]} initialValue="catalog_pdf">
        <Select
          options={RESOURCES.map((r) => ({ value: r, label: t(`resources.${r}`) }))}
        />
      </Form.Item>
      <Form.Item name="name" label={t('name')} rules={[{ required: true, message: t('nameRequired') }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email', message: t('emailRequired') }]}>
        <Input />
      </Form.Item>
      <Form.Item name="company" label={t('company')}>
        <Input />
      </Form.Item>

      <div style={HONEYPOT_WRAP_STYLE} aria-hidden="true">
        <Form.Item name="website">
          <Input tabIndex={-1} autoComplete="off" />
        </Form.Item>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={status === 'loading'} icon={<DownloadOutlined />} block size="large">
          {t('submit')}
        </Button>
      </Form.Item>
    </Form>
  );
}
