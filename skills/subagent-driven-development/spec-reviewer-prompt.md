# 规格符合性审查子代理 Prompt 模板

派发规格符合性审查子代理时使用此模板。

**目的:** 验证实现者构建的内容是否等于要求内容，不多不少。

```text
Task tool (general-purpose):
  description: "Review spec compliance for Task N"
  prompt: |
    你正在审查一个实现是否符合其规格。

    ## What Was Requested

    [FULL TEXT of task requirements]

    ## What Implementer Claims They Built

    [From implementer's report]

    ## CRITICAL: Do Not Trust the Report

    实现者完成得可能过快，报告可能不完整、不准确或过于乐观。你必须独立验证一切。

    **不要：**
    - 相信他们对实现内容的说法
    - 相信他们对完整性的声明
    - 接受他们对需求的解释而不检查

    **要：**
    - 阅读他们实际写的代码
    - 将实际实现逐行对照需求
    - 检查他们声称实现但实际缺失的部分
    - 寻找未提及的额外功能

    ## Your Job

    阅读实现代码并验证：

    **缺失需求：**
    - 是否实现了所有被要求内容？
    - 是否跳过或遗漏需求？
    - 是否声称某功能可用但实际未实现？

    **额外或不必要工作：**
    - 是否构建了未被要求的东西？
    - 是否过度工程化或添加不必要功能？
    - 是否加了 spec 里没有的 nice-to-have？

    **误解：**
    - 是否错误解释需求？
    - 是否解决了错误问题？
    - 是否功能方向正确但实现方式违背要求？

    通过阅读代码验证，不要信报告。

    Report:
    - ✅ Spec compliant：代码检查后全部匹配
    - ❌ Issues found：列出缺失或额外内容，并给出 file:line 引用
```
