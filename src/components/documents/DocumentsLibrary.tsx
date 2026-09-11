'use client';

import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import {
  controllerDocumentGroups,
  type CncDocument,
  type DocumentBrand,
  type DocumentKind,
} from '@/data/cnc-documents';
import styles from './DocumentsLibrary.module.css';

type BrandInfo = {
  id: DocumentBrand;
  name: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  taglineFa: string;
  taglineEn: string;
};

const brands: BrandInfo[] = [
  { id: 'fanuc', name: 'FANUC', logo: '/images/documents/fanuc.svg', logoWidth: 200, logoHeight: 34, taglineFa: 'کنترلرهای سری ۰، ۶، ۱۰، ۱۵، ۱۶، ۱۸، ۲۱ و 0i', taglineEn: 'Series 0, 6, 10, 15, 16, 18, 21 and 0i controls' },
  { id: 'heidenhain', name: 'HEIDENHAIN', logo: '/images/documents/heidenhain.svg', logoWidth: 1024, logoHeight: 126, taglineFa: 'خانواده‌های TNC و iTNC برای فرز و ماشین‌کاری', taglineEn: 'TNC and iTNC families for milling and machining' },
  { id: 'siemens', name: 'SIEMENS', logo: '/images/documents/siemens.svg', logoWidth: 1000, logoHeight: 159, taglineFa: 'کنترلرهای SINUMERIK از 802D تا 840D', taglineEn: 'SINUMERIK controls from 802D through 840D' },
  { id: 'mitsubishi', name: 'MITSUBISHI', logo: '/images/documents/mitsubishi-electric.svg', logoWidth: 794, logoHeight: 242, taglineFa: 'کنترلرهای MELDAS سری M60، M600 و M700', taglineEn: 'MELDAS M60, M600 and M700 controls' },
  { id: 'haas', name: 'HAAS', logo: '/images/documents/haas.svg', logoWidth: 420, logoHeight: 180, taglineFa: 'کنترل کلاسیک Haas و نسل جدید NGC', taglineEn: 'Classic Haas Control and the newer NGC' },
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
  direct: { fa: 'دریافت PDF از سازنده', en: 'Download OEM PDF' },
  library: { fa: 'بازکردن کتابخانه رسمی', en: 'Open OEM library' },
  portal: { fa: 'ورود به پورتال رسمی', en: 'Open OEM portal' },
  archive: { fa: 'مشاهده منوال در آرشیو', en: 'View manual in archive' },
};

const kindOrder: DocumentKind[] = ['operator', 'programming', 'parameter', 'connection', 'maintenance', 'diagnostics', 'reference'];

function documentKinds(documents: CncDocument[]) {
  return kindOrder.filter((kind) => documents.some((document) => document.kind === kind));
}

