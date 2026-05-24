---
name: finishing-a-development-branch
description: 当实现完成、测试通过，并需要决定如何集成工作时使用。通过结构化选项指导 merge、PR 或清理流程。
---

# 完成开发分支

## 概览

通过清晰选项完成开发工作，并执行用户选择的流程。

**核心原则:** 验证测试 -> 检测环境 -> 展示选项 -> 执行选择 -> 清理。

**开始时声明:** “我正在使用 finishing-a-development-branch skill 来完成这项工作。”

## 流程

### 步骤 1：验证测试

展示选项前，先验证测试通过：

```bash
# 运行项目测试套件
npm test / cargo test / pytest / go test ./...
```

如果测试失败：

```text
测试失败（<N> 个失败）。必须先修复再收尾：

[展示失败]

测试通过前不能 merge 或创建 PR。
```

停止，不进入步骤 2。

如果测试通过，继续步骤 2。

### 步骤 2：检测环境

展示选项前确定工作区状态：

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

这决定展示哪个菜单，以及如何清理：

| 状态 | 菜单 | 清理 |
|---|---|---|
| `GIT_DIR == GIT_COMMON`，普通 repo | 标准 4 选项 | 没有 worktree 要清理 |
| `GIT_DIR != GIT_COMMON`，命名分支 | 标准 4 选项 | 基于来源判断，见步骤 6 |
| `GIT_DIR != GIT_COMMON`，detached HEAD | 精简 3 选项，无 merge | 不清理，外部管理 |

### 步骤 3：确定 base branch

```bash
# 尝试常见 base branches
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

或询问：“这个分支是从 main 分出来的，对吗？”

### 步骤 4：展示选项

普通 repo 和命名分支 worktree，精确展示这 4 个选项：

```text
实现已完成。你希望怎么处理？

1. 本地合并回 <base-branch>
2. 推送并创建 Pull Request
3. 保留当前分支，我稍后处理
4. 丢弃这次工作

选择哪一项？
```

detached HEAD，精确展示这 3 个选项：

```text
实现已完成。当前处于 detached HEAD（外部管理的工作区）。

1. 推送为新分支并创建 Pull Request
2. 保留现状，我稍后处理
3. 丢弃这次工作

选择哪一项？
```

不要添加额外解释，保持选项简洁。

### 步骤 5：执行选择

#### 选项 1：本地合并

```bash
# 获取主 repo 根目录，确保 CWD 安全
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# 先 merge，验证成功后才删除任何东西
git checkout <base-branch>
git pull
git merge <feature-branch>

# 在合并结果上验证测试
<test command>

# merge 成功后：清理 worktree（步骤 6），再删除分支
```

然后清理 worktree，再删除分支：

```bash
git branch -d <feature-branch>
```

#### 选项 2：推送并创建 PR

```bash
# 推送分支
git push -u origin <feature-branch>

# 创建 PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

不要清理 worktree，用户需要它处理 PR 反馈。

#### 选项 3：保留现状

报告：“保留分支 `<name>`。worktree 保留在 `<path>`。”

不要清理 worktree。

#### 选项 4：丢弃

必须先确认：

```text
这会永久删除：
- 分支 <name>
- 所有提交：<commit-list>
- worktree：<path>

输入 'discard' 确认。
```

等待精确确认。

确认后：

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

然后清理 worktree，再强制删除分支：

```bash
git branch -D <feature-branch>
```

### 步骤 6：清理工作区

只在选项 1 和 4 执行。选项 2 和 3 始终保留 worktree。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

如果 `GIT_DIR == GIT_COMMON`：普通 repo，没有 worktree 要清理。

如果 worktree 路径位于 `.worktrees/`、`worktrees/` 或 `~/.config/superpowers/worktrees/` 下：这是 Superpowers 创建的 worktree，允许清理。

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune
```

否则：工作区由宿主环境管理。不要删除。如果平台提供 workspace-exit 工具，使用它；否则保留工作区。

## 快速参考

| 选项 | Merge | Push | 保留 Worktree | 清理分支 |
|---|---|---|---|---|
| 1. 本地合并 | yes | - | - | yes |
| 2. 创建 PR | - | yes | yes | - |
| 3. 保留现状 | - | - | yes | - |
| 4. 丢弃 | - | - | - | yes，force |

## 常见错误

**跳过测试验证**

- 问题：合入坏代码或创建失败 PR。
- 修复：展示选项前永远先验证测试。

**开放式问题**

- 问题：“下一步做什么？”太模糊。
- 修复：展示精确 4 个结构化选项，detached HEAD 时 3 个。

**为选项 2 清理 worktree**

- 问题：删除了用户处理 PR 反馈需要的 worktree。
- 修复：只为选项 1 和 4 清理。

**删除分支早于移除 worktree**

- 问题：`git branch -d` 会因为 worktree 仍引用分支而失败。
- 修复：先 merge，再移除 worktree，最后删分支。

**在要删除的 worktree 内运行 `git worktree remove`**

- 问题：命令可能失败或行为异常。
- 修复：先 `cd` 到主 repo 根目录。

**清理宿主环境拥有的 worktree**

- 问题：删除宿主创建的 worktree 会造成状态错乱。
- 修复：只清理 `.worktrees/`、`worktrees/` 或 `~/.config/superpowers/worktrees/` 下的 worktree。

**丢弃前没有确认**

- 问题：误删工作。
- 修复：要求用户输入精确的 `discard`。

## 危险信号

永远不要：

- 在测试失败时继续。
- 不验证合并结果就 merge。
- 未确认就删除工作。
- 未明确请求就 force-push。
- 合并成功前删除 worktree。
- 清理你没有创建的 worktree。
- 在 worktree 内运行 `git worktree remove` 删除自身。

始终要：

- 展示选项前验证测试。
- 展示菜单前检测环境。
- 精确展示 4 个选项，detached HEAD 时 3 个。
- 选项 4 要求 typed confirmation。
- 只为选项 1 和 4 清理 worktree。
- 删除 worktree 前 `cd` 到主 repo 根目录。
- 删除后运行 `git worktree prune`。
