import type { RichDocument, RichNode } from '@/server/content/document';

export type ArticleOutlineItem = {
  id: string;
  index: number;
  level: 2 | 3 | 4;
  text: string;
};

const tocHeadingPattern = /^(?:در این مقاله می[‌ ]خوانید|فهرست مطالب|table of contents|contents)$/iu;

export function richNodeText(node: RichNode): string {
  return node.type === 'text' ? node.text ?? '' : (node.content ?? []).map(richNodeText).join('');
}

export function isStoredTocHeading(node: RichNode): boolean {
  return node.type === 'heading' && tocHeadingPattern.test(richNodeText(node).replace(/\s+/gu, ' ').trim());
}

function anchorPart(value: string): string {
  return value.normalize('NFC').trim().toLowerCase()
    .replace(/[\s_\u200c]+/gu, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/gu, '-')
    .replace(/^-|-$/gu, '')
    .slice(0, 90);
}

export function articleOutline(document: RichDocument): ArticleOutlineItem[] {
  const used = new Map<string, number>();
  const result: ArticleOutlineItem[] = [];
  (document.content ?? []).forEach((node, index) => {
    if (node.type !== 'heading' || isStoredTocHeading(node)) return;
    const rawLevel = Number(node.attrs?.level) || 2;
    if (rawLevel !== 2) return;
    const level = Math.min(4, Math.max(2, rawLevel)) as 2 | 3 | 4;
    const text = richNodeText(node).replace(/\s+/gu, ' ').trim();
    if (!text) return;
    const base = anchorPart(text) || `section-${index + 1}`;
    const occurrence = (used.get(base) ?? 0) + 1;
    used.set(base, occurrence);
    result.push({ id: occurrence === 1 ? base : `${base}-${occurrence}`, index, level, text });
  });
  return result;
}

export function storedTocNodeIndexes(document: RichDocument): Set<number> {
  const hidden = new Set<number>();
  const nodes = document.content ?? [];
  nodes.forEach((node, index) => {
    if (!isStoredTocHeading(node)) return;
    hidden.add(index);
    const next = nodes[index + 1];
    if (next?.type === 'bulletList' || next?.type === 'orderedList') hidden.add(index + 1);
  });
  return hidden;
}
