import { theme as antdTheme, type ThemeConfig } from 'antd';
import type { ThemeMode } from './theme-context';

/**
 * Round 5 (2026-08-07): dark + blue, matching the color language of the user's own 3D-viewer
 * reference file (elecio_smart_dnc_3d_v6.html). Round 8 (2026-08-07) adds a light counterpart —
 * same blue family, deepened slightly for AA contrast against white instead of the glow tint used
 * on dark. Kept as a function (not a static object) because the mode is now client-side state,
 * not something we can bake into a single build-time export.
 */
const dark: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: '#4aa0ff',
    colorInfo: '#4aa0ff',
    colorBgBase: '#0a0c10',
    colorBgContainer: '#10141b',
    colorBgElevated: '#171c25',
    colorBorder: 'rgba(238, 242, 247, 0.12)',
    colorText: '#eef2f7',
    borderRadius: 10,
    fontFamily: "'Vazirmatn', 'Segoe UI', Tahoma, system-ui, -apple-system, sans-serif",
  },
};

const light: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: '#1c6fe0',
    colorInfo: '#1c6fe0',
    colorBgBase: '#f5f7fa',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: 'rgba(13, 20, 32, 0.12)',
    colorText: '#0d1420',
    borderRadius: 10,
    fontFamily: "'Vazirmatn', 'Segoe UI', Tahoma, system-ui, -apple-system, sans-serif",
  },
};

export function getAntdTheme(mode: ThemeMode): ThemeConfig {
  return mode === 'light' ? light : dark;
}
