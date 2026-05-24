#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

node "$REPO_ROOT/tests/opencode/test-bootstrap-caching.mjs" "$REPO_ROOT/.opencode/plugins/ysclaw-agent4.js"
