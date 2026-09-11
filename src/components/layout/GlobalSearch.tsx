'use client';

import { useEffect, useRef, useState } from 'react';
import { CloseOutlined, FileTextOutlined, ReadOutlined, SearchOutlined } from '@ant-design/icons';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import styles from './GlobalSearch.module.css';

type SearchResult = {
  id: string;
  kind: 'page' | 'article' | 'document';
  title: string;
  description: string;
  meta: string;
  href: string;
};

const iconByKind = {
  page: <SearchOutlined />,
  article: <ReadOutlined />,
  document: <FileTextOutlined />,
};

export function GlobalSearch() {
  const locale = useLocale();
  const router = useRouter();
  const en = locale === 'en';
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchableLength = query.trim().replace(/\s/g, '').length;

  useEffect(() => {
    const openWithKeyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    };
    document.addEventListener('keydown', openWithKeyboard);
    return () => document.removeEventListener('keydown', openWithKeyboard);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || searchableLength < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?locale=${locale}&q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const payload = await response.json() as { results?: SearchResult[] };
        setResults(payload.results ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 260);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [locale, open, query, searchableLength]);

  const goTo = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.bar} data-open={open}>
        <SearchOutlined aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          placeholder={en ? 'Search…' : 'جست‌وجو…'}
          aria-label={en ? 'Search pages, articles and manuals' : 'جست‌وجوی صفحات، مقاله‌ها و منوال‌ها'}
          role="combobox"
          aria-expanded={open}
          aria-controls="global-search-results"
        />
        {loading ? (
          <span className={styles.loader} aria-label={en ? 'Searching' : 'در حال جست‌وجو'} />
        ) : query ? (
          <button type="button" className={styles.clear} onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }} aria-label={en ? 'Clear search' : 'پاک‌کردن جست‌وجو'}><CloseOutlined /></button>
        ) : (
          <kbd>⌘K</kbd>
        )}
      </div>
      {open && (
        <section id="global-search-results" className={styles.dropdown} aria-label={en ? 'Search results' : 'نتایج جست‌وجو'}>
            <div className={styles.body} aria-live="polite">
              {searchableLength < 3 ? (
                <div className={styles.hint}>
                  <SearchOutlined />
                  <strong>{en ? 'Type at least 3 characters' : 'حداقل ۳ نویسه وارد کنید'}</strong>
                  <p>{en ? 'Results use curated titles, summaries, categories and keywords—not full article text.' : 'نتایج بر اساس عنوان، خلاصه، دسته‌بندی و کلیدواژه‌ها هستند؛ نه متن کامل مقاله‌ها.'}</p>
                </div>
              ) : !loading && results.length === 0 ? (
                <div className={styles.hint}>
                  <SearchOutlined />
                  <strong>{en ? 'No relevant result found' : 'نتیجه مرتبطی پیدا نشد'}</strong>
                  <p>{en ? 'Try a controller model, document number or a shorter phrase.' : 'مدل کنترلر، شماره سند یا عبارت کوتاه‌تری را امتحان کنید.'}</p>
                </div>
              ) : (
                <ul className={styles.results}>
                  {results.map((result) => (
                    <li key={result.id}>
                      <button type="button" onClick={() => goTo(result.href)}>
                        <span className={styles.resultIcon} data-kind={result.kind}>{iconByKind[result.kind]}</span>
                        <span className={styles.resultCopy}>
                          <span className={styles.resultTop}><strong>{result.title}</strong><small>{result.meta}</small></span>
                          <span>{result.description}</span>
                        </span>
                        <i aria-hidden="true">{en ? '→' : '←'}</i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <footer className={styles.footer}>
              <span>{en ? 'Searches titles and curated keywords' : 'جست‌وجو در عنوان‌ها و کلیدواژه‌های منتخب'}</span>
              <kbd>ESC</kbd>
            </footer>
        </section>
      )}
    </div>
  );
}
