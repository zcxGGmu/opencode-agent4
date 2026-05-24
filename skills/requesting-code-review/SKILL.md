---
name: requesting-code-review
description: 在完成任务、实现重要功能或合并前使用，用于验证工作是否满足要求。
---

# 请求代码审查

派发代码审查子代理，在问题扩大前发现缺陷。审查者应获得精心构造的上下文，而不是你的完整会话历史。这样审查者会聚焦工作产物，而不是你的思考过程，同时保留主会话上下文用于后续工作。

**核心原则:** 早审查，经常审查。

## 何时请求审查

**必须请求：**

- subagent-driven development 中每个任务之后。
- 完成重要功能之后。
- 合并到 main 之前。

**可选但有价值：**

- 卡住时，用新视角检查。
- 重构前，先做基线检查。
- 修复复杂 bug 后。

## 如何请求

**1. 获取 git SHAs：**

```bash
BASE_SHA=$(git rev-parse HEAD~1)  # 或 origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. 派发代码审查子代理：**

使用 Task 工具和 `general-purpose` 类型，并填充 `code-reviewer.md` 模板。

**占位符：**

- `{DESCRIPTION}`：你构建内容的简短总结。
- `{PLAN_OR_REQUIREMENTS}`：它应该满足的计划或需求。
- `{BASE_SHA}`：起始提交。
- `{HEAD_SHA}`：结束提交。

**3. 处理反馈：**

- Critical 问题立即修。
- Important 问题继续前修。
- Minor 问题可记录稍后处理。
- 如果审查者错了，用技术理由反驳。

## 示例

```text
[刚完成 Task 2: Add verification function]

You: 继续前先请求代码审查。

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[派发代码审查子代理]
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types
  PLAN_OR_REQUIREMENTS: Task 2 from docs/superpowers/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[子代理返回]
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [修复 progress indicators]
[继续 Task 3]
```

## 与工作流集成

**Subagent-Driven Development:**

- 每个任务后审查。
- 在问题叠加前发现。
- 修完再进入下一个任务。

**Executing Plans:**

- 每个任务后或自然检查点审查。
- 获取反馈，应用后继续。

**临时开发:**

- 合并前审查。
- 卡住时审查。

## 危险信号

永远不要：

- 因为“很简单”就跳过审查。
- 忽略 Critical 问题。
- 带着未修 Important 问题继续。
- 和有效技术反馈争辩。

如果审查者错了：

- 用技术理由反驳。
- 展示能证明行为正确的代码或测试。
- 请求澄清。

模板见：`requesting-code-review/code-reviewer.md`
