import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isIranianMobileNumber,
  maskPhoneNumber,
  normalizeIranianPhoneNumber,
  normalizeOtpCode,
} from '../src/server/auth/phone';

test('normalizes supported Iranian mobile formats and digit scripts', () => {
  assert.equal(normalizeIranianPhoneNumber('0912 345 6789'), '+989123456789');
  assert.equal(normalizeIranianPhoneNumber('+98 912-345-6789'), '+989123456789');
  assert.equal(normalizeIranianPhoneNumber('00989123456789'), '+989123456789');
  assert.equal(normalizeIranianPhoneNumber('۹۱۲۳۴۵۶۷۸۹'), '+989123456789');
  assert.equal(normalizeIranianPhoneNumber('٠٩١٢٣٤٥٦٧٨٩'), '+989123456789');
});

test('normalizes six-digit OTP values without accepting extra characters', () => {
  assert.equal(normalizeOtpCode('۱۲۳۴۵۶'), '123456');
  assert.equal(normalizeOtpCode('١٢٣٤٥٦'), '123456');
  assert.equal(normalizeOtpCode('123 456'), '123456');
  assert.equal(normalizeOtpCode('12345'), null);
  assert.equal(normalizeOtpCode('1234567'), null);
});

test('rejects malformed, fixed-line, short, and non-Iranian values', () => {
  for (const value of ['', '02112345678', '091234', '+12025550123', '98912345678x']) {
    assert.equal(normalizeIranianPhoneNumber(value), null);
    assert.equal(isIranianMobileNumber(value), false);
  }
});

test('masks valid values without returning the complete number', () => {
  const masked = maskPhoneNumber('09123456789');
  assert.equal(masked, '+9891•••789');
  assert.equal(masked.includes('3456'), false);
  assert.equal(maskPhoneNumber('bad value'), 'Elecio customer');
});
