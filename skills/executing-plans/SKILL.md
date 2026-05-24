---
name: executing-plans
description: 当已有书面实施计划，并需要在当前会话按检查点执行时使用。
---

# 执行计划

## 概览

加载计划，先批判性审查，再逐项执行；全部完成并验证后再汇报。

**开始时声明:** “我正在使用 executing-plans skill 来执行这个计划。”

**注意:** 告诉用户 Superpowers 在有子代理能力的平台上效果更好。如果平台支持子代理，应优先使用 `superpowers:subagent-driven-development`，而不是本 skill。

## 流程

### 步骤 1：加载并审查计划

1. 读取计划文件。
2. 批判性审查，找出问题、缺口或不清楚的地方。
3. 如果有疑虑，先向用户提出，得到处理后再开始。
4. 如果没有疑虑，创建 TodoWrite 并继续。

### 步骤 2：执行任务

对每个任务：

1. 标记为 `in_progress`。
2. 严格按计划中的细粒度步骤执行。
3. 按计划要求运行验证。
4. 标记为 `completed`。

### 步骤 3：完成开发

所有任务完成并验证后：

- 声明：“我正在使用 finishing-a-development-branch skill 来完成这项工作。”
- **必需子 skill:** 使用 `superpowers:finishing-a-development-branch`。
- 按该 skill 验证测试、展示选项并执行用户选择。

## 何时停止并求助

遇到以下情况立即停止：

- 遇到阻塞，例如缺少依赖、测试失败、指令不清楚。
- 计划有关键缺口，无法安全开始。
- 不理解某条指令。
- 验证反复失败。

宁可澄清，也不要猜。

## 何时回到前一步

回到审查阶段的情况：

- 用户根据你的反馈更新了计划。
- 根本方案需要重新思考。

不要硬推阻塞项。停止并询问。

## 记住

- 先批判性审查计划。
- 严格遵循计划步骤。
- 不跳过验证。
- 计划要求使用 skill 时就使用。
- 被阻塞时停止，不猜。
- 没有用户明确同意，不要在 `main` 或 `master` 分支直接开始实现。

## 集成关系

相关工作流 skills：

- `superpowers:using-git-worktrees`：确保使用隔离工作区，创建或验证 worktree。
- `superpowers:writing-plans`：创建本 skill 要执行的计划。
- `superpowers:finishing-a-development-branch`：任务全部完成后的收尾流程。
