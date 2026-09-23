#!/bin/sh

MAXIMUM_REPORT_LINES=300

cd "$CLAUDE_PROJECT_DIR" || exit 0

if [ -z "$(git status --porcelain)" ]; then
  exit 0
fi

pnpm format:fix > /dev/null 2>&1
pnpm lint:fix > /dev/null 2>&1
pnpm format:fix > /dev/null 2>&1

failures=""

for check in lint check-types format; do
  if ! output=$(FORCE_COLOR=0 pnpm "$check" 2>&1); then
    failures="$failures
$output"
  fi
done

if [ -z "$failures" ]; then
  exit 0
fi

printf 'Fix these problems before you finish:%s\n' "$failures" | tail -n "$MAXIMUM_REPORT_LINES" >&2
exit 2
