#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PLUGIN_FILE="$REPO_ROOT/.opencode/plugins/ysclaw-agent4.js"

echo "检查包元数据..."
test -f "$REPO_ROOT/package.json"
node -e "const p=require('./package.json'); if (p.type !== 'module') throw new Error('包 type 必须是 module'); if (p.main !== '.opencode/plugins/ysclaw-agent4.js') throw new Error('包 main 不符合预期');"
node -e "const p=require('./package.json'); if (p.dependencies?.['@fission-ai/openspec'] !== '1.3.1') throw new Error('必须声明 OpenSpec CLI 运行时依赖');"

echo "检查 OpenCode 本地依赖声明..."
test -f "$REPO_ROOT/.opencode/package.json"
node -e "const p=require('./.opencode/package.json'); if (p.dependencies?.['@fission-ai/openspec'] !== '1.3.1') throw new Error('.opencode/package.json 必须声明 OpenSpec CLI 依赖');"

echo "检查 Codex 插件元数据..."
test -f "$REPO_ROOT/.codex-plugin/plugin.json"
node -e "const p=require('./.codex-plugin/plugin.json'); if (p.name !== 'ysclaw-agent4') throw new Error('插件名称不符合预期'); if (p.skills !== './skills/') throw new Error('技能目录必须是 ./skills/');"

echo "检查 OpenCode 插件语法..."
test -f "$PLUGIN_FILE"
node --check "$PLUGIN_FILE"

echo "检查 Agent4 包文件..."
test -f "$REPO_ROOT/.opencode/INSTALL.md"
test -f "$REPO_ROOT/.opencode/agents/ysclaw-agent4-patch.md"
test -f "$REPO_ROOT/.opencode/commands/ysclaw-patch-plan.md"
test -f "$REPO_ROOT/.opencode/commands/ysclaw-build-patch.md"

echo "检查内置技能..."
for skill in \
  using-ysclaw-agent4 \
  ysclaw-root-cause-blueprint-reader \
  ysclaw-patch-plan-writer \
  ysclaw-regression-verifier \
  ysclaw-verified-patch-package-writer \
  using-superpowers \
  brainstorming \
  dispatching-parallel-agents \
  executing-plans \
  writing-plans \
  writing-skills \
  test-driven-development \
  systematic-debugging \
  subagent-driven-development \
  using-git-worktrees \
  verification-before-completion \
  requesting-code-review \
  receiving-code-review \
  finishing-a-development-branch
do
  test -f "$REPO_ROOT/skills/$skill/SKILL.md"
  grep -q "^name: $skill$" "$REPO_ROOT/skills/$skill/SKILL.md"
done

echo "检查 Comet 工作流技能..."
for skill in \
  comet \
  comet-open \
  comet-design \
  comet-build \
  comet-verify \
  comet-archive \
  comet-hotfix \
  comet-tweak
do
  test -f "$REPO_ROOT/skills/$skill/SKILL.md"
  grep -q "^name: $skill$" "$REPO_ROOT/skills/$skill/SKILL.md"
done

echo "检查内置 OpenSpec 技能..."
for skill in \
  openspec-explore \
  openspec-propose \
  openspec-new-change \
  openspec-apply-change \
  openspec-verify-change \
  openspec-archive-change
do
  test -f "$REPO_ROOT/skills/$skill/SKILL.md"
  grep -q "^name: $skill$" "$REPO_ROOT/skills/$skill/SKILL.md"
done

echo "检查 Comet 工作流脚本..."
for script in \
  comet-state.sh \
  comet-guard.sh \
  comet-handoff.sh \
  comet-archive.sh \
  comet-yaml-validate.sh
do
  test -f "$REPO_ROOT/skills/comet/scripts/$script"
  bash -n "$REPO_ROOT/skills/comet/scripts/$script"
done
test -f "$REPO_ROOT/skills/comet/reference/dirty-worktree.md"

echo "检查 Superpowers 迁移资源..."
test -f "$REPO_ROOT/assets/superpowers-app-icon.png"
test -f "$REPO_ROOT/assets/superpowers-small.svg"
test -f "$REPO_ROOT/docs/LICENSE.superpowers"
test -f "$REPO_ROOT/docs/README.superpowers.opencode.md"

echo "检查结构约束文件..."
for schema in \
  root-cause-blueprint \
  patch-plan \
  patch-candidate \
  patch-regression-result \
  verified-patch-package
do
  test -f "$REPO_ROOT/schemas/$schema.schema.json"
done

echo "插件加载检查通过。"
