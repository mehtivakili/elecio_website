import assert from 'node:assert/strict';
import test from 'node:test';
import { CONVERSION_EVENTS, isConversionEvent } from '../src/lib/telemetry';

test('conversion analytics accepts only the reviewed aggregate event allowlist', () => {
  for (const event of CONVERSION_EVENTS) assert.equal(isConversionEvent(event), true);
  for (const value of ['page_view', 'phone:+98912', '', null, 1, { event: 'contact_submitted' }]) {
    assert.equal(isConversionEvent(value), false);
  }
});
