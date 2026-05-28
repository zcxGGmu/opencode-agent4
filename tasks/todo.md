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

## 细粒度提交迁移计划

### 已复习上下文

- [x] 复习 `tasks/lessons.md`。本轮需要保留安全默认值、证据标识一致性和验证优先原则。
- [x] 检查当前 Git 状态。当前 `main` 跟踪 `origin/main`，额外存在未跟踪文件：`.DS_Store`、`assets/.DS_Store`、`assets/design.pptx`。
- [x] 并行分析提交拆分边界和验证命令。

### 目标

将当前完整项目重新组织成一条新的细粒度 Git 历史，推送到另一个空仓库。新历史不继承当前 `main` 的既有提交，使用孤儿分支从当前文件内容重建提交序列。

### 待确认事项

- [ ] 用户提供目标空仓库 remote URL。
- [ ] 确认新分支名，默认使用 `codex/split-history`。
- [ ] 确认新仓库默认分支名，默认推送为 `main`。
- [ ] 确认是否包含 `assets/design.pptx`。默认不包含，因为它当前未跟踪且像源设计材料。
- [ ] 确认是否把 `tasks/` 纳入新仓库。默认不包含，因为它是过程记录；如需保留项目记忆，可单独追加一个 `chore: add project task notes` 提交。

- [ ] 确认排除 `.DS_Store` 和 `assets/.DS_Store`。

### 提交拆分计划

- [ ] `chore: initialize package metadata`
  - `.codex-plugin/plugin.json`
  - `package.json`
- [ ] `feat: define Agent4 handoff schemas`
  - `schemas/*.schema.json`
- [ ] `feat: add deterministic Agent4 packaging tools`
  - `tools/ysclaw-agent4-tools.js`
- [ ] `test: cover schemas and Agent4 tool behavior`
  - `tests/fixtures/*.json`
  - `tests/schemas/validate-schemas.mjs`
  - `tests/tools/test-agent4-tools.mjs`
- [ ] `feat: add Agent4 OpenCode skills`
  - `skills/using-ysclaw-agent4/`
  - `skills/ysclaw-*/`
- [ ] `feat: add OpenCode agent and slash command docs`
  - `.opencode/INSTALL.md`
  - `.opencode/agents/`
  - `.opencode/commands/`
- [ ] `feat: implement OpenCode plugin runtime`
  - `.opencode/plugins/ysclaw-agent4.js`
- [ ] `test: cover OpenCode plugin loading and config`
  - `tests/opencode/`
- [ ] `feat: vendor Superpowers skills for OpenCode`
  - 非 `ysclaw` 的 `skills/*`
  - `docs/LICENSE.superpowers`
- [ ] `docs: document Agent4 architecture and schema contracts`
  - `README.md`
  - `docs/README.opencode.md`
  - `docs/README.superpowers.opencode.md`
  - `docs/agent4.md`
  - `docs/schemas.md`
  - `docs/agent1-patch-regression-integration.md`
- [ ] `docs: add architecture diagrams`
  - `assets/imgs/`
  - `assets/superpowers-app-icon.png`
  - `assets/superpowers-small.svg`
- [ ] `docs: add Agent4 intro video assets`
  - `assets/video/`

### 执行步骤

- [ ] 创建保护标签或保护分支，确保当前完整状态可回退。
- [ ] 创建孤儿分支 `codex/split-history`。
- [ ] 清空暂存区但保留工作区文件。
- [ ] 按提交拆分计划逐组 `git add` 并提交。
- [ ] 每个行为型提交后运行必要验证；最终运行完整验证。
- [ ] 添加目标空仓库 remote。
- [ ] 将 `codex/split-history` 推送到目标仓库的 `main`。

### 验证计划

- 每个涉及运行逻辑、schema、工具或测试的提交后运行：

```bash
npm test
```

- 插件运行时提交后额外运行：

```bash
npm run check:plugin
```

- 工具提交后额外运行：

```bash
npm run check:tools
```

- 最终推送前运行：

```bash
npm test
npm run check:plugin
npm run check:tools
git status --short
```

### 当前 check-in

截至本计划写入时，仅完成只读分析和计划记录，尚未创建分支、改写历史、创建提交或推送远端。等待用户确认后再执行。

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

## Superpowers 中文化计划

### 已复习上下文

- [x] 复习 `tasks/lessons.md`。本轮不修改命令白名单、安全权限、schema 标识一致性或补丁包验证逻辑。
- [x] 确认当前工作区只剩未跟踪的 `.DS_Store` 和 `assets/design.pptx`，本轮不会纳入中文化改动。
- [x] 确认 Superpowers 迁入内容集中在 `skills/`、`docs/README.superpowers.opencode.md` 和少量 assets/license。

### 中文化边界

- [x] 翻译 Superpowers skill 的 `description` 和正文说明。
- [x] 翻译迁入的 prompt、reference、反模式、测试说明和 OpenCode 文档。
- [x] 保留机器契约不翻译：目录名、`name:`、代码标识符、命令名、hook 名、工具名、脚本内容、JSON 字段名、OpenCode/Agent4/Superpowers 等专有名词。
- [x] 不修改 Agent4 既有 schema、tools、命令权限和安全默认值。
- [x] 扫描残余英文，确认剩余内容是代码、文件名、示例命令、专有名词或必要引文。
- [x] 运行 `npm test`、插件/工具 `node --check`、相关 `.mjs` 语法检查。

