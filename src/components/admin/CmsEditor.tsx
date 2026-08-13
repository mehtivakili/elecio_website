'use client';

import { FormEvent, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { useRouter } from '@/i18n/navigation';
import styles from './CmsEditor.module.css';

type Doc = Record<string, unknown>;
type Initial = {
  id?: number; slug: string; titleFa: string; titleEn: string; excerptFa: string; excerptEn: string;
  bodyFa: Doc; bodyEn: Doc; coverImagePath: string; coverAltFa: string; coverAltEn: string; coverCaptionFa: string; coverCaptionEn: string;
  seoTitleFa: string; seoTitleEn: string; seoDescriptionFa: string; seoDescriptionEn: string;
  focusKeywordFa: string; focusKeywordEn: string; secondaryKeywordsFa: string; secondaryKeywordsEn: string;
  canonicalUrlFa: string; canonicalUrlEn: string; robotsIndex: boolean; schemaType: string;
  ogTitleFa: string; ogTitleEn: string; ogDescriptionFa: string; ogDescriptionEn: string;
  translationStatus: string; status: string; scheduledFor: string; categoryId: number | null; tagIds: number[];
};
const emptyDocument: Doc = { type: 'doc', content: [{ type: 'paragraph' }] };
const emptyInitial: Initial = { slug: '', titleFa: '', titleEn: '', excerptFa: '', excerptEn: '', bodyFa: emptyDocument, bodyEn: emptyDocument, coverImagePath: '', coverAltFa: '', coverAltEn: '', coverCaptionFa: '', coverCaptionEn: '', seoTitleFa: '', seoTitleEn: '', seoDescriptionFa: '', seoDescriptionEn: '', focusKeywordFa: '', focusKeywordEn: '', secondaryKeywordsFa: '', secondaryKeywordsEn: '', canonicalUrlFa: '', canonicalUrlEn: '', robotsIndex: true, schemaType: 'Article', ogTitleFa: '', ogTitleEn: '', ogDescriptionFa: '', ogDescriptionEn: '', translationStatus: 'complete', status: 'draft', scheduledFor: '', categoryId: null, tagIds: [] };

function documentWordCount(document: Doc) {
  const words: string[] = [];
  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    const node = value as { text?: unknown; content?: unknown };
    if (typeof node.text === 'string') words.push(...node.text.trim().split(/\s+/).filter(Boolean));
    if (Array.isArray(node.content)) node.content.forEach(visit);
  };
  visit(document);
  return words.length;
}

function RichEditor({ value, onChange, direction }: { value: Doc; onChange: (doc: Doc) => void; direction: 'rtl' | 'ltr' }) {
  const editor = useEditor({ immediatelyRender: false, extensions: [StarterKit, LinkExtension.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }), ImageExtension], content: value, onUpdate: ({ editor: current }) => onChange(current.getJSON()), editorProps: { attributes: { class: styles.editor, dir: direction } } });
  if (!editor) return null;
  const setLink = () => { const href = window.prompt('https://'); if (href) editor.chain().focus().setLink({ href }).run(); };
  return <div className={styles.panel}><div className={styles.toolbar}>
    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>B</button><button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button><button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
    <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>•</button><button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</button>
    <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>“</button><button type="button" onClick={setLink}>↗</button><button type="button" onClick={() => editor.chain().focus().undo().run()}>↶</button><button type="button" onClick={() => editor.chain().focus().redo().run()}>↷</button>
  </div><EditorContent editor={editor} /></div>;
}

