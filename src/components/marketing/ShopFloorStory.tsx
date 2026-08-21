'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import styles from './ShopFloorStory.module.css';
import { SHOP_FLOOR_STORY_COPY, type StoryLocale } from './shop-floor-story-copy';

const STORY_STAGE_COUNT = 7;
const STAGE_LOCK_MS = 900;

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

export function ShopFloorStory() {
  const requestedLocale = useLocale();
  const locale: StoryLocale = requestedLocale === 'en' ? 'en' : 'fa';
  const copy = SHOP_FLOOR_STORY_COPY[locale];
  const hostRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  const [requiresOptIn, setRequiresOptIn] = useState(true);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const navigatorWithHints = navigator as NavigatorWithHints;
    const constrained =
      window.matchMedia('(max-width: 900px)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      navigatorWithHints.connection?.saveData === true ||
      (navigatorWithHints.deviceMemory !== undefined && navigatorWithHints.deviceMemory <= 4);

    setRequiresOptIn(constrained);
    if (constrained) return;

    let nearViewport = false;
    let userEngaged = false;
    const maybeMount = () => {
      if (!nearViewport || !userEngaged) return;
      setMounted(true);
      observer.disconnect();
      removeEngagementListeners();
    };
    const onEngagement = () => {
      userEngaged = true;
      maybeMount();
    };
    const removeEngagementListeners = () => {
      window.removeEventListener('pointerdown', onEngagement);
      window.removeEventListener('touchstart', onEngagement);
      window.removeEventListener('wheel', onEngagement);
      window.removeEventListener('keydown', onEngagement);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        nearViewport = entry.isIntersecting;
        maybeMount();
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(host);
    window.addEventListener('pointerdown', onEngagement, { passive: true });
    window.addEventListener('touchstart', onEngagement, { passive: true });
    window.addEventListener('wheel', onEngagement, { passive: true });
    window.addEventListener('keydown', onEngagement);
    return () => {
      observer.disconnect();
      removeEngagementListeners();
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const host = hostRef.current;
      if (!host) return;

      const rect = host.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / range));
      setActiveStage(Math.round(progress * (STORY_STAGE_COUNT - 1)));
      frameRef.current?.contentWindow?.postMessage(
        { type: 'elecio-story-progress', progress },
        window.location.origin,
      );
    };
    const requestSync = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

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
    if (!mounted) return;
    const host = hostRef.current;
    if (!host) return;

    let intersecting = false;
    const sendVisibility = (active: boolean) => {
      frameRef.current?.contentWindow?.postMessage(
        { type: 'elecio-story-active', active },
        window.location.origin,
      );
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        sendVisibility(intersecting && !document.hidden);
      },
      { rootMargin: '100px 0px' },
    );
    const onVisibilityChange = () => sendVisibility(intersecting && !document.hidden);
    observer.observe(host);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
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
      const lockDuration = nextStage === 2 ? 2300 : STAGE_LOCK_MS;
      unlockTimer = window.setTimeout(() => {
        locked = false;
      }, lockDuration);
    };

    host.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.clearTimeout(unlockTimer);
      host.removeEventListener('wheel', onWheel);
    };
  }, [mounted]);

  const en = locale === 'en';
  return (
    <section
      ref={hostRef}
      id="shop-floor-story"
      className={styles.section}
      aria-label={en ? 'Elecio product journey' : 'داستان سه‌بعدی مسیر محصول السیو'}
    >
      <div className={styles.visual}>
        <Image
          className={styles.poster}
          src="/images/tech-pair.webp"
          alt=""
          fill
          sizes="100vw"
        />
        {mounted ? (
          <iframe
            ref={frameRef}
            className={styles.frame}
            src={`/3d/story/index.html?lang=${locale}&embedded=1&v=20260821-performance`}
            title={en ? 'Interactive Elecio product journey' : 'داستان تعاملی سه‌بعدی مسیر محصول السیو'}
            loading="lazy"
            onLoad={() => window.dispatchEvent(new Event('scroll'))}
          />
        ) : null}
        {!mounted && requiresOptIn ? (
          <button className={styles.loadButton} type="button" onClick={() => setMounted(true)}>
            {en ? 'Load interactive 3D' : 'نمایش تجربه سه‌بعدی'}
          </button>
        ) : null}
      </div>

      <ol className={styles.copyLayer}>
        {copy.map((stage, index) => (
          <li
            className={styles.copy}
            data-active={index === activeStage}
            key={stage.title}
            aria-current={index === activeStage ? 'step' : undefined}
          >
            <span>{stage.eyebrow}</span>
            <h2>{stage.title}</h2>
            <p>{stage.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
