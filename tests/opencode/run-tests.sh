#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

tests=(
  "tests/opencode/test-plugin-loading.sh"
  "tests/opencode/test-plugin-config.mjs"
  "tests/opencode/test-bootstrap-caching.sh"
  "tests/comet/run-tests.sh"
  "tests/schemas/validate-schemas.mjs"
  "tests/tools/test-agent4-tools.mjs"
)

for test_path in "${tests[@]}"; do
  echo "运行：$test_path"
  if [[ "$test_path" == *.mjs ]]; then
    node "$test_path"
  else
    bash "$test_path"
  fi
done

echo "所有 Agent4 测试通过。"