### 实现前确认

用户已确认“按照建议进行中文化”。

### 中文化复盘

本轮已将迁入的 Superpowers 可见文档中文化：

- 14 个 Superpowers `SKILL.md` 的 `description` 与正文已改为中文。
- `brainstorming` 视觉伴侣文档、spec/plan/code review/subagent prompt 模板已中文化。
- `using-superpowers/references` 中 Codex、Copilot CLI、Gemini CLI 工具映射已中文化。
- `systematic-debugging`、`test-driven-development`、`writing-skills` 的辅助说明和反模式文档已中文化。
- `docs/README.superpowers.opencode.md` 和浏览器 companion 的用户可见提示已中文化。

保留英文范围：

- 目录名、文件名、`name:`、工具名、hook 名、代码标识符、命令、JSON 字段名。
- OpenCode、Codex、Superpowers、Agent4、TDD、PR、git、worktree 等专有名词或契约词。
- prompt 模板中的机器输出标签，例如 `DONE`、`BLOCKED`、`BASE_SHA`、`HEAD_SHA`。

最终验证：

- `npm test` 通过。
- `.opencode/plugins/ysclaw-agent4.js`、`tools/ysclaw-agent4-tools.js`、所有项目 `.mjs` 测试、`skills/brainstorming/scripts/helper.js`、`skills/brainstorming/scripts/server.cjs`、`skills/writing-skills/render-graphs.js` 的 `node --check` 通过。
- Superpowers `SKILL.md` 的 `description` 扫描通过，剩余英文均为保留契约词。

## Comet 移植开发计划

### 已复习上下文

- [x] 复习 `tasks/lessons.md`。本轮必须保留 Agent4 的命令白名单、权限合并、上游产物校验和跨对象 ID 一致性防护。
- [x] 创建开发分支：`codex/port-comet-workflow`。
- [x] 检查当前工作树。已有未提交的 `tasks/todo.md` 修改，以及未跟踪 `.DS_Store`、`assets/.DS_Store`、`assets/design.pptx`；本轮不回滚这些既有状态。
- [x] 初步阅读 `/tmp/rpamis-comet` 的 README、skills、状态脚本、guard 脚本、handoff 脚本、CLI 命令和测试。
- [x] 派发子代理分别分析 Comet 迁移清单和当前 Agent4 集成点；如果结果晚于计划写入，后续实现前补充吸收。
- [x] 吸收子代理反馈：
  - 不改 `package.json` 的主入口，不分叉 `schemas/` 或 `tools/`。
  - 不让 Comet 覆盖 Agent4 的权限、安全默认值和结构化补丁契约。
  - 第一阶段以 OpenCode skills/workflow 接入为主，CLI/status/doctor/manifest/archive 作为后续增强或局部借鉴。

### 迁移目标

将 Comet 的 OpenSpec + Superpowers 完整研发生命周期移植为当前 Agent4 项目的 OpenCode 工作流层：

`/comet -> /comet-open -> /comet-design -> /comet-build -> /comet-verify -> /comet-archive`

该工作流用于开发 Agent4 项目自身的非琐碎变更；Agent4 原有运行时交接链路仍保持：

`RootCauseBlueprint -> PatchPlan -> PatchCandidate -> PatchRegressionResult -> VerifiedPatchPackage`

两者边界：

- Comet 管理“开发 Agent4 的研发流程”：需求、设计、计划、构建、验证、归档。
- Agent4 工具管理“Agent4 交给 Agent5 的结构化补丁产物”：schema 校验、diff、回归证据和 VerifiedPatchPackage。
- 不让 Comet 覆盖 Agent4 现有安全默认值、schema 契约或 OpenCode agent/command 配置。

### 第一阶段实现范围

- [x] 复制 Comet 中文 skills 到当前 `skills/`：
  - `comet`
  - `comet-open`
  - `comet-design`
  - `comet-build`
  - `comet-verify`
  - `comet-archive`
  - `comet-hotfix`
  - `comet-tweak`
- [x] 复制 Comet 确定性脚本到 `skills/comet/scripts/`：
  - `comet-state.sh`
  - `comet-guard.sh`
  - `comet-handoff.sh`
  - `comet-archive.sh`
  - `comet-yaml-validate.sh`
- [x] 复制 `skills/comet/reference/dirty-worktree.md`，保留脏工作树恢复协议。
- [x] 在 `.opencode/plugins/ysclaw-agent4.js` 中新增 Comet bootstrap 注入：
  - 使用独立标记 `COMET_BOOTSTRAP`
  - 与 `YSCLAW_AGENT4_BOOTSTRAP`、`SUPERPOWERS_BOOTSTRAP` 并存
  - 保持文件读取缓存，避免重复注入
- [x] 在插件默认命令中注册 Comet 命令：
  - `comet`
  - `comet-open`
  - `comet-design`
  - `comet-build`
  - `comet-verify`
  - `comet-archive`
  - `comet-hotfix`
  - `comet-tweak`
- [x] 增加 Comet/OpenSpec 依赖说明文档：
  - `docs/README.comet.opencode.md`
  - `docs/LICENSE.comet`
  - README 和 `.opencode/INSTALL.md` 中补充使用入口与外部依赖
