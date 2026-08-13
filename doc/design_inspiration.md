# Design Inspiration — Real Sites, Templates & Repos

Raw material for Phase 2 (design system) and Phase 3 (3D scroll hero) decisions — **not** a
decision itself. Browse, react, and tell me which specific *mechanisms* (not just "I like the
vibe") you want to borrow. See `plan.md` §7 for the library-level references already logged
(Refine, react-bits, GSAP, TipTap) — this doc is the visual/UX layer above those.

---

## 0. The trap: what makes a site read as "AI-generated" — and how to dodge it

You said it directly: you don't want a site that *looks* AI-templated, even though some assets
(imagery, illustration) may genuinely be AI-generated. Those are different things — a hand-picked,
constrained AI image doesn't scream "AI slop"; a generic *layout* does. The tells to avoid:

- **Purple-to-blue gradient blobs**, especially blurred ones sitting behind a centered hero.
- **The default hero pattern**: centered heading + subheading + two pill buttons + a floating
  mockup, identical to a thousand SaaS landing pages.
- **Three-icon feature row** / bento grid used as the *only* content rhythm on the page.
- **Glassmorphism everywhere**, gray 1px borders on every card, Inter for everything with no
  contrast in voice between headline and body.
- **Generic glossy 3D renders** (the "abstract floating sphere" look) instead of imagery that's
  actually about *your* product.
- Dark mode applied by default with no real reasoning (your old site did this — worth deciding on
  purpose this time, not by inertia — see `plan.md` Phase 2).

**The fix isn't "avoid AI tools," it's "bring specific constraints":** a real reference site, a
named typeface, a real 3–5 color palette pinned to your brand, and a layout principle that breaks
the 3-card reflex (asymmetry, an unusual grid, a scroll-driven sequence instead of a static stack).
Everything below exists to give you those specific constraints instead of a vague "make it look
cool."

---

## 1. Curated inspiration galleries (browse many real, current sites fast)

Use these to build a shortlist of 5–10 sites whose *specific* section (not whole layout) you'd
steal from. All are hand-curated, not AI-generated listicles.

- **[Awwwards](https://www.awwwards.com)** — the standard-bearer; filter by "Site of the Day" and
  by category (e-commerce, tech, 3D) for current, high-craft work.
- **[Godly](https://godly.website)** — hand-picked, leans toward bold animation and scroll-driven
  storytelling; good for the Phase 3 hero mood-boarding specifically.
- **[SiteInspire](https://siteinspire.com)** — smaller, more consistently excellent than Awwwards;
  tag-filterable by style/type/subject.
- **[Land-book](https://land-book.com)** — huge SaaS/marketing landing-page archive; best source
  for homepage-hub structure ideas (your Phase 3 "hub" layout: hero → trust bar → persona router →
  footer CTA).
- **[Lapa Ninja](https://www.lapa.ninja)** — similar to Land-book, filterable by section type
  (pricing, hero, footer) — useful when you want 20 examples of just "hero sections," for example.
- **[One Page Love](https://onepagelove.com)** — has a dedicated
  **[startup/hardware genre](https://onepagelove.com/genre/startup)** filter.
- **[Mobbin](https://mobbin.com)** — mainly app UX patterns, but its web section is good for
  reusable *interaction* patterns (forms, empty states, nav) rather than pure visuals.
- **[Curated.design](https://curated.design)** and **[Httpster](https://httpster.net)** — smaller,
  more experimental/indie galleries; good for breaking out of "every SaaS site looks the same."

---

## 2. Real hardware/industrial sites closest to Elecio's actual category

This is the most relevant section — Elecio isn't a SaaS app, it's a physical wireless device for an
industrial (CNC/machine-shop) audience. These are real companies solving the same brief: make a
technical hardware product feel premium and trustworthy without becoming generic-AI-SaaS.

- **[Shaper Origin](https://www.shapertools.com/en-us/origin)** — **the single closest analogue.**
  A handheld CNC tool with WiFi connectivity, sold to the same kind of technical/maker audience.
  Look at how they explain "how it works" in a few clear scroll steps, and how product photography
  (not abstract 3D) carries the trust.
- **[Teenage Engineering](https://teenage.engineering)** — the reference for restrained, confident
  hardware design: huge product photography, almost no decoration, a distinct type voice. Good
  antidote to "generic AI site" — it's the opposite of a bento grid.
- **[Ledger](https://www.ledger.com)** — hardware security device sold to a technical-but-not-only-
  developer audience; strong at translating an abstract concept (crypto security / here: wireless
  DNC transfer) into a clear visual metaphor on the homepage.
- **[Framework Computer](https://frame.work)** — right-to-repair laptop brand; look at how they
  handle the "exploded view" / modular-parts visualization — directly relevant to your Phase 3
  candidate #2 ("exploded view" of the device's internal layers).
- **[Bambu Lab](https://bambulab.com)** and **[Formlabs](https://formlabs.com)** — both sell
  precision manufacturing hardware (3D printers) to a semi-technical B2B/prosumer buyer, same
  persona-split problem you have (hobbyist vs. professional shop) — see how their nav/IA splits
  audiences, close to your Phase 4/5 persona-page structure.
- **[Sonos](https://www.sonos.com)** and **[DJI](https://www.dji.com)** — bigger-budget references
  for wireless-connectivity storytelling (Sonos' "one system, every room" is structurally the same
  pitch as your "one device, many machines" concept).
- **Apple product pages** — e.g. **[AirPods Pro](https://www.apple.com/airpods-pro/)** and
  **[Vision Pro](https://www.apple.com/apple-vision-pro/)** — not for the budget, but for the
  *mechanism*: scroll position directly drives a 3D/video sequence with very short, confident copy
  per beat. Study the pacing (how much scroll per idea), not the polish level.

---

## 3. Scroll-driven 3D/WebGL studios — feeds the Phase 3 hero decision directly

You're building a custom React Three Fiber scroll hero (`plan.md` Phase 3, three candidate
concepts: signal-and-nodes, exploded view, cable-to-wireless transition). These studios are where
that genre of interaction is invented first — browse their case studies specifically for *how much
happens per scroll-tick*, not just the final look.

- **[Lusion](https://lusion.co)** — 3D/interactive studio; their mock product-launch site (Awwwards
  Site of the Month, April 2026) is a strong reference for "single hero object, scroll reveals
  detail" — closest in spirit to your candidate #2 (exploded view).
- **[basement.studio](https://basement.studio)** (merged with Studio Freight) — scroll-driven
  Three.js with physics-simulated effects; also maintains **Lenis**, a smooth-scroll library worth
  knowing about even if GSAP ScrollTrigger ends up doing the orchestration.
- **[Cuberto](https://cuberto.com)** — digital product agency, strong on motion micro-interactions
  layered on top of 3D scenes rather than 3D-for-its-own-sake.
- **[Active Theory](https://activetheory.net)** — bigger cinematic campaign sites; useful for
  seeing where "impressive" tips into "slow," a real risk given your <150KB/3D performance budget.
- **[Bruno Simon's portfolio](https://bruno-simon.com)** — the canonical single-developer R3F
  showcase; also runs the widely-used **Three.js Journey** course, useful if you (or whoever builds
  Phase 3) wants a deeper primer than the R3F docs alone.
- **[Three.js examples](https://threejs.org/examples/)** and the
  **[pmndrs showcase](https://pmnd.rs/)** — lower-level, code-adjacent inspiration straight from
  the library maintainers; useful once you've picked a concept and need real implementation
  references, not just mood.

---

## 4. Persian/RTL & bilingual considerations

Honest note: design-forward, award-winning *Persian-specific* galleries are thin — most polished
RTL work is Arabic/Hebrew. Treat this section as functional/typographic reference, not a visual
mood board.

- **[Vazirmatn](https://fonts.google.com/specimen/Vazirmatn)** ([GitHub](https://github.com/rastikerdar/vazirmatn))
  — already flagged in `plan.md` Phase 2 as the likely Persian-first font; it's on Google Fonts now
  and is what Telegram Desktop uses for Persian/Arabic, so it reads as "familiar, not foreign" to
  your audience.
- **[shadcn/ui RTL docs](https://ui.shadcn.com/docs/rtl)** — already in `plan.md` §7 for reference;
  the *pattern* (logical CSS properties: `margin-inline-start` instead of `margin-left`, `dir`-aware
  components) applies regardless of Ant Design vs. shadcn.
- **Real large-scale Persian RTL sites** — [Divar](https://divar.ir), [Snapp](https://snapp.ir),
  [Cafe Bazaar](https://cafebazaar.ir) — not visually award-winning, but genuinely useful for
  *functional* RTL UX (number/date formatting, form layout mirroring, iconography that shouldn't
  mirror — arrows/back buttons need care) since they're products real Iranian users already have
  muscle memory for.
- **Practical check**: whatever theme direction you pick in Phase 2, mock it up in both `fa`
  (RTL) and `en` (LTR) before locking it — asymmetric layouts (like an exploded-view diagram with
  labels on one side) are the most likely thing to break when mirrored.

---

## 5. Component/animation libraries & GitHub repos (code-level patterns)

You're on **Ant Design**, not shadcn/Tailwind — so treat everything shadcn-ecosystem below as
*pattern reference to adapt*, not drop-in installs (same caveat `plan.md` §7 already applies to
react-bits and the shadcn RTL docs).

- **[react-bits](https://reactbits.dev)** ([GitHub](https://github.com/DavidHDev/react-bits)) —
  already in `plan.md`; framework-agnostic animated components (text reveals, particle backgrounds)
  that don't fight Ant Design elsewhere on the page.
- **[Aceternity UI](https://ui.aceternity.com)** ([GitHub](https://github.com/aceternity-labs)) —
  copy-paste effects: aurora backgrounds, 3D cards, glowing beams, scroll reveals. Good *technique*
  reference for the Phase 3 hero's supporting sections even though the components themselves are
  shadcn/Tailwind-shaped.
- **[Magic UI](https://magicui.design)** — motion-first marketing components (animated beams,
  particle grids) — same caveat, mine for technique not code.
- **[21st.dev](https://21st.dev)** — community registry indexing both of the above plus many more;
  fastest way to browse hundreds of small effects by category in one place.
- **[pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber)** — the library itself;
  its own repo's linked examples are the most authoritative R3F reference.
- **[bruno-simon/folio](https://github.com/bruno-simon/folio)** — full source of a real, famous R3F
  portfolio site — useful for seeing project structure at a scale bigger than a docs snippet.
- **GSAP ScrollTrigger — [official showcase](https://gsap.com/showcase/)** — real sites built with
  the exact scroll-orchestration engine `plan.md` names as the likely Phase 3 choice.

---

## 6. Template marketplaces (structure/copy reference — not to copy wholesale)

Useful for stealing *information architecture* (what sections exist, in what order) for the
Phase 3 homepage hub and Phase 4/5 persona pages — not for visual style.

- **[Land-book](https://land-book.com)** and **[Lapa Ninja](https://www.lapa.ninja)** (again,
  filtered this time for structure) — browse 5–10 hardware/SaaS homepages and note section order.
- **[Cruip](https://cruip.com)** and **[HyperUI](https://www.hyperui.dev)** — free/cheap
  Tailwind-based section templates; same "pattern not code" caveat as §5 since you're on Ant Design.
- **[Webflow Showcase](https://webflow.com/discover/popular)** — often the most *polished* real
  small-business/product sites on the web, since Webflow makes fine-grained visual control easy;
  good for spacing/typography-scale reference even though you won't use the platform.

---

## 7. Using AI-generated imagery without the "AI-generated" look

You already have real ground: `media/` has several `ChatGPT Image...` studio renders that `plan.md`
flags as genuinely high quality and earmarked as primary hero/product imagery. The guidance below
is for *supplementary* art (backgrounds, section dividers, abstract diagrams) — not to replace
those.

- **Pick one distinctive style and hold it everywhere**, rather than photoreal-glossy renders
  (the generic look). Options that read as "designed," not "AI slop": technical blueprint/schematic
  line art (fits a CNC/engineering audience directly), risograph/halftone textures, or flat
  isometric diagram style. Consistency across every generated asset is what sells "intentional,"
  even more than any single image's quality.
- **Generate diagrams, not hero focal points, with AI** where possible — e.g. the "signal reaching
  multiple machines" concept (Phase 3 candidate #1) is a great candidate for a clean vector-style
  AI-assisted diagram rather than a literal photoreal render.
- **Give the generator real constraints** the same way you'd brief a human illustrator: reference
  images (your actual device photos), a named palette (once Phase 2 locks one), and an explicit
  "no gradient-blob, no glassmorphism" negative constraint — directly counters the §0 trap.
- Tools: Midjourney (style-reference/`--sref` for consistency across a batch) or GPT image
  generation for quick iteration; for anything meant to sit next to your real product photography,
  budget a manual cleanup pass (Figma/Photoshop) rather than shipping raw output — the manual pass
  is usually what separates "AI-assisted" from "obviously AI-generated."

---

## 8. How to actually use this doc

Don't try to synthesize all of this into one look. Instead, for each open decision in `plan.md`:

1. **Phase 2 (theme/typography)** — pick 2–3 sites from §2 whose *type pairing and color
   restraint* you like, bring them as the "2–3 concrete theme directions" `plan.md` already asks
   for.
2. **Phase 3 (3D hero)** — pick 1–2 sites from §3 per candidate concept (signal-and-nodes /
   exploded-view / cable-to-wireless) as the concrete reference for that specific concept, so the
   "present 2–3 concrete concepts" conversation has real anchors instead of descriptions.
3. **Phase 3 (homepage hub) / Phase 4–5 (persona pages)** — use §6 purely for section-order/IA
   ideas, cross-checked against the actual persona structure already locked in `plan.md`.

Bring back a short list ("I like X's hero pacing, Y's type pairing, Z's persona-nav pattern") and
we turn that into the next AskUserQuestion-style decision batch — same process as the kickoff
session, per [[feedback-collaboration-style]].
