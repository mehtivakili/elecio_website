'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CloseOutlined,
  CompassOutlined,
  HeartFilled,
  HeartOutlined,
  HomeOutlined,
  LeftOutlined,
  MenuOutlined,
  MessageOutlined,
  MoreOutlined,
  PlusSquareOutlined,
  RightOutlined,
  SearchOutlined,
  SendOutlined,
  TableOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styles from './InstagramStudio.module.css';

export type InstagramMedia = { id: number; path: string; alt: string; sortOrder: number };
export type InstagramPost = {
  id: number;
  caption: string;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  scheduledFor: string | null;
  publishedAt: string | null;
  createdAt: string;
  media: InstagramMedia[];
};
export type InstagramProfile = {
  username: string;
  displayName: string;
  bio: string;
  websiteUrl: string | null;
  avatarPath: string;
  followers: number;
  following: number;
};

type Copy = {
  newPost: string; schedule: string; clearSchedule: string; saveSchedule: string; publishTime: string;
  draft: string; scheduled: string; uploadTitle: string; uploadHint: string; caption: string;
  createDraft: string; creating: string; noPosts: string; close: string; backAdmin: string;
};

function localDateTime(value: string | null) {
  const date = value ? new Date(value) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString();
  return local.slice(0, 16);
}

export function InstagramStudio({ locale, profile, initialPosts }: { locale: string; profile: InstagramProfile; initialPosts: InstagramPost[] }) {
  const en = locale === 'en';
  const copy: Copy = en ? {
    newPost: 'Create', schedule: 'Schedule', clearSchedule: 'Clear schedule', saveSchedule: 'Save schedule', publishTime: 'Publish time',
    draft: 'Draft', scheduled: 'Scheduled', uploadTitle: 'Create new carousel', uploadHint: 'Choose up to 10 images. They are saved locally now and can be sent through Instagram API later.',
    caption: 'Caption', createDraft: 'Save post', creating: 'Saving…', noPosts: 'No posts yet', close: 'Close', backAdmin: 'Back to admin',
  } : {
    newPost: 'ایجاد پست', schedule: 'زمان انتشار', clearSchedule: 'حذف زمان‌بندی', saveSchedule: 'ذخیره زمان', publishTime: 'زمان انتشار',
    draft: 'پیش‌نویس', scheduled: 'زمان‌بندی‌شده', uploadTitle: 'ساخت کاروسل جدید', uploadHint: 'حداکثر ۱۰ تصویر انتخاب کنید؛ فعلاً داخل سایت ذخیره می‌شوند و بعداً می‌توان API اینستاگرام را به همین مسیر وصل کرد.',
    caption: 'کپشن', createDraft: 'ذخیره پست', creating: 'در حال ذخیره…', noPosts: 'هنوز پستی وجود ندارد', close: 'بستن', backAdmin: 'بازگشت به ادمین',
  };
  const [posts, setPosts] = useState(initialPosts);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const [liked, setLiked] = useState(false);
  const [schedulePostId, setSchedulePostId] = useState<number | null>(null);
  const [scheduleValue, setScheduleValue] = useState(localDateTime(null));
  const [composerOpen, setComposerOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [composerSchedule, setComposerSchedule] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const touchStart = useRef<number | null>(null);
  const selectedPost = posts.find((post) => post.id === selectedId) ?? null;
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function openPost(postId: number) {
    setSlide(0);
    setLiked(false);
    setSelectedId(postId);
  }

  function openSchedule(post: InstagramPost) {
    setSchedulePostId(post.id);
    setScheduleValue(localDateTime(post.scheduledFor));
    setMessage('');
  }

  async function saveSchedule(clear = false) {
    if (!schedulePostId) return;
    setBusy(true); setMessage('');
    const scheduledFor = clear ? null : new Date(scheduleValue).toISOString();
    const response = await fetch('/api/admin/social/instagram', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: schedulePostId, scheduledFor }),
    });
    const result = await response.json();
    if (response.ok) {
      setPosts((current) => current.map((post) => post.id === schedulePostId ? { ...post, status: result.status, scheduledFor: result.scheduledFor } : post));
      setSchedulePostId(null);
    } else setMessage(result.error ?? 'Update failed');
    setBusy(false);
  }

  async function createPost() {
    if (!files.length || !caption.trim()) return;
    setBusy(true); setMessage('');
    try {
      const mediaPaths: string[] = [];
      for (const [index, file] of files.entries()) {
        const form = new FormData();
        form.set('file', file); form.set('slug', `instagram-${Date.now()}-${index + 1}`); form.set('kind', 'body');
        form.set('altFa', `اسلاید ${index + 1} پست اینستاگرام Elecio`);
        const upload = await fetch('/api/admin/cms/media', { method: 'POST', body: form });
        const uploaded = await upload.json();
        if (!upload.ok) throw new Error(uploaded.error ?? 'upload_failed');
        mediaPaths.push(uploaded.path);
      }
      const scheduledFor = composerSchedule ? new Date(composerSchedule).toISOString() : null;
      const response = await fetch('/api/admin/social/instagram', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption, mediaPaths, scheduledFor }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'create_failed');
      const now = new Date().toISOString();
      setPosts((current) => [{
        id: result.id, caption: caption.trim(), status: result.status, scheduledFor: result.scheduledFor,
        publishedAt: null, createdAt: now, media: mediaPaths.map((path, index) => ({ id: -index - 1, path, alt: `Instagram slide ${index + 1}`, sortOrder: index })),
      }, ...current]);
      setFiles([]); setCaption(''); setComposerSchedule(''); setComposerOpen(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'create_failed'); }
    setBusy(false);
  }

  function moveSlide(direction: number) {
    if (!selectedPost) return;
    setSlide((current) => Math.max(0, Math.min(selectedPost.media.length - 1, current + direction)));
  }

  const navItems = [
    [<HomeOutlined key="home" />, en ? 'Home' : 'خانه'], [<SearchOutlined key="search" />, en ? 'Search' : 'جست‌وجو'],
    [<CompassOutlined key="explore" />, en ? 'Explore' : 'کاوش'], [<MessageOutlined key="message" />, en ? 'Messages' : 'پیام‌ها'],
  ] as const;

  return <div className={styles.root} data-instagram-studio>
    <aside className={styles.rail} aria-label="Instagram navigation">
      <div className={styles.instagramWord}>Instagram</div>
      <div className={styles.miniLogo}>◎</div>
      <nav>{navItems.map(([icon, label]) => <button key={label}>{icon}<span>{label}</span></button>)}
        <button onClick={() => setComposerOpen(true)}><PlusSquareOutlined /><span>{copy.newPost}</span></button>
        <button><UserOutlined /><span>{en ? 'Profile' : 'پروفایل'}</span></button>
      </nav>
      <a className={styles.adminBack} href={`/${locale}/admin`}><ArrowLeftOutlined /><span>{copy.backAdmin}</span></a>
      <button className={styles.moreNav}><MenuOutlined /><span>{en ? 'More' : 'بیشتر'}</span></button>
    </aside>

    <header className={styles.mobileTop}>
      <a href={`/${locale}/admin`} aria-label={copy.backAdmin}><ArrowLeftOutlined /></a>
      <strong>{profile.username}</strong><button onClick={() => setComposerOpen(true)} aria-label={copy.newPost}><PlusSquareOutlined /></button>
    </header>

    <main className={styles.profilePage}>
      <section className={styles.profileHeader}>
        <div className={styles.avatarRing}><Image src={profile.avatarPath} alt={profile.username} width={168} height={168} priority /></div>
        <div className={styles.profileInfo}>
          <div className={styles.profileTitle}><h1>{profile.username}</h1><button className={styles.followButton}>{en ? 'Edit profile' : 'ویرایش پروفایل'}</button><button className={styles.iconButton}><MoreOutlined /></button></div>
          <dl className={styles.stats}><div><dt>{posts.length.toLocaleString(locale)}</dt><dd>{en ? 'posts' : 'پست'}</dd></div><div><dt>{profile.followers.toLocaleString(locale)}</dt><dd>{en ? 'followers' : 'دنبال‌کننده'}</dd></div><div><dt>{profile.following.toLocaleString(locale)}</dt><dd>{en ? 'following' : 'دنبال‌شونده'}</dd></div></dl>
          <div className={styles.bio} dir="rtl"><strong>{profile.displayName}</strong>{profile.bio.split('\n').map((line) => <span key={line}>{line}</span>)}{profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noreferrer">🔗 {profile.websiteUrl.replace(/^https?:\/\//, '')}</a>}</div>
        </div>
      </section>
      <div className={styles.mobileBio} dir="rtl"><strong>{profile.displayName}</strong>{profile.bio.split('\n').map((line) => <span key={line}>{line}</span>)}{profile.websiteUrl && <a href={profile.websiteUrl}>🔗 {profile.websiteUrl.replace(/^https?:\/\//, '')}</a>}</div>
      <div className={styles.tabs}><button className={styles.activeTab}><TableOutlined /> POSTS</button><button><UserOutlined /> TAGGED</button></div>
      {posts.length ? <div className={styles.grid}>
        {posts.map((post) => <div className={styles.gridItem} key={post.id}>
          <button className={styles.gridOpen} onClick={() => openPost(post.id)} aria-label={`${profile.username}: ${post.caption}`}>
            <Image src={post.media[0].path} alt={post.media[0].alt} fill sizes="(max-width: 760px) 33vw, 310px" />
            <span className={styles.gridHover}><HeartFilled /> 76 <MessageOutlined /> 4</span>
            {post.media.length > 1 && <span className={styles.carouselMark}>▣</span>}
          </button>
          <button className={`${styles.gridSchedule} ${post.status === 'scheduled' ? styles.scheduledBadge : ''}`} onClick={() => openSchedule(post)} aria-label={copy.schedule}><CalendarOutlined /></button>
        </div>)}
      </div> : <p className={styles.empty}>{copy.noPosts}</p>}
    </main>

    <nav className={styles.mobileBottom}><button><HomeOutlined /></button><button><CompassOutlined /></button><button onClick={() => setComposerOpen(true)}><PlusSquareOutlined /></button><button><MessageOutlined /></button><button><Image src={profile.avatarPath} alt="" width={26} height={26} /></button></nav>

    {selectedPost && <div className={styles.viewerBackdrop} onMouseDown={(event) => { if (event.currentTarget === event.target) setSelectedId(null); }}>
      <button className={styles.viewerClose} onClick={() => setSelectedId(null)} aria-label={copy.close}><CloseOutlined /></button>
      <article className={styles.viewer}>
        <div className={styles.mediaPane} onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (touchStart.current === null) return; const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 45) moveSlide(delta < 0 ? 1 : -1); touchStart.current = null; }}>
          <Image src={selectedPost.media[slide].path} alt={selectedPost.media[slide].alt} fill sizes="(max-width: 760px) 100vw, 68vw" priority />
          {slide > 0 && <button className={`${styles.slideArrow} ${styles.previous}`} onClick={() => moveSlide(-1)}><LeftOutlined /></button>}
          {slide < selectedPost.media.length - 1 && <button className={`${styles.slideArrow} ${styles.next}`} onClick={() => moveSlide(1)}><RightOutlined /></button>}
          <div className={styles.dots}>{selectedPost.media.map((media, index) => <i className={index === slide ? styles.dotActive : ''} key={media.id} />)}</div>
        </div>
        <div className={styles.detailPane}>
          <header className={styles.postAuthor}><Image src={profile.avatarPath} alt="" width={38} height={38} /><strong>{profile.username}</strong><MoreOutlined /></header>
          <div className={styles.caption} dir="rtl"><Image src={profile.avatarPath} alt="" width={34} height={34} /><p><strong>{profile.username}</strong> {selectedPost.caption}</p></div>
          <div className={styles.postActions}><button onClick={() => setLiked((value) => !value)} className={liked ? styles.liked : ''}>{liked ? <HeartFilled /> : <HeartOutlined />}</button><button><MessageOutlined /></button><button><SendOutlined /></button><button className={styles.scheduleAction} onClick={() => openSchedule(selectedPost)}><CalendarOutlined /><span>{selectedPost.status === 'scheduled' ? new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(selectedPost.scheduledFor!)) : copy.schedule}</span></button></div>
          <div className={styles.likes}>{(liked ? 77 : 76).toLocaleString(locale)} {en ? 'likes' : 'پسند'}</div>
          <small className={styles.postDate}>{new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(selectedPost.createdAt))}</small>
          <div className={styles.commentBox}><span>☺</span><input placeholder={en ? 'Add a comment…' : 'نظر بنویسید…'} /><button>{en ? 'Post' : 'ارسال'}</button></div>
        </div>
      </article>
    </div>}

    {schedulePostId && <div className={styles.dialogBackdrop}>
      <section className={styles.scheduleDialog} dir={en ? 'ltr' : 'rtl'}>
        <button className={styles.dialogClose} onClick={() => setSchedulePostId(null)}><CloseOutlined /></button><CalendarOutlined className={styles.dialogIcon} />
        <h2>{copy.publishTime}</h2><input type="datetime-local" min={localDateTime(null)} value={scheduleValue} onChange={(event) => setScheduleValue(event.target.value)} />
        {message && <p className={styles.formError}>{message}</p>}
        <button className={styles.primaryAction} disabled={busy} onClick={() => saveSchedule(false)}>{copy.saveSchedule}</button>
        <button className={styles.textAction} disabled={busy} onClick={() => saveSchedule(true)}>{copy.clearSchedule}</button>
      </section>
    </div>}

    {composerOpen && <div className={styles.dialogBackdrop}>
      <section className={styles.composer} dir={en ? 'ltr' : 'rtl'}>
        <header><button onClick={() => setComposerOpen(false)}><CloseOutlined /></button><h2>{copy.uploadTitle}</h2><button className={styles.shareButton} disabled={busy || !files.length || !caption.trim()} onClick={createPost}>{busy ? copy.creating : copy.createDraft}</button></header>
        <label className={styles.dropZone}><UploadOutlined /><strong>{copy.uploadHint}</strong><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 10))} /></label>
        {previews.length > 0 && <div className={styles.uploadPreview}>{previews.map((url, index) => <div style={{ backgroundImage: `url(${url})` }} key={url}><span>{index + 1}</span></div>)}</div>}
        <label className={styles.composerField}>{copy.caption}<textarea maxLength={2200} value={caption} onChange={(event) => setCaption(event.target.value)} /><small>{caption.length.toLocaleString(locale)} / 2,200</small></label>
        <label className={styles.composerField}>{copy.publishTime}<input type="datetime-local" min={localDateTime(null)} value={composerSchedule} onChange={(event) => setComposerSchedule(event.target.value)} /></label>
        {message && <p className={styles.formError}>{message}</p>}
      </section>
    </div>}
  </div>;
}