- [x] 补充测试：
  - Comet skills 和脚本存在性检查
  - Comet bootstrap 注入、缓存和去重测试
  - 插件默认命令合并测试，确认不会覆盖用户自定义命令
  - `bash -n` 检查 Comet shell 脚本语法
  - 最小状态机 smoke：临时目录中初始化 change、读取字段、guard 阻断缺失条件

### 暂不纳入第一阶段

- [ ] 不移植 Comet 的 npm CLI `src/commands/init/status/doctor/update` 整套 TypeScript 包装；当前项目不是多平台安装器，先以 OpenCode 插件能力交付。
- [ ] 不自动安装 OpenSpec CLI 或 OpenSpec skills；第一阶段只记录依赖和 doctor 风险，避免网络安装副作用。
- [ ] 不重命名当前 package，不改变 `.opencode/plugins/ysclaw-agent4.js` 作为主入口。
- [ ] 不改写 Agent4 schemas、`tools/ysclaw-agent4-tools.js` 的核心语义和安全失败关闭规则。
- [ ] 不把 Comet 的状态机改造成 Agent4 运行时产物链。Agent4 运行时仍使用既有 JSON schema 和 `ysclaw-agent4-tools.js`。
- [ ] 不新增独立 `.comet/` 宿主入口，除非后续确认 Comet 平台本身需要单独适配；当前目标是把 Comet workflow 安装进现有 OpenCode 插件。

### 后续增强候选

- [ ] Agent4 语义的 `status` / `doctor` 命令：检查 plugin、skills、schemas、tools、Agent1 回归命令、安全权限和当前补丁证据。
- [ ] 资产 manifest：统一列出 skills、schemas、commands、tools 和文档，由测试读取校验完整性。
- [ ] Agent4 -> Agent5 确定性交接 sidecar：为 blueprint、plan、diff、regression result 生成 hash 索引，防止证据漂移。
- [ ] VerifiedPatchPackage 归档目录：`artifacts/agent4/archive/YYYY-MM-DD-<id>/`。

### 关键风险与约束

- [ ] Comet 的 `/comet-open` 依赖 OpenSpec skills，例如 `openspec-explore`、`openspec-new-change`、`openspec-propose`；文档和 bootstrap 必须明确这些是外部前置能力。
- [ ] 当前仓库已经迁入 Superpowers；Comet skill 文本中的 `superpowers:*` 引用需要和当前 `skills/` 实际名称匹配。
- [ ] Comet shell 脚本会读写 `openspec/changes/<change>/.comet.yaml`，测试必须在临时目录运行，不能污染当前仓库。
- [ ] 新增 bootstrap 不能导致首条用户消息过大到影响 Agent4 使用；必要时只注入 Comet 决策核心和入口说明。
- [ ] 默认命令合并必须沿用现有 `mergeCommandConfig`，不能覆盖用户已有 `agent` 配置。

### 验证计划

- [x] `npm test`
- [x] `npm run check:plugin`
- [x] `npm run check:tools`
- [x] 所有新增 `.mjs` 测试文件执行 `node --check`
- [x] 所有新增 Comet shell 脚本执行 `bash -n`
- [x] 人工复核新增文档，确认 OpenSpec 外部依赖、Superpowers 关系和 Agent4 边界说明清晰
- [x] `git status --short`，确认没有纳入 `.DS_Store` 等无关文件

### 实现前确认

本计划已写入，当前只完成分支创建、只读分析、子代理探索派发和计划记录。等待用户确认后再开始复制 Comet 资产、修改插件入口和添加测试。

### 迁移复盘

本轮已完成第一阶段 Comet 移植：

- Comet 中文 skills 已复制到 `skills/comet` 和 `skills/comet-*`。
- Comet 确定性脚本已复制到 `skills/comet/scripts/`，并保留 `skills/comet/reference/dirty-worktree.md`。
- `.opencode/plugins/ysclaw-agent4.js` 已新增 `COMET_BOOTSTRAP` 注入、缓存和去重逻辑。
- 插件默认注册 `/comet`、`/comet-open`、`/comet-design`、`/comet-build`、`/comet-verify`、`/comet-archive`、`/comet-hotfix`、`/comet-tweak`，并保持现有用户命令配置不被覆盖。
- README、`.opencode/INSTALL.md`、`.codex-plugin/plugin.json`、`package.json` 和 `docs/README.comet.opencode.md` 已补充 Comet/OpenSpec 依赖和边界说明。
- 新增 `tests/comet/test-comet-assets.mjs` 与 `tests/comet/run-tests.sh`，覆盖 Comet assets、shell 语法和最小状态机 smoke。

最终验证：

- `npm test` 通过。
- `npm run test:comet` 通过。
- `npm run check:plugin` 通过。
- `npm run check:tools` 通过。
- `npm run check:comet` 通过。

## `/ysclaw-agent4` 找不到 comet skill 排障与修复计划

### 当前判断

- [x] 复习 `tasks/lessons.md`，确认 `/comet` 是 Agent4 核心生命周期编排入口。
- [x] 检查当前 OpenCode 全局配置。结果：本机 `opencode.json` 未启用 `ysclaw-agent4` 插件条目，只有既有其他插件；该状态下 OpenCode 不会注册本包 `skills/`。
- [x] 检查仓库内容。结果：`skills/comet/SKILL.md` 存在，插件配置 hook 也会注册 `skills/`，因此“没有 comet skill”不是缺少文件，而是安装/启用路径或运行时注册未生效。

