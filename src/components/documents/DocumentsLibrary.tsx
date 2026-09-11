'use client';

import { useMemo, useState } from 'react';
import { controllerDocumentGroups, type DocumentBrand, type DocumentKind } from '@/data/cnc-documents';
import styles from './DocumentsLibrary.module.css';

type BrandFilter = 'all' | DocumentBrand;
type KindFilter = 'all' | DocumentKind;

const brands: Array<{ value: BrandFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'fanuc', label: 'FANUC' },
  { value: 'heidenhain', label: 'HEIDENHAIN' },
  { value: 'siemens', label: 'SIEMENS' },
  { value: 'mitsubishi', label: 'MITSUBISHI' },
  { value: 'haas', label: 'HAAS' },
];

const kindLabels: Record<DocumentKind, { fa: string; en: string }> = {
  operator: { fa: 'اپراتوری', en: 'Operator' },
  maintenance: { fa: 'نگهداری', en: 'Maintenance' },
  parameter: { fa: 'پارامتر', en: 'Parameter' },
  connection: { fa: 'اتصال', en: 'Connection' },
  programming: { fa: 'برنامه‌نویسی', en: 'Programming' },
  diagnostics: { fa: 'خطا و عیب‌یابی', en: 'Diagnostics' },
  reference: { fa: 'مرجع و کاتالوگ', en: 'Reference' },
};

const accessLabels = {
  direct: { fa: 'دانلود از سازنده', en: 'OEM download' },
  library: { fa: 'بازکردن کتابخانه رسمی', en: 'Open OEM library' },
  portal: { fa: 'ورود به پورتال رسمی', en: 'Open OEM portal' },
  archive: { fa: 'مشاهده منوال در آرشیو', en: 'View manual in archive' },
};

export function DocumentsLibrary({ locale }: { locale: string }) {
  const en = locale === 'en';
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState<BrandFilter>('all');
  const [kind, setKind] = useState<KindFilter>('all');

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);

    return controllerDocumentGroups.flatMap((group) => {
      if (brand !== 'all' && group.brand !== brand) return [];
      const groupText = [group.brandLabel, group.model, group.descriptionFa, group.descriptionEn].join(' ').toLocaleLowerCase(locale);
      const groupMatches = !needle || groupText.includes(needle);
      const documents = group.documents.filter((document) => {
        if (kind !== 'all' && document.kind !== kind) return false;
        if (groupMatches) return true;
        return [document.title, document.documentNumber, document.revision, document.language]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase(locale)
          .includes(needle);
      });
      return documents.length ? [{ ...group, documents }] : [];
    });
  }, [brand, kind, locale, query]);

  const visibleDocumentCount = results.reduce((sum, group) => sum + group.documents.length, 0);

  return (
    <div className={styles.library}>
      <section className={styles.controls} aria-label={en ? 'Document filters' : 'فیلتر اسناد'}>
        <label className={styles.search}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={en ? 'Controller, title, or document number…' : 'جست‌وجوی کنترلر، عنوان یا شماره سند…'}
          />
        </label>

        <div className={styles.brandFilters} aria-label={en ? 'Manufacturers' : 'سازندگان'}>
          {brands.map((item) => (
            <button
              type="button"
              key={item.value}
              data-active={brand === item.value}
              onClick={() => setBrand(item.value)}
            >
              {item.value === 'all' ? (en ? 'All' : 'همه') : item.label}
            </button>
          ))}
        </div>

        <label className={styles.kindFilter}>
          <span>{en ? 'Document type' : 'نوع سند'}</span>
          <select value={kind} onChange={(event) => setKind(event.target.value as KindFilter)}>
            <option value="all">{en ? 'All types' : 'همه انواع'}</option>
            {(Object.keys(kindLabels) as DocumentKind[]).map((value) => (
              <option value={value} key={value}>{kindLabels[value][en ? 'en' : 'fa']}</option>
            ))}
          </select>
        </label>
      </section>

      <div className={styles.resultMeta} aria-live="polite">
        <strong>{results.length.toLocaleString(locale)} {en ? 'controller families' : 'خانواده کنترلر'}</strong>
        <span>{visibleDocumentCount.toLocaleString(locale)} {en ? 'verified document records' : 'رکورد سند بررسی‌شده'}</span>
      </div>

      {results.length > 0 ? (
        <section className={styles.grid} aria-label={en ? 'CNC document library' : 'کتابخانه اسناد CNC'}>
          {results.map((group) => (
            <details className={styles.card} key={group.id} data-brand={group.brand}>
              <summary>
                <div className={styles.cardTopline}>
                  <span className={styles.brand}>{group.brandLabel}</span>
                  <span className={styles.documentCount}>{group.documents.length.toLocaleString(locale)} {en ? 'docs' : 'سند'}</span>
                </div>
                <h2 dir="ltr">{group.model}</h2>
                <p>{en ? group.descriptionEn : group.descriptionFa}</p>
                <span className={styles.expandLabel}>
                  {en ? 'View documents' : 'مشاهده اسناد'}
                  <i aria-hidden="true">+</i>
                </span>
              </summary>

              <ul className={styles.documents}>
                {group.documents.map((document) => (
                  <li key={`${document.title}-${document.documentNumber ?? document.url}`}>
                    <div className={styles.documentHeading}>
                      <span className={styles.kind}>{kindLabels[document.kind][en ? 'en' : 'fa']}</span>
                      <span className={styles.language}>{document.language}</span>
                    </div>
                    <strong>{document.title}</strong>
                    <div className={styles.documentMeta} dir="ltr">
                      {document.documentNumber && <code>{document.documentNumber}</code>}
                      {document.revision && <span>{document.revision}</span>}
                    </div>
                    <a href={document.url} target="_blank" rel="noopener noreferrer nofollow">
                      {accessLabels[document.access][en ? 'en' : 'fa']}
                      <span aria-hidden="true">↗</span>
                    </a>
                    {document.officialUrl && (
                      <a className={styles.officialLink} href={document.officialUrl} target="_blank" rel="noopener noreferrer nofollow">
                        {en ? 'FANUC official portal' : 'پورتال رسمی FANUC'}
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {document.access === 'portal' && (
                      <small>{en ? `Search for ${document.documentNumber} after signing in.` : `پس از ورود، شماره ${document.documentNumber} را جست‌وجو کنید.`}</small>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </section>
      ) : (
        <div className={styles.empty}>
          <strong>{en ? 'No matching documents' : 'سندی با این مشخصات پیدا نشد'}</strong>
          <p>{en ? 'Try another controller name or clear one of the filters.' : 'نام کنترلر دیگری را جست‌وجو کنید یا یکی از فیلترها را بردارید.'}</p>
        </div>
      )}
    </div>
  );
}
