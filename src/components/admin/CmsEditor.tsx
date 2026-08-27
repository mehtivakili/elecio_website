'use client';

import { FormEvent, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { useRouter } from '@/i18n/navigation';
import { PERSIAN_SEO_KEYWORDS } from '@/lib/persian-seo-keywords';
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
const normalizeSlugInput = (value: string) => value.normalize('NFC').trim().toLowerCase()
  .replace(/[\s_\u200c]+/gu, '-')
  .replace(/[^\p{L}\p{N}-]/gu, '')
  .replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 180);
const emptyInitial: Initial = {
  slug: '', titleFa: '', titleEn: '', excerptFa: '', excerptEn: '', bodyFa: emptyDocument, bodyEn: emptyDocument,
  coverImagePath: '', coverAltFa: '', coverAltEn: '', coverCaptionFa: '', coverCaptionEn: '', seoTitleFa: '', seoTitleEn: '',
  seoDescriptionFa: '', seoDescriptionEn: '', focusKeywordFa: '', focusKeywordEn: '', secondaryKeywordsFa: '', secondaryKeywordsEn: '',
  canonicalUrlFa: '', canonicalUrlEn: '', robotsIndex: true, schemaType: 'Article', ogTitleFa: '', ogTitleEn: '',
  ogDescriptionFa: '', ogDescriptionEn: '', translationStatus: 'fa_only', status: 'draft', scheduledFor: '', categoryId: null, tagIds: [],
};

function documentStats(document: Doc) {
  const result = { words: 0, images: 0, missingAlt: 0 };
  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    const node = value as { type?: unknown; text?: unknown; attrs?: { alt?: unknown }; content?: unknown };
    if (typeof node.text === 'string') result.words += node.text.trim().split(/\s+/).filter(Boolean).length;
    if (node.type === 'image') { result.images += 1; if (typeof node.attrs?.alt !== 'string' || !node.attrs.alt.trim()) result.missingAlt += 1; }
    if (Array.isArray(node.content)) node.content.forEach(visit);
  };
  visit(document);
  return result;
}

function RichEditor({ value, onChange, direction, slug, onMessage }: {
  value: Doc; onChange: (doc: Doc) => void; direction: 'rtl' | 'ltr'; slug: string; onMessage: (message: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, LinkExtension.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }), ImageExtension],
    content: value, onUpdate: ({ editor: current }) => onChange(current.getJSON()),
    editorProps: { attributes: { class: styles.editor, dir: direction } },
  });
  if (!editor) return null;
  const currentEditor = editor;
  const setLink = () => { const href = window.prompt('https://'); if (href) editor.chain().focus().setLink({ href }).run(); };
  async function uploadInline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget; const formData = new FormData(form); const alt = String(formData.get('alt') ?? '').trim();
    if (!alt) { onMessage(direction === 'rtl' ? 'برای تصویر متن جایگزین بنویسید.' : 'Add image alt text first.'); return; }
    formData.set(direction === 'rtl' ? 'altFa' : 'altEn', alt); formData.set('slug', slug); formData.set('kind', 'body');
    const response = await fetch('/api/admin/cms/media', { method: 'POST', body: formData }); const result = await response.json();
    if (response.ok) {
      currentEditor.chain().focus().setImage({ src: result.path, alt, title: String(formData.get('caption') ?? '') }).run();
      form.reset(); onMessage(direction === 'rtl' ? 'تصویر در متن درج و به WebP تبدیل شد.' : 'Image optimized and inserted.');
    } else onMessage(direction === 'rtl' ? 'بارگذاری تصویر ناموفق بود.' : 'Image upload failed.');
  }
  return <div className={styles.panel}>
    <div className={styles.toolbar}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>B</button><button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button><button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>•</button><button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>“</button><button type="button" onClick={setLink}>↗</button><button type="button" onClick={() => editor.chain().focus().undo().run()}>↶</button><button type="button" onClick={() => editor.chain().focus().redo().run()}>↷</button>
    </div>
    <form className={styles.inlineImage} onSubmit={uploadInline}><input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" required/><input className={styles.input} name="alt" placeholder={direction === 'rtl' ? 'متن جایگزین دقیق تصویر' : 'Descriptive image alt text'} required/><input className={styles.input} name="caption" placeholder={direction === 'rtl' ? 'کپشن اختیاری' : 'Optional caption'}/><button className={styles.button} type="submit" disabled={!slug}>{direction === 'rtl' ? 'درج تصویر در متن' : 'Insert body image'}</button></form>
    <EditorContent editor={editor}/>
  </div>;
}

