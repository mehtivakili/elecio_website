'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createElecioScene, type OrbitBadge, type SceneHandle, type ViewKey } from './elecioSceneV6';

export function SceneCanvas({
  spinProgress,
  autoRotate = false,
  finish = 'black',
  orbitProgress = 0,
  orbitBadges,
  view,
  className,
}: {
  spinProgress: number;
  autoRotate?: boolean;
  finish?: 'black' | 'white';
  orbitProgress?: number;
  orbitBadges?: OrbitBadge[];
  view?: ViewKey;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<SceneHandle | null>(null);
  const visibleRef = useRef(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [canRender3d, setCanRender3d] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const constrained = (nav.deviceMemory ?? 8) <= 4 || navigator.hardwareConcurrency <= 4;
    let webgl = false;
    try {
      const probe = document.createElement('canvas');
      webgl = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
    } catch {
      webgl = false;
    }
    queueMicrotask(() => setCanRender3d(webgl && !reducedMotion && !constrained));
  }, []);

  // The scene (real-time render loop, shadow maps, PMREM env map) is genuinely expensive —
  // don't create it (or start its rAF loop) until the section is actually about to be visible.
  // Also just correct behavior on its own merits, not merely a workaround for anything.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setNearViewport(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!nearViewport || !canRender3d || !canvasRef.current || !containerRef.current) return;
    const handle = createElecioScene(canvasRef.current, containerRef.current, finish, { orbitBadges, view });
    handleRef.current = handle;
    handle.setSpinProgress(spinProgress);
    handle.setOrbitProgress(orbitProgress);
    handle.setAutoRotate(autoRotate);
    handle.setActive(visibleRef.current && document.visibilityState === 'visible');

    const ro = new ResizeObserver(() => handle.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      handle.destroy();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- created once nearViewport flips true; spinProgress/autoRotate/finish pushed imperatively below
  }, [nearViewport, canRender3d, orbitBadges, view]);

  // Initialization and rendering visibility are deliberately separate: build shortly before the
  // section arrives, but render only while it is actually onscreen and the tab is visible.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const syncActive = () => {
      handleRef.current?.setActive(visibleRef.current && document.visibilityState === 'visible');
    };
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      syncActive();
    });
    io.observe(el);
    document.addEventListener('visibilitychange', syncActive);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', syncActive);
    };
  }, []);

  useEffect(() => {
    handleRef.current?.setSpinProgress(spinProgress);
  }, [spinProgress]);

  useEffect(() => {
    handleRef.current?.setOrbitProgress(orbitProgress);
  }, [orbitProgress]);

  useEffect(() => {
    handleRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  useEffect(() => {
    handleRef.current?.setFinish(finish);
  }, [finish]);

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }}>
      {!canRender3d && (
        <Image
          src="/images/tech-pair.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          style={{ objectFit: 'contain' }}
        />
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: '100%', height: '100%', display: canRender3d ? 'block' : 'none' }}
      />
    </div>
  );
}
