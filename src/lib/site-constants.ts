// Real business facts audited from old/ (see doc/plan.md §4) — centralized so they're never
// hand-retyped per component. Update here only.

export const ORDER_URL = 'https://elecio.ir/order/product/elecio-smart-dnc-g1/';

export const CONTACT = {
  email: 'info@elecio.ir',
  phones: [
    // { name: 'مهندس وکیلی', number: '09213179857', href: 'tel:+989213179857' },
    { name: 'مهندس مشایخ', number: '09129152300', href: 'tel:+989129152300' },
    { name: 'مهندس ساکی', number: '09906400588', href: 'tel:+989906400588' },
  ],
} as const;

export const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/company/elecio',
  instagram: 'https://www.instagram.com/Elecio_ir/',
  telegram: 'https://t.me/elecio_shop',
} as const;

// Consent confirmed by user 2026-08-06 (see doc/business_path.md §6 / doc/plan.md Phase 0).
export const PARTNERS = [
  { name: 'Pars Techno', logo: '/partners/parstechno.webp' },
  { name: 'PIM', logo: '/partners/pim.webp' },
  { name: 'صنعت پژوهان پارسه', logo: '/partners/sanatpazhohan.webp' },
  { name: 'Techno Sanat', logo: '/partners/ts.webp' },
] as const;

// Real customer installation videos hosted on Aparat (old/src/components/landing/
// CustomerSatisfactionSection.tsx) — machine + controller + client, not staged testimonials.
export const INSTALLATION_VIDEOS = [
  { id: 'gizoh6f', title: 'دستگاه DNC for CNC وای فای خور' },
  { id: 'eotl2r9', title: 'Feeler | Fanuc Series Oi Mate-MB | صنعت پژوهان پارسه' },
  { id: 'did1255', title: 'Quaser | Fanuc 18-M | صنعت پژوهان پارسه' },
  { id: 'aorep43', title: 'Moriseiki | Fanuc 10M | صنعت پژوهان پارسه' },
  { id: 'bjt0301', title: 'Victor | Fanuc Series Oi-MC | صنعت پژوهان پارسه' },
  { id: 'wjk6798', title: 'Bridgeport | Heidenhain TNC370 | مجتمع تجاری پارس' },
  { id: 'mev267m', title: 'Quaser | Heidenhain iTNC 530 | صنعت پژوهان پارسه' },
  { id: 'xpfopib', title: 'Dahli | Mitsubishi Meldas 500 | صنعت پژوهان پارسه' },
  { id: 'jja519a', title: 'Dahli | Fanuc O-M | صنعت پژوهان پارسه' },
] as const;

// Real, audited numbers (old/src/components/landing/StatsSection.tsx) — not invented for this
// rebuild. Kept here so the homepage stats section and any future reuse read from one source.
export const COMPANY_STATS = [
  { value: '150', suffix: '+', key: 'customers' },
  { value: '450', suffix: '+', key: 'devices' },
  { value: '2.5', suffix: 'M+', key: 'hours' },
  { value: '99.8', suffix: '%', key: 'satisfaction' },
] as const;

// Two separate sets of studio renders — media/landings(1-20).png for English, the distinct
// media/fa_landing(1-11).png set for Persian (doc/journey.md 2026-08-07 round 8: "use different
// set of landings for persian or english"). Real photography either way, not generated art. Both
// sets share the same 1672x941 dimensions, and slide N in one locale pairs with the same
// audience/topic as slide N in the other (see messages/{fa,en}.json hero.slides, same order).
export const HERO_SLIDE_IMAGES = {
  en: [
    '/images/hero-slide-en-1.webp',
    '/images/hero-slide-en-2.webp',
    '/images/hero-slide-en-3.webp',
    '/images/hero-slide-en-4.webp',
    '/images/hero-slide-en-5.webp',
  ],
  fa: [
    '/images/hero-slide-fa-1.webp',
    '/images/hero-slide-fa-2.webp',
    '/images/hero-slide-fa-3.webp',
    '/images/hero-slide-fa-4.webp',
    '/images/hero-slide-fa-5.webp',
  ],
} as const;