export function CmsEditor({ locale, initial, categories, tags }: { locale: string; initial?: Initial; categories: { id: number; name: string }[]; tags: { id: number; name: string }[] }) {
  const en = locale === 'en'; const router = useRouter(); const [state, setState] = useState<Initial>(initial ?? emptyInitial);
  const initialFaWords = documentWordCount((initial ?? emptyInitial).bodyFa);
  const initialEnWords = documentWordCount((initial ?? emptyInitial).bodyEn);
  const [active, setActive] = useState<'fa' | 'en'>(initialEnWords > initialFaWords * 1.5 ? 'en' : 'fa'); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const field = <K extends keyof Initial>(key: K, value: Initial[K]) => setState(current => ({ ...current, [key]: value }));
  async function save(status: string) { setBusy(true); setMessage(''); const response = await fetch('/api/admin/cms/posts', { method: initial?.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...state, status, changeSummary: initial?.id ? 'Editorial update' : 'Initial draft' }) }); const result = await response.json(); if (response.ok) { setMessage(en ? 'Saved.' : 'ذخیره شد.'); if (!initial?.id) router.replace(`/admin/content/${result.id}`); router.refresh(); } else setMessage(`${en ? 'Could not save' : 'ذخیره ممکن نشد'}: ${result.error}`); setBusy(false); }
  async function upload(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const uploadForm = event.currentTarget; const formData = new FormData(uploadForm); const response = await fetch('/api/admin/cms/media', { method: 'POST', body: formData }); const result = await response.json(); if (response.ok) { field('coverImagePath', result.path); field('coverAltFa', String(formData.get('altFa') ?? '')); field('coverAltEn', String(formData.get('altEn') ?? '')); setMessage(en ? 'Cover uploaded and optimized.' : 'تصویر کاور بارگذاری و بهینه شد.'); } else setMessage(en ? 'Image upload failed.' : 'بارگذاری تصویر ناموفق بود.'); }
  async function preview() { if (!initial?.id) { setMessage(en ? 'Save the draft before previewing.' : 'پیش از پیش‌نمایش، پیش‌نویس را ذخیره کنید.'); return; } const response = await fetch('/api/admin/cms/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: initial.id, locale: active }) }); const result = await response.json(); if (response.ok) window.open(result.url, '_blank', 'noopener,noreferrer'); }
  const localized = active === 'fa';
  const faWords = documentWordCount(state.bodyFa);
  const enWords = documentWordCount(state.bodyEn);
  const seoTitle = localized ? state.seoTitleFa : state.seoTitleEn;
  const seoDescription = localized ? state.seoDescriptionFa : state.seoDescriptionEn;
  const previewTitle = seoTitle || (localized ? state.titleFa : state.titleEn) || (en ? 'Article title' : 'عنوان مقاله');
  const previewDescription = seoDescription || (localized ? state.excerptFa : state.excerptEn) || (en ? 'Search description will appear here.' : 'توضیح نتیجه جست‌وجو اینجا نمایش داده می‌شود.');
  const focusKeyword = localized ? state.focusKeywordFa : state.focusKeywordEn;
  const coverAlt = localized ? state.coverAltFa : state.coverAltEn;
  const seoChecks = [
    { ok: Boolean(state.slug), label: localized ? 'آدرس انگلیسی مقاله' : 'Article slug' },
    { ok: Boolean(focusKeyword), label: localized ? 'کلمه کلیدی اصلی' : 'Focus keyword' },
    { ok: seoTitle.length >= 30 && seoTitle.length <= 60, label: localized ? 'عنوان سئو (۳۰ تا ۶۰ نویسه)' : 'SEO title (30–60 characters)' },
    { ok: seoDescription.length >= 120 && seoDescription.length <= 165, label: localized ? 'توضیح سئو (۱۲۰ تا ۱۶۵ نویسه)' : 'SEO description (120–165 characters)' },
    { ok: Boolean(state.categoryId), label: localized ? 'دسته‌بندی' : 'Category' },
    { ok: Boolean(state.coverImagePath && coverAlt), label: localized ? 'تصویر شاخص و متن جایگزین' : 'Cover image and alt text' },
  ];
  return <div className={styles.layout}><div className={styles.main}>
    <div className={styles.tabs}><button className={`${styles.button} ${active === 'fa' ? styles.activeTab : styles.inactiveTab}`} type="button" onClick={() => setActive('fa')}>فارسی <small>{faWords.toLocaleString('fa-IR')} کلمه</small></button><button className={`${styles.button} ${active === 'en' ? styles.activeTab : styles.inactiveTab}`} type="button" onClick={() => setActive('en')}>English <small>{enWords.toLocaleString('en-US')} words</small></button></div>
    {Math.max(faWords, enWords) > Math.max(1, Math.min(faWords, enWords)) * 1.5 && <p className={styles.languageNotice} role="status">{localized ? `نسخه فارسی ${faWords.toLocaleString('fa-IR')} کلمه است؛ فایل کامل‌تر در تب English با ${enWords.toLocaleString('en-US')} کلمه قرار دارد.` : `The complete English source contains ${enWords.toLocaleString('en-US')} words; the shorter Persian version contains ${faWords.toLocaleString('fa-IR')} words.`}</p>}
    <div className={styles.row}><label className={styles.label}>{localized ? 'عنوان فارسی' : 'English title'}<input className={styles.input} value={localized ? state.titleFa : state.titleEn} onChange={event => field(localized ? 'titleFa' : 'titleEn', event.target.value)} /></label><label className={styles.label}>Slug<input className={styles.input} dir="ltr" value={state.slug} onChange={event => field('slug', event.target.value.toLowerCase())} /></label></div>
    <label className={styles.label}>{localized ? 'خلاصه' : 'Excerpt'}<textarea className={styles.textarea} value={localized ? state.excerptFa : state.excerptEn} onChange={event => field(localized ? 'excerptFa' : 'excerptEn', event.target.value)} /></label>
    {localized ? <RichEditor value={state.bodyFa} onChange={document => field('bodyFa', document)} direction="rtl" /> : <RichEditor value={state.bodyEn} onChange={document => field('bodyEn', document)} direction="ltr" />}
    <section className={styles.panel}><h3>SEO</h3>
      <label className={styles.label}>{localized ? 'کلمه کلیدی اصلی' : 'Focus keyword'}<input className={styles.input} value={localized ? state.focusKeywordFa : state.focusKeywordEn} onChange={event => field(localized ? 'focusKeywordFa' : 'focusKeywordEn', event.target.value)} /></label>
      <label className={styles.label}>{localized ? 'کلمات کلیدی فرعی (با کاما جدا کنید)' : 'Secondary keywords (comma separated)'}<textarea className={styles.textarea} value={localized ? state.secondaryKeywordsFa : state.secondaryKeywordsEn} onChange={event => field(localized ? 'secondaryKeywordsFa' : 'secondaryKeywordsEn', event.target.value)} /></label>
      <label className={styles.label}>{localized ? 'عنوان سئو' : 'SEO title'}<input className={styles.input} value={seoTitle} onChange={event => field(localized ? 'seoTitleFa' : 'seoTitleEn', event.target.value)} /><small className={seoTitle.length > 60 ? styles.warning : styles.counter}>{seoTitle.length}/60</small></label>
      <label className={styles.label}>{localized ? 'توضیح سئو' : 'SEO description'}<textarea className={styles.textarea} value={seoDescription} onChange={event => field(localized ? 'seoDescriptionFa' : 'seoDescriptionEn', event.target.value)} /><small className={seoDescription.length < 120 || seoDescription.length > 165 ? styles.warning : styles.counter}>{seoDescription.length}/120–165</small></label>
      <label className={styles.label}>Canonical URL<input className={styles.input} dir="ltr" placeholder={`/${active}/blog/${state.slug || 'article-slug'}`} value={localized ? state.canonicalUrlFa : state.canonicalUrlEn} onChange={event => field(localized ? 'canonicalUrlFa' : 'canonicalUrlEn', event.target.value)} /></label>
      <details className={styles.advanced}><summary>{localized ? 'شبکه‌های اجتماعی و تنظیمات پیشرفته' : 'Social and advanced settings'}</summary>
        <label className={styles.label}>Open Graph title<input className={styles.input} value={localized ? state.ogTitleFa : state.ogTitleEn} onChange={event => field(localized ? 'ogTitleFa' : 'ogTitleEn', event.target.value)} placeholder={previewTitle} /></label>
        <label className={styles.label}>Open Graph description<textarea className={styles.textarea} value={localized ? state.ogDescriptionFa : state.ogDescriptionEn} onChange={event => field(localized ? 'ogDescriptionFa' : 'ogDescriptionEn', event.target.value)} placeholder={previewDescription} /></label>
      </details>
      <div className={styles.serpPreview} dir={localized ? 'rtl' : 'ltr'}><small>elecio.ir › {active} › blog › {state.slug || 'article-slug'}</small><strong>{previewTitle}</strong><p>{previewDescription}</p></div>
      <div className={styles.seoChecklist} dir={localized ? 'rtl' : 'ltr'}><strong>{localized ? 'آمادگی سئو' : 'SEO readiness'} · {seoChecks.filter(item => item.ok).length}/{seoChecks.length}</strong>{seoChecks.map(item => <span className={item.ok ? styles.checkOk : styles.checkMissing} key={item.label}>{item.ok ? '✓' : '○'} {item.label}</span>)}</div>
    </section>
  </div><aside className={styles.side}><section className={styles.panel}>
    <label className={styles.label}>{en ? 'Translation' : 'ترجمه'}<select className={styles.select} value={state.translationStatus} onChange={event => field('translationStatus', event.target.value)}><option value="complete">Complete</option><option value="fa_only">Persian only</option><option value="en_only">English only</option></select></label>
    <label className={styles.label}>{en ? 'Category' : 'دسته'}<select className={styles.select} value={state.categoryId ?? ''} onChange={event => field('categoryId', Number(event.target.value) || null)}><option value="">—</option>{categories.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
    <label className={styles.label}>{en ? 'Schedule' : 'زمان‌بندی'}<input className={styles.input} type="datetime-local" value={state.scheduledFor} onChange={event => field('scheduledFor', event.target.value)} /></label>
    <label className={styles.label}>{en ? 'Schema type' : 'نوع اسکیما'}<select className={styles.select} value={state.schemaType} onChange={event => field('schemaType', event.target.value)}><option value="Article">Article</option><option value="BlogPosting">BlogPosting</option><option value="TechArticle">TechArticle</option></select></label>
    <label><input type="checkbox" checked={state.robotsIndex} onChange={event => field('robotsIndex', event.target.checked)} /> {en ? 'Allow search engines to index this article' : 'اجازه ایندکس این مقاله به موتورهای جست‌وجو'}</label>
    <fieldset><legend>{en ? 'Tags' : 'برچسب‌ها'}</legend>{tags.map(tag => <label key={tag.id}><input type="checkbox" checked={state.tagIds.includes(tag.id)} onChange={event => field('tagIds', event.target.checked ? [...state.tagIds, tag.id] : state.tagIds.filter(id => id !== tag.id))} />{tag.name}</label>)}</fieldset>
  </section><form className={styles.panel} onSubmit={upload}><h3>{en ? 'Cover image' : 'تصویر کاور'}</h3><input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" required /><input className={styles.input} name="altFa" value={state.coverAltFa} onChange={event => field('coverAltFa', event.target.value)} placeholder="متن جایگزین فارسی" /><input className={styles.input} name="altEn" value={state.coverAltEn} onChange={event => field('coverAltEn', event.target.value)} placeholder="English alt text" /><button className={styles.button}>{en ? 'Upload and optimize' : 'بارگذاری و بهینه‌سازی'}</button>{state.coverImagePath && <><p dir="ltr">{state.coverImagePath}</p><input className={styles.input} value={state.coverCaptionFa} onChange={event => field('coverCaptionFa', event.target.value)} placeholder="توضیح فارسی تصویر" /><input className={styles.input} value={state.coverCaptionEn} onChange={event => field('coverCaptionEn', event.target.value)} placeholder="English image caption" /></>}</form>
    <div className={styles.actions}><button className={`${styles.button} ${styles.secondary}`} disabled={busy} onClick={() => save('draft')}>{en ? 'Save draft' : 'ذخیره پیش‌نویس'}</button><button className={styles.button} disabled={busy} onClick={() => save('published')}>{en ? 'Publish' : 'انتشار'}</button><button className={`${styles.button} ${styles.secondary}`} onClick={preview}>{en ? 'Preview' : 'پیش‌نمایش'}</button></div>{message && <p className={styles.status} role="status">{message}</p>}
  </aside></div>;
}
