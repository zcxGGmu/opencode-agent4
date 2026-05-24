# /ysclaw-build-patch

根据已确认的 `PatchPlan` 构建候选补丁，运行或导入 Agent1 回归证据，并生成 `VerifiedPatchPackage`。

## 契约

- 先确认 `PatchPlan`。
- 只为计划中的根因修复修改代码。
- 捕获 Git 差异（`git diff` 输出），写入 `PatchCandidate`。
- 运行或导入 Agent1 `patch_regression`。
- 将回归输出归一化为 `PatchRegressionResult`。
- 输出匹配 `schemas/verified-patch-package.schema.json` 的 JSON。

## 推荐提示词

```text
使用这个已确认的 PatchPlan 构建最小补丁，捕获差异，运行 Agent1 patch_regression，并为 Agent5 生成 VerifiedPatchPackage。
```
