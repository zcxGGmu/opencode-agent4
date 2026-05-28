import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '../..');
const skillsDir = path.join(packageRoot, 'skills');
const packageBinDir = path.join(packageRoot, 'node_modules', '.bin');
const opencodePackageBinDir = path.join(packageRoot, '.opencode', 'node_modules', '.bin');
const agent4BootstrapSkillPath = path.join(skillsDir, 'using-ysclaw-agent4', 'SKILL.md');
const superpowersBootstrapSkillPath = path.join(skillsDir, 'using-superpowers', 'SKILL.md');
const cometBootstrapSkillPath = path.join(skillsDir, 'comet', 'SKILL.md');
const agent4MainCommandName = 'ysclaw-agent4';

let agent4BootstrapCache = undefined;
let superpowersBootstrapCache = undefined;
let cometBootstrapCache = undefined;

const cometCommandDefaults = [
  ['comet', 'Agent4 核心研发工作流入口，自动检测 OpenSpec change 阶段并分发到后续阶段。'],
  ['comet-open', 'Comet 阶段 1：开启 OpenSpec change。'],
  ['comet-design', 'Comet 阶段 2：使用 Superpowers 做深度设计。'],
  ['comet-build', 'Comet 阶段 3：生成 PatchPlan 并构建 PatchCandidate。'],
  ['comet-verify', 'Comet 阶段 4：验证实现并形成 PatchRegressionResult。'],
  ['comet-archive', 'Comet 阶段 5：归档 OpenSpec change 并交接 VerifiedPatchPackage。'],
  ['comet-hotfix', 'Comet 快速修复预设，适合小范围 bug fix，并保持 Agent4 产物链。'],
  ['comet-tweak', 'Comet 小改动预设，适合文案、配置和轻量调整，并保持 Agent4 产物链。'],
];

export const YSClawAgent4Plugin = async () => {
  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }

      config.agent = config.agent || {};
      config.agent['ysclaw-agent4-patch'] = mergeAgentConfig(
        defaultAgentConfig(),
        config.agent['ysclaw-agent4-patch']
      );

      config.command = config.command || {};
      config.command['ysclaw-patch-plan'] = mergeCommandConfig(
        defaultPatchPlanCommand(),
        config.command['ysclaw-patch-plan']
      );
      config.command['ysclaw-build-patch'] = mergeCommandConfig(
        defaultBuildPatchCommand(),
        config.command['ysclaw-build-patch']
      );
      config.command[agent4MainCommandName] = mergeCommandConfig(
        defaultAgent4MainCommand(),
        config.command[agent4MainCommandName]
      );
      for (const [commandName, description] of cometCommandDefaults) {
        config.command[commandName] = mergeCommandConfig(
          defaultCometCommand(commandName, description),
          config.command[commandName]
        );
      }
    },

    'shell.env': async (_input, output) => {
      output.env = output.env || {};
      output.env.PATH = prependPathEntries(
        output.env.PATH || process.env.PATH || '',
        [packageBinDir, opencodePackageBinDir]
      );
    },

    'command.execute.before': async (input, output) => {
      const commandName = normalizeCommandName(input.command);
      if (!isCometEntrypointCommand(commandName)) return;

      output.parts = output.parts || [];
      if (output.parts.some((part) => part.type === 'text' && part.text.includes('COMET_BOOTSTRAP'))) {
        return;
      }

      const cometBootstrap = getCometBootstrapContent();
      if (!cometBootstrap) return;

      output.parts.unshift({
        type: 'text',
        text: [
          cometBootstrap,
          `<YSCLAW_AGENT4_COMMAND_CONTEXT>
当前命令：/${commandName}

这是 Agent4 主流程命令。即使 OpenCode native skill 列表暂时没有显示 comet，本消息已经内嵌 comet 决策核心；不要回答“当前环境中没有 comet skill”后停止。先按内嵌决策核心继续，并在需要完整参考时读取已安装包中的 skills/comet/SKILL.md。

只有在以下条件同时成立时才停止并报告安装问题：
- OpenCode 配置中没有启用 ysclaw-agent4/opencode-agent4 插件；
- 重启 OpenCode 后仍无法发现本包 skills/；
- 当前项目或插件安装目录中也找不到 skills/comet/SKILL.md。
</YSCLAW_AGENT4_COMMAND_CONTEXT>`
        ].join('\n\n')
      });
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      if (!output.messages?.length) return;

      const firstUser = output.messages.find((message) => message.info?.role === 'user');
      if (!firstUser?.parts?.length) return;

      const hasAgent4Bootstrap = hasBootstrapMarker(firstUser, 'YSCLAW_AGENT4_BOOTSTRAP');
      const hasSuperpowersBootstrap = hasBootstrapMarker(firstUser, 'SUPERPOWERS_BOOTSTRAP');
      const hasCometBootstrap = hasBootstrapMarker(firstUser, 'COMET_BOOTSTRAP');
      if (hasAgent4Bootstrap && hasSuperpowersBootstrap && hasCometBootstrap) return;

      const bootstrapParts = [];
      if (!hasAgent4Bootstrap) {
        const agent4Bootstrap = getAgent4BootstrapContent();
        if (agent4Bootstrap) bootstrapParts.push(agent4Bootstrap);
      }
      if (!hasSuperpowersBootstrap) {
        const superpowersBootstrap = getSuperpowersBootstrapContent();
        if (superpowersBootstrap) bootstrapParts.push(superpowersBootstrap);
      }
      if (!hasCometBootstrap) {
        const cometBootstrap = getCometBootstrapContent();
        if (cometBootstrap) bootstrapParts.push(cometBootstrap);
      }
      if (!bootstrapParts.length) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrapParts.join('\n\n') });
    }
  };
};

