import type { AppLocale } from '@/i18n/routing';
import styles from './ComparisonTable.module.css';

type Cell = {
  state?: 'yes' | 'no';
  en?: string;
  fa?: string;
};

type ComparisonRow = {
  icon: string;
  label: { en: string; fa: string };
  cells: Cell[];
};

const PRODUCTS = [
  'Elecio Smart DNC',
  'Micro DNC 3A',
  'Quinx DNC',
  'CIMCO DNC-Max',
] as const;

const ROWS: ComparisonRow[] = [
  {
    icon: '◎',
    label: { en: 'Network', fa: 'شبکه' },
    cells: [
      { state: 'yes', en: 'Wi-Fi', fa: 'Wi-Fi' },
      { state: 'yes', en: 'Wi-Fi', fa: 'Wi-Fi' },
      { state: 'yes', en: 'Wi-Fi / LAN', fa: 'Wi-Fi / LAN' },
      { en: '—', fa: '—' },
    ],
  },
  {
    icon: '▤',
    label: { en: 'Local Storage', fa: 'حافظه' },
    cells: [
      { state: 'yes', en: 'microSD supported', fa: 'قابل ارتقا با microSD' },
      { state: 'yes', en: '4GB', fa: '4GB' },
      { state: 'no' },
      { en: '—', fa: '—' },
    ],
  },
  {
    icon: '⌘',
    label: { en: 'Controller Support', fa: 'کنترلرها' },
    cells: [
      { state: 'yes', en: 'Fully supported; wide range of controllers', fa: 'پشتیبانی کامل؛ انتخاب مستقیم در نرم‌افزار' },
      { en: 'Limited support', fa: 'پشتیبانی محدود' },
      { en: 'Limited support', fa: 'پشتیبانی محدود' },
      { en: 'Limited support', fa: 'پشتیبانی محدود' },
    ],
  },
  {
    icon: 'H',
    label: { en: 'Heidenhain Support', fa: 'Heidenhain' },
    cells: [
      { state: 'yes', en: 'TNC + LSV2 from software', fa: 'TNC + LSV2؛ انتخاب از نرم‌افزار' },
      { state: 'no' }, { state: 'no' }, { state: 'no' },
    ],
  },
  {
    icon: '▱',
    label: { en: 'CNC Software', fa: 'نرم‌افزار' },
    cells: [
      { state: 'yes', en: 'Windows + Android + Web', fa: 'Windows + Android + Web' },
      { en: 'Windows', fa: 'Windows' },
      { en: 'Windows', fa: 'Windows' },
      { en: 'Windows + Web', fa: 'Windows + Web' },
    ],
  },
  {
    icon: '▥',
    label: { en: 'Multi-CNC Monitoring', fa: 'پایش چند CNC' },
    cells: [{ state: 'yes' }, { state: 'no' }, { state: 'no' }, { state: 'no' }],
  },
  {
    icon: '♙',
    label: { en: 'Operator Panel', fa: 'پنل اپراتور' },
    cells: [{ state: 'yes' }, { state: 'no' }, { state: 'yes' }, { state: 'no' }],
  },
  {
    icon: '▰',
    label: { en: 'File Management', fa: 'فولدر‌بندی' },
    cells: [{ state: 'yes' }, { state: 'no' }, { state: 'yes' }, { state: 'yes' }],
  },
  {
    icon: '↻',
    label: { en: 'Auto Repeat', fa: 'Auto Repeat' },
    cells: [{ state: 'yes' }, { state: 'yes' }, { state: 'yes' }, { state: 'yes' }],
  },
  {
    icon: '⇆',
    label: { en: 'Transfer Resume', fa: 'پایش انتقال' },
    cells: [{ state: 'yes' }, { state: 'yes' }, { state: 'yes' }, { state: 'yes' }],
  },
  {
    icon: '▧',
    label: { en: 'Production Reports', fa: 'گزارش تولید' },
    cells: [
      { state: 'yes', en: 'Runtime + Idle + Cycle + Shift', fa: 'Runtime + Idle + Cycle + Shift' },
      { state: 'no' }, { state: 'no' },
      { state: 'yes', en: 'MDC-Max advanced', fa: 'MDC-Max پیشرفته' },
    ],
  },
  {
    icon: '◉',
    label: { en: 'Technical Support & Updates', fa: 'پشتیبانی و آپدیت' },
    cells: [
      { state: 'yes', en: 'Full support + regular updates', fa: 'پشتیبانی + به‌روزرسانی' },
      { state: 'yes' }, { state: 'yes' }, { state: 'no' },
    ],
  },
  {
    icon: '◇',
    label: { en: 'Warranty', fa: 'گارانتی' },
    cells: [
      { en: '12 months', fa: '۱۲ ماه' },
      { en: '12 months', fa: '۱۲ ماه' },
      { en: 'General support not included', fa: 'اعلام عمومی مشخص نشد' },
      { en: 'Software: not guaranteed', fa: 'نرم‌افزار قابل مقایسه نیست' },
    ],
  },
];

