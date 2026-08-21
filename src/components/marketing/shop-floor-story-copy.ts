export type StoryLocale = "fa" | "en";

export type StoryStageCopy = {
  eyebrow: string;
  title: string;
  body: string;
};

export const SHOP_FLOOR_STORY_COPY: Record<StoryLocale, StoryStageCopy[]> = {
  fa: [
    {
      eyebrow: "۰۱ — وضعیت فعلی",
      title: "شش دستگاه، شش PC و کابل‌هایی که میانشان کشیده شده",
      body: "هر کنترلر به PC، کارت سریال و مسیر کابل مستقل خودش نیاز دارد. طولانی‌ترین مسیر این کارگاه ۲۱ متر است و با جابه‌جایی دستگاه بلندتر هم می‌شود.",
    },
    {
      eyebrow: "۰۲ — نقاط خرابی",
      title: "هیچ‌چیز مشترک نیست؛ جز مشکلات",
      body: "خرابی یک PC یک دستگاه را متوقف می‌کند و کابل بلند می‌تواند انتقال را نیمه‌کاره قطع کند؛ هر مسیر تعمیر و نسخه فایل جداگانه خودش را دارد.",
    },
    {
      eyebrow: "۰۳ — حذف تجهیزات اضافی",
      title: "پنج PC و کابل‌های کف کارگاه حذف می‌شوند",
      body: "کنار هر کنترلر یک Elecio Smart DNC و یک کابل سریال کوتاه و ثابت باقی می‌ماند؛ فقط یک PC در ایستگاه مرکزی می‌ماند.",
    },
    {
      eyebrow: "۰۴ — اتصال",
      title: "یک ارسال؛ برای همه کنترلرها به‌صورت هم‌زمان",
      body: "PC مرکزی برنامه را روی شبکه کارگاه می‌فرستد و هر دستگاه همان‌جا آن را دریافت می‌کند؛ بدون کابل‌کشی طولانی روی کف.",
    },
    {
      eyebrow: "۰۵ — مدیریت مرکزی",
      title: "یک PC برای مدیریت هر شش دستگاه",
      body: "برنامه‌ها از یک نقطه به هر کنترلر می‌رسند؛ دورترین دستگاه کارگاه درست مثل نزدیک‌ترین دستگاه مدیریت می‌شود.",
    },
    {
      eyebrow: "۰۶ — قطع شبکه",
      title: "ارتباط قطع می‌شود، اما دستگاه‌ها متوقف نمی‌شوند",
      body: "برنامه در حافظه هر واحد ذخیره است و ماشین‌کاری حتی هنگام قطع ارتباط با ایستگاه بدون توقف ادامه پیدا می‌کند.",
    },
    {
      eyebrow: "۰۷ — بازگشت خودکار",
      title: "ارتباط بدون مراجعه به دستگاه دوباره برقرار می‌شود",
      body: "واحدها خودکار به شبکه برمی‌گردند، داده‌های عقب‌افتاده را دریافت می‌کنند و زمان کار و توقف را کنار بقیه دستگاه‌ها گزارش می‌دهند.",
    },
  ],
  en: [
    {
      eyebrow: "01 — the shop as it is",
      title: "Six machines. Six towers. And the cable between them.",
      body: "Every control needs its own tower, serial card, and run down the aisle. The longest here is 21 m. Move a machine and it gets longer.",
    },
    {
      eyebrow: "02 — six separate points of failure",
      title: "Nothing here is shared except the problems",
      body: "A dead tower stops one machine. A long run can interrupt a transfer. Each one is its own repair, walk across the floor, and version of the file.",
    },
    {
      eyebrow: "03 — what comes out",
      title: "Five towers go. So does the floor cable.",
      body: "One Elecio mounts at each control. A short serial jumper remains per machine, and one tower stays at the central station.",
    },
    {
      eyebrow: "04 — the link",
      title: "One send, every control at once",
      body: "The central PC pushes the program over the shop network. Each unit receives it at its own machine, with no long cable run across the floor.",
    },
    {
      eyebrow: "05 — central management",
      title: "One PC left. Handling all six.",
      body: "Programs go from one place to any control on the floor. The far corner is managed just like the machine next to the bench.",
    },
    {
      eyebrow: "06 — when the network drops",
      title: "The link goes down. The machines do not.",
      body: "Each unit already holds the program in its own memory, so machining continues even while its connection to the station is unavailable.",
    },
    {
      eyebrow: "07 — automatic recovery",
      title: "The link returns on its own",
      body: "Units reconnect without a visit, receive what they missed, and report run time and idle time alongside the rest of the shop.",
    },
  ],
};