export default YSClawAgent4Plugin;

function getAgent4BootstrapContent() {
  if (agent4BootstrapCache !== undefined) return agent4BootstrapCache;

  if (!fs.existsSync(agent4BootstrapSkillPath)) {
    agent4BootstrapCache = null;
    return agent4BootstrapCache;
  }

  const fullContent = fs.readFileSync(agent4BootstrapSkillPath, 'utf8');
  const content = stripFrontmatter(fullContent);

  agent4BootstrapCache = `<YSCLAW_AGENT4_BOOTSTRAP>
源生 Claw Agent4 扩展包已安装。

${content}

OpenCode 工具映射：
- 使用原生技能加载能力加载 Agent4 内置技能。
- 需要确定性的结构约束或补丁包操作时，使用 bash/node 调用 tools/ysclaw-agent4-tools.js。
- 保持 RootCauseBlueprint、PatchPlan、PatchCandidate、PatchRegressionResult 和 VerifiedPatchPackage 的结构约束边界。
</YSCLAW_AGENT4_BOOTSTRAP>`;

  return agent4BootstrapCache;
}

function getSuperpowersBootstrapContent() {
  if (superpowersBootstrapCache !== undefined) return superpowersBootstrapCache;

  if (!fs.existsSync(superpowersBootstrapSkillPath)) {
    superpowersBootstrapCache = null;
    return superpowersBootstrapCache;
  }

  const fullContent = fs.readFileSync(superpowersBootstrapSkillPath, 'utf8');
  const content = stripFrontmatter(fullContent);
  const toolMapping = [
    'OpenCode 工具映射：',
    '- `TodoWrite` -> `todowrite`',
    '- Claude Code `Task` 子代理 -> OpenCode 的子代理或 @mention 机制',
    '- Claude Code `Skill` -> OpenCode 原生 skill 工具',
    '- `Read`、`Write`、`Edit`、`Bash` -> OpenCode 原生文件和命令工具',
    '',
    '安装后的 Superpowers skills 与 Agent4 skills 位于同一个 skills 目录；优先遵守用户、AGENTS.md 和 Agent4 结构化交接约束。'
  ].join('\n');

  superpowersBootstrapCache = `<SUPERPOWERS_BOOTSTRAP>
Superpowers 方法论 skills 已安装。

重要：using-superpowers skill 内容已随本启动指引加载，不要再次加载 using-superpowers。

${content}

${toolMapping}
</SUPERPOWERS_BOOTSTRAP>`;

  return superpowersBootstrapCache;
}

