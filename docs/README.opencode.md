# 面向 OpenCode 的源生 Claw Agent4

本包参考 `superpowers` 的当前 OpenCode 插件模式：

- `package.json` 通过 `main` 指向 `.opencode/plugins/ysclaw-agent4.js`。
- 插件通过 `config.skills.paths` 注册顶层 `skills/` 目录。
- 插件将缓存后的 Agent4 启动指引注入第一条用户消息。
- 如果宿主配置尚未定义，插件会补齐 Agent4 智能体和命令默认配置。

## 安装

本地检出：

```json
{
  "plugin": ["/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4"]
}
```

基于 Git 的安装：

```json
{
  "plugin": ["ysclaw-agent4@git+https://example.com/ysclaw-agent4.git"]
}
```

修改 `opencode.json` 后重启 OpenCode。

## 技能

OpenCode 应能发现这些技能：

- `using-ysclaw-agent4`
- `ysclaw-root-cause-blueprint-reader`
- `ysclaw-patch-plan-writer`
- `ysclaw-regression-verifier`
- `ysclaw-verified-patch-package-writer`

## 命令

插件会注册以下命令模板：

- `ysclaw-patch-plan`：校验 RootCauseBlueprint，在不修改代码的前提下生成 PatchPlan。
- `ysclaw-build-patch`：根据已确认的 PatchPlan 构建补丁，收集回归证据，并生成 VerifiedPatchPackage。

Markdown 形式的命令说明也保存在 `.opencode/commands/`。

## 智能体配置

默认智能体 id 是 `ysclaw-agent4-patch`。它被配置为带受限权限的主智能体：

- 允许读取、列出、搜索和通配匹配。
- 编辑需要询问。
- 允许 `git` 和 `node`。
- `npm`、`agent1`、任务委派和外部目录访问需要询问。
- 默认禁止网页获取和搜索。

## 排障

如果技能缺失：

1. 确认 `opencode.json` 中的插件路径。
2. 重启 OpenCode。
3. 在本仓库运行 `npm test`。
4. 检查 OpenCode 日志中的插件加载错误。
