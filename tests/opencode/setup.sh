#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

export TEST_HOME
TEST_HOME="$(mktemp -d)"
export HOME="$TEST_HOME"
export XDG_CONFIG_HOME="$TEST_HOME/.config"
export OPENCODE_CONFIG_DIR="$TEST_HOME/.config/opencode"

YSCLAW_AGENT4_DIR="$OPENCODE_CONFIG_DIR/ysclaw-agent4"
YSCLAW_AGENT4_PLUGIN_FILE="$YSCLAW_AGENT4_DIR/.opencode/plugins/ysclaw-agent4.js"

mkdir -p "$YSCLAW_AGENT4_DIR"
cp -R "$REPO_ROOT/package.json" "$REPO_ROOT/.opencode" "$REPO_ROOT/skills" "$REPO_ROOT/schemas" "$REPO_ROOT/tools" "$YSCLAW_AGENT4_DIR/"

mkdir -p "$OPENCODE_CONFIG_DIR/plugins"
ln -sf "$YSCLAW_AGENT4_PLUGIN_FILE" "$OPENCODE_CONFIG_DIR/plugins/ysclaw-agent4.js"

cleanup_test_env() {
  if [[ -n "${TEST_HOME:-}" && -d "$TEST_HOME" ]]; then
    rm -rf "$TEST_HOME"
  fi
}

export -f cleanup_test_env
export REPO_ROOT
export YSCLAW_AGENT4_DIR
export YSCLAW_AGENT4_PLUGIN_FILE
