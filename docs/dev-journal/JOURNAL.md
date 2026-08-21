# Dev Journal

Append-only record of *why* this codebase changes. Newest entries at the bottom.

**Rules**
- Entries are immutable. Never edit, reorder, or delete anything below this header.
- To change a past decision, append a new entry with `Supersedes: [OLD-ID]` and
  patch notes. Leave the old entry untouched.
- Entry IDs are `[<area>:]YYYY-MM-DD.NN` (per-file per-day counter; the `<area>:`
  prefix is used when a `JOURNAL-MAP.md` splits records across files). See the
  dev-journal skill for the entry template.

---

## [2026-08-19.01] Close the technical SEO gap between the 15 Aug plan and shipped code
- **Type:** feature
- **When:** 2026-08-19 02:00
- **Trigger:** User asked for a full SEO survey/plan (PDF + matched EN/FA Excel deliverables) followed by implementation, believing "my SEO path is not the best." Investigation found the belief was half right: an excellent 24-page Persian execution plan (`deliverables/Elecio_SEO_Execution_Plan_FA.pdf`, 15 Aug) and two matched 60-row keyword/content-calendar workbooks already existed, but essentially none of the plan's "urgent technical SEO" items had reached the codebase, and the EN workbook's tracker was stale (showed "Idea" for an article that was actually live).
- **Scope:** `src/lib/structured-data.ts` (new), `src/app/[locale]/layout.tsx`, `src/app/[locale]/product/page.tsx`, `src/app/[locale]/blog/page.tsx`, `src/app/[locale]/blog/[slug]/page.tsx`, `src/app/[locale]/privacy/page.tsx`, `src/app/[locale]/terms/page.tsx`, `src/app/sitemap.ts`, `src/components/layout/SiteFooter.tsx` (+ `.module.css`), `.env.example`, `messages/{en,fa}.json`, `deliverables/Elecio_SEO_Content_Planner_{EN,FA}.xlsx`, `deliverables/Elecio_SEO_Master_Plan.pdf` (new)
- **Status:** active

### Feature intent
Close every technical-SEO gap that was findable from inside the repo (structured data, orphaned legal pages, stale metadata) without touching anything that needs a business decision or hosting/domain access, and produce an honest status report (not a re-plan) since a good plan already existed.

