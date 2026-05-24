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

console.log('插件配置合并测试通过。');
