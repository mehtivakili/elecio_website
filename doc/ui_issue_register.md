# UI/UX and accessibility issue register

Phase 5 baseline, 2026-08-13. Screenshot references are to the user-provided conversation captures;
production screenshots must be attached during physical QA. “Implemented” means the source change
exists, not that a physical screen-reader/device run is complete.

| Area / matrix | Severity | User impact | Resolution / recommendation | Acceptance test | Status |
|---|---|---|---|---|---|
| Global keyboard, fa/en, both themes | Blocker | Keyboard users could not bypass repeated header | Visible-on-focus skip link, strong focus ring, 44 px controls | First Tab exposes skip link and it lands before content | Implemented; physical QA pending |
| Homepage hero, mobile slow 4G | High | Five viewport images competed for bandwidth/decode | Render active image only; responsive `sizes` | Initial trace shows one hero raster and no CLS | Implemented; production trace pending |
| 3D product/compatibility, mobile/reduced motion | High | GPU work caused jank and discomfort | Lazy/onscreen renderer, lower DPR, constrained-device static fallback | 4-core/4 GB and reduced-motion devices create no WebGL context | Implemented; hardware trace pending |
| Compatibility, light theme | Blocker | Dark-only colors made text unreadable | Fixed values replaced with semantic tokens | Text/protocols are readable in light and dark | Implemented; contrast measurement pending |
| About final panel, light theme (provided capture) | Blocker | Foreground was near-black on dark surface | Existing light override confirmed; semantic CTA/text retained | Light panel has light surface, dark text, visible secondary CTA | Source verified; screenshot pending |
| Video gallery, keyboard/screen reader | Blocker | Modal lacked name/title/Escape/focus behavior | Dialog semantics, localized labels, title, Escape, focus restore | Keyboard open/close is announced and restores trigger focus | Implemented; NVDA/VoiceOver pending |
| Header, 320–430 px, fa/en | High | Earlier capture showed clipping/crowding | Single drawer architecture and mobile no-blur behavior retained | No horizontal scroll; actions reachable; drawer closes | Source verified; physical matrix pending |
| Article localization | High | hreflang could point to missing translation | Alternates emitted only for complete translations | Single-language post has self only; complete has both | Implemented |
| Privacy/analytics, all public pages | Blocker | Tracking without consent or identifier leakage | Deny by default, anonymous aggregates, reopenable settings | Decline sends zero calls; DB has count dimensions only | Implemented; browser check pending |
| Blog/editor/account/admin responsive and AT matrix | High | Complex workflows can hide keyboard/mobile defects | Execute physical matrix before rollout | No clipped action, lost focus, or color-only status | Review pending; release gate |
| Forced colors, 200% zoom, screen readers | High | Source review cannot prove operability | Physical/browser assistive technology pass required | Core contact/download/login/CMS tasks complete without loss | Review pending; release gate |

No unresolved source-known critical issue remains in audited paths. Pending physical, deployed, and
assistive-technology rows are release gates and must not be reported as passed without evidence.
