---
name: comet-build
description: "Comet 阶段 3：计划与构建。用 /comet-build 调用。制定计划并选择执行方式（subagent 或直接执行）实施。"
---

# Comet 阶段 3：计划与构建（Build）

## 前置条件

- Design Doc 已创建（阶段 2 完成）
- 活跃 change 存在

## 步骤

### 0. 入口状态验证（Entry Check）

执行入口验证：

```bash
COMET_SEARCH_ROOTS=("." "$HOME/.claude/skills" "$HOME/.codex/skills" "$HOME/.cursor/skills")
COMET_STATE="${COMET_STATE:-$(find "${COMET_SEARCH_ROOTS[@]}" -path '*/comet/scripts/comet-state.sh' -type f -print -quit 2>/dev/null)}"
COMET_GUARD="${COMET_GUARD:-$(find "${COMET_SEARCH_ROOTS[@]}" -path '*/comet/scripts/comet-guard.sh' -type f -print -quit 2>/dev/null)}"
bash "$COMET_STATE" check <name> build
```

验证通过后继续 Step 1。验证失败时脚本会输出具体失败原因。

### 1. 校验 RootCauseBlueprint 并生成 PatchPlan

Build 阶段是 Agent4 产物链的入口。默认生产路径必须先建立结构化补丁计划，再进入代码修改。

1. 定位本次 change 对应的 `RootCauseBlueprint`。来源可以是用户输入、OpenSpec proposal 附件、或上游 Agent3 交接文件；无法定位时必须停止并要求补齐，不要凭对话记忆伪造。
2. 使用 `ysclaw-root-cause-blueprint-reader` 校验蓝图，并用结构约束工具复核：

```bash
node tools/ysclaw-agent4-tools.js validate root-cause-blueprint <blueprint.json>
```

3. 调用或约束 `/ysclaw-patch-plan`，生成符合 `schemas/patch-plan.schema.json` 的 `PatchPlan`。`PatchPlan` 生成期间不得修改代码。
4. 将 `PatchPlan` 保存到可追溯位置，例如：

```text
openspec/changes/<name>/.comet/agent4/patch-plan.json
```

5. 向用户确认 `PatchPlan`。确认前不得进入代码修改。

### 2. 制定执行计划

**立即执行：** 使用 Skill 工具加载 `writing-plans` 技能。禁止跳过此步骤。

技能加载后，按其指引制定计划。计划要求：
- 保存至 `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`
- 引用设计文档，拆分为可执行任务
- **Plan 文件头必须包含关联元数据**：

```yaml
---
change: <openspec-change-name>
design-doc: docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md
base-ref: <git rev-parse HEAD before implementation>
---
```

`base-ref` 用于验证阶段跨提交统计改动规模。创建计划时先记录当前提交：

```bash
git rev-parse HEAD
```

### 3. 更新计划状态

先记录 plan 路径：

```bash
bash "$COMET_STATE" set <name> plan docs/superpowers/plans/YYYY-MM-DD-feature.md
```

无需手动更新 phase，guard 会在退出条件满足后自动流转。

### 4. 工作区隔离

计划已写入当前分支。在开始执行前，选择工作区隔离方式：

| 选项 | 方式 | 说明 |
|------|------|------|
| A | 创建分支 | 在当前仓库创建新分支，简单快速 |
| B | 创建 Worktree | 隔离工作区，完全独立，适合并行开发 |

**推荐规则**：
- 变更涉及 ≤ 3 个文件 → 推荐 A
- 需要并行开发、当前分支有未提交工作 → 推荐 B

用户选择后，更新 `isolation` 字段。`isolation` 只允许以下值之一：

```bash
bash "$COMET_STATE" set <name> isolation <value>
```

- `branch`
- `worktree`

<IMPORTANT>
这是脚本级硬约束，不是建议。full workflow 初始化时 `isolation` 可以暂时为 `null`，但只允许存在到本步骤之前。
进入实现前必须停下来询问用户并写入 `branch` 或 `worktree`。若保持 `null`，`build → verify` 的 guard 和 `comet-state transition build-complete` 都会失败。
</IMPORTANT>

**执行隔离**：

- **branch**：执行 `git checkout -b <change-name>`，后续工作在新分支上进行
- **worktree**：调用 `using-git-worktrees` 技能或使用原生 worktree 工具创建隔离工作区

创建隔离后，确认计划文件可访问（分支方式天然可访问；worktree 方式需确认计划已提交）。

### 5. 选择执行方式

向用户展示计划摘要（任务数、涉及模块），然后询问执行方式：

| 选项 | 技能 | 适用场景 |
|------|------|---------|
| A | `subagent-driven-development` | 任务独立、复杂度高、需要双阶段审查 |
| B | `executing-plans` | 任务简单、无子agent环境、轻量快速 |

**推荐规则**：
- 任务数 ≥ 3 → 推荐 A
- 任务数 ≤ 2 且无跨模块依赖 → 推荐 B
- 来自 hotfix 路径 → 推荐 B

用户选择后，更新 `build_mode` 字段。`build_mode` 只允许以下值之一：

```bash
bash "$COMET_STATE" set <name> build_mode <value>
```

