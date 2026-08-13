'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import styles from './ShopFloorStory.module.css';

export function ShopFloorStory() {
  const locale = useLocale();
  const hostRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMounted(true);
        observer.disconnect();
      }
    }, { rootMargin: '500px 0px' });
    observer.observe(host);
    return () => observer.disconnect();
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

  const en = locale === 'en';
  return (
    <section ref={hostRef} id="shop-floor-story" className={styles.section} aria-label={en ? 'Smart DNC shop-floor story' : 'داستان سه‌بعدی Smart DNC در کارگاه'}>
      {mounted ? <iframe ref={frameRef} className={styles.frame} src="/3d/story/index.html" title={en ? 'Interactive Smart DNC shop-floor story' : 'داستان تعاملی سه‌بعدی Smart DNC'} loading="lazy" onLoad={() => window.dispatchEvent(new Event('scroll'))} /> : <div className={styles.placeholder}><span>ELECIO · SMART DNC</span><strong>{en ? 'Preparing the shop-floor story…' : 'در حال آماده‌سازی داستان کارگاه…'}</strong></div>}
    </section>
  );
}
