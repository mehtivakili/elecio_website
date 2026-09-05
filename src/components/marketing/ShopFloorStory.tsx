'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import styles from './ShopFloorStory.module.css';

const STORY_STAGE_COUNT = 7;
const STAGE_LOCK_MS = 900;
const SCROLL_CUE_DELAY_MS = 5000;
const SCROLL_CUE_VISIBLE_MS = 3000;

export function ShopFloorStory() {
  const locale = useLocale();
  const hostRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [started, setStarted] = useState(false);
  const [scrollCueVisible, setScrollCueVisible] = useState(false);

  useEffect(() => {
    if (!started) return;

    let frame = 0;
    const sync = () => {
      frame = 0;
      const host = hostRef.current;
      const target = frameRef.current?.contentWindow;
      if (!host || !target) return;

      const rect = host.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / range));
      target.postMessage(
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
  }, [started]);

  useEffect(() => {
    if (!started) return;

    let reminderTimer = 0;
    let hideTimer = 0;
    let disposed = false;

    const showReminder = () => {
      if (disposed) return;
      setScrollCueVisible(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        if (!disposed) setScrollCueVisible(false);
      }, SCROLL_CUE_VISIBLE_MS);
      reminderTimer = window.setTimeout(showReminder, SCROLL_CUE_DELAY_MS);
    };

    const armReminder = () => {
      window.clearTimeout(reminderTimer);
      window.clearTimeout(hideTimer);
      setScrollCueVisible(false);
      reminderTimer = window.setTimeout(showReminder, SCROLL_CUE_DELAY_MS);
    };

    armReminder();
    window.addEventListener('scroll', armReminder, { passive: true });
    return () => {
      disposed = true;
      window.clearTimeout(reminderTimer);
      window.clearTimeout(hideTimer);
      window.removeEventListener('scroll', armReminder);
    };
  }, [started]);

  useEffect(() => {
    if (!started || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
  }, [started]);

  const en = locale === 'en';
  const startStory = () => {
    setStarted(true);
    requestAnimationFrame(() => {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth';
      hostRef.current?.scrollIntoView({ behavior, block: 'start' });
    });
  };

  return (
    <section
      ref={hostRef}
      id="shop-floor-story"
      className={`${styles.section} ${started ? styles.active : styles.gated}`}
      aria-label={en ? 'Interactive Smart DNC shop-floor story' : 'داستان سه‌بعدی Smart DNC در کارگاه'}
    >
      {started ? (
        <>
          <div
            className={`${styles.scrollCue} ${scrollCueVisible ? styles.scrollCueVisible : ''}`}
            role="note"
          >
            <span className={styles.scrollCueText}>
              {en ? 'Scroll down to continue the story' : 'برای ادامه داستان به پایین اسکرول کنید'}
            </span>
            <span className={styles.scrollChevrons} aria-hidden="true">
              <span />
              <span />
            </span>
          </div>
          <iframe
            ref={frameRef}
            className={styles.frame}
            src={`/3d/story/index.html?lang=${locale}&v=20260829-mobile-layout`}
            title={en ? 'Interactive Smart DNC shop-floor story' : 'داستان تعاملی سه‌بعدی Smart DNC'}
            loading="eager"
            onLoad={() => window.dispatchEvent(new Event('scroll'))}
          />
        </>
      ) : (
        <div className={styles.gate}>
          <Image
            className={styles.poster}
            src="/images/tech-pair.webp"
            alt=""
            fill
            sizes="100vw"
          />
          <div className={styles.scrim} />
          <div className={styles.ambientGlow} aria-hidden="true" />
          <div className={styles.particles} aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
          </div>
          <div className={styles.orbit} aria-hidden="true">
            <span />
          </div>
          <div className={styles.orbitAlt} aria-hidden="true">
            <span />
          </div>

          <div className={styles.gateContent}>
            <p className={styles.eyebrow}>
              {en ? 'ELECIO INTERACTIVE EXPERIENCE' : 'تجربه تعاملی ELECIO'}
            </p>
            <h2 className={styles.title}>
              {en ? 'See ElecIO at work on the shop floor' : 'عملکرد ElecIO را در خط تولید ببینید'}
            </h2>
            <p className={styles.description}>
              {en
                ? 'Explore how CNC machines connect, programs move, and production status becomes visible in an interactive 3D environment.'
                : 'اتصال ماشین‌های CNC، انتقال برنامه و نمایش وضعیت تولید را در یک محیط سه‌بعدی تعاملی تجربه کنید.'}
            </p>
            <button className={styles.startButton} type="button" onClick={startStory}>
              <span className={styles.playDisc} aria-hidden="true">
                <span className={styles.playIcon} />
              </span>
              <span>{en ? 'View interactive demo' : 'مشاهده دموی تعاملی'}</span>
              <span className={styles.buttonBadge} aria-hidden="true">3D</span>
            </button>
            <p className={styles.loadNote}>
              <span aria-hidden="true" />
              {en
                ? 'The 3D experience loads after you click to keep this page fast.'
                : 'برای حفظ سرعت صفحه، نمایش سه‌بعدی پس از کلیک بارگذاری می‌شود.'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
