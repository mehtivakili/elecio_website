import 'server-only';

import { KavenegarSmsProvider } from './kavenegar';
import { SmsProviderError, type SmsProvider } from './types';

class DisabledSmsProvider implements SmsProvider {
  readonly name = 'disabled';
  async sendOtp(): Promise<never> {
    throw new SmsProviderError('SMS OTP is not configured.', 'not_configured');
  }
}

export function getSmsProvider(): SmsProvider {
  if (process.env.SMS_PROVIDER === 'development' && process.env.NODE_ENV !== 'production') {
    return { name: 'development', async sendOtp() { return { provider: 'development' }; } };
  }
  if (process.env.SMS_PROVIDER === 'kavenegar') return new KavenegarSmsProvider();
  return new DisabledSmsProvider();
}

export type { SmsProvider, SmsOtpInput, SmsDeliveryReceipt } from './types';
export { SmsProviderError } from './types';
