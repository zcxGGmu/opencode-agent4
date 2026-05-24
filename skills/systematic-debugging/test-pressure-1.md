# 压力测试 1：不要猜

当你看到失败时，先写下：

```text
Symptom:
Reproduction:
Expected:
Actual:
Hypothesis:
Evidence needed:
```

只有在获得证据后才能修改代码。

## 失败条件

- 没有复现就修改。
- 一次改多个无关点。
- 失败后只说“应该好了”。

## 通过条件

- 能稳定复现。
- 有可验证假设。
- 修复直接对应根因。
- 原始复现通过。
