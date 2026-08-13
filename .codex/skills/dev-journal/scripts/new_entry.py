#!/usr/bin/env python3
"""
new_entry.py — print the next dev-journal entry ID and a blank skeleton.

This helper is READ-ONLY with respect to the journal: it never edits, reorders,
or deletes existing entries. It only reads the file to find today's highest entry
number, then prints a ready-to-fill entry to stdout. You review it, fill it in,
and append it yourself (e.g. with a redirect or your editor).

Usage:
    python new_entry.py
    python new_entry.py --journal docs/dev-journal/auth.md --area auth --type bug-fix --title "fix empty upload crash"

If the journal doesn't exist yet, the ID starts at .01 for today. With --area the
ID is prefixed, e.g. [auth:2026-07-13.01], so it stays unique across journal files.
"""
import argparse
import datetime as dt
import re
import sys
from pathlib import Path

DEFAULT_JOURNAL = "docs/dev-journal/JOURNAL.md"
# Matches "## [2026-07-13.01] ..." and "## [auth:2026-07-13.01] ..."
ID_RE = re.compile(r"^##\s*\[(?:[A-Za-z0-9._-]+:)?(\d{4}-\d{2}-\d{2})\.(\d+)\]")

TEMPLATE = """## [{id}] {title}
- **Type:** {type}
- **When:** {when}
- **Trigger:** <what prompted this: user request, failing test, error report>
- **Scope:** <files / modules / functions touched> · <branch or commit ref>
- **Status:** active

### Problem / Error
<what was wrong; exact error message; how it reproduced; observed vs. expected>

### Root cause
<the underlying reason, not just the symptom>

### Change
<what was changed, summarized; reference the commit/PR, don't paste the full diff>

### Reasoning — why this way
<chain of thought: why this approach; alternatives considered and why rejected; tradeoffs>

### Feature intent  (features only)
<what the feature is; why it's being added; the goal/requirement it serves>

### Risks / follow-ups
<known limitations, TODOs, tests still needed, things to watch>
"""


def next_id(journal: Path, today: str) -> str:
    highest = 0
    if journal.exists():
        for line in journal.read_text(encoding="utf-8", errors="replace").splitlines():
            m = ID_RE.match(line)
            if m and m.group(1) == today:
                highest = max(highest, int(m.group(2)))
    return f"{today}.{highest + 1:02d}"


def main() -> int:
    ap = argparse.ArgumentParser(description="Print the next dev-journal entry ID and skeleton.")
    ap.add_argument("--journal", default=DEFAULT_JOURNAL, help=f"path to journal (default: {DEFAULT_JOURNAL})")
    ap.add_argument("--area", default="", help="area key prefix for the ID, e.g. 'auth' -> [auth:YYYY-MM-DD.NN]")
    ap.add_argument("--type", default="bug-fix | error-diagnosis | feature | refactor | decision | config | perf | security")
    ap.add_argument("--title", default="<short imperative title>")
    args = ap.parse_args()

    now = dt.datetime.now()
    today = now.strftime("%Y-%m-%d")
    seq = next_id(Path(args.journal), today)  # e.g. "2026-07-13.01"
    entry_id = f"{args.area}:{seq}" if args.area else seq

    print(TEMPLATE.format(
        id=entry_id,
        title=args.title,
        type=args.type,
        when=now.strftime("%Y-%m-%d %H:%M"),
    ))
    # ID also goes to stderr so it's visible even when stdout is redirected.
    print(f"[next id: {entry_id}]", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
