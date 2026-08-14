'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import styles from './ShopFloorStory.module.css';

const STORY_STAGE_COUNT = 7;
const STAGE_LOCK_MS = 900;
const STORY_PRELOAD_FALLBACK_MS = 12000;

export function ShopFloorStory() {
  const locale = useLocale();
  const hostRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let started = false;
    let mountTimer = 0;
    const beginLoading = () => {
      if (started) return;
      started = true;
      // Let the browser finish the video readiness callbacks and start the 3D work just after.
      mountTimer = window.setTimeout(() => setMounted(true), 350);
    };

    if (document.documentElement.dataset.elecioHeroVideosReady === 'true') beginLoading();
    window.addEventListener('elecio-hero-videos-ready', beginLoading, { once: true });

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        beginLoading();
        observer.disconnect();
      }
    }, { rootMargin: '1400px 0px' });
    observer.observe(host);
    const fallback = window.setTimeout(beginLoading, STORY_PRELOAD_FALLBACK_MS);
    return () => {
      observer.disconnect();
      window.removeEventListener('elecio-hero-videos-ready', beginLoading);
      window.clearTimeout(fallback);
      window.clearTimeout(mountTimer);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let frame = 0;
    const sync = () => {
      frame = 0;
      const host = hostRef.current;
      const target = frameRef.current?.contentWindow;
      if (!host || !target) return;
      const rect = host.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / range));
      target.postMessage({ type: 'elecio-story-progress', progress }, window.location.origin);
    };
    const requestSync = () => { if (!frame) frame = requestAnimationFrame(sync); };
    sync();
    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const host = hostRef.current;
    if (!host) return;

    let locked = false;
    let unlockTimer = 0;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) return;

      const rect = host.getBoundingClientRect();
      const pinned = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
      if (!pinned) return;
      if (locked) {
        event.preventDefault();
        return;
      }

      const sectionTop = window.scrollY + rect.top;
      const range = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.scrollY - sectionTop) / range));
      const currentStage = Math.round(progress * (STORY_STAGE_COUNT - 1));
      const direction = event.deltaY > 0 ? 1 : -1;
      const nextStage = currentStage + direction;

      if (nextStage < 0 || nextStage >= STORY_STAGE_COUNT) return;
      event.preventDefault();

      locked = true;
      const target = sectionTop + (nextStage / (STORY_STAGE_COUNT - 1)) * range;
      window.scrollTo({ top: target, behavior: 'smooth' });
      // Stage index 2 is the long-cable-to-Elecio transformation. Hold that frame long enough
      // for the time-based 3D morph to remain visible before another wheel event can skip it.
      const lockDuration = nextStage === 2 ? 2300 : STAGE_LOCK_MS;
      unlockTimer = window.setTimeout(() => { locked = false; }, lockDuration);
    };

    host.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.clearTimeout(unlockTimer);
      host.removeEventListener('wheel', onWheel);
    };
  }, [mounted]);

  const en = locale === 'en';
  return (
    <section ref={hostRef} id="shop-floor-story" className={styles.section} aria-label={en ? 'Smart DNC shop-floor story' : 'داستان سه‌بعدی Smart DNC در کارگاه'}>
      {mounted ? <iframe ref={frameRef} className={styles.frame} src={`/3d/story/index.html?lang=${locale}&v=20260814-fonts`} title={en ? 'Interactive Smart DNC shop-floor story' : 'داستان تعاملی سه‌بعدی Smart DNC'} loading="eager" onLoad={() => window.dispatchEvent(new Event('scroll'))} /> : <div className={styles.placeholder}><strong>{en ? 'Loading the Elecio story…' : 'در حال بارگذاری داستان الکسیو…'}</strong></div>}
    </section>
  );
}
