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

## Superpowers 迁移计划

### 已复习上下文

- [x] 复习 `tasks/lessons.md`。本轮需要保留 Agent4 权限合并防护，不能用 Superpowers 接入覆盖安全默认值。
- [x] 对比目标仓库结构：目标已有 `.codex-plugin/plugin.json`、`.opencode/plugins/ysclaw-agent4.js`、`.opencode/agents`、`.opencode/commands` 和 Agent4 内置 `skills`。
- [x] 对比来源结构：`/Users/zq/Desktop/ai-projs/posp/template/superpowers` 包含 OpenCode 插件入口、Codex 元数据、Superpowers skills、assets、docs 和测试。

### 设计判断

不整仓覆盖，不替换 Agent4 插件入口。采用“合并迁移”：

- 将 Superpowers 的 `skills/*` 复制进目标顶层 `skills/`，与现有 Agent4 skills 共存。
- 在现有 `.opencode/plugins/ysclaw-agent4.js` 中增加 Superpowers bootstrap 注入，但保留 Agent4 bootstrap、Agent4 agent/command 注册和权限合并逻辑。
- 使用不同 bootstrap 标记，避免 Agent4 与 Superpowers 重复注入或互相误判。
- 保留 `package.json` 的 Agent4 主入口，不把目标包改名为 `superpowers`。
- 仅迁移运行所需的 Superpowers 文档/assets/test 片段；不复制来源 `.git`、Claude/Cursor/Gemini 插件元数据或与 OpenCode 无关的测试套件。

### 实现范围

- [x] 复制 Superpowers skill 目录到目标 `skills/`。
- [x] 更新 `.opencode/plugins/ysclaw-agent4.js`，新增 `using-superpowers` bootstrap 缓存与 OpenCode 工具映射。
- [x] 更新 `.codex-plugin/plugin.json` 和 `package.json` 描述/关键词，说明 Agent4 包内同时提供 Superpowers 方法论 skills。
- [x] 添加或调整 OpenCode 测试，验证 Superpowers skills 被注册、bootstrap 会注入且不会重复注入。
- [x] 运行 `npm test`、`node --check .opencode/plugins/ysclaw-agent4.js`，并抽查迁移 skill frontmatter。

### 实现前确认

用户已通过“ok”确认开始迁移。

### 迁移复盘

本轮已完成合并迁移：Superpowers 的 14 个 skills 已进入目标 `skills/`，Agent4 的 5 个 skills 保持不变。插件入口仍为 `.opencode/plugins/ysclaw-agent4.js`，它现在会注册同一个 `skills/` 目录，并在首条用户消息中分别注入 `YSCLAW_AGENT4_BOOTSTRAP` 和 `SUPERPOWERS_BOOTSTRAP`。Agent4 的 agent/command 默认配置和权限合并逻辑未被替换。

新增资源和说明：

- `assets/superpowers-app-icon.png`
- `assets/superpowers-small.svg`
- `docs/LICENSE.superpowers`
- `docs/README.superpowers.opencode.md`
- README、OpenCode 安装说明和 Codex 插件元数据已补充 Superpowers 集成说明。

最终验证：

- `npm test` 通过。
- `.opencode/plugins/ysclaw-agent4.js` 和 `tools/ysclaw-agent4-tools.js` 的 `node --check` 通过。
- `tests/opencode/test-bootstrap-caching.mjs`、`tests/opencode/test-plugin-config.mjs`、`tests/schemas/validate-schemas.mjs`、`tests/tools/test-agent4-tools.mjs` 的 `node --check` 通过。
- `package.json` 和 `.codex-plugin/plugin.json` JSON 解析通过。
- 测试确认 Superpowers skills 已存在、skills 路径不会重复注册、Agent4 与 Superpowers 两个 bootstrap 均只读取一次且重复 transform 不会重复注入。

## 项目架构图谱生成计划

### 已复习上下文

- [x] 复习 `tasks/lessons.md`。本轮需要避免用表层文件名拼图，必须从 Agent4 的真实数据契约、安全约束、OpenCode 插件链路和测试验证中抽取结构。
- [x] 读取 `fireworks-tech-graph` 技能说明，确认需要生成 SVG 并导出 PNG，且每张图都要做 XML 与渲染验证。

### 实现前计划

