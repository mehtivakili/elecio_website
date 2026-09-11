'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getImageProps } from 'next/image';
import { Link } from '@/i18n/navigation';
import {
  HERO_SLIDES,
  HERO_SLIDE_IMAGES,
  HERO_SLIDE_IMAGES_LIGHT,
  HERO_SLIDE_IMAGES_LIGHT_MOBILE,
  HERO_SLIDE_IMAGES_MOBILE,
} from '@/lib/site-constants';
import { useThemeMode } from '@/lib/theme-context';
import type { AppLocale } from '@/i18n/routing';
import styles from './Hero.module.css';

const PHOTO_DURATION_MS = 6000;
const HERO_VIDEOS = [
  '/videos/elecio-background-1.mp4',
  '/videos/elecio-background-2.mp4',
] as const;

type HeroMediaItem =
  | { type: 'image'; imageIndex: number; contentIndex: number }
  | { type: 'video'; videoIndex: number; imageIndex: number; contentIndex: number };

// Keep the requested four-photo/two-video rhythm independent from the five text records.
const HERO_MEDIA_SEQUENCE = [
  { type: 'image', imageIndex: 0, contentIndex: 0 },
  { type: 'video', videoIndex: 0, imageIndex: 0, contentIndex: 0 },
  { type: 'image', imageIndex: 1, contentIndex: 1 },
  { type: 'image', imageIndex: 2, contentIndex: 2 },
  { type: 'video', videoIndex: 1, imageIndex: 2, contentIndex: 3 },
  { type: 'image', imageIndex: 3, contentIndex: 4 },
] as const satisfies readonly HeroMediaItem[];

