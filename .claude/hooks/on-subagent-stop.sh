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

  local project_root
  project_root=$(git -C "${CLAUDE_PROJECT_DIR}" rev-parse --show-toplevel)

  if [[ ${repository_root} == "${project_root}" ]]; then
    exit 0
  fi

  exec "${CLAUDE_PROJECT_DIR}/.claude/hooks/on-stop.sh" <<<"${input}"
}

main "$@"
