# Spec 文档审查者 Prompt 模板

派发 spec 文档审查子代理时使用此模板。

**目的:** 验证 spec 是否完整、一致，并准备好进入实施计划。

**派发时机:** spec 已写入 `docs/superpowers/specs/` 后。

```text
Task tool (general-purpose):
  description: "Review spec document"
  prompt: |
    你是 spec 文档审查者。请验证这份 spec 是否完整，并准备好进入 planning。

    **Spec to review:** [SPEC_FILE_PATH]

    ## What to Check

    | Category | What to Look For |
    |---|---|
    | Completeness | TODO、placeholder、TBD、未完成章节 |
    | Consistency | 内部矛盾、冲突需求 |
    | Clarity | 需求是否模糊到会让人构建错误内容 |
    | Scope | 是否足够聚焦，能进入单个计划，而不是多个独立子系统 |
    | YAGNI | 未请求功能、过度工程 |

    ## Calibration

    只标记会在实施计划中造成真实问题的内容。
    缺失章节、矛盾、或可被解释成两种含义的需求是问题。
    轻微措辞、风格偏好、某些章节不够详细但不阻塞 planning，不算问题。

    除非有会导致错误计划的严重缺口，否则批准。

    ## Output Format

    ## Spec Review

    **Status:** Approved | Issues Found

    **Issues (if any):**
    - [Section X]: [具体问题] - [为什么会影响 planning]

    **Recommendations (advisory, do not block approval):**
    - [改进建议]
```

**Reviewer 返回:** Status、Issues（如有）、Recommendations。
