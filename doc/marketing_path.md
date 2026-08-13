# Elecio Smart DNC — Marketing Path

This is the go-to-market companion to [`plan.md`](./plan.md) (technical build) and
[`business_path.md`](./business_path.md) (business decisions this depends on). It exists so the
website isn't built first and "marketed" as an afterthought — persona pages, blog topics, and CTAs
in `plan.md` are written to serve the strategy here, and this strategy is written against the real
product facts audited in `plan.md` §4, not generic B2B SaaS playbook filler.

**A note on approach:** you asked specifically for real psychological/sales tools, not "make it
look artificial." Everything below is grounded in classical, well-established selling principles
(Cialdini's influence triggers, JTBD framing, funnel-stage content matching) applied to *your
actual product facts* — not invented claims. Where a tactic would require a claim we can't yet
back with real numbers, it's marked `[NEEDS REAL DATA]` rather than filled with a placeholder.

---

## 1. Positioning foundation

**The core insight, straight from your own product catalog** (not invented for this doc): the
catalog's own headline is *"کامپیوتر کمتر. کابل کمتر. توقف کمتر."* — "Less computer. Less cable.
Less downtime." That's already a tight, three-part value proposition built on **loss aversion**
(the thing being removed — cables, PCs, downtime — is the pain, not the product itself). The
website's job is to make that concrete for three different buyers who feel that pain differently.

| Persona | What they actually fear/want (Jobs-to-be-Done) | Primary trigger | Real proof point available |
|---|---|---|---|
| **Business Owner** | Downtime costs money; adding headcount to babysit file transfers doesn't scale; wants provable ROI, not a "cool gadget" | Loss aversion + authority | The catalog's own downtime formula (shift time − actual run time = time worth investigating) is a real, non-marketing calculation — use it as-is, not dressed up |
| **Programmer / Technical Office** | Needs this to actually work with their specific controller (Fanuc/Heidenhain/Siemens/...) and not create new failure modes; skeptical of vendor claims | Authority + specificity | Real protocol-level detail (LSV2, XON/XOFF, RTS/CTS, TNC Server compat) — this persona is convinced by precision, not enthusiasm |
| **Machine Operator** | Doesn't want new complexity added to an already-busy shift; wants something that "just works" | Simplicity + reduced cognitive load | Real operator-side UI design intent ("اپراتور بدون پیچیدگی فایل را دریافت و اجرا می‌کند") |

This is why the persona-page structure in `plan.md` Phase 4/5 isn't three copies of the same page
with a different header — each persona needs a **different trigger and a different proof point**,
not just different words for the same pitch.

## 2. Trust architecture (Cialdini principles, applied to real assets you already have)

- **Authority** — named engineers with real phone numbers, real academic/professional backgrounds
  (K.N. Toosi University control/mechatronics lineage), not an anonymous "our team." Keep this
  visible, don't bury it on a generic About page.
- **Social proof** — video testimonials already exist on Aparat; partner company logos already
  exist. `[NEEDS REAL DATA]`: the specific customer-count/device-count/uptime stats need
  refreshing before republishing (`business_path.md` §6) — a real, smaller, current number beats a
  stale impressive one; an inflated stale stat is a trust *liability* the moment a technical buyer
  checks it.
- **Consistency/commitment** — the free PDF catalog/spec sheet download (already exists,
  `doc/*.pdf`) is a legitimate reciprocity/micro-commitment device: it costs the visitor almost
  nothing, gives real value, and their email becomes a lead — but only if the download is honestly
  gated (real content, not a bait-and-switch) and the "Phase 6" backend actually captures it
  (unlike the old site's simulated form).
- **Local/cultural trust markers specific to this market** — Enamad certification badge (once
  confirmed current, per `business_path.md` §3) matters more here than any Western trust badge
  would. Don't substitute SSL padlocks or generic "secure checkout" icons for it.
- **Scarcity/urgency — deliberately *not* used as a primary lever.** This is a considered,
  technical, durable-goods B2B purchase with a real evaluation cycle (compatibility checked before
  sale, per the catalog's own footer note). Manufactured urgency ("only 3 left!") would read as
  false and damage the authority positioning above. Use urgency only where it's real (e.g. a
  genuine seasonal service slot or batch-production lead time, if one exists).

## 3. Funnel × Content map

| Stage | Business Owner content | Programmer content | Operator content | Format |
|---|---|---|---|---|
| **Awareness** | "What downtime is actually costing your shop" (uses the real downtime formula) | "Why RS232 + long DNC cables fail in industrial environments" | (Operators rarely search top-of-funnel — reached via owner/programmer content or in-person) | Blog |
| **Consideration** | ROI comparison: cabled DNC vs. Elecio Smart DNC | Controller-specific setup guides (Fanuc, Heidenhain LSV2 vs TNCRemo, Siemens, Mitsubishi, Haas, Charmilles) | Short video: "a day in the life with Elecio" | Blog + video (Aparat) |
| **Decision** | Business Owner persona page → external order page (per `plan.md` D1) | Programmer persona page + full spec/`/product` page | N/A (rarely the purchase decision-maker) | Persona pages |
| **Retention/Advocacy** | Case study features, partner program formalization | Software changelog / release notes (ElecIO Manager updates) | Setup/tutorial video hub (`/tutorials`, already has real content basis in `old/`'s SetupGuideSection) | Blog + `/tutorials` |

## 4. SEO strategy

### 4.1 Why this product has an unusually good organic-search opportunity
Two real, specific facts from the audited software feature list make this stronger than a generic
"CNC accessories" SEO play:
- The product explicitly positions as **an alternative to TNCRemo** for Heidenhain LSV2
  connections — "TNCRemo" is a specific, named competitor tool that Heidenhain-controller shops
  actively search for. A dedicated `/blog/tnc-remo-alternative-iran` (or fa-equivalent slug) style
  piece targets real, high-intent search traffic from people already trying to solve this exact
  problem.
- Controller names themselves (Fanuc, Heidenhain, Siemens, Mitsubishi, Haas, Charmilles) are
  real long-tail keyword anchors — "DNC فانوک", "ارسال برنامه CNC بی‌سیم", "جایگزین کابل DNC" — 
  each controller/persona combination is a plausible blog topic *and* a plausible internal-link
  target from the Programmer persona page.

### 4.2 Content pillars (feeds the Phase 7 blog engine)
1. **DNC/CNC connectivity education** — top-of-funnel, Business Owner-adjacent (what is DNC, why
   long serial cables fail, what port damage actually costs).
2. **Controller-specific how-tos** — one cluster per supported controller, Programmer-facing,
   highest-intent long-tail SEO.
3. **Case studies** — real customer/partner stories (Pars Techno, PIM, Sanat Pazhohan Parseh,
   Techno Sanat Alizadegan relationships, pending their re-confirmed consent per `business_path.md`
   §6).
4. **Product/software updates** — ElecIO Manager release notes; keeps the blog visibly active
   (a real freshness/authority signal to search engines, and to skeptical technical buyers).
5. **Manufacturing efficiency / Industry 4.0 context** — broader awareness content connecting to
   the Business Owner's ROI framing without being controller-specific.

### 4.3 Technical SEO (executed in `plan.md` Phase 7 — listed here so content and engineering stay
in sync)
`hreflang` fa/en pairs, JSON-LD (`Organization`, `Product`, `Article`), dynamic sitemap, per-page
OG images, Persian-search-friendly URL slugs (transliterated or fa-native — **[DECISION NEEDED]**:
confirm slug language convention before Phase 7 content entry begins, changing it later means
redirects).

### 4.4 Search engine reality check for this market
Google dominates, but **do not skip Bing Webmaster Tools entirely** (kept as lower-priority per
`business_path.md` §4) and verify whether any Iran-specific search behavior (e.g. heavy reliance on
Telegram/Instagram search *instead of* Google for some B2B discovery) changes channel priority —
this is a `[DECISION NEEDED]`/local-knowledge check, not something to assume from generic SEO
advice.

## 5. Channel plan

| Channel | Status | Role |
|---|---|---|
| **Organic search** | New investment (blog didn't exist before) | Primary long-term channel — highest-intent, compounds over time |
| **LinkedIn** | Exists (`linkedin.com/company/elecio`) | Business Owner reach — B2B decision-makers, case studies, partner announcements |
| **Instagram** | Exists (`@Elecio_ir`) | Visual proof — factory installs, before/after cable mess, short demo clips |
| **Telegram** | Exists and active (`t.me/elecio_shop`) — may already function as an informal sales/support channel per `business_path.md` §2 | Direct customer relationship + distribution for new blog/tutorial content to an existing warm audience |
| **Aparat** | Exists (testimonial videos already hosted there) | Tutorial/how-to video SEO *within* Iran — Aparat has its own search surface worth targeting directly, not just as a YouTube substitute |
| **Partner/reseller network** | Exists informally (e.g. Sanat Pazhohan Parseh installing across client workshops) | `[DECISION NEEDED` per `business_path.md` §7`]` — formalizing this into an actual referral/channel-partner program is probably the highest-leverage *non-digital* growth lever available, given it's already happening organically |
| Trade shows / industry associations | Unconfirmed | `[DECISION NEEDED]` — flag if relevant machine-tool/manufacturing trade events exist that are worth a presence; not assumed here |

## 6. Asset gaps worth closing (beyond what's already in `media/` and `doc/`)

*Updated 2026-08-06 after actually viewing the files (see `plan.md` Phase 0) — corrects the
earlier assumption below that the renders vs. phone photos was a tone-mismatch problem to manage.
It isn't: both are usable, for different, complementary purposes.*

- The 8 `ChatGPT Image ...png` studio renders (both black and white device variants, correct
  branding, clean industrial/white backgrounds) are launch-ready primary product imagery — use
  for hero, product, and persona-page contexts.
- The 2 phone photos are a real asset, not a fallback: one is a clean flat-lay comparison, the
  other shows the device mounted with its OLED screen genuinely legible (IP address, live Wi-Fi
  network list) — this is the "proof it's real, not a render" shot, worth using deliberately
  (e.g. on the Operator persona page or a trust-building "this is the actual interface" callout)
  rather than treating it as a lesser-quality backup to the renders.
- **Real defect found:** the current live site's own hero image is an AI-generated render with
  garbled logo/button text (a known AI-image failure mode) that shipped to production — being
  replaced outright by the new renders, not just supplemented.
- **Real gap found:** there are no actual screenshots of ElecIO Manager (the Windows/Android/Web
  management software) anywhere in the repo — the current site uses a generic placeholder
  dashboard mockup in its place. The `/software` page (`plan.md` page inventory) needs real
  screenshots before it ships; this is a content-collection task for you, not something I can
  source.
- The two existing demo videos (`Smart_DNC_connects_CNC_machines_*.mp4`) are almost certainly
  landscape-oriented — worth a vertical/square re-cut for Instagram Reels/Stories and Telegram,
  since re-cutting existing footage is far cheaper than reshooting.
- A **comparison one-pager** (Elecio Smart DNC vs. manual USB/cable transfer vs. TNCRemo) doesn't
  exist yet — this is a sales-enablement asset the Programmer persona page and blog content both
  benefit from, and it's a short, high-leverage thing to produce once stats are refreshed.
- Written **case studies** from the 4 partner relationships (pending consent) would outperform
  generic testimonials for the Business Owner persona specifically — testimonials establish
  likability, case studies establish ROI, and this persona needs the latter more.

## 7. Priority & sequencing

Marketing work does **not** need to wait for the full site to ship — sequenced against `plan.md`'s
phases so nothing sits idle:

**Can start now, in parallel with `plan.md` Phase 0–2 (no site dependency):**
1. Resolve the `[DECISION NEEDED]` stats refresh (`business_path.md` §6) — blocks almost everything
   else downstream, highest priority.
2. Confirm partner consent for case studies/logos (`business_path.md` §6).
3. Keyword research per persona/controller cluster (§4.2) — feeds Phase 7 content backlog before
   Phase 7 even starts.
4. Media triage per §6 above (pick the dominant photo/video tone).
5. Draft the comparison one-pager (§6).

**Needs the site skeleton (`plan.md` Phase 3–6):**
6. Finalize persona-page messaging against the trigger/proof-point map in §1 as each page is built.
7. Set up Search Console + verify Iran-reachable analytics (ties to `plan.md` Phase 8 /
   `business_path.md` §5).

**Needs the blog engine (`plan.md` Phase 7):**
8. Publish pillar 2 (controller how-tos) first — highest search intent, fastest to show results.
9. Then pillar 1 (education/awareness) and pillar 4 (product updates) on an ongoing cadence.
10. Pillar 3 (case studies) as partner consent/content becomes available.

**Launch week (`plan.md` Phase 9):**
11. Coordinated announcement across LinkedIn/Instagram/Telegram, timed to the site going live, not
    scattered before it's ready.
12. Re-verify all outbound social share previews (OG images) render correctly on each platform.

**Post-launch (`plan.md` Phase 10+):**
13. Formalize the channel-partner program (§5).
14. Evaluate paid channels only after organic + existing-channel activation has a baseline —
    premature paid spend before the site converts well is wasted budget.

## 8. KPIs specific to marketing execution
(Website-level KPIs — conversion rate, time-to-first-response, etc. — are already defined in
`business_path.md` §5; not duplicated here.)

| Metric | Cadence | Why |
|---|---|---|
| Blog posts published per pillar | Monthly | Tests whether content cadence is actually sustainable, not just planned |
| Organic keyword rankings for controller-specific terms | Monthly | Direct measure of §4.1's core SEO bet |
| Telegram/Instagram follower growth + engagement rate | Monthly | Distinguishes real audience growth from vanity follower counts |
| Referral traffic/leads attributable to partner network | Quarterly | Tests §5's channel-partner formalization once it exists |
| Backlinks from industry-relevant domains | Quarterly | A slower but durable authority signal for the SEO bet |

---

*Open items in this document are intentionally marked `[DECISION NEEDED]` or `[NEEDS REAL DATA]`
rather than filled in — per `business_path.md`'s own convention, nothing here fabricates a number
or claim on your behalf.*
