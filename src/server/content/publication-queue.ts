import type { RichDocument, RichNode } from './document';
import { plainText, sanitizeDocument } from './document';

export const PUBLICATION_CADENCES = [1, 2, 3, 4] as const;
export type PublicationCadence = (typeof PUBLICATION_CADENCES)[number];

export function isPublicationCadence(value: unknown): value is PublicationCadence {
  return PUBLICATION_CADENCES.includes(Number(value) as PublicationCadence);
}

export function scheduleQueueSlots(firstPublishAt: Date, cadenceDays: PublicationCadence, count: number): Date[] {
  if (Number.isNaN(firstPublishAt.getTime()) || count < 0 || !Number.isInteger(count)) {
    throw new Error('INVALID_QUEUE_SCHEDULE');
  }
  const step = cadenceDays * 24 * 60 * 60 * 1000;
  return Array.from({ length: count }, (_, index) => new Date(firstPublishAt.getTime() + index * step));
}

function visitImages(node: RichNode, result: { count: number; missingAlt: number }) {
  if (node.type === 'image') {
    result.count += 1;
    if (typeof node.attrs?.alt !== 'string' || !node.attrs.alt.trim()) result.missingAlt += 1;
  }
  for (const child of node.content ?? []) visitImages(child, result);
}

export function documentImageStats(value: unknown): { count: number; missingAlt: number } {
  const result = { count: 0, missingAlt: 0 };
  visitImages(sanitizeDocument(value), result);
  return result;
}

export type QueueReadyPost = {
  slug?: string | null;
  title_fa?: string | null;
  body_fa?: string | RichDocument | null;
  cover_image_path?: string | null;
  cover_alt_fa?: string | null;
  seo_title_fa?: string | null;
  seo_description_fa?: string | null;
  focus_keyword_fa?: string | null;
  category_id?: number | null;
  robots_index?: boolean | number | null;
  translation_status?: string | null;
};

export function persianQueueReadiness(post: QueueReadyPost): string[] {
  const missing: string[] = [];
  let document: RichDocument | null = null;
  try {
    document = sanitizeDocument(post.body_fa ?? { type: 'doc', content: [] });
  } catch {
    // Report the body as missing/invalid below.
  }
  if (!post.slug) missing.push('slug');
  if (!post.title_fa?.trim()) missing.push('title_fa');
  if (!document || !plainText(document)) missing.push('body_fa');
  if (!post.focus_keyword_fa?.trim()) missing.push('focus_keyword_fa');
  if (!post.seo_title_fa?.trim()) missing.push('seo_title_fa');
  if (!post.seo_description_fa?.trim()) missing.push('seo_description_fa');
  if (!post.category_id) missing.push('category_id');
  if (!post.cover_image_path?.trim()) missing.push('cover_image_path');
  if (!post.cover_alt_fa?.trim()) missing.push('cover_alt_fa');
  const imageStats = document ? documentImageStats(document) : { count: 0, missingAlt: 0 };
  if (imageStats.count < 2) missing.push('body_images');
  if (imageStats.missingAlt > 0) missing.push('body_image_alt');
  if (post.robots_index === false || post.robots_index === 0) missing.push('robots_index');
  if (post.translation_status === 'en_only') missing.push('translation_status');
  return missing;
}
