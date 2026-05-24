import assert from 'node:assert/strict';
import { YSClawAgent4Plugin } from '../../.opencode/plugins/ysclaw-agent4.js';

const plugin = await YSClawAgent4Plugin({});

const config = {
  skills: { paths: [] },
  agent: {
    'ysclaw-agent4-patch': {
      prompt: 'Existing prompt loaded from markdown.',
      permission: {
        bash: {
          make: 'allow'
        }
      }
    }
  },
  command: {
    'ysclaw-patch-plan': {
      template: 'Existing patch plan command template.'
    },
    'ysclaw-build-patch': {
      template: 'Existing build command template.',
      agent: 'custom-agent'
    }
  }
};

await plugin.config(config);

const agent = config.agent['ysclaw-agent4-patch'];
assert.equal(agent.prompt, 'Existing prompt loaded from markdown.');
assert.equal(agent.permission.read, 'allow');
assert.equal(agent.permission.edit, 'ask');
assert.equal(agent.permission.websearch, 'deny');
assert.equal(agent.permission.bash.git, 'allow');
assert.equal(agent.permission.bash.node, 'allow');
assert.equal(agent.permission.bash.make, 'allow');

assert.equal(config.command['ysclaw-patch-plan'].template, 'Existing patch plan command template.');
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

console.log('Plugin config merge tests passed.');