### 最小改动范围

- [x] 在插件 `command.execute.before` hook 中为 `/ysclaw-agent4`、`/comet*` 注入 Comet 命令启动上下文，降低对 native skill registry 的单点依赖。
- [x] 更新静态 `.opencode/commands/ysclaw-agent4.md`，写明 native skill 缺失时的诊断和 fallback 行为。
- [x] 更新安装/排障文档，明确需要真正启用插件并重启 OpenCode，不能只复制命令 markdown。
- [x] 增加测试覆盖命令执行前注入、静态命令排障文案和安装文档。
- [x] 更新 `tasks/lessons.md`，记录 OpenCode 命令 markdown 与插件 skills 注册不是同一件事。
- [x] 运行相关验证并记录结果。

### 验证结果

- `node --check .opencode/plugins/ysclaw-agent4.js` 通过。
- `node tests/opencode/test-plugin-config.mjs` 通过。
- `bash tests/opencode/test-bootstrap-caching.sh` 通过。
- `bash tests/opencode/test-plugin-loading.sh` 通过。
- `npm test` 通过。
- `npm run test:comet` 通过。
- `npm run check:plugin` 通过。
- `npm run check:tools && npm run check:comet` 通过。
- 真实 OpenCode server smoke 通过：临时 `opencode.json` 启用本仓库插件后，`GET /skill` 能列出 `comet`、`comet-build`、`openspec-new-change` 和 `using-ysclaw-agent4`。

### 复盘

本轮确认 `skills/comet/SKILL.md` 本身存在，问题不是仓库缺文件。当前机器的全局 OpenCode 配置没有启用本包插件条目，因此该配置下 OpenCode 不会注册本包 `skills/`。修复上同时补了运行时兜底：`/ysclaw-agent4` 和 `/comet*` 命令执行前会注入 Comet 决策核心，避免 native skill registry 暂时缺失时直接停在“没有 comet skill”。

## `/ysclaw-agent4` 主入口计划

### 已复习上下文

- [x] 复习 `tasks/lessons.md`。本轮需保持 `/comet` 与 `/ysclaw-*` 的层级关系：Comet 是生命周期编排，`/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 是 Agent4 结构化产物能力。
- [x] 检查 OpenCode 插件入口、命令注册测试、安装文档和主 README。

### 实现范围

- [x] 在插件默认配置中注册 `/ysclaw-agent4`，作为推荐 Agent4 主入口，并委托现有 `comet` skill。
- [x] 保留 `/comet` 兼容入口和 `/ysclaw-patch-plan`、`/ysclaw-build-patch` 产物节点，不改变补丁链路语义。
- [x] 更新 README、OpenCode 文档、安装说明、agent 描述和 bootstrap 文案。
- [x] 补充插件配置/加载/bootstrap 测试，验证 `/ysclaw-agent4` 已注册且描述正确。
- [x] 运行 `npm test` 和语法检查。

### 本轮复盘

`/ysclaw-agent4` 已成为推荐主入口。它的命令模板委托 `comet` skill 执行完整 Agent4 生命周期；`/comet` 保留为兼容入口；`/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 仍是结构化产物能力节点，不承担主流程闭环。

最终验证：

- `npm test` 通过。
- `npm run check:plugin` 通过。
- `npm run check:tools` 通过。
- `npm run check:comet` 通过。

## 本轮提交与同步

### 计划

- [x] 仅暂存 `/ysclaw-agent4` 主入口相关变更，不纳入 `assets/imgs` 的删除或未跟踪目录。
- [x] 创建提交并保留当前分支历史。
- [x] 推送 `main` 到 `origin`。

### 复盘

本轮提交范围限定为 `/ysclaw-agent4` 推荐主入口、相关文档、测试和任务记录；不纳入工作区已有的 `assets/imgs` 删除或 `assets/imgs/v0/` 未跟踪内容。提交后推送当前 `main` 分支到 `origin`。

## OpenSpec 依赖内置安装计划

### 本轮目标

让用户安装 `opencode-agent4` 后即可使用 `/comet`，不再额外手动安装 OpenSpec CLI 或 OpenSpec OpenCode skills。改动要保持 Agent4 的安全默认值和 `/comet` 核心流程定位。

### 已确认上下文

- [x] 复习 `tasks/lessons.md`，确认 `/comet` 是 Agent4 核心研发工作流入口，`/ysclaw-*` 是生命周期内结构化产物能力节点。
- [x] 检查当前安装文档和 bootstrap，确认它们仍声明 OpenSpec CLI / skills 是外部前置依赖。
- [x] 查询当前 OpenSpec npm 包元数据：`@fission-ai/openspec@1.3.1` 提供 `openspec` bin，要求 Node `>=20.19.0`。
- [x] 在临时目录验证 `openspec init --tools opencode --force`，确认当前 OpenSpec 生成 4 个 OpenCode skills：`openspec-explore`、`openspec-propose`、`openspec-apply-change`、`openspec-archive-change`。
- [x] 发现 Comet 现有文本还引用兼容名称 `openspec-new-change` 和 `openspec-verify-change`，需要在本插件内补齐兼容层或同步命名，否则安装后仍会断链。
- [x] 运行 `git status --short`，确认存在与本需求无关的 `assets/imgs/*` 删除和 `assets/imgs/v0/` 新增；本轮不触碰这些文件。

