import { defineRouting } from 'next-intl/routing';

// fa is the default/primary locale per doc/plan.md D7 — the business is Iran-based and
// Iran-serving (doc/business_path.md), English is secondary.
export const routing = defineRouting({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'always',
});

export type AppLocale = (typeof routing.locales)[number];
