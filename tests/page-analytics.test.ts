import assert from 'node:assert/strict';
import test from 'node:test';
import { analyticsDay, isAnalyticsDay, parsePageViewPath, shiftDay } from '../src/lib/page-analytics';

test('page views keep the locale apart from a normalized, decoded path', () => {
  assert.deepEqual(parsePageViewPath('/fa'), { locale: 'fa', path: '/' });
  assert.deepEqual(parsePageViewPath('/en/'), { locale: 'en', path: '/' });
  assert.deepEqual(parsePageViewPath('/en/blog/g-code/?ref=x#top'), { locale: 'en', path: '/blog/g-code' });
  assert.deepEqual(parsePageViewPath('/fa/blog/%D8%AC%DB%8C-%DA%A9%D8%AF'), { locale: 'fa', path: '/blog/جی-کد' });
});

test('page views reject admin pages, foreign URLs and malformed input', () => {
  for (const value of [
    '/fa/admin', '/en/admin/analytics', '/fr/blog', '/fashion', 'https://evil.test/fa', '//evil.test/fa',
    '/fa/%E0%A4%A', `/fa/${'a'.repeat(300)}`, '/fa/a%0Ab', '', null, 42, { path: '/fa' },
  ]) {
    assert.equal(parsePageViewPath(value), null, String(value));
  }
});

test('analytics days follow Tehran time and shift across month boundaries', () => {
  assert.equal(analyticsDay(new Date('2026-10-30T20:29:00Z')), '2026-10-30');
  assert.equal(analyticsDay(new Date('2026-10-30T20:31:00Z')), '2026-10-31');
  assert.equal(shiftDay('2026-03-01', -1), '2026-02-28');
  assert.equal(shiftDay('2026-10-30', -29), '2026-10-01');
  assert.equal(isAnalyticsDay('2026-02-28'), true);
  assert.equal(isAnalyticsDay('2026-02-30'), false);
  assert.equal(isAnalyticsDay('2026-2-3'), false);
});