### 设计决策

- [x] 使用 package 依赖承载 OpenSpec CLI：在 `package.json` 的 `dependencies` 中加入固定范围的 `@fission-ai/openspec`，让 npm / git-backed OpenCode 插件安装时同时安装 CLI。
- [x] 不在插件加载时静默执行全局安装、`npm install -g` 或网络安装，避免运行时副作用；插件只暴露已安装的本地 CLI。
- [x] 在插件 `shell.env` 中为 OpenCode shell 环境追加本包可解析到的 `node_modules/.bin` 路径，使 Comet 脚本中的 `openspec` 命令优先命中插件随包依赖。
- [x] 将 OpenSpec OpenCode skills 随 `opencode-agent4` 一起注册：纳入 OpenSpec 兼容 skills，并补齐 Comet 需要的 `openspec-new-change`、`openspec-verify-change` 兼容 skills。
- [x] 文档改为“OpenSpec 依赖随插件安装”，同时保留本地 checkout 排障说明：如果直接从源码路径使用且依赖未安装，运行插件仓库的 `npm install` 后重启 OpenCode。

### 实现计划

- [x] 更新 `package.json`：加入 `@fission-ai/openspec` 运行时依赖，并通过测试检查依赖声明。
- [x] 修改 `.opencode/plugins/ysclaw-agent4.js`：注册 OpenSpec skills、更新 bootstrap 文案、追加 `openspec` 本地 bin 路径到 shell PATH，且不覆盖用户已有配置。
- [x] 新增 `skills/openspec-*`：覆盖 `openspec-explore`、`openspec-propose`、`openspec-apply-change`、`openspec-archive-change`、`openspec-new-change`、`openspec-verify-change`。
- [x] 同步 `skills/comet*` 文案中对 OpenSpec skills 的引用，明确兼容层名称和当前 OpenSpec CLI 命令。
- [x] 更新 README、`.opencode/INSTALL.md`、`docs/README.opencode.md`、`docs/README.comet.opencode.md`、`docs/DEVELOPMENT_STATUS.md`，删除“不会自动安装 OpenSpec”的旧结论。
- [x] 扩展测试：检查 OpenSpec 依赖、OpenSpec skills、bootstrap 文案、PATH 合并行为、命令模板不再提示缺失外部 OpenSpec skills。

### 验证计划

- [x] 等价安装检查：`npm exec --package @fission-ai/openspec@1.3.1 -- openspec --version` 输出 `1.3.1`。
- [x] `npm test`
- [x] `npm run test:comet`
- [x] `npm run check:plugin`
- [x] `npm run check:tools`
- [x] `npm run check:comet`
- [x] 针对性运行新增 OpenSpec 依赖测试：`node tests/opencode/test-plugin-config.mjs`、`bash tests/opencode/test-plugin-loading.sh`、`node tests/comet/test-comet-assets.mjs`。

### 实现前确认

用户已确认“ok”，本轮已开始并完成实现。

### 本轮复盘

- `@fission-ai/openspec@1.3.1` 已加入根 `package.json` 和 `.opencode/package.json`，覆盖 npm / git-backed 插件安装和本地 OpenCode 配置依赖场景。
- 插件新增 `shell.env` hook，将根 `node_modules/.bin` 和 `.opencode/node_modules/.bin` 前置到 PATH；若这些路径已在 PATH 中，会移动到最前并去重，保留用户其他 PATH 顺序。
- 新增 6 个 `openspec-*` skills，包含 Comet 需要的 `openspec-new-change` 和 `openspec-verify-change` 兼容入口。
- README、OpenCode 安装说明、Comet 文档、Codex 插件元数据和开发状态文档已从“外部前置依赖”更新为“随包安装”。
- 本轮未触碰既有无关图片资产改动；`assets/imgs/*` 删除与 `assets/imgs/v0/` 新增仍属于进入本轮前已存在的工作区状态。

## Comet 交付与版本控制收尾计划

### 本轮目标

在不继续扩大功能范围的前提下，优先处理当前已完成 Comet 迁入和 `/comet` 核心流程重定位后的交付事项：确认工作区边界、排除无关本地文件、重新跑完整验证，并将可交付内容 stage/commit 到当前分支。

### 已确认上下文

- [x] 复习 `tasks/lessons.md`，确认 `/comet` 是 Agent4 主入口，`/ysclaw-*` 只是生命周期内结构化产物能力节点。
- [x] 复习 `tasks/todo.md` 和 `docs/DEVELOPMENT_STATUS.md`，确认当前没有 `/comet` 重定位功能阻塞项。
- [x] 运行 `git status --short`，确认当前未跟踪排除项为 `.DS_Store`、`assets/.DS_Store`、`assets/design.pptx`。
- [x] 检查 `package.json`，确认交付前验证脚本包含 `npm test`、`npm run test:comet`、`npm run check:plugin`、`npm run check:tools`、`npm run check:comet`。

### 执行计划

- [x] 新增 `.gitignore`，显式排除 `.DS_Store`、`assets/.DS_Store`、`assets/design.pptx`，防止版本控制误纳入。
- [x] 运行完整验证：`npm test`、`npm run test:comet`、`npm run check:plugin`、`npm run check:tools`、`npm run check:comet`。
- [x] 根据验证结果更新 `docs/DEVELOPMENT_STATUS.md`。
- [x] stage 当前交付文件，确认排除项未进入 index。
- [x] 如验证和 stage 均通过，在当前分支创建提交。

