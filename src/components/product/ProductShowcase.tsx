import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { ORDER_URL } from '@/lib/site-constants';
import styles from './ProductShowcase.module.css';
import experience from './ProductExperience.module.css';
import { ProductSectionDock } from './ProductSectionDock';
import { CompatibilityOrbit } from './CompatibilityOrbit';

type ProductCopy = {
  nav: { product: string; overview: string; capabilities: string; specs: string; order: string };
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    primary: string;
    secondary: string;
    imageAlt: string;
  };
  proof: Array<{ value: string; label: string }>;
  highlights: {
    eyebrow: string;
    title: string;
    items: Array<{ number: string; title: string; body: string; image: string; alt: string }>;
  };
  architecture: {
    eyebrow: string;
    title: string;
    body: string;
    steps: string[];
    resultLabel: string;
    result: string;
  };
  less: {
    eyebrow: string;
    title: string;
    items: Array<{ title: string; body: string }>;
  };
  hardware: {
    eyebrow: string;
    title: string;
    body: string;
    imageAlt: string;
    specs: Array<{ value: string; label: string; detail: string }>;
  };
  software: {
    eyebrow: string;
    title: string;
    body: string;
    imageAlt: string;
    platforms: string[];
    features: Array<{ title: string; body: string }>;
  };
  reporting: {
    eyebrow: string;
    title: string;
    body: string;
    formulaA: string;
    formulaB: string;
    formulaResult: string;
    metrics: string[];
    note: string;
  };
  compatibility: {
    eyebrow: string;
    title: string;
    body: string;
    controllers: string[];
    protocols: Array<{ title: string; body: string }>;
    caveat: string;
  };
  operator: {
    eyebrow: string;
    title: string;
    body: string;
    steps: Array<{ number: string; title: string; body: string }>;
    tags: string[];
  };
  specs: {
    eyebrow: string;
    title: string;
    intro: string;
    groups: Array<{ title: string; rows: Array<{ label: string; value: string }> }>;
  };
  deployment: {
    eyebrow: string;
    title: string;
    body: string;
    sendLabel: string;
    send: string[];
    steps: Array<{ number: string; title: string; body: string }>;
  };
  support: Array<{ value: string; label: string }>;
  final: {
    eyebrow: string;
    title: string;
    body: string;
    order: string;
    contact: string;
    catalog: string;
    features: string;
    sourceNote: string;
  };
};

