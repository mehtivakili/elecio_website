import 'server-only';

import type { SmsProvider, SmsOtpInput, SmsDeliveryReceipt } from './types';
import { SmsProviderError } from './types';

type KavenegarResponse = {
  return?: { status?: number; message?: string };
  entries?: Array<{ messageid?: number | string }>;
};

export class KavenegarSmsProvider implements SmsProvider {
  readonly name = 'kavenegar';

  async sendOtp(input: SmsOtpInput): Promise<SmsDeliveryReceipt> {
    const apiKey = process.env.KAVENEGAR_API_KEY;
    const template = process.env.KAVENEGAR_OTP_TEMPLATE;
    if (!apiKey || !template) {
      throw new SmsProviderError('SMS provider is not configured.', 'not_configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const body = new URLSearchParams({
        receptor: input.phoneNumber,
        template,
        token: input.code,
        type: 'sms',
      });
      const response = await fetch(
        `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/verify/lookup.json`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
          signal: controller.signal,
          cache: 'no-store',
        }
      );
      const result = (await response.json().catch(() => null)) as KavenegarResponse | null;
      if (!response.ok || result?.return?.status !== 200) {
        throw new SmsProviderError('SMS provider rejected the request.', 'rejected');
      }
      return {
        provider: this.name,
        messageId: result.entries?.[0]?.messageid?.toString(),
      };
    } catch (error) {
      if (error instanceof SmsProviderError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new SmsProviderError('SMS provider timed out.', 'timeout');
      }
      throw new SmsProviderError('SMS provider is unavailable.', 'unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }
}
