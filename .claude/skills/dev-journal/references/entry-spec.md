# Entry spec & examples

Detailed reference for the dev-journal skill. Read this when you need the exact
field semantics, a worked example of a given entry type, or the rules for
superseding and file rollover.

## Contents
- [Routing across multiple journals](#routing-across-multiple-journals)
- [Field semantics](#field-semantics)
- [Entry types](#entry-types)
- [Worked example — bug fix](#worked-example--bug-fix)
- [Worked example — error diagnosis (no fix yet)](#worked-example--error-diagnosis-no-fix-yet)
- [Worked example — feature](#worked-example--feature)
- [Worked example — decision](#worked-example--decision)
- [Cross-cutting change (touches several areas)](#cross-cutting-change-touches-several-areas)
- [Superseding a past entry](#superseding-a-past-entry)
- [File rollover](#file-rollover)
- [Optional regenerable index](#optional-regenerable-index)
- [Using the helper script](#using-the-helper-script)

## Routing across multiple journals

By default there is one journal. To keep separate records per codebase area and per
discussion topic, create `docs/dev-journal/JOURNAL-MAP.md` from
`assets/journal-map.md`. It defines: a **default** journal, a **cross-cutting**
journal, a table of **areas** (each with a file and path globs), and a table of
**discussion threads** (each with a file).

Choosing the target file for an entry:

1. **Explicit** — the user named an area or thread → use it.
2. **Glob match** — match the changed files against area globs; most specific wins.
   `src/auth/login.py` under `src/auth/**` → the `auth` journal.
3. **Cross-cutting** — several areas touched, or a repo-wide decision → the
   cross-cutting journal, plus one-line cross-refs in each affected area journal.
4. **Default** — no match → the default journal.

Discussion threads are chosen when the work is a design conversation rather than a
concrete edit, or whenever the user points at the topic. A thread can hold entries
that also touch code — record it in the thread and, if code changed too, add a
cross-ref in the relevant area journal.

**ID uniqueness across files:** because entries are spread over many files, the ID
carries the area/thread key as a prefix: `[<key>:YYYY-MM-DD.NN]`. The `NN` counter
is per file, per day. `Supersedes:` and cross-references always use the full
prefixed ID so they resolve no matter which file the target lives in. In
single-journal mode the prefix may be dropped.

## Field semantics

| Field | Meaning |
|---|---|
| **ID** | `[<key>:]YYYY-MM-DD.NN`. `<key>` is the area/thread from the map (omitted in single-journal mode). NN is a per-file per-day counter, zero-padded, from `01`. Never reused, never renumbered. |
| **Type** | One label from: `bug-fix`, `error-diagnosis`, `feature`, `refactor`, `decision`, `config`, `perf`, `security`. Pick the dominant one. |
| **When** | Local date + time you wrote the entry. |
| **Trigger** | What set this off: the user's request (quote or paraphrase it), a failing test, a stack trace, a review comment. This is the "prompt" that led to the change. |
| **Scope** | The files/modules/functions affected, plus a commit or branch reference if one exists. Keeps the entry linkable to actual code without pasting diffs. |
| **Status** | `active` on creation. It stays `active` even after being superseded — supersession is expressed by the *newer* entry, not by editing this one. |
| **Supersedes** | (optional) The ID of an earlier entry this one replaces. |
| **Problem / Error** | The symptom as observed: exact error text, reproduction steps, observed vs. expected behavior. |
| **Root cause** | The underlying reason, distinct from the symptom. "Null pointer" is a symptom; "config loaded before env vars were set" is a root cause. |
| **Change** | A prose summary of what was actually changed. Reference the commit/PR; do not paste the whole diff. |
| **Reasoning — why this way** | The core of the entry: the chain of thought. Why this approach over others, what alternatives were weighed, what tradeoffs were accepted. This is what a diff can never show. |
| **Feature intent** | (features) What the feature is and, more importantly, *why* it's being added — the goal or requirement behind it. |
| **Risks / follow-ups** | Known limitations, deferred work, tests still needed, things to watch in production. |

Include only the sections that carry content. Omit empty ones rather than writing
"N/A" everywhere.

## Entry types

- **bug-fix** — a defect was corrected. Spine: Problem → Root cause → Change → Reasoning.
- **error-diagnosis** — an error was investigated; fix may be partial or deferred. Record the investigation even without a fix. Note dead ends — they save the next person time.
- **feature** — new capability. Lead with Feature intent, then Change + Reasoning.
- **refactor** — behavior-preserving structural change. Reasoning explains what got better and why it was worth it.
- **decision** — a choice with alternatives (library, data model, API shape, algorithm). Reasoning is the whole point; alternatives-considered is expected.
- **config / perf / security** — as named; treat like bug-fix or decision depending on whether there was a defect or a choice.

## Worked example — bug fix

```markdown
## [2026-07-13.01] Fix crash when uploading zero-byte files
- **Type:** bug-fix
- **When:** 2026-07-13 14:32
- **Trigger:** User report — "app crashes if I attach an empty file." Reproduced with `curl -F file=@empty.txt`.
- **Scope:** src/upload/handler.py (validate_upload), src/upload/store.py · commit a1b9f0c
- **Status:** active

### Problem / Error
Uploading a 0-byte file raised `ZeroDivisionError: division by zero` in
`compute_chunk_count()` and returned HTTP 500. Expected: accept the file (or reject
it with a clear 400), never 500.

### Root cause
`compute_chunk_count()` does `ceil(size / CHUNK_SIZE)` but was reached with
`size == 0` before any guard. The empty-file case was never considered when
chunking was added.

### Change
Added an explicit early return in `compute_chunk_count()` for `size == 0` (→ 0
chunks) and a validation branch in `validate_upload()` that accepts empty files and
stores them with an empty-content marker.

### Reasoning — why this way
Considered rejecting empty files with a 400, but users legitimately upload empty
placeholder files, so silently rejecting would break real workflows. Guarding the
math at its source (rather than special-casing every caller) keeps the fix local
and prevents the same class of bug if new callers appear later.

### Risks / follow-ups
The empty-content marker is new; downstream readers must treat it as "present but
empty," not "missing." Added a test; a migration for pre-existing rows is not
needed since none can be empty yet.
```

## Worked example — error diagnosis (no fix yet)

```markdown
## [2026-07-13.02] Investigate intermittent 502s on /report under load
- **Type:** error-diagnosis
- **When:** 2026-07-13 16:10
- **Trigger:** Ops flagged ~2% of /report requests returning 502 during peak.
- **Scope:** services/report/*, gateway timeout config · (no code change yet)
- **Status:** active

### Problem / Error
Under >200 rps, /report intermittently returns 502. Gateway logs show upstream
timeout at 30s. Local repro only under synthetic load.

### Root cause
Not fully confirmed. Strong signal: report generation holds a single DB connection
for the entire render, and the pool (size 10) starves under load, so requests queue
past the 30s gateway timeout. Ruled out: CPU (stays <40%) and memory (flat).

### Reasoning — why this way
Recording now, before fixing, so the investigation isn't lost. Deferring the fix
because the right change (stream results / release the connection between stages,
or raise pool size) needs a load-test to choose between. Dead end noted so no one
re-checks CPU/memory.

### Risks / follow-ups
Next: run a load test isolating pool size vs. per-request hold time. Fix will get
its own entry that references this one.
```

## Worked example — feature

```markdown
## [2026-07-14.01] Add CSV export to the reports page
- **Type:** feature
- **When:** 2026-07-14 10:05
- **Trigger:** User request — "let me export a report as CSV to open in Excel."
- **Scope:** src/reports/export.py (new), src/reports/views.py, templates/report.html · commit 4c2d1ab
- **Status:** active

### Feature intent
A "Download CSV" button on the report page. Users pull reports into spreadsheets for
their own analysis; today they copy-paste out of the HTML table, which is slow and
error-prone. The goal is a one-click faithful export of the currently filtered view.

### Change
New `export.py` streams the same query the page uses into a CSV response. Wired a
button in the template and a `?format=csv` branch in the view. Reused the existing
filter parsing so the export always matches what's on screen.

### Reasoning — why this way
Reused the page's query builder instead of writing a second one, so the CSV can
never drift from the displayed data — a duplicate query would be a maintenance trap.
Chose streaming over building the whole file in memory because reports can be large
and we don't want to hold the whole payload per request. Deferred XLSX (styling,
heavier dependency) until someone actually needs formatting.

### Risks / follow-ups
No column-selection UI yet — exports all visible columns. Large exports are streamed
but untested past ~500k rows; add a load test if that becomes common.
```

## Worked example — decision

```markdown
## [2026-07-14.02] Use UTC everywhere internally; convert only at the edge
- **Type:** decision
- **When:** 2026-07-14 15:20
- **Trigger:** Recurring off-by-one-day bugs in scheduled reports across timezones.
- **Scope:** cross-cutting — storage, domain logic, API serialization
- **Status:** active

### Reasoning — why this way
Adopting: store and compute all timestamps in UTC; convert to local time only in
the presentation layer (API responses / UI). Considered storing local time with an
offset — rejected because arithmetic across DST boundaries is error-prone and every
comparison would need offset handling. Considered per-user timezone columns
everywhere — rejected as leaking presentation concerns into the domain. UTC-internal
is the standard, keeps all comparisons trivially correct, and confines timezone
logic to one thin layer.

### Risks / follow-ups
Existing rows are ambiguous (stored in server-local time historically). A backfill
migration is needed and will get its own entry. Until then, treat pre-2026-07-14
timestamps as server-local.
```

## Cross-cutting change (touches several areas)

When one change spans multiple areas, put the full entry in the cross-cutting
journal (per the map, e.g. `decisions.md`) and drop a one-line pointer in each
affected area journal so someone reading just that area still finds it.

In `docs/dev-journal/decisions.md`:

```markdown
## [decisions:2026-07-15.01] Standardize error envelope across API and workers
- **Type:** decision
- **When:** 2026-07-15 11:00
- **Trigger:** UI and workers each parsed errors differently, causing silent drops.
- **Scope:** src/api/**, workers/**, src/ui/errors.ts · commit 7710bb2
- **Status:** active

### Reasoning — why this way
Adopting a single `{code, message, details}` envelope everywhere. Considered
per-service shapes — rejected because every consumer then needs service-specific
parsing. One envelope keeps clients uniform; the migration cost is one-time.

### Risks / follow-ups
Legacy endpoints still emit the old shape; migrate per area, each with its own
area-journal entry that supersedes nothing here (this decision stands).
```

Then in `docs/dev-journal/api.md` and `docs/dev-journal/ui.md`, a pointer only:

```markdown
## [api:2026-07-15.01] Error envelope standardized — see [decisions:2026-07-15.01]
- **Type:** decision
- **When:** 2026-07-15 11:00
- **Status:** active
- **Cross-ref:** [decisions:2026-07-15.01]
```

The pointer is a normal append (never edited later); the real reasoning lives once,
in the cross-cutting journal.

## Superseding a past entry

When a later change reverses or replaces an earlier one, append a new entry — never
edit the old one.

```markdown
## [2026-08-02.01] Replace in-request CSV streaming with a background job
- **Type:** refactor
- **When:** 2026-08-02 09:40
- **Trigger:** Large exports (>500k rows) time out at the gateway (see [2026-07-14.01]).
- **Scope:** src/reports/export.py, workers/export_worker.py (new) · commit 9f0aa21
- **Supersedes:** [2026-07-14.01]
- **Status:** active

### Change
Moved CSV generation into a background worker that writes to object storage and
emails a signed link, replacing the synchronous streaming response.

### Reasoning — why this way
The streaming approach from [2026-07-14.01] was correct for the sizes we had then,
but it holds a request open for the whole export and the gateway caps that at 30s.
Rather than raise the gateway timeout (which hurts every other route), decouple the
work. Small exports lose their instant download, accepted as a fair tradeoff for not
timing out on large ones.

### Patch notes (supersedes [2026-07-14.01])
- **What changed:** synchronous `?format=csv` streaming → async job + emailed link.
- **Why the old approach was dropped:** it couldn't survive the gateway timeout on
  large reports; that constraint wasn't visible when [2026-07-14.01] was written.
- The original entry stays as-is; it remains the record of why streaming was chosen
  at the time.
```

Note: `[2026-07-14.01]` is **not** edited. Its `Status: active` line is left
untouched. The supersession lives entirely in the new entry.

## File rollover

When the active journal file gets unwieldy (roughly >1500 lines):

1. Leave the current file completely alone.
2. Create a sibling `JOURNAL-YYYY-MM.md` (the current month) and continue appending
   there.
3. Optionally note the split at the top of the *new* file ("continues from
   JOURNAL.md"). Never annotate the old file.

IDs stay globally unique because they're date-based, so supersession references
across files still resolve by grepping the folder.

## Optional regenerable index

The append-only journal deliberately never marks old entries as superseded in
place, so "what is the current decision on X?" is answered by grepping for
`Supersedes:`. If you want a faster view, you may maintain a **derived** file
`docs/dev-journal/INDEX.md`.

This is the *one* file in the system that is allowed to be rewritten, because it is
generated from the journal and contains no original content of its own — deleting it
loses nothing. Regenerate it (don't hand-edit it) as a simple table of active
entries with any superseded IDs struck through. If maintaining it is a hassle, skip
it; the journal alone is the source of truth.

## Using the helper script

`scripts/new_entry.py` is optional and only computes the next ID and prints a blank
skeleton — it does not modify existing entries.

```
python scripts/new_entry.py [--journal docs/dev-journal/JOURNAL.md] [--type bug-fix] [--title "short title"]
```

It reads the journal (if present), finds today's highest NN, prints the next ID and
a ready-to-fill entry to stdout. Review it, fill it in, then append it yourself.
In a sandboxed agent (e.g. Codex) where scripts are restricted, skip the script and
compute the ID by reading the last entry — the result is identical.