const PRODUCT_COPY: Record<AppLocale, ProductCopy> = {
  en: {
    nav: { product: 'Smart DNC', overview: 'Overview', capabilities: 'Capabilities', specs: 'Tech specs', order: 'Order' },
    hero: {
      eyebrow: 'ELECIO SMART DNC · 2026',
      title: 'The shortest path from engineering to CNC.',
      lead: 'Less PC. Less cable. Less downtime. One independent device beside every machine—built for wireless NC transfer, serial-port protection, and traceable shift reporting.',
      primary: 'Order Smart DNC',
      secondary: 'Explore the technology',
      imageAlt: 'Black and white ElecIO Smart DNC devices on a studio platform',
    },
    proof: [
      { value: '1 : 1', label: 'Independent device per CNC' },
      { value: '8GB', label: 'Internal program storage' },
      { value: '3', label: 'Windows, Android, and Web' },
      { value: '12 mo', label: 'Product warranty' },
    ],
    highlights: {
      eyebrow: 'Get the highlights',
      title: 'Built around the machine. Designed around the work.',
      items: [
        {
          number: '01',
          title: 'Independent at every CNC.',
          body: 'Central software manages the file flow, but production does not depend on one central serial server or one old PC. Every CNC receives programs through its own ElecIO device.',
          image: '/images/recommendations/programmer-dnc-interface.webp',
          alt: 'Black and white ElecIO devices presented together',
        },
        {
          number: '02',
          title: 'A shorter, safer serial path.',
          body: 'The network carries the long-distance transfer. A short compatible DNC cable remains beside the machine, reducing cable noise, repeated port handling, and avoidable failure points.',
          image: '/images/recommendations/operator-dnc-floor.webp',
          alt: 'ElecIO Smart DNC viewed from above with its short serial connector visible',
        },
        {
          number: '03',
          title: 'Production time becomes visible.',
          body: 'Program start, end, successful runs, cycle gaps, preparation, and idle time are captured in a traceable flow for engineering and management.',
          image: '/images/recommendations/owner-dnc-installed.webp',
          alt: 'ElecIO Smart DNC installed beside an industrial machine',
        },
      ],
    },
    architecture: {
      eyebrow: 'Local execution. Central control.',
      title: 'One software environment. One independent device beside each CNC.',
      body: 'Prepare the NC file in engineering, choose the target machine, and send it over the network. ElecIO receives it locally and passes it to the CNC over a short serial connection—then logs the result.',
      steps: ['Prepare in engineering', 'Select target CNC', 'Send by network / Wi‑Fi', 'Receive on ElecIO', 'Short serial link to CNC', 'Log time and result'],
      resultLabel: 'Result for the shop',
      result: 'Fewer PCs, fewer cables, less dependency, and better file control.',
    },
    less: {
      eyebrow: 'What leaves the machine area',
      title: 'Remove the clutter. Keep the capability.',
      items: [
        { title: 'The extra PC', body: 'No separate case, monitor, Windows installation, transfer software, and maintenance burden beside every CNC.' },
        { title: 'The long RS‑232 run', body: 'Avoid long workshop cable routes that are exposed to electrical noise, dropouts, incomplete transfers, and costly rerouting.' },
        { title: 'Scattered file versions', body: 'Move programs out of USB drives and disconnected folders into a machine- or job-based archive with transfer history.' },
        { title: 'A single point of failure', body: 'Each machine-side device executes independently; one central serial server does not stop the whole line.' },
      ],
    },
    hardware: {
      eyebrow: 'Hardware',
      title: 'Industrial hardware, ready beside every CNC.',
      body: 'The device is purpose-built for stable machine-side operation and serial communication. It stores essential programs locally and connects the machine to the workshop network without a dedicated PC.',
      imageAlt: 'Close view of the black ElecIO Smart DNC controls and serial connector',
      specs: [
        { value: 'Dual‑core', label: 'Processor', detail: 'Stable local operation and serial communication handling.' },
        { value: '8GB', label: 'Internal storage', detail: 'Programs, archives, and essential backups remain available beside the machine.' },
        { value: 'Wi‑Fi', label: 'Built in', detail: 'Strong-coverage wireless networking without long DNC cabling.' },
        { value: 'DNC', label: 'Compatible cable', detail: 'A short, controlled connection to the CNC serial port.' },
        { value: 'Isolated', label: 'Serial-port path', detail: 'Designed to protect the sensitive CNC communication port against sudden voltage spikes.' },
        { value: 'Machine-side', label: 'Operator interface', detail: 'Receive, check, and run without returning to an office PC.' },
      ],
    },
    software: {
      eyebrow: 'ElecIO management software',
      title: 'Manage, send, archive, and report from one clear interface.',
      body: 'Select a CNC, organize the job, send the program, and monitor status. Engineering controls the file flow while the operator gets a focused machine-side experience.',
      imageAlt: 'ElecIO Smart DNC beside machining tools and a programming workstation',
      platforms: ['Windows', 'Android', 'Web App'],
      features: [
        { title: 'Folders that follow production', body: 'Organize programs by job, part, or machine, with descriptions, tags, and clear file versions.' },
        { title: 'Transfer status monitoring', body: 'See progress, connection errors, incomplete transfers, time, user, and target CNC.' },
        { title: 'Grouped programs', body: 'Keep multiple files together for one job or a production sequence.' },
        { title: 'Auto repeat', body: 'Prepare the next run faster for repeat and serial production.' },
        { title: 'Archive and backup', body: 'Retain program history, essential backups, saved communication parameters, and the record of what was sent.' },
        { title: 'Linked run history', body: 'Connect the active program, transfer result, runtime, and successful runs in one traceable record.' },
      ],
    },
    reporting: {
      eyebrow: 'Shift reporting',
      title: 'Numbers that actually help the shop.',
      body: 'ElecIO records program execution with date and time so runtime, idle time, preparation, and the gap between cycles can be reviewed instead of guessed.',
      formulaA: 'Shift time',
      formulaB: 'Actual run time',
      formulaResult: 'Time to review and improve',
      metrics: ['Program runtime', 'Time between cycles', 'Part loading', 'Setup and zeroing', 'Tool or material change', 'Waiting time', 'Successful runs', 'End-of-shift machine view'],
      note: 'The purpose is not to blame people. It is to find repeated delays and reduce machine downtime.',
    },
    compatibility: {
      eyebrow: 'Communication',
      title: 'Built for the controllers already running industry.',
      body: 'Standard flow control covers common serial setups, while dedicated Heidenhain support opens a faster networked route.',
      controllers: ['FANUC', 'SIEMENS', 'HEIDENHAIN', 'MITSUBISHI', 'HAAS', 'CHARMILLES'],
      protocols: [
        { title: 'XON / XOFF', body: 'Software flow control for standard serial communication.' },
        { title: 'CTS / RTS', body: 'Hardware flow control for compatible CNC serial configurations.' },
        { title: 'TNC Server', body: 'Compatible with the established Heidenhain communication workflow.' },
        { title: 'LSV2', body: 'Higher-speed Heidenhain transfer and a networked alternative to legacy file movement.' },
      ],
      caveat: 'Final compatibility is verified before purchase from the exact control model, port type, cable requirements, communication parameters, and machine condition.',
    },
    operator: {
      eyebrow: 'At the machine',
      title: 'Receive. Check. Run.',
      body: 'The program is already on the device. The operator stays beside the CNC and follows a short, clear workflow instead of managing a PC and cable setup.',
      steps: [
        { number: '01', title: 'Receive', body: 'Engineering sends the program into a clear folder on the ElecIO device beside the CNC.' },
        { number: '02', title: 'Check', body: 'Confirm the file name, folder, description, and job note to reduce wrong-file selection.' },
        { number: '03', title: 'Run', body: 'Send the verified program to the CNC control and begin production.' },
      ],
      tags: ['Grouped programs', 'Auto repeat', 'Sleep / standby mode'],
    },
    specs: {
      eyebrow: 'Complete catalogue specification',
      title: 'Every stated capability. In one place.',
      intro: 'The tables below consolidate the 2026 product catalogue and technical-features sheet. Values not published in those documents are intentionally not invented here.',
      groups: [
        {
          title: 'Hardware & deployment',
          rows: [
            { label: 'Deployment model', value: 'One independent ElecIO Smart DNC installed beside each CNC' },
            { label: 'Processor', value: 'Powerful dual-core processor' },
            { label: 'Internal storage', value: '8GB for programs, archives, and essential backups' },
            { label: 'Machine connection', value: 'Short compatible DNC / serial cable' },
            { label: 'Wireless connection', value: 'Built-in Wi‑Fi with strong coverage' },
            { label: 'Serial-port protection', value: 'Internal isolated protection path against sudden voltage spikes' },
            { label: 'Operator interface', value: 'Dedicated machine-side receive, check, and run interface' },
            { label: 'PC requirement beside CNC', value: 'No separate PC required' },
          ],
        },
        {
          title: 'Communication & compatibility',
          rows: [
            { label: 'Main transfer path', value: 'Workshop network / Wi‑Fi to ElecIO; short serial link from ElecIO to CNC' },
            { label: 'Serial flow control', value: 'XON/XOFF and CTS/RTS' },
            { label: 'Heidenhain', value: 'TNC Server compatibility and LSV2 support for higher transfer speed' },
            { label: 'Controller families', value: 'FANUC, SIEMENS, HEIDENHAIN, MITSUBISHI, HAAS, CHARMILLES' },
            { label: 'Parameter handling', value: 'Machine communication parameters can be saved' },
            { label: 'Compatibility approval', value: 'Checked per control model, port type, parameters, cable, and machine condition before purchase' },
          ],
        },
        {
          title: 'Software & file control',
          rows: [
            { label: 'Platforms', value: 'Windows, Android, and Web App' },
            { label: 'Device discovery', value: 'Discovery of ElecIO devices on the network' },
            { label: 'File organization', value: 'Folders by job, part, or machine; descriptions and tags' },
            { label: 'Targeting', value: 'Select the destination CNC before transfer' },
            { label: 'Transfer monitoring', value: 'Progress, result, connection errors, and incomplete transfer visibility' },
            { label: 'Grouped programs', value: 'Multiple files grouped for one job or sequence' },
            { label: 'Repeat work', value: 'Automatic repeat capability for serial production' },
            { label: 'Archive', value: 'Transfer history, program backup, and organized file archive' },
          ],
        },
        {
          title: 'Reports & traceability',
          rows: [
            { label: 'Execution records', value: 'Program start and end date/time, active program, and successful runs' },
            { label: 'Transfer record', value: 'Transfer time, user, target CNC, status, and result' },
            { label: 'Runtime', value: 'Duration of each program run' },
            { label: 'Cycle gaps', value: 'Time between one program ending and the next beginning' },
            { label: 'Delay context', value: 'Part loading, setup, zeroing, tool/material change, and waiting' },
            { label: 'Report views', value: 'Overall and individual machine views for shifts' },
            { label: 'Management formula', value: 'Shift time − actual run time = time to review and improve' },
          ],
        },
        {
          title: 'Service',
          rows: [
            { label: 'Warranty', value: '12 months' },
            { label: 'Software', value: 'Software updates included as a stated service capability' },
            { label: 'Support', value: 'Technical support, installation, transfer testing, and operator training' },
          ],
        },
      ],
    },
    deployment: {
      eyebrow: 'Compatibility before purchase',
      title: 'Start with the machine you already have.',
      body: 'ElecIO checks the exact machine instead of making a blanket promise. Send the details below and the team defines the cable, parameters, and deployment plan.',
      sendLabel: 'Send these three things',
      send: ['Control model', 'A clear photo of the communication port', 'Your current program-transfer method'],
      steps: [
        { number: '01', title: 'Machine details', body: 'Share the controller, port, and current workflow.' },
        { number: '02', title: 'Technical check', body: 'Verify cable type, communication parameters, and compatibility.' },
        { number: '03', title: 'Demo and proposal', body: 'Shape the solution around the number and type of machines.' },
        { number: '04', title: 'Install and train', body: 'Set up, test transfer, and train the operator.' },
      ],
    },
    support: [
      { value: '12 months', label: 'Warranty' },
      { value: 'Included', label: 'Software updates' },
      { value: 'Human', label: 'Technical support' },
    ],
    final: {
      eyebrow: 'PRODUCT DOCUMENTS',
      title: 'Everything you need to review Smart DNC.',
      body: 'Download the product catalogue or the detailed technical guide.',
      order: 'Order Smart DNC',
      contact: 'Talk to ElecIO',
      catalog: 'Download 2026 catalogue',
      features: 'Download technical guide',
      sourceNote: 'Product information consolidated from the official 2026 catalogue and technical-features sheet.',
    },
  },
  fa: {
    nav: { product: 'Smart DNC', overview: 'معرفی', capabilities: 'قابلیت‌ها', specs: 'مشخصات فنی', order: 'سفارش' },
    hero: {
      eyebrow: 'ELECIO SMART DNC · ۲۰۲۶',
      title: 'کوتاه‌ترین مسیر از دفتر فنی تا CNC.',
      lead: 'کامپیوتر کمتر. کابل کمتر. توقف کمتر. یک دستگاه مستقل کنار هر ماشین؛ برای انتقال بی‌سیم برنامه NC، محافظت از پورت سریال و گزارش‌گیری قابل ردیابی شیفت.',
      primary: 'سفارش Smart DNC',
      secondary: 'مشاهده فناوری',
      imageAlt: 'دستگاه‌های مشکی و سفید ElecIO Smart DNC روی سکوی استودیویی',
    },
    proof: [
      { value: '۱ : ۱', label: 'یک دستگاه مستقل برای هر CNC' },
      { value: '۸GB', label: 'حافظه داخلی برنامه‌ها' },
      { value: '۳', label: 'ویندوز، اندروید و وب' },
      { value: '۱۲ ماه', label: 'گارانتی محصول' },
    ],
    highlights: {
      eyebrow: 'نکات برجسته',
      title: 'ساخته‌شده برای ماشین. طراحی‌شده برای کار واقعی.',
      items: [
        {
          number: '۰۱',
          title: 'مستقل کنار هر CNC.',
          body: 'نرم‌افزار مرکزی جریان فایل را مدیریت می‌کند، اما تولید به یک سرور سریال یا کامپیوتر قدیمی وابسته نیست. هر CNC برنامه را از دستگاه ElecIO خودش دریافت می‌کند.',
          image: '/images/recommendations/programmer-dnc-interface.webp',
          alt: 'دستگاه‌های مشکی و سفید ElecIO در کنار هم',
        },
        {
          number: '۰۲',
          title: 'مسیر سریال کوتاه‌تر و امن‌تر.',
          body: 'انتقال اصلی روی شبکه انجام می‌شود و فقط یک کابل کوتاه DNC کنار ماشین باقی می‌ماند؛ نویز کابل، دست‌کاری مکرر پورت و نقاط خرابی کمتر می‌شوند.',
          image: '/images/recommendations/operator-dnc-floor.webp',
          alt: 'نمای بالا از ElecIO Smart DNC و کانکتور سریال آن',
        },
        {
          number: '۰۳',
          title: 'زمان تولید قابل مشاهده می‌شود.',
          body: 'شروع و پایان برنامه، اجرای موفق، فاصله بین سایکل‌ها، آماده‌سازی و زمان خواب در یک مسیر قابل ردیابی برای دفتر فنی و مدیریت ثبت می‌شوند.',
          image: '/images/recommendations/owner-dnc-installed.webp',
          alt: 'ElecIO Smart DNC نصب‌شده کنار ماشین صنعتی',
        },
      ],
    },
    architecture: {
      eyebrow: 'اجرای محلی. مدیریت یکپارچه.',
      title: 'یک محیط نرم‌افزاری؛ یک دستگاه مستقل کنار هر CNC.',
      body: 'فایل NC را در دفتر فنی آماده کنید، ماشین مقصد را انتخاب کنید و از شبکه بفرستید. ElecIO فایل را کنار ماشین دریافت می‌کند، با اتصال سریال کوتاه به CNC می‌رساند و نتیجه را ثبت می‌کند.',
      steps: ['آماده‌سازی در دفتر فنی', 'انتخاب CNC مقصد', 'ارسال با شبکه / Wi‑Fi', 'دریافت روی ElecIO', 'اتصال سریال کوتاه به CNC', 'ثبت زمان و نتیجه'],
      resultLabel: 'نتیجه برای کارگاه',
      result: 'کامپیوتر کمتر، کابل کمتر، وابستگی کمتر و کنترل بهتر فایل‌ها.',
    },
    less: {
      eyebrow: 'چیزهایی که از کنار ماشین حذف می‌شوند',
      title: 'شلوغی را حذف کنید. قابلیت را نگه دارید.',
      items: [
        { title: 'کامپیوتر اضافه', body: 'دیگر کنار هر CNC به کیس، مانیتور، ویندوز، نرم‌افزار انتقال و نگهداری یک سیستم جدا نیاز نیست.' },
        { title: 'کابل بلند RS‑232', body: 'مسیرهای طولانی و حساس به نویز، قطع‌و‌وصل، انتقال ناقص و کابل‌کشی مجدد حذف می‌شوند.' },
        { title: 'نسخه‌های پراکنده فایل', body: 'برنامه‌ها از فلش و پوشه‌های جدا وارد آرشیو منظم بر اساس ماشین یا سفارش می‌شوند.' },
        { title: 'نقطه خرابی مرکزی', body: 'هر دستگاه کنار ماشین مستقل اجرا می‌کند؛ خرابی یک سرور سریال مرکزی کل خط را متوقف نمی‌کند.' },
      ],
    },
    hardware: {
      eyebrow: 'سخت‌افزار',
      title: 'سخت‌افزار صنعتی؛ آماده کنار هر CNC.',
      body: 'دستگاه برای کار پایدار کنار ماشین و پردازش ارتباط سریال ساخته شده است. برنامه‌های ضروری را محلی نگه می‌دارد و بدون کامپیوتر اختصاصی، ماشین را به شبکه کارگاه وصل می‌کند.',
      imageAlt: 'نمای نزدیک کنترل‌ها و کانکتور سریال ElecIO Smart DNC مشکی',
      specs: [
        { value: 'دو هسته‌ای', label: 'پردازنده', detail: 'برای اجرای پایدار محلی و پردازش ارتباط سریال.' },
        { value: '۸GB', label: 'حافظه داخلی', detail: 'برای برنامه‌ها، آرشیو و بک‌آپ‌های ضروری کنار ماشین.' },
        { value: 'Wi‑Fi', label: 'داخلی', detail: 'پوشش‌دهی مناسب شبکه بدون کابل‌کشی بلند DNC.' },
        { value: 'DNC', label: 'کابل سازگار', detail: 'اتصال کوتاه و کنترل‌شده به پورت سریال CNC.' },
        { value: 'ایزوله', label: 'مسیر پورت سریال', detail: 'طراحی‌شده برای محافظت از پورت حساس CNC در برابر جهش ناگهانی ولتاژ.' },
        { value: 'کنار ماشین', label: 'رابط اپراتور', detail: 'دریافت، بررسی و اجرا بدون بازگشت به کامپیوتر دفتر.' },
      ],
    },
    software: {
      eyebrow: 'نرم‌افزار مدیریت ElecIO',
      title: 'مدیریت، ارسال، آرشیو و گزارش در یک رابط روشن.',
      body: 'CNC را انتخاب کنید، سفارش را مرتب کنید، برنامه را بفرستید و وضعیت را ببینید. دفتر فنی جریان فایل را کنترل می‌کند و اپراتور یک تجربه ساده کنار ماشین دارد.',
      imageAlt: 'ElecIO Smart DNC کنار ابزار ماشین‌کاری و کامپیوتر برنامه‌نویسی',
      platforms: ['Windows', 'Android', 'Web App'],
      features: [
        { title: 'پوشه‌بندی مطابق تولید', body: 'برنامه‌ها را بر اساس سفارش، قطعه یا ماشین همراه توضیح، برچسب و نسخه روشن مرتب کنید.' },
        { title: 'مانیتور وضعیت ارسال', body: 'پیشرفت، خطای اتصال، انتقال ناقص، زمان، کاربر و CNC مقصد را ببینید.' },
        { title: 'برنامه‌های گروهی', body: 'چند فایل مرتبط را برای یک سفارش یا توالی تولید کنار هم نگه دارید.' },
        { title: 'تکرار خودکار', body: 'برای سری‌کاری، اجرای بعدی را سریع‌تر آماده کنید.' },
        { title: 'آرشیو و بک‌آپ', body: 'تاریخچه برنامه، بک‌آپ‌های ضروری، پارامترهای ارتباطی و سوابق ارسال را نگه دارید.' },
        { title: 'سابقه اجرای متصل', body: 'برنامه فعال، نتیجه ارسال، زمان اجرا و تعداد اجرای موفق را در یک رکورد ببینید.' },
      ],
    },
    reporting: {
      eyebrow: 'گزارش‌گیری شیفت',
      title: 'عددهایی که واقعاً به درد کارگاه می‌خورند.',
      body: 'ElecIO اجرای برنامه را با تاریخ و زمان ثبت می‌کند تا کارکرد، زمان خواب، آماده‌سازی و فاصله بین سایکل‌ها به‌جای حدس‌زدن قابل بررسی باشند.',
      formulaA: 'زمان شیفت',
      formulaB: 'زمان اجرای واقعی',
      formulaResult: 'زمان قابل بررسی و بهبود',
      metrics: ['مدت اجرای برنامه', 'زمان بین سایکل‌ها', 'بار و بست قطعه', 'تنظیم و صفرگیری', 'تعویض ابزار یا مواد', 'زمان انتظار', 'تعداد اجرای موفق', 'نمای پایان شیفت هر ماشین'],
      note: 'هدف گزارش، کنترل افراد نیست؛ پیدا کردن تأخیرهای تکراری و کم کردن زمان خواب ماشین است.',
    },
    compatibility: {
      eyebrow: 'ارتباط',
      title: 'برای کنترلرهایی که صنعت امروز با آن‌ها کار می‌کند.',
      body: 'کنترل جریان استاندارد بیشتر تنظیمات سریال را پوشش می‌دهد و پشتیبانی اختصاصی Heidenhain مسیر شبکه‌ای سریع‌تری فراهم می‌کند.',
      controllers: ['FANUC', 'SIEMENS', 'HEIDENHAIN', 'MITSUBISHI', 'HAAS', 'CHARMILLES'],
      protocols: [
        { title: 'XON / XOFF', body: 'کنترل جریان نرم‌افزاری برای ارتباط سریال استاندارد.' },
        { title: 'CTS / RTS', body: 'کنترل جریان سخت‌افزاری برای تنظیمات سریال سازگار CNC.' },
        { title: 'TNC Server', body: 'سازگار با جریان ارتباطی شناخته‌شده Heidenhain.' },
        { title: 'LSV2', body: 'انتقال سریع‌تر Heidenhain و مسیر شبکه‌ای به‌جای جابه‌جایی سنتی فایل.' },
      ],
      caveat: 'سازگاری نهایی پیش از خرید بر اساس مدل دقیق کنترل، نوع پورت، کابل موردنیاز، پارامترهای ارتباط و وضعیت ماشین بررسی می‌شود.',
    },
    operator: {
      eyebrow: 'کنار ماشین',
      title: 'دریافت. بررسی. اجرا.',
      body: 'برنامه از قبل روی دستگاه آماده است. اپراتور کنار CNC می‌ماند و به‌جای مدیریت کامپیوتر و کابل، یک مسیر کوتاه و روشن را طی می‌کند.',
      steps: [
        { number: '۰۱', title: 'دریافت', body: 'دفتر فنی برنامه را در پوشه‌ای مشخص روی دستگاه ElecIO کنار CNC می‌فرستد.' },
        { number: '۰۲', title: 'بررسی', body: 'نام فایل، پوشه، توضیح و سفارش کنترل می‌شوند تا خطای انتخاب کمتر شود.' },
        { number: '۰۳', title: 'اجرا', body: 'برنامه تأییدشده به کنترل CNC فرستاده می‌شود و تولید آغاز می‌شود.' },
      ],
      tags: ['برنامه‌های گروهی', 'تکرار خودکار', 'حالت خواب / آماده‌باش'],
    },
    specs: {
      eyebrow: 'مشخصات کامل کاتالوگ',
      title: 'تمام قابلیت‌های اعلام‌شده؛ یک‌جا.',
      intro: 'جدول‌های زیر کاتالوگ محصول ۲۰۲۶ و برگه ویژگی‌های فنی را یکپارچه می‌کنند. مقادیری که در این دو سند منتشر نشده‌اند، عمداً در این صفحه ساخته نشده‌اند.',
      groups: [
        {
          title: 'سخت‌افزار و نصب',
          rows: [
            { label: 'مدل استقرار', value: 'یک ElecIO Smart DNC مستقل کنار هر CNC' },
            { label: 'پردازنده', value: 'پردازنده قدرتمند دو هسته‌ای' },
            { label: 'حافظه داخلی', value: '۸ گیگابایت برای برنامه‌ها، آرشیو و بک‌آپ ضروری' },
            { label: 'اتصال ماشین', value: 'کابل کوتاه و سازگار DNC / سریال' },
            { label: 'ارتباط بی‌سیم', value: 'وای‌فای داخلی با پوشش‌دهی بالا' },
            { label: 'محافظت پورت سریال', value: 'مسیر محافظتی ایزوله داخلی در برابر جهش ناگهانی ولتاژ' },
            { label: 'رابط اپراتور', value: 'رابط اختصاصی کنار ماشین برای دریافت، بررسی و اجرا' },
            { label: 'نیاز به PC کنار CNC', value: 'بدون نیاز به کامپیوتر جداگانه' },
          ],
        },
        {
          title: 'ارتباط و سازگاری',
          rows: [
            { label: 'مسیر اصلی انتقال', value: 'شبکه کارگاه / Wi‑Fi تا ElecIO؛ اتصال سریال کوتاه از ElecIO تا CNC' },
            { label: 'کنترل جریان سریال', value: 'XON/XOFF و CTS/RTS' },
            { label: 'Heidenhain', value: 'سازگاری با TNC Server و پشتیبانی LSV2 برای سرعت انتقال بالاتر' },
            { label: 'خانواده کنترلرها', value: 'FANUC، SIEMENS، HEIDENHAIN، MITSUBISHI، HAAS، CHARMILLES' },
            { label: 'پارامترها', value: 'ذخیره پارامترهای ارتباطی ماشین' },
            { label: 'تأیید سازگاری', value: 'بررسی مدل کنترل، نوع پورت، پارامترها، کابل و وضعیت ماشین پیش از خرید' },
          ],
        },
        {
          title: 'نرم‌افزار و کنترل فایل',
          rows: [
            { label: 'پلتفرم‌ها', value: 'Windows، Android و Web App' },
            { label: 'شناسایی دستگاه', value: 'کشف دستگاه‌های ElecIO در شبکه' },
            { label: 'سازمان‌دهی فایل', value: 'پوشه بر اساس سفارش، قطعه یا ماشین؛ توضیح و برچسب' },
            { label: 'انتخاب مقصد', value: 'انتخاب CNC مقصد پیش از ارسال' },
            { label: 'مانیتور انتقال', value: 'نمایش پیشرفت، نتیجه، خطای اتصال و انتقال ناقص' },
            { label: 'برنامه گروهی', value: 'گروه‌کردن چند فایل برای یک سفارش یا توالی' },
            { label: 'سری‌کاری', value: 'قابلیت تکرار خودکار برای تولید تکراری' },
            { label: 'آرشیو', value: 'سوابق ارسال، بک‌آپ برنامه و آرشیو منظم فایل‌ها' },
          ],
        },
        {
          title: 'گزارش و ردیابی',
          rows: [
            { label: 'رکورد اجرا', value: 'تاریخ و زمان شروع و پایان، برنامه فعال و تعداد اجرای موفق' },
            { label: 'رکورد ارسال', value: 'زمان، کاربر، CNC مقصد، وضعیت و نتیجه ارسال' },
            { label: 'کارکرد', value: 'مدت اجرای هر برنامه' },
            { label: 'فاصله سایکل‌ها', value: 'زمان پایان یک برنامه تا شروع برنامه بعدی' },
            { label: 'زمینه تأخیر', value: 'بار و بست، تنظیم، صفرگیری، تعویض ابزار/مواد و انتظار' },
            { label: 'نمای گزارش', value: 'نمای جامع و تفکیکی ماشین‌ها برای شیفت' },
            { label: 'فرمول مدیریتی', value: 'زمان شیفت − زمان اجرای واقعی = زمان قابل بررسی و بهبود' },
          ],
        },
        {
          title: 'خدمات',
          rows: [
            { label: 'گارانتی', value: '۱۲ ماه' },
            { label: 'نرم‌افزار', value: 'به‌روزرسانی نرم‌افزار به‌عنوان خدمت اعلام‌شده' },
            { label: 'پشتیبانی', value: 'پشتیبانی فنی، نصب، تست انتقال و آموزش اپراتور' },
          ],
        },
      ],
    },
    deployment: {
      eyebrow: 'تأیید سازگاری پیش از خرید',
      title: 'از همان ماشینی شروع کنید که امروز دارید.',
      body: 'ElecIO به‌جای وعده کلی، ماشین دقیق شما را بررسی می‌کند. اطلاعات زیر را بفرستید تا کابل، پارامترها و روش استقرار مشخص شوند.',
      sendLabel: 'این سه مورد را ارسال کنید',
      send: ['مدل کنترل', 'عکس واضح از پورت ارتباطی', 'روش فعلی انتقال برنامه'],
      steps: [
        { number: '۰۱', title: 'مشخصات ماشین', body: 'کنترلر، پورت و روش فعلی کار را ارسال کنید.' },
        { number: '۰۲', title: 'بررسی فنی', body: 'نوع کابل، پارامترهای ارتباط و سازگاری تأیید می‌شوند.' },
        { number: '۰۳', title: 'دمو و پیشنهاد', body: 'راهکار بر اساس تعداد و نوع ماشین‌ها شکل می‌گیرد.' },
        { number: '۰۴', title: 'نصب و آموزش', body: 'راه‌اندازی، تست انتقال و آموزش اپراتور انجام می‌شود.' },
      ],
    },
    support: [
      { value: '۱۲ ماه', label: 'گارانتی' },
      { value: 'همراه محصول', label: 'به‌روزرسانی نرم‌افزار' },
      { value: 'تخصصی', label: 'پشتیبانی فنی' },
    ],
    final: {
      eyebrow: 'اسناد محصول',
      title: 'اطلاعات موردنیاز Smart DNC را دریافت کنید.',
      body: 'کاتالوگ محصول یا راهنمای کامل ویژگی‌های فنی را دانلود کنید.',
      order: 'سفارش Smart DNC',
      contact: 'گفت‌وگو با ElecIO',
      catalog: 'دانلود کاتالوگ ۲۰۲۶',
      features: 'دانلود راهنمای فنی',
      sourceNote: 'اطلاعات محصول از کاتالوگ رسمی ۲۰۲۶ و برگه ویژگی‌های فنی یکپارچه شده است.',
    },
  },
};

