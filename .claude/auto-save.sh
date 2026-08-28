#!/usr/bin/env bash
# Auto-save: commit any working-tree changes and push them to origin/main.
#
# Wired to the Stop hook, so it runs after each turn finishes. Prints a JSON
# object on stdout; Claude Code shows the "systemMessage" to the user.
#
# Deliberately conservative:
#   - never pushes when there is nothing to commit (no empty commits)
#   - never force-pushes; a rejected push is reported, not forced through
#   - refuses to commit anything matching a secret-ish path, in case
#     .gitignore ever misses one
#   - always exits 0, so a failure here can never block the session

set -uo pipefail

REPO="/e/Projects/francisgadgets"
BRANCH="main"

emit() { printf '{"systemMessage": %s, "suppressOutput": true}\n' "$(printf '%s' "$1" | python -c 'import json,sys; print(json.dumps(sys.stdin.read()))')"; }

cd "$REPO" 2>/dev/null || { emit "auto-save: repo not found at $REPO"; exit 0; }
git rev-parse --git-dir >/dev/null 2>&1 || { emit "auto-save: not a git repository"; exit 0; }

# Nothing changed -> nothing to do. Stay silent.
if [ -z "$(git status --porcelain)" ]; then
  exit 0
fi

git add -A >/dev/null 2>&1

# Safety net: never let a credential through, even if .gitignore missed it.
RISKY=$(git diff --cached --name-only | grep -iE '(^|/)\.env($|\.)|\.pem$|\.key$|id_rsa|\.pfx$|credentials\.json$' || true)
if [ -n "$RISKY" ]; then
  git reset -q
  emit "auto-save STOPPED: these look like secrets and were not committed:
$RISKY"
  exit 0
fi

if git diff --cached --quiet; then
  exit 0
fi

FILES=$(git diff --cached --name-only | wc -l | tr -d ' ')
STAMP=$(date '+%Y-%m-%d %H:%M')

if ! git commit -q -m "Auto-save $STAMP ($FILES file(s))" >/dev/null 2>&1; then
  emit "auto-save: commit failed; changes are still staged"
  exit 0
fi

SHA=$(git rev-parse --short HEAD)

if git push -q origin "$BRANCH" >/dev/null 2>&1; then
  emit "auto-saved to GitHub: $SHA ($FILES file(s))"
else
  emit "auto-save: committed $SHA locally, but the push to origin/$BRANCH failed (offline, or the remote has moved on). Run: git pull --rebase && git push"
fi

exit 0
