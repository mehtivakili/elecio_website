'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlayCircleFilled, CloseOutlined } from '@ant-design/icons';
import { RevealOnScroll } from './RevealOnScroll';
import { INSTALLATION_VIDEOS } from '@/lib/site-constants';
import styles from './VideoTestimonials.module.css';

const aparatEmbedUrl = (id: string) => `https://www.aparat.com/video/video/embed/videohash/${id}/vt/frame`;
const aparatThumbUrl = (id: string) => `https://www.aparat.com/public/public/user_data/video/video_square/${id}.jpg`;

/**
 * Real customer installation videos hosted on Aparat (src/lib/site-constants.ts,
 * INSTALLATION_VIDEOS) — not staged testimonial quotes, actual machine-side footage titled with
 * the real machine/controller/client. Rebuilt clean from old/src/components/landing/
 * CustomerSatisfactionSection.tsx, which had the same real data buried in ~300 lines of inline
 * styles with a broken multi-fallback thumbnail loader; this keeps the data, drops the mess.
 */
export function VideoTestimonials() {
  const t = useTranslations('testimonials');
  const [openId, setOpenId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!openId) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenId(null);
    };
    document.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [openId]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <RevealOnScroll className={styles.head}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
        </RevealOnScroll>

        <div className={styles.grid}>
          {INSTALLATION_VIDEOS.map((video, i) => (
            <RevealOnScroll key={video.id} delayMs={Math.min(i, 5) * 60}>
              <button className={styles.card} onClick={() => setOpenId(video.id)} aria-label={video.title}>
                {/* eslint-disable-next-line @next/next/no-img-element -- external Aparat CDN thumbnail, not a local asset next/image can optimize */}
                <img
                  src={aparatThumbUrl(video.id)}
                  alt=""
                  className={styles.thumb}
                  loading="lazy"
                  decoding="async"
                  width="480"
                  height="480"
                  onError={(e) => {
                    // Aparat's thumbnail CDN isn't always reachable (seen timing out from this
                    // dev sandbox) — fail to a plain card instead of a broken-image icon.
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className={styles.playBadge}>
                  <PlayCircleFilled />
                </span>
                <span className={styles.cardTitle}>{video.title}</span>
              </button>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {openId && (
        <div className={styles.modalBackdrop} onClick={() => setOpenId(null)}>
          <div className={styles.modalFrame} role="dialog" aria-modal="true" aria-label={t('title')} onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} className={styles.closeBtn} onClick={() => setOpenId(null)} aria-label={t('close')}>
              <CloseOutlined />
            </button>
            <iframe
              src={aparatEmbedUrl(openId)}
              className={styles.iframe}
              title={INSTALLATION_VIDEOS.find((video) => video.id === openId)?.title ?? t('title')}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}
    </section>
  );
}
