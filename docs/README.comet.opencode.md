# opencode-agent4 中的 Comet 工作流

本仓库把 Comet 的中文 skills 和确定性脚本嵌入到 `opencode-agent4` OpenCode 插件中。`/comet` 是 `opencode-agent4` 的核心工作流入口，驱动 Agent4 的完整研发生命周期。

Comet 内容迁移自 `rpamis/comet`；上游 MIT 许可保存在 `docs/LICENSE.comet`。

## 定位

Comet 管理完整研发生命周期：

```text
/comet
  -> /comet-open
  -> /comet-design
  -> /comet-build
     -> /ysclaw-patch-plan
     -> /ysclaw-build-patch
  -> /comet-verify
  -> /comet-archive
```

Agent4 的补丁交接契约仍由结构化产物保证：

```text
RootCauseBlueprint
  -> PatchPlan
  -> PatchCandidate
  -> PatchRegressionResult
  -> VerifiedPatchPackage
```

这两层不是平级竞争关系。`/comet` 是生命周期编排层，`/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 是生命周期中可调用的结构化产物能力节点。

## 当前实现状态

截至 2026-05-26：

- 已完成：Comet skills、scripts、命令注册、bootstrap 注入、smoke 测试和第一轮安全审查修复。
- `/comet` 是安装后的主入口；`/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 是 `/comet` 生命周期内的结构化产物能力节点。
- 开发恢复细节保存在 `docs/DEVELOPMENT_STATUS.md` 和 `tasks/todo.md`，不作为用户使用路径。

## OpenSpec 依赖

Comet 的 open、verify、archive 阶段依赖 OpenSpec CLI 和 OpenSpec skills，例如 `openspec-explore`、`openspec-new-change`、`openspec-propose` 和 `openspec-verify-change`。

这些依赖现在随 `opencode-agent4` 一起安装：`package.json` 声明 `@fission-ai/openspec`，插件会把本包的 `node_modules/.bin` 注入 OpenCode shell PATH，并在共享 `skills/` 目录中注册 OpenSpec 兼容 skills。缺少 OpenSpec 时，Comet workflow 应停止并提示检查安装完整性，不要用普通对话伪造 OpenSpec 产物。

本地源码路径安装后如果找不到 `openspec`，在插件仓库运行：

```bash
npm install
```

然后重启 OpenCode。新项目第一次使用 OpenSpec 时仍需要初始化项目结构：

```bash
openspec init --tools opencode --force .
```

Superpowers skills 已经随本插件迁入同一个 `skills/` 目录，因此 `comet-design`、`comet-build` 和 `comet-verify` 可以调用本地 Superpowers skills。

## 安装

按 `.opencode/INSTALL.md` 配置 `opencode-agent4` 插件并重启 OpenCode。插件会注册共享 `skills/` 目录，OpenCode 应能发现：

- `comet`
- `comet-open`
- `comet-design`
- `comet-build`
- `comet-verify`
- `comet-archive`
- `comet-hotfix`
- `comet-tweak`
- `openspec-explore`
- `openspec-propose`
- `openspec-new-change`
- `openspec-apply-change`
- `openspec-verify-change`
- `openspec-archive-change`

Comet 脚本位于：

```text
skills/comet/scripts/
```

## 使用

启动完整工作流：

```text
/comet "根据这个 RootCauseBlueprint 完成 Agent4 补丁研发、验证和交接"
```

生产路径下，`/comet-build` 生成并确认 `PatchPlan`，构建后形成 `PatchCandidate`；`/comet-verify` 运行或导入 Agent1 `patch_regression` 并形成 `PatchRegressionResult`；`/comet-archive` 生成 `VerifiedPatchPackage` 并完成 Agent5 handoff。

继续当前 active change：

```text
/comet
```

小范围 bug fix：

```text
/comet-hotfix
```

文案、配置、提示词等轻量改动：

```text
/comet-tweak
```

## 状态文件

Comet 会在 OpenSpec change 下维护状态：

```text
openspec/changes/<change-name>/.comet.yaml
```

脚本负责状态转换和阶段门禁：

```bash
bash skills/comet/scripts/comet-state.sh get <change-name> phase
bash skills/comet/scripts/comet-guard.sh <change-name> build --apply
```

测试会在临时目录验证这些脚本，不应在当前仓库根目录制造测试 change。

## 验证

运行完整测试：

```bash
npm test
```

只运行 Comet smoke：

```bash
npm run test:comet
```

只检查 Comet 测试脚本语法：

```bash
npm run check:comet
```
