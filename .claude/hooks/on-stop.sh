#!/usr/bin/env bash

set -euo pipefail

main() {
  local input
  input=$(cat)

  local working_directory
  working_directory=$(jq -r '.cwd // empty' <<<"${input}")

  local repository_root
  if ! repository_root=$(git -C "${working_directory:-${CLAUDE_PROJECT_DIR}}" rev-parse --show-toplevel 2>/dev/null); then
    exit 0
  fi

  cd "${repository_root}"

  local changes
  changes=$(git status --porcelain)

  if [[ -z ${changes} ]]; then
    exit 0
  fi

  pnpm format:fix &>/dev/null || true
  pnpm lint:fix &>/dev/null || true
  pnpm format:fix &>/dev/null || true

  local failures=()
  local check output
  for check in lint check-types format; do
    if ! output=$(pnpm "${check}" --output-logs=errors-only 2>&1); then
      failures+=("${output}")
    fi
  done

  if ((${#failures[@]} == 0)); then
    exit 0
  fi

  {
    echo "Fix these problems before you finish. The rules behind them are in AGENTS.md at the repository root and in the AGENTS.md of each workspace:"
    printf '%s\n' "${failures[@]}" | sed $'s/\e\\[[0-9;]*m//g'
  } >&2

  exit 2
}

main "$@"
