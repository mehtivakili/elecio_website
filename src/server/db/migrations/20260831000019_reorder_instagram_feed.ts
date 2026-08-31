import type { Knex } from 'knex';

const posts = [
  {
    likes: 2847,
    caption: 'وقتی انتقال برنامه به CNC هنوز به کابل، فلش و رفت‌وآمد اپراتور وابسته است، هر تغییر کوچک می‌تواند زمان تولید را متوقف کند. ⚙️ در این کاروسل مسیر ساده‌تر و مطمئن‌تر مدیریت فایل را مرحله‌به‌مرحله می‌بینید؛ مسیری که خطای انسانی را کمتر و دسترسی به نسخه درست برنامه را سریع‌تر می‌کند. 🚀 ورق بزنید و تجربه کارگاه خودتان را برای ما بنویسید. #Elecio #SmartDNC #CNC #اتوماسیون_صنعتی #تولید_هوشمند',
  },
  {
    likes: 1162,
    caption: 'یک فایل اشتباه می‌تواند ساعت‌ها تنظیم، ابزار و زمان اپراتور را هدر بدهد. 🧩 با یک ساختار مشخص برای نام‌گذاری، آرشیو و ارسال برنامه‌ها، هر دستگاه دقیقاً همان نسخه‌ای را دریافت می‌کند که باید اجرا شود. در این اسلایدها نکته‌هایی را مرور کرده‌ایم که مدیریت برنامه‌های CNC را شفاف‌تر و قابل پیگیری‌تر می‌کند. ✅ #Elecio #DNC #CNCProgramming #مدیریت_تولید #ماشینکاری',
  },
  {
    likes: 3319,
    caption: 'نویز محیط صنعتی فقط یک مزاحمت ساده نیست؛ گاهی همان عامل پنهانی است که ارتباط دستگاه را ناپایدار می‌کند. ⚡ در این کاروسل درباره مسیر کابل، فاصله، حفاظت پورت و راه‌هایی صحبت می‌کنیم که انتقال برنامه را قابل اعتمادتر نگه می‌دارند. اگر در کارگاه با قطع ارتباط یا ارسال ناقص فایل روبه‌رو شده‌اید، این پست را ذخیره کنید. 🛡️ #Elecio #IndustrialNetwork #CNC #برق_صنعتی #نگهداری_و_تعمیرات',
  },
  {
    likes: 2096,
    caption: 'برنامه درست باید بدون ابهام به ماشین درست برسد. 🎯 Elecio Smart DNC کمک می‌کند فایل‌ها، دستگاه‌ها و سابقه انتقال در یک مسیر مشخص دیده شوند تا اپراتور برای پیدا کردن آخرین نسخه زمان از دست ندهد. اسلایدها را ورق بزنید و ببینید یک گردش‌کار منظم چطور سرعت و آرامش تیم تولید را بالا می‌برد. 📁 #Elecio #SmartFactory #DNCSystem #CNCکار #بهره_وری',
  },
  {
    likes: 1458,
    caption: 'آرشیو برنامه‌های CNC نباید فقط در حافظه افراد یا پوشه‌های پراکنده باقی بماند. 🗂️ یک آرشیو ساختاریافته یعنی نسخه‌ها قابل جست‌وجو باشند، تغییرات گم نشوند و تیم بداند کدام فایل برای کدام دستگاه آماده است. در این کاروسل چند اصل کاربردی برای ساختن همین نظم را مرور می‌کنیم. 💡 #Elecio #CNCFiles #DigitalFactory #آرشیو_دیجیتال #صنعت',
  },
  {
    likes: 3024,
    caption: 'عدد واقعی بهره‌وری زمانی دیده می‌شود که بدانیم ماشین چه زمانی واقعاً برنامه اجرا کرده و چه زمانی منتظر فایل، اپراتور یا رفع خطا بوده است. 📊 با شفاف شدن چرخه انتقال و اجرای برنامه، تصمیم‌های تولید از حدس فاصله می‌گیرند و به داده نزدیک می‌شوند. اسلایدها را تا آخر ببینید. 🔍 #Elecio #ProductionData #OEE #CNC #تحول_دیجیتال',
  },
  {
    likes: 978,
    caption: 'از دفتر فنی تا کنار دستگاه، هر مرحله اضافه احتمال تأخیر و اشتباه را بیشتر می‌کند. 🏭 Elecio Smart DNC این مسیر را کوتاه می‌کند تا برنامه با نظم، سرعت و کنترل بیشتر به CNC برسد. در این کاروسل تصویری ساده از تفاوت گردش‌کار سنتی و مسیر هوشمند را خواهید دید. 🔄 #Elecio #SmartDNC #Industry40 #اتوماسیون #دفتر_فنی',
  },
  {
    likes: 2471,
    caption: 'کامپیوتر کنار هر CNC همیشه بهترین پاسخ نیست؛ هزینه نگهداری، فضای اشغال‌شده و پیچیدگی شبکه می‌تواند به مرور بیشتر شود. 💻 در این پست دو روش رایج انتقال برنامه را کنار هم گذاشته‌ایم تا انتخاب مناسب برای شرایط واقعی کارگاه آسان‌تر شود. ورق بزنید و روش فعلی مجموعه‌تان را با ما مقایسه کنید. ⚖️ #Elecio #CNCNetwork #DNC #مهندسی_تولید #کارگاه',
  },
  {
    likes: 1893,
    caption: 'کابل‌کشی طولانی در محیط صنعتی می‌تواند به نقطه شکست ارتباط تبدیل شود؛ مخصوصاً جایی که نویز، حرکت تجهیزات و محدودیت مسیر وجود دارد. 🔌 این کاروسل نشان می‌دهد چرا طراحی درست ارتباط از خود کابل مهم‌تر است و چطور می‌توان ریسک قطعی را کاهش داد. پست را برای تیم فنی ذخیره کنید. 🧰 #Elecio #RS232 #CNCCommunication #تعمیرات #شبکه_صنعتی',
  },
  {
    likes: 3462,
    caption: 'مدیریت فایل و گزارش اجرای CNC وقتی ارزشمند است که ساده، سریع و قابل پیگیری باشد. ✅ با دیدن سابقه انتقال، وضعیت برنامه و دستگاه مقصد، تیم تولید تصویر روشن‌تری از اتفاقات روزانه دارد و رفع مشکل سریع‌تر انجام می‌شود. جزئیات این گردش‌کار را در اسلایدهای بعدی ببینید. 📈 #Elecio #CNCMonitoring #SmartManufacturing #مدیریت_فایل #تولید',
  },
  {
    likes: 1267,
    caption: 'هر دقیقه توقف ماشین هزینه دارد، اما بسیاری از توقف‌های کوچک در گزارش‌های روزانه دیده نمی‌شوند. ⏱️ استاندارد کردن انتقال برنامه کمک می‌کند بخشی از این زمان‌های پنهان حذف شود و اپراتور تمرکز بیشتری روی ماشین‌کاری داشته باشد. این کاروسل را ورق بزنید و نقاط اتلاف فرایند خودتان را پیدا کنید. 🔧 #Elecio #Downtime #CNC #کاهش_توقف #بهره_وری_صنعتی',
  },
  {
    likes: 2735,
    caption: 'وقتی چند برند و نسل مختلف کنترلر در یک کارگاه دارید، یک روش واحد برای همه دستگاه‌ها کار را بسیار ساده‌تر می‌کند. 🤝 از Fanuc و Siemens تا Mitsubishi و Heidenhain، هدف این است که انتقال برنامه قابل فهم و قابل کنترل باقی بماند. در این اسلایدها نگاه یکپارچه Elecio را ببینید. 🌐 #Elecio #Fanuc #SiemensCNC #DNC #ماشین_ابزار',
  },
  {
    likes: 1589,
    caption: 'محافظت از پورت ارتباطی یعنی محافظت از زمان تولید. 🛡️ نوسان برق یا اتصال نامناسب می‌تواند علاوه بر قطع انتقال، هزینه تعمیر کنترلر را هم بالا ببرد. در این کاروسل اهمیت ایزولاسیون و طراحی مطمئن ارتباط را به زبان ساده مرور کرده‌ایم. برای همکار فنی خود بفرستید. ⚡ #Elecio #PortProtection #CNCControl #ایمنی_صنعتی #برق',
  },
  {
    likes: 3194,
    caption: 'هوشمندسازی کارگاه از یک تغییر بزرگ و پرهزینه شروع نمی‌شود؛ گاهی کافی است یک فرایند پرتکرار را ساده، استاندارد و قابل اندازه‌گیری کنیم. 🚀 انتقال برنامه CNC یکی از همان نقاط شروع است. این مجموعه اسلاید را تا پایان ببینید و برای بررسی شرایط کارگاهتان با ما در ارتباط باشید. 💬 #Elecio #Industry40 #SmartWorkshop #CNC #هوشمندسازی_صنعت',
  },
] as const;

