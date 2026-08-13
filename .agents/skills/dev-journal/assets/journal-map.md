# Journal map

This file routes each journal entry to the right `.md` file. Edit the tables below
to fit your repo. Delete this file entirely to go back to a single journal.

Rules the agent follows, in order:
1. If you explicitly name an area or thread, that wins.
2. Otherwise the changed files are matched against the **area globs** below; the
   most specific matching glob wins.
3. A change touching several areas is **cross-cutting**: the full entry goes in the
   cross-cutting journal, with a one-line cross-reference added to each affected
   area journal.
4. No match → the **default** journal.

Entry IDs are area-prefixed so they stay unique across files: `[<area key>:YYYY-MM-DD.NN]`.

---

## Default journal
Anything that doesn't match an area or thread goes here.

    docs/dev-journal/general.md

## Cross-cutting journal
Decisions that span multiple areas (architecture, conventions, security posture).

    docs/dev-journal/decisions.md

---

## Areas (routed by file path)

| Area key | Journal file                        | Matches (comma-separated globs)          |
|----------|-------------------------------------|------------------------------------------|
| auth     | docs/dev-journal/auth.md            | src/auth/**, src/login/**, src/session/**|
| api      | docs/dev-journal/api.md             | src/api/**, src/routes/**, src/handlers/**|
| data     | docs/dev-journal/data.md            | src/models/**, db/**, migrations/**      |
| ui       | docs/dev-journal/ui.md              | src/ui/**, web/**, components/**          |
| infra    | docs/dev-journal/infra.md           | infra/**, deploy/**, *.tf, Dockerfile    |
| ci       | docs/dev-journal/ci.md              | .github/**, ci/**, *.yml                 |

Most-specific glob wins. For example a change to `src/api/auth_routes.py` matches
both `api` and (if you add it) a narrower rule — put the narrower area lower or make
its glob more specific and the agent will prefer it.

## Discussion threads (named explicitly)

Topic threads that accumulate reasoning over time and may span code areas. The agent
uses one when you reference the topic ("add this to the sway-damping discussion") or
when the work is a design discussion rather than a concrete code change.

| Thread key   | Journal file                                   | Topic                              |
|--------------|------------------------------------------------|------------------------------------|
| architecture | docs/dev-journal/discussions/architecture.md   | System-level design conversations  |
| perf         | docs/dev-journal/discussions/performance.md     | Performance investigations & tuning|
| <your-topic> | docs/dev-journal/discussions/<your-topic>.md    | <what this thread is about>        |

---

## Notes for editing this map
- Keep area keys short, lowercase, hyphen/underscore only — they become ID prefixes.
- Globs are matched against repo-relative paths. `**` spans directories; `*` is one
  segment. List several globs per area, comma-separated.
- You can point two areas at the same file if you want them merged; you can also
  give every microservice its own file. It's just paths.
- Add or remove rows freely. The agent re-reads this file each time, so changes take
  effect immediately — no reinstall.