### 实现前确认

本轮没有新增功能指令，按现有状态优先完成交付/版本控制收尾。默认将 `tasks/` 和 `docs/DEVELOPMENT_STATUS.md` 纳入提交，因为用户要求任何改动后同步更新这两处状态记录；默认不纳入 `.DS_Store`、`assets/.DS_Store`、`assets/design.pptx`。

### 当前验证结果

- `npm test` 通过。
- `npm run test:comet` 通过。
- `npm run check:plugin` 通过。
- `npm run check:tools` 通过。
- `npm run check:comet` 通过。

### 审查阻塞项与重规划

只读交付审查发现两个 archive 阻塞项，本轮暂停 stage/commit，先修复根因：

- [x] `skills/comet/scripts/comet-archive.sh` 不能再用 delta spec 直接覆盖主 spec；遇到 delta specs 时必须委托 OpenSpec archive/merge，或在无法安全合并时失败关闭。
- [x] `skills/comet/scripts/comet-archive.sh` archive 入口必须重复强制 `verification_report` 指向存在文件，且 `branch_status=handled`，不能只依赖上一阶段状态转换。
- [x] `tests/comet/test-comet-assets.mjs` 增加 archive 负例，覆盖缺失验证报告、分支未处理和 delta spec 归档保护。
- [x] 修复后重新运行完整验证，并再次更新本节和 `docs/DEVELOPMENT_STATUS.md`。

修复结果：

- archive 入口现在会验证 `verification_report` 是存在的受管报告路径，并要求 `branch_status=handled`。
- delta specs 存在时不再执行 `cp "$delta_spec" "$main_spec"`；脚本会要求 `openspec archive <change> --yes` 负责合并。缺少 OpenSpec CLI 时直接失败关闭，避免删除主 spec 中未变更需求。
- 新增回归测试确认缺失验证报告、分支未处理和 delta spec 无安全合并能力时都会阻断 archive，且主 spec 内容保持不变。

修复后完整验证：

- `npm test` 通过。
- `npm run test:comet` 通过。
- `npm run check:plugin` 通过。
- `npm run check:tools` 通过。
- `npm run check:comet` 通过。

### 第二轮复审修复

复审发现 archive 成功后仍可能通过 change 名称解析写错 `.comet.yaml`：如果 active change 名称刚好等于归档名，`comet-state.sh transition <archive-name> archived` 会优先命中 active change，而不是归档目录。

- [x] `comet-archive.sh` 在归档前拒绝 `openspec/changes/<archive-name>` active change 碰撞。
- [x] `comet-archive.sh` 不再用 state 脚本按名称标记归档结果，改为直接更新归档目录中的明确 `.comet.yaml`。
- [x] `tests/comet/test-comet-assets.mjs` 新增 active archive-name 碰撞负例。
- [x] `tests/comet/test-comet-assets.mjs` 新增非 dry-run 正例，确认归档目录 `.comet.yaml` 写入 `archived: true` 且原 active change 被移走。
- [x] targeted 验证通过：`bash -n skills/comet/scripts/comet-archive.sh`、`node --check tests/comet/test-comet-assets.mjs`、`npm run test:comet`。
- [x] 终审通过：只读复审确认无阻塞 findings。
- [x] 终审后完整验证通过：`npm test`、`npm run test:comet`、`npm run check:plugin`、`npm run check:tools`、`npm run check:comet`。
- [x] `git diff --cached --name-only | rg '(^|/)\\.DS_Store$|^assets/design\\.pptx$' || true` 输出为空，确认 `.DS_Store`、`assets/.DS_Store`、`assets/design.pptx` 未进入暂存区。

提交结果：

- 当前分支：`codex/port-comet-workflow`
- 提交主题：`feat: add Comet Agent4 workflow`

## 最新开发状态文档更新

### 本轮文档目标

- [x] 更新 `docs/DEVELOPMENT_STATUS.md`，明确当前完成项、未完成项、验证结果和下次启动检查清单。
- [x] 标注 `/comet` 第一阶段迁入和核心流程重定位均已完成。
- [x] 标注本轮 `/comet` 重定位无剩余阻塞项。
- [x] 标注仍待处理的是交付/版本控制确认、细粒度提交迁移计划和可选 backlog。
- [x] 写入下次启动提示词，确保下次 Codex 可以从当前进度继续。

### 当前完成状态

- `/comet` 是 `opencode-agent4` 的 Agent4 主入口。
- `/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 是 `/comet` 生命周期内的结构化产物能力节点。
- Comet build/verify/archive/hotfix/tweak 已明确不能绕过 Agent4 产物链。
- README、OpenCode 文档、安装说明、插件元数据、测试和 `docs/DEVELOPMENT_STATUS.md` 已同步。

### 当前未完成状态

- 当前工作区尚未 stage/commit。
- 细粒度提交迁移计划仍等待用户确认 remote URL、目标分支、是否纳入 `tasks/` 等。
- 可选 backlog 仍未实现：Agent4 `status/doctor`、资产 manifest、Agent4 -> Agent5 hash sidecar、`VerifiedPatchPackage` 归档目录。
- OpenSpec CLI / OpenSpec skills 仍是外部依赖，本包不自动安装。

### 下次启动提示词

```text
请先阅读 /Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/tasks/lessons.md、
/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/tasks/todo.md 和
/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/docs/DEVELOPMENT_STATUS.md。

