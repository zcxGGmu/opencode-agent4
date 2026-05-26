#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

tests=(
  "tests/comet/test-comet-assets.mjs"
)

for test_path in "${tests[@]}"; do
  echo "运行：$test_path"
  node "$test_path"
done

echo "所有 Comet 工作流测试通过。"
