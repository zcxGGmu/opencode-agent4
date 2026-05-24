# opencode-agent4

`opencode-agent4` 是源生 Claw 一阶段中的 Agent4 OpenCode 扩展包。它负责把 Agent3 的根因诊断结果转化为可验证的候选补丁，并把补丁、diff 和回归测试证据打包成 `VerifiedPatchPackage` 交给 Agent5。

## 整体定位

Agent4 位于 Agent3 和 Agent5 之间：

```text
Agent3 根因诊断
  RootCauseBlueprint
      |
      v
Agent4 补丁生产与验证
  PatchPlan
  PatchCandidate / git diff
  PatchRegressionResult
  VerifiedPatchPackage
      |
      v
Agent5 PR / commit 材料生成
```

核心职责：

- 读取并校验 Agent3 输出的 `RootCauseBlueprint`。
- 生成只读的 `PatchPlan`，先计划、后改代码。
- 在确认后的 `PatchPlan` 基础上进入 OpenCode Build 流程生成候选补丁。
- 捕获真实 `git diff`，形成 `PatchCandidate`。
- 运行或归一化 Agent1 `patch_regression` 结果。
- 输出 schema 合法、证据完整、可交给 Agent5 的 `VerifiedPatchPackage`。

## 设计原则

- 诊断和修改分离：Agent3 负责根因，Agent4 才负责补丁。
- 计划和构建分离：`/ysclaw-patch-plan` 不写代码，`/ysclaw-build-patch` 才进入构建。
- schema 驱动交付：所有跨 Agent 的对象都通过 JSON schema 约束。
- diff 是补丁事实来源：`PatchCandidate` 必须包含真实 `git diff`。
- 回归证据不可省略：没有 Agent1 回归证据，不应声明补丁已验证。
- 安全默认值优先：Agent4 的 OpenCode agent 默认限制编辑、外部访问和网络能力。
- 失败关闭：非法 blueprint、危险回归命令、id 不一致的证据都会被拒绝。

## 项目结构

```text
.
├── .codex-plugin/plugin.json
├── .opencode/
│   ├── INSTALL.md
│   ├── agents/ysclaw-agent4-patch.md
│   ├── commands/
│   │   ├── ysclaw-build-patch.md
│   │   └── ysclaw-patch-plan.md
│   └── plugins/ysclaw-agent4.js
├── docs/
│   ├── README.opencode.md
│   ├── agent1-patch-regression-integration.md
│   ├── agent4.md
│   └── schemas.md
├── schemas/
├── skills/
├── tests/
├── tools/ysclaw-agent4-tools.js
└── package.json
```

关键组件：

- `.opencode/plugins/ysclaw-agent4.js`：OpenCode 插件入口，注册 skills、注入 bootstrap、补齐 agent 和 command 默认配置。
- `.opencode/agents/ysclaw-agent4-patch.md`：Agent4 的角色说明和 guardrails。
- `.opencode/commands/*.md`：开发者使用的命令入口说明。
- `skills/*/SKILL.md`：可组合的 Agent4 动作技能。
- `schemas/*.schema.json`：Agent3、Agent4、Agent1、Agent5 之间的结构化契约。
- `tools/ysclaw-agent4-tools.js`：本地确定性工具，用于 schema 校验、计划生成、diff 打包和 verified package 生成。
- `tests/`：插件加载、配置合并、bootstrap 缓存、schema 和工具行为测试。

## OpenCode 安装

在全局或项目级 `opencode.json` 中添加本地插件路径：

```json
{
  "plugin": ["/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4"]
}
```

然后重启 OpenCode。

如果将来发布到 git 仓库，可改成 git-backed 安装：

```json
{
  "plugin": ["ysclaw-agent4@git+https://example.com/ysclaw-agent4.git"]
}
```

更多 OpenCode 细节见 [docs/README.opencode.md](/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/docs/README.opencode.md) 和 [.opencode/INSTALL.md](/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/.opencode/INSTALL.md)。