- `subagent-driven-development`
- `executing-plans`
- `direct`（默认仅 hotfix/tweak preset 使用）

full workflow 不得默认使用 `direct`。只有用户明确要求跳过计划执行技能，且你已记录显式 override 时，才允许：

```bash
bash "$COMET_STATE" set <name> direct_override true
bash "$COMET_STATE" set <name> build_mode direct
```

没有 `direct_override: true` 时，full workflow 的 `build_mode=direct` 会被 guard 和状态转换同时拦截。

然后，**立即执行：** 使用 Skill 工具加载对应技能。禁止跳过此步骤。

如所选 Superpowers 技能不可用，停止流程并提示安装或启用对应技能，不要用普通对话替代该步骤。

技能加载后，按其指引执行：
- 按计划执行任务
- 完成 tasks.md 勾选（`- [ ]` → `- [x]`）
- 每个任务完成后提交代码

### 6. 生成 PatchCandidate

实现完成且测试通过后，必须捕获真实 Git 差异并生成 `PatchCandidate`。不要手写 diff 摘要代替。

```bash
git diff <base-ref>...HEAD > openspec/changes/<name>/.comet/agent4/patch.diff
node tools/ysclaw-agent4-tools.js candidate \
  openspec/changes/<name>/.comet/agent4/patch-plan.json \
  openspec/changes/<name>/.comet/agent4/patch.diff \
  openspec/changes/<name>/.comet/agent4/patch-candidate.json
```

如使用 `/ysclaw-build-patch` 执行候选补丁构建，也必须确认输出中的 `PatchCandidate` 与当前 Git 差异一致。

### 7. Spec 增量更新

实施过程中发现初版 spec 不完整时，按变更规模分级处理：

| 规模 | 触发条件 | 做法 |
|------|---------|------|
| 小 | 遗漏验收场景、边界条件 | 直接编辑 delta spec + design.md，追加 tasks.md 任务 |
| 中 | 接口变更、新增组件、数据流变化 | 重新 `brainstorming` 更新 Design Doc + delta spec |
| 大 | 全新 capability 需求 | `/opsx:new` 创建独立 change |

**50% 阈值判定**：以 tasks.md 初始任务总数为基准，若新增任务数超过该总数的一半，视为超出原计划范围，应考虑拆分为新 change。

**原则**：
- delta spec 是活文档，本阶段期间随时可修改
- 每次更新应提交，commit message 说明变更原因
- 不提前同步到 main spec，归档时统一同步
- 小规模增量直接改 delta spec 时，应在 commit message 中注明，便于归档时判断 design doc 漂移

### 8. 上下文管理

Build 是最长阶段，可能跨越大量任务。为支持上下文压缩后断点恢复：

- **每完成一个 task**：立即勾选 tasks.md 并提交代码，确保 `.comet.yaml` 和文件状态持久化
- **上下文压缩后恢复**：读取 `.comet.yaml` 的 `phase` 字段确认仍在 build 阶段，读取 plan 文件头的 `base-ref`，再读取 tasks.md 找到下一个未勾选任务继续执行
- **用户手动修改恢复**：按 `comet/reference/dirty-worktree.md` 协议处理未提交改动。该协议定义了检查步骤、归因分类和禁令。build 阶段的特殊处理：
  1. 归因后，若 diff 暗示计划或 spec 已变化，按 Step 7「Spec 增量更新」分级处理
- **长任务拆分**：单任务超过 200 行代码变更时，考虑拆分为多个子任务分别提交

## 退出条件

- tasks.md 全部勾选
- 代码已提交
- `PatchPlan` 已生成、校验并经用户确认
- `PatchCandidate` 已根据真实 `git diff` 生成，并与 `PatchPlan` 标识保持一致
- 已显式运行项目对应的构建/测试命令并通过（不要只依赖 guard 自动猜测）
- `isolation` 已写为 `branch` 或 `worktree`
- `build_mode` 已写为 `subagent-driven-development`、`executing-plans` 或带显式 override 的 `direct`
- **阶段守卫**：运行 `bash "$COMET_GUARD" <change-name> build --apply`，全部 PASS 后自动流转到 `phase: verify`

Guard 会读取项目配置中的命令，但默认不会自动执行配置命令，避免隐藏执行来自 `.comet.yaml` 或项目配置的任意 shell。先显式运行对应命令并检查输出；如确实需要 guard 自动执行配置命令，再设置 `COMET_ALLOW_CONFIGURED_COMMANDS=1`。

```yaml
build_command: <build command>
verify_command: <verify command>
```

配置位置可为 change 的 `.comet.yaml`，也可为仓库根目录的 `.comet.yaml` / `comet.yaml` / `.comet.yml` / `comet.yml`。
未配置时才回退到 `npm run build`、Maven 或 Cargo 的默认探测。构建失败时 guard 会打印失败命令输出，作为排查证据。

退出前运行 guard 自动流转：

```bash
bash "$COMET_GUARD" <change-name> build --apply
```

状态文件自动更新为 `phase: verify`、`verify_result: pending`。

## 自动流转

退出条件满足后，**无需等待用户再次输入**，直接执行下一阶段：

> **REQUIRED NEXT SKILL:** 调用 `comet-verify` skill 进入验证与收尾阶段。
