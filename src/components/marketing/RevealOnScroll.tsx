'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './RevealOnScroll.module.css';

/**
 * Ordinary scroll-into-view fade/slide — the normal, non-hijacking kind (contrast with the
 * earlier sticky-pinned hero attempt, doc/journey.md 2026-08-07, which the user explicitly
 * rejected). Content just flows down the page; this only affects opacity/transform of each
 * section as it individually enters the viewport.
 */
export function RevealOnScroll({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.visible : ''} ${className ?? ''}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
