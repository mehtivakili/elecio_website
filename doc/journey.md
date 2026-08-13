# Elecio Smart DNC — Project Journey

This is the append-only narrative log of the rebuild: what we found, what we decided, why, and
what changed our minds later. It's written for you (and future-me) to read top to bottom and
reconstruct the story — not just the current state.

**One rule: entries are never edited after the fact.** If a decision here turns out wrong, a later
entry supersedes it explicitly (linking back to the entry it replaces) — the old entry stays,
because it's still true that it's what we believed *at the time*.

This is distinct from (and complements) the repo's `dev-journal` Claude skill, which — once
implementation starts — will keep a fine-grained, per-code-change technical audit trail at
`docs/dev-journal/`. Think of it as: **this file (`journey.md`) is the story for humans**, phase by
phase and decision by decision; `docs/dev-journal/` will be the line-level "why did this specific
commit do this specific thing" record once we're writing code. Both matter; they serve different
questions.

Companion docs: [`plan.md`](./plan.md) (current technical plan), [`business_path.md`](./business_path.md)
(business decisions), [`marketing_path.md`](./marketing_path.md) (go-to-market plan).

---

## [2026-08-06.01] Project kickoff — full audit of existing project, architecture decisions locked

**Trigger:** You asked for a complete revision of the Elecio website (backend + frontend), starting
with a plan rather than jumping into implementation. You were explicit about several things that
shaped how this session went: you don't want a 100%-AI-generated result and want to make the
critical calls yourself; you want premade tools/templates instead of reinventing things like the
admin panel; Postgres + Objection.js + Knex is a hard requirement, not a suggestion; you want a
scroll-driven 3D hero; you want persona-specific pages for business owners, programmers, and
machine operators; you want a blog for SEO; and you want this documented in `doc/plan.md`,
`doc/journey.md`, and `doc/marketing_path.md` as we go.

### What I found before asking anything

This repo was **not** a blank slate. `doc/business_path.md` already existed, written by an earlier
session, containing real, specific business research — not placeholder content. It referenced a
`plan.md`, a `marketing_path.md`, and a `journey.md` that didn't actually exist in the repo yet
(only `business_path.md` and two product PDFs were present in `doc/`). Git history showed exactly
one commit ("Initial commit from Create Next App"), with the original `create-next-app` scaffold
files already deleted from the working tree and an `old/` directory holding what looks like that
same scaffold fully built out into a real site. In other words: someone (an earlier session, or
you) had already started this exact process — audit the old site, write `business_path.md` — and
then it stopped before the technical plan got written down. This session picks that up rather than
starting over.

Full audit of `old/` (a Next.js 16 / React 19 / Ant Design 6 / Tailwind 4 site) plus the two PDF
catalogs in `doc/` turned up real product facts, not just page structure — summarized in `plan.md`
§4 rather than repeated here. The single most useful discovery: **the product's own printed
catalog already segments its buyers into exactly three roles** — owner/CEO, programmer/technical
office, CNC operator — on its very first page. That independently validated the persona-page
structure you'd asked for; it isn't something I invented to sound thorough, it's the business's
own existing segmentation, which makes it a much safer bet than a generic "3 personas" template
would have been.

Also found: two near-duplicate pages (`old/src/app/order/page.tsx` and `.../ordering/page.tsx`)
that look like an abandoned rename rather than two intentional pages, both of which only
`setTimeout`-simulated form submission with no real backend ever receiving it; and one dead
component (`FeaturesSection.tsx`) with generic IoT/AI copy that's never actually imported by the
homepage — looks like leftover template content, not real product messaging. Neither gets carried
forward.

### Decisions made this session

Four architecture decisions were pivotal enough (expensive to reverse, and you'd explicitly asked
to be consulted on exactly this kind of call) that I did current-state research first, then
presented them as real options rather than deciding silently. Full reasoning is in `plan.md` §2
(Decision Log); summarized here:

- **3D hero** → custom React Three Fiber scene (your choice, over Spline or a CSS-only
  "pseudo-3D" approach). Matches your original ask most literally; concept still open, three
  candidate directions sketched in `plan.md` Phase 3 for us to react to together.
