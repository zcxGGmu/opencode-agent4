---
name: using-git-worktrees
description: 开始需要隔离的功能工作，或执行实施计划前使用。通过原生工具或 git worktree fallback 确保存在隔离工作区。
---

# 使用 Git Worktrees

## 概览

确保工作发生在隔离工作区。优先使用平台原生 worktree 工具；没有原生工具时，才 fallback 到手动 `git worktree`。

**核心原则:** 先检测已有隔离，再使用原生工具，最后才用 git。不要和宿主 harness 对抗。

**开始时声明:** “我正在使用 using-git-worktrees skill 来设置隔离工作区。”

## 步骤 0：检测现有隔离

创建任何东西之前，先检查当前是否已经在隔离工作区。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule 防护:** `GIT_DIR != GIT_COMMON` 在 git submodule 中也可能成立。认定“已经在 worktree”之前，先确认不是 submodule：

```bash
# 如果返回路径，说明你在 submodule，不是 worktree，按普通 repo 处理
git rev-parse --show-superproject-working-tree 2>/dev/null
```

如果 `GIT_DIR != GIT_COMMON` 且不是 submodule：已经在 linked worktree 中。跳到步骤 3，不要再创建 worktree。

报告分支状态：

- 在分支上：“已经在隔离工作区 `<path>`，分支 `<name>`。”
- detached HEAD：“已经在隔离工作区 `<path>`（detached HEAD，外部管理）。收尾时需要创建分支。”

如果 `GIT_DIR == GIT_COMMON` 或处于 submodule：当前是普通 repo checkout。

如果用户指令中已经声明 worktree 偏好，按偏好执行。否则，创建前先征得同意：

> “要我设置隔离 worktree 吗？它可以保护当前分支不受改动影响。”

用户拒绝时，在当前目录工作并跳到步骤 3。

## 步骤 1：创建隔离工作区

按顺序尝试两种机制。

### 1a. 原生 Worktree 工具，优先

如果平台提供 `EnterWorktree`、`WorktreeCreate`、`/worktree` 命令或 `--worktree` flag，使用它，然后跳到步骤 3。

原生工具会处理目录位置、分支创建和清理。已有原生工具时还手动 `git worktree add`，会制造宿主看不到的状态。

只有没有原生 worktree 工具时，才进入 1b。

### 1b. Git Worktree Fallback

仅当 1a 不适用时使用手动 git worktree。

#### 目录选择

优先级如下。用户显式偏好永远优先。

1. 检查指令中是否声明 worktree 目录偏好，有则直接使用。
2. 检查项目内已有目录：
   ```bash
   ls -d .worktrees 2>/dev/null
   ls -d worktrees 2>/dev/null
   ```
   如果都存在，优先 `.worktrees`。
3. 检查历史全局目录：
   ```bash
   project=$(basename "$(git rev-parse --show-toplevel)")
   ls -d ~/.config/superpowers/worktrees/$project 2>/dev/null
   ```
4. 如果没有其他信息，默认使用项目根目录下的 `.worktrees/`。

#### 安全验证，仅项目内目录

创建 worktree 前必须确认目录被 git ignore：

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

如果未 ignore：添加到 `.gitignore`，提交该变更，再继续。

原因：防止误把 worktree 内容提交进仓库。

全局目录 `~/.config/superpowers/worktrees/` 不需要此验证。

#### 创建 worktree

```bash
project=$(basename "$(git rev-parse --show-toplevel)")

# 根据选定位置确定 path：
# 项目内：path="$LOCATION/$BRANCH_NAME"
# 全局：path="~/.config/superpowers/worktrees/$project/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Sandbox fallback:** 如果 `git worktree add` 因权限错误失败，告诉用户 sandbox 阻止了 worktree 创建，将在当前目录工作。然后在当前目录运行 setup 和 baseline tests。

## 步骤 3：项目设置

自动检测并运行合适 setup：

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## 步骤 4：验证干净基线

运行测试确认工作区起点干净：

```bash
# 使用项目合适命令
npm test / cargo test / pytest / go test ./...
```

如果测试失败：报告失败，询问是继续还是先调查。

如果测试通过：报告已准备好。

### 报告格式

```text
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## 快速参考

| 情况 | 动作 |
|---|---|
| 已在 linked worktree | 跳过创建 |
| 在 submodule | 按普通 repo 处理 |
| 有原生 worktree 工具 | 使用原生工具 |
| 无原生工具 | 使用 git worktree fallback |
| `.worktrees/` 存在 | 使用它并确认被 ignore |
| `worktrees/` 存在 | 使用它并确认被 ignore |
| 两者都存在 | 使用 `.worktrees/` |
| 都不存在 | 查指令，再默认 `.worktrees/` |
| 全局路径存在 | 兼容使用 |
| 目录未 ignore | 添加到 `.gitignore` 并提交 |
| 创建权限错误 | sandbox fallback，在当前目录工作 |
| baseline tests 失败 | 报告并询问 |
| 无 package.json/Cargo.toml | 跳过依赖安装 |

## 常见错误

**和 harness 对抗**

- 问题：平台已经提供隔离，还手动 `git worktree add`。
- 修复：步骤 0 检测现有隔离，步骤 1a 优先原生工具。

**跳过检测**

- 问题：在现有 worktree 中创建嵌套 worktree。
- 修复：创建任何东西前都运行步骤 0。

**跳过 ignore 验证**

- 问题：worktree 内容被 git 跟踪，污染 status。
- 修复：项目内 worktree 创建前永远使用 `git check-ignore`。

**臆测目录位置**

- 问题：制造不一致，违反项目约定。
- 修复：遵循优先级：已有目录 > 全局历史路径 > 指令 > 默认。

**测试失败仍继续**

- 问题：无法区分新 bug 和既有问题。
- 修复：报告失败并获取明确许可。

## 危险信号

永远不要：

- 在步骤 0 已检测到隔离时再创建 worktree。
- 有原生 worktree 工具时使用 `git worktree add`。
- 跳过 1a 直接执行 1b 的 git 命令。
- 未确认 ignore 就创建项目内 worktree。
- 跳过 baseline 测试。
- 测试失败时未经询问继续。

始终要：

- 先运行步骤 0。
- 优先原生工具。
- 遵循目录优先级。
- 项目内目录必须确认 ignore。
- 自动检测并运行项目 setup。
- 验证干净测试基线。
