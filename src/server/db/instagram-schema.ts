import type { Knex } from 'knex';

export async function instagramSchemaReady(database: Knex | Knex.Transaction): Promise<boolean> {
  const [profiles, posts, media, displayOrder, likeCount] = await Promise.all([
    database.schema.hasTable('social_instagram_profiles'),
    database.schema.hasTable('social_instagram_posts'),
    database.schema.hasTable('social_instagram_post_media'),
    database.schema.hasColumn('social_instagram_posts', 'display_order'),
    database.schema.hasColumn('social_instagram_posts', 'like_count'),
  ]);
  return profiles && posts && media && displayOrder && likeCount;
}
