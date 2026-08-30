import type { Knex } from 'knex';

const captions = [
  'کامپیوتر کنار هر CNC واقعاً لازم است؟ در این کاروسل هزینه‌ها و پیچیدگی‌های این مسیر را مرور می‌کنیم.',
  'یک مسیر ساده‌تر برای انتقال برنامه به CNC؛ بدون کامپیوتر اضافه کنار هر ماشین.',
  'کابل بلند فقط یک کابل نیست؛ نویز و قطعی می‌تواند کل انتقال برنامه را درگیر کند.',
  'فایل درست، روی ماشین درست؛ مدیریت فایل CNC باید واضح و قابل پیگیری باشد.',
  'آرشیو برنامه‌ها را از حافظه آدم‌ها جدا کنید و به یک ساختار مشخص بسپارید.',
  'زمان واقعی کارکرد ماشین را از روی اجرای برنامه‌ها ببینید، نه بر اساس حدس.',
  'Elecio Smart DNC مسیر دفتر فنی تا CNC را کوتاه‌تر و قابل‌کنترل‌تر می‌کند.',
  'مقایسه مسیر سنتی انتقال برنامه با یک دستگاه مستقل کنار هر CNC.',
  'کابل‌کشی طولانی در محیط صنعتی چطور به یک نقطه شکست تبدیل می‌شود؟',
  'مدیریت فایل و گزارش اجرای CNC در یک مسیر شفاف و قابل پیگیری.',
];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('social_instagram_profiles', (table) => {
    table.tinyint('id').unsigned().primary();
    table.string('username', 64).notNullable().unique();
    table.string('display_name', 200).notNullable();
    table.text('bio').notNullable();
    table.string('website_url', 2048);
    table.string('avatar_path', 2048).notNullable();
    table.integer('followers_count').unsigned().notNullable().defaultTo(0);
    table.integer('following_count').unsigned().notNullable().defaultTo(0);
    table.string('external_account_id', 191);
    table.timestamps(true, true);
    table.check('id = 1');
  });

  await knex.schema.createTable('social_instagram_posts', (table) => {
    table.bigIncrements('id').primary();
    table.tinyint('profile_id').unsigned().notNullable().references('id').inTable('social_instagram_profiles').onDelete('CASCADE');
    table.text('caption').notNullable();
    table.string('status', 24).notNullable().defaultTo('draft');
    table.timestamp('scheduled_for', { useTz: true }).index();
    table.timestamp('published_at', { useTz: true });
    table.string('external_post_id', 191).unique();
    table.text('last_publish_error');
    table.uuid('created_by').references('id').inTable('auth_users').onDelete('SET NULL');
    table.uuid('updated_by').references('id').inTable('auth_users').onDelete('SET NULL');
    table.timestamps(true, true);
    table.check("status in ('draft', 'scheduled', 'publishing', 'published', 'failed')");
    table.index(['profile_id', 'created_at']);
    table.index(['status', 'scheduled_for']);
  });

  await knex.schema.createTable('social_instagram_post_media', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('post_id').unsigned().notNullable().references('id').inTable('social_instagram_posts').onDelete('CASCADE');
    table.string('public_path', 2048).notNullable();
    table.string('media_type', 16).notNullable().defaultTo('image');
    table.string('alt_text', 500);
    table.tinyint('sort_order').unsigned().notNullable();
    table.integer('width').unsigned();
    table.integer('height').unsigned();
    table.string('external_media_id', 191);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.unique(['post_id', 'sort_order']);
    table.check("media_type in ('image', 'video')");
  });

  await knex('social_instagram_profiles').insert({
    id: 1,
    username: 'elecio_co',
    display_name: 'الکسیو | انتقال برنامه سی ان سی',
    bio: '⚙️ کارگاه سی‌ان‌سی‌ت رو هوشمند کن\n🏭 انتقال راحت برنامه و جی‌کد به دستگاه\n🛡️ محافظت از پورت در برابر نوسان برق\n👇 برای مشاوره رایگان پیام بده',
    website_url: 'https://www.elecio.co',
    avatar_path: '/icon.png',
    followers_count: 167,
    following_count: 225,
  });

  for (let index = 0; index < captions.length; index += 1) {
    const [postId] = await knex('social_instagram_posts').insert({
      profile_id: 1,
      caption: captions[index],
      status: 'draft',
    });
    const post = String(index + 1).padStart(2, '0');
    await knex('social_instagram_post_media').insert(
      Array.from({ length: 6 }, (_, slideIndex) => ({
        post_id: postId,
        public_path: `/images/instagram/carousels/post-${post}/slide-${String(slideIndex + 1).padStart(2, '0')}.webp`,
        media_type: 'image',
        alt_text: `اسلاید ${slideIndex + 1} از کاروسل آموزشی Elecio Smart DNC`,
        sort_order: slideIndex,
      }))
    );
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('social_instagram_post_media');
  await knex.schema.dropTableIfExists('social_instagram_posts');
  await knex.schema.dropTableIfExists('social_instagram_profiles');
}
