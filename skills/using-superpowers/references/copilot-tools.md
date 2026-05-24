# Copilot CLI 工具映射

Superpowers skills 使用 Claude Code 工具名。遇到这些工具名时，在 Copilot CLI 中使用对应能力：

| Skill 中的引用 | Copilot CLI 等价能力 |
|---|---|
| `Read`（读文件） | `view` |
| `Write`（创建文件） | `create` |
| `Edit`（编辑文件） | `edit` |
| `Bash`（运行命令） | `bash` |
| `Grep`（搜索文件内容） | `grep` |
| `Glob`（按名称搜索文件） | `glob` |
| `Skill` tool（调用 skill） | `skill` |
| `WebFetch` | `web_fetch` |
| `Task` tool（派发子代理） | `task`，使用 `agent_type: "general-purpose"` 或 `"explore"` |
| 多个 `Task` 调用（并行） | 多个 `task` 调用 |
| Task 状态和输出 | `read_agent`、`list_agents` |
| `TodoWrite`（任务跟踪） | `sql`，使用内置 `todos` 表 |
| `WebSearch` | 无直接等价能力，可用 `web_fetch` 访问搜索引擎 URL |
| `EnterPlanMode` / `ExitPlanMode` | 无直接等价能力，留在主会话 |

## 异步 shell 会话

Copilot CLI 支持持久异步 shell 会话，Claude Code 没有直接等价能力：

| 工具 | 用途 |
|---|---|
| `bash` with `async: true` | 后台启动长时间命令 |
| `write_bash` | 向运行中的 async session 发送输入 |
| `read_bash` | 读取 async session 输出 |
| `stop_bash` | 终止 async session |
| `list_bash` | 列出活跃 shell sessions |

## 其他 Copilot CLI 工具

| 工具 | 用途 |
|---|---|
| `store_memory` | 为未来会话保存代码库事实 |
| `report_intent` | 更新 UI status line |
| `sql` | 查询会话 SQLite 数据库，例如 todos、metadata |
| `fetch_copilot_cli_documentation` | 查询 Copilot CLI 文档 |
| GitHub MCP tools (`github-mcp-server-*`) | 原生 GitHub API 访问，例如 issues、PRs、code search |
