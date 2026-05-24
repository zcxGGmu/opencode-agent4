# Gemini CLI 工具映射

Superpowers skills 使用 Claude Code 工具名。遇到这些工具名时，在 Gemini CLI 中使用对应能力：

| Skill 中的引用 | Gemini CLI 等价能力 |
|---|---|
| `Read`（读文件） | `read_file` |
| `Write`（创建文件） | `write_file` |
| `Edit`（编辑文件） | `replace` |
| `Bash`（运行命令） | `run_shell_command` |
| `Grep`（搜索文件内容） | `grep_search` |
| `Glob`（按名称搜索文件） | `glob` |
| `TodoWrite`（任务跟踪） | `write_todos` |
| `Skill` tool（调用 skill） | `activate_skill` |
| `WebSearch` | `google_web_search` |
| `WebFetch` | `web_fetch` |
| `Task` tool（派发子代理） | `@agent-name`，见下方子代理支持 |

## 子代理支持

Gemini CLI 通过 `@` 语法原生支持子代理。使用内置 `@generalist` 可以派发任意任务，它会获得工具访问并遵循你提供的 prompt。

当 skill 要求派发某个 agent type 时，使用 `@generalist` 并填充对应 prompt 模板：

| Skill 指令 | Gemini CLI 等价方式 |
|---|---|
| `Task tool (superpowers:implementer)` | `@generalist` + 填好的 `implementer-prompt.md` |
| `Task tool (superpowers:spec-reviewer)` | `@generalist` + 填好的 `spec-reviewer-prompt.md` |
| `Task tool (superpowers:code-reviewer)` | `@code-reviewer`（内置代理）或 `@generalist` + 填好的 review prompt |
| `Task tool (superpowers:code-quality-reviewer)` | `@generalist` + 填好的 `code-quality-reviewer-prompt.md` |
| `Task tool (general-purpose)` with inline prompt | `@generalist` + inline prompt |

### Prompt 填充

Skills 的 prompt 模板可能包含 `{WHAT_WAS_IMPLEMENTED}` 或 `[FULL TEXT of task]` 等占位符。填完所有占位符后，把完整 prompt 作为消息传给 `@generalist`。模板中已包含代理角色、审查标准和输出格式，`@generalist` 会遵循它。

### 并行派发

Gemini CLI 支持并行子代理派发。当 skill 要求并行派发多个独立任务时，在同一 prompt 中请求这些 `@generalist` 或具名子代理任务。依赖任务仍需顺序执行，但不要为了保持历史简单而串行化独立任务。

## 其他 Gemini CLI 工具

| 工具 | 用途 |
|---|---|
| `list_directory` | 列出文件和子目录 |
| `save_memory` | 把事实持久化到 GEMINI.md |
| `ask_user` | 向用户请求结构化输入 |
| `tracker_create_task` | 富任务管理，创建、更新、列出、可视化 |
| `enter_plan_mode` / `exit_plan_mode` | 修改前切换到只读研究模式 |
