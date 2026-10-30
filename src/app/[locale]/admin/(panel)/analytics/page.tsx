import { requireStaffPermission } from '@/server/auth/staff-flow';
import { getDailyTraffic, getPageTraffic } from '@/server/analytics/page-views';
import { analyticsDay, isAnalyticsDay, shiftDay } from '@/lib/page-analytics';
import { Link } from '@/i18n/navigation';
import styles from '@/components/admin/Admin.module.css';

const RANGES = [7, 30, 90] as const;

export default async function Analytics({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params; const en = locale === 'en'; await requireStaffPermission('analytics', 'read');
  const query = await searchParams;
  const range = RANGES.find((value) => String(value) === query.days) ?? 30;
  const today = analyticsDay(new Date());
  const from = shiftDay(today, -(range - 1));
  const selectedDay = isAnalyticsDay(query.day) && query.day >= from && query.day <= today ? query.day : null;

  const [daily, pages] = await Promise.all([
    getDailyTraffic(from, today),
    getPageTraffic(selectedDay ?? from, selectedDay ?? today),
  ]);
  const byDay = new Map(daily.map((row) => [row.day, row]));
  const days = Array.from({ length: range }, (_, index) => {
    const day = shiftDay(from, index);
    return byDay.get(day) ?? { day, views: 0, visitors: 0 };
  });
  const todayRow = days[days.length - 1];
  const rangeViews = days.reduce((sum, row) => sum + row.views, 0);
  const rangeVisitors = days.reduce((sum, row) => sum + row.visitors, 0);
  const maxVisitors = Math.max(1, ...days.map((row) => row.visitors));
  const maxPageViews = Math.max(1, ...pages.map((row) => row.views));

  const number = (value: number) => value.toLocaleString(locale);
  const calendar = en ? 'en-US' : 'fa-IR';
  const shortDate = new Intl.DateTimeFormat(calendar, { timeZone: 'UTC', month: 'short', day: 'numeric' });
  const longDate = new Intl.DateTimeFormat(calendar, { timeZone: 'UTC', weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const asDate = (day: string) => new Date(`${day}T00:00:00Z`);
  const hrefFor = (next: { days?: number; day?: string | null }) => {
    const search = new URLSearchParams({ days: String(next.days ?? range) });
    if (next.day) search.set('day', next.day);
    return `/admin/analytics?${search}`;
  };
  const tickIndexes = new Set([0, Math.floor((range - 1) / 2), range - 1]);

  const cards = [
    [en ? 'Visitors today' : 'بازدیدکننده امروز', todayRow.visitors],
    [en ? 'Page views today' : 'بازدید صفحه امروز', todayRow.views],
    [en ? `Page views · ${range} days` : `بازدید صفحه · ${number(range)} روز`, rangeViews],
    [en ? `Avg. visitors per day · ${range} days` : `میانگین بازدیدکننده روزانه · ${number(range)} روز`, Math.round(rangeVisitors / range)],
  ] as const;

  return <>
    <header className={styles.head}>
      <span className={styles.eyebrow}>Traffic</span>
      <h1>{en ? 'Site visits' : 'بازدید سایت'}</h1>
      <p className={styles.muted}>{en
        ? 'Counted without cookies. A visitor is one browser per day (Tehran time); bots and admin pages are excluded, as are visitors who chose “Necessary only”.'
        : 'بدون کوکی شمارش می‌شود. هر بازدیدکننده یعنی یک مرورگر در یک روز (به وقت تهران)؛ ربات‌ها، صفحات مدیریت و کاربرانی که «فقط ضروری» را انتخاب کرده‌اند شمرده نمی‌شوند.'}</p>
    </header>

    <nav className={styles.rangeTabs} aria-label={en ? 'Date range' : 'بازه زمانی'}>
      {RANGES.map((value) => (
        <Link key={value} href={hrefFor({ days: value })} className={value === range ? styles.rangeTabActive : undefined} aria-current={value === range ? 'page' : undefined}>
          {en ? `${value} days` : `${number(value)} روز`}
        </Link>
      ))}
    </nav>

    <div className={styles.grid}>
      {cards.map(([label, value]) => <article className={styles.card} key={label}><span>{label}</span><strong className={styles.metric}>{number(value)}</strong></article>)}
    </div>

    <section className={`${styles.card} ${styles.chartCard}`} aria-labelledby="visitors-chart-title">
      <div className={styles.sectionHead}>
        <div>
          <h2 id="visitors-chart-title">{en ? 'Unique visitors per day' : 'بازدیدکننده یکتا در هر روز'}</h2>
          <p className={styles.muted}>{en ? 'Select a bar to see the pages visited that day.' : 'برای دیدن صفحات بازدیدشده در هر روز، روی ستون آن کلیک کنید.'}</p>
        </div>
      </div>
      <div className={styles.chart}>
        <div className={styles.chartAxis} aria-hidden="true">
          <span>{number(maxVisitors)}</span><span>{number(Math.round(maxVisitors / 2))}</span><span>{number(0)}</span>
        </div>
        <div className={styles.chartPlot}>
          <div className={styles.chartBars}>
            {days.map((row) => (
              <Link
                key={row.day}
                href={hrefFor({ day: row.day === selectedDay ? null : row.day })}
                className={`${styles.chartBar} ${selectedDay && row.day !== selectedDay ? styles.chartBarMuted : ''}`}
                aria-label={`${longDate.format(asDate(row.day))}: ${number(row.visitors)} ${en ? 'visitors' : 'بازدیدکننده'}, ${number(row.views)} ${en ? 'page views' : 'بازدید صفحه'}`}
                aria-current={row.day === selectedDay ? 'date' : undefined}
              >
                <span className={styles.chartFill} style={{ height: `${(row.visitors / maxVisitors) * 100}%` }} />
                <span className={styles.chartTip} aria-hidden="true">
                  <strong>{longDate.format(asDate(row.day))}</strong>
                  <span>{en ? 'Visitors' : 'بازدیدکننده'}: {number(row.visitors)}</span>
                  <span>{en ? 'Page views' : 'بازدید صفحه'}: {number(row.views)}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className={styles.chartTicks} aria-hidden="true">
            {days.map((row, index) => <span key={row.day}>{tickIndexes.has(index) ? shortDate.format(asDate(row.day)) : ''}</span>)}
          </div>
        </div>
      </div>
    </section>

    <div className={styles.trafficGrid}>
      <section aria-labelledby="daily-title">
        <div className={styles.sectionHead}><h2 id="daily-title">{en ? 'Daily breakdown' : 'آمار روزانه'}</h2></div>
        <div className={`${styles.tableWrap} ${styles.scrollTable}`}>
          <table className={`${styles.table} ${styles.compactTable}`}>
            <thead><tr><th>{en ? 'Day' : 'روز'}</th><th>{en ? 'Visitors' : 'بازدیدکننده'}</th><th>{en ? 'Page views' : 'بازدید صفحه'}</th></tr></thead>
            <tbody>
              {[...days].reverse().map((row) => (
                <tr key={row.day} className={row.day === selectedDay ? styles.selectedRow : undefined}>
                  <td><Link href={hrefFor({ day: row.day === selectedDay ? null : row.day })}>{longDate.format(asDate(row.day))}</Link></td>
                  <td>{number(row.visitors)}</td>
                  <td>{number(row.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="pages-title">
        <div className={styles.sectionHead}>
          <div>
            <h2 id="pages-title">{en ? 'Pages visited' : 'صفحات بازدیدشده'}</h2>
            <span className={styles.muted}>{selectedDay ? longDate.format(asDate(selectedDay)) : en ? `Last ${range} days` : `${number(range)} روز اخیر`}</span>
          </div>
          {selectedDay && <Link href={hrefFor({})} className={`${styles.button} ${styles.secondary} ${styles.inlineButton}`}>{en ? 'Show whole range' : 'نمایش کل بازه'}</Link>}
        </div>
        <div className={`${styles.tableWrap} ${styles.scrollTable}`}>
          {pages.length === 0
            ? <p className={styles.emptyState}>{en ? 'No visits recorded for this period yet.' : 'هنوز بازدیدی برای این بازه ثبت نشده است.'}</p>
            : <table className={`${styles.table} ${styles.compactTable}`}>
                <thead><tr><th>{en ? 'Page' : 'صفحه'}</th><th>{en ? 'Lang' : 'زبان'}</th><th>{en ? 'Page views' : 'بازدید صفحه'}</th><th title={selectedDay ? undefined : en ? 'Sum of each day’s unique visitors' : 'مجموع بازدیدکنندگان یکتای هر روز'}>{en ? 'Visitors' : 'بازدیدکننده'}</th></tr></thead>
                <tbody>
                  {pages.map((row) => (
                    <tr key={`${row.locale}${row.path}`}>
                      <td className={styles.pathCell}><a href={`/${row.locale}${row.path === '/' ? '' : row.path}`} target="_blank" rel="noopener noreferrer"><bdi>{row.path}</bdi></a></td>
                      <td>{row.locale.toUpperCase()}</td>
                      <td>
                        {number(row.views)}
                        <span className={styles.meter} aria-hidden="true"><span style={{ width: `${(row.views / maxPageViews) * 100}%` }} /></span>
                      </td>
                      <td>{number(row.visitors)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
      </section>
    </div>
  </>;
}
