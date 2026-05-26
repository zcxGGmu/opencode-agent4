# opencode-agent4 当前开发状态

更新时间：2026-05-26

## 当前分支

```text
codex/port-comet-workflow
```

## 当前结论

Comet 第一阶段迁入已完成，`/comet` 也已重定位为 `opencode-agent4` 的核心工作流入口。

当前正确模型：

```text
/comet
  -> /comet-open
  -> /comet-design
  -> /comet-build
       -> 生成/确认 PatchPlan
       -> 构建 PatchCandidate
  -> /comet-verify
       -> 运行或导入 Agent1 patch_regression
       -> 形成 PatchRegressionResult
  -> /comet-archive
       -> 生成 VerifiedPatchPackage
       -> 交接 Agent5
```

`/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 是 `/comet` 生命周期内的结构化产物能力节点，不是与 `/comet` 平级竞争的主流程。

## 已完成

- Agent4 基础插件包、schemas、工具、OpenCode agent/commands、Agent4 skills 和测试已完成。
- Superpowers skills 已合并迁入，并由同一个 OpenCode 插件入口注册。
- Comet 中文 skills 已迁入：
  - `skills/comet`
  - `skills/comet-open`
  - `skills/comet-design`
  - `skills/comet-build`
  - `skills/comet-verify`
  - `skills/comet-archive`
  - `skills/comet-hotfix`
  - `skills/comet-tweak`
- Comet scripts 已迁入：
  - `skills/comet/scripts/comet-state.sh`
  - `skills/comet/scripts/comet-guard.sh`
  - `skills/comet/scripts/comet-handoff.sh`
  - `skills/comet/scripts/comet-archive.sh`
  - `skills/comet/scripts/comet-yaml-validate.sh`
- OpenCode 插件入口已注册 `/comet*` 命令，并注入 `COMET_BOOTSTRAP`，带缓存和去重。
- Comet 第一轮安全修复已完成：
  - `.comet.yaml` 受管路径拒绝绝对路径、`..` 和 symlink 逃逸。
  - `comet-guard.sh` 默认不自动执行配置命令，除非显式设置 `COMET_ALLOW_CONFIGURED_COMMANDS=1`。
  - `COMET_BOOTSTRAP` 只注入 Decision Core，不注入 Reference Appendix。
  - design guard 强制 `design_doc` 存在，并要求 frontmatter 包含 `comet_change`、`role: technical-design`、`canonical_spec: openspec`。
  - Comet skill 文本中的 Superpowers 引用已改为当前 OpenCode 本地 skill 名称。
- `/comet` 核心流程重定位已完成：
  - `.opencode/plugins/ysclaw-agent4.js` 的 bootstrap、默认 agent prompt 和 Comet command template 已更新。
  - `skills/comet/SKILL.md` 已明确 `/comet` 是 Agent4 主入口。
  - `skills/comet-build/SKILL.md` 已要求校验 `RootCauseBlueprint`、生成/确认 `PatchPlan`、生成 `PatchCandidate`。
  - `skills/comet-verify/SKILL.md` 已要求生成并校验 `PatchRegressionResult`。
  - `skills/comet-archive/SKILL.md` 已要求生成并校验 `VerifiedPatchPackage`，作为 Agent5 handoff。
  - `skills/comet-hotfix/SKILL.md` 和 `skills/comet-tweak/SKILL.md` 已明确轻量路径也不能绕过 Agent4 产物链。
  - README、`docs/README.comet.opencode.md`、`docs/README.opencode.md`、`.opencode/INSTALL.md`、`.codex-plugin/plugin.json`、`package.json` 已同步新定位。
  - 语义回归测试已覆盖 bootstrap、命令模板和 Comet skills。

## 已通过验证

本轮重定位后已通过：

```bash
npm test
npm run test:comet
npm run check:plugin
npm run check:tools
npm run check:comet
```

额外针对性验证也已通过：

```bash
node tests/opencode/test-plugin-config.mjs
bash tests/opencode/test-bootstrap-caching.sh
```

## 当前未完成

### 本轮 `/comet` 重定位

无未完成阻塞项。当前剩余事项不是 `/comet` 重定位本身的功能缺口。

### 交付与版本控制

- 当前正在执行交付/版本控制收尾：完整验证已通过，下一步 stage 并提交当前分支的 Comet 迁入与 `/comet` 重定位成果。
- 本轮默认纳入 `tasks/` 过程记录，因为用户要求任何改动后同步更新 `tasks/todo.md` 和本状态文档。
- 已新增 `.gitignore`，避免误纳入无关本地文件：
  - `.DS_Store`
  - `assets/.DS_Store`
  - `assets/design.pptx`
- 本轮交付前完整验证已通过：
  - `npm test`
  - `npm run test:comet`
  - `npm run check:plugin`
  - `npm run check:tools`
  - `npm run check:comet`
- 只读交付审查发现的两个 archive 阻塞项已修复并加入回归测试：
  - `comet-archive.sh` 不再用 delta spec 直接覆盖主 spec；delta specs 必须由 OpenSpec archive/merge 处理，缺少安全合并能力时失败关闭。
  - `comet-archive.sh` archive 入口强制 `verification_report` 指向存在报告文件，并强制 `branch_status=handled`。
- 第二轮复审发现的 archive 标记歧义已修复并加入回归测试：
  - 归档前拒绝 active change 与目标归档名碰撞。
  - 归档成功后直接更新归档目录中的 `.comet.yaml`，不再通过名称解析调用 state transition。
- 最新终审无阻塞 findings；终审后完整验证再次通过。
- 当前交付文件已 stage，暂存区检查确认未包含 `.DS_Store`、`assets/.DS_Store`、`assets/design.pptx`。
- 当前分支已创建提交，提交主题为 `feat: add Comet Agent4 workflow`。

### 仍待用户确认的迁移任务

`tasks/todo.md` 中的“细粒度提交迁移计划”仍未执行，原因是缺少用户确认：

- 目标空仓库 remote URL。
- 新分支名，默认 `codex/split-history`。
- 新仓库默认分支名，默认推送为 `main`。
- 是否包含 `assets/design.pptx`，默认不包含。
- 是否把 `tasks/` 纳入新仓库，默认不包含，除非希望保留项目记忆。
- 是否排除 `.DS_Store` 和 `assets/.DS_Store`，默认排除。

### 可选后续增强

这些是 backlog，不阻塞当前 `/comet` 主流程：

- Agent4 语义的 `status` / `doctor` 命令：检查 plugin、skills、schemas、tools、Agent1 回归命令、安全权限和当前补丁证据。
- 资产 manifest：统一列出 skills、schemas、commands、tools 和文档，由测试读取校验完整性。
- Agent4 -> Agent5 确定性交接 sidecar：为 blueprint、plan、diff、regression result 生成 hash 索引，防止证据漂移。
- `VerifiedPatchPackage` 归档目录：`artifacts/agent4/archive/YYYY-MM-DD-<id>/`。
- OpenSpec CLI / OpenSpec skills 仍是外部前置依赖；本包只注册 Comet workflow skills 和确定性脚本，不自动安装。

## 下次启动检查清单

1. 先读取：
   - `tasks/lessons.md`
   - `tasks/todo.md`
   - `docs/DEVELOPMENT_STATUS.md`
2. 运行 `git status --short`，确认当前 dirty worktree。
3. 若继续提交/迁移工作，先确认是否纳入 `tasks/`，并排除 `.DS_Store`、`assets/.DS_Store`、`assets/design.pptx`。
4. 若继续开发功能，保持 `/comet` 为 Agent4 主入口，把 `/ysclaw-*` 仅作为生命周期内结构化产物能力节点。
5. 改动后至少运行相关语义回归测试；交付前运行完整验证：

```bash
npm test
npm run test:comet
npm run check:plugin
npm run check:tools
npm run check:comet
```

## 下次启动提示词

```text
请先阅读 /Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/tasks/lessons.md、
/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/tasks/todo.md 和
/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4/docs/DEVELOPMENT_STATUS.md。

当前状态：Comet 第一阶段迁入和 /comet 核心流程重定位都已完成；/comet 是 opencode-agent4 的 Agent4 主入口，/ysclaw-patch-plan 与 /ysclaw-build-patch 只是 /comet 生命周期内的结构化产物能力节点。

请先用 git status --short 确认工作区。不要纳入 .DS_Store、assets/.DS_Store、assets/design.pptx。接下来请在当前进度上继续开发：优先处理未完成的交付/版本控制事项，或根据我新的指令推进 backlog。任何改动后都要更新 tasks/todo.md 和 docs/DEVELOPMENT_STATUS.md，并在完成前运行相关验证；交付前运行 npm test、npm run test:comet、npm run check:plugin、npm run check:tools、npm run check:comet。
```