## OpenCode 使用方式

安装后，OpenCode 会发现以下 skills：

- `using-ysclaw-agent4`
- `ysclaw-root-cause-blueprint-reader`
- `ysclaw-patch-plan-writer`
- `ysclaw-regression-verifier`
- `ysclaw-verified-patch-package-writer`

默认 agent id：

```text
ysclaw-agent4-patch
```

### 生成 PatchPlan

使用 `/ysclaw-patch-plan`：

```text
/ysclaw-patch-plan
读取这个 RootCauseBlueprint，校验 schema，并输出 PatchPlan。不要修改代码。
```

该命令的约束：

- 只读。
- 必须校验 `RootCauseBlueprint`。
- 输出必须符合 `schemas/patch-plan.schema.json`。
- 不生成 diff，不修改仓库代码。

### 构建并验证补丁

使用 `/ysclaw-build-patch`：

```text
/ysclaw-build-patch
基于这个已确认的 PatchPlan 生成最小补丁，捕获 git diff，运行 Agent1 patch_regression，并输出 VerifiedPatchPackage。
```

该命令的约束：

- 必须基于确认后的 `PatchPlan`。
- 只修改计划范围内的文件。
- 必须捕获真实 `git diff`。
- 必须运行或导入 Agent1 回归结果。
- 输出必须符合 `schemas/verified-patch-package.schema.json`。

## 本地工具示例

校验 Agent3 blueprint：

```bash
node tools/ysclaw-agent4-tools.js validate root-cause-blueprint tests/fixtures/root-cause-blueprint.valid.json
```

生成 PatchPlan：

```bash
node tools/ysclaw-agent4-tools.js plan tests/fixtures/root-cause-blueprint.valid.json -
```

从 diff 生成 PatchCandidate：

```bash
node tools/ysclaw-agent4-tools.js candidate patch-plan.json patch.diff patch-candidate.json
```

归一化 Agent1 回归结果：

```bash
node tools/ysclaw-agent4-tools.js normalize-regression agent1-result.json patch-regression-result.json
```

生成 VerifiedPatchPackage：

```bash
node tools/ysclaw-agent4-tools.js package blueprint.json patch-plan.json patch-candidate.json patch-regression-result.json verified-package.json
```

## 安全与校验边界

Agent4 对以下情况 fail closed：

- `RootCauseBlueprint` 不符合 schema。
- `PatchPlan`、`PatchCandidate`、`PatchRegressionResult` 任一对象不合法。
- `patchPlan.blueprintId` 与 `blueprint.blueprintId` 不一致。
- `patchCandidate.patchPlanId` 与 `patchPlan.patchPlanId` 不一致。
- `regressionResult.patchCandidateId` 与 `patchCandidate.patchCandidateId` 不一致。
- 回归命令不是 `agent1 patch_regression` 白名单形式。
- 回归命令包含换行、命令串联、重定向、命令替换等 shell 注入风险。
- OpenCode 传入标量权限配置时，不能覆盖 Agent4 的安全默认值。

## 本地验证

运行完整测试：

```bash
npm test
```

测试覆盖：

- 插件元数据和文件结构。
- OpenCode plugin 语法。
- skills 注册和 bootstrap 缓存。
- OpenCode agent / command 配置合并。
- schema 校验。
- 工具函数行为。
- 危险命令、id mismatch、非法嵌套对象等回归场景。

单独做 JS 语法检查：

```bash
node --check .opencode/plugins/ysclaw-agent4.js
node --check tools/ysclaw-agent4-tools.js
```

## 参考文档

- [docs/agent4.md](/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/docs/agent4.md)：Agent4 设计说明。
- [docs/schemas.md](/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/docs/schemas.md)：schema 对象说明。
- [docs/agent1-patch-regression-integration.md](/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/docs/agent1-patch-regression-integration.md)：Agent1 回归测试对接。
- [docs/README.opencode.md](/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/docs/README.opencode.md)：OpenCode 插件使用说明。
