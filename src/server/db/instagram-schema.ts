import type { Knex } from 'knex';

export async function instagramSchemaReady(database: Knex | Knex.Transaction): Promise<boolean> {
  const [profiles, posts, media] = await Promise.all([
    database.schema.hasTable('social_instagram_profiles'),
    database.schema.hasTable('social_instagram_posts'),
    database.schema.hasTable('social_instagram_post_media'),
  ]);
  return profiles && posts && media;
}