function Result({ cell, locale }: { cell: Cell; locale: AppLocale }) {
  const text = cell[locale];
  return (
    <span className={styles.result}>
      {cell.state && (
        <span className={`${styles.status} ${cell.state === 'yes' ? styles.yes : styles.no}`} aria-label={cell.state === 'yes' ? 'yes' : 'no'}>
          {cell.state === 'yes' ? '✓' : '×'}
        </span>
      )}
      {text && <span>{text}</span>}
    </span>
  );
}

export function ComparisonTable({ locale }: { locale: AppLocale }) {
  const copy = locale === 'fa'
    ? {
        eyebrow: 'مقایسه راهکارها',
        titleStart: 'مقایسه ',
        titleAccent: 'Elecio Smart DNC',
        titleEnd: ' با گزینه‌های داخلی و جهانی',
        subtitle: 'جدول مقایسه بر اساس قابلیت‌های کلیدی',
        capability: 'قابلیت',
        sourceLabel: 'مبنای جدول:',
        source: 'مشخصات عمومی منتشرشده و اطلاعات داخلی Elecio',
        scroll: 'برای مشاهده همه ستون‌ها، جدول را به طرفین بکشید.',
      }
    : {
        eyebrow: 'Solution comparison',
        titleStart: 'Comparison of ',
        titleAccent: 'Elecio Smart DNC',
        titleEnd: ' with Internal and Global Solutions',
        subtitle: 'Comparison table based on key capabilities',
        capability: 'Capabilities',
        sourceLabel: 'Table basis:',
        source: 'publicly available specifications and Elecio internal information',
        scroll: 'Swipe sideways to see every column.',
      };

  return (
    <section className={styles.section} aria-labelledby="comparison-title">
      <div className={styles.orbA} aria-hidden="true" />
      <div className={styles.orbB} aria-hidden="true" />
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="comparison-title">
          {copy.titleStart}<span>{copy.titleAccent}</span>{copy.titleEnd}
        </h2>
        <div className={styles.subheading}><i aria-hidden="true" />{copy.subtitle}<i aria-hidden="true" /></div>
      </div>

      <p className={styles.scrollHint}>{copy.scroll}</p>
      <div className={styles.tableShell} tabIndex={0} role="region" aria-label={copy.subtitle}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.capabilityHead} scope="col">{copy.capability}</th>
              {PRODUCTS.map((product, index) => (
                <th key={product} className={index === 0 ? styles.elecioHead : undefined} scope="col">{product}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, rowIndex) => (
              <tr key={row.label.en}>
                <th className={styles.featureCell} scope="row">
                  <span className={styles.rowNumber}>{rowIndex + 1}</span>
                  <span className={styles.featureIcon} aria-hidden="true">{row.icon}</span>
                  <span>{row.label[locale]}</span>
                </th>
                {row.cells.map((cell, cellIndex) => (
                  <td key={`${row.label.en}-${PRODUCTS[cellIndex]}`} className={cellIndex === 0 ? styles.elecioCell : undefined}>
                    <Result cell={cell} locale={locale} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.source}><strong>{copy.sourceLabel}</strong> {copy.source}</p>
    </section>
  );
}