当前状态：Comet 第一阶段迁入和 /comet 核心流程重定位都已完成；/comet 是 opencode-agent4 的 Agent4 主入口，/ysclaw-patch-plan 与 /ysclaw-build-patch 只是 /comet 生命周期内的结构化产物能力节点。

请先用 git status --short 确认工作区。不要纳入 .DS_Store、assets/.DS_Store、assets/design.pptx。接下来请在当前进度上继续开发：优先处理未完成的交付/版本控制事项，或根据我新的指令推进 backlog。任何改动后都要更新 tasks/todo.md 和 docs/DEVELOPMENT_STATUS.md，并在完成前运行相关验证；交付前运行 npm test、npm run test:comet、npm run check:plugin、npm run check:tools、npm run check:comet。
```
- `bash -n` 覆盖新增 Comet 脚本和测试 shell。
- `node --check` 覆盖新增 Comet 测试与修改过的 OpenCode `.mjs` 测试。
- `git status --short` 显示本轮未纳入既有 `.DS_Store` 与 `assets/design.pptx` 未跟踪文件。

### 审查修复复盘

代码审查发现并已修复的阻塞项：

- `.comet.yaml` 路径字段增加安全校验：只允许受管相对路径，拒绝绝对路径、`..` 和 symlink 组件。
- `comet-guard.sh` 默认不执行 `.comet.yaml` / 项目配置中的 `build_command`、`verify_command`；只有设置 `COMET_ALLOW_CONFIGURED_COMMANDS=1` 才允许自动执行。
- Comet bootstrap 改为按中文/英文标题锚点截取 Decision Core，避免每次会话注入 Reference Appendix。
- design 阶段 guard 现在强制 `design_doc` 存在且 frontmatter 包含 `comet_change`、`role: technical-design`、`canonical_spec: openspec`。
- Comet skill 文本中的 `superpowers:` 前缀已改为当前 OpenCode 实际注册的 skill 名称。

新增回归覆盖：

- `tests/opencode/test-bootstrap-caching.mjs` 断言 Comet bootstrap 不包含参考附录或脚本定位说明，且长度受控。
- `tests/comet/test-comet-assets.mjs` 覆盖路径逃逸、symlink 逃逸、配置命令默认阻断、design_doc 缺失阻断和 archive dry-run。

复审结果：

- 代码审查已确认上一轮 5 个阻塞项均关闭，未发现新的阻塞问题。

## Comet 核心流程重定位计划

### 背景纠正

用户已明确纠正：当前项目对 `/comet` 的定位是错误的。`/comet` 不应只是“开发 opencode-agent4 插件自身能力”的旁路流程，而应成为 `opencode-agent4` 的核心工作流入口，驱动 Agent4 的完整研发生命周期。

正确目标定位：

```text
/comet
  = opencode-agent4 核心工作流入口
  = 驱动 Agent4 完整研发生命周期
  = 通过 OpenSpec + Superpowers 编排需求、设计、计划、实现、验证、归档和交接

/ysclaw-patch-plan
/ysclaw-build-patch
  = Comet 生命周期中可调用的结构化产物能力
  = 继续负责 PatchPlan、PatchCandidate、PatchRegressionResult、VerifiedPatchPackage 的 schema 契约和确定性工具边界
