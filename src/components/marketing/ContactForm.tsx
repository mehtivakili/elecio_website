'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Alert, Button, Form, Input } from 'antd';
import { HONEYPOT_WRAP_STYLE } from '@/lib/honeypot-style';
import { recordConversion } from '@/lib/telemetry';

export function ContactForm() {
  const t = useTranslations('contactPage');
  const locale = useLocale();
  const [form] = Form.useForm();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const onFinish = async (values: Record<string, string>) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale, sourcePage: '/contact' }),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('success');
      recordConversion('contact_submitted', locale);
      form.resetFields();
    } catch {
      setStatus('error');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} disabled={status === 'loading'}>
      {status === 'success' && (
        <Alert type="success" showIcon title={t('success')} style={{ marginBottom: 24 }} />
      )}
      {status === 'error' && (
        <Alert type="error" showIcon title={t('error')} style={{ marginBottom: 24 }} />
      )}

      <Form.Item name="name" label={t('name')} rules={[{ required: true, message: t('nameRequired') }]}>
        <Input />
      </Form.Item>

      <Form.Item name="phone" label={t('phone')} rules={[{ required: true, message: t('phoneRequired') }]}>
        <Input />
      </Form.Item>

      <Form.Item name="email" label={t('email')} rules={[{ type: 'email' }]}>
        <Input />
      </Form.Item>

      <Form.Item name="company" label={t('company')}>
        <Input />
      </Form.Item>

      <Form.Item name="message" label={t('message')}>
        <Input.TextArea rows={4} />
      </Form.Item>

      {/* Honeypot — real users never see or fill this in; see src/app/api/contact/route.ts.
          The classic "position:absolute; left:-9999px" trick is a real footgun: without a
          positioned ancestor it offsets from the initial containing block and can blow out the
          document's scrollable width (found the hard way — see doc/journey.md 2026-08-07). This
          "clip to 1x1px" pattern hides the field just as effectively without ever affecting
          layout/overflow, regardless of RTL or ancestor positioning. */}
      <div style={HONEYPOT_WRAP_STYLE} aria-hidden="true">
        <Form.Item name="website">
          <Input tabIndex={-1} autoComplete="off" />
        </Form.Item>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={status === 'loading'} block size="large">
          {t('submit')}
        </Button>
      </Form.Item>
    </Form>
  );
}
