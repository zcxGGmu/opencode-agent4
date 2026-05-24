# opencode-agent4 中的 Superpowers for OpenCode

本仓库把 Superpowers skills 嵌入到 `opencode-agent4` OpenCode 插件中。配置本包后，不需要再单独安装 upstream Superpowers 插件。

嵌入内容迁移自 `/Users/zq/Desktop/ai-projs/posp/template/superpowers`；上游 MIT 许可保存在 `docs/LICENSE.superpowers`。

## 安装

在全局或项目级 `opencode.json` 的 `plugin` 数组中加入 `opencode-agent4`：

```json
{
  "plugin": ["/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4"]
}
```

重启 OpenCode。Agent4 插件会从共享的 `skills/` 目录注册 Agent4 skills 和嵌入的 Superpowers skills。

验证方式：让 OpenCode 列出 skills，并确认存在 `using-superpowers`、`writing-plans`、`test-driven-development` 和 `systematic-debugging`。

如果你还在 Claude Code、Codex 或其他 harness 中独立使用 Superpowers，需要为对应环境单独安装。

### 从旧 symlink 安装迁移

如果此前通过 `git clone` 和 symlink 安装过 superpowers，先清理旧设置：

```bash
# 删除旧 symlink
rm -f ~/.config/opencode/plugins/superpowers.js
rm -rf ~/.config/opencode/skills/superpowers

# 可选：删除旧 clone
rm -rf ~/.config/opencode/superpowers

# 如果 opencode.json 中手动添加过 superpowers 的 skills.paths，也移除它
```

然后按上方 `opencode-agent4` 安装方式配置。

## 使用

### 查找 Skills

使用 OpenCode 原生 `skill` 工具列出所有可用 skills：

```text
use skill tool to list skills
```

### 加载 Skill

```text
use skill tool to load superpowers/brainstorming
```

### 个人 Skills

可以在 `~/.config/opencode/skills/` 创建个人 skills：

```bash
mkdir -p ~/.config/opencode/skills/my-skill
```

创建 `~/.config/opencode/skills/my-skill/SKILL.md`：

```markdown
---
name: my-skill
description: 在 [condition] 时使用，用于 [what it does]
---

# My Skill

[skill content here]
```

### 项目 Skills

项目级 skills 可放在项目内 `.opencode/skills/`。

**优先级:** Project skills > Personal skills > Superpowers skills

## 更新

本仓库 vendored 了一份本地 Superpowers skills。更新时，把目标 upstream `skills/` 内容复制到本仓库，然后运行：

```bash
npm test
```

如果选择单独安装 upstream Superpowers，可以用 branch 或 tag 固定版本：

```json
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git#v5.0.3"]
}
```

## 工作原理

插件做两件事：

1. 通过 `experimental.chat.messages.transform` 注入 bootstrap context，让每个对话都知道 Agent4 与 Superpowers。
2. 通过 `config` hook 注册 `skills/` 目录，让 OpenCode 无需 symlink 或手动配置即可发现 Agent4 和 Superpowers skills。

### 工具映射

为 Claude Code 编写的 skills 在 OpenCode 中按以下方式适配：

- `TodoWrite` -> `todowrite`
- 带 subagents 的 `Task` -> OpenCode 的 `@mention` 或子代理机制
- `Skill` tool -> OpenCode 原生 `skill` 工具
- 文件操作 -> OpenCode 原生文件工具

## 排障

### 插件没有加载

1. 检查 OpenCode 日志：`opencode run --print-logs "hello" 2>&1 | grep -i ysclaw`
2. 确认 `opencode.json` 中插件路径正确。
3. 确认使用较新的 OpenCode 版本。

### Windows 安装问题

部分 Windows OpenCode 构建对 git-backed plugin specs 有上游安装问题，例如 `git+https` 缓存路径或 Bun 找不到 `git.exe`。如果 git-backed 插件无法安装，使用 `opencode-agent4` 本地 checkout，并在 `opencode.json` 中指向该路径。

### 找不到 Skills

1. 用 OpenCode 的 `skill` 工具列出 skills。
2. 检查插件是否加载。
3. 确认每个 skill 都有带合法 YAML frontmatter 的 `SKILL.md`。

### Bootstrap 没出现

1. 确认 OpenCode 版本支持 `experimental.chat.messages.transform` hook。
2. 配置变更后重启 OpenCode。

## 获取帮助

- Issues: https://github.com/obra/superpowers/issues
- 上游文档: https://github.com/obra/superpowers
- OpenCode docs: https://opencode.ai/docs/
