# Elecio Smart DNC — Business Execution Path

The website (`plan.md`) and the marketing plan (`marketing_path.md`) both depend on business decisions that aren't "marketing" or "engineering" — they're product/commercial calls only the user can make. This doc exists so those calls get made deliberately instead of implicitly (e.g. a page can't have a real CTA if pricing/packaging isn't decided, a lead can't be handled if no one owns "check the inbox").

Everything below marked **[DECISION NEEDED]** is a genuine open question — nothing here fabricates numbers or claims on your behalf.

**Grounding note (2026-08-06)**: revised after discovering `old/`, the real previous site for this operating business (elecio.ir, ~3 years old). This is not a pre-revenue product — it already has customers, a support team, and a live order flow. Several sections below replace generic/Western-market assumptions (GDPR, Stripe, CRM-first) with what's actually true for an Iranian business. Full source audit in `journey.md`.

---

## 1. Pricing & Packaging
*Required before: Business Owner page (Phase 4), Bottom-of-funnel CTA copy.*

- **Already real, not hypothetical**: a live order page exists at `elecio.ir/order/product/elecio-smart-dnc-g1/` — per the Decision Log in `plan.md`, the new site links out to it rather than rebuilding checkout. This means pricing/checkout mechanics are largely **not** this project's problem for v1.
- [ ] **[DECISION NEEDED]** Is the price shown on that existing order page, or is it request-a-quote? Determines whether the new site's persona pages can state a price or need a "request pricing" framing.
- [ ] **[DECISION NEEDED]** Is there more than one product/SKU now (the "G1" in the order URL suggests versioning — is there a G2, or accessories/add-ons) that the new site's persona pages need to account for?
- [ ] The old site's idle-time/downtime-tracking feature (real, not invented) is the natural basis for a Business Owner ROI framing — needs real or realistic inputs (average CNC downtime cost, typical machine count per workshop segment) before Phase 4 builds it.

## 2. Sales Process & Lead Handling
*Required before: Phase 6 (`POST /api/contact`, `POST /api/download`) can route anywhere meaningful.*

- **Already real, not hypothetical**: the business has a named 3-person support/engineering team with direct phone numbers already public (`old/src/components/layout/Footer.tsx`, `old/src/app/order/page.tsx`) — email `info@elecio.ir`, plus an active Telegram channel (`t.me/elecio_shop`) that may already function as a support/sales channel.
- [ ] **[DECISION NEEDED]** Which of the existing channels should receive new-site leads: direct email to `info@elecio.ir`, a Telegram bot/group, one of the named engineers' phones, or a new lightweight destination (e.g. a shared inbox)? Don't introduce a new CRM before confirming the existing informal system isn't already working fine.
- [ ] **[DECISION NEEDED]** Target response time to a new lead — becomes both an internal SLA and, once proven reliable, an on-page trust signal.
- [ ] Note: the old site's contact/order forms **looked** functional but only simulated submission client-side (`setTimeout`, no real backend) — confirm this is also true of the live production site, since if real leads have been silently lost, that's worth knowing before rebuilding.

## 3. Legal & Compliance Baseline — Iran-specific
*Required before: Phase 9 launch. Do not guess at any of this — verify with the user or a professional before publishing claims. This section replaces an earlier draft that incorrectly defaulted to GDPR/CCPA/Stripe framing — wrong jurisdiction for an Iran-based, Iran-serving business.*

- [ ] **[DECISION NEEDED]** **Enamad** (نماد اعتماد الکترونیکی) — the old site's footer references it ("enamd for elecio", likely a broken/placeholder badge). Confirm current certification status — this is the standard Iranian e-commerce trust seal and matters more to the target audience than any Western equivalent.
- [ ] **[DECISION NEEDED]** Business registration status (ثبت شرکت / پروانه کسب) — confirm what's current so the footer/legal pages state it accurately.
- [ ] **[DECISION NEEDED]** Payment gateway, if checkout is ever absorbed into the new site (Phase 10+, not v1 per the Decision Log): Iranian gateways (e.g. Zarinpal, IDPay) — Stripe/PayPal are not usable for an Iran-based merchant. Not urgent for v1 since checkout stays external, but worth recording now so it isn't assumed away later.
- [ ] Privacy notice: even a lightweight one is good practice for the site's contact/download forms, and becomes more relevant once the English-language side of the bilingual site (per `plan.md`) may draw non-Iranian visitors.
- [ ] Any industrial/electrical compliance marks that legitimately apply to the hardware (if any) — **only** state what's actually certified; a false compliance claim is a real liability, not just a marketing risk.

## 4. Launch Checklist
*Executed at the end of Phase 9 in `plan.md`.*

- [ ] Domain + DNS configured, SSL verified, on the confirmed Iranian host (Liara/ArvanCloud — see `plan.md` Phase 1).
- [ ] Legal/trust footer content live: Enamad badge (if current), business registration info, contact details.
- [ ] Analytics + conversion tracking verified firing correctly (test a real form submission end-to-end) — confirm the chosen analytics tool is actually reliably reachable for Iranian visitors before committing (see `plan.md` Phase 8).
- [ ] All three persona pages + Home Hub reviewed by the user for tone/accuracy before going live, **in both languages** — this is a manufacturing product; factual claims about capabilities need a real sign-off, not just design approval.
- [ ] Search Console set up (Bing Webmaster Tools optional/lower priority for this market), sitemap submitted, `hreflang` verified for fa/en.
- [ ] Social share previews (OG images) verified across the real active channels — LinkedIn, Instagram, Telegram (see `marketing_path.md` §5).
- [ ] 404 page, error states, and empty states (e.g. blog with zero posts) all designed, not left default, in both languages.
- [ ] Backup/rollback plan for the production database confirmed.
- [ ] Confirm the external order link (`elecio.ir/order/product/elecio-smart-dnc-g1/`) still resolves correctly and is the right target before wiring every persona page's primary CTA to it.

## 5. Post-Launch KPIs
*Defines what "working" means — set before launch, not after, so early data has a baseline to compare against.*

| Metric | Why it matters |
|---|---|
| Organic sessions by persona page, by language | Validates the SEO/content strategy in `marketing_path.md` is reaching the right people in the right language |
| Form conversion rate (visits → contact/download) | The core health metric of the site as a sales tool |
| Click-through rate to the external order page | The real bottom-of-funnel metric now that checkout stays external — the new site's job is measured here |
| PDF download → contact rate | Tests whether the gated-content funnel is actually working or just leaking |
| Time-to-first-response on new leads | Operational discipline metric, not a vanity one |

- [ ] **[DECISION NEEDED]** Confirm PostHog vs GA4 (Phase 8) — verify reachability for the Iranian audience before committing either way, not just feature comparison.

## 6. Content Accuracy — Stats Refresh (blocking, before any of these numbers appear on the new site)
*User confirmed (2026-08-06): the old site's structural content (partners, team, videos) is reusable, but its specific numbers are stale.*

- [ ] **[DECISION NEEDED]** Real current figures to replace the old site's claims before publishing:
  - Current customer count (old site claimed "150+")
  - Current active device count (old site claimed "450+")
  - Current cumulative operating hours (old site claimed "2.5M+")
  - Current satisfaction metric, if one is actually tracked (old site claimed "99.8%" — confirm this was ever a measured number vs. an placeholder)
- [x] Re-confirm the 4 partner companies (Pars Techno, PIM, Sanat Pazhohan Parseh, Techno Sanat Alizadegan) are still active relationships and still consent to being featured with logo + name before reuse (Phase 0 task in `plan.md`). **Confirmed OK by user, 2026-08-06.**
- [ ] Re-confirm the 3-person team roster and bios are current.

## 7. Open Strategic Questions (not blocking, but worth deciding early)
- [ ] International sales: the bilingual (fa/en) decision in `plan.md` suggests some interest in reaching non-Iranian customers — is that a real near-term goal, or is English mainly for domestic technical/expat readers? Affects how much the English side should differ in tone (e.g. export logistics questions vs. identical content).
- [ ] Competitive landscape: who are the 2-3 real alternatives a Business Owner persona is comparing this against (domestic competitors, or literally "doing nothing/staying manual")? A short honest competitive-positioning note would sharpen the Business Owner page's messaging significantly.
- [ ] Referral/partner program: the existing integrator relationship pattern (e.g. Sanat Pazhohan Parseh installing across many client workshops) already looks like an informal channel-partner model — worth formalizing once the site can support it, ties into the retention/advocacy loop in `marketing_path.md`.