export function ProductShowcaseLegacy({ locale }: { locale: AppLocale }) {
  const copy = PRODUCT_COPY[locale];
  const catalogHref = locale === 'en'
    ? '/downloads/elecio-smart-dnc-catalog-2026-en.pdf'
    : '/downloads/elecio-smart-dnc-catalog-2026.pdf';
  const featuresHref = locale === 'en'
    ? '/downloads/elecio-smart-dnc-features-en.pdf'
    : '/downloads/elecio-smart-dnc-features.pdf';

  return (
    <main className={styles.page}>
      <nav className={styles.productNav} aria-label={copy.nav.product}>
        <a className={styles.productName} href="#product-top">ElecIO <span>Smart DNC</span></a>
        <div className={styles.navLinks}>
          <a href="#highlights">{copy.nav.overview}</a>
          <a href="#capabilities">{copy.nav.capabilities}</a>
          <a href="#tech-specs">{copy.nav.specs}</a>
        </div>
        <a className={styles.navOrder} href={ORDER_URL} target="_blank" rel="noopener noreferrer">{copy.nav.order}</a>
      </nav>

      <section id="product-top" className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{copy.hero.eyebrow}</p>
          <h1>{copy.hero.title}</h1>
          <p className={styles.heroLead}>{copy.hero.lead}</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href={ORDER_URL} target="_blank" rel="noopener noreferrer">{copy.hero.primary}</a>
            <a className={styles.secondaryButton} href="#highlights">{copy.hero.secondary}<span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <Image src="/images/hero-slide-en-1.webp" alt={copy.hero.imageAlt} fill priority sizes="100vw" className={styles.heroImage} />
          <div className={styles.heroImageShade} />
        </div>
      </section>

      <section className={styles.proofStrip} aria-label="Product highlights">
        {copy.proof.map((item) => (
          <div key={item.label} className={styles.proofItem}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section id="highlights" className={styles.highlights}>
        <SectionHeading eyebrow={copy.highlights.eyebrow} title={copy.highlights.title} />
        <div className={styles.highlightRail}>
          {copy.highlights.items.map((item) => (
            <article key={item.number} className={styles.highlightCard}>
              <div className={styles.highlightImage}>
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 760px) 86vw, 31vw" />
              </div>
              <div className={styles.highlightCopy}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.architecture}>
        <div className={styles.architectureIntro}>
          <p className={styles.eyebrow}>{copy.architecture.eyebrow}</p>
          <h2>{copy.architecture.title}</h2>
          <p>{copy.architecture.body}</p>
        </div>
        <div className={styles.flow}>
          {copy.architecture.steps.map((step, index) => (
            <div key={step} className={styles.flowStep}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
              {index < copy.architecture.steps.length - 1 && <i aria-hidden="true">→</i>}
            </div>
          ))}
        </div>
        <div className={styles.flowResult}>
          <span>{copy.architecture.resultLabel}</span>
          <strong>{copy.architecture.result}</strong>
        </div>
      </section>

      <section className={styles.lessSection}>
        <SectionHeading eyebrow={copy.less.eyebrow} title={copy.less.title} />
        <div className={styles.lessGrid}>
          {copy.less.items.map((item, index) => (
            <article key={item.title}>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="capabilities" className={styles.hardware}>
        <div className={styles.hardwareVisual}>
          <Image src="/images/recommendations/programmer-dnc-workbench.webp" alt={copy.hardware.imageAlt} fill sizes="(max-width: 900px) 100vw, 50vw" />
          <div className={styles.visualLabel}><span>SMART DNC</span><strong>G1</strong></div>
        </div>
        <div className={styles.hardwareContent}>
          <p className={styles.eyebrow}>{copy.hardware.eyebrow}</p>
          <h2>{copy.hardware.title}</h2>
          <p className={styles.sectionLead}>{copy.hardware.body}</p>
          <div className={styles.hardwareSpecs}>
            {copy.hardware.specs.map((spec) => (
              <article key={spec.label}>
                <strong>{spec.value}</strong>
                <h3>{spec.label}</h3>
                <p>{spec.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.software}>
        <div className={styles.softwareIntro}>
          <div>
            <p className={styles.eyebrow}>{copy.software.eyebrow}</p>
            <h2>{copy.software.title}</h2>
          </div>
          <p>{copy.software.body}</p>
        </div>
        <div className={styles.platforms}>
          {copy.software.platforms.map((platform) => <span key={platform}>{platform}</span>)}
        </div>
        <div className={styles.softwareBody}>
          <div className={styles.softwareVisual}>
            <Image src="/images/recommendations/programmer-dnc-connected.webp" alt={copy.software.imageAlt} fill sizes="(max-width: 900px) 100vw, 48vw" />
          </div>
          <div className={styles.softwareFeatures}>
            {copy.software.features.map((feature, index) => (
              <article key={feature.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{feature.title}</h3><p>{feature.body}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.reporting}>
        <div className={styles.reportingCopy}>
          <p className={styles.eyebrow}>{copy.reporting.eyebrow}</p>
          <h2>{copy.reporting.title}</h2>
          <p>{copy.reporting.body}</p>
        </div>
        <div className={styles.formula}>
          <div><span>01</span><strong>{copy.reporting.formulaA}</strong></div>
          <i aria-hidden="true">−</i>
          <div><span>02</span><strong>{copy.reporting.formulaB}</strong></div>
          <i aria-hidden="true">=</i>
          <div className={styles.formulaResult}><span>03</span><strong>{copy.reporting.formulaResult}</strong></div>
        </div>
        <div className={styles.metricGrid}>
          {copy.reporting.metrics.map((metric) => <span key={metric}>{metric}</span>)}
        </div>
        <p className={styles.reportingNote}>{copy.reporting.note}</p>
      </section>

      <section className={styles.compatibility}>
        <div className={styles.compatibilityIntro}>
          <p className={styles.eyebrow}>{copy.compatibility.eyebrow}</p>
          <h2>{copy.compatibility.title}</h2>
          <p>{copy.compatibility.body}</p>
        </div>
        <div className={styles.controllerGrid}>
          {copy.compatibility.controllers.map((controller) => <div key={controller}>{controller}</div>)}
        </div>
        <div className={styles.protocolGrid}>
          {copy.compatibility.protocols.map((protocol) => (
            <article key={protocol.title}><strong>{protocol.title}</strong><p>{protocol.body}</p></article>
          ))}
        </div>
        <p className={styles.compatibilityNote}><span aria-hidden="true">i</span>{copy.compatibility.caveat}</p>
      </section>

      <section className={styles.operator}>
        <div className={styles.operatorIntro}>
          <p className={styles.eyebrow}>{copy.operator.eyebrow}</p>
          <h2>{copy.operator.title}</h2>
          <p>{copy.operator.body}</p>
        </div>
        <div className={styles.operatorSteps}>
          {copy.operator.steps.map((step) => (
            <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.body}</p></article>
          ))}
        </div>
        <div className={styles.operatorTags}>{copy.operator.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </section>

      <section id="tech-specs" className={styles.techSpecs}>
        <SectionHeading eyebrow={copy.specs.eyebrow} title={copy.specs.title} lead={copy.specs.intro} />
        <div className={styles.specGroups}>
          {copy.specs.groups.map((group, index) => (
            <details key={group.title} open={index === 0}>
              <summary><span>{String(index + 1).padStart(2, '0')}</span><strong>{group.title}</strong><i aria-hidden="true">+</i></summary>
              <dl>
                {group.rows.map((row) => (
                  <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>
                ))}
              </dl>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.deployment}>
        <div className={styles.deploymentIntro}>
          <p className={styles.eyebrow}>{copy.deployment.eyebrow}</p>
          <h2>{copy.deployment.title}</h2>
          <p>{copy.deployment.body}</p>
          <div className={styles.sendBox}>
            <strong>{copy.deployment.sendLabel}</strong>
            <ul>{copy.deployment.send.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
        <ol className={styles.deploymentSteps}>
          {copy.deployment.steps.map((step) => (
            <li key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>
          ))}
        </ol>
      </section>

      <section className={styles.supportStrip}>
        {copy.support.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
      </section>

      <section className={styles.finalCta}>
        <div className={styles.finalGlow} aria-hidden="true" />
        <p className={styles.eyebrow}>{copy.final.eyebrow}</p>
        <h2>{copy.final.title}</h2>
        <p>{copy.final.body}</p>
        <div className={styles.finalActions}>
          <a className={styles.primaryButton} href={ORDER_URL} target="_blank" rel="noopener noreferrer">{copy.final.order}</a>
          <Link className={styles.secondaryButton} href="/contact">{copy.final.contact}</Link>
        </div>
        <div className={styles.downloads}>
          <a href={catalogHref} target="_blank" rel="noopener noreferrer">{copy.final.catalog}<span aria-hidden="true">↗</span></a>
          <a href={featuresHref} target="_blank" rel="noopener noreferrer">{copy.final.features}<span aria-hidden="true">↗</span></a>
        </div>
        <small>{copy.final.sourceNote}</small>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className={styles.sectionHeading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      {lead && <p>{lead}</p>}
    </div>
  );
}

const HARDWARE_ICONS = ['port', 'storage', 'wifi', 'link', 'shield', 'control'] as const;
const SOFTWARE_ICONS = ['folder', 'sync', 'network', 'history', 'cloud', 'clock'] as const;
const PROCESS_ICONS = ['draft', 'target', 'wifi', 'device', 'serial', 'report'] as const;

type FeatureIconName = (typeof HARDWARE_ICONS)[number] | (typeof SOFTWARE_ICONS)[number] | (typeof PROCESS_ICONS)[number];

function FeatureIcon({ name }: { name: FeatureIconName }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const marks = {
    port: <><path d="M7 5v5m10-5v5M5 10h14v4a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z" /><path d="M12 19v3" /></>,
    storage: <><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" /></>,
    wifi: <><path d="M4 9a12 12 0 0 1 16 0M7 13a7.5 7.5 0 0 1 10 0M10 17a3 3 0 0 1 4 0" /><circle cx="12" cy="20" r=".7" fill="currentColor" stroke="none" /></>,
    link: <><path d="m9.5 14.5 5-5M7.5 17.5l-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M16.5 6.5l1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" /></>,
    shield: <><path d="M12 3 20 6v6c0 5-3.2 8.2-8 10-4.8-1.8-8-5-8-10V6z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    control: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
    folder: <><path d="M3 7h7l2 2h9v10H3z" /><path d="M3 7V5h7l2 2" /></>,
    sync: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.2 8.5A7 7 0 0 1 18.5 7L20 12M4 12l1.5 5A7 7 0 0 0 18 15.5" /></>,
    network: <><rect x="9" y="3" width="6" height="5" rx="1" /><rect x="2" y="16" width="6" height="5" rx="1" /><rect x="16" y="16" width="6" height="5" rx="1" /><path d="M12 8v4M5 16v-4h14v4" /></>,
    history: <><path d="M4 5v5h5" /><path d="M5.5 17A8 8 0 1 0 4 10" /><path d="M12 7v5l3 2" /></>,
    cloud: <><path d="M7 18H5a4 4 0 0 1-.4-8A7 7 0 0 1 18 9a4.5 4.5 0 0 1 1 8.9H17" /><path d="M12 21V12m-3 3 3-3 3 3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    draft: <><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v5h4M8 12h8M8 16h6" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3" /></>,
    device: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 7h8M8 11h8M8 16h4" /><circle cx="16.5" cy="16.5" r="1" /></>,
    serial: <><path d="M7 5v4m10-4v4M5 9h14v4a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z" /><path d="M12 18v3M9 21h6" /></>,
    report: <><path d="M5 3h14v18H5z" /><path d="M8 16v2m4-6v6m4-9v9M8 7h5" /></>,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>{marks[name]}</svg>;
}
export function ProductShowcase({ locale }: { locale: AppLocale }) {
  const copy = PRODUCT_COPY[locale];
  const catalogHref = locale === 'en'
    ? '/downloads/elecio-smart-dnc-catalog-2026-en.pdf'
    : '/downloads/elecio-smart-dnc-catalog-2026.pdf';
  const featuresHref = locale === 'en'
    ? '/downloads/elecio-smart-dnc-features-en.pdf'
    : '/downloads/elecio-smart-dnc-features.pdf';
  const dockItems = locale === 'fa'
    ? [
        { id: 'product-overview', label: 'معرفی' },
        { id: 'product-hardware', label: 'سخت‌افزار' },
        { id: 'product-software', label: 'نرم‌افزار' },
        { id: 'product-insight', label: 'گزارش' },
        { id: 'product-specs', label: 'مشخصات' },
      ]
    : [
        { id: 'product-overview', label: 'Overview' },
        { id: 'product-hardware', label: 'Hardware' },
        { id: 'product-software', label: 'Software' },
        { id: 'product-insight', label: 'Insight' },
        { id: 'product-specs', label: 'Specs' },
      ];

  return (
    <main className={experience.page}>
      <ProductSectionDock items={dockItems} />

      <section id="product-overview" className={experience.hero} data-product-section>
        <div className={experience.heroAura} aria-hidden="true" />
        <div className={experience.heroCopy}>
          <p className={experience.kicker}>{copy.hero.eyebrow}</p>
          <h1>{copy.hero.title}</h1>
          <p>{copy.hero.lead}</p>
          <div className={experience.actions}>
            <a className={experience.primary} href={ORDER_URL} target="_blank" rel="noopener noreferrer">{copy.hero.primary}</a>
            <a className={experience.quietLink} href="#product-hardware">{copy.hero.secondary}<span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className={experience.heroProduct}>
          <Image src="/images/hero-slide-en-1.webp" alt={copy.hero.imageAlt} fill priority sizes="100vw" />
        </div>
        <div className={experience.heroFacts}>
          {copy.proof.slice(0, 3).map((item) => (
            <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
          ))}
        </div>
      </section>

      <section className={experience.promise}>
        <p className={experience.kicker}>{copy.architecture.eyebrow}</p>
        <h2>{copy.architecture.title}</h2>
        <p>{copy.architecture.body}</p>
        <div className={experience.path}>
          {copy.architecture.steps.map((step, index) => (
            <div key={step}>
              <span className={experience.pathNumber}>{String(index + 1).padStart(2, '0')}</span>
              <span className={experience.pathIcon}><FeatureIcon name={PROCESS_ICONS[index]} /></span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
        <p className={experience.result}>{copy.architecture.result}</p>
      </section>

      <div id="product-hardware" data-product-section>
      <section className={experience.chapter}>
        <div className={experience.chapterImage}>
          <Image src="/images/recommendations/programmer-dnc-workbench.webp" alt={copy.hardware.imageAlt} fill sizes="(max-width: 800px) 100vw, 50vw" />
          <span>SMART DNC · G1</span>
        </div>
        <div className={experience.chapterCopy}>
          <p className={experience.kicker}>{copy.hardware.eyebrow}</p>
          <h2>{copy.hardware.title}</h2>
          <p className={experience.lead}>{copy.hardware.body}</p>
          <div className={experience.precisionList}>
            {copy.hardware.specs.map((spec, index) => {
              const icon = HARDWARE_ICONS[index];
              return <article key={spec.label}>
                <span className={experience.specIcon}><FeatureIcon name={icon} /></span>
                <strong>{spec.value}</strong>
                <div><h3>{spec.label}</h3><p>{spec.detail}</p></div>
              </article>;
            })}
          </div>
        </div>
      </section>

      <CompatibilityOrbit
        eyebrow={copy.compatibility.eyebrow}
        title={copy.compatibility.title}
        body={copy.compatibility.body}
        caveat={copy.compatibility.caveat}
        protocols={copy.compatibility.protocols.map((protocol) => protocol.title)}
      />
      </div>

      <section id="product-software" className={`${experience.chapter} ${experience.chapterReverse}`} data-product-section>
        <div className={`${experience.chapterImage} ${experience.softwareCanvas}`}>
          <div className={experience.softwareGallery}>
            <div className={experience.softwareHeroShot}>
              <Image src="/images/software/software-responsive.webp" alt={copy.software.imageAlt} fill sizes="(max-width: 800px) 92vw, 44vw" />
            </div>
            <div className={experience.softwareScreen}>
              <Image src="/images/software/software-transfer.webp" alt="ElecIO program transfer interface" fill sizes="(max-width: 800px) 70vw, 30vw" />
            </div>
            <div className={experience.softwareScreen}>
              <Image src="/images/software/software-programs.webp" alt="ElecIO program management interface" fill sizes="(max-width: 800px) 70vw, 30vw" />
            </div>
          </div>
          <div className={experience.platformRow}>{copy.software.platforms.map((platform) => <span key={platform}>{platform}</span>)}</div>
        </div>
        <div className={experience.chapterCopy}>
          <p className={experience.kicker}>{copy.software.eyebrow}</p>
          <h2>{copy.software.title}</h2>
          <p className={experience.lead}>{copy.software.body}</p>
          <div className={experience.featureList}>
            {copy.software.features.map((feature, index) => {
              const icon = SOFTWARE_ICONS[index];
              return <article key={feature.title}>
                <span className={experience.featureIcon}><FeatureIcon name={icon} /></span>
                <div><h3>{feature.title}</h3><p>{feature.body}</p></div>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section id="product-insight" className={experience.insight} data-product-section>
        <div className={experience.insightIntro}>
          <p className={experience.kicker}>{copy.reporting.eyebrow}</p>
          <h2>{copy.reporting.title}</h2>
          <p>{copy.reporting.body}</p>
        </div>
        <div className={experience.reportingVisual}>
          <Image
            src="/images/software/software-reports.webp"
            alt={locale === 'fa' ? 'نمای گزارش‌گیری تولید در نرم‌افزار ElecIO' : 'ElecIO production reporting interface'}
            fill
            sizes="(max-width: 800px) calc(100vw - 36px), 1120px"
          />
        </div>
        <div className={experience.equation}>
          <div><small>01</small><strong>{copy.reporting.formulaA}</strong></div>
          <i>−</i>
          <div><small>02</small><strong>{copy.reporting.formulaB}</strong></div>
          <i>=</i>
          <div className={experience.equationAnswer}><small>03</small><strong>{copy.reporting.formulaResult}</strong></div>
        </div>
        <p className={experience.insightNote}>{copy.reporting.note}</p>
      </section>

      <section id="product-specs" className={experience.specs} data-product-section>
        <div className={experience.specHeading}>
          <p className={experience.kicker}>{copy.specs.eyebrow}</p>
          <h2>{copy.specs.title}</h2>
          <p>{copy.specs.intro}</p>
        </div>
        <div className={experience.specAccordion}>
          {copy.specs.groups.map((group, index) => (
            <details key={group.title} open={index === 0}>
              <summary><span>{String(index + 1).padStart(2, '0')}</span><strong>{group.title}</strong><i>+</i></summary>
              <dl>
                {group.rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}
              </dl>
            </details>
          ))}
        </div>
      </section>

      <section className={experience.final}>
        <p className={experience.kicker}>{copy.final.eyebrow}</p>
        <h2>{copy.final.title}</h2>
        <p>{copy.final.body}</p>
        <div className={experience.documents}>
          <a href={catalogHref} download>
            <small>PDF · 01</small>
            <strong>{copy.final.catalog}</strong>
            <span aria-hidden="true">↓</span>
          </a>
          <a href={featuresHref} download>
            <small>PDF · 02</small>
            <strong>{copy.final.features}</strong>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
    </main>
  );
}
