import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '../..');
const skillsDir = path.join(packageRoot, 'skills');
const bootstrapSkillPath = path.join(skillsDir, 'using-ysclaw-agent4', 'SKILL.md');

let bootstrapCache = undefined;

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
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages?.length) return;

      const firstUser = output.messages.find((message) => message.info?.role === 'user');
      if (!firstUser?.parts?.length) return;

      const alreadyInjected = firstUser.parts.some(
        (part) => part.type === 'text' && part.text.includes('YSCLAW_AGENT4_BOOTSTRAP')
      );
      if (alreadyInjected) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    }
  };
};

export default YSClawAgent4Plugin;

function getBootstrapContent() {
  if (bootstrapCache !== undefined) return bootstrapCache;

  if (!fs.existsSync(bootstrapSkillPath)) {
    bootstrapCache = null;
    return bootstrapCache;
  }

  const fullContent = fs.readFileSync(bootstrapSkillPath, 'utf8');
  const content = stripFrontmatter(fullContent);

  bootstrapCache = `<YSCLAW_AGENT4_BOOTSTRAP>
源生 Claw Agent4 扩展包已安装。

${content}

OpenCode 工具映射：
- 使用原生技能加载能力加载 Agent4 内置技能。
- 需要确定性的结构约束或补丁包操作时，使用 bash/node 调用 tools/ysclaw-agent4-tools.js。
- 保持 RootCauseBlueprint、PatchPlan、PatchCandidate、PatchRegressionResult 和 VerifiedPatchPackage 的结构约束边界。
</YSCLAW_AGENT4_BOOTSTRAP>`;

  return bootstrapCache;
}

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1].trim() : content.trim();
}

function defaultAgentConfig() {
  return {
    description: '源生 Claw Agent4：计划优先的补丁生产与回归验证。',
    mode: 'primary',
    color: 'info',
    prompt: [
      '你是源生 Claw Agent4。',
      '你的职责是将 RootCauseBlueprint 输入转换为 PatchPlan 输出，协调候选补丁，要求回归证据，并为 Agent5 产出 VerifiedPatchPackage 产物。',
      '始终分离计划生成和代码修改。/ysclaw-patch-plan 不能修改代码。/ysclaw-build-patch 只能在 PatchPlan 确认后修改代码。',
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
