'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useThemeMode } from '@/lib/theme-context';
import { SceneCanvas } from './SceneCanvas';
import styles from './AboutProduct.module.css';

// Reveal thresholds for the feature list beside the product, spread across the same 0-1
// scroll-progress the device's spin uses — so list items surface while the device is still
// visibly turning, not all at once and not stalled at the very end.
const FEATURE_REVEAL_START = 0.1;
const FEATURE_REVEAL_END = 0.9;

/**
 * The interactive 3D device lives here — deliberately NOT in the top hero (doc/journey.md
 * 2026-08-07: "I don't want that product shown at the first top place... in the about the
 * product section put the 3d product there"). Rotation is scroll-scrubbed (not time-based) across
 * this section's own sticky range: scrolling down turns the device exactly one full revolution,
 * scrolling back reverses it — the actual mechanism Apple's product pages use (scroll position
 * drives product state), referenced directly by the user (apple.com/iphone-17). Drag-to-orbit
 * (built into elecioSceneV6.ts) still works as a bonus once the reveal settles.
 *
 * Round 8 patch (2026-08-07): the first version of this section put sparkle particles + floating
 * hardware-anatomy captions (display/keys/serial port/power switch) directly on the device. Explicit
 * correction: no sparkles on the model, and the list should describe the product's critical
 * features (what it does), not label its physical parts — and it belongs beside the product as a
 * real reveal-on-scroll list, not floating annotations pinned to 3D screen-space points.
 */
export function AboutProduct() {
  const t = useTranslations('aboutProduct');
  const tFeatures = useTranslations('aboutProductFeatures');
  const features = tFeatures.raw('items') as string[];
  const revealStep = features.length > 1 ? (FEATURE_REVEAL_END - FEATURE_REVEAL_START) / (features.length - 1) : 0;
  const { mode } = useThemeMode();
  const wrapRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    let ticking = false;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setProgress(p);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section id="about-product" ref={wrapRef} className={styles.wrap}>
      <div className={styles.sticky}>
        <div className={styles.glowA} aria-hidden="true" />
        <div className={styles.glowB} aria-hidden="true" />

        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
        </div>

        <div className={styles.split}>
          <div className={styles.stageCol}>
            <div className={styles.stage}>
              <SceneCanvas
                spinProgress={progress}
                finish={mode === 'dark' ? 'black' : 'white'}
                className={styles.canvas}
              />
            </div>
            <p className={styles.hint}>{t('hint')}</p>
          </div>

          <ul className={styles.features}>
            {features.map((label, i) => {
              const visible = progress >= FEATURE_REVEAL_START + i * revealStep;
              return (
                <li key={label} className={`${styles.featureItem} ${visible ? styles.featureItemVisible : ''}`}>
                  <span className={styles.featureLine} />
                  <span className={styles.featureLabel}>{label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
