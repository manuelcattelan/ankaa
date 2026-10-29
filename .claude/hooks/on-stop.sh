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
  pnpm lint:fix --continue &>/dev/null || true
  pnpm format:fix &>/dev/null || true

  local checks=(
    "lint --continue --output-logs=errors-only"
    "check-types --continue --output-logs=errors-only"
    "format"
    "test --continue --output-logs=errors-only"
  )
  local failures=()
  local check
  local arguments
  local output
  for check in "${checks[@]}"; do
    read -ra arguments <<<"${check}"
    if ! output=$(pnpm "${arguments[@]}" 2>&1); then
      failures+=("${output}")
    fi
  done

  if ((${#failures[@]} == 0)); then
    exit 0
  fi

  local reason
  reason=$(
    echo "Fix these problems before you finish. The rules behind them are in AGENTS.md at the repository root and in the AGENTS.md of each workspace, and TESTING.md covers the tests."
    echo "The tests need Docker running. With Colima, set DOCKER_HOST to its socket, such as export DOCKER_HOST=\"unix://\${HOME}/.colima/default/docker.sock\", because Testcontainers doesn't read Docker contexts."
    printf '%s\n' "${failures[@]}" | sed $'s/\e\\[[0-9;]*m//g'
  )

  # Block with JSON on stdout rather than exit 2, because Claude Code doesn't block on an exit 2 whose stderr reads like a missing file, such as a failing test's ENOENT: https://code.claude.com/docs/en/hooks
  jq -n --arg reason "${reason}" '{decision: "block", reason: $reason}'
}

main "$@"
