import assert from 'node:assert/strict';
import test from 'node:test';
import { persianQueueReadiness, scheduleQueueSlots, type QueueReadyPost } from '../src/server/content/publication-queue';
import { brandedImagePath, isBrandableImagePath } from '../src/lib/branded-image';

test('publication queue assigns stable two, three, or four day slots', () => {
  const first = new Date('2026-09-01T06:00:00.000Z');
  assert.deepEqual(
    scheduleQueueSlots(first, 3, 3).map((date) => date.toISOString()),
    ['2026-09-01T06:00:00.000Z', '2026-09-04T06:00:00.000Z', '2026-09-07T06:00:00.000Z'],
  );
});

test('Persian queue readiness requires indexable copy and cover metadata', () => {
  const ready: QueueReadyPost = {
    slug: 'cnc-machine-guide', title_fa: 'راهنمای دستگاه CNC',
    body_fa: { type: 'doc', content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'متن مفید' }] },
      { type: 'image', attrs: { src: '/uploads/cnc-machine-guide-body-1.webp', alt: 'کنترلر CNC' } },
      { type: 'image', attrs: { src: '/uploads/cnc-machine-guide-body-2.webp', alt: 'ابزار دستگاه CNC' } },
    ] },
    focus_keyword_fa: 'دستگاه cnc', seo_title_fa: 'راهنمای کامل دستگاه CNC برای کارگاه',
    seo_description_fa: 'توضیح کامل و کاربردی درباره انتخاب، کارکرد و نگهداری دستگاه CNC در محیط کارگاهی.',
    category_id: 1, cover_image_path: '/uploads/cnc-machine-guide-cover.webp', cover_alt_fa: 'دستگاه CNC در کارگاه',
    robots_index: true, translation_status: 'fa_only',
  };
  assert.deepEqual(persianQueueReadiness(ready), []);
  assert.deepEqual(persianQueueReadiness({ ...ready, cover_alt_fa: '', focus_keyword_fa: '' }), ['focus_keyword_fa', 'cover_alt_fa']);
  assert.deepEqual(persianQueueReadiness({ ...ready, body_fa: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'متن' }] }] } }), ['body_images']);
});

test('article images use the dynamic branded route without exposing arbitrary local paths', () => {
  assert.equal(isBrandableImagePath('/uploads/جی-کد-چیست-cover.webp'), true);
  assert.equal(isBrandableImagePath('/images/recommendations/cnc.webp'), true);
  assert.equal(isBrandableImagePath('/uploads/../.env.png'), false);
  assert.equal(isBrandableImagePath('https://example.com/image.webp'), false);
  assert.equal(brandedImagePath('/uploads/جی-کد-چیست-cover.webp'), '/api/media/branded?src=%2Fuploads%2F%D8%AC%DB%8C-%DA%A9%D8%AF-%DA%86%DB%8C%D8%B3%D8%AA-cover.webp');
});