- [x] 并行分析项目高层架构、OpenCode 插件入口、schemas/tools 数据链路、skills/docs/tests 框架。
- [x] 提炼至少 4 组不同类型与风格的图：架构图、数据流图、流程图/状态图、框架/矩阵图。
- [x] 将所有 SVG 与 PNG 输出到 `assets/imgs/`，命名清晰且可追溯。
- [x] 使用 XML 解析和 PNG 导出验证全部 SVG。
- [x] 视觉自查 PNG，修正箭头穿透、文字溢出或图例遮挡问题。
- [x] 在本节末尾记录最终产物与验证结果。

### 图谱产物

- `assets/imgs/agent4-system-architecture.svg` / `.png`：Flat Icon 风格系统架构图，展示 Agent3、Agent4 插件包、Agent1 回归和 Agent5 交接。
- `assets/imgs/opencode-plugin-runtime-flow.svg` / `.png`：Dark Terminal 风格插件运行时流程图，区分 `config` 注册和 `chat.messages.transform` bootstrap 注入。
- `assets/imgs/agent4-contract-data-flow.svg` / `.png`：Blueprint 风格数据契约流图，突出五类对象、ID 链一致性和失败关闭。
- `assets/imgs/agent4-patch-state-machine.svg` / `.png`：OpenAI Clean 风格状态机，展示从蓝图接收到 Agent5 交接的门槛和失败分支。
- `assets/imgs/skills-verification-framework-matrix.svg` / `.png`：Notion Clean 风格框架矩阵，映射插件层、Skill 层、Schema 层、工具层、回归证据层和交接层的验证信号。

### 图谱生成复盘

最终验证：

- 5 个 SVG 使用 `xml.etree.ElementTree` 解析通过。
- 5 个 PNG 使用临时目录安装的 `@resvg/resvg-js` 导出成功，尺寸均为 2x 高分辨率且非空。
- 视觉自查后重排了系统架构图和框架矩阵，修正了右侧交互拥挤和长文本截断。
- `npm test` 通过。
- `npm run check:plugin && npm run check:tools` 通过。

## Agent4 20 秒介绍视频计划

### 已复习上下文

- [x] 复习 `tasks/lessons.md`。本轮不修改 Agent4 运行逻辑，仍需尊重安全默认值、结构约束和证据标识一致性。
- [x] 读取 `hyperframes` skill，确认需要先定义视觉身份，再写 HTML composition，并在完成前运行 lint、validate、inspect 和渲染验证。
- [x] 读取 README、Agent4 文档、插件入口、工具函数、schemas 和现有架构图素材。

### 实现前计划

- [x] 提炼当前项目的介绍叙事：Agent4 位于 Agent3 与 Agent5 之间，把根因蓝图变成经回归证明的补丁包。
- [x] 在 `assets/video` 下创建 HyperFrames composition、`DESIGN.md` 和必要素材引用。
- [x] 制作 20 秒横版视频，覆盖定位、插件层、契约链、安全失败关闭、Superpowers 方法论和交接结果。
- [x] 将最终 MP4 输出到 `assets/video/agent4-intro.mp4`。
- [x] 运行 HyperFrames lint、validate、inspect、snapshot/render，并记录验证结果。

### 实现前确认

本轮用户已直接要求生成视频。计划范围限定在 `assets/video` 和任务记录，不修改 Agent4 插件、schemas、工具或测试。

### 视频产物

- `assets/video/agent4-intro.mp4`：20 秒、1920x1080、30fps 的 Agent4 介绍视频。
- `assets/video/index.html`：HyperFrames composition 源文件。
- `assets/video/DESIGN.md`：视频视觉身份说明。
- `assets/video/snapshots/contact-sheet.jpg`：关键帧检查图。
- `assets/video/.hyperframes/anim-map/animation-map.json`：动画图谱检查结果。

### 视频生成复盘

最终验证：

- `npx hyperframes lint .` 通过，0 error / 0 warning。
- `npx hyperframes validate . --timeout 10000` 通过，0 error；剩余 AudioContext 提示来自无音频页面的浏览器运行时警告，不影响渲染。
- `npx hyperframes inspect . --json --samples 9 --timeout 10000` 通过，0 layout issue。
- `npx hyperframes snapshot . --at 1.4,4.7,8.0,11.4,14.8,18.4 --describe false` 生成关键帧，视觉自查未发现拆字、遮挡或主要文本溢出。
- 动画图谱生成成功，转场门帘 offscreen、图像镜头裁切和最终淡出 overlap 均为预期运动设计。
- `npx hyperframes render . --output agent4-intro.mp4 --fps 30 --quality standard --workers 1` 成功。
- `ffprobe` 确认成片为 H.264、1920x1080、30fps、600 帧、20.000000 秒。
- `npm test` 通过，新增视频资产未影响现有 Agent4 插件、schema 和工具测试。
