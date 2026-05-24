# opencode-agent4 设计与开发计划

## 已复习上下文

- [x] 复习项目 lessons 文件。结果：当时 `tasks/lessons.md` 尚不存在。
- [x] 提取并校验 `assets/design.pptx` 内容。Agent4 定义集中在第 9-11 页。
- [x] 学习 `/Users/zq/Desktop/ai-projs/posp/template/superpowers` 的 OpenCode 插件结构。
- [x] 派发子代理分别探索参考项目和目标项目。

## 设计摘要

Agent4 是受控的补丁生产与回归验证桥梁：

`RootCauseBlueprint -> PatchPlan -> PatchCandidate/git diff -> Agent1 patch_regression -> VerifiedPatchPackage -> Agent5`

实现遵循当前 Superpowers 的 OpenCode 插件模式：

- package 入口：`package.json` 使用 `type: module`，并将 `main` 指向 `.opencode/plugins/ysclaw-agent4.js`
- 插件 hook：`.opencode/plugins/ysclaw-agent4.js`
- 内置 skills：顶层 `skills/<skill-name>/SKILL.md`，通过 `config.skills.paths` 注册
- bootstrap：将简短的 Agent4 操作契约注入第一条用户消息，并缓存文件读取结果
- Codex 元数据：`.codex-plugin/plugin.json`
- 测试：参考 `template/superpowers/tests/opencode` 的快速命令行/Node.js 测试

## 实现范围

- [x] 创建 OpenCode/Codex 插件包元数据。
- [x] 添加 Agent4 bootstrap 插件，用于注册 skills 并注入 Agent4 指引。
- [x] 添加 Agent4 agent 配置，用于计划优先的补丁生成，并带受限权限。
- [x] 添加四个 Agent4 skills：
  - `ysclaw-root-cause-blueprint-reader`
  - `ysclaw-patch-plan-writer`
  - `ysclaw-regression-verifier`
  - `ysclaw-verified-patch-package-writer`
- [x] 添加所有 Agent4 交接对象的 JSON schemas。
- [x] 添加确定性本地工具，用于结构约束校验、Git 差异捕获、补丁计划生成、回归结果归一化和已验证补丁包写入。
- [x] 添加 OpenCode 命令：
  - `/ysclaw-patch-plan`
  - `/ysclaw-build-patch`
- [x] 添加快速测试，覆盖插件加载、bootstrap 缓存、schema 校验和工具行为。
- [x] 添加回归测试，覆盖插件配置合并、非法上游包产物、标识不匹配、不安全回归命令和非法根因蓝图失败关闭行为。
- [x] 添加安装、Agent4 流程、schemas 和 Agent1 回归集成文档。
- [x] 更新 README，补充使用和验证命令。

## 文件计划

- [x] 创建 `package.json`
- [x] 创建 `.codex-plugin/plugin.json`
- [x] 创建 `.opencode/plugins/ysclaw-agent4.js`
- [x] 创建 `.opencode/INSTALL.md`
- [x] 创建 `.opencode/agents/ysclaw-agent4-patch.md`
- [x] 创建 `.opencode/commands/ysclaw-patch-plan.md`
- [x] 创建 `.opencode/commands/ysclaw-build-patch.md`
- [x] 创建 `skills/using-ysclaw-agent4/SKILL.md`
- [x] 创建 `skills/ysclaw-root-cause-blueprint-reader/SKILL.md`
- [x] 创建 `skills/ysclaw-patch-plan-writer/SKILL.md`
- [x] 创建 `skills/ysclaw-regression-verifier/SKILL.md`
- [x] 创建 `skills/ysclaw-verified-patch-package-writer/SKILL.md`
- [x] 创建 `schemas/root-cause-blueprint.schema.json`
- [x] 创建 `schemas/patch-plan.schema.json`
- [x] 创建 `schemas/patch-candidate.schema.json`
- [x] 创建 `schemas/patch-regression-result.schema.json`
- [x] 创建 `schemas/verified-patch-package.schema.json`
- [x] 创建 `tools/ysclaw-agent4-tools.js`
- [x] 创建 `docs/README.opencode.md`
- [x] 创建 `docs/agent4.md`
- [x] 创建 `docs/schemas.md`
- [x] 创建 `docs/agent1-patch-regression-integration.md`
- [x] 创建 `tests/opencode/run-tests.sh`
- [x] 创建 `tests/opencode/setup.sh`
- [x] 创建 `tests/opencode/test-plugin-loading.sh`
- [x] 创建 `tests/opencode/test-plugin-config.mjs`
- [x] 创建 `tests/opencode/test-bootstrap-caching.mjs`
- [x] 创建 `tests/opencode/test-bootstrap-caching.sh`
- [x] 创建 `tests/schemas/validate-schemas.mjs`
- [x] 创建 `tests/tools/test-agent4-tools.mjs`
- [x] 创建 `tests/fixtures/root-cause-blueprint.valid.json`
- [x] 创建 `tests/fixtures/patch-regression-result.pass.json`