- **UI/component system** → kept **Ant Design** (your choice, over migrating to shadcn/ui, despite
  shadcn having just gained first-class RTL support in January 2026 — worth knowing about even
  though we didn't take it). This turned out to reinforce the next decision rather than compete
  with it.
- **Admin/CMS** → **Refine**, specifically because it has an official, first-class Ant Design
  integration (`@refinedev/antd`) — so choosing Ant Design in the previous decision made Refine
  the *best-supported* choice here, not just an acceptable one. Avoids hand-building CRUD for
  blog posts, leads, and partner content.
- **Backend framework** → you overrode the framed options (Fastify/NestJS/Express) with a cleaner
  answer: **the whole project in Next.js**, full-stack, no separate API service. This is a
  legitimate architecture (not a downgrade) given there's no second consumer of the API — ElecIO
  Manager, the actual device-management software, is a wholly separate system this project
  doesn't touch. Logged as D2/D8 in `plan.md`.

Database stack (Postgres + Knex + Objection.js) was never in question — your explicit requirement,
logged as D3.

### Reasoning — why research before asking

Given the number and cost of these decisions, I ran current-web-search checks (this is 2026;
library recommendations from training data alone risk being stale) on: R3F scroll-hero examples,
shadcn RTL status, Refine vs React-Admin vs AdminJS, Fastify vs NestJS vs Express, and Iranian
hosting options — before presenting choices, so the options you were choosing between reflected
actual current tradeoffs rather than my defaults. Sources are cited inline in `plan.md` §7.

### Risks / follow-ups

- `plan.md` §6 carries several `[DECISION NEEDED]` items that block specific phases (hosting
  provider, analytics tool, several from `business_path.md`) — none of them block starting Phase 0/1
  work, but they need answers before those phases can close.
- The 3D hero concept (three candidates sketched) still needs your reaction before Phase 3 starts
  for real — deliberately left open rather than picked for you.
- Media curation (`media/` folder: informal phone photos vs AI-generated product renders) needs a
  brand-tone call — flagged in `plan.md` Phase 0, not resolved here.

---

## [2026-08-06.02] Phase 0 closed out — actually looked at the media files instead of guessing from filenames

**Trigger:** You replied "0" to the end-of-kickoff options, read as "do Phase 0." Two items were
still open there: media curation and partner-consent confirmation. The second needs you to
actually contact the partner companies, so it stays open. The first I could do myself — I have
image-reading access, so I viewed a representative sample of `media/` and `old/public/` directly
instead of inferring quality/tone from filenames, which is what `plan.md`'s Phase 0 checklist had
been doing until now.

### What actually looking at the files changed
`plan.md`'s original Phase 0 note assumed the 8 `ChatGPT Image ...png` renders and the 2 phone
photos represented a "polished/synthetic vs. authentic/workshop" tension that would need a brand-
tone decision to resolve. That was wrong. Viewed directly: the renders are genuinely high-quality
studio-grade product shots (correct branding text, both black/white variants) — launch-ready, not
a synthetic-feeling compromise. The phone photos aren't a lesser fallback either — one of them
shows the device's actual OLED screen mid-operation (real IP address, real Wi-Fi network list),
which is a legitimate "proof this is real" asset a pure render can't provide. Both get used, for
different jobs, not chosen between.

Two findings worth having found now rather than at launch:
- The **current live site's own hero image** (`old/public/landing/device.png`) is itself an
  AI-generated render with garbled text on the device ("ELEOO" instead of "ELECIO," button labels
  unreadable) — a textbook AI-image text-rendering failure that shipped to production undetected.
  The new `media/` renders replace it outright.
- `old/public/landing/devices.png`, used on the current site to represent the management
  software, is a generic placeholder dashboard mockup (abstract UI labeled "Vizzer") — not a real
  ElecIO Manager screenshot. There are no real screenshots of the actual software anywhere in this
  repo. Logged as a real content gap in `marketing_path.md` §6, blocking honest imagery on the
  future `/software` page.

`old/public/about/*.jpg` (bare PCB in a clear prototype case, early firmware string visible on the
OLED) were confirmed as genuine origin-story photos, not filler — worth featuring deliberately on
the About/story page rather than defaulting to the polished renders there too.

### Change
Updated `plan.md` Phase 0 checklist (media item marked done, findings recorded inline) and
`marketing_path.md` §6 (replaced the tone-mismatch framing with what's actually true, dated the
correction rather than silently overwriting the original text's intent).

### Reasoning — why this matters beyond just checking a box
This is a small, concrete example of the thing you asked this whole process to avoid: an assumption
written down confidently (renders = synthetic, phone photos = authentic-but-lesser) that would have
quietly shaped image-selection decisions in later phases if it had gone unchecked. Verifying it
directly — cheap here, one Read call per file — caught it before it became load-bearing.

### Risks / follow-ups
- Videos (`media/*.mp4`) still not reviewed frame-by-frame; orientation/re-cut need for
  Instagram/Telegram (per `marketing_path.md` §6) unconfirmed.
- `old/public/collab/*` (partner logos) and the remaining `old/public/landing/dev1-4.png` /
  `about/2-4.jpg` were not individually reviewed this pass — low risk, but not yet verified the
  way the sampled files were.
- Partner consent (`business_path.md` §6) and stats refresh remain genuinely open — these need you,
  not another file read.

---

## [2026-08-06.03] Phase 1/2 built for real: Next.js scaffold, DB schema, i18n, and a working contact form

**Trigger:** You confirmed partner consent and said "do rest" — read as: stop asking, start
building. This entry covers everything from scaffolding the app through a verified production
build.

### What got built
- **Next.js app**, scaffolded via `create-next-app` into a scratch directory (its non-empty-dir
  check refused to run directly in this repo) then merged in — TypeScript, App Router, no
  Tailwind (per D4, Ant Design instead), npm (pnpm's corepack activation failed in this
  environment with an unrelated `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`, not worth fighting —
  npm works fine, `plan.md` §3 updated to say so instead of pnpm).
- **Database layer**: `src/server/db/` — `knexfile.ts`, a cached Knex singleton (`knex.ts`), an
  Objection `BaseModel` with camelCase↔snake_case column mapping, and 9 migrations covering every
  model `plan.md` commits to (admin_users, contact_submissions, download_requests, partners,
  testimonials, categories, tags, posts, post_tags) plus their Objection model classes.
- **i18n**: `next-intl` fully wired — `src/i18n/{routing,navigation,request}.ts`, `src/proxy.ts`
  (see below), `messages/{fa,en}.json`. Verified serving `<html lang="fa" dir="rtl">` and `<html
  lang="en" dir="ltr">` with the real catalog headline ("کامپیوتر کمتر. کابل کمتر. توقف کمتر." /
  "Less computer. Less cable. Less downtime.") in both languages.
- **Base layout**: `SiteHeader` (nav, locale switch, mobile drawer) and `SiteFooter` (real contact
  info/socials from `src/lib/site-constants.ts`, sourced from the old site audit).
- **Homepage**: hero (headline/subheadline/CTAs, explicitly marked as the Phase 3 3D-scene mount
  point, not a finished design) + a 3-card persona grid linking to `/for/business-owners`,
  `/for/programmers`, `/for/operators`.
- **Placeholder stub pages** (`/product`, `/software`, `/blog`, `/about`, and the 3 persona pages)
  so nav has no dead links, each stating in-page which `plan.md` phase actually builds it — chosen
  over faking finished content, since persona-page copy explicitly needs your sign-off before
  going live (`business_path.md` launch checklist).
- **`/contact`**: a real page, real Ant Design form, real `POST /api/contact` Route Handler —
  honeypot field, in-memory rate limiting, Objection `jsonSchema` validation, hashed IP (not raw)
  as a lightweight spam signal. This is the actual fix for the bug found in entry `.01`: the old
  site's forms only `setTimeout`-simulated submission and never persisted anything.
- CI workflow (`.github/workflows/ci.yml`: lint, typecheck, build), root `README.md` with real
  setup steps, `.gitignore` fixed (`.env*` was also silently excluding `.env.example` from git).

### A real bug found and fixed along the way
First dev-server boot threw `TypeError: (0, _react.createContext) is not a function` on every
page. Root cause: Ant Design v6 is a client-side library end to end (context, hooks, CSS-in-JS)
with no RSC-awareness baked into every subcomponent — a handful of my components
(`SiteFooter`, `Hero`, `PersonaGrid`, `PageStub`) rendered antd components without a `'use client'`
directive, so Next bundled them into the Server Component graph, where library-internal
`React.createContext` calls broke. Fixed by adding `'use client'` to each (and extracting the one
remaining offender — antd `Typography` used directly in the async server `contact/page.tsx` — into
a small `ContactIntro` client component instead). Confirmed the theory by testing with `next dev
--webpack` instead of Turbopack first (ruled out a Turbopack-specific bug before looking at
component boundaries) and reading the webpack module trace, which pointed straight at
`SiteFooter.tsx`.

Also renamed `middleware.ts` → `proxy.ts`: Next.js 16.3 deprecated the `middleware` file
convention in favor of `proxy` (same `next-intl` `createMiddleware` export underneath, just a
filename/location change) — the dev server logged this as a warning, not an error, but no reason
to ship on a convention Next itself says is going away.

Separately, `next build` failed on `Module not found: Can't resolve 'oracledb'` (and `sqlite3`,
`tedious`) — Knex dynamically `require()`s every dialect driver it supports, and Turbopack tried
to statically resolve all of them even though we only use `pg`. Fixed with Next's
`serverExternalPackages: ['knex', 'objection', 'pg']`, which tells Next to leave these as real
`require()` calls at runtime instead of bundling them — standard, documented fix for exactly this
class of problem.

One more: the initial `knexfile.ts` threw immediately if `DATABASE_URL` was unset (reasonable
fail-fast instinct) — but `next build` imports every Route Handler module to collect its config
even without invoking the handler, so that throw broke production builds with **no** database
credentials present at all, not just wrong ones. Removed the early throw; a missing/bad
`DATABASE_URL` now surfaces as a normal Postgres connection error the first time a query actually
runs, which is later than ideal but doesn't take the whole build down with it.

### Verified, not just written
`npm run lint` (clean, after excluding `old/` from ESLint's scope — it was flagging the *old*
site's pre-existing issues, which aren't this project's problem), `npm run typecheck` (clean),
`npm run build` (clean — 22 static pages across both locales + the dynamic `/api/contact` route),
and manual `curl` checks against a running dev server confirming real HTTP 200s, correct
`lang`/`dir`, and correct translated content on `/fa`, `/en`, `/en/contact`, `/en/product`,
`/en/for/business-owners`, `/fa/blog`, `/fa/about`.

### What's genuinely blocked, not just unfinished
Postgres **is** installed and running locally (Windows service `postgresql-x64-17`, confirmed via
`Get-Service`), but I don't have its credentials and won't guess/brute-force them. Migrations are
written but not yet run against a real database — this needs you to either run the `CREATE
ROLE`/`CREATE DATABASE` commands in `README.md` and put the password in `.env`, or hand me a
connection string directly. Everything downstream of the DB (verifying the contact form actually
persists a row, seeding partners/testimonials, Phase 7's blog) waits on this one input.

### Risks / follow-ups
- Theme (`src/lib/antd-theme.ts`) is explicitly provisional — flagged in `plan.md` Phase 2, not a
  real decision yet.
- Rate limiting is in-memory/per-process — fine for the current single-instance architecture (D2/
  D8), would need a shared store if that ever changes.
- `POST /api/download` (the second Phase 6 endpoint) isn't built yet — `DownloadRequest` model
  exists, the route doesn't.
- Lead notification routing is a `console.info` placeholder pending `business_path.md` §2.

---

## [2026-08-06.04] DB blocker resolved — the password was "1234," contact form verified end-to-end

**Trigger:** You didn't want to go through the full pg_hba.conf reset dance and asked whether you
could just skip having a password at all locally, guessing the existing one might just be "1234."

### What happened
Tried the guess directly before doing anything more invasive — connecting doesn't need admin
rights, only editing `pg_hba.conf`/restarting the service does. `1234` worked on the `postgres`
superuser on the first try. No reset needed.

Created a dedicated `elecio_app` role and `elecio_dev` database (not reusing the `postgres`
superuser directly — keeps the habit of least-privilege even when the password itself is trivial)
using the same `1234` password, deliberately, per your stated preference not to manage a separate
password for local dev. Noted explicitly in `plan.md`: this password must never be reused for any
hosted/production database — it's acceptable only because this Postgres instance is local-only and
never network-exposed.

Ran all 9 pending migrations (`npm run db:migrate`) — applied cleanly in one batch. Verified with
`\dt` that all 11 tables exist (9 domain tables + Knex's own `knex_migrations` /
`knex_migrations_lock`).

Then did the thing that actually matters: started the dev server and POSTed a real submission to
`/api/contact`, got `201 {"ok":true}`, and confirmed via `psql` that a real row landed in
`contact_submissions` with the right data (name, phone, persona, locale, timestamp). Deleted that
row afterward since it was test data, not a real lead — didn't want it sitting in the table looking
like a genuine first submission.

### Reasoning — why try the guess before the reset procedure
The full reset (entry `.03`'s writeup, still valid as a fallback for future forgotten-password
situations) is the *correct* general-purpose answer, but it's also more invasive than necessary
when the password might just be recoverable. Cheap, reversible checks before expensive, more
invasive ones — same principle as verifying the media files directly in entry `.02` instead of
reasoning from filenames.

### Risks / follow-ups
- `1234` as a real credential is a marked, temporary, local-only convenience — it must be replaced
  with a real generated credential the moment there's a hosted database (Liara/ArvanCloud/VPS,
  still an open decision in `plan.md` §3).
- Phase 1 and Phase 6 (contact endpoint) in `plan.md` are now both fully verified, not just
  written — updated accordingly.

---

## [2026-08-06.05] First real visual design concept, built from reference sites + actual brand photography

**Trigger:** You gave 10 reference URLs (creative-agency portfolios, Apple's iPhone Air page,
Deepgram, a Mauritius luxury real-estate site) and asked for a creative homepage concept built
from them, using `media/` for images, that you'd react to and revise.

### What changed since the last session
`media/` was reorganized and grown substantially between sessions — renamed from descriptive
filenames to `product (1..34).{jpg,png}`, with 24 new renders added the same day. Sampled a dozen
of them: this is a full, cohesive, genuinely premium studio photography set (dramatic
starfield/wordmark hero shots, a blue "circuit" dual-unit shot, a warm stone editorial shot, a
clean white minimal shot) — not the smaller set audited in entry `.02`. Re-surveyed before picking
assets rather than assuming the old inventory still applied.

### Research
WebFetched a sample of the reference sites (WebFetch converts to markdown/text, so this was
structural/textual inspiration, not literal visual screenshots). Notable finding: `allys.mu`,
which you flagged as a particular favorite, turned out to be a luxury real-estate site (Mauritius)
— not a tech/creative agency as the name suggested — its appeal is restrained, white, high-trust
minimalism. Also confirmed via the Apple iPhone Air page: its "3D" product showcase is not
real-time WebGL — the markup shows `_startframe`/`_endframe` image variants, i.e. a pre-rendered
image sequence scrubbed by scroll position. Relevant to both the concept build and the separate
3D-model question you asked.

### What got built
A single self-contained HTML artifact (published, not committed to the repo — it's a design
proposal, not app code yet): `elecio-homepage-concept.html`.
- **Fonts, self-hosted for real:** downloaded actual Vazirmatn (400/500/700/900, Arabic-script
  subset) and Archivo Black (Latin subset) `.woff2` files from jsDelivr's Fontsource mirror,
  verified their `wOF2` magic bytes, and inlined them as `@font-face` data URIs — per
  `artifact-design`'s rule against linking webfont CDNs (blocked by the Artifact CSP anyway) and
  against silent fallback. Vazirmatn chosen deliberately: it's the modern standard for Persian
  web type, has full Latin coverage too, and directly answers `plan.md` Phase 2's still-open
  "Persian-first font pairing" question with a concrete proposal instead of leaving it open
  further.
- **Design tokens derived from the client's own photography**, not a generic default: near-black
  ground pulled from the actual hero renders' background, a signal-blue accent matching the blue
  already present in the circuit-themed render, a warm stone accent from the editorial shot used
  sparingly. Explicitly checked this against `artifact-design`'s list of AI-generic looks (cream+
  terracotta, purple-blue-gradient-on-white, generic Inter/Space-Grotesk) and it doesn't match any
  of them — the palette is sourced from real assets, not invented.
- **Content is real**, not lorem: hero headline/subhead from the catalog's actual cover copy, the
  3-persona split copied from the catalog's own cover segmentation (owner/programmer/operator —
  confirmed independently in `plan.md`'s persona-page decision), the "problem 1 / problem 2"
  section numbering taken directly from the catalog's own sequencing (pages 2 and 5), the
  downtime-reporting formula verbatim from catalog page 6, real partner logos, real contact info.
- **Interactions**, all hand-written vanilla JS (no CDN libraries — CSP blocks them): scroll-reveal
  via IntersectionObserver, a mousemove/scroll parallax tilt on the hero image, a sticky-nav
  background transition, a hover-pausable CSS marquee for partner logos. All respect
  `prefers-reduced-motion`.
- **Both themes implemented**, dark as the deliberate default (matches literally every hero-grade
  asset the client has) with light as a real, working override — not an afterthought.

### A theme-correctness bug caught and fixed before publishing
The hero and nav sit over a fixed photograph that never changes with the theme toggle. First draft
had them using the page's normal theme tokens for text/button color — which would flip to dark
text in light mode, going dark-on-dark-photo and becoming illegible. Fixed by locally re-scoping
the *same* custom-property names (`--text-0`, `--text-60`, `--line`) within `.hero`/`.nav` to fixed
light values, so every component inside (buttons, eyebrow, links) inherits correctly without
needing separate "on-photo" variants of each — while leaving `--ink`/`--signal*` inherited so the
hero's bottom fade still blends into whatever the page's real background is. Caught a second,
subtler instance of the same class of bug: elements with no *explicit* `color` declaration (the
nav wordmark, the scroll-cue label) inherit the browser-computed `color` from `body`, which
resolves using the page's ambient (theme-following) token — not the local override — unless the
container itself re-declares `color: var(--text-0)` to force fresh resolution in its own scope.
Fixed by adding that explicit declaration on `.hero`/`.nav`. Also caught and fixed, before ever
running the build: a `display: contents` wrapper that would have silently dropped the `.wrap`
container's max-width/padding constraint on two sections, and one outright invalid CSS rule (a
bare selector followed directly by an `@media` block).

### Reasoning — why an artifact first, not straight into the Next.js app
Porting an unreviewed design straight into Ant Design/React Three Fiber components risks a lot of
throwaway work if the direction doesn't land. A static, fast-to-redeploy HTML artifact lets you
react to and revise the actual visual direction before any of it becomes real component code —
consistent with `plan.md`'s standing "present options before building" rule for Phase 2/3.

### Answered separately: how to get a real 3D model of the device
Recommended, in order: (1) ask whether CAD source files already exist from manufacturing — best
possible source, free; (2) if not, AI image-to-3D (Rodin/Hyper3D recommended for hard-surface
precision, Meshy as the more mainstream alternative) fed the existing studio renders as multi-view
reference; (3) photogrammetry (Polycam/Luma AI) of the physical unit as an alternative that
captures the real object rather than an AI's interpretation of renders. Noted that Apple's own
iPhone Air page isn't real-time WebGL either (confirmed via the markup) — a rendered turntable
image sequence scrubbed by scroll is the cheaper, safer, industry-standard path, and doesn't
strictly require choosing between (1)–(3) at all if that's the only goal.

### Risks / follow-ups
- This concept is homepage-only — persona pages, `/product`, `/software`, `/about`, `/blog` still
  need their own treatment once (if) this direction is approved.
- Not yet ported into the real app (`src/components/marketing/Hero.tsx` etc. still hold the
  earlier, deliberately-plain placeholder from entry `.03`).
- `product (12..34).png` were only spot-checked (a dozen of 34), not individually reviewed the way
  the sampled ones were.

---

## [2026-08-06.06] Artifact rejected; real scroll-driven 3D hero built directly in the app using real GLB models

**Trigger:** Direct, unambiguous feedback on entry `.05`'s artifact: "very very bad," specifically
the image choices/sizes and the section flow, plus "why didn't you implement it here? right in
localhost 3000?" — and an instruction to use real 3D model files the user had added to a new
`3dObject/` folder for a scroll-driven product-rotation hero with features appearing as it turns.

### What was found
`3dObject/elecio_smart_dnc_black_v2.glb` and `elecio_smart_dnc_white_v2.glb` — real glTF 2.0
models, ~148KB each, inspected directly (parsed the glTF JSON chunk rather than assuming): 76
named meshes each, genuinely modeled hard-surface geometry matching the actual product — individual
buttons, OLED screen/bezel, the DB25 connector modeled pin-by-pin, screws, vents, keyhole slots.
Correctly-named PBR materials (`black_body`, `screen_glass`, `gold_pins`, etc.), 3 baked textures.
Low vertex count (~4-5k total) — light enough for real-time WebGL without any optimization pass
needed first.

### What got built — directly in the app this time, not an artifact
- Installed `three`, `@react-three/fiber`, `@react-three/drei`.
- `src/components/marketing/hero3d/DeviceModel.tsx` — loads the black GLB via `useGLTF`, eases
  its rotation toward a `targetRotationY` prop every frame (not an instant snap) plus a tiny idle
  bob. Deliberately has no hand-guessed `scale` — wrapped in drei's `<Bounds fit>` in the parent
  instead, which frames the camera to the model's real bounding box regardless of what units it
  was exported in.
- `src/components/marketing/hero3d/Hero3D.tsx` — a `chapters.length * 100vh` tall section with a
  sticky 100svh viewport inside it. A scroll listener (rAF-throttled) computes 0-1 progress through
  that tall section; progress drives both the model's rotation and which of 6 chapters' copy is
  shown (real catalog content: intro → operator UI → dual-core/8GB → serial-port protection →
  Wi-Fi → closing CTA). Same mechanism as Apple's product pages (scroll position -> product state)
  but with actual interactive geometry instead of a pre-rendered image sequence — confirmed in
  entry `.05` that even Apple doesn't do real WebGL here, so this goes a step further than the
  reference.
  - Lighting is a hand-built 3-point rig (key/fill/rim, rim tinted the brand signal-blue), not
    drei's `<Environment>` preset — that fetches an HDR from an external CDN, which is both a
    reliability dependency this hero doesn't need and a second Suspense source to manage. Wrapped
    `<Bounds><DeviceModel /></Bounds>` in a `<Suspense>` boundary instead (required — `useGLTF`
    suspends while the GLB loads).
  - `src/components/marketing/hero3d/index.tsx` dynamically imports the real component with
    `ssr: false` — WebGL/Canvas must never attempt to render during SSR.
- Self-hosted the same Vazirmatn/Archivo Black fonts validated in the artifact, now via real
  `@font-face` rules in `globals.css` pointing at `public/fonts/` (copied from the same downloads
  used in entry `.05`, not re-fetched) instead of a data URI — normal `<link>`-free `@font-face`
  is the right approach for the real app (no CSP to work around here).
  `src/lib/antd-theme.ts` carries the same dark/signal-blue palette into Ant Design's
  `ConfigProvider` via `theme.darkAlgorithm` plus explicit tokens, so Ant Design components
  (buttons, cards, the persona grid) match instead of fighting the custom CSS.
- Added `hero3d.chapters` (6 entries, bilingual) to `messages/{fa,en}.json` — read via `t.raw()`
  rather than hardcoding copy in the component, keeping it consistent with the rest of the app's
  i18n approach.

### Verified, not just claimed
`tsc --noEmit` clean, `eslint` clean. Found the dev server was already running (from before this
session's interruption) on port 3000 — confirmed via `Get-NetTCPConnection` rather than assuming,
then verified directly against it: `/fa` returns 200 with the correct `lang="fa" dir="rtl"` and the
real headline server-rendered, `/models/elecio-black.glb` serves with `Content-Type:
model/gltf-binary`, the font files serve with `Content-Type: font/woff2`. **Not verified**: the
actual WebGL rendering, rotation smoothness, or scroll-choreography feel in a real browser — no
browser-automation/screenshot tool was available in this pass, so this is a server/asset-level
verification only. The user needs to actually look at `localhost:3000/fa` and say what's still
wrong, the way they did with the artifact.

### Reasoning — why this, not another artifact
The explicit ask was to implement it in the running app, not iterate further in an isolated
preview. The artifact process (research → design plan → build → self-review) was right for
proposing an unreviewed direction cheaply; once the user has real 3D assets and wants to see them
live, working directly in the app is the correct move — an artifact can't even load these GLB
files usefully (the CSP blocks the kind of external asset loading a full Canvas app benefits from,
and there's no reason to fake DB25-connector geometry in a mockup when the real modeled geometry
exists).

### Risks / follow-ups
- Rotation-to-feature-angle alignment (e.g., "back view" chapter actually showing the DB25 port)
  was chosen narratively, not verified visually — will likely need tuning once actually seen.
- Only the black variant is used in the hero; the white GLB exists and is unused so far.
- The "bad images and sizes" complaint about the *artifact* may or may not have been about the
  photo sections beyond the hero (problem/solution, craft/editorial) — those still use the same
  photo-heavy approach in spirit and haven't been rebuilt in the real app yet. Worth explicitly
  asking rather than assuming once the 3D hero itself is confirmed to be an improvement.

---

## [2026-08-07.07] Found and fixed the real "page goes empty" bug — this time by actually looking

**Trigger:** More direct feedback on entry `.06`: the 3D object looked "corrupted" and the rest of
the page looked empty; explicit new direction (smaller device, slower rotation that completes a
full turn and then holds, light-blue glass/water-morphism instead of dark) — and, critically, a
complete, working, dependency-free procedural 3D device renderer (matrix math + a hand-written
z-buffer canvas rasterizer, no WebGL) supplied directly as code to use instead of the GLB/Three.js
pipeline.

### What changed
- **Replaced the entire Three.js/GLB pipeline** with the supplied renderer, ported into
  `src/components/marketing/hero3d/proceduralDevice.ts` (engine: geometry builders, texture
  builders, the rasterizer, the render loop — kept close to the original) and
  `DeviceCanvas.tsx` (a thin React wrapper: creates the renderer once per mount, pushes
  `yaw`/`theme` updates into it imperatively so scroll doesn't recreate the whole scene 60x/sec,
  tears it down on unmount). Deliberately did not port the supplied demo's own UI chrome (its
  header copy, control buttons, drag-to-orbit) — the user said "only the object"; rotation is
  scroll-driven here instead. Fixed one real bug while porting: the demo's `theme` toggle only
  updated textures (logo/label images), not the solid-color materials (body/cap/base), because
  the color lookup was reading the renderer's *construction-time* theme instead of its current
  one — fixed by tracking current theme in the renderer's own closure state.
- `Hero3D.tsx` rewritten: rotation now completes exactly one full turn over the first 70% of the
  scroll range and then holds ("spin completely, then fixes," taken literally) instead of
  spinning continuously; the canvas lives in a fixed, modest glass frame (`min(46vh, 400px)`)
  instead of a full-bleed 100vh layer.
- Removed `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` (53 packages) and the
  copied GLB files from `public/models/` — dead weight once nothing imports them. The source GLBs
  in `3dObject/` are untouched (kept as reference / for a possible future real-WebGL path).
- New palette: light blue + glassmorphism, replacing round 1's dark near-black direction entirely
  — `globals.css` tokens rewritten (`--ink` etc. now light values, added `--glass-blur` and a
  `.glass-panel` utility), `antd-theme.ts` switched from `darkAlgorithm` to `defaultAlgorithm`,
  `SiteHeader`/`SiteFooter` given `backdrop-filter: var(--glass-blur)` so they're actually glassy,
  not just translucent-flat.

### The actual "page goes empty" bug — found by looking, not guessing
Given two wrong guesses in a row (entries `.05` and `.06`), installed a throwaway Playwright
(headless Chromium) in a scratch directory rather than continuing to reason from `curl`/server
logs alone, and screenshotted the live page at multiple scroll depths. First pass, post-rewrite:
top of hero rendered correctly (device, glass card, copy — see the difference in this entry vs.
`.06`'s complaint), but scrolling *any* amount produced a **completely blank light-blue page** —
reproduced directly, not inferred. Root cause: `globals.css` had `overflow-x: hidden` on
`html, body`. Per the CSS spec, setting only one of `overflow-x`/`overflow-y` to a non-`visible`
value forces the *other* axis to compute as `auto` — so `body` was silently becoming its own
scroll container. That breaks `position: sticky` for any descendant whose containing block isn't
that new scroll container in the way the code assumed (the Hero3D section's sticky viewport, in
this case) — a well-known but easy-to-miss interaction. Fixed by switching to `overflow-x: clip`,
which prevents horizontal overflow without establishing a scroll container. Re-verified with the
same screenshot method: confirmed rotation through multiple angles (front, back showing the
modeled vents/screws/label — real geometry, not a flat image), chapter text changing correctly,
and the persona grid + footer both rendering correctly after scrolling past the hero.

This likely explains **both** rounds of "empty page" complaints — round 1 (`.06`) blamed on a
Three.js crash was a reasonable hypothesis at the time (a real error was in the dev log), but this
bug was sitting underneath it the whole time and would have caused the same symptom regardless.

### Reasoning — why install a browser instead of continuing to reason from logs
Two consecutive misses on the same category of problem (shipping something and being told it
looks broken/empty) meant the cost of *not* verifying visually had become higher than the cost of
setting up Playwright. `chromium-cli` (the environment's usual headless-browser tool per the `run`
skill) wasn't installed; `npx playwright install chromium` was, and a throwaway `npm init` project
in the scratchpad kept it out of the repo's real dependencies. This should be the default going
forward for any visual change to this project, not a last resort after repeated misses.

### Verified, not just claimed
`tsc --noEmit`, `eslint`, `next build` all clean. Playwright screenshots at 8 scroll depths across
the full page height confirm: device renders correctly and rotates through distinct real angles,
sticky pinning works, chapter text transitions, persona grid and footer render with the new glass
palette, zero browser console errors at any point (`page.on('console')` / `page.on('pageerror')`
both checked, not just visually).

### Risks / follow-ups
- Rotation-to-feature-angle alignment is still narrative, not precisely tuned (e.g., confirming
  the "DB25 port" chapter lines up with the connector actually facing the viewer).
- Only verified in one viewport size (1440×900, desktop). Mobile layout (`.deviceFrame`'s smaller
  breakpoint) not yet screenshotted.
- The procedural renderer is CPU/canvas-2D based, not GPU — fine at this poly count, but worth
  knowing if the model ever grows more detailed.
- White device variant (`theme="white"`) is implemented in the renderer but unused in the hero.

---

## [2026-08-07.08] Screenshotted the actual reference sites, dropped the scroll-hijack entirely, rebuilt the homepage as normal flowing content

**Trigger:** Sharp feedback that entry `.07`'s hero was wrong on the merits, not just buggy: "I
didn't ask to put that in middle of the page and turn and stay there the whole time." Clarified
what was actually wanted — the device spins once as it scrolls into view, then the section scrolls
away normally with the rest of the page ("go up like the other contents"), features appear as
separate normal sections while scrolling down, not tied to the device at all. Named 3 reference
sites (allys.mu, mcshannock.design, deepgram.com) and asked for something "very stylish" for the
persona selection specifically.

### Actually looked at the references this time
Previous rounds inferred design language from `WebFetch`'s text/markdown conversion, which cannot
show layout, type scale, or motion — a real gap given two rounds of visual misses already. Used
the Playwright setup from entry `.07` to screenshot all three sites directly (multiple scroll
depths each). What was actually there, concretely:
- **allys.mu**: solid white ground (not dark, not glass), a huge bold headline over a photographic
  hero, a floating rounded/pill navbar, and — for its "What We Offer?" section — a plain numbered
  list (big index number, thin horizontal dividers, no cards) rather than a grid.
- **mcshannock.design**: near-black hero, huge bold white headline overlapping a dimmed photo, a
  floating pill navbar again, a small vertical service list as secondary nav, portfolio work
  shown as rounded image cards in a grid below.
- **deepgram.com**: solid near-black (no gradients/blur stacking), a centered huge headline with
  one phrase picked out in a bright accent color, a grayscale partner-logo trust bar, and a
  pill-shaped tab selector for its 4 product lines (Speech to Text / Text to Speech / Voice Agent
  / Audio Intelligence) that swaps content below on click.
None of the three use scroll-hijacking, sticky-pinned sections, or heavy stacked glassmorphism —
which reframed round 2's "glass everywhere" as a real overcorrection, not something to keep.

### What got rebuilt
- **Theme, round 3**: pulled back from round 2's blurred-glass-on-every-surface look to solid
  confident grounds (`--ink` is now plain white, `antd-theme.ts` back to `defaultAlgorithm` with
  solid `colorBgContainer`). `.glass-panel` kept as a utility but now used in exactly one place —
  the nav.
- **`SiteHeader`**: rebuilt as a floating pill (`position: sticky; top: 18px`, rounded-full,
  glass), matching allys.mu/mcshannock.design directly instead of the earlier flat full-width bar.
- **Hero, rewritten from scratch**: no more tall wrapper / `position: sticky` viewport (entry
  `.07`'s approach, now understood to be the wrong mechanism, not just buggy). Normal two-column
  in-flow section; an `IntersectionObserver` on the section triggers a **one-time** eased rotation
  (`START_YAW -> START_YAW + 2π` over 1.9s, `requestAnimationFrame`-driven, skipped entirely under
  `prefers-reduced-motion`) the first time it scrolls into view, then nothing further ties to
  scroll — the section just scrolls away normally, exactly as asked.
  Headline adopts allys.mu/mcshannock.design's scale (`clamp(36px, 5.6vw, 72px)`, weight 900) with
  one phrase picked out in the brand blue via a new `.highlight` utility — Deepgram's technique,
  adapted to Persian.
- **New `FeatureList` component**: the 4 features that used to be sticky-hero "chapters" are now
  a plain allys.mu-style numbered list (own normal section, revealed on scroll via the new
  `RevealOnScroll` — ordinary fade/slide-into-view, not scroll-hijacking) — numbering is
  legitimate here (4 enumerated real features), not decorative.
- **`PersonaGrid` rebuilt as an interactive tab-select** (Deepgram's product-tab pattern): 3 pill
  tabs, click one to see its brief inline below with a "view full page" link — replacing the
  static 3-card grid. This is the "interesting and stylish" persona-selection piece asked for.
- **New `FinalCta`** (dark, solid, matching deepgram.com's confident closing-CTA convention) and
  `RevealOnScroll` (a small reusable ordinary-fade-on-scroll wrapper, used by `FeatureList`,
  `PersonaGrid`, and `FinalCta` — the "normal scrolling" replacement for entry `.07`'s hijacking).

### Two real bugs caught by actually rebuilding and re-verifying
- Renaming the `home` message namespace to `hero`/`personas` broke `generateMetadata` (still read
  `namespace: 'hero'`... old value `'home'`) and all 3 persona stub pages (still called
  `getTranslations('home')` then indexed old key names like `personaBusinessOwner.title`) — caught
  by `next build`, which fails hard on `MISSING_MESSAGE` rather than silently rendering blank.
  This is exactly why the full production build is part of the verification loop now, not just
  `tsc`/`eslint`.
- Ant Design's `Button` `iconPosition` prop is deprecated in favor of `iconPlacement` — caught as a
  console warning during the Playwright pass, fixed immediately rather than left in.

### Verified, not claimed
Full loop this time: `tsc --noEmit`, `eslint`, and `next build` all clean; then a fresh dev server
and Playwright screenshots across **desktop `/fa` at multiple scroll depths, desktop `/en`, and
mobile `/fa`** (390×844), plus a programmatic click on the second persona tab to confirm the
interactive selector actually changes state — not just that it compiles. Zero console/page errors
across all of it. Confirmed visually: the pill nav, the one-time spin-then-normal-scroll hero, the
numbered feature list, the working tab-select persona panel, the dark final CTA, and correct
mirroring between English (device right, text left) and Persian (device left, text right, RTL).

### Reasoning — why screenshot the references instead of describing them from memory/WebFetch
Two consecutive rounds of shipping-then-being-told-it's-wrong on visual direction made clear that
text-based inference from WebFetch wasn't sufficient input for matching a specific requested look.
Actually rendering and screenshotting the 3 named sites turned "make it like these" from a vague
brief into concrete, checkable design facts (exact nav treatment, exact hero scale, exact
numbering convention) — the same "verify directly instead of reasoning from an approximation"
principle as entry `.02` (media files) and `.07` (the sticky bug), now applied one step earlier,
to gathering the reference itself rather than only to checking the output.

### Risks / follow-ups
- Persona brief copy is newly written for this round, not yet reviewed by the user for accuracy
  the way the rest of the site's copy has been audited against the catalog.
- Feature list, persona selector, and final CTA are homepage-only — not yet extended to the
  individual `/product`, `/for/*` pages, which are still stub placeholders.
- Mobile verified at one breakpoint (390×844); not checked at tablet widths.

---

## [2026-08-07.09] Phases 4, 5, and the rest of 6 — persona pages, software page, and a real layout bug caught by full-page screenshots

**Trigger:** "do the remaining phases which was?? 3?" — Phase 3 was in fact done (just not yet
reflected in `plan.md`); updated that first, then built Phase 4 (Business Owner), Phase 5
(Programmer + Operator), and closed out Phase 6's remaining piece (`POST /api/download`).

### What got built
- **`plan.md` accuracy pass**: marked Phase 2/3 done, logged D6's supersession properly in the
  Decision Log (R3F → the user-supplied procedural renderer) instead of leaving the doc
  describing an architecture that's no longer true.
- **Shared components** (`src/components/marketing/`): `PersonaHero`, `RoiFormula` (the real
  catalog-page-6 formula), `ControllerMatrix` (6 real controllers + the catalog's own
  compatibility-verified-per-machine caveat), `VideoTestimonials` (9 real Aparat customer
  installation videos, extracted from `old/src/components/landing/
  CustomerSatisfactionSection.tsx` — kept the real data, dropped ~300 lines of inline-style mess
  and a broken thumbnail-fallback chain), `PartnerStrip` (real logos, finally copied from
  `old/public/collab/` into `public/partners/`), `TrustBadges`, `DownloadForm`. `FeatureList`
  generalized to take a `namespace` prop so it's reused across the homepage, programmer, operator,
  and software pages instead of four near-duplicate components.
- **Three real persona pages** (`/for/business-owners`, `/for/programmers`, `/for/operators`) and
  a real `/software` page, replacing their `PageStub` placeholders.
- **`POST /api/download`**: same pattern as `/api/contact`. Closed a real TODO in
  `DownloadRequest.resourceUrls` — `catalog_pdf`/`features_pdf` were `null` placeholders; copied
  the actual PDFs from `doc/` into `public/downloads/` and wired them for real.

### Two real bugs, both caught by actually looking (not just tsc/eslint/build)
1. **Document width blew out to 11439px** (viewport was 1440px) on any page using the honeypot
   pattern — found via a `fullPage: true` Playwright screenshot that came back completely blank,
   which turned out to mean "the real content is ~9700px off to the side," not "nothing
   rendered." Root cause: `position: absolute; left: -9999px` without a positioned ancestor
   offsets from the initial containing block, not from the field's visual location — a classic
   footgun with this old "hide it off-screen" honeypot technique. It was in `ContactForm.tsx`
   from the very first session (entry `.03`) and copied verbatim into the new `DownloadForm.tsx`;
   never caught before now because earlier verification passes only took viewport-sized
   screenshots, which happened to crop the overflow out of frame. Fixed properly: replaced both
   with a `HONEYPOT_WRAP_STYLE` (`src/lib/honeypot-style.ts`) using the standard "clip to 1×1px"
   visually-hidden pattern, which cannot affect layout regardless of positioning context or RTL.
   Re-verified: `document.body.scrollWidth` back to 1424px (correct) on both forms.
2. **False alarm, worth recording anyway**: `fullPage: true` screenshots of the new persona pages
   initially showed large blank gaps exactly where `RevealOnScroll`-wrapped sections should be
   (`FeatureList`, `ControllerMatrix`). Before assuming a real bug, checked computed `opacity` on
   those elements after **real** incremental `scrollTo` (not a `fullPage` capture) — all `1`,
   confirmed correct. `fullPage: true` resizes the viewport and captures once; it doesn't reliably
   wait for `IntersectionObserver` callbacks + CSS transitions to resolve first. Lesson for this
   project's verification method specifically: use real incremental scrolling +
   `waitForTimeout` when checking scroll-reveal content, reserve `fullPage` for a quick
   overview/gut-check, not as the source of truth for whether something rendered.

### Verified, not claimed
`tsc --noEmit`, `eslint`, `next build` all clean (23 routes now, up from 15, including the new
`/api/download`). Playwright: full-page + real-incremental-scroll screenshots of all 3 persona
pages plus `/software` and `/contact` (both locales for at least one page), a real form submission
through `/api/download` confirming a working returned download link, `document.body.scrollWidth`
checked explicitly after the honeypot fix (not just "looks fine"), zero console/page errors
throughout.

### Reasoning — why this is worth its own entry rather than folding into `.08`
Both bugs here were caught specifically *because* verification habits from `.07`/`.08` (screenshot
before claiming done) were applied to new pages, not because the pages were written more
carefully. That's the point of writing the habit into memory rather than just fixing bugs as they
appear — it keeps paying off on genuinely new surfaces, including a bug (`ContactForm`'s honeypot)
that had been sitting unnoticed since the very first working feature of this project.

### Risks / follow-ups
- `/product` and `/about` remain `PageStub` placeholders — not part of the numbered phases touched
  this round, but linked from live nav/CTAs, so worth closing next.
- Stats (150+/450+/2.5M+/99.8%) still not shown anywhere real, correctly — still blocked on
  `business_path.md` §6.
- Phase 7 (blog/SEO engine + Refine admin) is next in sequence but involves a real new
  architectural decision (admin auth mechanism) that should be surfaced as a choice, per this
  project's operating agreement (`plan.md` §1) — not built silently in the same pass as this entry.

---

## [2026-08-07.10] Palette overhaul (gold, not blue) + the scroll-bound hero came back, done properly this time

**Trigger:** A screenshot of allys.mu's hero pasted directly, plus explicit, blunt feedback: "what
you've made is very very cheap and the pallet is very very ugly," and clarification of what was
actually wanted from the hero: "the product rotates and the features appear one by one beside that
in the wide page" — which, read against entry `.08`'s rejection of the *previous* scroll-bound
hero, means the mechanism itself wasn't the problem; the execution and pacing were.

### Palette: round 4
Round 3's flat sky-blue accent read as generic/cheap once actually compared against the brand's
own dramatic photography and the allys.mu reference. Replaced with a warm brass/gold —
**not an arbitrary pick**: it's the literal color of the device's gold connector pins (visible in
the GLB's own material list as `gold_pins`, confirmed back in entry `.07`'s model inspection), so
the accent is a real product detail rather than decoration. `--signal`/`--signal-glow` kept their
variable names (touches 8 files' worth of `var()` references) but are now gold; neutrals
(`--surface`, `--border`, `--foreground`, etc.) were re-tuned with a warm undertone to match,
instead of leaving them blue-tinted against a gold accent.

### Hero: scroll-bound mechanism restored, tightened, and given real photographic weight
Brought back the sticky/scroll-driven structure (device rotates continuously, feature copy cycles
beside it) but changed what made the earlier attempt feel bad:
- **Real photography instead of a flat gradient backdrop** — `media/product (5).png` (a dramatic
  CNC-context shot with HUD-style tech overlay graphics, genuinely on-topic since a real machine
  spindle is visible in the background) resized into `public/images/hero-backdrop.jpg`, used as a
  full-bleed backdrop with a directional scrim for text legibility.
  `product (31).png`/`(28).png`/`(12).png` also brought in as `public/images/` for reuse
  elsewhere.
  **Wide, explicit side-by-side layout** (`grid-template-columns: 1.15fr 0.85fr` inside a
  1520px-max container) rather than text-over-canvas — the device stays visible in its own frame
  while text genuinely sits *beside* it, matching "beside that in the wide page" literally.
- **Shorter and tighter**: 5 chapters × 70vh instead of 6 × 90–100vh — meaningfully less scroll
  distance, addressing the earlier "stays there the whole time" complaint without abandoning the
  mechanism.
- **The 4 real feature items now live in the hero, not duplicated below it** — removed
  `<FeatureList />` from the homepage (it's still used, unchanged, on the programmer/operator/
  software pages against different namespaces) since repeating the same 4 items twice on one page
  would be redundant, not additive.
- Added `<PartnerStrip />` to the homepage too (previously only on the Business Owner page) —
  closes a gap `plan.md` Phase 3 had flagged as still open.

### A real bug found by inspecting computed styles, not guessing from a screenshot
A stray gold "چرا الکیو؟" (feature eyebrow) kept appearing near the device instead of beside its
own title, and didn't go away even after a 1.5s settle (ruling out a transition-timing artifact,
the working assumption after entry `.09`'s false alarm). Rather than guess again, queried the
actual DOM: `getBoundingClientRect()` + `getComputedStyle()` on every element containing that
text. Found all 4 feature chapters' eyebrows stacked at the identical box (as expected for
absolutely-positioned crossfade), with only the truly active one at `opacity: 1` — so the
*stacking* was correct, but the *box itself* was positioned/aligned wrong. Root cause: a shared
CSS rule `.kicker, .eyebrow { direction: ltr; ... }` — `.kicker` needs `direction: ltr` because it
holds the Latin "ELECIO SMART DNC" wordmark inside an RTL page, but `.eyebrow` holds Persian text
reused from `FeatureList`'s eyebrow pattern, and inherited that `ltr` override by sharing the
selector. Split into two separate rules; `.eyebrow` now has no direction override and inherits the
page's real `rtl`. Confirmed fixed by re-screenshotting at the same scroll position.

### Reasoning — why inspect the DOM instead of re-screenshotting with a longer wait
Entry `.09` already established one false alarm (`fullPage` screenshots not waiting for reveal
transitions) — jumping straight to "must be another timing issue" for a *different* visual anomaly
would have been pattern-matching without verifying. A 1.5s settle time ruling out timing, followed
by direct `getComputedStyle`/`getBoundingClientRect` inspection, found the actual mechanism (a
shared selector leaking an unrelated override) in one query instead of several more rounds of
screenshot-and-guess.

### Verified, not claimed
`tsc --noEmit`, `eslint`, `next build` all clean (unchanged route count, no new pages this round).
Playwright: real incremental scroll through all 5 hero chapters, `document.body.scrollWidth`
checked (1424px, correct), zero console/page errors, and the eyebrow fix specifically re-verified
at the exact scroll position that had shown it broken.

### Risks / follow-ups
- The gold/warm-neutral palette has only been applied via the shared token layer — every
  component that reads `var(--signal)`/`var(--border)`/etc. picks it up automatically, but no
  component was individually re-designed *for* gold the way Hero3D's backdrop was; worth a second
  look at `PersonaGrid`/`RoiFormula`/`ControllerMatrix` for any spot where the old blue-tuned
  contrast choices (e.g. `.eyebrow` colors, hover states) might read slightly off against the new
  neutral warmth.
- Rotation-to-feature-angle alignment is still narrative/approximate, same open item as entry
  `.07`.
- `product (31).png`/`(28).png`/`(12).png` were copied into `public/images/` for reuse but aren't
  used by any component yet — available for the next section that wants real photography.

---

## [2026-08-07.11] The real 3D engine: a Three.js scene ported from a file the user supplied directly, hero split into photo-top + product-further-down, palette flipped to dark+blue

**Trigger:** A large, multi-part instruction: restructure the homepage (real `media/` photo up
top, the interactive product moved to a dedicated "About the product" section further down,
spinning once as it scrolls into view "like the one here"
[apple.com/iphone-17](https://www.apple.com/iphone-17/)); change the palette to "more dark and
blue... very modern"; add "creative 3D transitions as scroll down"; and — critically — **use the
model created on the html file, not those gbd \[glb\] files, they are not looking good.**

### What "the html file" turned out to be
`elecio_smart_dnc_3d_v6.html` (in the user's Downloads folder, opened in their IDE) — 894 lines,
read in full before touching any code. This is **not** the same kind of thing as the canvas-2D
rasterizer ported in entry `.07`. It's a genuine Three.js/WebGL scene: extruded and lofted
geometry (a shoulder surface blended between a rounded-square outline and a raised octagonal
plateau, corner slots embossed via signed-distance depth, a swept rim with a rear fillet — all
parametric, measured off the real device: "constants... scaled off the DB-25 (38.96 mm shell,
47.04 mm screw pitch) which fixes the case at 80 mm square"), real `MeshPhysicalMaterial`s
(roughness/clearcoat/normal-mapped procedural grain), procedurally-painted decal/screen/
environment-map textures drawn with Canvas 2D and applied as `THREE.CanvasTexture`, real shadows
(`PCFSoftShadowMap`), ACES filmic tone mapping, and a spherical-coordinate camera orbit with view
presets and real spec data (window size, key pitch, DB-25 pin count, etc.) per view. Confirms the
user's framing precisely: nothing here loads a `.glb` asset — the entire model is built in code,
which is exactly why "not those gbd files" and "the model created on the html file" refer to the
same underlying preference (procedural geometry you can trust, not an opaque asset file), not a
contradiction with entry `.07`'s earlier pivot away from GLTF loading.

### Porting it
`src/components/marketing/hero3d/elecioSceneV6.ts` — kept close to the original structure and math
(precise, measured geometry; rewriting risks introducing errors for no benefit). What actually
changed for the React/marketing-site integration:
- The original's dev-tool UI (DOM buttons for view presets/finish/toggles, a spec-rail sidebar) was
  **not** ported — same "only the object" judgment call as entry `.07`, this time not even
  stated explicitly but consistent with it. The marketing page supplies its own on-brand UI.
- `state.spin` + pointer-drag-driven `goal.t` replaced with `setSpinProgress(p)` — scroll-scrubbed
  rather than time-based, matching "spins once... as I scroll down" and the Apple reference
  literally (scroll position drives rotation, not a free-running timer). Drag-to-orbit is kept as
  a bonus interaction once the reveal settles; wheel/pinch-zoom were dropped since they'd fight
  normal page scroll once embedded in a real section instead of a full-viewport standalone demo.
- Three.js r128-era color-space API (`THREE.sRGBEncoding`, `texture.encoding`) updated to the
  current API (`THREE.SRGBColorSpace`, `texture.colorSpace`) — this project is on `three@0.185`.
- Reinstalled `three` (uninstalled in entry `.07`). Still **not** `@react-three/fiber`/`drei` —
  this is plain Three.js driven from a `useEffect` (`SceneCanvas.tsx`), matching the original
  file's own structure rather than translating it into R3F's declarative JSX form.

### A real performance bug found (and fixed) during verification, not shipped blind
First Playwright pass: screenshots kept timing out. Rather than assume "flaky test infrastructure"
and retry, checked what was actually happening: `page.evaluate` querying a throwaway canvas'
`WEBGL_debug_renderer_info` reported `SwiftShader` — this sandbox has no GPU, so WebGL falls back
to a software rasterizer, and the scene's real-time shadow maps + PMREM environment map + several
1200×1200 procedural canvas textures are genuinely expensive to push through software rendering.
Root cause of *why it was slow at all times*, not just during verification: the scene was being
created and its `requestAnimationFrame` loop started the instant the component mounted — even
while `AboutProduct` was still off-screen below the fold. Fixed properly (not just for the
sandbox): `SceneCanvas` now uses an `IntersectionObserver` (`rootMargin: '400px'`) and only calls
`createElecioScene` once the section is actually about to be visible. This is a correct
optimization regardless of GPU availability — a real visitor's battery/CPU shouldn't pay for an
off-screen WebGL canvas either. Verification then just needed longer per-screenshot timeouts
(60s) to accommodate this sandbox's software rendering specifically; the underlying code is fine.

### Palette: round 5, dark + blue
Explicit direction, reversing round 4's gold. Rather than pick a new dark/blue arbitrarily, pulled
the tokens directly from the color language already established in the user's own `v6` HTML file
(`--void:#080a0d`, `--led:#4aa0ff`) — the site and the 3D viewer now share one palette instead of
two bolted together. `globals.css` and `antd-theme.ts` updated (dark is the real default again,
`darkAlgorithm`), and — learning from round 3→4's transition, where several component CSS modules
had hardcoded `#ffffff` instead of theme tokens and silently stayed white — this time swept the
whole `src/components` tree for hardcoded light-theme hex values (`ControllerMatrix`,
`PersonaGrid`, `TrustBadges`, `VideoTestimonials`, `RoiFormula`, the software page's download
card, `SiteHeader`'s glass pill) and ported each to the new dark tokens explicitly, plus caught
`FinalCta`'s `background: var(--foreground)` — correct when `--foreground` was a dark color
(rounds 3–4), now silently broken since `--foreground` is *light* text color under the dark
palette; replaced with a dedicated deep-blue gradient instead of reusing a token for the wrong
purpose.

### Homepage restructured
`Hero` (new, Server Component, photo-only — `media/product (5).png`, the same dramatic CNC-context
render used before, still a good fit for "dark and blue") → `AboutProduct` (new, the 3D device,
scroll-scrubbed single revolution + drag-to-orbit + a perspective-tilt 3D entrance transition,
distinct from `RevealOnScroll`'s plain fade used everywhere else — the "creative 3D transitions"
ask) → `FeatureList` → `PersonaGrid` → `PartnerStrip` → `FinalCta`. Old `Hero3D.tsx` (the
wide-hero-with-features-beside-device layout from entry `.10`) and the canvas-2D
`proceduralDevice.ts`/`DeviceCanvas.tsx` (entry `.07`) deleted outright rather than left as dead
code.

### Verified, not claimed
`tsc --noEmit`, `eslint`, `next build` all clean (twice — once before the lazy-mount fix, once
after, since that fix touched a hook). Playwright, with the timeout accommodation above: hero,
three scroll depths through `AboutProduct` (device visibly at different rotation angles — confirmed
scroll-scrubbing works, not just present), and the rest of the page (`FeatureList` numbered rows,
`PersonaGrid`'s panel, `PartnerStrip` logos, `FinalCta`'s new gradient, footer) — zero console/page
errors throughout.

### Reasoning — why port faithfully instead of simplifying
The supplied file is precise, measured, working code (real dimensions cited to the hundredth of a
millimetre, matched against actual photographs per its own comments). Rewriting or "improving" it
under time pressure would trade a known-correct model for one with unknown correctness, for no
real benefit — the actual integration work needed was around it (scroll-driving the camera,
lazy-mounting, dropping the standalone demo's UI chrome), not inside its geometry math.

### Risks / follow-ups
- The view-preset system (front/back/top/ports + real spec copy) from the source file was ported
  into `elecioSceneV6.ts`'s public API (`setView`) but isn't wired to any UI yet — a real,
  ready-to-use feature for a future "explore the device" interaction if wanted.
- Verified functionally correct in this sandbox's software-rendered WebGL; not yet seen on a real
  GPU, where it should simply be faster, but worth a real-device check before calling it launch-
  ready.
- `PCFSoftShadowMap` logs a deprecation warning under `three@0.185` (falls back to `PCFShadowMap`
  automatically) — cosmetic (slightly less soft shadow edges), not fixed, not blocking.
- Palette sweep covered `src/components`; did not re-audit `src/app/[locale]/*/page.module.css`
  files beyond the ones already touched (contact, software) — worth a second pass if any page
  still shows light-theme artifacts.

---

<!-- Next entry goes below this line. Do not edit anything above. -->

## [2026-08-13.01] Auth/SMS/admin/blog architecture review — plan before implementation

**Trigger:** The user asked for login, logout, account creation, SMS-panel/OTP verification, an
admin-panel assessment of `https://github.com/eee7654/esima-builder`, a decision between WordPress
and a native Next.js blog, a complete SEO/security/UI/UX review, and proper implementation phases.
They explicitly asked for the plan and review first so they can decide what to build next.

### What was audited locally
- The project is Next.js 16.3 + React 19 + Ant Design + `next-intl`, with PostgreSQL through
  Knex/Objection. There is no installed authentication, password hashing, SMS, Redis/shared
  rate-limit, or admin framework package yet.
- The original nine migrations already include `admin_users`, `posts`, `categories`, `tags`, and
  `post_tags`. The current post schema is a useful head start: fixed fa/en title/excerpt/body,
  per-locale SEO title/description, cover image, author/category/tags, draft/published state, and
  publish date. The blog route itself is still a stub and the only public API routes are contact and
  download.
- `admin_users` was explicitly designed for a small internal Refine team and stores a password hash,
  but no session/login/recovery/authorization implementation exists. It should not become a second,
  disconnected auth system once a maintained authentication framework is added.
- The current rate limiter is a process-local fixed-window `Map`. That was an intentional low-cost
  choice for contact/download on one process, but it cannot safely enforce billable SMS abuse limits
  across restarts or multiple instances.

### External repository review — why it was rejected
Inspected repository metadata, full file tree, README, root and panel dependency manifests, auth
client/service, locale proxy, and builder page through the public GitHub API.

Findings:
- Created 2026-04-21; zero stars, forks, releases, or declared license. The README is still the
  generic Turborepo starter. Public source without a license does not grant a clear right to reuse it.
- This is an early visual page-builder experiment, not a complete admin/CMS. Its builder page saves
  demo JSON to `localStorage` under `esima-builder-demo`.
- The panel contains Better Auth/CASL-related client dependencies and service wrappers, but points at
  a separate localhost:4000/`/api/v1/panel` backend that is not in the repository. Its included proxy
  handles locale redirects, not admin authorization.
- It has no Elecio models/migrations, server-enforced blog CRUD, media pipeline, OTP provider,
  audit trail, tests, or production operations story.

Decision logged as D12: do not adopt or copy it. Keep the already-planned Refine + Ant Design admin
inside this app, with our own server-enforced APIs and access rules. The repository may be observed
as an experiment only.

### Architecture decisions recorded
- **Better Auth** selected (D9) instead of custom sessions. Its official Next.js integration mounts
  at `/api/auth/[...all]`; it supports a direct PostgreSQL connection, a phone-number OTP plugin,
  admin/2FA/passkey plugins, CSRF/origin protections, and configurable rate limiting. Its generated
  schema must be reviewed and represented in versioned Knex migrations before production.
- **Customer vs staff flows are intentionally different** (D10): customers use phone OTP; staff use
  an invite-only `/admin/login` with verified email plus password/passkey and mandatory MFA. There
  is no public admin registration and no SMS-only privileged access.
- **SMS remains a provider adapter** (D11): Kavenegar Verify/Lookup is the recommended first adapter
  after a live carrier/template/cost/SLA test. Elecio will not rebuild telecom billing/templates as
  an “SMS panel”; the admin shows only redacted operational status and audit events. OTP values are
  never logged or displayed.
- **One identity authority** (D14): migrate/supersede the current standalone `admin_users` password
  scaffold before real production data, preserving article authorship through a role/profile link.
- **Server-side RBAC** (D15): `customer`, `support`, `editor`, `admin`, and `owner`; Refine client
  visibility is UX only. Every protected mutation/query validates the current live session, action,
  object, and ownership at the server.
- **Native Next.js/PostgreSQL blog** (D13): keep and extend the schema already present. WordPress does
  not inherently produce better SEO; a headless WordPress installation would introduce another
  runtime, database/admin, patch surface, API/cache/webhook failure modes, and duplicated workflows.
  WordPress remains a fallback only if a future editorial team has a hard WordPress/plugin need.

### What changed in `doc/plan.md`
- Plan promoted from v1 to v2 and scope updated to include a useful customer account portal without
  silently absorbing checkout or ElecIO Manager.
- Added decisions D9–D16, current-stack changes, a local implementation-state audit, five owner
  decisions required before code starts, and Phases 7–13 with explicit deliverables and exit gates.
- Added the external-repository evidence table, target application/permission architecture, complete
  SEO plan, twelve-part security review checklist, and site/auth/blog/admin UI/UX and performance
  backlog.
- Corrected stale plan text that still described the superseded canvas-2D 3D renderer and old phase
  references.

### Security reasoning that materially shaped the plan
OTP is a short-lived authentication secret, not “just an SMS.” The plan therefore requires short
TTL, secure generation, single use, resend invalidation, attempt/send caps, no OTP logs, shared
abuse state, generic enumeration-resistant responses, trusted-proxy configuration, and provider
spend monitoring. Sessions stay in Secure/HttpOnly/SameSite cookies and are validated server-side;
tokens never go in `localStorage`. Privileged staff authentication adds MFA/passkeys, short sessions,
re-authentication, append-only audit events, and least privilege.

Rich blog content and media add separate risks, so the plan requires deterministic rendering plus
allowlist sanitization, validated/re-encoded uploads in object storage, safe SVG policy, generated
filenames, size/dimension limits, CSRF protection, and explicit publishing. Admin and preview routes
are noindex and excluded from sitemaps, but crawl controls are not treated as access control.

Primary technical references used:
- Better Auth: Next.js, PostgreSQL, phone-number, rate-limit, and security documentation.
- Refine: official Next.js authentication/access-control integration.
- OWASP: Authentication, MFA/OTP, Session Management, CSRF, File Upload, and API Security guidance.
- Next.js: Metadata/OG and sitemap conventions.
- Google Search Central: SEO starter, multilingual/hreflang, and Article structured data guidance.
- WordPress: official REST API handbook (used to confirm what a headless integration adds, not as a
  ranking advantage).
- Kavenegar's official client repository/API examples for Verify/Lookup.

### What was deliberately not implemented
No auth package, migration, SMS call, account page, admin screen, or blog engine was added in this
entry. The user asked for a plan/review before choosing what to execute. Starting implementation
would also require the account-purpose, SMS-provider credentials/template, staff roles/owner,
registration policy, object-storage, and deployment/proxy decisions now listed at the start of
Phase 7.

### Recommended next move
Approve or revise the five Phase 7 owner decisions, then implement Phase 7 (identity foundation and
shared abuse controls) before any polished login UI. That order prevents attractive screens from
cementing an unsafe or duplicated session/data model.

---

## [2026-08-13.02] Plan-history correction — restored v1 verbatim in place and moved expansion after it

**Trigger:** The user correctly clarified that the previous plan must never be deleted or rewritten;
the new account/auth/admin/blog plan must be added after it.

### Correction made
The prior entry changed the document's top-level status/scope/stack rows, inserted proposed D9–D16
into the original decision table, and replaced the original Phase 7–10+ block. Although the earlier
phases and much historical content were retained, replacing that block violated the requested
append-only planning history.

Restored the original material in its original position:
- Draft v1 status and marketing/content-site scope statement.
- Original D1 phase reference and original D1–D8-only decision table.
- Original 3D and admin-only-auth stack rows, including their historical/superseded wording.
- Original Phase 7 Blog/SEO/Admin CMS, Phase 8 Admin/Analytics, Phase 9 QA/Launch, and Phase 10+
  Post-Launch roadmap.
- Original Phase 7/8 Refine and Phase 7 TipTap references.

The newer work now begins only after the complete original plan under a visibly separate heading:
`Addendum — Account, OTP, Admin, Blog, SEO, and Security Expansion`. Its decisions use `A-D*`, its
phases use `Expansion Phase *`, and its supporting sections use `A1`–`A7`, preventing them from
silently masquerading as revisions to the v1 plan.

### Process rule carried forward
`doc/plan.md` now preserves the historical baseline first. Future scope proposals must be appended
as dated addenda unless the user explicitly authorizes consolidation or supersession. Journey logs
remain append-only and record any later adoption, rejection, or supersession.

---

## [2026-08-13.03] Expansion Phase 1 implemented — unified identities, Redis controls, RBAC, consent, and append-only audit

**Trigger:** The user approved implementation of “phase one,” interpreted from the immediately
preceding addendum as `Expansion Phase 1 — Identity and abuse-control foundation`.

### Exact scope implemented
- Added Better Auth's Next.js Route Handler at `/api/auth/[...all]`, direct PostgreSQL connection,
  database sessions, closed-by-default phone plugin configuration, strict endpoint rate-limit rules,
  exact-origin configuration, secure production cookies, and Next.js cookie integration.
- Added Redis-compatible secondary storage used by Better Auth for shared session/rate-limit state,
  plus a reusable fixed-window limiter implemented atomically with one Redis Lua operation. Redis is
  required/fail-closed; there is deliberately no silent in-memory fallback for authentication.
- Added centralized permission definitions and server helpers for `customer`, `support`, `editor`,
  `admin`, and `owner`. Client UI cannot grant roles; protected code calls live session/profile and
  `requirePermission` checks.
- Added Iranian mobile normalization supporting Latin, Persian, and Arabic digits and local/
  international formats. Canonical storage is `+98...`; display masking avoids exposing the full
  number.
- Added application profiles, consent evidence, and append-only audit events. Audit metadata is
  recursively bounded/redacted for password/passcode/OTP/token/secret/cookie/API-key names; raw IP
  is never persisted, and hashing is disabled rather than unsafely unsalted if `IP_HASH_SALT` is
  missing.
- Added auth lifecycle hooks: create a default customer profile and audit identity creation; update
  last login and audit session creation/revocation.

### One authoritative identity migration
Added `20260813000010_create_identity_foundation.ts`, one transaction that:
1. Creates Better Auth-owned UUID tables: `auth_users`, `auth_sessions`, `auth_accounts`, and
   `auth_verifications` with explicit snake_case mappings.
2. Creates Elecio-owned `user_profiles`, `user_consents`, and `audit_events` with constraints and
   indexes.
3. Adds a PostgreSQL trigger that rejects UPDATE/DELETE on `audit_events`.
4. Migrates any legacy `admin_users` identities/password hashes into Better Auth user/account rows,
   maps admin/editor roles to profiles, preserves timestamps, and maps article author foreign keys
   from integer IDs to UUID `author_user_id`.
5. Drops `admin_users` only after all migration steps succeed.

The `down` migration reconstructs the original `admin_users` table, maps staff identities and post
authors back, and then removes the new tables/trigger. Password-less staff added later receive an
explicit forced-reset marker on emergency rollback rather than an invented password.

### Dependency-security issue caught and resolved
The first Node-20-compatible attempt pinned Better Auth 1.5.3 because the latest unconstrained
dependency resolution pulled Kysely 0.29.5, which requires Node 22. `npm audit` then exposed a
package-level critical advisory range for Better Auth ≤1.6.21. That was not waived simply because
some advisories concerned plugins not enabled here.

Resolved by installing exact `better-auth@1.6.22` (outside the reported range) and exact
`kysely@0.28.17`, whose declared runtime is Node >=20. This preserves the project's Node 20 runtime
and finishes with zero dependency vulnerabilities. The exact installed API was checked through
package type declarations before coding.

### Database verification performed, not assumed
Against the configured local development database:
- Applied migration batch 2 successfully.
- Inspected expected tables/counts, confirmed `posts.author_user_id` replaced `author_id`, and
  confirmed UPDATE and DELETE trigger coverage.
- Rolled batch 2 back and verified only `admin_users` plus `posts.author_id` returned.
- Reapplied batch 2 so development ends in the new identity state.
- In a deliberately failing transaction, inserted a temporary audit event and attempted to update
  it; PostgreSQL raised the append-only exception and the whole transaction rolled back. Confirmed
  zero verification test rows remained.

There were no legacy admin rows or posts locally, so the empty-data path was exercised end-to-end;
the non-empty row mapping remains encoded transactionally and must also be rehearsed on a staging
copy before production as documented in the runbook.

### Verification results
- `npm test`: 6/6 pass (Iranian phone formats/rejections/masking and RBAC boundary cases).
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run build`: pass on Next.js 16.3; `/api/auth/[...all]` appears as a dynamic Node route.
- `npm audit --omit=dev`: zero vulnerabilities (full install audit also reported zero after upgrade).
- Migration apply/rollback/reapply and audit immutability checks: pass.

### Operational documentation and intentional boundaries
Added `.env.example` entries and `doc/identity_foundation.md` covering secrets, Redis, proxy-header
trust, table ownership, migration deployment, backups/restores, retention decisions, and acceptance
checks. Real secrets were not generated into the repository.

Phase 1 intentionally does **not** send SMS or expose customer login pages. The phone plugin's
`sendOTP` fails closed with `SMS_OTP_NOT_CONFIGURED` until Expansion Phase 2 implements and verifies
the approved SMS provider. Better Auth email/password is also disabled at this foundation stage;
staff email/password/passkey/MFA belongs to Expansion Phase 3. The original contact/download
process-local limiter remains scoped to those existing routes; auth and the new shared limiter never
use it.

## 2026-08-13.04 — Expansion Phase 2 customer OTP and account

Implemented the customer-facing passwordless account phase without replacing the Phase 1 identity
foundation. Added an Elecio-owned request/resend/verify gateway around Better Auth; raw phone plugin
endpoints require a server-derived HMAC header and otherwise return not found. The gateway
normalizes Persian/Arabic/Latin digits, stores raw phone flow state only in a signed HttpOnly
SameSite cookie, binds versioned terms/privacy consent to a short-lived database intent, requires an
exact trusted Origin, and uses Redis for phone/IP cooldown, daily, and verification-attempt limits.

Added a typed Kavenegar Verify/Lookup adapter with abort timeout and redacted errors, a fail-closed
disabled provider, a production-rejected non-sending development provider, and
`CUSTOMER_REGISTRATION_ENABLED` as the emergency SMS kill switch. Codes and provider secrets are
never logged or stored by Elecio application code. Resend replaces the intent; successful verify
consumes it transactionally, records consent, and safely claims exact phone-matching historical
contact/download records.

Added localized, responsive login and verification pages with masked phone, OTP autofill/paste,
edit-number, resend timer, and generic errors. Added protected account overview/profile/security,
consent and owned history, sanitized active sessions, revoke one/others/all, explicit logout, and
create/cancel deletion requests. Added noindex metadata, terms/privacy pages, and a desktop account
entry while keeping the crowded mobile header unchanged (account remains in its drawer).

Database migration `20260813000011_create_customer_account_flows.ts` creates OTP intents and
deletion requests and adds nullable user ownership to contact/download records. It passed local
apply, rollback, and reapply. Verification: 7/7 unit tests pass; typecheck passes; lint passes;
Next.js 16.3 production build passes with all new routes; `npm audit --omit=dev` reports zero
vulnerabilities. The build correctly surfaced that this checkout still lacks real Better Auth URL/
secret values; no secret was invented or committed.

Production release remains gated on approved legal/retention wording, real Kavenegar credentials and
template, production Redis/secrets/origin/proxy configuration, isolated end-to-end wrong/expired/
replayed/rate/session tests, staging delivery, and physical mobile/accessibility QA. The exact
configuration, security behavior, deployment order, and acceptance matrix are in
`doc/customer_account.md`.

## 2026-08-13.05 — Expansion Phase 3 staff security and admin

Implemented the invite-only staff identity path without adding public registration or weakening the
customer OTP gateway. Better Auth email signup now requires a server-derived staff gateway header;
email sign-in accepts active support/editor/admin/owner identities only. Added a one-time owner
bootstrap command that refuses to run after an owner exists, plus 48-hour 256-bit invitation tokens
stored only by hash. Production invitations and password recovery use a typed Resend adapter with
timeout/fail-closed behavior; development sends nothing and discloses the invite URL only to the
authorized owner response.

Added mandatory Better Auth TOTP with a locally rendered QR, one-time recovery codes, no trusted-
device bypass, five-attempt account lockout for 30 minutes, and no admin data before enrollment or
second-factor completion. Staff sessions are reduced to 12 hours in PostgreSQL. Password reset is
enumeration-resistant, repeats the strong-password policy, and revokes all sessions. Owner staff
changes require a session created within ten minutes, reject self/owner changes, revoke target
sessions, and write append-only audit events.

Migration `20260813000012_create_staff_admin_foundation.ts` adds the Better Auth MFA field/table,
one-factor-record-per-user constraint, staff invitations, and lead/download assignment ownership.
It passed local apply, rollback, and finalized reapply. The owner bootstrap deliberately was not run
because this checkout contains no authorized production owner credentials.

Built a separate localized/noindex admin experience (the public header/footer are suppressed) with
role-aware navigation and server checks at each data access point. Modules expose actionable,
permission-scoped counts; assigned leads and status; post publication state plus taxonomy/partner/
testimonial inventory; customer directory; owner-only invitations/access changes; secret-free
provider health; bounded database-linked media inventory; and the append-only audit trail. Media is
read-only until Phase 4 implements the secure upload pipeline; rich editing/revisions likewise remain
in the Phase 4 CMS rather than storing arbitrary HTML.

Verification: 11/11 unit tests pass, including invitation entropy/hashing, password strength, owner
coverage across every resource/action, and key support/editor/admin boundaries. Typecheck and lint
pass. Next.js 16.3 production build passes with 72 generated routes/pages, including all admin and
staff-auth routes. `npm audit --omit=dev` reports zero vulnerabilities. Migration rollback/reapply
passes. The build again reports that real Better Auth URL/secret values are absent from this local
checkout; no credentials were invented or committed.

Production release remains gated on real Resend/domain delivery, production secrets/Redis/origin/
proxy setup, isolated endpoint-level role/object tests, invite/replay/lockout/recovery/session-expiry
drills, physical authenticator/mobile/accessibility QA, monitoring, and owner/offboarding procedures.
The exact bootstrap, security model, module boundaries, and rollout checklist are documented in
`doc/staff_admin.md`.

## 2026-08-13.06 — Expansion Phase 4 native bilingual blog CMS

Replaced the blog placeholder with a server-rendered Persian/English journal and article routes.
Public queries default-deny drafts, future schedules, and unavailable translations. Articles now
have localized metadata, canonical/alternate URLs, Open Graph article fields, Article JSON-LD,
author/date/category/tags, accessible covers/captions, readable structured content, useful 404s, and
permanent redirects from every recorded historical slug.

Implemented a TipTap structured editor inside the Phase 3 MFA/RBAC admin with separate fa/en editing,
explicit translation completeness, taxonomy, SEO fields, schedules, cover upload, draft/publish,
private preview, and revision history. Every create/save/restore writes an immutable accountable
snapshot; restore creates a new unpublished revision rather than rewriting history. Publish and slug
changes revalidate both locale indexes and affected article paths.

Added a strict server document policy and deterministic React renderer. It permits a small set of
semantic blocks/marks and safe local/HTTP(S)/mailto links while bounding depth, children, text, JSON
size, heading levels, and attributes. Unknown/executable nodes, event attributes, arbitrary HTML,
unsafe protocols, data/SVG images, and protocol-relative images cannot reach public output. Tests
cover allowlisting, URL rejection, malformed roots, plain-text extraction, and slug policy.

Migration `20260813000013_create_native_blog_cms.ts` adds translation/schedule/update/revision/cover
metadata, baseline and future immutable revisions, slug history, hashed 15-minute previews, and
checksummed media metadata. It passed local apply, rollback, and reapply. Existing posts receive a
baseline revision transactionally.

The media route enforces MFA/RBAC, Origin, shared Redis throttling, 10 MiB and 40-megapixel limits,
JPEG/PNG/WebP/AVIF decode, EXIF rotation, 2400px bounding, metadata-stripping WebP re-encode, UUID
exclusive filenames, SHA-256, dimensions/bytes/MIME, and localized alt/caption. The first selected
Sharp 0.34.4 immediately produced a high-severity libvips audit finding. The workspace dev process
was identified and stopped because it locked the native DLL; Sharp was upgraded to patched 0.35.3.
Final production audit reports zero vulnerabilities. The dev server was intentionally not restarted.

Verification: 14/14 unit tests pass; typecheck and lint pass; migration apply/rollback/reapply passes;
Next.js 16.3 production build passes with 78 pages/routes including CMS, preview, and dynamic blog;
`npm audit --omit=dev` reports zero vulnerabilities. Build warnings correctly remain for absent real
Better Auth URL/secret in this checkout; no secret was fabricated.

Production release remains gated on persistent or object storage (local `public/uploads` is not safe
for immutable/serverless deployments), upload/polyglot/bomb/malware attack testing, isolated CMS
concurrency and endpoint-role tests, timezone boundary tests, Rich Results/canonical/redirect checks,
editorial content QA, and physical keyboard/screen-reader/mobile verification. The operational and
security contract is documented in `doc/native_blog_cms.md`.

## 2026-08-13.07 — Expansion Phase 5 SEO, accessibility, performance, and privacy

Implemented the crawl/index foundation with canonical-origin configuration, robots, a database-
backed localized sitemap, manifest, localized route canonicals/hreflang, and social metadata.
Article alternates now default deny unpublished translations. Static sitemap freshness no longer
changes on every request.

Removed the largest measured homepage bandwidth and rendering costs: the hero mounts one viewport
image instead of all five; WebGL lazy-mounts near view, stops offscreen/hidden, caps DPR, and gives
reduced-motion, <=4 GB/4-core, or unsupported devices a static fallback. Reduced-motion story
sections no longer preserve multi-viewport tracks. Re-encoded three oversized assets without
changing content: 1.52 MB -> 64.7 KB logo, 997 KB -> 67.7 KB light logo, 347.5 KB -> 55.4 KB
header mark, and the 4000 px 1.17 MB operator photo -> 1600 px 173.9 KB. Local partner logos use
responsive image optimization.

Added the skip target, visible keyboard focus, minimum control targets, roving hero-tab focus, and a
named video dialog with localized close label, iframe title, Escape handling, focus entry, and focus
restoration. Compatibility colors now use the semantic light/dark palette.

Added explicit opt-in anonymous conversion measurement. Decline sends nothing; consent is
reopenable. Requests omit credentials and accept reviewed names plus locale only. Migration
`20260813000014_create_privacy_safe_conversion_counts.ts` stores UTC-day/event/locale counts only—
no IP, phone, email, URL, referrer, account, session, device, or free text. The endpoint uses
same-origin enforcement and ephemeral hashed abuse limiting. Contact and download success are
wired; a unit test freezes the event allowlist.

Migration 14 passed apply, rollback, and final reapply. Verification: 15/15 tests, typecheck, lint,
and the Next.js 16.3 production build pass with 81 generated routes/pages; the production dependency
audit reports zero vulnerabilities. Build warnings correctly remain for missing local Better Auth
URL/secret values; no secret was fabricated. Detailed budgets/privacy and the issue register are in
`doc/phase5_seo_ux_performance.md` and `doc/ui_issue_register.md`. Physical 320–430 px, Android,
NVDA/VoiceOver, forced-colors/zoom, deployed CWV, real-origin canonical/Rich Results, and consent
network checks remain release gates; source inspection cannot truthfully mark them passed.

## 2026-08-13.08 — Visible staff password entry and local demo administrator

Made the existing email/password staff gateway discoverable from the public OTP login without
turning customer accounts into password accounts or weakening the server rule that credential
sign-in is staff-only. The public login now presents a localized “email and password” staff/admin
option leading to the existing secure admin login.

Added an explicitly insecure, reversible local demo seeder for the requested `admin@admin` /
`admin` credentials. It refuses unless both `NODE_ENV=development` and
`ALLOW_INSECURE_DEV_ADMIN=true`, creates only the `admin` role, refuses to overwrite identities it
did not create, invalidates sessions on reseed, and has a matching removal command. It is not a
hidden authorization bypass: MFA enrollment, RBAC, short staff sessions, and restricted staff/
integration management remain enforced. The local `.env` flag was enabled and the demo identity
was seeded; direct database verification confirmed the active admin role and password hash without
printing the hash. The flag/account must be removed before any shared or production deployment.

Endpoint verification then found two integration realities hidden by source-only tests. First,
Better Auth correctly rejects `admin@admin` as an invalid email, so local UI maps that exact typed
alias to the valid internal identity `admin@admin.local` only when demo mode is server-enabled.
Second, real database-backed sign-in exposed missing PostgreSQL UUID defaults on Better Auth tables;
migration `20260813000015_add_auth_uuid_defaults.ts` corrects those defaults and passed apply,
rollback, and reapply. The existing local environment also lacked Redis, so the same strict demo-
only gate permits an in-process TTL secondary store; every other environment remains fail-closed.
A fresh real HTTP sign-in returned 200, the expected internal demo identity, and session cookies.

## 2026-08-13.09 — Complete admin content operations and five initial articles

Extended the native admin rather than introducing a disconnected dashboard template. The content
library now has audited CRUD for categories, tags, partners, and testimonials, including ordering
and active visibility. The media area is now a working optimized upload/library/delete surface and
refuses deletion while an article still references an asset. Its rate limiter uses an in-process
development fallback only behind the same explicit insecure-demo gate; production remains Redis-
backed and fail-closed.

Completed the article workflow: a new article can be saved as a draft or published immediately;
publication validates the declared bilingual state and permissions, scheduling is persisted, cover
alt text and captions are editable, redirects/revisions remain recorded, deletion is audited, and
public blog paths are revalidated. Added a protected permanent-delete danger action to the editor.

Added the idempotent `content:seed-initial` command. It created five complete Persian/English,
published CNC articles covering DNC transfer, Fanuc RS-232, Siemens transfer, backup/security, and
downtime reporting, with three categories, ten tags, existing optimized covers, SEO data, tag
relationships, and an initial revision. Running it twice still reports exactly five initial posts.

Superseding the local-demo behavior recorded in entry 08: the user explicitly requested direct
temporary access and was blocked by the MFA screen. The disposable demo identity is now reseeded as
local `owner` so every panel section can be exercised, removes any demo TOTP row, and bypasses MFA
only when development mode plus `ALLOW_INSECURE_DEV_ADMIN=true` are both active. Normal staff and
all production environments retain mandatory MFA. HTTP verification returned 200 for sign-in,
authenticated owner status, and every admin route; all five articles returned 200 in both locales.

Verification at this point: typecheck passes, lint passes, 15/15 tests pass, the seed is idempotent,
and all requested admin/content routes pass authenticated HTTP checks. The production build is the
remaining final validation for this entry.

Final validation completed: the Next.js 16.3 production build compiled, type-checked, and generated
all 84 pages successfully, including every admin, CMS API, and bilingual blog route.

## 2026-08-13.10 — Localized catalogues and optimized landing video backgrounds

Connected both English catalogue files supplied in `media` to every English download path. Direct
learning-center links now select the English catalogue and English feature sheet, while the lead-
capture download endpoint resolves the returned PDF by the submitted locale. Persian links remain
on the existing Persian files. Hash comparison confirmed that the public English copies exactly
match the supplied source PDFs.

Made the header logo theme-aware: light mode uses `logo_light.png`, while dark mode keeps the
high-contrast white-mark asset, with separate desktop/mobile sizing to preserve the compact header.

Moved the two supplied eight-second portrait product videos into the public video directory and
re-encoded them as muted H.264/YUV420p, 540×960, 24 fps, fast-start MP4 background loops with audio
removed. Video 1 fell from 3,797,376 to 406,484 bytes and video 2 from 4,178,957 to 424,907 bytes—
approximately 90% smaller. The carousel uses video 1 for its first and last states and video 2 for
its second state. Only the active, onscreen video mounts; still images remain as loading/error and
reduced-motion fallbacks. Mid-video frame inspection confirmed both compressed outputs remain clear.

Lint and TypeScript validation pass. A final production-build attempt was stopped after the machine
again exhausted its available disk while producing `.next`; the incomplete build output was removed.
This is an environment-capacity failure rather than a compile/type error, but a production build
should be rerun after freeing disk space.

The first light-header integration exposed the source logo's oversized transparent canvas, making
the visible mark appear tiny even at the intended CSS dimensions. Created a tightly trimmed,
alpha-preserving 420×125 WebP derivative and updated the header to render the actual mark at 112px
desktop, 82px mobile, and 74px on very narrow screens.

Normalized the dark header asset from that exact light-header geometry rather than using the older,
differently proportioned dark source. The symbol, wordmark bounds, intrinsic 420×125 dimensions,
and shared CSS width/height are now identical in both themes; only the wordmark pixels change from
black to white.

## 2026-08-13.11 — Persian SEO content planning workbook

Reviewed the user-supplied Tiandy spreadsheet and `Blog Prompt.docx`, then created an ElecIO-specific
Persian SEO workbook instead of copying the competitor structure. The deliverable contains nine
visible RTL sheets: usage guide, KPI dashboard, keyword map, 12-week content calendar, lookup-driven
article brief, target/Pillar pages, internal-link map, weighted quality checklist, and a reusable
ElecIO content prompt. It includes 60 CNC/DNC topics, the five already-published bilingual articles,
SEO titles/descriptions/slugs, intent/funnel/priority, suggested heading structures, sources, CTAs,
publication workflow, dropdown validation, conditional formatting, filters, formulas, and two
dashboard charts.

Search volume, difficulty, rank, clicks, impressions, and CTR were deliberately left blank for real
Search Console/Keyword Planner data rather than fabricated. The generated XLSX passed ZIP/package
integrity, workbook reopen, sheet/topic counts, formula, table, validation, chart, hidden-list, and
last-record assertions. The reproducible generator is `scripts/build-seo-content-planner.py`; the
final workbook is `deliverables/Elecio_SEO_Content_Planner_FA.xlsx`.

## 2026-08-13.12 — Blog SEO authoring controls and structured metadata

Audited the native blog editor before accepting the user's first prepared article. The existing
workflow already covered bilingual titles and bodies, slug, excerpt, category/tags, optimized cover
media with localized alt/caption text, draft/preview/publish/scheduling, revisions, and redirects,
but it did not expose enough deliberate SEO control for a professional editorial handoff.

Added persisted bilingual focus and secondary keyword fields, optional canonical URLs, an explicit
index/noindex control, selectable Article/BlogPosting/TechArticle schema, and independent Open Graph
titles and descriptions. The editor now presents length feedback, a light/dark-safe Google result
preview, an expandable social-metadata area, and a concise live SEO-readiness checklist covering
slug, keyword, title/description ranges, category, and cover alt text. Focus keywords are editorial
planning data—not obsolete `meta keywords` output.

Public article metadata now consumes the canonical, robots, Open Graph, and schema settings. Article
JSON-LD remains automatic, while an FAQ section written as an H2 followed by H3 questions generates
FAQPage JSON-LD without asking editors to duplicate content into a separate form. Restoring an old
revision preserves SEO fields that did not exist in that historical snapshot. A database migration
added the new columns and schema-type constraint and was applied successfully.

Verification: TypeScript passes, lint has no errors (one pre-existing unused-disable warning in the
theme context), and all 17 tests pass, including new Persian FAQ extraction and no-FAQ coverage. An
attempt to add TipTap's optional table extension was abandoned after an npm network reset; no table
code or partial dependency was retained, and the affected esbuild executable was rebuilt and the
suite rerun successfully. Tables in supplied source documents should therefore be editorially
converted to accessible lists/cards until the official extension can be installed under stable
network conditions.

## 2026-08-13.13 — EN-EC-001 CNC file-transfer publication import

Imported the supplied `Elecio_EN-EC-001_CNC_File_Transfer.docx` into the existing
`cnc-file-transfer-guide` CMS record as a reviewable draft. The import retained the full article
content as 124 structured blocks / 3,526 rendered words, including 11 H2 sections, troubleshooting,
practical checklist, 10-question FAQ, and all three technical references. Editorial metadata and
link-suggestion material before the source document's H1 were deliberately excluded from the public
body. The three approved ElecIO internal anchors were inserted contextually in the relevant sections.

The source's four Word tables were transformed losslessly into mobile-friendly H3/list groups while
the native TipTap table extension remains unavailable. The post now carries the requested English
SEO title, 142-character meta description, focus/secondary keywords, canonical URL, index setting,
TechArticle schema, independent Open Graph copy, optimized existing cover with English alt text, a
dedicated CNC Technical Guides category, and eight normalized tags. The previous short seeded article
remains recoverable as revision 1; this complete import is revision 2 and remains `draft` until the
user approves publication.

Direct database verification confirmed all six intended links, the SEO values, Draft status, content
counts, tags, and revision history. The FAQ extractor was expanded to recognize the English
“Frequently Asked Questions” heading as well as Persian FAQ headings.

## 2026-08-13.14 — Staff-aware global header and home section dock

Restored the shared public header across authenticated admin-panel routes instead of suppressing it
for every `/admin` path. The header now checks the no-cache staff-session status and exposes a compact
localized Admin panel button next to the account icon only for authenticated staff; on mobile the
same destination appears inside the drawer to preserve the carefully constrained top-bar width.
Anonymous and ordinary customer sessions do not receive the staff shortcut.

Reused the product page's liquid-glass section dock on the landing page, with localized Start,
Smart DNC, Solutions, Results, Learn, and Contact stops. Existing landing components were grouped
under stable section anchors without duplicating content, and the dock follows the active scroll
section, centers the selected item, and retains reduced-motion behavior. The shared dock now accepts
an accessible page-specific label and keeps physical left-to-right indicator geometry independent
of Persian text direction.

TypeScript passes, lint has no errors (the existing theme-context warning remains), and all 18 tests
pass after these navigation changes.

## 2026-08-13.15 — Bilingual editor clarity for EN-EC-001

Investigated the user's report that the imported publication appeared truncated. A direct source-to-
database comparison found 3,404 words in the DOCX article from its H1 onward and 3,526 rendered words
in the stored English CMS document; the small increase is from accessible table labels and the three
approved internal links. The stored opening paragraphs, final references, 174 source segments, and
all article sections match the supplied English file. What the user saw was the old short Persian
seed because the editor always opened its Persian tab first.

The bilingual editor now counts and displays words on both language tabs, automatically opens the
substantially more complete language, visually distinguishes the active tab, and shows an explicit
warning when one translation is much shorter. EN-EC-001 is now honestly marked `en_only` because the
supplied publication is English and the legacy Persian seed is not a complete translation; it must
not be presented as a completed bilingual article. TypeScript passes and lint remains error-free
apart from the existing unrelated theme-context warning.

## 2026-08-13.16 — Complete Persian EC-001 and new shop-floor 3D story

Found and imported the user's new Persian publication `انتقال-فایل-CNC-راهنمای-کامل.docx` into the
same bilingual article. Its 3,833 rendered words, three comparison/checklist tables, 10 FAQs, and all
public article sections are now stored; the closing internal-link suggestions, external-source
suggestions, and keyword-research note were correctly treated as editorial instructions rather than
public prose. The embedded metadata supplied the Persian focus/secondary keywords, 154-character
description, SEO/Open Graph copy, cover alt text, and canonical. Three contextual Persian internal
links were added. The article is now `complete` and `published`; live HTTP checks return 200 for both
`/fa/blog/cnc-file-transfer-guide` and `/en/blog/cnc-file-transfer-guide`. The English side remains
3,526 words and both languages produce 10 FAQ entries.

Integrated the three newly supplied browser-3D files (`elecio-story.html`, `elecio-viewer.html`, and
`elecio-device.js`) as local first-party assets. The story now appears immediately after the landing
hero and lazy-initializes near the viewport. Parent-page scroll drives the iframe's six-beat scene
through same-origin messaging, while pointer events remain with the page to avoid nested-scroll lag
on mobile. The exact compatible Three.js r128 runtime is self-hosted, removing CDN dependence. The
previous scroll-orbit product section moved below the complete “Just fit your case” persona section
and before the feature list.

TypeScript passes; both article routes, the landing page, and all 3D asset paths return HTTP 200;
lint has no errors (one pre-existing theme-context warning); and all 18 tests pass. Raw and deployed
classic 3D/vendor scripts are excluded from ESLint because they are browser assets rather than Next
application source.
