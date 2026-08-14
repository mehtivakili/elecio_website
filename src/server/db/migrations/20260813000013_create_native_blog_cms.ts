import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const trx = knex;
    await trx.schema.alterTable('posts', (table) => {
      table.string('translation_status', 20).notNullable().defaultTo('complete');
      table.timestamp('scheduled_for', { useTz: true }).index();
      table.uuid('updated_by').references('id').inTable('auth_users').onDelete('SET NULL');
      table.integer('current_revision_number').notNullable().defaultTo(1);
      table.string('cover_alt_fa', 500);
      table.string('cover_alt_en', 500);
      table.text('cover_caption_fa');
      table.text('cover_caption_en');
    });
    await trx.raw("alter table posts add constraint posts_translation_status_check check (translation_status in ('fa_only', 'en_only', 'complete'))");
    await trx.schema.createTable('post_revisions', (table) => {
      table.bigIncrements('id').primary(); table.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
      table.integer('revision_number').notNullable(); table.uuid('created_by').references('id').inTable('auth_users').onDelete('SET NULL');
      table.string('change_summary', 500); table.json('snapshot').notNullable(); table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.unique(['post_id', 'revision_number']); table.index(['post_id', 'created_at']);
    });
    await trx.schema.createTable('post_slug_history', (table) => {
      table.bigIncrements('id').primary(); table.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
      table.string('old_slug').notNullable().unique(); table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
    });
    await trx.schema.createTable('post_preview_tokens', (table) => {
      table.uuid('id').primary(); table.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
      table.string('token_hash', 64).notNullable().unique(); table.uuid('created_by').notNullable().references('id').inTable('auth_users').onDelete('CASCADE');
      table.timestamp('expires_at', { useTz: true }).notNullable().index(); table.timestamp('consumed_at', { useTz: true });
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
    });
    await trx.schema.createTable('media_assets', (table) => {
      table.uuid('id').primary(); table.string('storage_key', 512).notNullable().unique(); table.string('public_path', 2048).notNullable();
      table.string('mime_type', 100).notNullable(); table.bigInteger('byte_size').notNullable(); table.integer('width').notNullable(); table.integer('height').notNullable();
      table.string('checksum_sha256', 64).notNullable(); table.string('alt_fa', 500); table.string('alt_en', 500); table.text('caption_fa'); table.text('caption_en');
      table.uuid('uploaded_by').references('id').inTable('auth_users').onDelete('SET NULL'); table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.check('byte_size > 0 and byte_size <= 10485760'); table.check('width > 0 and height > 0'); table.index('created_at');
    });
    const posts = await trx('posts').select('*');
    for (const post of posts) {
      await trx('post_revisions').insert({ post_id: post.id, revision_number: 1, created_by: post.author_user_id,
        change_summary: 'Baseline migration', snapshot: JSON.stringify({ slug: post.slug, categoryId: post.category_id, titleFa: post.title_fa, titleEn: post.title_en, excerptFa: post.excerpt_fa, excerptEn: post.excerpt_en, bodyFa: post.body_fa, bodyEn: post.body_en, coverImagePath: post.cover_image_path, seoTitleFa: post.seo_title_fa, seoTitleEn: post.seo_title_en, seoDescriptionFa: post.seo_description_fa, seoDescriptionEn: post.seo_description_en, status: post.status, publishedAt: post.published_at }) });
    }
}

export async function down(knex: Knex): Promise<void> { const trx = knex;
  await trx.schema.dropTable('media_assets'); await trx.schema.dropTable('post_preview_tokens'); await trx.schema.dropTable('post_slug_history'); await trx.schema.dropTable('post_revisions');
  await trx.raw('alter table posts drop check posts_translation_status_check');
  await trx.schema.alterTable('posts', (table) => { table.dropForeign('updated_by'); table.dropColumns('translation_status','scheduled_for','updated_by','current_revision_number','cover_alt_fa','cover_alt_en','cover_caption_fa','cover_caption_en'); });
}
