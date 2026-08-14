import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { knex } from '../src/server/db/knex';
import { plainText, sanitizeDocument, type RichDocument, type RichNode } from '../src/server/content/document';

const slug = 'cnc-file-transfer-guide';
const source = path.resolve('deliverables/publications/Elecio_EN-EC-001_CNC_File_Transfer.docx');

const linkedParagraph = (before: string, anchor: string, href: string, after = ''): RichNode => ({
  type: 'paragraph',
  content: [
    { type: 'text', text: before },
    { type: 'text', text: anchor, marks: [{ type: 'link', attrs: { href } }] },
    ...(after ? [{ type: 'text', text: after } as RichNode] : []),
  ],
});

function addAfterHeading(document: RichDocument, heading: string, paragraph: RichNode) {
  const nodes = document.content ?? [];
  const index = nodes.findIndex((node) => node.type === 'heading' && plainText({ type: 'doc', content: [node] }) === heading);
  if (index >= 0) nodes.splice(index + 1, 0, paragraph);
}

async function main() {
  const extracted = execFileSync('python', ['scripts/extract-publication-docx.py', source], {
    encoding: 'utf8',
    maxBuffer: 4_000_000,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  const bodyEn = sanitizeDocument(JSON.parse(extracted));
  addAfterHeading(bodyEn, 'DNC for Centralized CNC Program Transfer', linkedParagraph('For a purpose-built workflow, explore ', 'Smart DNC for CNC file transfer', '/en/product', '.'));
  addAfterHeading(bodyEn, 'Ethernet, FTP, and CNC Networking', linkedParagraph('See the ', 'CNC communication and management software', '/en/software', ' used to manage connected workflows.'));
  addAfterHeading(bodyEn, 'Conclusion: Build a Transfer Workflow, Not Just a Connection', linkedParagraph('', 'Talk to ElecIO about your controller and shop-floor setup', '/en/contact', ' for a compatibility review.'));

  const current = await knex('posts').where({ slug }).first();
  if (!current) throw new Error(`Expected the seeded ${slug} article to exist.`);
  const author = await knex('auth_users').where({ id: current.author_user_id }).first();
  if (!author) throw new Error('The article author no longer exists.');

  await knex('categories').insert({ slug: 'cnc-technical-guides', name_fa: 'راهنماهای فنی CNC', name_en: 'CNC Technical Guides', sort_order: 12 }).onConflict('slug').merge(['name_fa', 'name_en']);
  const category = await knex('categories').select('id').where({ slug: 'cnc-technical-guides' }).first();
  if (!category) throw new Error('Failed to create the CNC Technical Guides category.');
  const tagDefinitions = [
    ['cnc-file-transfer', 'انتقال فایل CNC', 'CNC file transfer'],
    ['cnc-program-transfer', 'انتقال برنامه CNC', 'CNC program transfer'],
    ['dnc', 'DNC', 'DNC'],
    ['nc-file-transfer', 'انتقال فایل NC', 'NC file transfer'],
    ['rs232', 'RS-232 CNC', 'RS-232 CNC'],
    ['cnc-networking', 'شبکه CNC', 'CNC networking'],
    ['cnc-communication', 'ارتباط CNC', 'CNC communication'],
    ['cnc-program-management', 'مدیریت برنامه CNC', 'CNC program management'],
  ];
  for (const [tagSlug, fa, en] of tagDefinitions) {
    await knex('tags').insert({ slug: tagSlug, name_fa: fa, name_en: en }).onConflict('slug').merge(['name_fa', 'name_en']);
  }
  const tagRows = await knex('tags').select('id').whereIn('slug', tagDefinitions.map(([tagSlug]) => tagSlug));

  await knex.transaction(async (trx) => {
    const nextRevision = Number(current.current_revision_number) + 1;
    await trx('posts').where({ id: current.id }).update({
      category_id: category.id,
      title_en: 'CNC File Transfer: Methods, Setup, and Common Errors',
      excerpt_en: 'A practical, controller-aware guide to CNC file transfer methods, setup choices, compatibility checks, troubleshooting, security, and safer program-management workflows.',
      body_en: JSON.stringify(bodyEn),
      cover_image_path: current.cover_image_path || '/images/recommendations/programmer-dnc-workbench.webp',
      cover_alt_en: 'CNC file transfer and DNC workflow for an industrial machine controller',
      seo_title_en: 'CNC File Transfer: Methods, Setup, and Common Errors',
      seo_description_en: 'Learn CNC file transfer: practical methods, setup choices, compatibility checks, common errors, and a safer workflow for CNC program transfer.',
      focus_keyword_en: 'CNC file transfer',
      secondary_keywords_en: 'CNC program transfer, NC file transfer, transfer files to CNC, CNC networking, RS-232 CNC file transfer, DNC, CNC communication',
      canonical_url_en: '/en/blog/cnc-file-transfer-guide',
      robots_index: true,
      schema_type: 'TechArticle',
      og_title_en: 'CNC File Transfer: Methods, Setup, and Common Errors',
      og_description_en: 'Compare CNC file transfer methods, configure reliable communication, and troubleshoot common program-transfer errors.',
      status: 'draft',
      translation_status: 'complete',
      scheduled_for: null,
      published_at: null,
      updated_by: author.id,
      current_revision_number: nextRevision,
      updated_at: trx.fn.now(),
    });
    await trx('post_tags').where({ post_id: current.id }).delete();
    await trx('post_tags').insert(tagRows.map(({ id }) => ({ post_id: current.id, tag_id: id })));
    const updated = await trx('posts').where({ id: current.id }).first();
    await trx('post_revisions').insert({
      post_id: current.id,
      revision_number: nextRevision,
      created_by: author.id,
      change_summary: 'Imported EN-EC-001 publication DOCX with complete SEO metadata',
      snapshot: JSON.stringify({
        slug: updated.slug, categoryId: updated.category_id, titleFa: updated.title_fa, titleEn: updated.title_en,
        excerptFa: updated.excerpt_fa, excerptEn: updated.excerpt_en, bodyFa: JSON.parse(updated.body_fa), bodyEn,
        coverImagePath: updated.cover_image_path, coverAltFa: updated.cover_alt_fa, coverAltEn: updated.cover_alt_en,
        coverCaptionFa: updated.cover_caption_fa, coverCaptionEn: updated.cover_caption_en,
        seoTitleFa: updated.seo_title_fa, seoTitleEn: updated.seo_title_en,
        seoDescriptionFa: updated.seo_description_fa, seoDescriptionEn: updated.seo_description_en,
        focusKeywordFa: updated.focus_keyword_fa, focusKeywordEn: updated.focus_keyword_en,
        secondaryKeywordsFa: updated.secondary_keywords_fa, secondaryKeywordsEn: updated.secondary_keywords_en,
        canonicalUrlFa: updated.canonical_url_fa, canonicalUrlEn: updated.canonical_url_en,
        robotsIndex: updated.robots_index, schemaType: updated.schema_type,
        ogTitleFa: updated.og_title_fa, ogTitleEn: updated.og_title_en,
        ogDescriptionFa: updated.og_description_fa, ogDescriptionEn: updated.og_description_en,
        status: updated.status, translationStatus: updated.translation_status, scheduledFor: updated.scheduled_for,
        tagIds: tagRows.map(({ id }) => id),
      }),
    });
  });
  process.stdout.write(`Imported EN-EC-001 as draft post ${current.id}: ${plainText(bodyEn).split(/\s+/).length} words, ${bodyEn.content?.length ?? 0} content blocks, ${tagRows.length} tags.\n`);
}

main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'Import failed'}\n`); process.exitCode = 1; }).finally(() => knex.destroy());