### Change
- New `src/lib/structured-data.ts`: `organizationJsonLd`, `websiteJsonLd`, `breadcrumbJsonLd`, `productJsonLd` builders — every field sourced from data already shown elsewhere on the site (name, logo, real contact/social links); no `offers`/rating/review invented, matching the existing plan's own rule against fabricated claims.
- `[locale]/layout.tsx`: injects Organization + WebSite JSON-LD site-wide; reads `GOOGLE_SITE_VERIFICATION`/`BING_SITE_VERIFICATION`/`YANDEX_SITE_VERIFICATION` into the Metadata API's `verification` field.
- `[locale]/product/page.tsx`: adds Product + BreadcrumbList JSON-LD.
- `[locale]/blog/[slug]/page.tsx`: adds BreadcrumbList JSON-LD; fixed JSON-LD origin to read the shared `SITE_URL` helper instead of `BETTER_AUTH_URL` directly (was harmless in dev, would have silently diverged from canonical/sitemap URLs in production).
- `[locale]/privacy/page.tsx`, `[locale]/terms/page.tsx`: added `generateMetadata` (both previously had none — inherited the homepage's title/description, a real duplicate-content issue). Added both to `sitemap.ts`'s `paths` array at priority 0.3, and linked them from a new three-column "Legal" section in `SiteFooter.tsx` (grid was hardcoded to 2 columns; widened to 3).
- `[locale]/blog/page.tsx`: fixed cover-image `alt=""` on the index cards to use the real post title (was empty on genuinely meaningful content thumbnails, not a decorative image).
- `.env.example`: added `NEXT_PUBLIC_SITE_URL` + the three verification env vars — previously nothing in the template reminded a deployer to set the canonical production origin, even though `src/lib/seo.ts` and `phase5_seo_ux_performance.md` both assume it's set.
- `messages/{en,fa}.json`: added `footer.legalTitle/privacy/terms` keys.
- Updated both `deliverables/Elecio_SEO_Content_Planner_{EN,FA}.xlsx` (Content Calendar sheet, via openpyxl in place — data validations/dashboards verified intact after save): FA rows 5–8 (EC-002..005) annotated as live-but-thin with no focus keyword; EN row 4 (EN-EC-001) corrected from "Idea" to "Published" with the real URL/date (verified this one row's planned title+slug exactly matches the live article); EN rows 5–8 (EN-EC-002..005) annotated with topic-overlap warnings rather than marked published, after discovering they do **not** correspond to what's actually live (see Reasoning).
- New `deliverables/Elecio_SEO_Master_Plan.pdf` — audit + gap-closure status + 2026 GEO/AEO addition + Iran-specific off-page + sanctions-aware measurement strategy + English-market strategy, built as a print-styled HTML file rendered via headless Chrome (`--print-to-pdf`).

### Reasoning — why this way
- **Did not touch the 4 thin (~140-word) published articles' body content.** Three are controller-specific (Fanuc RS232, Siemens transfer) — exactly the category of claim the existing 15 Aug plan explicitly bans an AI from inventing without a named engineer's technical verification. Silently expanding them would have repeated the mistake the project's own operating rule exists to prevent. Flagged in both the Excel notes and the PDF (§10) as a decision point, with an offer to draft outlines using only catalog-PDF-sourced facts.
- **Did not directly UPDATE `posts.focus_keyword_*`/`schema_type` via a raw DB script**, even though the correct target keywords are already sitting in the Keyword Map workbook. The admin CMS has a real SEO panel built for exactly this, including revision history (`post_revisions`) that a raw SQL patch would bypass. Left as a 2-minute manual action via the existing UI rather than a silent backend mutation of editorial state.
- **Did not attempt an EN row 4-8 "mark as published" sync at first**, then caught it: the published Fanuc/Siemens/backup/downtime articles are FA-originated topics with independently-written English companions at the *same slug*, not executions of the separately-planned English-native `EN-EC-002..005` topics (different titles/slugs). Marking those calendar rows "Published" would have been factually wrong and could cause a future writer to skip a topic that's actually still unwritten, or duplicate one that already has a near-neighbor live. Verified row-by-row against the live DB (`posts` table query) before writing anything to either workbook.
- **Deferred auto-generated per-post OG images** (`next/og` `ImageResponse`) — flagged as a real gap in the audit but not shipped, because it needs correct font-buffer handling for Persian glyphs that couldn't be verified working within this session's scope; shipping it half-tested would violate the project's "no half-finished implementations" norm. Recorded as the top follow-up in the PDF roadmap instead.
- **Chose Bing Webmaster + Yandex Webmaster as parallel measurement channels**, not just Google Search Console, after finding (web research, cited in the PDF) that Google has suspended Analytics/other-service access for Iran-flagged accounts under U.S. sanctions — a real risk for this business, not hypothetical. This also resolves the "GA4 vs PostHog" item left open in `doc/plan.md` Phase 8: neither, for the same reason Phase 5 already shipped first-party aggregate telemetry instead.
- **PDF built as styled HTML → headless Chrome `--print-to-pdf`** rather than a Python PDF library, for full CSS control (RTL Persian excerpts inline, print page-breaks, tables) — reused the same approach already present in this project's toolset (Playwright/Chromium already cached locally from prior sessions).

### Risks / follow-ups
- `NEXT_PUBLIC_SITE_URL` and the three verification codes are scaffolded in `.env.example` only — production `.env` still needs real values before Search Console/Bing/Yandex verification will actually work.
- A real repo-wide search for `elecio.co` (flagged as a critical domain-confusion bug in the 15 Aug plan) found zero code references — the value is either CMS-stored data, a hosting-panel artifact, or already resolved; needs checking directly in the CMS site settings and hosting panel, not in source.
- Verified via `tsc --noEmit`, `eslint`, `next build` (all clean, `/privacy` and `/terms` now statically prerendered in all locales), and a Playwright screenshot pass (footer 3-column layout, `/en/privacy`, `/fa/terms`, `/fa/blog` — all render correctly in both languages, no visual regressions).
- Full findings, the updated 30/60/90 roadmap, and the English-market strategy live in `deliverables/Elecio_SEO_Master_Plan.pdf` — read that alongside this entry for the complete picture; this journal entry covers the code-level "why," the PDF covers the strategic "what's next."

---

## [2026-08-21.01] Keep WebGL and hero media off the critical rendering path
- **Type:** performance
- **When:** 2026-08-21 03:35
- **Trigger:** The production PageSpeed result and iPhone feedback reported severe freezing, while a review suggested the embedded shop-floor story was both blocking the main thread and hiding important copy from the parent page.
- **Scope:** `src/components/marketing/{Hero,ShopFloorStory}*`, `src/components/marketing/shop-floor-story-copy.ts`, `src/components/marketing/hero3d/index.tsx`, `public/3d/story/index.html`, `next.config.ts`, `src/lib/seo.ts`, `.env.example`, `src/components/layout/PrivacyPreferences.module.css`, `ecosystem.config.js`
- **Status:** active

### Change
- Removed the hero-readiness event and unconditional 12-second fallback that mounted the WebGL iframe even when the visitor never reached it. Constrained clients now get a static preview plus an explicit 3D opt-in; desktop loads only after real interaction and near-viewport intersection.
- Moved all seven bilingual story stages into parent-page renderable data and HTML. The iframe hides its duplicate copy in embedded mode, pauses its animation loop outside the viewport, uses a mobile DPR cap of 1, and disables mobile antialiasing.
- Hero videos now use `preload="none"` and do not autoplay or rotate until real interaction. The initial hero image is eager/high-priority. The separate Three.js product experience now has the same interaction-plus-proximity loading gate.
- Added explicit public-asset cache headers, corrected the canonical fallback to `https://elecio.co` without coupling it to the authentication origin, fixed the privacy accept-button contrast, and added a production-default PM2 ecosystem config.

### Evidence and reasoning
- Production Lighthouse before the change: mobile Performance 34, TBT 11.73 s, main-thread work 19.0 s, and about 7.5 MiB transferred. The 3D iframe alone accounted for roughly 14.5 s CPU. Desktop Performance was 54.
- Controlled production-build Lighthouse after the change: mobile Performance 84, TBT 70 ms, 502 KiB transferred, no media bytes, and one document (no iframe); desktop Performance 99 with 0 ms TBT. Accessibility and Best Practices reached 100.
- Direct production-server inspection found deployment commit `8024ff9` (behind local `d25812f`), HTTP/1.1 only, public 3D/video responses still at `max-age=0`, and PM2 running with non-standard `NODE_ENV=development`. No production files or services were changed during the audit.

### Verification and follow-up
- `npm run typecheck`, `npm run lint`, and repeated `npm run build` passes completed successfully.
- The generated FA HTML contains the parent story copy, canonical/hreflang values on `elecio.co`, an eager initial LCP image, and no initial iframe.
- Deployment remains intentional follow-up work: reconcile the server-only staged `ecosystem.config.js`, deploy the newer Git revision plus these working-tree changes, start PM2 with production environment, enable HTTP/2 in the Nginx TLS vhosts, and re-run public Lighthouse/CrUX monitoring.

---

## [2026-08-21.02] Preserve the original 3D story behind an explicit start gate
- **Type:** correction
- **When:** 2026-08-21 04:15
- **Supersedes:** [2026-08-21.01]
- **Trigger:** The user rejected moving the story copy into the parent page and any visual/runtime edits inside the authored 3D experience. The intended boundary is strict: performance work may control when the story loads, but must not rewrite the story itself.
- **Scope:** `public/3d/story/index.html`, `src/components/marketing/hero3d/index.tsx`, `src/components/marketing/ShopFloorStory.tsx`, `src/components/marketing/ShopFloorStory.module.css`, removal of `src/components/marketing/shop-floor-story-copy.ts`
- **Status:** active

### Correction
- Restored `public/3d/story/index.html` and the separate `hero3d/index.tsx` byte-for-byte from commit `8024ff9`; no camera, model, text, shader, DPR, animation-loop, or internal presentation changes remain.
- Removed all duplicated bilingual stage copy from the parent Next.js HTML and deleted the shared copy module.
- Replaced automatic mounting with a single full-viewport poster and “Start the 3D story” button on desktop and mobile. Before activation the section is one viewport tall and no iframe, Three.js document, or media is requested. Clicking expands the original scroll range and mounts the original iframe unchanged.
- Retained only infrastructure-level improvements outside the authored experience: HTTP/2, production PM2 mode, cache headers, hero-video deferral, canonical fixes, and the accessibility contrast correction.

### Verification
- Git blob comparison confirms the restored story hash `b22d008b9b76602b76787c573bdeb741a5d0f7d1` exactly matches `8024ff9:public/3d/story/index.html`; the separate hero3d loader also matches its original blob.
- Mobile screenshots verified both the pre-start gate and the original Persian stage-one WebGL composition.
- Generated HTML contains the start button, contains no iframe, and contains none of the previously duplicated story copy. `npm run typecheck`, `npm run lint`, and `npm run build` all pass.
