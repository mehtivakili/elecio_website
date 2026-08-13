---
name: dev-journal
description: Append-only engineering journal that records the reasoning behind every code change. Use this skill immediately after you fix a bug, diagnose or investigate an error, add or change a feature, refactor non-trivially, or make any technical/design decision — to log what changed, what the error was, its root cause, how it was fixed, WHY that approach was chosen, and (for features) what was added and why. Crucially, NEVER edit or overwrite existing journal entries; when a past decision changes, append a NEW entry that supersedes the old one with patch notes. Trigger this whenever you edit code, resolve an error, or the user asks you to change, fix, add, or refactor anything — even if they never mention journaling or documentation.
---

# Dev Journal — append-only reasoning log

Keep a durable, append-only record of *why* the codebase changed. Each time you do
real work on the code, add an entry capturing the reasoning and chain of thought
behind it. The journal is an audit trail: it should always be possible to read it
top to bottom and reconstruct what was believed, decided, and done at each moment.

## The one rule that everything else follows

**Never change what is already written.** Do not edit, reword, reorder, reflow, or
delete any existing entry — not even to fix a typo, and not even when a past
decision turns out to be wrong. Existing entries are history, and history is the
whole point. You only ever *append*.

Why this matters: the value of the log is that it shows what was known and decided
*at the time*. Rewriting a past entry to match what you now know destroys that
record and makes the journal untrustworthy. A correction is itself a new fact with
its own timestamp, so it becomes a **new** entry that supersedes the old one (see
"Superseding" below). Practically: only ever append to the file (e.g. `>>`), never
open it for in-place editing of prior content.

## Where entries go — routing to the right journal

By default there is one journal at **`docs/dev-journal/JOURNAL.md`** at the repo
root. To split records across **codebase areas** and **discussion topics**, add a
map file **`docs/dev-journal/JOURNAL-MAP.md`** (template in `assets/journal-map.md`).
The map is opt-in: if it doesn't exist, everything goes to the single default
journal and you can ignore the rest of this section.

When `JOURNAL-MAP.md` exists, choose the target journal for each entry like this:

1. **Explicit wins.** If the user names an area or discussion thread ("log this to
   the auth journal", "add to the sway-damping discussion"), use that file.
2. **Match the changed files** against the area globs in the map; the most specific
   matching glob wins.
3. **Cross-cutting** (a decision touching several areas): write the full entry in
   the map's cross-cutting journal (e.g. `decisions.md`), then add a one-line
   cross-reference entry in each affected area journal pointing to it.
4. **No match** → the map's default journal.

Create any target file that doesn't exist yet, seeding it from
`assets/journal-header.md`. If the repo already has an ADR/decisions convention,
follow it instead of making competing files.

Because entries now live in several files, **IDs carry the area key** so references
stay unambiguous across files: `[<area>:YYYY-MM-DD.NN]` (e.g. `[auth:2026-07-13.01]`).
The counter is still per file, per day. In single-journal mode the `<area>:` prefix
may be omitted.

When any one journal grows large (roughly >1500 lines), stop appending to it and
start a dated continuation file (e.g. `auth-YYYY-MM.md`) in the same folder. Never
rewrite the old file — just begin a new one. See `references/entry-spec.md`.

## When to write an entry

Write one entry per meaningful unit of work, **after** the work is done (and, where
relevant, after it builds / tests pass):

- You **fixed a bug** or resolved a failing test.
- You **diagnosed or investigated an error** — even if the fix is deferred. The
  investigation itself (symptom, root cause, dead ends) is worth recording.
- You **added or changed a feature**.
- You did a **non-trivial refactor** (behavior-preserving but structurally
  significant).
- You made a **technical or design decision** (library choice, data model, API
  shape, algorithm, tradeoff).
- You changed **config/build/deploy** in a way that affects behavior.

Skip journaling for trivia that carries no reasoning: pure formatting, a single
typo, renaming a local variable, whitespace. When unsure, err toward writing a
short entry — a small note is cheap, a lost rationale is not.

## How to add an entry

1. **Pick the target journal** (see "routing" above): read `JOURNAL-MAP.md` if it
   exists, then use the explicit area/thread, else the best glob match, else the
   default. Without a map, use `docs/dev-journal/JOURNAL.md`.
2. Read the **last** entry in *that* journal to find today's highest entry number
   for it. If none exists for today, start at `01`.
3. Build the entry ID: `[<area>:YYYY-MM-DD.NN]` when using a map (area key from the
   map), or `[YYYY-MM-DD.NN]` in single-journal mode. NN is zero-padded, per day.
4. Fill the template below. Include only the sections that apply; omit the rest
   rather than padding. Keep it tight but complete — enough that a teammate (or
   future you) understands *what* and *why* without re-reading the diff.
5. **Append** the entry to the bottom of that journal. Do not touch anything above.
6. If the change is cross-cutting, add the one-line cross-references described in
   the routing rules. If it reverses or replaces an earlier decision, also follow
   "Superseding" below.

An optional helper, `scripts/new_entry.py`, prints the next ID and a blank
skeleton so you don't have to compute the number by hand — pass `--journal <file>`
for the routed file and `--area <key>` for the prefix. It never edits existing
content. See `references/entry-spec.md` for how to use it.

## Entry template

```markdown
## [<area>:YYYY-MM-DD.NN] <short imperative title>   (drop "<area>:" in single-journal mode)
- **Type:** bug-fix | error-diagnosis | feature | refactor | decision | config | perf | security
- **When:** YYYY-MM-DD HH:MM
- **Trigger:** <what prompted this: the user's request (quote/paraphrase), a failing test, an error report>
- **Scope:** <files / modules / functions touched> · <branch or commit ref if known>
- **Status:** active

### Problem / Error
<what was wrong; the exact error message; how it reproduced; observed vs. expected>

### Root cause
<why it actually happened — the underlying reason, not just the symptom>

### Change
<what was changed, summarized. Reference the commit/PR rather than pasting the full diff>

### Reasoning — why this way
<the chain of thought: why this fix/approach was chosen; alternatives considered and
why they were rejected; tradeoffs accepted>

### Feature intent  (features only)
<what the feature is; why it is being added; the requirement or goal it serves>

### Risks / follow-ups
<known limitations, TODOs, things to watch, tests still needed>
```

For a bug-fix, `Problem / Error` → `Root cause` → `Change` → `Reasoning` is the
spine. For a feature, lead with `Feature intent`, then `Change` and `Reasoning`.
For a pure decision, `Reasoning` is the main body. A full worked example of each
is in `references/entry-spec.md`.

## Superseding a past entry (instead of editing it)

When something recorded earlier is no longer true — a decision is reversed, a fix
is replaced, an approach is abandoned — **do not go back and change the old
entry.** Append a new one that points at it:

- In the new entry, add a line `- **Supersedes:** [OLD-ID]` in the header block.
  Use the full area-prefixed ID (e.g. `[auth:2026-07-13.01]`) so it resolves even
  when the superseded entry lives in a different journal file.
- Add a `### Patch notes (supersedes [OLD-ID])` section that states plainly: what
  is different from the old entry, and why the previous approach was dropped.
- Leave the old entry exactly as it is. Its `Status: active` line stays untouched;
  the supersession is discoverable from the new entry (grep for `Supersedes:`).

This keeps the original reasoning intact while making the current state clear —
the old decision and the reason it changed both remain permanently in the record.
See `references/entry-spec.md` for a supersession example and for an optional
regenerable `INDEX.md` if you want a quick "current decisions" view.

## See also

- `references/entry-spec.md` — full field-by-field spec, worked examples for each
  entry type, a supersession example, routing/cross-cutting examples, file-rollover
  details, and the optional index.
- `assets/journal-map.md` — the routing map template. Copy to
  `docs/dev-journal/JOURNAL-MAP.md` and edit to define your areas and threads.
- `assets/journal-header.md` — the header to seed a brand-new journal file.
- `assets/entry-template.md` — a blank entry to copy.
- `scripts/new_entry.py` — optional helper that prints the next ID + a skeleton.