## TDD 与验证计划

- [x] RED：先写插件加载和 bootstrap 缓存测试。
- [x] GREEN：实现最小插件注册和 bootstrap 注入。
- [x] RED：先写 schema fixture 校验测试。
- [x] GREEN：实现 schemas 和校验工具。
- [x] RED：先写补丁计划与已验证补丁包生成的工具行为测试。
- [x] GREEN：实现确定性工具函数。
- [x] 修复审查阻塞项：将插件安全默认值合并到已有 `.opencode` agent/command 配置中。
- [x] 修复审查阻塞项：写入 `VerifiedPatchPackage` 前校验上游产物和标识一致性。
- [x] 修复审查阻塞项：规划前拒绝不安全/自由形式回归命令和非法 blueprint。
- [x] 使用 `bash tests/opencode/run-tests.sh` 验证。
- [x] 使用 `node --check .opencode/plugins/ysclaw-agent4.js` 验证 JavaScript 语法。
- [x] 使用 `node -e "import('./.opencode/plugins/ysclaw-agent4.js').then(...)"` 验证 package 入口。
- [x] 重新对照 `assets/design.pptx` 摘要，确认覆盖 Agent4 页面的要求。

## 实现前确认

用户已通过“ok，继续吧”确认继续实现。

## 复盘

实现已完成。代码审查发现过安全和 schema 阻塞问题，已添加回归覆盖并修复。

最终验证：

- `npm test` 通过。
- 插件、工具模块和所有 `.mjs` 测试的 `node --check` 通过。
- package 元数据、fixtures 和 schemas 的 JSON 解析通过。
- 标量权限配置、换行命令注入、回归证据标识不匹配、非法嵌入补丁包产物等安全探针通过。

## 中文化任务

- [x] 将 README 改为中文主文档。
- [x] 将插件元数据、OpenCode 智能体/命令、文档、技能、测试夹具、结构约束标题、工具输出和测试提示中文化。
- [x] 保留机器契约：文件名、命令名、schema 字段名、枚举值、代码标识符和测试变量名不翻译。
- [x] 二次扫描用户可见英文描述，补齐标题、安装说明、技能说明、工具帮助、测试输出和示例 JSON 的中文化。
- [x] 运行 `npm test`、插件/工具 `node --check`、所有 `.mjs` 测试语法检查验证中文化改动。

## 中文化复盘

本轮中文化已完成。剩余英文主要是 OpenCode、Agent4、RootCauseBlueprint、PatchPlan、字段名、命令名、枚举值、文件名和代码标识符，属于兼容性契约或专有名词，不应翻译。

最终验证：

- `npm test` 通过。
- `.opencode/plugins/ysclaw-agent4.js` 和 `tools/ysclaw-agent4-tools.js` 的 `node --check` 通过。
- `tests/opencode/test-bootstrap-caching.mjs`、`tests/opencode/test-plugin-config.mjs`、`tests/schemas/validate-schemas.mjs`、`tests/tools/test-agent4-tools.mjs` 的 `node --check` 通过。
- 剩余英文关键词扫描未发现需要继续翻译的用户可见描述。
