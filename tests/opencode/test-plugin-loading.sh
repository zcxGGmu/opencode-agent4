#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PLUGIN_FILE="$REPO_ROOT/.opencode/plugins/ysclaw-agent4.js"

echo "Checking package metadata..."
test -f "$REPO_ROOT/package.json"
node -e "const p=require('./package.json'); if (p.type !== 'module') throw new Error('package type must be module'); if (p.main !== '.opencode/plugins/ysclaw-agent4.js') throw new Error('unexpected package main');"

echo "Checking Codex plugin metadata..."
test -f "$REPO_ROOT/.codex-plugin/plugin.json"
node -e "const p=require('./.codex-plugin/plugin.json'); if (p.name !== 'ysclaw-agent4') throw new Error('unexpected plugin name'); if (p.skills !== './skills/') throw new Error('skills path must be ./skills/');"

echo "Checking OpenCode plugin syntax..."
test -f "$PLUGIN_FILE"
node --check "$PLUGIN_FILE"

echo "Checking Agent4 package files..."
test -f "$REPO_ROOT/.opencode/INSTALL.md"
test -f "$REPO_ROOT/.opencode/agents/ysclaw-agent4-patch.md"
test -f "$REPO_ROOT/.opencode/commands/ysclaw-patch-plan.md"
test -f "$REPO_ROOT/.opencode/commands/ysclaw-build-patch.md"

echo "Checking bundled skills..."
for skill in \
  using-ysclaw-agent4 \
  ysclaw-root-cause-blueprint-reader \
  ysclaw-patch-plan-writer \
  ysclaw-regression-verifier \
  ysclaw-verified-patch-package-writer
do
  test -f "$REPO_ROOT/skills/$skill/SKILL.md"
  grep -q "^name: $skill$" "$REPO_ROOT/skills/$skill/SKILL.md"
done

echo "Checking schemas..."
for schema in \
  root-cause-blueprint \
  patch-plan \
  patch-candidate \
  patch-regression-result \
  verified-patch-package
do
  test -f "$REPO_ROOT/schemas/$schema.schema.json"
done

echo "Plugin loading checks passed."
