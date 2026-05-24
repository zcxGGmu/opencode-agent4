---
name: writing-plans
description: 当已有规格或需求，且任务需要多步完成时，在动代码之前使用。
---

# 写实施计划

## 概览

写一份完整实施计划，假设执行者几乎不了解本代码库和问题域，且测试设计品味不稳定。计划要告诉执行者每个任务碰哪些文件、写什么代码、看哪些文档、如何测试。把计划拆成小步骤。坚持 DRY、YAGNI、TDD 和频繁提交。

执行者可以是熟练开发者，但不要假设他了解本项目工具链或领域。

**开始时声明:** “我正在使用 writing-plans skill 来创建实施计划。”

**上下文:** 如果执行发生在隔离 worktree，应由 `superpowers:using-git-worktrees` 在执行时创建或验证。

**默认保存位置:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

如果用户指定计划位置，按用户要求。

## 范围检查

如果 spec 覆盖多个独立子系统，本应在 brainstorming 阶段拆成多个子项目 spec。如果没有，应建议拆成多个计划，每个计划独立产出可运行、可测试的软件。

## 文件结构

定义任务前，先列出将创建或修改哪些文件，以及每个文件负责什么。这一步锁定拆分决策。

- 设计边界清楚、接口明确的单元。每个文件应有一个清晰职责。
- 你最擅长处理能放进上下文的代码，聚焦文件比巨型文件更可靠。
- 会一起变更的文件应靠近存放。按职责拆分，而不是机械按技术层拆分。
- 在现有代码库中遵循既有模式。如果代码库已有大文件，不要擅自全面重构；但如果本次要改的文件已经失控，把拆分纳入计划是合理的。

文件结构决定任务拆分。每个任务都应是自包含、可独立理解的变更。

## 任务粒度

**每个步骤是一个动作，约 2-5 分钟：**

- “写失败测试”是一步。
- “运行它确认失败”是一步。
- “实现最小代码让测试通过”是一步。
- “运行测试确认通过”是一步。
- “提交”是一步。

## 计划文档头

**每份计划必须以此格式开头：**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [一句话描述要构建什么]

**Architecture:** [2-3 句说明方案]

**Tech Stack:** [关键技术和库]

---
```

保留英文头部中的 `For agentic workers` 和 skill id，方便工具链与代理识别。

## 任务结构

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## 禁止占位符

每一步都必须包含执行者需要的真实内容。以下都是计划失败：

- “TBD”、“TODO”、“later”、“fill in details”。
- “添加适当错误处理”、“添加校验”、“处理边界情况”但不写具体做法。
- “为上述内容写测试”但没有实际测试代码。
- “类似 Task N”，必须重复代码，因为执行者可能乱序读取任务。
- 只描述做什么，不展示怎么做；代码步骤必须有代码块。
- 引用任何前面任务未定义的类型、函数或方法。

## 记住

- 始终写精确文件路径。
- 每个代码步骤都给完整代码。
- 命令要精确，并写预期输出。
- 坚持 DRY、YAGNI、TDD 和频繁提交。

## 自审

写完整计划后，重新对照 spec 检查。这是你自己执行的 checklist，不是子代理派发。

1. **规格覆盖:** 浏览 spec 每个章节和要求。能否指向实现它的任务？列出并补齐缺口。
2. **占位符扫描:** 搜索“禁止占位符”中的危险模式，发现就修。
3. **类型一致性:** 后续任务使用的类型、方法签名、属性名是否与前面定义一致。例如 Task 3 用 `clearLayers()`，Task 7 用 `clearFullLayers()`，就是 bug。

发现问题就内联修复。不需要再审一轮。如果 spec 有要求没有任务，就补任务。

## 执行交接

保存计划后，给出执行选择：

**“计划已完成并保存到 `docs/superpowers/plans/<filename>.md`。有两个执行选项：**

**1. Subagent-Driven（推荐）**：每个任务派发一个 fresh subagent，任务之间做审查，迭代更快。

**2. Inline Execution**：在当前会话使用 `executing-plans` 按检查点批量执行。

**你希望哪种方式？”**

**如果选择 Subagent-Driven：**

- **必需子 skill:** 使用 `superpowers:subagent-driven-development`。
- 每个任务 fresh subagent，加两阶段审查。

**如果选择 Inline Execution：**

- **必需子 skill:** 使用 `superpowers:executing-plans`。
- 按检查点批量执行。
