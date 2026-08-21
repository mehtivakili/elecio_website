'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import styles from './AboutProduct.module.css';

const LazyAboutProduct = dynamic(
  () => import('./AboutProduct').then((module) => module.AboutProduct),
  {
    ssr: false,
    loading: () => <div className={styles.wrap} aria-hidden="true" />,
  },
);

export function AboutProduct() {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    if (!placeholder) return;

    let nearViewport = false;
    let userEngaged = false;
    const maybeLoad = () => {
      if (!nearViewport || !userEngaged) return;
      setNearViewport(true);
      observer.disconnect();
      removeEngagementListeners();
    };
    const onEngagement = () => {
      userEngaged = true;
      maybeLoad();
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
        maybeLoad();
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(placeholder);
    window.addEventListener('pointerdown', onEngagement, { passive: true });
    window.addEventListener('touchstart', onEngagement, { passive: true });
    window.addEventListener('wheel', onEngagement, { passive: true });
    window.addEventListener('keydown', onEngagement);
    return () => {
      observer.disconnect();
      removeEngagementListeners();
    };
  }, []);

  if (nearViewport) return <LazyAboutProduct />;
  return <div ref={placeholderRef} className={styles.wrap} aria-hidden="true" />;
}
