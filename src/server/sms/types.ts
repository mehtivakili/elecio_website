export type SmsOtpInput = {
  phoneNumber: string;
  code: string;
  locale: 'fa' | 'en';
};

export type SmsDeliveryReceipt = {
  provider: string;
  messageId?: string;
};

export interface SmsProvider {
  readonly name: string;
  sendOtp(input: SmsOtpInput): Promise<SmsDeliveryReceipt>;
}

export class SmsProviderError extends Error {
  constructor(
    message: string,
    readonly code: 'not_configured' | 'timeout' | 'rejected' | 'unavailable'
  ) {
    super(message);
  }
}
