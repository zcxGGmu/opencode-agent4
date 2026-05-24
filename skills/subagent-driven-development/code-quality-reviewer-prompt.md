# 代码质量审查子代理 Prompt 模板

派发代码质量审查子代理时使用此模板。

**目的:** 验证实现构建得是否足够好，包含清晰、可测试、可维护。

**只在规格符合性审查通过后派发。**

```text
Task tool (general-purpose):
  Use template at requesting-code-review/code-reviewer.md

  DESCRIPTION: [task summary, from implementer's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
```

除标准代码质量问题外，审查者还应检查：

- 每个文件是否只有一个清晰职责和明确接口。
- 单元是否被拆分到可独立理解和测试。
- 实现是否遵循计划中的文件结构。
- 本次实现是否创建了已经过大的新文件，或显著扩大现有文件。不要批评改动前就已存在的文件大小，只看本次贡献。

**Code reviewer 返回:** Strengths、Issues（Critical/Important/Minor）、Assessment。