// Light-theme hero backdrop — swapped in for HERO_SLIDE_IMAGES when the light theme is active
// (see theme-context.tsx). Checked all 17 shots in media/landings (*).png individually: only
// (6), (15), and (20) actually have a light/white studio background — everything else in that
// set is a dark/moody backdrop that would clash with the light theme's white chrome. One set,
// not split by locale, since this is a theme choice rather than an audience one; Hero.tsx cycles
// through these 3 (instead of 5) while in light mode.
export const HERO_SLIDE_IMAGES_LIGHT = [
  '/images/hero-slide-light-1.webp',
  '/images/hero-slide-light-2.webp',
  '/images/hero-slide-light-3.webp',
] as const;

// Portrait art-direction assets supplied at 941x1672. The artwork is language-neutral, so both
// locales intentionally share the same four-image sequence while theme mode selects the device
// treatment. Hero.tsx switches to these whenever the viewport is taller than it is wide.
const HERO_SLIDE_IMAGES_MOBILE_DARK = [
  '/images/hero-slide-mobile-dark-1.webp',
  '/images/hero-slide-mobile-dark-2.webp',
  '/images/hero-slide-mobile-dark-3.webp',
  '/images/hero-slide-mobile-dark-4.webp',
] as const;

export const HERO_SLIDE_IMAGES_MOBILE = {
  en: HERO_SLIDE_IMAGES_MOBILE_DARK,
  fa: HERO_SLIDE_IMAGES_MOBILE_DARK,
} as const;

export const HERO_SLIDE_IMAGES_LIGHT_MOBILE = [
  '/images/hero-slide-mobile-light-1.webp',
  '/images/hero-slide-mobile-light-2.webp',
  '/images/hero-slide-mobile-light-3.webp',
  '/images/hero-slide-mobile-light-4.webp',
] as const;

// Per-slide link targets — not locale-specific, shared by both image sets above by index.
export const HERO_SLIDES = [
  {
    primaryHref: ORDER_URL,
    primaryExternal: true,
    secondaryHref: '#about-product',
    secondaryExternal: false,
  },
  {
    primaryHref: '/for/business-owners',
    primaryExternal: false,
    secondaryHref: ORDER_URL,
    secondaryExternal: true,
  },
  {
    primaryHref: '/for/programmers',
    primaryExternal: false,
    secondaryHref: ORDER_URL,
    secondaryExternal: true,
  },
  {
    primaryHref: '/for/operators',
    primaryExternal: false,
    secondaryHref: ORDER_URL,
    secondaryExternal: true,
  },
  {
    primaryHref: ORDER_URL,
    primaryExternal: true,
    secondaryHref: '#about-product',
    secondaryExternal: false,
  },
] as const;

// Persona-story slideshow for the homepage picker (PersonaGrid.tsx): 3 cinematic shots per
// persona (owner, programmer, operator), each holding the real device. Locale-specific like
// HERO_SLIDE_IMAGES above, not a translation of the same photos — the `fa` set uses
// Persian-presenting models so the site's default (fa) audience sees themselves in it, matching
// the "distinct set per locale" precedent already established for the hero.
export const PERSONA_STORY_IMAGES = {
  en: [
    ['/images/persona-story/owner-en-1.webp', '/images/persona-story/owner-en-2.webp', '/images/persona-story/owner-en-3.webp'],
    ['/images/persona-story/programmer-en-1.webp', '/images/persona-story/programmer-en-2.webp', '/images/persona-story/programmer-en-3.webp'],
    ['/images/persona-story/operator-en-1.webp', '/images/persona-story/operator-en-2.webp', '/images/persona-story/operator-en-3.webp'],
  ],
  fa: [
    ['/images/persona-story/owner-fa-1.webp', '/images/persona-story/owner-fa-2.webp', '/images/persona-story/owner-fa-3.webp'],
    ['/images/persona-story/programmer-fa-1.webp', '/images/persona-story/programmer-fa-2.webp', '/images/persona-story/programmer-fa-3.webp'],
    ['/images/persona-story/operator-fa-1.webp', '/images/persona-story/operator-fa-2.webp', '/images/persona-story/operator-fa-3.webp'],
  ],
} as const;

// Real controller/protocol brands from the product catalog (ControllerMatrix.tsx). No official
// brand logo image assets exist in media/ or old/public/ — using licensed trademark logos
// fetched from the web without permission isn't something to guess at, so the homepage
// "supported machines" section renders these as styled wordmark chips (same honest approach as
// ControllerMatrix) rather than image logos.
export const SUPPORTED_CONTROLLERS = ['FANUC', 'SIEMENS', 'HEIDENHAIN', 'MITSUBISHI', 'HAAS', 'CHARMILLES'] as const;