export function CmsEditor({ locale, initial, categories, tags }: { locale: string; initial?: Initial; categories: { id: number; name: string }[]; tags: { id: number; name: string }[] }) {
  const en = locale === 'en'; const router = useRouter(); const [state, setState] = useState<Initial>(initial ?? emptyInitial);
  const initialFa = documentStats((initial ?? emptyInitial).bodyFa); const initialEn = documentStats((initial ?? emptyInitial).bodyEn);
  const [active, setActive] = useState<'fa' | 'en'>(initialEn.words > initialFa.words * 1.5 ? 'en' : 'fa');
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const field = <K extends keyof Initial>(key: K, value: Initial[K]) => setState((current) => ({ ...current, [key]: value }));
  async function save(status: string) {
    setBusy(true); setMessage('');
    const response = await fetch('/api/admin/cms/posts', { method: initial?.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...state, status, changeSummary: initial?.id ? 'Editorial update' : 'Initial draft' }) });
    const result = await response.json();
    if (response.ok) { setMessage(en ? 'Saved.' : 'ذخیره شد.'); if (!initial?.id) router.replace(`/admin/content/${result.id}`); router.refresh(); }
    else setMessage(`${en ? 'Could not save' : 'ذخیره ممکن نشد'}: ${result.error}`);
    setBusy(false);
  }
  async function uploadCover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formData = new FormData(event.currentTarget); formData.set('slug', state.slug); formData.set('kind', 'cover');
    const response = await fetch('/api/admin/cms/media', { method: 'POST', body: formData }); const result = await response.json();
    if (response.ok) { field('coverImagePath', result.path); field('coverAltFa', String(formData.get('altFa') ?? '')); field('coverAltEn', String(formData.get('altEn') ?? '')); setMessage(en ? 'Cover uploaded and optimized.' : 'تصویر شاخص بارگذاری، به WebP تبدیل و با نام سئویی ذخیره شد.'); }
    else setMessage(en ? 'Image upload failed.' : 'بارگذاری تصویر ناموفق بود.');
  }
  async function preview() {
    if (!initial?.id) { setMessage(en ? 'Save the draft before previewing.' : 'پیش از پیش‌نمایش، پیش‌نویس را ذخیره کنید.'); return; }
    const response = await fetch('/api/admin/cms/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: initial.id, locale: active }) });
    const result = await response.json(); if (response.ok) window.open(result.url, '_blank', 'noopener,noreferrer');
  }

  const localized = active === 'fa'; const faStats = documentStats(state.bodyFa); const enStats = documentStats(state.bodyEn); const stats = localized ? faStats : enStats;
  const seoTitle = localized ? state.seoTitleFa : state.seoTitleEn; const seoDescription = localized ? state.seoDescriptionFa : state.seoDescriptionEn;
  const previewTitle = seoTitle || (localized ? state.titleFa : state.titleEn) || (en ? 'Article title' : 'عنوان مقاله');
  const previewDescription = seoDescription || (localized ? state.excerptFa : state.excerptEn) || (en ? 'Search description will appear here.' : 'توضیح نتیجه جست‌وجو اینجا نمایش داده می‌شود.');
  const focusKeyword = localized ? state.focusKeywordFa : state.focusKeywordEn; const coverAlt = localized ? state.coverAltFa : state.coverAltEn;
  const suggestedBodyImages = Math.max(1, Math.ceil(stats.words / 700));
  const seoChecks = [
    { ok: Boolean(state.slug), label: localized ? 'آدرس کوتاه و معنادار مقاله' : 'Article slug' },
    { ok: Boolean(focusKeyword), label: localized ? 'کلمه کلیدی اصلی' : 'Focus keyword' },
    { ok: seoTitle.length >= 30 && seoTitle.length <= 60, label: localized ? 'عنوان سئو (۳۰ تا ۶۰ نویسه)' : 'SEO title (30–60 characters)' },
    { ok: seoDescription.length >= 120 && seoDescription.length <= 165, label: localized ? 'توضیح سئو (۱۲۰ تا ۱۶۵ نویسه)' : 'SEO description (120–165 characters)' },
    { ok: Boolean(state.categoryId), label: localized ? 'دسته‌بندی' : 'Category' },
    { ok: Boolean(state.coverImagePath && coverAlt), label: localized ? 'تصویر شاخص و متن جایگزین' : 'Cover image and alt text' },
    { ok: stats.missingAlt === 0, label: localized ? 'متن جایگزین تصاویر داخل مقاله' : 'Alt text for body images' },
  ];

  return <div className={styles.layout}><div className={styles.main}>
    <div className={styles.tabs}><button className={`${styles.button} ${active === 'fa' ? styles.activeTab : styles.inactiveTab}`} type="button" onClick={() => setActive('fa')}>فارسی <small>{faStats.words.toLocaleString('fa-IR')} کلمه</small></button><button className={`${styles.button} ${active === 'en' ? styles.activeTab : styles.inactiveTab}`} type="button" onClick={() => setActive('en')}>English <small>{enStats.words.toLocaleString('en-US')} words</small></button></div>
    {Math.max(faStats.words, enStats.words) > Math.max(1, Math.min(faStats.words, enStats.words)) * 1.5 && <p className={styles.languageNotice} role="status">{localized ? `نسخه فارسی ${faStats.words.toLocaleString('fa-IR')} کلمه و نسخه انگلیسی ${enStats.words.toLocaleString('en-US')} کلمه است.` : `The English version has ${enStats.words} words; Persian has ${faStats.words}.`}</p>}
    <div className={styles.row}><label className={styles.label}>{localized ? 'عنوان فارسی' : 'English title'}<input className={styles.input} value={localized ? state.titleFa : state.titleEn} onChange={(event) => field(localized ? 'titleFa' : 'titleEn', event.target.value)}/></label><label className={styles.label}>Slug<input className={styles.input} dir={localized ? 'rtl' : 'ltr'} value={state.slug} onChange={(event) => field('slug', normalizeSlugInput(event.target.value))}/><small>{localized ? 'فارسی یا لاتین؛ کوتاه، معنادار، با خط فاصله و پایدار' : 'Short, readable, stable, lowercase'}</small></label></div>
    <label className={styles.label}>{localized ? 'خلاصه' : 'Excerpt'}<textarea className={styles.textarea} value={localized ? state.excerptFa : state.excerptEn} onChange={(event) => field(localized ? 'excerptFa' : 'excerptEn', event.target.value)}/></label>
    {localized ? <RichEditor value={state.bodyFa} onChange={(document) => field('bodyFa', document)} direction="rtl" slug={state.slug} onMessage={setMessage}/> : <RichEditor value={state.bodyEn} onChange={(document) => field('bodyEn', document)} direction="ltr" slug={state.slug} onMessage={setMessage}/>}
    <section className={styles.panel}><h3>SEO</h3>
      <label className={styles.label}>{localized ? 'کلمه کلیدی اصلی' : 'Focus keyword'}<input className={styles.input} list={localized ? 'persian-seo-keywords' : undefined} value={localized ? state.focusKeywordFa : state.focusKeywordEn} onChange={(event) => field(localized ? 'focusKeywordFa' : 'focusKeywordEn', event.target.value)}/>{localized && <datalist id="persian-seo-keywords">{PERSIAN_SEO_KEYWORDS.map((keyword) => <option value={keyword} key={keyword}/>)}</datalist>}<small>{localized ? 'پیشنهادها از seo_keywords.txt هستند؛ کیورد را طبیعی استفاده کنید.' : 'Use naturally; avoid repetition.'}</small></label>
      <label className={styles.label}>{localized ? 'کلمات کلیدی فرعی (با ویرگول جدا کنید)' : 'Secondary keywords (comma separated)'}<textarea className={styles.textarea} value={localized ? state.secondaryKeywordsFa : state.secondaryKeywordsEn} onChange={(event) => field(localized ? 'secondaryKeywordsFa' : 'secondaryKeywordsEn', event.target.value)}/></label>
      <label className={styles.label}>{localized ? 'عنوان سئو' : 'SEO title'}<input className={styles.input} value={seoTitle} onChange={(event) => field(localized ? 'seoTitleFa' : 'seoTitleEn', event.target.value)}/><small className={seoTitle.length < 30 || seoTitle.length > 60 ? styles.warning : styles.counter}>{seoTitle.length}/30–60</small></label>
      <label className={styles.label}>{localized ? 'توضیح سئو' : 'SEO description'}<textarea className={styles.textarea} value={seoDescription} onChange={(event) => field(localized ? 'seoDescriptionFa' : 'seoDescriptionEn', event.target.value)}/><small className={seoDescription.length < 120 || seoDescription.length > 165 ? styles.warning : styles.counter}>{seoDescription.length}/120–165</small></label>
      <div className={styles.pathGuide}><strong>{localized ? 'مسیر پیشنهادی و canonical پیش‌فرض' : 'Recommended path and default canonical'}</strong><code>https://elecio.co/{active}/blog/{state.slug || 'article-slug'}</code><small>{localized ? 'canonical سفارشی را فقط وقتی محتوا در نشانی اصلی دیگری منتشر شده وارد کنید.' : 'Only override the canonical when another URL is truly authoritative.'}</small></div>
      <details className={styles.advanced}><summary>{localized ? 'Canonical سفارشی (به‌ندرت لازم است)' : 'Custom canonical (rarely needed)'}</summary><label className={styles.label}>Canonical URL<input className={styles.input} dir="ltr" value={localized ? state.canonicalUrlFa : state.canonicalUrlEn} onChange={(event) => field(localized ? 'canonicalUrlFa' : 'canonicalUrlEn', event.target.value)} placeholder={`/${active}/blog/${state.slug || 'article-slug'}`}/></label></details>
      <details className={styles.advanced}><summary>{localized ? 'شبکه‌های اجتماعی و تنظیمات پیشرفته' : 'Social and advanced settings'}</summary><label className={styles.label}>Open Graph title<input className={styles.input} value={localized ? state.ogTitleFa : state.ogTitleEn} onChange={(event) => field(localized ? 'ogTitleFa' : 'ogTitleEn', event.target.value)} placeholder={previewTitle}/></label><label className={styles.label}>Open Graph description<textarea className={styles.textarea} value={localized ? state.ogDescriptionFa : state.ogDescriptionEn} onChange={(event) => field(localized ? 'ogDescriptionFa' : 'ogDescriptionEn', event.target.value)} placeholder={previewDescription}/></label></details>
      <div className={styles.serpPreview} dir={localized ? 'rtl' : 'ltr'}><small>elecio.co › {active} › blog › {state.slug || 'article-slug'}</small><strong>{previewTitle}</strong><p>{previewDescription}</p></div>
      <div className={styles.imagePlan} dir={localized ? 'rtl' : 'ltr'}><strong>{localized ? 'برنامه تصویر مقاله' : 'Article image plan'}</strong><span>{localized ? `۱ تصویر شاخص + حدود ${suggestedBodyImages.toLocaleString('fa-IR')} تصویر مفید داخل متن` : `1 cover + about ${suggestedBodyImages} useful body image(s)`}</span><small>{localized ? `فعلی: ${stats.images.toLocaleString('fa-IR')} تصویر؛ ${stats.missingAlt.toLocaleString('fa-IR')} بدون alt. این عدد راهنمای تحریریه است، نه قانون رتبه‌بندی گوگل.` : `Current: ${stats.images}; ${stats.missingAlt} missing alt. This is an editorial heuristic, not a Google rule.`}</small></div>
      <div className={styles.seoChecklist} dir={localized ? 'rtl' : 'ltr'}><strong>{localized ? 'آمادگی سئو' : 'SEO readiness'} · {seoChecks.filter((item) => item.ok).length}/{seoChecks.length}</strong>{seoChecks.map((item) => <span className={item.ok ? styles.checkOk : styles.checkMissing} key={item.label}>{item.ok ? '✓' : '○'} {item.label}</span>)}</div>
    </section>
  </div><aside className={styles.side}><section className={styles.panel}>
    <label className={styles.label}>{en ? 'Translation' : 'ترجمه'}<select className={styles.select} value={state.translationStatus} onChange={(event) => field('translationStatus', event.target.value)}><option value="complete">Complete</option><option value="fa_only">Persian only</option><option value="en_only">English only</option></select></label>
    <label className={styles.label}>{en ? 'Category' : 'دسته'}<select className={styles.select} value={state.categoryId ?? ''} onChange={(event) => field('categoryId', Number(event.target.value) || null)}><option value="">—</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
    <label className={styles.label}>{en ? 'Manual schedule' : 'زمان‌بندی دستی'}<input className={styles.input} type="datetime-local" value={state.scheduledFor} onChange={(event) => field('scheduledFor', event.target.value)}/><small>{en ? 'For one-off scheduling. Use the active queue on the content page for recurring cadence.' : 'برای انتشار موردی؛ برای فاصله ۲/۳/۴ روزه از صف فعال صفحه محتوا استفاده کنید.'}</small></label>
    <label className={styles.label}>{en ? 'Schema type' : 'نوع اسکیما'}<select className={styles.select} value={state.schemaType} onChange={(event) => field('schemaType', event.target.value)}><option value="Article">Article</option><option value="BlogPosting">BlogPosting</option><option value="TechArticle">TechArticle</option></select></label>
    <label><input type="checkbox" checked={state.robotsIndex} onChange={(event) => field('robotsIndex', event.target.checked)}/> {en ? 'Allow search engines to index this article' : 'اجازه ایندکس این مقاله به موتورهای جست‌وجو'}</label>
    <fieldset><legend>{en ? 'Tags' : 'برچسب‌ها'}</legend>{tags.map((tag) => <label key={tag.id}><input type="checkbox" checked={state.tagIds.includes(tag.id)} onChange={(event) => field('tagIds', event.target.checked ? [...state.tagIds, tag.id] : state.tagIds.filter((id) => id !== tag.id))}/>{tag.name}</label>)}</fieldset>
  </section>
  <form className={styles.panel} onSubmit={uploadCover}><h3>{en ? 'Cover image' : 'تصویر شاخص'}</h3><p className={styles.status}>{en ? 'Use an original, relevant 3:2 image. It is converted to WebP and saved with the article slug.' : 'تصویر جنرال، مرتبط و بدون نوشته انتخاب کنید؛ خروجی نهایی WebP با ابعاد ۶۰۰×۴۰۰ (نسبت ۳:۲) و نام مبتنی بر slug مقاله باشد.'}</p><input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" required/><input className={styles.input} name="altFa" value={state.coverAltFa} onChange={(event) => field('coverAltFa', event.target.value)} placeholder="توصیف دقیق فارسی تصویر" required={state.translationStatus !== 'en_only'}/><input className={styles.input} name="altEn" value={state.coverAltEn} onChange={(event) => field('coverAltEn', event.target.value)} placeholder="English image alt text"/><button className={styles.button} disabled={!state.slug}>{en ? 'Upload and optimize' : 'بارگذاری و بهینه‌سازی'}</button>{!state.slug && <small className={styles.warning}>{en ? 'Set the slug before uploading.' : 'پیش از بارگذاری، slug را وارد کنید.'}</small>}{state.coverImagePath && <><p dir="ltr">{state.coverImagePath}</p><input className={styles.input} value={state.coverCaptionFa} onChange={(event) => field('coverCaptionFa', event.target.value)} placeholder="کپشن فارسی تصویر"/><input className={styles.input} value={state.coverCaptionEn} onChange={(event) => field('coverCaptionEn', event.target.value)} placeholder="English image caption"/></>}</form>
  <div className={styles.actions}><button className={`${styles.button} ${styles.secondary}`} disabled={busy} onClick={() => save('draft')}>{en ? 'Save draft' : 'ذخیره پیش‌نویس'}</button><button className={styles.button} disabled={busy} onClick={() => save('published')}>{en ? 'Publish' : 'انتشار'}</button><button className={`${styles.button} ${styles.secondary}`} onClick={preview}>{en ? 'Preview' : 'پیش‌نمایش'}</button></div>{message && <p className={styles.status} role="status">{message}</p>}
  </aside></div>;
}