```

### 当前已完成

- [x] 已创建开发分支 `codex/port-comet-workflow`。
- [x] 已迁入 Comet 中文 skills：`comet`、`comet-open`、`comet-design`、`comet-build`、`comet-verify`、`comet-archive`、`comet-hotfix`、`comet-tweak`。
- [x] 已迁入 Comet scripts：`comet-state.sh`、`comet-guard.sh`、`comet-handoff.sh`、`comet-archive.sh`、`comet-yaml-validate.sh`。
- [x] 已在 `.opencode/plugins/ysclaw-agent4.js` 注册 `/comet*` 命令并注入 `COMET_BOOTSTRAP`。
- [x] 已新增 Comet smoke 与安全回归测试。
- [x] 已修复第一轮审查阻塞项：路径逃逸、symlink 逃逸、配置命令默认执行、bootstrap 过量注入、design_doc guard 缺失。
- [x] 已记录 lesson：`/comet` 应成为 Agent4 核心研发生命周期入口。
- [x] 本轮新增 `docs/DEVELOPMENT_STATUS.md`，用于下次启动恢复上下文。

### 重定位执行结果

- [x] 重写 `.opencode/plugins/ysclaw-agent4.js` 中的 Comet bootstrap 文案，删除“只开发本仓库自身能力”和“补丁链路仍使用 `/ysclaw-*`”的错误割裂表达。
- [x] 重写 `defaultAgentConfig()` prompt，使 `ysclaw-agent4-patch` 默认以 `/comet` 作为核心编排入口，而不是把 `/ysclaw-*` 当作平级主流程。
- [x] 重写 `defaultCometCommand()` template，使 `/comet` 明确驱动 Agent4 完整研发生命周期，并把 `/ysclaw-*` 定位为生命周期内的结构化产物能力。
- [x] 更新 `skills/comet/SKILL.md` 及 `skills/comet-*`，把 OpenSpec/Superpowers 阶段与 Agent4 的 RootCauseBlueprint、PatchPlan、PatchCandidate、PatchRegressionResult、VerifiedPatchPackage 产物链打通。
- [x] 更新 README、`docs/README.comet.opencode.md`、`docs/README.opencode.md`、`.opencode/INSTALL.md`，把 `/comet` 写成安装后的主入口。
- [x] 更新或新增测试，断言 bootstrap、命令模板和 Comet skills 不再回退到“旁路流程 / 平级 `/ysclaw-*`”定位。
- [x] 重新跑完整验证：`npm test`、`npm run test:comet`、`npm run check:plugin`、`npm run check:tools`、`npm run check:comet`。

### 本轮文档更新计划

- [x] 在 `tasks/todo.md` 记录 Comet 核心流程重定位的完成/未完成状态。
- [x] 新增 `docs/DEVELOPMENT_STATUS.md`，作为下次启动的恢复入口。
- [x] 更新 README 和 Comet 文档，标注当前实现状态与目标状态的差异。
- [x] 运行文档相关验证并记录结果。

### 上一轮复盘

上一轮只更新状态文档，不修改插件运行逻辑。已明确记录：

- Comet 第一阶段迁入已完成。
- `/comet` 作为 Agent4 核心工作流入口当时仍待重定位；该事项已在后续“Comet 核心流程重定位执行计划”中完成。
- 后续启动应先读取 `docs/DEVELOPMENT_STATUS.md`、`tasks/todo.md` 和 `tasks/lessons.md`，再继续开发。

验证结果：

- `npm run check:plugin` 通过。
- `npm run check:tools` 通过。
- `npm run check:comet` 通过。
- `npm test` 通过。
- `npm run test:comet` 通过。

## Comet 核心流程重定位执行计划

### 本轮差距确认

- [x] 复习 `tasks/lessons.md`，确认 `/comet` 必须成为 Agent4 核心研发生命周期入口。
- [x] 复习 `tasks/todo.md` 和 `docs/DEVELOPMENT_STATUS.md`，确认第一阶段迁入已完成但重定位未完成。
- [x] 检查插件入口、Comet skills、README/OpenCode 文档和测试。

实现前确认的差距：

- `.opencode/plugins/ysclaw-agent4.js` 的 `COMET_BOOTSTRAP` 使用旧的项目开发流程表述，并把 Agent4 补丁链路分流到 `/ysclaw-*`。
- `defaultAgentConfig()` 和 `defaultCometCommand()` 把 Comet 限定为当前项目开发入口，没有把它写成 Agent4 生命周期编排入口。
- `skills/comet/SKILL.md` 和阶段 skills 主要描述 OpenSpec + Superpowers，没有明确把阶段产物映射到 `RootCauseBlueprint -> PatchPlan -> PatchCandidate -> PatchRegressionResult -> VerifiedPatchPackage`。
- README、`docs/README.comet.opencode.md`、`docs/README.opencode.md`、`.opencode/INSTALL.md` 包含待重定位状态文案，需要改成完成后的主入口说明。
- 测试只验证 Comet bootstrap 缓存和命令注册，没有阻止“旁路流程 / 平级 `/ysclaw-*`”语义回归。

### 最小改动范围

- [x] 更新 `.opencode/plugins/ysclaw-agent4.js` 的 Comet bootstrap、Agent4 prompt 和 Comet command template。
- [x] 更新 `skills/comet/SKILL.md`、`skills/comet-build/SKILL.md`、`skills/comet-verify/SKILL.md`、`skills/comet-archive/SKILL.md`、`skills/comet-hotfix/SKILL.md`、`skills/comet-tweak/SKILL.md`，打通 Agent4 结构化产物链。
- [x] 更新 README、`docs/README.comet.opencode.md`、`docs/README.opencode.md`、`.opencode/INSTALL.md`，删除“重定位未完成”状态并明确 `/comet` 是主入口。
- [x] 更新 `tests/opencode/test-bootstrap-caching.mjs`、`tests/opencode/test-plugin-config.mjs` 和 `tests/comet/test-comet-assets.mjs`，增加正向/反向语义断言。
- [x] 运行完整验证：`npm test`、`npm run test:comet`、`npm run check:plugin`、`npm run check:tools`、`npm run check:comet`。

### 实现前确认

本轮用户已要求“先确认当前差距，再按最小改动推进”。当前差距已确认，以下实现仅做定位文案、生命周期衔接说明和语义回归测试，不改 Comet 脚本状态机、不改 Agent4 schemas、不改工具函数。

### 本轮复盘

本轮已完成 `/comet` 核心流程重定位：

- 插件 bootstrap、默认 agent prompt 和 Comet command template 现在都把 `/comet` 描述为 Agent4 核心研发工作流入口。
- `/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 已统一定位为 `/comet` 生命周期内的结构化产物能力节点。
- Comet build/verify/archive 阶段已显式约束 `PatchPlan`、`PatchCandidate`、`PatchRegressionResult` 和 `VerifiedPatchPackage`。
- hotfix/tweak 仍保持轻量路径，但不再允许绕过 Agent4 产物链。
- README、OpenCode 文档、安装说明、插件元数据和 `docs/DEVELOPMENT_STATUS.md` 已同步到完成后的定位。

最终验证：

- `npm test` 通过。
- `npm run test:comet` 通过。
- `npm run check:plugin` 通过。
- `npm run check:tools` 通过。
- `npm run check:comet` 通过。
