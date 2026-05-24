# Codex 工具映射

Superpowers skills 使用 Claude Code 工具名。遇到这些工具名时，在 Codex 中使用对应能力：

| Skill 中的引用 | Codex 等价能力 |
|---|---|
| `Task` tool（派发子代理） | `spawn_agent`，见下方 multi-agent 说明 |
| 多个 `Task` 调用（并行） | 多个 `spawn_agent` 调用 |
| Task 返回结果 | `wait_agent` |
| Task 自动完成后释放槽位 | `close_agent` |
| `TodoWrite`（任务跟踪） | `update_plan` |
| `Skill` tool（调用 skill） | skills 原生加载，直接遵循说明 |
| `Read`、`Write`、`Edit`（文件） | 使用 Codex 原生文件工具 |
| `Bash`（运行命令） | 使用 Codex 原生命令工具 |

## 子代理派发需要 multi-agent 支持

在 Codex 配置 `~/.codex/config.toml` 中启用：

```toml
[features]
multi_agent = true
```

这会为 `dispatching-parallel-agents` 和 `subagent-driven-development` 等 skills 启用 `spawn_agent`、`wait_agent` 和 `close_agent`。

历史说明：`rust-v0.115.0` 之前的 Codex 版本曾把 spawned-agent 等待暴露为 `wait`。当前 Codex 使用 `wait_agent`。`wait` 现在属于 code-mode `exec/wait`，按 `cell_id` 恢复 yielded exec cell，不是 spawned-agent 结果工具。

## 环境检测

会创建 worktree 或完成分支的 skills 应先用只读 git 命令检测环境：

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

- `GIT_DIR != GIT_COMMON`：已经在 linked worktree 中，跳过创建。
- `BRANCH` 为空：detached HEAD，不能直接从 sandbox 分支、push 或 PR。

具体使用方式见 `using-git-worktrees` 步骤 0 和 `finishing-a-development-branch` 的环境检测。

## Codex App 收尾

当 sandbox 阻止 branch/push 操作，例如外部管理 worktree 中的 detached HEAD，代理应提交所有工作，并告知用户使用 App 原生控件：

- **Create branch**：命名分支，然后通过 App UI commit、push、PR。
- **Hand off to local**：把工作转交给用户本地 checkout。

代理仍可运行测试、暂存文件，并输出建议分支名、提交消息和 PR 描述。
