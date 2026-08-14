'use client';

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';

type DragState = {
  pointerId: number;
  startY: number;
  startScroll: number;
  maxScroll: number;
  maxThumbTop: number;
};

export function CustomScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef<number | null>(null);

  const updateThumb = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      const thumb = thumbRef.current;
      if (!track || !thumb) return;

      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      const maxThumbTop = Math.max(track.clientHeight - thumb.offsetHeight, 0);
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      thumb.style.transform = `translate3d(0, ${Math.round(progress * maxThumbTop)}px, 0)`;
      track.dataset.visible = maxScroll > 0 ? 'true' : 'false';
    });
  }, []);

  useEffect(() => {
    updateThumb();
    window.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);

    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
      resizeObserver.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [updateThumb]);

  const scrollFromTrackPosition = useCallback((clientY: number) => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const rect = track.getBoundingClientRect();
    const maxThumbTop = Math.max(track.clientHeight - thumb.offsetHeight, 0);
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    if (maxThumbTop === 0 || maxScroll === 0) return;

    const thumbTop = Math.min(Math.max(clientY - rect.top - thumb.offsetHeight / 2, 0), maxThumbTop);
    window.scrollTo({ top: (thumbTop / maxThumbTop) * maxScroll, behavior: 'auto' });
  }, []);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const maxThumbTop = Math.max(track.clientHeight - thumb.offsetHeight, 0);
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScroll: window.scrollY,
      maxScroll: Math.max(document.documentElement.scrollHeight - window.innerHeight, 0),
      maxThumbTop,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragThumb = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || drag.maxThumbTop === 0) return;
    const nextScroll = drag.startScroll + (event.clientY - drag.startY) * (drag.maxScroll / drag.maxThumbTop);
    window.scrollTo({ top: nextScroll, behavior: 'auto' });
  };

  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={trackRef}
      className="custom-scrollbar"
      data-visible="false"
      aria-hidden="true"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) scrollFromTrackPosition(event.clientY);
      }}
    >
      <div
        ref={thumbRef}
        className="custom-scrollbar__thumb"
        onPointerDown={startDrag}
        onPointerMove={dragThumb}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      />
    </div>
  );
}
