import { redirect } from 'next/navigation';
import { InstagramStudio, type InstagramPost, type InstagramProfile } from '@/components/admin/InstagramStudio';
import { can } from '@/server/auth/rbac';
import { getStaffPrincipal } from '@/server/auth/staff-flow';
import { instagramSchemaReady } from '@/server/db/instagram-schema';
import { knex } from '@/server/db/knex';

export const dynamic = 'force-dynamic';

export default async function InstagramStudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const staff = await getStaffPrincipal();
  if (!staff) redirect(`/${locale}/admin/login`);
  if (!can(staff.role, 'social', 'read')) redirect(`/${locale}/admin`);
  if (!await instagramSchemaReady(knex)) {
    return <main style={{ minHeight: '100vh', padding: '8rem 2rem', color: 'white', background: '#000' }}><h1>Instagram Studio</h1><p>{locale === 'en' ? 'Run the pending database migration to initialize Instagram Studio.' : 'برای راه‌اندازی استودیو اینستاگرام، migration جدید دیتابیس را اجرا کنید.'}</p></main>;
  }
  const [profileRow, postRows, mediaRows] = await Promise.all([
    knex('social_instagram_profiles').where({ id: 1 }).first(),
    knex('social_instagram_posts').where({ profile_id: 1 }).orderBy('id', 'desc'),
    knex('social_instagram_post_media').orderBy(['post_id', 'sort_order']),
  ]);
  if (!profileRow) throw new Error('INSTAGRAM_PROFILE_NOT_FOUND');
  const mediaByPost = new Map<number, InstagramPost['media']>();
  for (const row of mediaRows) {
    const postId = Number(row.post_id); const media = mediaByPost.get(postId) ?? [];
    media.push({ id: Number(row.id), path: row.public_path, alt: row.alt_text ?? '', sortOrder: Number(row.sort_order) }); mediaByPost.set(postId, media);
  }
  const profile: InstagramProfile = {
    username: profileRow.username, displayName: profileRow.display_name, bio: profileRow.bio,
    websiteUrl: profileRow.website_url, avatarPath: profileRow.avatar_path,
    followers: Number(profileRow.followers_count), following: Number(profileRow.following_count),
  };
  const posts: InstagramPost[] = postRows.map((row) => ({
    id: Number(row.id), caption: row.caption, status: row.status,
    scheduledFor: row.scheduled_for ? new Date(row.scheduled_for).toISOString() : null,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(), media: mediaByPost.get(Number(row.id)) ?? [],
  })).filter((post) => post.media.length > 0);
  return <InstagramStudio locale={locale} profile={profile} initialPosts={posts} />;
}
