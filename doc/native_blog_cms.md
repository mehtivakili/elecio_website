# Native bilingual blog CMS operations

Expansion Phase 4 replaces the blog placeholder with a database-backed bilingual journal and a
structured TipTap editor inside the existing MFA-protected admin.

## Content and publishing model

Posts retain the established stable Latin slug and fa/en fields. `translation_status` explicitly
states whether Persian, English, or both are publishable. Public queries exclude drafts, future
schedules, and unavailable translations. A published slug change writes the old slug to
`post_slug_history`; public requests receive a permanent redirect to the current canonical URL.

Every create/save/restore writes an immutable JSON snapshot to `post_revisions` with the accountable
staff identity and summary. Restoring never mutates history: it creates a new draft revision, clears
the schedule/publication date, and requires an explicit publish action. The editor exposes title,
excerpt, content, SEO fields, category, tags, translation completeness, schedule, cover, preview,
draft, publish, and revision restore.

The application treats the TipTap JSON document as source. Server sanitation recursively allows
only paragraphs, headings 2–4, lists/items, blockquote, code block, horizontal rule, hard break,
images, text, bold/italic/code, and safe links. It limits depth, child count, text length, document
bytes, URL schemes, and attributes. Arbitrary HTML, scripts, event attributes, SVG/data URLs,
iframes, protocol-relative links, and unknown nodes/marks are discarded or rejected. Public output
is deterministic React elements, never editor-provided HTML.

## Preview and scheduling

An authorized editor can create a random 256-bit, SHA-256-at-rest preview token valid for 15
minutes. Preview pages are noindex/nocache and render drafts through the same sanitizer. Treat the
URL as a temporary bearer secret: do not paste it into analytics, tickets, chats with broad history,
or public pages. Tokens expire automatically and can be removed by a periodic retention job.

Scheduling is UTC in MySQL; the browser `datetime-local` value is converted by JavaScript to an
instant. A future scheduled post may have published status but remains absent until its timestamp.
Public routes are request-rendered, so no cron job is required to make it visible. Publish/unpublish,
slug change, and restore revalidate both locales and old/current article paths.

## Media pipeline

The upload route requires staff `media:create`, exact trusted Origin, shared Redis rate limiting,
and a 10 MiB request file cap. It accepts JPEG/PNG/WebP/AVIF only, decodes with Sharp under a
40-megapixel limit, applies EXIF rotation, bounds dimensions to 2400×2400, re-encodes WebP at quality
82, strips metadata through decode/re-encode, generates a UUID filename, writes with exclusive
creation, and persists SHA-256, MIME, byte size, dimensions, localized alt/caption, and uploader.
SVG/GIF/PDF and supplied filenames are rejected.

The current storage adapter writes `public/uploads` on the application filesystem. This is suitable
for local development and a single persistent-volume server, not immutable/serverless deployments.
Before production on Vercel or horizontally scaled hosts, replace only the storage write with
private-origin S3/R2-compatible object storage plus CDN, retention/lifecycle rules, malware scanning
where required, and backup. Keep the same validation/re-encoding and database metadata contract.
Unused-reference deletion is deliberately not exposed yet, preventing accidental broken articles.

Sharp 0.34.4 was rejected after `npm audit` reported current high-severity inherited libvips CVEs.
The implementation pins patched Sharp 0.35.3 and ends with zero known production vulnerabilities.

## Public journal

`/[locale]/blog` provides localized editorial hierarchy, optional real category navigation, covers,
excerpts, and localized dates without creating empty category archive routes. `/blog/[slug]` provides
localized metadata, canonical and reciprocal alternates when the post is complete, article Open
Graph data, `Article` JSON-LD, readable measure, cover caption/alt, author/date, category, tags, and
permanent legacy-slug redirects. Missing/draft/untranslated/future content returns a useful 404.

## Deployment and acceptance

1. Back up MySQL; apply migration 13; verify baseline revisions for existing posts and rehearse
   rollback on a staging copy.
2. Confirm production URL/auth secrets, Redis, database timezone, persistent/object storage,
   writable limits, CDN caching, CSP image origins, backup, media retention, and upload monitoring.
3. Test create/save/concurrent update policy, publish/unpublish, future schedule/timezone boundary,
   translation exclusion, slug uniqueness/redirect chain, revision restore, expired/tampered preview,
   category/tag ownership, and editor/admin authorization using isolated DB integration tests.
4. Attack-test nested/oversized JSON, stored/reflected XSS payloads, unsafe link/image schemes,
   polyglots, malformed/huge images, decompression bombs, SVG, double extensions, metadata leakage,
   upload exhaustion, and filesystem/object-storage traversal.
5. Editorial QA: fa/en typography, RTL/LTR editor and public article, mobile overflow, keyboard,
   focus/screen reader, cover alt/caption, metadata/canonicals/alternates/JSON-LD, old-slug redirects,
   and no draft/preview indexing.

The local suite proves schema reversibility, sanitizer policies, compilation, and dependency health.
Production-like storage security, malware controls, concurrency integration, SEO validators, and
physical accessibility remain release gates.
