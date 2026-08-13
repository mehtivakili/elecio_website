import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AboutStory } from '@/components/about/AboutStory';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import styles from './page.module.css';
import { localizedPageMetadata } from '@/lib/seo';

type AboutCopy = {
  hero: { eyebrow: string; title: string; lead: string; imageAlt: string; caption: string };
  facts: Array<{ value: string; label: string }>;
  origin: { eyebrow: string; title: string; body: string };
  evolution: { eyebrow: string; title: string; intro: string; items: Array<{ title: string; body: string; alt: string }> };
  principles: { eyebrow: string; title: string; items: Array<{ number: string; title: string; body: string }> };
  team: { eyebrow: string; title: string; intro: string; people: Array<{ name: string; field: string }> };
  final: { title: string; body: string; product: string; contact: string };
};

const COPY: Record<AppLocale, AboutCopy> = {
  fa: {
    hero: {
      eyebrow: 'درباره ElecIO',
      title: 'محصولی که در کارگاه شکل گرفت، نه فقط روی کاغذ.',
      lead: 'این محصول نتیجه بیش از سه سال ساخت، آزمون و اصلاح پیوسته است؛ مسیری از نمونه‌های اولیه دست‌ساز تا Smart DNC، دستگاهی مستقل برای ارتباط مطمئن‌تر با CNC.',
      imageAlt: 'سه دستگاه ElecIO Smart DNC از نسل توسعه‌یافته محصول',
      caption: 'نسل توسعه‌یافته Smart DNC · نتیجه چندین چرخه ساخت و آزمون',
    },
    facts: [
      { value: '+۳ سال', label: 'توسعه مستمر' },
      { value: '۴ نسل', label: 'ثبت‌شده در تصاویر واقعی' },
      { value: 'کارگاه واقعی', label: 'محل آزمون و یادگیری' },
    ],
    origin: {
      eyebrow: 'داستان ما',
      title: 'هر مسئله، یک نسخه بهتر ساخت.',
      body: 'تیم ElecIO بیش از سه سال روی Smart DNC کار کرده است. محصول بارها ساخته، آزمایش و بازطراحی شد؛ از مدار و بدنه تا رابط کاربری و شیوه اتصال به ماشین. بازخورد کارگاه‌ها مسیر توسعه را مشخص کرد و هر نسخه، پاسخ دقیق‌تری به نیاز واقعی اپراتور و دفتر فنی بود.',
    },
    evolution: {
      eyebrow: 'روند تکامل',
      title: 'از اولین برد تا یک محصول یکپارچه.',
      intro: 'این تصاویر از پروژه قبلی، بخشی از مسیر واقعی توسعه را نشان می‌دهند؛ نه رندر تبلیغاتی، بلکه نسخه‌هایی که برای یادگیری ساخته شدند.',
      items: [
        { title: 'اثبات ایده', body: 'مدار، نمایشگر و ارتباطات در یک محفظه شفاف؛ جایی که معماری اولیه محصول آزموده شد.', alt: 'اولین نمونه شفاف ElecIO Smart DNC روی میز توسعه' },
        { title: 'ورود به محیط کار', body: 'بدنه مقاوم‌تر و کنترل‌های ساده‌تر برای ارزیابی تجربه استفاده کنار ماشین.', alt: 'نمونه اولیه مشکی ElecIO نصب‌شده در محیط کارگاهی' },
        { title: 'یکپارچگی صنعتی', body: 'نمایشگر، کلیدها و بدنه در یک فرم فشرده‌تر به هم رسیدند و زبان محصول شکل گرفت.', alt: 'نمونه توسعه‌یافته ElecIO Smart DNC با نمایشگر روشن' },
        { title: 'محصول امروز', body: 'پس از چندین چرخه ساخت و آزمون، سخت‌افزار به یک دستگاه مستقل، منسجم و آماده استقرار کنار CNC تبدیل شد.', alt: 'سه دستگاه ElecIO Smart DNC از نسل فعلی محصول' },
      ],
    },
    principles: {
      eyebrow: 'روش کار',
      title: 'ساختن، آزمودن، بهتر کردن.',
      items: [
        { number: '01', title: 'مهندسی با جزئیات', body: 'انتخاب قطعه، مونتاژ، بدنه و کنترل کیفیت به‌عنوان یک سیستم واحد دیده می‌شوند.' },
        { number: '02', title: 'آزمون در شرایط واقعی', body: 'محصول روی ماشین‌ها و در کارگاه‌ها ارزیابی شد تا مشکلات واقعی، نه فرضی، آشکار شوند.' },
        { number: '03', title: 'یادگیری از مشتری', body: 'بازخورد اپراتور و دفتر فنی مستقیماً وارد چرخه بعدی طراحی و نرم‌افزار می‌شود.' },
      ],
    },
    team: {
      eyebrow: 'تیم سازنده',
      title: 'سه تخصص، یک محصول.',
      intro: 'ترکیب تجربه صنعت، کنترل و مکاترونیک پشت توسعه سخت‌افزار و نرم‌افزار ElecIO قرار دارد.',
      people: [
        { name: 'مهندس مشایخ', field: 'صنایع · دانشگاه گرمسار' },
        { name: 'مهندس وکیلی', field: 'کنترل · دانشگاه خواجه نصیر' },
        { name: 'مهندس ساکی', field: 'مکاترونیک · دانشگاه خواجه نصیر' },
      ],
    },
    final: {
      title: 'مسیر توسعه ادامه دارد.',
      body: 'Smart DNC با تجربه نصب‌های واقعی و نیازهای تازه کارگاه‌ها بهتر می‌شود.',
      product: 'مشاهده محصول',
      contact: 'گفت‌وگو با تیم ElecIO',
    },
  },
  en: {
    hero: {
      eyebrow: 'About ElecIO',
      title: 'Built in the workshop, not only on paper.',
      lead: 'Smart DNC is the result of more than three years of continuous building, testing, and refinement—from handmade prototypes to an independent device for more reliable CNC communication.',
      imageAlt: 'Three ElecIO Smart DNC devices from a developed product generation',
      caption: 'A developed Smart DNC generation · shaped through repeated build-and-test cycles',
    },
    facts: [
      { value: '3+ years', label: 'Continuous development' },
      { value: '4 generations', label: 'Documented in real photographs' },
      { value: 'Real workshops', label: 'Where testing and learning happen' },
    ],
    origin: {
      eyebrow: 'Our story',
      title: 'Every problem produced a better version.',
      body: 'The ElecIO team has worked on Smart DNC for more than three years. The product was repeatedly built, tested, and redesigned—from its electronics and enclosure to its interface and machine connection. Workshop feedback directed the process, and each version answered the real needs of operators and engineering teams more precisely.',
    },
    evolution: {
      eyebrow: 'Product evolution',
      title: 'From the first board to one integrated product.',
      intro: 'These photographs from the previous project document the actual development path. They are not advertising renders; they are versions built to learn from.',
      items: [
        { title: 'Proof of concept', body: 'Electronics, display, and communication hardware in a clear enclosure—the first test of the product architecture.', alt: 'First transparent ElecIO Smart DNC prototype on a development desk' },
        { title: 'Into the workshop', body: 'A stronger enclosure and simpler controls prepared the device for evaluation beside real machines.', alt: 'Early black ElecIO prototype installed in a workshop environment' },
        { title: 'Industrial integration', body: 'Display, controls, and enclosure converged into a more compact form and a recognizable product language.', alt: 'Developed ElecIO Smart DNC prototype with illuminated display' },
        { title: 'The product today', body: 'After repeated build-and-test cycles, the hardware became one independent, coherent device ready for deployment beside a CNC.', alt: 'Three ElecIO Smart DNC devices from the current product generation' },
      ],
    },
    principles: {
      eyebrow: 'How we work',
      title: 'Build. Test. Improve.',
      items: [
        { number: '01', title: 'Engineering the details', body: 'Components, assembly, enclosure design, and quality control are treated as one system.' },
        { number: '02', title: 'Testing in real conditions', body: 'The product was evaluated on machines and in workshops, exposing real problems rather than imagined ones.' },
        { number: '03', title: 'Learning from customers', body: 'Feedback from operators and engineering teams feeds directly into the next hardware and software cycle.' },
      ],
    },
    team: {
      eyebrow: 'The team',
      title: 'Three disciplines. One product.',
      intro: 'Experience across industry, control engineering, and mechatronics supports ElecIO hardware and software development.',
      people: [
        { name: 'Engineer Mashayekh', field: 'Industrial Engineering · Garmsar University' },
        { name: 'Engineer Vakili', field: 'Control Engineering · K. N. Toosi University' },
        { name: 'Engineer Saki', field: 'Mechatronics · K. N. Toosi University' },
      ],
    },
    final: {
      title: 'The development continues.',
      body: 'Smart DNC keeps improving through real installations and the changing needs of workshops.',
      product: 'Explore the product',
      contact: 'Talk to the ElecIO team',
    },
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === 'fa' ? 'درباره ElecIO | داستان توسعه Smart DNC' : 'About ElecIO | The Smart DNC Development Story';
  const description = locale === 'fa'
    ? 'داستان بیش از سه سال توسعه، نمونه‌سازی و آزمون واقعی ElecIO Smart DNC و معرفی تیم سازنده.'
    : 'The story of more than three years of prototyping, workshop testing, and continuous ElecIO Smart DNC development.';
  return localizedPageMetadata(locale, 'about', title, description, '/images/about/prototype-4.webp');
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeValue } = await params;
  const locale = localeValue as AppLocale;
  setRequestLocale(locale);
  const copy = COPY[locale];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{copy.hero.eyebrow}</p>
          <h1>{copy.hero.title}</h1>
          <p className={styles.heroLead}>{copy.hero.lead}</p>
        </div>
        <div className={styles.facts}>
          {copy.facts.map((fact) => <div key={fact.label}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}
        </div>
      </section>

      <section id="about-story" className={styles.narrative}>
        <header className={styles.storyIntro}>
          <p className={styles.eyebrow}>{copy.origin.eyebrow}</p>
          <h2>{copy.origin.title}</h2>
          <p>{copy.origin.body}</p>
        </header>
        <AboutStory
          label={copy.evolution.intro}
          chapters={copy.evolution.items.map((item, index) => ({
            ...item,
            number: String(index + 1).padStart(2, '0'),
            image: `/images/about/prototype-${index + 1}.webp`,
          }))}
        />
      </section>

      <section className={styles.principles}>
        <header>
          <p className={styles.eyebrow}>{copy.principles.eyebrow}</p>
          <h2>{copy.principles.title}</h2>
        </header>
        <div className={styles.principleList}>
          {copy.principles.items.map((item) => (
            <article key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.team}>
        <div className={styles.teamIntro}>
          <p className={styles.eyebrow}>{copy.team.eyebrow}</p>
          <h2>{copy.team.title}</h2>
          <p>{copy.team.intro}</p>
        </div>
        <div className={styles.people}>
          {copy.team.people.map((person, index) => (
            <article key={person.name}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{person.name}</h3><p>{person.field}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.final}>
        <h2>{copy.final.title}</h2>
        <p>{copy.final.body}</p>
        <div>
          <Link className={styles.primary} href="/product">{copy.final.product}</Link>
          <Link className={styles.secondary} href="/contact">{copy.final.contact}</Link>
        </div>
      </section>
    </main>
  );
}
