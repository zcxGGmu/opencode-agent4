# Agent1 回归测试对接

Agent4 在交接给 Agent5 前，需要 Agent1 回归证据。

## 预期命令

首选命令来自 `patchPlan.validationPlan.commands`。
Agent4 只接受以 `agent1 patch_regression` 开头、后接简单参数令牌的命令。

示例：

```bash
agent1 patch_regression --case matmul-1024
```

## 预期结果形状

Agent4 接受可归一化为以下结构的 Agent1 原始结果：

```json
{
  "schemaVersion": "ysclaw.patch_regression_result.v1",
  "regressionId": "reg-example",
  "patchCandidateId": "pc-example",
  "status": "pass",
  "command": "agent1 patch_regression --case matmul-1024",
  "tests": [
    {
      "name": "matmul-1024",
      "status": "pass",
      "durationMs": 1240,
      "output": "运行时间改善 12%"
    }
  ],
  "artifacts": ["reports/matmul-1024.json"],
  "summary": "回归通过，目标测试用例已改善。"
}
```

## 归一化

```bash
node tools/ysclaw-agent4-tools.js normalize-regression agent1-result.json patch-regression-result.json
```

包含命令行元字符的命令会在打包前被拒绝，例如 `;`、`&&`、`|`、`>`、`$()` 或反引号。

## 验证语义

- `status: pass` 会产生 `verification.status: verified`。
- `status: fail` 或 `status: error` 会产生 `verification.status: failed`。
- 失败的补丁包仍可能对调试有用，但 Agent5 不应把它作为已验证修复提交。
