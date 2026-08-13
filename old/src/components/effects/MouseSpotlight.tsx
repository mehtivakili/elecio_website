'use client';

import { useEffect, useState } from 'react';

export default function MouseSpotlight() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
        background: `
          radial-gradient(
            circle 400px at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.01) 40%,
            rgba(0, 0, 0, 0.03) 60%,
            rgba(0, 0, 0, 0.05) 80%,
            rgba(0, 0, 0, 0.08) 100%
          )
        `,
        transition: 'background 0.3s ease-out',
      }}
    />
  );
}

