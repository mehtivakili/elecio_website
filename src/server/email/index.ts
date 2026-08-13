import 'server-only';

export class EmailProviderError extends Error {
  constructor(readonly code: 'not_configured' | 'timeout' | 'rejected') { super(code); }
}

type Message = { to: string; subject: string; text: string; html: string };

export async function sendTransactionalEmail(message: Message): Promise<void> {
  if (process.env.EMAIL_PROVIDER === 'development' && process.env.NODE_ENV !== 'production') return;
  if (process.env.EMAIL_PROVIDER !== 'resend' || !process.env.RESEND_API_KEY || !process.env.STAFF_EMAIL_FROM) {
    throw new EmailProviderError('not_configured');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: controller.signal,
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.STAFF_EMAIL_FROM, ...message }),
    });
    if (!response.ok) throw new EmailProviderError('rejected');
  } catch (error) {
    if (error instanceof EmailProviderError) throw error;
    throw new EmailProviderError('timeout');
  } finally { clearTimeout(timer); }
}
