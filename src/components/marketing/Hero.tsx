'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from 'antd';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { HERO_SLIDES, HERO_SLIDE_IMAGES, HERO_SLIDE_IMAGES_LIGHT } from '@/lib/site-constants';
import { useThemeMode } from '@/lib/theme-context';
import type { AppLocale } from '@/i18n/routing';
import styles from './Hero.module.css';

const ROTATE_MS = 7000;
const HERO_VIDEOS: Partial<Record<number, string>> = {
  0: '/videos/elecio-background-1.mp4',
  1: '/videos/elecio-background-2.mp4',
  4: '/videos/elecio-background-1.mp4',
};

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
 * Auto-advances every 7s, pauses on hover/focus, fully manually navigable via the dots.
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
  const images = mode === 'light' ? HERO_SLIDE_IMAGES_LIGHT : HERO_SLIDE_IMAGES[locale];
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [onscreen, setOnscreen] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [readyVideo, setReadyVideo] = useState('');
  // Light mode has fewer background photos (3) than there are text slides (5, driven by
  // HERO_SLIDES.length) — wrap the image index independently so it still cycles cleanly instead
  // of running out of bounds.
  const activeImage = active % images.length;
  const [paused, setPaused] = useState(false);

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
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduceMotion || !onscreen) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % HERO_SLIDES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [onscreen, paused]);

  const goTo = useCallback((i: number) => setActive(i), []);
  const slide = slides[active];
  const target = HERO_SLIDES[active];
  const videoSrc = HERO_VIDEOS[active];
  const videoKey = videoSrc ? `${active}-${videoSrc}` : '';
  const videoReady = readyVideo === videoKey;

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.media}>
        <Image
          key={images[activeImage]}
          src={images[activeImage]}
          alt=""
          fill
          priority={active === 0}
          sizes="100vw"
          className={`${styles.slideImg} ${styles.slideImgActive} ${videoReady ? styles.posterBehindVideo : ''}`}
        />
        {videoSrc && onscreen && !reduceMotion && (
          <video
            key={`${active}-${videoSrc}`}
            className={`${styles.slideVideo} ${videoReady ? styles.slideVideoActive : ''}`}
            autoPlay
            muted
            loop
            playsInline
            preload={active === 0 ? 'auto' : 'metadata'}
            poster={images[activeImage]}
            aria-hidden="true"
            onCanPlay={() => setReadyVideo(videoKey)}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
        <div className={styles.scrim} />

        <div className={styles.dots} role="tablist" aria-label="Hero slides">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              aria-label={`Slide ${i + 1}`}
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>

      <div className={styles.content} key={active}>
        <p className={styles.kicker}>{slide.kicker}</p>
        <h1 className={styles.headline}>
          {slide.headlineStart} <span className={styles.highlight}>{slide.headlineHighlight}</span>
        </h1>
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
    </section>
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