function getCometBootstrapContent() {
  if (cometBootstrapCache !== undefined) return cometBootstrapCache;

  if (!fs.existsSync(cometBootstrapSkillPath)) {
    cometBootstrapCache = null;
    return cometBootstrapCache;
  }

  const fullContent = fs.readFileSync(cometBootstrapSkillPath, 'utf8');
  const content = extractSection(
    stripFrontmatter(fullContent),
    ['## Decision Core', '## 决策核心（Decision Core）'],
    ['## Reference Appendix', '## 参考附录（Reference Appendix）']
  );
  const toolMapping = [
    'OpenCode 工具映射：',
    '- 使用 OpenCode 原生技能加载 `comet` 和 `comet-*` skills。',
    '- Comet 脚本位于 `skills/comet/scripts/`，从仓库根目录运行时可由 `find . -path */comet/scripts/...` 找到。',
    '- 如果 OpenCode native skill 列表暂时没有 `comet`，但本 COMET_BOOTSTRAP 已加载，不要回答“当前环境中没有 comet skill”后停止；先按本指引继续，需要完整参考时读取已安装包中的 `skills/comet/SKILL.md`。',
    '- OpenSpec CLI 和 OpenSpec skills 随 `opencode-agent4` 一起安装；插件会把本包的 `node_modules/.bin` 加入 OpenCode shell PATH。',
    '- 如果本地源码路径安装后找不到 `openspec`，在 `opencode-agent4` 仓库运行 `npm install`，然后重启 OpenCode。',
    '- `/ysclaw-agent4` 是推荐的 Agent4 主入口，委托 `comet` skill 编排从需求打开、设计、计划、构建、验证到归档和交接的完整生命周期。',
    '- `/comet` 保留为 Comet 工作流入口和兼容入口，语义与 `/ysclaw-agent4` 的生命周期编排一致。',
    '- `/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 是 `/comet` 生命周期内可调用的补丁产物能力节点，用于约束 PatchPlan、PatchCandidate、PatchRegressionResult 和 VerifiedPatchPackage。',
    '',
    '生产路径默认从 `/ysclaw-agent4` 进入；只有调试单个结构化产物能力时，才单独调用 `/ysclaw-patch-plan` 或 `/ysclaw-build-patch`。'
  ].join('\n');

  cometBootstrapCache = `<COMET_BOOTSTRAP>
Comet 工作流已安装。

重要：comet skill 的决策核心已随本启动指引加载；需要完整参考、脚本路径或归档细节时再加载 comet skill。

${content}

${toolMapping}
</COMET_BOOTSTRAP>`;

  return cometBootstrapCache;
}

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1].trim() : content.trim();
}

function extractSection(content, startHeadings, endHeadings) {
  const start = findFirstHeadingIndex(content, startHeadings);
  if (start === -1) return content;

  const end = findFirstHeadingIndex(content, endHeadings, start);
  if (end === -1) return content.slice(start).trim();
  return content.slice(start, end).trim();
}

function findFirstHeadingIndex(content, headings, offset = 0) {
  const indexes = headings
    .map((heading) => content.indexOf(heading, offset))
    .filter((index) => index !== -1);
  return indexes.length > 0 ? Math.min(...indexes) : -1;
}

function hasBootstrapMarker(message, marker) {
  return message.parts.some(
    (part) => part.type === 'text' && part.text.includes(marker)
  );
}

function normalizeCommandName(commandName) {
  return String(commandName || '').trim().replace(/^\/+/, '');
}

function isCometEntrypointCommand(commandName) {
  if (commandName === agent4MainCommandName) return true;
  return cometCommandDefaults.some(([name]) => name === commandName);
}

function defaultAgentConfig() {
  return {
    description: '源生 Claw Agent4：计划优先的补丁生产与回归验证。',
    mode: 'primary',
    color: 'info',
    prompt: [
      '你是源生 Claw Agent4。',
      '你的职责是将 RootCauseBlueprint 输入转换为 PatchPlan 输出，协调候选补丁，要求回归证据，并为 Agent5 产出 VerifiedPatchPackage 产物。',
      '`/ysclaw-agent4` 是推荐主入口，委托 `comet` skill 使用 OpenSpec + Superpowers 编排 Agent4 的完整生命周期；`/comet` 保留为兼容入口。',
      '始终分离计划生成和代码修改；在 `/comet-build` 中需要 PatchPlan 时调用或约束 `/ysclaw-patch-plan`，需要候选补丁和补丁包时调用或约束 `/ysclaw-build-patch`。',
      '优先使用内置的 ysclaw-agent4 技能和工具。保持结构化输出。',
    ].join('\n'),
    permission: {
      read: 'allow',
      list: 'allow',
      grep: 'allow',
      glob: 'allow',
      edit: 'ask',
      bash: {
        git: 'allow',
        node: 'allow',
        npm: 'ask',
        agent1: 'ask',
        '*': 'ask'
      },
      task: 'ask',
      webfetch: 'deny',
      websearch: 'deny',
      external_directory: 'ask'
    }
  };
}

