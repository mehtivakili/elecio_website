'use client';

import { useEffect, useRef, useState } from 'react';
import { SceneCanvas } from '@/components/marketing/hero3d/SceneCanvas';
import { useThemeMode } from '@/lib/theme-context';
import fanucLogo from '../../../media/fanuc.svg';
import heidenhainLogo from '../../../media/heidenhain.svg';
import mitsubishiLogo from '../../../media/mitsubishi.svg';
import siemensLogo from '../../../media/siemens.svg';
import type { CompatibilityOrbitProps } from './CompatibilityOrbit';
import styles from './CompatibilityOrbit.module.css';

const CONTROLLERS = [
  { label: 'FANUC', image: fanucLogo.src },
  { label: 'SIEMENS', image: siemensLogo.src },
  { label: 'HEIDENHAIN', image: heidenhainLogo.src },
  { label: 'MITSUBISHI', image: mitsubishiLogo.src },
  { label: 'HAAS' },
  { label: 'CHARMILLES' },
];

export function CompatibilityOrbitClient({ eyebrow, title, body, caveat, protocols }: CompatibilityOrbitProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const { mode } = useThemeMode();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    let frame = 0;
    const measure = () => {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, -rect.top / distance)));
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.orbitSection} aria-labelledby="compatibility-orbit-title">
      <div className={styles.sticky}>
        <div className={styles.copy}>
          <p>{eyebrow}</p>
          <h2 id="compatibility-orbit-title">{title}</h2>
          <span>{body}</span>
        </div>

        <div className={styles.scene} aria-label="Smart DNC with compatible CNC controllers orbiting around it">
          <SceneCanvas
            spinProgress={progress * 0.08}
            orbitProgress={progress}
            orbitBadges={CONTROLLERS}
            view="compatibility"
            finish={mode === 'dark' ? 'black' : 'white'}
            className={styles.canvas}
          />
        </div>

        <div className={styles.footer}>
          <div className={styles.protocols}>
            {protocols.map((protocol) => <span key={protocol}>{protocol}</span>)}
          </div>
          <p>{caveat}</p>
        </div>
      </div>
    </section>
  );
}
