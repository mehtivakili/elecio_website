# Elecio Smart DNC — Website Rebuild: Technical Plan

This is the engineering/product companion to [`business_path.md`](./business_path.md) (business
decisions) and [`marketing_path.md`](./marketing_path.md) (go-to-market/SEO). The narrative of
*how* and *why* this plan changes over time lives in [`journey.md`](./journey.md) — read that for
the story, read this for the current, authoritative state of the plan. When they conflict,
`journey.md`'s most recent entry wins and this file should be updated to match.

**Status:** Draft v1 — 2026-08-06. Architecture decisions below are locked. Phase-level task lists
will get more precise as we enter each phase (no point over-specifying Phase 8 today).

---

## 0. Scope boundary — read this first

This project is **the marketing/content website** for Elecio Smart DNC: persona-driven landing
pages, a blog, lead capture, and a lightweight admin/CMS behind it.

It is **not**:
- **ElecIO Manager** — the existing Windows/Android/Web device-management software (built with
  JS + Go per the old site's download page) that customers use to actually operate the hardware.
  That's a separate product with its own codebase and release cycle. We only *link to* its
  installers and document it in a `/software` page.
- **The order/checkout flow** — see Decision Log below. v1 links out to the existing live order
  page rather than rebuilding checkout.

If either of those becomes in-scope later, it's a new phase (see Phase 10+), not a silent scope
expansion of this plan.

---

## 1. How we'll work together (operating agreement)

You told me directly: you don't want a 100%-AI-generated site, you want to make the critical
calls, and you've been burned before by vibe-coding a whole project and then having to redo it
after learning something the hard way. So, concretely:

- **Every phase below that involves a visible/architectural choice gets presented as options
  before I build it** — not after. If I'm ever about to make a stylistic or structural judgment
  call silently, that's a process failure; call it out.
- **I recommend, you decide.** Recommendations are marked, but the default is never assumed —
  you'll see the tradeoffs, not just my pick.
- Decisions that are made get logged in the **Decision Log** (§2) with the date and the reasoning,
  not just the conclusion — so six months from now neither of us has to guess *why*.
- Locked architecture decisions (§2) are not revisited casually — reversing them costs real time.
  If one turns out wrong, we say so explicitly and log the reversal (see `journey.md`'s
  supersession convention), we don't quietly drift.

---

## 2. Decision Log

| # | Decision | Date | Rationale |
|---|---|---|---|
| D1 | v1 does **not** rebuild checkout/order flow. Primary CTAs link out to the existing live order page (`elecio.ir/order/product/elecio-smart-dnc-g1/`). | 2026-08-06 | It already works and has presumably processed real orders; rebuilding it is scope creep for a site whose job is persuasion + lead capture, not payments. Revisit in Phase 10+ once the new site has traffic data. |
| D2 | Framework: **Next.js (App Router), full-stack** — no separate backend service. All server logic (Objection/Knex/MySQL access, form handling, admin API) lives in Next.js Route Handlers / Server Actions within the same app. | 2026-08-06 | Your explicit call, overriding the Fastify/NestJS/Express options I'd framed. Right-sized for this project: one product, one team, no second client needing the API independently (ElecIO Manager is a separate system — see §0). One deploy target, no CORS, simpler ops on Iranian PaaS hosting. Extractable into a standalone API later if a real second consumer ever shows up. |
| D3 | Database: **MySQL 8.0.16+ + Knex + Objection.js**. | 2026-08-13 | Replaces the original PostgreSQL decision so deployment can use the MySQL server already available. Objection remains the model layer and Knex remains the query/migration layer. |
| D4 | UI/component system: **Ant Design**, kept and modernized (not migrated to shadcn/ui). | 2026-08-06 | Your call over shadcn/ui. Zero-migration continuity from the old site, proven RTL behavior already, and — importantly — **Refine has first-class official Ant Design bindings** (`@refinedev/antd`), which is actually the *best-supported* Refine+UI pairing available, better wired than Refine+shadcn would have been. So D4 and D5 reinforce each other rather than fighting. |
| D5 | Admin/CMS: **Refine**, mounted inside the same Next.js app at `/admin` (using `@refinedev/nextjs-router` + `@refinedev/antd`), talking to our own Route Handlers. | 2026-08-06 | Avoids hand-building CRUD screens for blog posts, leads, and partner/testimonial content — the exact "don't reinvent the wheel" ask. Headless-enough to still look like *our* admin, not a generic dashboard, because it's using our own Ant Design theme. |
| D6 | 3D product view: **Three.js, but fully procedural geometry — no `.glb` file loaded.** Currently `src/components/marketing/hero3d/elecioSceneV6.ts`, ported near-verbatim from a complete working scene you supplied directly (`elecio_smart_dnc_3d_v6.html`) — extruded/lofted housing geometry measured off the real device, PBR materials, procedural decal/screen/environment textures, real shadows. | 2026-08-06, superseded 2026-08-07 (twice — see `journey.md` `.07`, `.08`, `.11`) | Went custom-R3F → hand-rolled canvas-2D rasterizer → back to Three.js, each time on your direct steer, not my own drift. The canvas-2D detour (entries `.07`–`.10`) was replaced once you supplied a materially more sophisticated Three.js scene and were explicit that GLB-file loading specifically (not WebGL itself) was what to avoid — this version never loads an external asset, so it doesn't reintroduce the GLTFLoader crash risk that started this whole chain. `@react-three/fiber`/`@react-three/drei` remain uninstalled (this uses plain Three.js in a `useEffect`, not R3F's declarative layer) — `three` itself was reinstalled. |
| D7 | Bilingual site: Persian (fa, default/RTL) + English (en), via `next-intl`. | 2026-08-06 (carried forward from prior session's framing in `business_path.md`) | Confirmed direction; scope of English-side *depth* (identical content vs. export/international framing) is still open — see `business_path.md` §7. |
| D8 | Single Next.js app, no multi-package monorepo. Internal structure organized by concern (see §5), not by deploy unit. | 2026-08-06 | Consistent with D2. A monorepo earns its cost when there are multiple deployables or multiple teams; neither is true here. Revisit only if ElecIO Manager's web app ever needs to share code with this repo. |

Open decisions that block specific phases are tracked where they block (§6) and cross-referenced
to `business_path.md` rather than duplicated.

---

## 3. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15+/16, App Router, TypeScript | Continues from `old/`, satisfies "must be React," best SSR/ISR story for SEO |
| UI kit | Ant Design (v6) | Continued from `old/`; re-themed, not reused as-is |
| 3D | Procedural canvas-2D renderer (`src/components/marketing/hero3d/proceduralDevice.ts`) — no WebGL/Three.js | See D6 (superseded) |
| i18n | `next-intl` | App Router-native, fa (RTL, default) + en |
| Database | MySQL 8.0.16+ | Existing server; hosting details TBD — see §6 Phase 1 |
| Query builder / migrations | Knex | |
| ORM/model layer | Objection.js | |
| Admin/CMS | Refine (`@refinedev/nextjs-router`, `@refinedev/antd`) | Mounted at `/admin` |
| Rich text (blog editor) | TipTap | Pairs cleanly with a custom Refine input field; modern, actively maintained |
| Forms | Ant Design `Form` (already used throughout `old/`) | |
| Auth (admin only — public site has no user accounts in v1) | To decide in Phase 6: lightweight session-based auth (e.g. `iron-session` or Auth.js Credentials) against an `admin_users` table | Small, fixed set of internal users — no need for a heavy auth-as-a-service product |
| Analytics | **[DECISION NEEDED]** PostHog vs GA4 — see `business_path.md` §5 | Must verify reachability from Iran before committing either way |
| Hosting | **[DECISION NEEDED]** Deploy the Node app where it can securely reach the existing MySQL server; use a CDN/object-storage provider separately for media if needed. | See `business_path.md` §3–4 |
| Package manager | pnpm | Faster installs, disk-efficient; no strong reason not to |

---

## 4. Working principle for content: real, not placeholder

Everything in `old/` is real production copy from a 3-year-old operating business — it's reused as
the factual/content baseline, not as a design baseline. Concretely, from the audit:

- **Hardware specs (real, keep):** dual-core processor, 8GB internal storage, DNC-compatible
  serial cable, internal Wi-Fi, XON/XOFF + RTS/CTS serial protocols, Heidenhain TNC
  Server/LSV2 compatibility, isolated port-protection circuit (protects against voltage spikes
  frying the serial port — a real differentiator worth a whole section), compatible controllers:
  Fanuc, Siemens, Heidenhain, Mitsubishi, Haas, Charmilles.
- **Software specs (real, keep):** ElecIO Manager — Windows/Android/Web app, program folder
  organization, transfer status monitor, dual-mode reporting (aggregate + per-machine/shift),
  machine activity & idle-time tracking, batch/group send with sequential auto-run for
  serial-production lines, backup/archive, smart network auto-discovery of devices ("a feature
  even Heidenhain doesn't have" — verify this claim before reusing it verbatim), NTP time sync,
  no-restart live config changes, dual-core lets it send the *next* program while the *current*
  one is still running.
- **Company facts (real, keep, re-verify currency):** 3-person engineering team (مشایخ, وکیلی,
  ساکی — backgrounds in صنایع گرمسار / کنترل و مکاترونیک خواجه‌نصیر), 4 partner companies (Pars
  Techno, PIM, Sanat Pazhohan Parseh, Techno Sanat Alizadegan), Tehran/Shahr-e Qods address, 3
  direct phone lines, `info@elecio.ir`, LinkedIn/Instagram/Telegram, video testimonials hosted on
  Aparat.
- **The product's own catalog already segments buyers into exactly 3 roles** — مالک و مدیرعامل
  (Owner/CEO), برنامه‌نویس و دفتر فنی (Programmer/technical office), اپراتور CNC (CNC Operator) —
  visible on catalog page 1. This independently validates the persona-page structure you asked
  for; it's not a structure I'm inventing, it's the business's own existing segmentation.
- **Stats (real numbers, stale — do not publish until refreshed):** "150+ customers," "450+
  active devices," "2.5M+ operating hours," "99.8% satisfaction" — flagged in `business_path.md`
  §6 as needing current figures before reuse.
- **Dead/inconsistent code found, not to carry forward:** `old/src/components/landing/
  FeaturesSection.tsx` exists but is never imported by `old/src/app/page.tsx` — its copy is
  generic IoT/AI boilerplate, not DNC-specific, and reads like leftover template content. Also,
  `old/src/app/order/page.tsx` and `old/src/app/ordering/page.tsx` are near-duplicates (same
  form, same contact card) — looks like an abandoned rename, not two intentional pages. New site
  gets **one** contact/inquiry page.
- **Known gap:** both old order forms only `setTimeout`-simulated submission client-side — no
  real backend ever received them. Per `business_path.md` §2, confirm whether this is also true
  in production before assuming no leads were lost historically.

---

## 5. Project structure (single Next.js app)

```
elecio_website/
├── doc/                     # plan.md, journey.md, marketing_path.md, business_path.md, PDFs
├── media/                   # source photos/video — curated subset moves into /public or a CMS media table
├── old/                     # previous site — reference only, not imported directly
├── src/
│   ├── app/
│   │   ├── [locale]/        # next-intl locale segment: fa (default), en
│   │   │   ├── (marketing)/ # home hub, persona pages, product, software, tutorials, about, blog, contact, legal
│   │   │   └── admin/       # Refine admin (auth-gated, noindex)
│   │   └── api/             # Route Handlers: contact, download, admin CRUD, sitemap, og-image
│   ├── components/
│   │   ├── marketing/hero3d/ # procedural device renderer + hero (D6 superseded, see journey.md)
│   │   ├── layout/           # Header, Footer, LocaleSwitcher
│   │   ├── marketing/        # persona-page sections, blog components
│   │   └── admin/            # Refine resource components
│   ├── server/
│   │   ├── db/
│   │   │   ├── migrations/   # Knex migrations
│   │   │   ├── models/       # Objection models: Lead, ContactSubmission, DownloadRequest,
│   │   │   │                 # Post, Category, Tag, Partner, Testimonial, AdminUser
│   │   │   └── knexfile.ts
│   │   └── services/         # notification routing, validation, rate limiting
│   ├── lib/                  # shared utils, i18n config, seo helpers (JSON-LD, metadata)
│   └── styles/                # Ant Design theme tokens
├── public/
└── ...config files
```

---

## 6. Phases

Numbering is intentional and stable — `business_path.md` already cross-references specific phase
numbers (0, 1, 4, 6, 8, 9, 10+), so those anchors don't move even as task details fill in.

### Phase 0 — Discovery & Content/Asset Audit
**Status: mostly done via this session's audit (§4 above); remaining items are yours to confirm.**
- [x] Full audit of `old/` (pages, components, copy, specs) — done, see §4.
- [x] Audit `doc/*.pdf` catalogs — done, hardware/software specs extracted into §4.
- [x] Curate `media/` photos/videos — done 2026-08-06, by actually viewing the files (not
  guessing from filenames):
  - The 8 `ChatGPT Image ...png` studio renders are genuinely high quality — correct branding
    text, both black and white device variants, clean industrial backgrounds. **Launch-ready as
    primary product imagery** for the hero/product/persona pages; the earlier assumption that
    these might read as "synthetic" was wrong once actually viewed.
  - The 2 phone photos are also usable, not just "informal backup": one is a clean flat-lay
    (black vs white unit side by side), the other shows the real device mounted in an actual
    operating context with its OLED screen legible (IP address + live Wi-Fi network list) — good
    "this is real, not a mockup" proof shot, especially for the Operator persona page.
  - **Found a real defect worth fixing:** the *current live site's* own hero image
    (`old/public/landing/device.png`) is an AI-generated shot with garbled logo/button text
    ("ELEOO", "EUTCH", "SOAA" instead of ELECIO / ENTER / DOWN / UP) — a classic AI-image text
    artifact that shipped to production. The new `media/` renders don't have this problem and
    should replace it outright.
  - `old/public/about/*.jpg` are genuine origin-story prototype photos (bare PCB in a clear
    acrylic case, visible wiring, an early firmware string on the OLED) — authentic and valuable
    for the About/story page, not filler.
  - **New gap found:** `old/public/landing/devices.png` (used on the current site to represent
    the management software) is a generic/placeholder dashboard mockup — abstract gradient UI
    labeled "Vizzer," not an actual ElecIO Manager screenshot. **Real screenshots of ElecIO
    Manager (Windows/Android/Web) don't exist in this repo yet** and are needed before Phase 7's
    `/software` page ships with honest imagery.
  - Videos (`media/*.mp4`) not yet reviewed frame-by-frame — orientation/re-cut needs confirmed
    in Phase 3/marketing prep, per `marketing_path.md` §6.
- [x] Confirm the 4 partner companies still consent to being featured (per `business_path.md`
  §6). **Confirmed by user, 2026-08-06 — Phase 0 is now fully closed.**

### Phase 1 — Infrastructure & Foundations
- [x] Initialize Next.js (TypeScript, App Router) project at repo root — done 2026-08-06.
- [x] Knex config + Objection base model + 16 migrations for the application, identity, admin,
  CMS, and SEO schema — complete and converted to MySQL.
- [x] **Resolved 2026-08-13.** MySQL 8.0.45 on Ubuntu 24.04 now mirrors the target server. The
  dedicated `elecio_dev` database has all 16 migrations and the bundled bilingual content; the
  runtime account is DML-only and the locked migration account retains only `TRIGGER` privilege.
- [ ] Domain/DNS + hosting account (**[DECISION NEEDED]** Liara vs ArvanCloud vs VPS).
- [x] CI: lint + typecheck + build on push — `.github/workflows/ci.yml` added 2026-08-06 (will
  activate once this repo has a GitHub remote).
- [x] Env/secrets management, `.env.example` — done; see README for the one-time local setup.

### Phase 2 — Design System
- [x] `next-intl` scaffold: fa default + RTL, en secondary + LTR, locale switcher — done
  2026-08-06, verified serving correct `lang`/`dir`/content on both `/fa` and `/en`.
- [x] Base layout: Header/Nav, Footer (real contact info, legal links pending, socials) —
  done 2026-08-06, using Ant Design (`SiteHeader`/`SiteFooter`).
- [x] Ant Design theme — resolved 2026-08-07, though through iterative real-reference-based
  redesign rather than the originally-planned "present 2-3 directions upfront" process (worth
  naming honestly rather than quietly calling it equivalent). Landed on: solid confident white
  ground, a signal-blue accent (`#2f7fd6`), Vazirmatn (self-hosted, weights 400–900) for all
  Persian/UI text, Archivo Black reserved for the Latin wordmark and highlighted headline phrases.
  Glass/blur used deliberately in exactly one place (the floating nav pill), not throughout — see
  `journey.md` 2026-08-07 `.08` for the two earlier over-corrections (dark-only, then
  glass-everywhere) that got walked back based on direct feedback.
- [x] Dark/light: resolved as **light, solid** — not the old site's dark glassmorphism continued,
  and not round 2's dark-blue-glass direction either.

### Phase 3 — Homepage Hub & 3D Scroll Hero
**Status: done 2026-08-07 (revised again same day)** — materially different from how this phase
was originally scoped, and revised more than once as you reacted to real, running versions. Read
`journey.md` 2026-08-07 entries `.06` through `.11` for the full path; current state:
- [x] 3D approach: **Three.js, procedural geometry, no `.glb` loaded** — see D6. Not any of the 3
  originally-sketched concepts (signal-and-nodes / exploded-view / cable-to-wireless), and not the
  canvas-2D rasterizer of the previous revision either.
- [x] Hero **restructured into two pieces**, per your explicit direction that the product shouldn't
  be the first thing shown at the top:
  - `Hero` — photo-only top section (a real render from `media/`, no interactive 3D), normal
    in-flow, no scroll-hijacking.
  - `AboutProduct` — further down the page, id `about-product`. The device lives here, in a
    sticky section scroll-scrubbed through one full revolution (Apple `iphone-17` page cited
    directly as the reference for this mechanism), then holds and accepts drag-to-orbit. A
    perspective/rotateX/Y "tilt-in from 3D space" entrance transition on the canvas frame itself,
    distinct from the simple fade used by `RevealOnScroll` elsewhere.
- [x] Homepage as a **hub**: `Hero` → `AboutProduct` → numbered feature list (`FeatureList`,
  allys.mu-style) → persona selector (`PersonaGrid`, Deepgram-tab-style) → `PartnerStrip` → dark
  closing CTA (`FinalCta`) → footer.
- [x] Palette: **dark + blue** (round 5) — reverted from round 4's warm gold after explicit
  "more dark and blue" direction, drawn from the color language already present in your own
  supplied 3D-viewer file (`#080a0d` void, `#4aa0ff` LED blue) rather than inventing a new one, so
  the site and the product viewer read as one system.

### Phase 4 — Business Owner Persona Page
**Status: done 2026-08-07.**
- [x] ROI/downtime framing using the real "shift time − actual run time = time worth investigating"
  logic straight from the catalog page 6 (`RoiFormula` component) — a genuine, non-invented
  calculation, not marketing fluff.
- [x] Trust signals: warranty/update/support badges (`TrustBadges`), partner logo strip
  (`PartnerStrip`, real logos from `old/public/collab/`), 9 real customer installation videos
  hosted on Aparat (`VideoTestimonials` — real machine+controller+client titles pulled from
  `old/src/components/landing/CustomerSatisfactionSection.tsx`, not staged quotes). Refreshed
  stats (150+/450+/2.5M+/99.8%) still deliberately not shown — still blocked on
  `business_path.md` §6.
- [x] Primary CTA → external order page (per D1); secondary CTA → `/contact`.

### Phase 5 — Programmer/Technical-Office Page + Machine Operator Page
**Status: done 2026-08-07.**
- [x] **Programmer/Technical Office**: controller compatibility matrix (`ControllerMatrix`, real
  6 controllers from the catalog, including its own honest "final compatibility verified
  per-machine" caveat rather than overpromising), protocol/technical detail as a reused
  `FeatureList` against a `protocolSpecs` namespace (XON/XOFF+RTS/CTS, LSV2/TNC Server,
  dual-core simultaneous send, batch/group send). API/integration angle: none exists to document
  (ElecIO Manager has no public API per current knowledge) — not fabricated.
- [x] **Machine Operator**: `FeatureList` against an `operatorFeatures` namespace — simple
  interface, port protection, quick setup, automatic repeat — deliberately the least technical
  and most "this makes your shift easier" of the three persona pages.

### Phase 6 — Lead Capture & Core Backend
*Depends on `business_path.md` §2 (which channel real leads should route to).*
- [x] Objection models: `ContactSubmission`, `DownloadRequest` — done 2026-08-06. (No
  `NewsletterSubscriber` — not building it until it's actually decided to be used, per the "no
  speculative schema" principle.)
- [x] `POST /api/contact` — done 2026-08-06: validation via Objection `jsonSchema`, honeypot field,
  in-memory rate limiting (fixed-window, per-process — fine for the single-instance deployment in
  D2/D8, would need revisiting if this ever runs multi-instance), hashed-IP signal instead of
  storing raw IPs. Real `/contact` page + form wired end-to-end. **This is the fix** for the old
  site's simulated `setTimeout` non-submission (`journey.md` 2026-08-06.01) — **verified
  end-to-end** 2026-08-06: a real POST landed a real row in `contact_submissions` (id 1, deleted
  after verifying since it was test data, not a real lead).
- [x] `POST /api/download` — done 2026-08-07, same pattern as `/api/contact` (honeypot, rate
  limit, `jsonSchema` validation). Verified end-to-end via a real Playwright submission on
  `/software`'s new `DownloadForm`: real row inserted, real download URL returned and clickable.
  The two PDF resources (`catalog_pdf`/`features_pdf`) now serve real files copied into
  `public/downloads/` from `doc/`; the two installer resources still point at ElecIO Manager's
  existing release host (a separate product/release cycle, per §0 scope boundary).
- [ ] Notification routing to whichever destination `business_path.md` §2 settles on — currently
  just `console.info`s new submissions as a placeholder.
- [ ] Response-time expectation stated on-page once an SLA is decided.

### Phase 7 — Blog / SEO Engine + Admin CMS
- [ ] Objection models: `Post`, `Category`, `Tag`, `Author` (bilingual fields: `title_fa`/`title_en`
  or a structured translations table — decide shape here).
- [ ] Refine admin at `/admin` (`@refinedev/antd`): blog CRUD with TipTap editor, media
  upload/library, partner & testimonial management, leads inbox.
- [ ] SEO plumbing: dynamic `sitemap.xml`, `robots.txt`, per-page `metadata` (OG/Twitter cards),
  JSON-LD (`Organization`, `Product`, `Article`, `FAQPage` where relevant), `hreflang` fa/en pairs,
  auto-generated OG images for blog posts.
- [ ] Content strategy/calendar lives in `marketing_path.md`, not here — this phase builds the
  *machine*, not the *content plan*.

### Phase 8 — Admin Completion & Analytics
- [ ] Finish Refine admin: dashboard summary (leads this week, top blog posts, etc.).
- [ ] **[DECISION NEEDED]** PostHog vs GA4 — verify Iran reachability first (`business_path.md`
  §5).
- [ ] Conversion tracking wired to real events: form submits, PDF downloads, outbound clicks to
  the order page.

### Phase 9 — QA, Legal/Trust & Launch
Executes the launch checklist already defined in `business_path.md` §4 — not duplicated here,
that document is the source of truth for this phase's exit criteria. Summary only:
legal/trust footer (Enamad status, business registration), analytics verified reachable, all
persona pages + Home Hub signed off in both languages, Search Console + sitemap submitted, social
previews verified across LinkedIn/Instagram/Telegram, error/empty states designed (not default),
DB backup/rollback plan confirmed, external order link re-verified live.

### Phase 10+ — Post-Launch Roadmap (not v1)
- Evaluate absorbing checkout into the new site once there's real traffic/conversion data.
- Formalize the integrator/channel-partner pattern already visible informally (e.g. Sanat
  Pazhohan Parseh) — ties into `marketing_path.md`'s retention/advocacy loop.
- A/B testing on persona-page CTAs once there's enough traffic to make it statistically meaningful.
- Re-evaluate English-market depth based on actual international traffic (see
  `business_path.md` §7).

---

## 7. Templates & library reference (for you to browse, not a fait accompli)

You asked to see real options, not just my picks. These are the concrete, current (2026) starting
points behind the choices in §2–3:

- **Refine + Ant Design**: [refine.dev](https://refine.dev) — official `@refinedev/antd` package
  is the intended integration path for Phase 7/8's admin.
- **React Three Fiber**: [r3f.docs.pmnd.rs](https://r3f.docs.pmnd.rs) + `@react-three/drei` — the
  code-first 3D approach behind D6.
- **react-bits**: [reactbits.dev](https://reactbits.dev) — a fast-rising, framework-agnostic
  animated-component collection (CSS-based, pulls in GSAP/Three only where a component needs it).
  Worth browsing for Phase 3/marketing-page *flourish* pieces (text reveals, particle backgrounds)
  even though we're not adopting shadcn — these aren't tied to shadcn and can be adapted as
  standalone components without conflicting with Ant Design elsewhere on the page.
- **GSAP ScrollTrigger**: [gsap.com/scrolltrigger](https://gsap.com/scrolltrigger) — likely scroll
  orchestration engine for the Phase 3 hero, framework-agnostic.
- **next-intl**: [next-intl.dev](https://next-intl.dev) — App Router-native i18n, behind D7.
- **TipTap**: [tiptap.dev](https://tiptap.dev) — blog editor behind the Phase 7 admin.
- **shadcn/ui RTL docs**: [ui.shadcn.com/docs/rtl](https://ui.shadcn.com/docs/rtl) — kept here for
  reference only since D4 went with Ant Design; worth a skim regardless since the *pattern* it
  documents (logical CSS properties, `dir`-aware components) is good practice no matter which kit
  you're in.

If any of these turn out to feel wrong once you actually look at them, that's a normal outcome of
"choosing openly" — flag it and we revise the Decision Log, not just silently patch around it.

---

# Addendum — Account, OTP, Admin, Blog, SEO, and Security Expansion

**Added:** 2026-08-13. **Status:** proposed expansion for owner review; it does not overwrite or
silently revise the original v1 plan above. Where this addendum expands the original scope (most
notably public customer accounts), implementation starts only after the owner approves the stated
decisions. The original Phase 0–10+ plan remains preserved as the historical baseline.

## A1. Proposed expansion decisions

| # | Proposed decision | Reason |
|---|---|---|
| A-D1 | Use **Better Auth** with the existing MySQL database; keep Knex/Objection for application models and review/version auth schema changes as Knex migrations. | Avoid hand-building session/authentication security while remaining inside the existing Next.js application. |
| A-D2 | Customers use phone-first OTP. Staff use a separate invite-only email/password or passkey flow with mandatory MFA; never public admin registration or SMS-only admin access. | Customer convenience and privileged staff security have different threat models. |
| A-D3 | Implement an `SmsProvider` adapter and start with Kavenegar Verify/Lookup only after delivery, template, cost, and SLA tests. Use the provider dashboard for billing/templates; the Elecio admin shows only redacted delivery health. | Avoid rebuilding telecom infrastructure and keep provider replacement possible. |
| A-D4 | Keep **Refine + Ant Design** for `/admin`; reject `eee7654/esima-builder` as a production dependency. | Refine matches the locked UI stack and current models; the reviewed repository is an unfinished page-builder demo without a complete backend or license. |
| A-D5 | Keep the blog **native Next.js + MySQL**. WordPress remains a fallback only if future editors require WordPress-specific workflows/plugins. | The bilingual schema already exists; WordPress adds another runtime, database, patch surface, API, caching, and webhook layer without an inherent SEO advantage. |
| A-D6 | Use one authoritative identity system. Migrate/supersede the password-bearing `admin_users` scaffold before production data, preserving author attribution through an application profile/role mapping. | Two password/session systems duplicate recovery, authorization, audit, and incident-response risk. |
| A-D7 | Enforce server-side least-privilege RBAC: `customer`, `support`, `editor`, `admin`, `owner`. Refine/CASL visibility is UX only. | Every protected query and mutation must validate the live session, action, object, and ownership at the server. |
| A-D8 | Auth/admin/blog launch requires staging security, accessibility, RTL/LTR, performance, backup/restore, audit-log, and monitoring exit gates. | These features add PII, privileged mutations, uploads, public rich content, and billable abuse paths. |

Owner decisions needed before implementation:
1. Customer-account v1 value: recommended profile, protected downloads, and support-request
   history. Do not add empty order/device areas until their authoritative systems are integrated.
2. Existing SMS provider or approval to trial Kavenegar; provide credentials, approved OTP template,
   test numbers, and spend/rate limits through secret storage—not Git.
3. Registration policy: recommended OTP verification plus terms/privacy consent, followed by short
   name/company profile completion.
4. Initial owner/staff accounts and final role matrix (see A4).
5. Object-storage provider and analytics choice after production-region availability/privacy tests.

## A2. Proposed implementation phases

### Expansion Phase 1 — Identity and abuse-control foundation
- [x] Install Better Auth at `/api/auth/[...all]` with MySQL. Generate and review its schema, then
  commit reversible Knex migrations instead of running unreviewed production auto-migrations.
- [x] Consolidate the current `admin_users` scaffold into one identity authority; add application
  profiles, role mapping, consent/version timestamps, and canonical normalized phone storage.
- [x] Add Redis-compatible shared state for auth/SMS and an atomic reusable limiter. The original
  contact/download limiter remains until those routes are intentionally migrated; auth never uses
  that process-local `Map`. Trusted IP headers remain unset/fail-safe until the host is selected.
- [x] Add append-only redacted audit events for authentication and privileged mutations. Never record
  passwords, session tokens, OTPs, API keys, or full sensitive payloads.

**Exit gate:** forward/rollback migrations pass on staging data; no duplicate auth store remains;
role matrix, PII inventory, threat model, secrets, and backup plan are approved.

**Implementation status (2026-08-13): complete in code and local development database.** The
migration passed apply → inspect → rollback → inspect → reapply; unit tests, typecheck, lint,
production build, and dependency audit all pass. Production deployment still requires the owner/
infrastructure inputs in A1 (real secrets, Redis, proxy headers, backup/restore rehearsal, retention
approval). See `doc/identity_foundation.md` and `journey.md` entry 2026-08-13.03.

### Expansion Phase 2 — Customer login, registration, logout, OTP, and account
- Add localized login/verify/account/profile/security pages and explicit current/all-session logout.
  A verified first OTP may create the customer account; do not require an unnecessary password.
- OTP policy: cryptographically secure, short TTL (target two minutes), single use, resend replaces
  the prior code, maximum three verification attempts, cooldown and daily caps by phone/IP/purpose,
  generic enumeration-resistant responses, and no OTP logging.
- Implement the SMS adapter with typed timeouts/errors, redacted delivery audit, safe retry rules,
  provider outage behavior, a non-sending development adapter, and a registration/SMS kill switch.
- Use Secure/HttpOnly/SameSite cookies, HTTPS, session rotation, absolute/idle expiry, server
  validation, and revocation. Never place sessions/tokens in `localStorage`.
- UX must accept Persian/English digits but normalize internally; support paste/autofill, mobile
  numeric keyboards, edit-number, accessible resend timer, masked phone, errors/offline/provider-
  down states, keyboard/screen readers, RTL/LTR, reduced motion, and narrow devices.
- Account v1 exposes only real capabilities: profile/consent, protected downloads, support history,
  active sessions, revoke-all, and account deletion/request workflow.

**Exit gate:** tests cover success, wrong/expired/replayed OTP, resend, attempt/rate caps, provider
timeout, enumeration, CSRF/origin, session fixation/rotation, logout, and ownership; staging SMS
delivery and mobile/accessibility QA pass.

**Implementation status (2026-08-13): code and local schema complete; external release gate open.**
Localized OTP/account UI, guarded gateway routes, Kavenegar and non-sending adapters, shared abuse
limits, signed HttpOnly flow state, origin checks, versioned consent, profile/history/session/logout,
and deletion requests are implemented. Migration `20260813000011` passed local apply → rollback →
reapply; unit tests, typecheck, lint, production build, and production dependency audit pass. The
phase is not production-approved until real Kavenegar staging delivery, isolated end-to-end abuse/
replay/session tests, physical mobile/accessibility QA, legal text/retention approval, and production
secrets/Redis/proxy configuration pass the exit gate. See `doc/customer_account.md` and journey
entry `2026-08-13.04`.

### Expansion Phase 3 — Staff authentication and Refine admin
- Build noindex `/admin/login` and `/admin`; protect every page/API server-side. Staff onboarding is
  owner-invite-only with verified email, strong password or passkey, MFA/recovery, shorter sessions,
  and re-authentication for roles/security/destructive actions.
- Implement the A4 permission matrix in APIs and mirror it in Refine for usable navigation.
- Admin modules: actionable dashboard, posts/categories/tags/media, leads/download requests,
  partners/testimonials, customers/support, staff invitations/roles, redacted SMS health, audit log.
- Provide locale-aware editor/status filters, search, saved filters, preview, autosave state,
  unsaved-change guard, guarded bulk/destructive actions, and complete error/empty/loading states.

**Exit gate:** every role/resource/action has server authorization tests; invite/MFA/recovery/session
revocation works; forbidden responses leak no resource existence; all mutations are attributable.

**Implementation status (2026-08-13): code and local schema complete; production gate open.**
Invite-only credential enrollment, verified-email acceptance, mandatory TOTP/recovery codes,
account lockout, password recovery, 12-hour staff sessions, owner bootstrap, recent-auth checks,
target-session revocation, server RBAC, noindex localized admin shell, and operational modules for
dashboard/leads/content/media/customers/staff/providers/audit are implemented. Migration 12 passed
local apply → rollback → reapply; 11 unit security/RBAC tests, typecheck, lint, production build,
and production dependency audit pass. Phase 4 remains responsible for the secure upload and native
rich-content/revision pipeline rather than exposing unsafe Phase 3 placeholders. Production release
still requires real email delivery, complete isolated endpoint/role matrix tests, authenticator and
recovery drills, physical accessibility QA, monitoring, and infrastructure configuration. See
`doc/staff_admin.md` and journey entry `2026-08-13.05`.

### Expansion Phase 4 — Native blog CMS and public blog
- Extend existing posts with revisions, scheduling, redirect/slug history, translation completeness,
  localized alt/caption data, and updated-by. Use validated TipTap JSON as source with deterministic
  rendering and strict allowlist sanitation—never arbitrary editor HTML.
- Add media picker and secure object-storage pipeline: authorized upload, extension/MIME/signature/
  size/dimension checks, generated names, metadata stripping, image re-encoding/responsive variants,
  CDN caching, and reference-aware deletion.
- Build server-rendered `/[locale]/blog` and `/[locale]/blog/[slug]`, adding category/search pages
  only when content volume justifies them. Revalidate cached content on publish/unpublish.
- Provide readable localized articles, accurate author/date, breadcrumbs, optional long-article TOC,
  real taxonomy-based related content, copy-link, restrained CTA, and proper 404/empty/error states.

**Exit gate:** drafts cannot leak; previews expire; schedules respect timezone; rich content cannot
execute scripts; redirects/locales/canonicals pass tests; editors can publish/revise/rollback alone.

**Implementation status (2026-08-13): code and local schema complete; production gate open.**
The native bilingual journal, TipTap JSON editor, strict server sanitizer/deterministic renderer,
immutable revisions and restore-as-new-draft, schedules, translation completeness, permanent slug
history, expiring hashed previews, localized metadata/Article JSON-LD, and guarded image
decode/re-encode pipeline are implemented. Migration 13 passed apply → rollback → reapply; 14 unit
security/content tests, typecheck, lint, production build, and production dependency audit pass.
Patched Sharp 0.35.3 replaced a vulnerable first selection. Production release still requires
persistent/object storage, upload attack tests/malware policy, isolated CMS concurrency and endpoint
authorization tests, timezone/SEO validation, and physical accessibility/editor QA. See
`doc/native_blog_cms.md` and journey entry `2026-08-13.06`.

### Expansion Phase 5 — SEO, UI/UX, accessibility, and performance
- Execute A5 and A7 across all public/auth/account/blog/admin routes in fa/en, light/dark, mobile/
  tablet/desktop, keyboard/screen reader, reduced motion, and slow-network conditions.
- Establish performance budgets; lazy/pause WebGL, cap quality on constrained devices, serve
  correctly-sized AVIF/WebP, reserve dimensions, subset fonts, minimize client boundaries, and test
  on representative low/mid-range Android hardware.
- Add privacy-reviewed analytics without PII for meaningful conversions and product/account use.

**Exit gate:** no critical SEO/accessibility issue; mobile performance budgets, structured data,
metadata/social cards, localization, and analytics privacy checks pass.

**Implementation status — 2026-08-13:** repository scope complete. Canonical/robots/database-backed
sitemap/social metadata and translation-safe article alternates are implemented; public animation,
WebGL, responsive image, focus/modal, reduced-motion, theme-token, and aggregate opt-in analytics
paths are hardened. Migration 14 passed apply -> rollback -> reapply. 15 unit tests, typecheck and
lint pass; production build/audit results are recorded in the matching journey entry. Physical
mobile/AT checks, deployed CWV, live structured-data/canonical validation, and consent delivery on
the real origin remain deployment gates. See `doc/phase5_seo_ux_performance.md` and
`doc/ui_issue_register.md`.

### Expansion Phase 6 — Security, operations, and staged launch
- Execute A6 in production-like staging. Add dependency/secret/static scanning, manual authorization/
  abuse tests, CSP report-only tuning before enforcement, and upload/rich-text attack testing.
- Perform encrypted backup/restore and migration rollback drills. Document provider outage, SMS abuse,
  compromised account, key rotation, staff offboarding, content rollback, and incident response.
- Alert on auth/lockout spikes, SMS spend/delivery anomalies, privilege changes, forbidden-access
  bursts, upload/DB/route errors, backup failures, and uptime; keep logs structured and redacted.
- Complete privacy/terms/retention/deletion/consent documentation with appropriate local legal review.
  Roll out staff-only → small customer pilot → general release with tested kill switches.

**Exit gate:** no unresolved high-severity finding; restore/rollback/kill switches are proven;
owner signs the launch report and production smoke tests/alerts pass.

## A3. External repository review: `eee7654/esima-builder`

**Verdict: do not use it as Elecio's admin panel or copy its code into this project.** It may be a
personal experiment worth watching, but it is not a professional template we can responsibly base
the production CMS/security boundary on today.

Evidence reviewed on 2026-08-13:
- Repository created 2026-04-21, zero stars/forks, no releases, no declared license, no description,
  and the README is still the untouched Turborepo starter README. No license means there is no
  clear permission to copy, modify, and distribute its code even though the source is public.
- It is a monorepo containing a Puck-like visual page-builder package and a panel demo, not a
  complete admin/CMS product for this domain.
- Its builder demo reads and writes `esima-builder-demo` in browser `localStorage`; it does not
  publish versioned content to a database or Next.js site.
- The panel contains a Better Auth *client* pointing at `NEXT_PUBLIC_API_URL`/localhost port 4000
  and service wrappers for an external `/api/v1/panel` backend, but that backend is not in the
  repository. Its proxy only handles locale redirects. The repository therefore cannot supply a
  self-contained security or authorization boundary.
- It has no Elecio blog workflow, bilingual post schema integration, leads inbox, media security,
  audit log, SMS provider, OTP operations, tests, deployment runbook, or migration path.

Professional options considered:

| Option | Fit here | Decision |
|---|---|---|
| Build every admin widget from scratch | Maximum visual control, maximum time and security/CRUD mistakes | Reject |
| Refine + Ant Design over our Route Handlers | Matches the locked UI kit and existing models; gives CRUD/data/auth/access-control primitives while keeping server ownership | **Recommended/current decision** |
| Payload CMS inside Next.js | Strong content-first product and a reasonable greenfield option, but would replace/duplicate the existing Knex/Objection schema and admin direction | Keep as fallback only if editorial workflow requirements outgrow Refine |
| Headless WordPress | Mature editor/plugin ecosystem, but a second platform/database/patch surface and cache/webhook integration | Use only if WordPress-specific editorial needs become mandatory |
| `esima-builder` | Early visual-builder demo, missing backend/license/production proof | Reject |

Reference links: [reviewed repository](https://github.com/eee7654/esima-builder),
[Refine's official Next.js integration](https://refine.dev/core/docs/routing/integrations/next-js/),
and [Better Auth's official Next.js integration](https://better-auth.com/docs/integrations/next).

## A4. Target application and permission architecture

```text
Browser
  ├─ Public marketing/blog (server-rendered, cacheable)
  ├─ Customer auth/account (phone OTP, protected)
  └─ Staff admin (invite + MFA, protected, noindex)
             │
             ▼
Single Next.js 16 application
  ├─ Better Auth route/session validation
  ├─ Public and protected Route Handlers / Server Actions
  ├─ Server-side RBAC + ownership checks
  ├─ Refine admin client (UX/data orchestration only)
  └─ Publish/revalidation + audit services
       │          │              │
       ▼          ▼              ▼
    MySQL     Redis-compatible   Object storage/CDN
 identities, shared rate limit,  validated media
 content,    OTP abuse limits
 audit
       │
       ▼
 SMS provider adapter → Kavenegar Verify/Lookup initially
```

Permission rules that must be encoded once and tested at the server boundary:

| Resource/action | Customer | Support | Editor | Admin | Owner |
|---|---:|---:|---:|---:|---:|
| Own profile/sessions/support | Own only | Assigned/read-limited | No | Support operation | Support operation |
| Posts/categories/tags/media | Published read | Published read | CRUD/preview/publish as granted | Full | Full |
| Leads/download requests | Own history only | Assigned/redacted | No | Full operational | Full |
| Partners/testimonials | Published read | Published read | Edit if granted | Full | Full |
| Customer users | Own account | Redacted support actions | No | Suspend/support; no owner grants | Full policy actions |
| Staff invitations/roles | No | No | No | View; limited invite if granted | Full |
| Integrations/secrets/security | No | No | No | Health only | Configure/rotate |
| Audit events | Own security events | Relevant subset | Own actions | Broad read | Full read/export |

Separation rules:
- Role values submitted by a browser are ignored; roles come from the validated server session and
  database.
- List queries and item queries apply the same scope. Knowing an object ID never grants access.
- Secrets are not returned through admin APIs. Provider configuration screens show only presence,
  last rotation, and health.
- Owner deletion/demotion requires re-authentication, confirmation, an audit event, and at least one
  remaining owner.

## A5. Complete SEO plan

### 10.1 Baseline and measurement
- Before content changes, record indexed URLs, queries, clicks, impressions, backlinks, crawl
  errors, current rankings for Persian/English commercial and support terms, and Core Web Vitals.
- Configure Google Search Console and Bing Webmaster Tools for the canonical production domain;
  submit sitemaps only after canonical/redirect rules are stable. Keep a monthly dashboard that
  separates branded, non-branded, product, controller-compatibility, and support intent.
- Define conversion events and business outcomes before publishing: qualified contact, catalog
  download, order-site click, support resolution, and article-assisted product interest.

### 10.2 Information architecture and keyword intent
- Maintain one canonical page per intent. Product/specification content belongs on product pages;
  how-to/troubleshooting content belongs in articles; avoid several thin pages targeting the same
  phrase.
- Build topic clusters around real customer questions: DNC fundamentals; Fanuc/Siemens/Heidenhain/
  Mitsubishi/Haas/Charmilles transfer workflows; RS-232, XON/XOFF, RTS/CTS, LSV2/TNC Server;
  backup/reporting; common CNC transfer failures; shop-floor networking; and buyer comparisons.
- Research Persian phrases with real Search Console/query data and customer/support language;
  English content is independently edited, not mechanically translated filler.

### 10.3 Crawl, index, canonical, and localization
- Use stable lowercase Latin slugs where practical and permanent redirects when a published slug
  changes. One URL returns one status: `200` for live, `301/308` for permanent moves, useful `404`
  or `410` for gone content—never soft-404 every missing article to the blog homepage.
- Generate `robots.ts` and database-backed `sitemap.ts`; include canonical public `200` pages and
  published articles only. Exclude auth, account, admin, preview, API, search results, drafts, and
  internal filters.
- Each fa/en equivalent declares a self-canonical plus reciprocal `hreflang` alternates. Do not
  create an English alternate until the English article actually exists and is useful. Keep locale
  selection user-controlled rather than forced IP redirects.
- Prevent duplicate query/filter URLs from indexing and define pagination behavior once article
  volume requires it.

### 10.4 Page metadata and structured data
- Every indexable route has a unique localized title, description, canonical, OG/Twitter image,
  and meaningful share copy. Generate article metadata from published DB content via
  `generateMetadata`; provide safe global fallbacks, never duplicate placeholders.
- JSON-LD: `Organization`/`WebSite` site-wide where accurate; `Product` on the actual product page;
  `Article` on posts; `BreadcrumbList` for real breadcrumbs; `VideoObject` for owned/embedded video
  with complete fields. Add `FAQPage` only when the visible page really contains eligible FAQs;
  schema must match visible facts and must never invent reviews, prices, availability, or ratings.
- Validate representative URLs in Google's Rich Results Test and Schema.org validator after every
  schema change.

### 10.5 Content quality and editorial controls
- Every article has one accountable author/reviewer, publish/update dates, first-hand Elecio or
  controller experience, cited source manuals where needed, original diagrams/screenshots, useful
  alt text, and a clear update/review cadence.
- Editorial checklist: search intent, factual/technical review, unique value, heading hierarchy,
  internal links, external primary references, image rights/credits, localized metadata,
  canonical/slug, preview on mobile, and a relevant next action.
- No mass-generated thin pages, keyword stuffing, fake freshness, doorway controller pages, or
  translated pages published only to increase URL count.

### 10.6 Internal links, off-page trust, and maintenance
- Link from high-authority product/software/controller sections to the best supporting articles and
  back from articles to the precise product/support destination. Use descriptive anchors and
  breadcrumbs, not repeated “click here.”
- Earn links through genuinely useful controller setup guides, diagrams, compatibility references,
  original field findings, partner case studies, and updated downloadable documentation. Do not buy
  bulk links.
- Monthly: indexing/coverage, query/content gaps, broken links, redirects, Core Web Vitals, rich-
  result errors, conversions, and decaying articles. Quarterly: prune/merge/update thin or competing
  content and retest localized alternates.

Primary guidance: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[localized versions/hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions),
[Google Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article),
[Next.js metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images), and
[Next.js sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).

## A6. Security review checklist

This is the required review scope, not a claim that the current app already passes it.

1. **Threat model and data inventory:** assets, actors, trust boundaries, PII, provider data,
   administrator powers, likely abuse cases, retention, deletion, and breach impact.
2. **Authentication/OTP:** secure randomness; short TTL; one-time use; resend invalidation; strict
   attempt/send limits; no OTP logs/plaintext persistence; enumeration resistance; SIM-swap/social-
   engineering awareness; MFA/passkeys for staff; recovery and offboarding.
3. **Sessions/cookies:** server-side validation; high-entropy identifiers; Secure/HttpOnly/SameSite;
   rotation after login/privilege change; absolute/idle expiry; revoke current/all; no auth tokens in
   `localStorage`; CSRF/origin protections; trusted redirect allowlist.
4. **Authorization:** default deny; server RBAC; object/field ownership; tenant/organization scope if
   later added; mass-assignment protection; consistent list/detail/export rules; re-authentication
   for sensitive actions.
5. **Input/output/content:** strict schemas and length limits; normalize before validate; parameterized
   queries; context-aware output encoding; rich-text allowlist sanitization; safe URL protocols;
   protect against stored/reflected/DOM XSS and injection.
6. **Uploads/media:** authorized upload; extension/MIME/signature allowlist; dimensions and byte
   limits; generated name; re-encode images; strip metadata; malware/CDR where relevant; isolated
   object storage; no execution; safe SVG policy (reject or sanitize/rasterize); CSRF protection.
7. **API/abuse:** shared rate limits by action/IP/account/phone; body/time/concurrency limits;
   pagination caps; idempotency where needed; resource-exhaustion controls; bot protection after
   measured abuse; no sensitive data in errors; SSRF-safe outbound integrations.
8. **Admin:** separate invite-only flow; MFA; least privilege; short sessions; re-authentication;
   append-only audit; role-change alerts; noindex; no secret display; protect exports and bulk/
   destructive actions.
9. **Infrastructure/secrets:** HTTPS/HSTS; CSP, frame, MIME, referrer, permissions and cross-origin
   headers; trusted proxy configuration; least-privilege DB/provider credentials; encrypted secret
   storage/rotation; separate dev/staging/prod; origin not bypassing CDN/WAF controls.
10. **Dependencies/build:** locked dependencies; automated vulnerability and secret scanning;
    reviewed updates; production source-map policy; CI protected branches; artifact provenance;
    no test/debug endpoints or default credentials.
11. **Database/backups/privacy:** least-privilege role; TLS where applicable; encrypted backups;
    point-in-time/restore testing; migration rollback; deletion/retention jobs; masked staging data;
    restricted access and audited exports.
12. **Monitoring/response:** structured redacted logs; request/correlation ids; alerts for auth/SMS/
    privilege anomalies; time sync; runbooks and contacts; tested account/session/key revocation;
    backup restore and content rollback.

Use [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html),
[MFA/OTP handling](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html),
[Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html),
[CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html),
[File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), and
[OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) as the audit
baseline. Better Auth's [security](https://better-auth.com/docs/reference/security),
[rate-limit](https://better-auth.com/docs/concepts/rate-limit), and
[phone-number plugin](https://better-auth.com/docs/plugins/phone-number) configuration must also be
reviewed against the actual deployed proxy and SMS provider.

## A7. Aesthetic, UI, UX, and accessibility review backlog

### Site-wide
- Re-audit every public section in both themes; eliminate dark-only hardcoded surfaces/text and
  confirm contrast for normal, muted, link, focus, disabled, hover, and error states.
- Re-test the top bar/header at 320, 360, 390, and 430px in fa/en. Keep logo, primary action,
  locale/theme controls, and menu usable without clipping or horizontal scroll; one mobile menu,
  not two competing navigation bars.
- Normalize section rhythm, content width, heading scale, button hierarchy, icon language, card
  radius/shadow, and image aspect ratios. Remove sections that repeat the same claim or CTA.
- Ensure floating product navigation and account/admin controls never cover content, browser UI,
  form actions, cookie notices, or safe-area insets.
- Every interaction has visible focus, keyboard order, accessible name, minimum target size, and
  non-color state. Respect reduced motion and provide a coherent experience without animation.

### Performance/scroll flow
- Profile lag on representative mobile hardware, not only desktop emulation. Audit long main-thread
  tasks, layout/paint, passive scroll listeners, sticky compositing, huge blurred layers, image
  decoding, font swaps, and WebGL frame time.
- Lazy-mount the procedural 3D scene near viewport; stop its animation/render loop off-screen or
  when the tab is hidden; cap device pixel ratio and quality on constrained devices; provide a
  static image fallback for reduced motion, unsupported WebGL, or sustained low performance.
- Compress and resize every raster for its rendered dimensions, serve AVIF/WebP with responsive
  `sizes`, and never download multi-megabyte originals for small cards. Keep width/height to prevent
  layout shifts.
- Prefer CSS transforms/opacity for transitions, avoid scroll handlers that cause React state on
  every pixel, and remove decorative effects whose cost is not visible value.

### Auth/account
- One focused card/page per step; clear phone format; “edit number”; 6-slot visual OTP backed by
  one accessible input; paste/autofill; resend countdown; precise recovery action; no ambiguous
  “create account vs login” duplication in a first-use OTP model.
- Explain why the number is needed and how it is used before sending. Show masked phone afterward.
  Keep errors helpful without revealing whether another person's account exists.
- Account navigation stays small until features exist. Do not ship empty Order, Device, Billing, or
  Notification sections as placeholders.

### Blog
- Blog index needs a useful editorial hierarchy, not a generic card wall: featured/current guide,
  clear topic navigation, consistent covers, localized dates/digits, and scan-friendly excerpts.
- Article layout uses comfortable reading measure, strong Persian typography, logical heading
  hierarchy, accessible code/table overflow, useful figure captions/alt text, and a restrained
  product/support CTA.
- Search/filter controls appear only with enough content; no dead categories or empty tag archives.

### Admin
- Optimize for trustworthy work: status and locale are always visible; save/publish are distinct;
  preview is one action away; autosave/last saved state is clear; validation points to the exact
  field; dangerous actions are separated.
- Tables support keyboard use, useful density, sorting/filtering, persisted views, pagination, and
  empty/error/retry states. Mobile may switch dense tables to summaries, but must still allow urgent
  review/approval tasks.
- Dashboard contains tasks and anomalies—not decorative charts. Prioritize drafts needing review,
  failed SMS/provider health, new leads, stale support items, and security events.

### Review deliverable before implementation polish
Create a page-by-page issue register with screenshot, locale/theme/viewport, severity, user impact,
recommended change, and acceptance test. Triage: blockers (security/accessibility/broken task), high
(mobile/performance/clarity), medium (consistency), low (decorative polish). Do not mix this audit
with feature implementation commits unless the issue blocks that feature.

## A8. Admin operations and initial editorial content — implemented 2026-08-13

- Complete the operational admin navigation for dashboard, leads, customers, staff/invitations,
  integrations, audit, content, media, and the content library under the existing RBAC model.
- Provide bilingual article create/edit/draft/publish/schedule/preview/revision/delete workflows with
  taxonomy selection, SEO fields, safe rich content, cover metadata, and cache revalidation.
- Provide create/edit/activate/delete management for categories, tags, partners, and testimonials.
- Provide an independent media library with optimized upload, localized metadata, usage protection,
  and deletion of unused local assets.
- Seed five idempotent, substantial Persian/English CNC articles with categories, tags, cover images,
  SEO metadata, publication dates, and initial immutable revisions.
- Keep production authentication fail-closed. Permit the requested disposable local super-admin only
  when development mode and `ALLOW_INSECURE_DEV_ADMIN=true` are both present; the alias
  `admin@admin` maps to its valid internal email and bypasses MFA only for this one local identity.
- Acceptance: typecheck, lint, tests, production build, repeatable seed, both-language public article
  responses, local sign-in/status, and every authorized admin route must pass.