function defaultPatchPlanCommand() {
  return {
    description: '在不修改代码的前提下，根据 RootCauseBlueprint 生成 PatchPlan。',
    agent: 'ysclaw-agent4-patch',
    template: [
      '使用 ysclaw-root-cause-blueprint-reader 和 ysclaw-patch-plan-writer 技能。',
      '读取给定的 RootCauseBlueprint，按 schemas/root-cause-blueprint.schema.json 校验，并输出 PatchPlan JSON 对象。',
      '此命令不得修改仓库代码。'
    ].join('\n')
  };
}

function defaultBuildPatchCommand() {
  return {
    description: '根据已确认的 PatchPlan 构建候选补丁，并打包回归证据。',
    agent: 'ysclaw-agent4-patch',
    template: [
      '使用 ysclaw-patch-plan-writer、ysclaw-regression-verifier 和 ysclaw-verified-patch-package-writer 技能。',
      '确认 PatchPlan，在构建模式中修改代码，捕获 git 差异，运行或导入 Agent1 patch_regression，并输出 VerifiedPatchPackage JSON 对象。'
    ].join('\n')
  };
}

function defaultAgent4MainCommand() {
  return {
    description: 'Agent4 推荐主入口，委托 Comet 编排完整研发、验证和交接生命周期。',
    agent: 'ysclaw-agent4-patch',
    template: [
      '使用 comet skill。',
      '`/ysclaw-agent4` 是 Agent4 推荐主入口；它委托 Comet / OpenSpec + Superpowers 工作流驱动完整生命周期。',
      '从 RootCauseBlueprint 开始，依次约束 PatchPlan、PatchCandidate、PatchRegressionResult 和 VerifiedPatchPackage。',
      '`/comet` 保留为相同生命周期编排能力的兼容入口；`/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 仍只是结构化产物能力节点。',
      'OpenSpec CLI 和 OpenSpec skills 随插件安装；若不可用，应停止并提示执行 npm install / 重启 OpenCode，不要用普通对话伪造 OpenSpec 产物。'
    ].join('\n')
  };
}

function defaultCometCommand(commandName, description) {
  return {
    description,
    agent: 'ysclaw-agent4-patch',
    template: [
      `使用 ${commandName} skill。`,
      '这是 Agent4 的 Comet / OpenSpec + Superpowers 核心研发工作流入口，负责驱动完整生命周期；推荐对外主入口是 `/ysclaw-agent4`。',
      '在 build、verify、archive 阶段保持 Agent4 产物链：RootCauseBlueprint、PatchPlan、PatchCandidate、PatchRegressionResult 和 VerifiedPatchPackage。',
      '`/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 是该生命周期内的结构化产物能力节点，不是与 `/comet` 平级竞争的主流程。',
      'OpenSpec CLI 和 OpenSpec skills 随插件安装；若不可用，应停止并提示执行 npm install / 重启 OpenCode，不要用普通对话伪造 OpenSpec 产物。'
    ].join('\n')
  };
}

function prependPathEntries(currentPath, entries) {
  const existingEntries = currentPath ? currentPath.split(path.delimiter).filter(Boolean) : [];
  const prependedEntries = [];
  const prepended = new Set();

  for (const entry of entries) {
    const normalized = normalizePathForComparison(entry);
    if (prepended.has(normalized)) continue;
    prependedEntries.push(entry);
    prepended.add(normalized);
  }

  const remainingEntries = existingEntries.filter(
    (entry) => !prepended.has(normalizePathForComparison(entry))
  );
  return [...prependedEntries, ...remainingEntries].join(path.delimiter);
}

function normalizePathForComparison(entry) {
  return path.resolve(entry);
}

function mergeAgentConfig(defaultConfig, existingConfig = {}) {
  return {
    ...defaultConfig,
    ...existingConfig,
    permission: mergePermissionConfig(defaultConfig.permission, existingConfig.permission)
  };
}

function mergePermissionConfig(defaultPermission, existingPermission = {}) {
  if (typeof existingPermission === 'string') {
    return { ...defaultPermission };
  }

  return {
    ...defaultPermission,
    ...existingPermission,
    bash: {
      ...(typeof defaultPermission.bash === 'object' ? defaultPermission.bash : {}),
      ...(typeof existingPermission.bash === 'object' ? existingPermission.bash : {})
    }
  };
}

function mergeCommandConfig(defaultConfig, existingConfig = {}) {
  return {
    ...defaultConfig,
    ...existingConfig,
    agent: existingConfig.agent || defaultConfig.agent
  };
}