type Slide = {
  kicker: string;
  headlineStart: string;
  headlineHighlight: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

/**
 * Top-of-page hero — a real carousel (doc/journey.md 2026-08-07 round 8), not a single static
 * backdrop: 5 real product photos per locale — media/landings(1-20).png for English,
 * media/fa_landing(1-11).png for Persian (a distinct set, not a translation of the same images) —
 * one per audience, each with its own headline/CTA/link so "the topic changes with the image".
 * After the first real user interaction, photos advance after six seconds and videos advance on
 * completion. Arrow controls share that order.
 *
 * Full-bleed: the media band fills the entire viewport (`100svh`) and is pulled up behind the
 * floating header via negative margin (Hero.module.css) rather than starting below it — a plain
 * `cover` fill was previously replaced with an aspect-ratio-locked box to stop the image being
 * over-cropped, but that traded cropping for visible empty space around it, which is the wrong
 * tradeoff for a hero. With the *uncropped* source photos (not the old pre-zoomed derivative)
 * `cover` no longer over-crops the product the way the original backdrop did.
 */
export function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale() as AppLocale;
  const { mode } = useThemeMode();
  const slides = t.raw('slides') as Slide[];
  const images = locale === 'fa'
    ? HERO_SLIDE_IMAGES.fa
    : mode === 'light' ? HERO_SLIDE_IMAGES_LIGHT : HERO_SLIDE_IMAGES.en;
  const mobileImages = locale === 'fa'
    ? HERO_SLIDE_IMAGES_MOBILE.fa
    : mode === 'light' ? HERO_SLIDE_IMAGES_LIGHT_MOBILE : HERO_SLIDE_IMAGES_MOBILE.en;
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [onscreen, setOnscreen] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [readyVideos, setReadyVideos] = useState<ReadonlySet<number>>(() => new Set());
  // Light mode has three approved photos, so its fourth photo wraps cleanly to the first.
  const mediaItem = HERO_MEDIA_SEQUENCE[active];
  const posterSrc = images[mediaItem.imageIndex % images.length];
  const mobilePosterSrc = mobileImages[mediaItem.imageIndex % mobileImages.length];
  const activeVideoIndex = mediaItem.type === 'video' ? mediaItem.videoIndex : null;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setOnscreen(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const engage = () => setEngaged(true);
    const options = { passive: true, once: true } as const;
    window.addEventListener('pointerdown', engage, options);
    window.addEventListener('touchstart', engage, options);
    window.addEventListener('wheel', engage, options);
    window.addEventListener('keydown', engage, { once: true });
    return () => {
      window.removeEventListener('pointerdown', engage);
      window.removeEventListener('touchstart', engage);
      window.removeEventListener('wheel', engage);
      window.removeEventListener('keydown', engage);
    };
  }, []);

  const goPrevious = useCallback(
    () => setActive((index) => (index - 1 + HERO_MEDIA_SEQUENCE.length) % HERO_MEDIA_SEQUENCE.length),
    [],
  );
  const goNext = useCallback(
    () => setActive((index) => (index + 1) % HERO_MEDIA_SEQUENCE.length),
    [],
  );

  // Do not start the carousel or fetch video bytes until the visitor actually interacts.
  useEffect(() => {
    if (!engaged || !onscreen || reduceMotion || mediaItem.type !== 'image') return;
    const timeout = window.setTimeout(goNext, PHOTO_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [active, engaged, goNext, mediaItem.type, onscreen, reduceMotion]);

  // Video elements remain mounted with preload=none. Only the current item is allowed to fetch/play.
  useEffect(() => {
    videoRefs.current.forEach((video, videoIndex) => {
      if (!video) return;
      if (engaged && videoIndex === activeVideoIndex && onscreen && !reduceMotion) {
        video.currentTime = 0;
        void video.play().catch(() => {
          // Keep the poster visible if the browser temporarily rejects autoplay.
        });
      } else {
        video.pause();
      }
    });
  }, [active, activeVideoIndex, engaged, onscreen, reduceMotion]);

  const markVideoReady = useCallback((videoIndex: number) => {
    setReadyVideos((current) => {
      if (current.has(videoIndex)) return current;
      const next = new Set(current);
      next.add(videoIndex);
      return next;
    });
  }, []);

  const slide = slides[mediaItem.contentIndex % slides.length];
  const target = HERO_SLIDES[mediaItem.contentIndex % HERO_SLIDES.length];

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
    >
      <div className={styles.media}>
        <ResponsiveHeroImage
          key={`${posterSrc}-${mobilePosterSrc}`}
          desktopSrc={posterSrc}
          mobileSrc={mobilePosterSrc}
          fetchPriority={active === 0 ? 'high' : 'auto'}
          loading={active === 0 ? 'eager' : 'lazy'}
          className={`${styles.slideImg} ${styles.slideImgActive}`}
        />
        {HERO_VIDEOS.map((videoSrc, videoIndex) => {
          const isActive = engaged && activeVideoIndex === videoIndex && !reduceMotion;
          const videoItem = HERO_MEDIA_SEQUENCE.find(
            (item) => item.type === 'video' && item.videoIndex === videoIndex,
          );
          const videoPoster = images[(videoItem?.imageIndex ?? 0) % images.length];
          return (
            <video
              key={videoSrc}
              ref={(element) => {
                videoRefs.current[videoIndex] = element;
              }}
              className={`${styles.slideVideo} ${isActive && readyVideos.has(videoIndex) ? styles.slideVideoActive : ''}`}
              muted
              playsInline
              preload="none"
              poster={isActive ? videoPoster : undefined}
              aria-hidden="true"
              onCanPlay={() => {
                markVideoReady(videoIndex);
                if (engaged && activeVideoIndex === videoIndex && onscreen) {
                  void videoRefs.current[videoIndex]?.play();
                }
              }}
              onEnded={() => {
                if (activeVideoIndex === videoIndex) goNext();
              }}
              onError={() => {
                if (activeVideoIndex === videoIndex) goNext();
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          );
        })}
        <div className={styles.scrim} />

        <button
          type="button"
          className={`${styles.heroArrow} ${styles.heroArrowPrevious}`}
          onClick={() => {
            setEngaged(true);
            goPrevious();
          }}
          aria-label={locale === 'fa' ? 'اسلاید قبلی' : 'Previous slide'}
        >
          <LeftOutlined />
        </button>
        <button
          type="button"
          className={`${styles.heroArrow} ${styles.heroArrowNext}`}
          onClick={() => {
            setEngaged(true);
            goNext();
          }}
          aria-label={locale === 'fa' ? 'اسلاید بعدی' : 'Next slide'}
        >
          <RightOutlined />
        </button>
      </div>

      <div className={styles.content} key={active}>
        <div className={styles.heroIntro}>
          <p className={styles.kicker}>{slide.kicker}</p>
          <h1 className={styles.headline}>
            {slide.headlineStart} <span className={styles.highlight}>{slide.headlineHighlight}</span>
          </h1>
        </div>
        <div className={styles.heroDetails}>
          <p className={styles.sub}>{slide.subheadline}</p>
          <div className={styles.actions}>
            <HeroCtaButton href={target.primaryHref} external={target.primaryExternal} type="primary">
              {slide.ctaPrimary}
            </HeroCtaButton>
            <HeroCtaButton href={target.secondaryHref} external={target.secondaryExternal} className={styles.ghostBtn}>
              {slide.ctaSecondary}
            </HeroCtaButton>
          </div>
          <p className={styles.compat}>{t('compat')}</p>
        </div>
      </div>
    </section>
  );
}

function ResponsiveHeroImage({
  desktopSrc,
  mobileSrc,
  fetchPriority,
  loading,
  className,
}: {
  desktopSrc: string;
  mobileSrc: string;
  fetchPriority: 'high' | 'auto';
  loading: 'eager' | 'lazy';
  className: string;
}) {
  const common = { alt: '', sizes: '100vw', fetchPriority, loading } as const;
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: mobileSrc, width: 941, height: 1672, quality: 75 });
  const {
    props: { srcSet: desktopSrcSet, ...desktopProps },
  } = getImageProps({ ...common, src: desktopSrc, width: 1672, height: 941, quality: 75 });

  return (
    <picture>
      <source media="(orientation: portrait)" srcSet={mobileSrcSet} />
      <source media="(orientation: landscape)" srcSet={desktopSrcSet} />
      <img {...desktopProps} alt="" className={className} />
    </picture>
  );
}

function HeroCtaButton({
  href,
  external,
  type,
  className,
  children,
}: {
  href: string;
  external: boolean;
  type?: 'primary';
  className?: string;
  children: ReactNode;
}) {
  if (external) {
    return (
      <Button type={type} size="large" className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Button>
    );
  }
  if (href.startsWith('#')) {
    return (
      <Button type={type} size="large" className={className} href={href}>
        {children}
      </Button>
    );
  }
  return (
    <Link href={href}>
      <Button type={type} size="large" className={className}>
        {children}
      </Button>
    </Link>
  );
}
