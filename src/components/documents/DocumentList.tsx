'use client';

import { useMemo, useState } from 'react';
import type { ControllerDocumentGroup, DocumentKind } from '@/data/cnc-documents';
import styles from './DocumentsLibrary.module.css';

const kindLabels: Record<DocumentKind, { fa: string; en: string }> = {
  operator: { fa: 'اپراتوری', en: 'Operator' }, maintenance: { fa: 'نگهداری', en: 'Maintenance' }, parameter: { fa: 'پارامتر', en: 'Parameter' },
  connection: { fa: 'اتصال', en: 'Connection' }, programming: { fa: 'برنامه‌نویسی', en: 'Programming' }, diagnostics: { fa: 'خطا و عیب‌یابی', en: 'Diagnostics' }, reference: { fa: 'مرجع و کاتالوگ', en: 'Reference' },
};
const accessLabels = {
  direct: { fa: 'دریافت از سازنده', en: 'Download from OEM' }, library: { fa: 'کتابخانه رسمی', en: 'Official library' }, portal: { fa: 'پورتال رسمی', en: 'Official portal' }, archive: { fa: 'مشاهده در آرشیو', en: 'View in archive' },
};
const kindOrder: DocumentKind[] = ['operator', 'programming', 'parameter', 'connection', 'maintenance', 'diagnostics', 'reference'];

export function DocumentList({ group, locale, initialQuery = '' }: { group: ControllerDocumentGroup; locale: string; initialQuery?: string }) {
  const en = locale === 'en';
  const numberLocale = en ? 'en-US' : 'fa-IR';
  const [kind, setKind] = useState<DocumentKind | 'all'>('all');
  const [query, setQuery] = useState(initialQuery);
  const kinds = kindOrder.filter((item) => group.documents.some((document) => document.kind === item));
  const documents = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return group.documents.filter((document) => (kind === 'all' || document.kind === kind) && (!needle || [document.title, document.documentNumber, document.revision, document.language, document.coverageFa, document.coverageEn].filter(Boolean).join(' ').toLocaleLowerCase(locale).includes(needle)));
  }, [group.documents, kind, locale, query]);

  return <>
    <div className={styles.documentTools}>
      <label className={styles.search}><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={en ? 'Search title or document number…' : 'جست‌وجوی عنوان یا شماره سند…'} /></label>
      <div className={styles.kindFilters} aria-label={en ? 'Document types' : 'نوع سند'}>
        <button type="button" data-active={kind === 'all'} onClick={() => setKind('all')}>{en ? 'All' : 'همه'} <b>{group.documents.length.toLocaleString(numberLocale)}</b></button>
        {kinds.map((item) => <button type="button" key={item} data-active={kind === item} onClick={() => setKind(item)}>{kindLabels[item][en ? 'en' : 'fa']} <b>{group.documents.filter((document) => document.kind === item).length.toLocaleString(numberLocale)}</b></button>)}
      </div>
    </div>
    {documents.length ? <ul className={styles.documents}>{documents.map((document) => {
      const source = document.source ?? (document.access === 'archive' ? 'unofficial' : 'official');
      return <li key={`${document.title}-${document.documentNumber ?? document.url}`}>
        <div className={styles.documentIcon} aria-hidden="true">{document.kind === 'connection' ? '⌁' : document.kind === 'parameter' ? '#' : '≡'}</div>
        <div className={styles.documentInfo}>
          <div className={styles.documentHeading}>
            <span className={styles.kind}>{kindLabels[document.kind][en ? 'en' : 'fa']}</span>
            <span className={styles.language}>{document.language}</span>
            <span className={styles.sourceBadge} data-source={source}>{source === 'official' ? (en ? 'Official' : 'رسمی') : (en ? 'Unofficial / archive' : 'غیررسمی / آرشیوی')}</span>
          </div>
          <h3>{document.title}</h3>
          <div className={styles.documentMeta} dir="ltr">{document.documentNumber && <code>{document.documentNumber}</code>}{document.revision && <span>{document.revision}</span>}</div>
          {(document.coverageFa || document.coverageEn) && <p className={styles.documentCoverage}>{en ? document.coverageEn : document.coverageFa}</p>}
        </div>
        <div className={styles.documentActions}><a href={document.url} target="_blank" rel="noopener noreferrer nofollow">{accessLabels[document.access][en ? 'en' : 'fa']}<span aria-hidden="true">↗</span></a>{document.officialUrl && <a className={styles.officialLink} href={document.officialUrl} target="_blank" rel="noopener noreferrer nofollow">{en ? 'Official manufacturer source' : 'منبع رسمی سازنده'}<span aria-hidden="true">↗</span></a>}</div>
      </li>;
    })}</ul> : <div className={styles.empty}><strong>{en ? 'No matching documents' : 'سندی با این مشخصات پیدا نشد'}</strong><p>{en ? 'Clear the search or choose another type.' : 'عبارت جست‌وجو را پاک کنید یا نوع دیگری را انتخاب کنید.'}</p></div>}
  </>;
}
