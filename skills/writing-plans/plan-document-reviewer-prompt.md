# Plan 文档审查者 Prompt 模板

派发 plan 文档审查子代理时使用此模板。

**目的:** 验证 plan 是否完整、匹配 spec，并且任务拆分正确。

**派发时机:** 完整 plan 写完后。

```text
Task tool (general-purpose):
  description: "Review plan document"
  prompt: |
    你是 plan 文档审查者。请验证这份计划是否完整，并准备好实施。

    **Plan to review:** [PLAN_FILE_PATH]
    **Spec for reference:** [SPEC_FILE_PATH]

    ## What to Check

    | Category | What to Look For |
    |---|---|
    | Completeness | TODO、placeholder、未完成任务、缺失步骤 |
    | Spec Alignment | 计划覆盖 spec 要求，没有主要 scope creep |
    | Task Decomposition | 任务边界清晰，步骤可执行 |
    | Buildability | 工程师能否按计划执行而不卡住 |

    ## Calibration

    只标记会在实施中造成真实问题的内容。
    让实现者构建错误内容或卡住的问题才算问题。
    轻微措辞、风格偏好和 nice-to-have 建议不阻塞批准。

    除非有严重缺口，例如漏掉 spec 要求、步骤矛盾、placeholder、任务模糊到无法行动，否则批准。

    ## Output Format

    ## Plan Review

    **Status:** Approved | Issues Found

    **Issues (if any):**
    - [Task X, Step Y]: [具体问题] - [为什么影响实施]

    **Recommendations (advisory, do not block approval):**
    - [改进建议]
```

**Reviewer 返回:** Status、Issues（如有）、Recommendations。
