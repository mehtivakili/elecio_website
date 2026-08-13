# Expansion Phase 5 — SEO, accessibility, performance, and privacy

Implemented 2026-08-13. This records the shipped technical contract and the checks that still need
the real production domain or physical devices.

## SEO contract

- `NEXT_PUBLIC_SITE_URL` is the canonical public origin; `BETTER_AUTH_URL` is the operational
  fallback and `https://elecio.ir` is the final safe fallback. Production must set both explicitly.
- `robots.ts` indexes public content and excludes API, login, verification, account, and admin.
  `sitemap.ts` lists localized public pages and only published, due articles.
- Public routes publish localized canonical/hreflang, Open Graph, and Twitter metadata. Article
  alternates are reciprocal only when `translation_status=complete`.
- Article JSON-LD is derived only from visible database content. No prices, ratings, or unsupported
  claims are invented. The manifest uses the optimized Elecio mark.

Production verification: submit `/sitemap.xml` in Search Console/Bing, validate representative
fa/en articles in Rich Results Test, inspect rendered canonicals and reciprocal hreflang, and record
the pre-launch query/index baseline. These checks require the deployed public origin.

## Performance budget and behavior

Target the 75th percentile on a representative mid-range Android device over throttled 4G:

| Metric | Release budget |
|---|---:|
| LCP | <= 2.5 s |
| INP | <= 200 ms |
| CLS | <= 0.10 |
| Initial route JS | <= 250 KiB compressed, excluding explicitly lazy WebGL |
| Initial homepage raster transfer | <= 900 KiB |
| Long main-thread task | <= 200 ms |

The hero now mounts one full-viewport image rather than all slides. Large raster sources were
re-encoded: `logo.webp` 1.52 MB -> 64.7 KB, `logo_light.png` 997 KB -> 67.7 KB,
`logo-mark.webp` 347.5 KB -> 55.4 KB, and the 4000 px operator image 1.17 MB -> a 1600 px 173.9 KB
derivative. Local partner images use responsive
`next/image`; CMS and external thumbnails decode asynchronously.

WebGL lazy-mounts near its viewport, renders only onscreen, pauses in hidden tabs, caps DPR at 1.15
on mobile and 1.5 on desktop, and is replaced by a responsive static image when reduced motion is
requested, WebGL is unavailable, device memory is <=4 GB, or logical CPU count is <=4. Scroll
updates are requestAnimationFrame-coalesced and reduced-motion sticky sections collapse.

Run Lighthouse/WebPageTest and Chrome Performance traces after deployment; repository build output
cannot prove network CWV or physical-device frame stability.

## Accessibility and theme behavior

- A keyboard-visible skip link targets page content; global focus-visible rings and 44 px controls
  are enforced.
- Hero tabs expose selection and roving tab order. Video dialogs expose dialog semantics, title,
  localized close control, Escape handling, focus entry, and focus restoration.
- Motion is effectively disabled for `prefers-reduced-motion`; WebGL does not initialize.
- Compatibility content uses light/dark semantic tokens instead of dark-only text/backgrounds.
- The responsive privacy prompt observes safe areas and offers a persistent settings control.

Before release, perform the issue-register matrix with keyboard-only navigation, NVDA/Chrome,
VoiceOver/Safari, 200% zoom, forced colors, and real 320/360/390/430 px devices.

## Privacy-safe analytics

Tracking is denied by default. Consent is stored locally as `elecio-analytics-consent`; declining
emits nothing, and users can reopen privacy settings. Consented requests use `credentials:'omit'`
and contain only an allowlisted event plus `fa|en` locale.

The server stores one aggregate row per `{UTC day, event, locale}` with a count. It never stores an
analytics IP, phone, email, user id, session id, device id, URL, referrer, or free text. Request-IP
hashing is used only as an ephemeral process-local abuse-limit key. Successful contact and download
events are wired; remaining reviewed names are reserved until their exact interaction is tested.

Migration `20260813000014_create_privacy_safe_conversion_counts.ts` owns this table. Never join it
to customer data or add identifier dimensions. Third-party analytics requires a new privacy and
Iran-reachability review.

## Release evidence and external gates

Migration apply -> rollback -> reapply passed. Unit tests, TypeScript, lint, production build, and
production dependency audit are repository gates. Physical assistive-tech/device tests, production
CWV, live structured-data validation, and consent-event delivery remain deployment gates.
