---
name: writing-skills
description: 创建或更新 Superpowers/Codex skill 时使用。帮助写出触发明确、可执行、可测试的 skill 文档。
---

# 编写 Skills

## 概览

好的 skill 是可执行的工作流，不是泛泛建议。它应该告诉代理何时使用、如何执行、何时停止、如何验证。

**核心原则:** 触发清晰、步骤具体、边界明确、可测试。

## Skill 文件结构

每个 skill 至少包含：

```markdown
---
name: skill-name
description: 何时使用这个 skill，以及它完成什么。
---

# 标题

## 概览

## 何时使用

## 流程

## 验证
```

`name` 保持稳定机器标识，不翻译。`description` 是触发关键，应写得具体。

## 写 description

description 应回答：

- 什么时候使用。
- 解决什么问题。
- 有什么强约束或输出。

好：

```yaml
description: 修复测试失败或异常行为时使用。要求先复现和定位根因，再修改代码。
```

差：

```yaml
description: Helps with debugging.
```

## 内容原则

- 使用命令式语言：“先做 X，再做 Y”。
- 给出停止条件和升级条件。
- 写清验证命令或验证证据。
- 用 checklist 表示必须步骤。
- 保留必要示例。
- 避免抽象价值观堆砌。

## 触发设计

一个 skill 的触发条件应足够窄：

- 不要让一个 skill 覆盖所有开发活动。
- 不要和已有 skill 大量重叠。
- 如果是组合工作流，明确调用哪些子 skill。

## 步骤设计

每一步都要可执行。坏步骤：

- “考虑安全性”
- “写好测试”
- “优化代码”

好步骤：

- “列出所有用户输入入口，并标记每个入口的校验位置。”
- “先写一个失败测试，复现未授权用户能访问资源的行为。”
- “运行 `npm test -- auth`，确认新测试失败。”

## 验证

skill 应说明完成前要验证什么：

- 命令输出。
- 文件是否生成。
- 测试是否 red-green。
- 文档是否更新。
- 是否需要用户确认。

如果无法自动验证，说明人工检查标准。

## 常见错误

- description 太泛，导致过度触发。
- 只写原则，没有步骤。
- 没有停止条件。
- 没有验证。
- 要求代理做它没有工具能力的事。
- 示例和正文矛盾。
- 引用不存在的文件、工具或子 skill。

## 自审 Checklist

发布或提交前检查：

- [ ] `name` 是稳定 kebab-case。
- [ ] `description` 明确触发条件。
- [ ] 步骤按执行顺序排列。
- [ ] 有停止和升级条件。
- [ ] 有验证方式。
- [ ] 示例可运行或明确是伪代码。
- [ ] 不要求违反平台或用户指令。
- [ ] 与现有 skill 没有明显冲突。

## 测试 Skill

最少做三类测试：

1. **正向触发:** 给一个明显适用的用户请求，确认会使用 skill。
2. **负向触发:** 给一个不适用请求，确认不会误用。
3. **流程测试:** 让代理按 skill 走一遍，检查是否卡住或产生歧义。

更多测试方法见 `testing-skills-with-subagents.md`。

## 辅助资料

- `anthropic-best-practices.md`
- `persuasion-principles.md`
- `graphviz-conventions.dot`
- `testing-skills-with-subagents.md`
