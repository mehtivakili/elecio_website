'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'elecio-theme';

const ThemeContext = createContext<{ mode: ThemeMode; toggle: () => void } | null>(null);

/**
 * Dark is the real default (round 5, doc/journey.md) — this only adds a light alternative on top
 * of it, it doesn't replace the default. The `data-theme` attribute (not React-rendered, set
 * imperatively) is what CSS keys off; see the inline script in `[locale]/layout.tsx` for how the
 * very first paint avoids a dark->light flash for returning users who chose light.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    // Deliberately setState-in-effect, not a lazy useState initializer: this must run AFTER
    // hydration, not during it. SSR always renders the 'dark' default (matching antd's
    // ConfigProvider tree on the server); picking up 'light' during the initial client render
    // instead would make that render disagree with the server HTML antd produced, triggering a
    // real hydration mismatch. Reading it into state after mount costs one extra re-render for
    // returning light-mode visitors, which is the accepted tradeoff (the CSS-token part of the
    // page is already correct at first paint regardless, via the blocking script in layout.tsx).
    const current = document.documentElement.getAttribute('data-theme');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (current === 'light') setMode('light');
  }, []);

  const toggle = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return <ThemeContext.Provider value={{ mode, toggle }}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
}