function mediaRows(postId: number, displayOrder: number) {
  const post = String(displayOrder).padStart(2, '0');
  return Array.from({ length: 6 }, (_, slideIndex) => ({
    post_id: postId,
    public_path: `/images/instagram/carousels/post-${post}/slide-${String(slideIndex + 1).padStart(2, '0')}.webp`,
    media_type: 'image',
    alt_text: `Elecio carousel ${displayOrder}, slide ${slideIndex + 1}`,
    sort_order: slideIndex,
  }));
}

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('social_instagram_posts', (table) => {
    table.integer('display_order').unsigned().notNullable().defaultTo(0).index();
    table.integer('like_count').unsigned().notNullable().defaultTo(900);
  });

  await knex('social_instagram_profiles').where({ id: 1 }).update({ followers_count: 10_800 });

  const existing = await knex('social_instagram_posts')
    .select('id')
    .where({ profile_id: 1 })
    .orderBy('id', 'asc')
    .limit(10);

  for (let index = 0; index < existing.length; index += 1) {
    await knex('social_instagram_posts').where({ id: existing[index].id }).update({
      caption: posts[index].caption,
      display_order: index + 1,
      like_count: posts[index].likes,
    });
  }

  for (let index = existing.length; index < posts.length; index += 1) {
    const displayOrder = index + 1;
    const [postId] = await knex('social_instagram_posts').insert({
      profile_id: 1,
      caption: posts[index].caption,
      status: 'draft',
      display_order: displayOrder,
      like_count: posts[index].likes,
    });
    await knex('social_instagram_post_media').insert(mediaRows(Number(postId), displayOrder));
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex('social_instagram_posts')
    .where({ profile_id: 1 })
    .whereNull('created_by')
    .where('display_order', '>', 10)
    .delete();
  await knex('social_instagram_profiles').where({ id: 1 }).update({ followers_count: 167 });
  await knex.schema.alterTable('social_instagram_posts', (table) => {
    table.dropColumn('like_count');
    table.dropColumn('display_order');
  });
}