export function DocumentsLibrary({ locale, initialModel, initialQuery = '' }: { locale: string; initialModel?: string; initialQuery?: string }) {
  const en = locale === 'en';
  const numberLocale = en ? 'en-US' : 'fa-IR';
  const formatNumber = (value: number) => value.toLocaleString(numberLocale);
  const initialGroup = controllerDocumentGroups.find((group) => group.id === initialModel) ?? null;
  const [selectedBrand, setSelectedBrand] = useState<DocumentBrand | null>(initialGroup?.brand ?? null);
  const [selectedModel, setSelectedModel] = useState<string | null>(initialGroup?.id ?? null);
  const [selectedKind, setSelectedKind] = useState<DocumentKind | 'all'>('all');
  const [query, setQuery] = useState(initialQuery);
  const modelSectionRef = useRef<HTMLElement>(null);
  const documentSectionRef = useRef<HTMLElement>(null);

  const groups = useMemo(
    () => controllerDocumentGroups.filter((group) => group.brand === selectedBrand),
    [selectedBrand],
  );
  const selectedBrandInfo = brands.find((brand) => brand.id === selectedBrand) ?? null;
  const activeGroup = controllerDocumentGroups.find((group) => group.id === selectedModel) ?? null;
  const activeBrandInfo = brands.find((brand) => brand.id === activeGroup?.brand) ?? null;
  const visibleDocuments = useMemo(() => {
    if (!activeGroup) return [];
    const needle = query.trim().toLocaleLowerCase(locale);
    return activeGroup.documents.filter((document) => {
      if (selectedKind !== 'all' && document.kind !== selectedKind) return false;
      if (!needle) return true;
      return [document.title, document.documentNumber, document.revision, document.language]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase(locale)
        .includes(needle);
    });
  }, [activeGroup, locale, query, selectedKind]);

  const chooseBrand = (brand: DocumentBrand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedKind('all');
    setQuery('');
    window.setTimeout(() => modelSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const chooseModel = (model: string) => {
    setSelectedModel(model);
    setSelectedKind('all');
    setQuery('');
    window.setTimeout(() => documentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <div className={styles.library}>
      <nav className={styles.steps} aria-label={en ? 'Document selection steps' : 'مراحل انتخاب سند'}>
        <button type="button" data-active={!selectedBrand} onClick={() => { setSelectedBrand(null); setSelectedModel(null); }}>
          <b>{en ? '01' : '۰۱'}</b><span>{en ? 'Controller brand' : 'برند کنترلر'}</span>
        </button>
        <i aria-hidden="true" />
        <button type="button" disabled={!selectedBrand} data-active={Boolean(selectedBrand && !selectedModel)} onClick={() => setSelectedModel(null)}>
          <b>{en ? '02' : '۰۲'}</b><span>{en ? 'Exact model' : 'مدل دقیق'}</span>
        </button>
        <i aria-hidden="true" />
        <button type="button" disabled={!selectedModel} data-active={Boolean(selectedModel)} onClick={() => documentSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          <b>{en ? '03' : '۰۳'}</b><span>{en ? 'Available documents' : 'اسناد موجود'}</span>
        </button>
      </nav>

      <section className={styles.brandSection} aria-labelledby="document-brands-title">
        <div className={styles.sectionHeading}>
          <div><span>{en ? 'STEP 01' : 'مرحله ۰۱'}</span><h2 id="document-brands-title">{en ? 'Choose the controller manufacturer' : 'سازنده کنترلر را انتخاب کنید'}</h2></div>
        </div>
        <div className={styles.brandGrid}>
          {brands.map((brand) => {
            const brandGroups = controllerDocumentGroups.filter((group) => group.brand === brand.id);
            const count = brandGroups.reduce((sum, group) => sum + group.documents.length, 0);
            return (
              <button type="button" key={brand.id} className={styles.brandCard} data-brand={brand.id} data-selected={selectedBrand === brand.id} onClick={() => chooseBrand(brand.id)}>
                <span className={styles.brandTop}>
                  <span className={styles.brandLogo}>
                    <Image src={brand.logo} alt={`${brand.name} logo`} width={brand.logoWidth} height={brand.logoHeight} />
                  </span>
                </span>
                <small>{en ? brand.taglineEn : brand.taglineFa}</small>
                <span className={styles.brandStats}><b>{formatNumber(brandGroups.length)}</b> {en ? 'families' : 'خانواده'} · <b>{formatNumber(count)}</b> {en ? 'documents' : 'سند'}</span>
                <span className={styles.selectLabel}>{en ? 'Select manufacturer' : 'انتخاب سازنده'} <i aria-hidden="true">←</i></span>
              </button>
            );
          })}
        </div>
      </section>

      {selectedBrand && (
        <section ref={modelSectionRef} className={styles.modelSection} aria-labelledby="document-models-title">
          <div className={styles.sectionHeading}>
            <div><span>{en ? 'STEP 02' : 'مرحله ۰۲'}</span><h2 id="document-models-title">{en ? `Choose the exact ${selectedBrandInfo?.name} model` : `مدل دقیق ${selectedBrandInfo?.name} را انتخاب کنید`}</h2></div>
            <button type="button" className={styles.changeButton} onClick={() => { setSelectedBrand(null); setSelectedModel(null); }}>{en ? 'Change manufacturer' : 'تغییر سازنده'}</button>
          </div>
          <div className={styles.modelGrid}>
            {groups.map((group) => (
              <button type="button" key={group.id} className={styles.modelCard} data-brand={group.brand} data-selected={selectedModel === group.id} onClick={() => chooseModel(group.id)}>
                <span className={styles.modelTop}>
                  {selectedBrandInfo && (
                    <span className={styles.modelBrandLogo} aria-hidden="true">
                      <Image src={selectedBrandInfo.logo} alt="" width={selectedBrandInfo.logoWidth} height={selectedBrandInfo.logoHeight} />
                    </span>
                  )}
                  <span className={styles.modelNumber}>{formatNumber(group.documents.length)} {en ? 'documents' : 'سند'}</span>
                </span>
                <h3 dir="ltr">{group.model}</h3>
                <p>{en ? group.descriptionEn : group.descriptionFa}</p>
                <span className={styles.kindPreview}>
                  {documentKinds(group.documents).slice(0, 4).map((kind) => <i key={kind}>{kindLabels[kind][en ? 'en' : 'fa']}</i>)}
                </span>
                <span className={styles.selectLabel}>{en ? 'Open this model' : 'مشاهده اسناد این مدل'} <i aria-hidden="true">←</i></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {activeGroup && (
        <section id="document-results" ref={documentSectionRef} className={styles.documentSection} data-brand={activeGroup.brand} aria-labelledby="selected-model-title">
          <header className={styles.documentHero}>
            <div>
              <span className={styles.documentBrandLockup}>
                {activeBrandInfo && <Image src={activeBrandInfo.logo} alt="" width={activeBrandInfo.logoWidth} height={activeBrandInfo.logoHeight} />}
                <span className={styles.documentBrand}>{activeGroup.brandLabel}</span>
              </span>
              <h2 id="selected-model-title" dir="ltr">{activeGroup.model}</h2>
              <p>{en ? activeGroup.descriptionEn : activeGroup.descriptionFa}</p>
            </div>
            <button type="button" className={styles.changeButton} onClick={() => setSelectedModel(null)}>{en ? 'Change model' : 'تغییر مدل'}</button>
          </header>

          <div className={styles.documentTools}>
            <label className={styles.search}>
              <span aria-hidden="true">⌕</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={en ? 'Search title or document number…' : 'جست‌وجوی عنوان یا شماره سند…'} />
            </label>
            <div className={styles.kindFilters} aria-label={en ? 'Document types' : 'نوع سند'}>
              <button type="button" data-active={selectedKind === 'all'} onClick={() => setSelectedKind('all')}>{en ? 'All' : 'همه'} <b>{formatNumber(activeGroup.documents.length)}</b></button>
              {documentKinds(activeGroup.documents).map((kind) => (
                <button type="button" key={kind} data-active={selectedKind === kind} onClick={() => setSelectedKind(kind)}>
                  {kindLabels[kind][en ? 'en' : 'fa']} <b>{formatNumber(activeGroup.documents.filter((document) => document.kind === kind).length)}</b>
                </button>
              ))}
            </div>
          </div>

          {visibleDocuments.length ? (
            <ul className={styles.documents}>
              {visibleDocuments.map((document) => (
                <li key={`${document.title}-${document.documentNumber ?? document.url}`}>
                  <div className={styles.documentIcon} aria-hidden="true">{document.kind === 'connection' ? '⌁' : document.kind === 'parameter' ? '# ' : '≡'}</div>
                  <div className={styles.documentInfo}>
                    <div className={styles.documentHeading}><span className={styles.kind}>{kindLabels[document.kind][en ? 'en' : 'fa']}</span><span className={styles.language}>{document.language}</span></div>
                    <h3>{document.title}</h3>
                    <div className={styles.documentMeta} dir="ltr">{document.documentNumber && <code>{document.documentNumber}</code>}{document.revision && <span>{document.revision}</span>}</div>
                  </div>
                  <div className={styles.documentActions}>
                    <a href={document.url} target="_blank" rel="noopener noreferrer nofollow">{accessLabels[document.access][en ? 'en' : 'fa']}<span aria-hidden="true">↗</span></a>
                    {document.officialUrl && <a className={styles.officialLink} href={document.officialUrl} target="_blank" rel="noopener noreferrer nofollow">{en ? 'Official manufacturer portal' : 'پورتال رسمی سازنده'}<span aria-hidden="true">↗</span></a>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty}><strong>{en ? 'No matching documents' : 'سندی با این مشخصات پیدا نشد'}</strong><p>{en ? 'Clear the search or choose another document type.' : 'عبارت جست‌وجو را پاک کنید یا نوع سند دیگری را انتخاب کنید.'}</p></div>
          )}
        </section>
      )}
    </div>
  );
}
