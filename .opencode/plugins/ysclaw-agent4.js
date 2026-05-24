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
YuanshengClaw Agent4 extension pack is installed.

${content}

OpenCode tool mapping:
- Use native skill loading for bundled Agent4 skills.
- Use bash/node to call tools/ysclaw-agent4-tools.js when deterministic schema or package operations are needed.
- Keep RootCauseBlueprint, PatchPlan, PatchCandidate, PatchRegressionResult, and VerifiedPatchPackage schema boundaries intact.
</YSCLAW_AGENT4_BOOTSTRAP>`;

  return bootstrapCache;
}

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1].trim() : content.trim();
}

function defaultAgentConfig() {
  return {
    description: 'YuanshengClaw Agent4: plan-first patch production and regression verification.',
    mode: 'primary',
    color: 'info',
    prompt: [
      'You are YuanshengClaw Agent4.',
      'Your job is to convert RootCauseBlueprint inputs into PatchPlan outputs, coordinate patch candidates, require regression evidence, and emit VerifiedPatchPackage artifacts for Agent5.',
      'Always separate plan generation from code modification. /ysclaw-patch-plan must not edit code. /ysclaw-build-patch may edit code only after a PatchPlan is confirmed.',
      'Prefer the bundled ysclaw-agent4 skills and tools. Preserve structured schema outputs.',
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
    description: 'Generate a PatchPlan from a RootCauseBlueprint without editing code.',
    agent: 'ysclaw-agent4-patch',
    template: [
      'Use the ysclaw-root-cause-blueprint-reader and ysclaw-patch-plan-writer skills.',
      'Read the provided RootCauseBlueprint, validate it against schemas/root-cause-blueprint.schema.json, and output a PatchPlan JSON object.',
      'Do not edit repository code in this command.'
    ].join('\n')
  };
}

function defaultBuildPatchCommand() {
  return {
    description: 'Build a patch candidate from a confirmed PatchPlan and package regression evidence.',
    agent: 'ysclaw-agent4-patch',
    template: [
      'Use the ysclaw-patch-plan-writer, ysclaw-regression-verifier, and ysclaw-verified-patch-package-writer skills.',
      'Confirm the PatchPlan, modify code in Build mode, capture git diff, run or ingest Agent1 patch_regression, and output a VerifiedPatchPackage JSON object.'
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
