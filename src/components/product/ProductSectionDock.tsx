'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './ProductSectionDock.module.css';

export function ProductSectionDock({ items, ariaLabel = 'Page sections' }: { items: Array<{ id: string; label: string }>; ariaLabel?: string }) {
  const [active, setActive] = useState(0);
  const dockRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    const update = () => {
      const focusLine = window.innerHeight * 0.42;
      let next = 0;
      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= focusLine) next = index;
      });
      setActive(next);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);

  useLayoutEffect(() => {
    const dock = dockRef.current;
    const button = buttonRefs.current[active];
    if (!dock || !button) return;
    const measure = () => {
      setIndicator({ x: button.offsetLeft, width: button.offsetWidth });
      const desiredLeft = button.offsetLeft - (dock.clientWidth - button.offsetWidth) / 2;
      dock.scrollTo({ left: desiredLeft, behavior: 'smooth' });
    };
    measure();
    const frame = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, [active]);

  return (
    <nav ref={dockRef} className={styles.dock} aria-label={ariaLabel} dir="ltr">
      <span
        className={styles.liquid}
        style={{ width: indicator.width, transform: `translate3d(${indicator.x}px, 0, 0)` }}
        aria-hidden="true"
      />
      {items.map((item, index) => (
        <a
          key={item.id}
          ref={(element) => { buttonRefs.current[index] = element; }}
          href={`#${item.id}`}
          className={index === active ? styles.active : ''}
          aria-current={index === active ? 'location' : undefined}
          onClick={() => setActive(index)}
        >
          <span dir="auto">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
