'use client';

import { useLayoutEffect } from 'react';
import { PERSONA_RETURN_HOME_TOP_KEY } from '@/lib/navigation-scroll';

/**
 * Persona links live well below the homepage hero, so the browser normally restores that old
 * position when Back returns to Home. Product wants that specific return journey to restart at
 * the hero instead. Repeating the reset for the first few frames wins the race with Next/browser
 * scroll restoration without changing Back behavior anywhere else on the site.
 */
export function HomeReturnScrollReset() {
  useLayoutEffect(() => {
    if (window.sessionStorage.getItem(PERSONA_RETURN_HOME_TOP_KEY) !== '1') return;

    window.sessionStorage.removeItem(PERSONA_RETURN_HOME_TOP_KEY);
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    let secondFrame = 0;
    const resetToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    resetToTop();

    const firstFrame = window.requestAnimationFrame(() => {
      resetToTop();
      secondFrame = window.requestAnimationFrame(resetToTop);
    });
    const delayedReset = window.setTimeout(resetToTop, 120);
    const releaseRestoration = window.setTimeout(() => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    }, 220);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(delayedReset);
      window.clearTimeout(releaseRestoration);
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  return null;
}
