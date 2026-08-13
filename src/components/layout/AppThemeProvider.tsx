'use client';

import type { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import type faIR from 'antd/locale/fa_IR';
import { ThemeProvider, useThemeMode } from '@/lib/theme-context';
import { getAntdTheme } from '@/lib/antd-theme';

function AntdBridge({
  children,
  direction,
  locale,
}: {
  children: ReactNode;
  direction: 'rtl' | 'ltr';
  locale: typeof faIR;
}) {
  const { mode } = useThemeMode();
  return (
    <ConfigProvider theme={getAntdTheme(mode)} direction={direction} locale={locale}>
      {children}
    </ConfigProvider>
  );
}

/** Bridges the client-only theme toggle (localStorage + `data-theme` attribute, see
 * theme-context.tsx) into antd's ConfigProvider, which needs the mode to pick dark/light
 * algorithm+tokens. Split out of layout.tsx because that stays a Server Component. */
export function AppThemeProvider({
  children,
  direction,
  locale,
}: {
  children: ReactNode;
  direction: 'rtl' | 'ltr';
  locale: typeof faIR;
}) {
  return (
    <ThemeProvider>
      <AntdBridge direction={direction} locale={locale}>
        {children}
      </AntdBridge>
    </ThemeProvider>
  );
}
