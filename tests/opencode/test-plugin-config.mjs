import assert from 'node:assert/strict';
import { YSClawAgent4Plugin } from '../../.opencode/plugins/ysclaw-agent4.js';

const plugin = await YSClawAgent4Plugin({});

const config = {
  skills: { paths: [] },
  agent: {
    'ysclaw-agent4-patch': {
      prompt: '从 markdown 加载的既有提示词。',
      permission: {
        bash: {
          make: 'allow'
        }
      }
    }
  },
  command: {
    'ysclaw-patch-plan': {
      template: '既有补丁计划命令模板。'
    },
    'ysclaw-build-patch': {
      template: '既有构建命令模板。',
      agent: 'custom-agent'
    },
    comet: {
      template: '既有 Comet 主入口模板。',
      agent: 'workflow-agent'
    }
  }
};

await plugin.config(config);

assert.equal(config.skills.paths.length, 1);
assert.ok(config.skills.paths[0].replaceAll('\\', '/').endsWith('/skills'));
await plugin.config(config);
assert.equal(config.skills.paths.length, 1);

const agent = config.agent['ysclaw-agent4-patch'];
assert.equal(agent.prompt, '从 markdown 加载的既有提示词。');
assert.equal(agent.permission.read, 'allow');
assert.equal(agent.permission.edit, 'ask');
assert.equal(agent.permission.websearch, 'deny');
assert.equal(agent.permission.bash.git, 'allow');
assert.equal(agent.permission.bash.node, 'allow');
assert.equal(agent.permission.bash.make, 'allow');

assert.equal(config.command['ysclaw-patch-plan'].template, '既有补丁计划命令模板。');
assert.equal(config.command['ysclaw-patch-plan'].agent, 'ysclaw-agent4-patch');
assert.equal(config.command['ysclaw-build-patch'].agent, 'custom-agent');
assert.equal(config.command.comet.template, '既有 Comet 主入口模板。');
assert.equal(config.command.comet.agent, 'workflow-agent');
assert.equal(config.command['comet-open'].agent, 'ysclaw-agent4-patch');
assert.ok(config.command['comet-open'].template.includes('comet-open'));
assert.equal(config.command['comet-build'].agent, 'ysclaw-agent4-patch');
assert.ok(config.command['comet-build'].template.includes('comet-build'));
assert.match(config.command['comet-build'].template, /核心研发工作流入口/);
assert.match(config.command['comet-build'].template, /PatchPlan/);
assert.match(config.command['comet-build'].template, /PatchCandidate/);
assert.match(config.command['comet-build'].template, /结构化产物能力节点/);
assert.doesNotMatch(config.command['comet-build'].template, /当前 Agent4 项目开发用/);
assert.doesNotMatch(config.command['comet-build'].template, /执行 Agent4 补丁链路时，仍使用/);
assert.equal(config.command['comet-tweak'].agent, 'ysclaw-agent4-patch');
assert.ok(config.command['comet-tweak'].template.includes('comet-tweak'));

const scalarPermissionConfig = {
  agent: {
    'ysclaw-agent4-patch': {
      permission: 'allow'
    }
  },
  command: {}
};

await plugin.config(scalarPermissionConfig);
assert.equal(scalarPermissionConfig.agent['ysclaw-agent4-patch'].permission.edit, 'ask');
assert.equal(scalarPermissionConfig.agent['ysclaw-agent4-patch'].permission.websearch, 'deny');
assert.equal(scalarPermissionConfig.agent['ysclaw-agent4-patch'].permission.bash.git, 'allow');

const defaultConfig = {};
await plugin.config(defaultConfig);
assert.match(defaultConfig.agent['ysclaw-agent4-patch'].prompt, /`\/comet` 是你的核心研发工作流入口/);
assert.match(defaultConfig.agent['ysclaw-agent4-patch'].prompt, /\/ysclaw-patch-plan/);
assert.match(defaultConfig.agent['ysclaw-agent4-patch'].prompt, /\/ysclaw-build-patch/);
assert.doesNotMatch(defaultConfig.agent['ysclaw-agent4-patch'].prompt, /开发当前 Agent4 项目的非琐碎变更/);
assert.match(defaultConfig.command.comet.description, /核心研发工作流入口/);
assert.match(defaultConfig.command.comet.template, /不?是与 `\/comet` 平级竞争的主流程/);

console.log('插件配置合并测试通过。');
