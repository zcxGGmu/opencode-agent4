import fs from 'fs';
import { pathToFileURL } from 'url';

const [, , pluginPath] = process.argv;

if (!pluginPath) {
  console.error('用法：node test-bootstrap-caching.mjs 插件路径');
  process.exit(2);
}

const bootstrapCounts = {
  agent4: { exists: 0, reads: 0 },
  superpowers: { exists: 0, reads: 0 },
  comet: { exists: 0, reads: 0 },
};

const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;

fs.existsSync = function (...args) {
  const bootstrapType = getBootstrapSkillType(args[0]);
  if (bootstrapType) bootstrapCounts[bootstrapType].exists += 1;
  return originalExistsSync.apply(this, args);
};

fs.readFileSync = function (...args) {
  const bootstrapType = getBootstrapSkillType(args[0]);
  if (bootstrapType) bootstrapCounts[bootstrapType].reads += 1;
  return originalReadFileSync.apply(this, args);
};

const mod = await import(pathToFileURL(pluginPath).href);
const pluginFactory = mod.YSClawAgent4Plugin || mod.default;
const plugin = await pluginFactory({ client: {}, directory: '.', worktree: '.' });
const transform = plugin['experimental.chat.messages.transform'];

if (typeof transform !== 'function') {
  throw new Error('插件必须暴露 experimental.chat.messages.transform');
}

const firstOutput = makeOutput('第一条消息');
await transform({}, firstOutput);
const first = snapshotCounts(firstOutput);
const cometBootstrapText = firstOutput.messages[0].parts.find(
  (part) => part.type === 'text' && part.text.includes('COMET_BOOTSTRAP')
)?.text.match(/<COMET_BOOTSTRAP>[\s\S]*?<\/COMET_BOOTSTRAP>/)?.[0] || '';

const secondOutput = makeOutput('第二条消息');
await transform({}, secondOutput);
const second = snapshotCounts(secondOutput);

const duplicateOutput = makeOutput('第三条消息');
await transform({}, duplicateOutput);
await transform({}, duplicateOutput);
const duplicateParts = countBootstrapParts(duplicateOutput);

const failures = [];
if (first.agent4BootstrapParts !== 1) failures.push(`期望第一次 transform 注入一个 Agent4 启动指引，实际为 ${first.agent4BootstrapParts}`);
if (first.superpowersBootstrapParts !== 1) failures.push(`期望第一次 transform 注入一个 Superpowers 启动指引，实际为 ${first.superpowersBootstrapParts}`);
if (first.cometBootstrapParts !== 1) failures.push(`期望第一次 transform 注入一个 Comet 启动指引，实际为 ${first.cometBootstrapParts}`);
if (!cometBootstrapText.includes('决策核心')) failures.push('期望 Comet bootstrap 包含决策核心');
if (!cometBootstrapText.includes('/ysclaw-agent4')) failures.push('期望 Comet bootstrap 提到 /ysclaw-agent4 推荐主入口');
if (!cometBootstrapText.includes('推荐的 Agent4 主入口')) failures.push('期望 Comet bootstrap 将 /ysclaw-agent4 定位为推荐主入口');
if (!cometBootstrapText.includes('完整生命周期')) failures.push('期望 Comet bootstrap 说明主入口编排完整生命周期');
if (!cometBootstrapText.includes('/ysclaw-patch-plan')) failures.push('期望 Comet bootstrap 提到 /ysclaw-patch-plan 产物能力节点');
if (!cometBootstrapText.includes('/ysclaw-build-patch')) failures.push('期望 Comet bootstrap 提到 /ysclaw-build-patch 产物能力节点');
if (!cometBootstrapText.includes('补丁产物能力节点')) failures.push('期望 Comet bootstrap 将 /ysclaw-* 定位为补丁产物能力节点');
if (cometBootstrapText.includes('## 参考附录')) failures.push('Comet bootstrap 不应包含参考附录');
if (cometBootstrapText.includes('### 脚本定位')) failures.push('Comet bootstrap 不应包含脚本定位说明');
if (cometBootstrapText.includes('当前 Agent4 项目开发用')) failures.push('Comet bootstrap 不应把 /comet 描述为当前 Agent4 项目开发用入口');
if (cometBootstrapText.includes('管理开发 Agent4 项目')) failures.push('Comet bootstrap 不应把 /comet 限定为管理开发 Agent4 项目');
if (cometBootstrapText.includes('当用户要求执行 Agent4 补丁链路时，仍使用')) failures.push('Comet bootstrap 不应把 /ysclaw-* 描述为平级补丁链路入口');
if (cometBootstrapText.length > 7000) failures.push(`Comet bootstrap 过长：${cometBootstrapText.length}`);
if (second.agent4BootstrapParts !== 1) failures.push(`期望第二次 transform 注入一个 Agent4 启动指引，实际为 ${second.agent4BootstrapParts}`);
if (second.superpowersBootstrapParts !== 1) failures.push(`期望第二次 transform 注入一个 Superpowers 启动指引，实际为 ${second.superpowersBootstrapParts}`);
if (second.cometBootstrapParts !== 1) failures.push(`期望第二次 transform 注入一个 Comet 启动指引，实际为 ${second.cometBootstrapParts}`);
if (duplicateParts.agent4 !== 1) failures.push(`期望重复 transform 保留一个 Agent4 启动指引，实际为 ${duplicateParts.agent4}`);
if (duplicateParts.superpowers !== 1) failures.push(`期望重复 transform 保留一个 Superpowers 启动指引，实际为 ${duplicateParts.superpowers}`);
if (duplicateParts.comet !== 1) failures.push(`期望重复 transform 保留一个 Comet 启动指引，实际为 ${duplicateParts.comet}`);
if (first.counts.agent4.exists !== 1) failures.push(`期望第一次 transform 检查 Agent4 启动指引一次，实际为 ${first.counts.agent4.exists}`);
if (first.counts.agent4.reads !== 1) failures.push(`期望第一次 transform 读取 Agent4 启动指引一次，实际为 ${first.counts.agent4.reads}`);
if (first.counts.superpowers.exists !== 1) failures.push(`期望第一次 transform 检查 Superpowers 启动指引一次，实际为 ${first.counts.superpowers.exists}`);
if (first.counts.superpowers.reads !== 1) failures.push(`期望第一次 transform 读取 Superpowers 启动指引一次，实际为 ${first.counts.superpowers.reads}`);
if (first.counts.comet.exists !== 1) failures.push(`期望第一次 transform 检查 Comet 启动指引一次，实际为 ${first.counts.comet.exists}`);
if (first.counts.comet.reads !== 1) failures.push(`期望第一次 transform 读取 Comet 启动指引一次，实际为 ${first.counts.comet.reads}`);
if (second.counts.agent4.exists !== first.counts.agent4.exists) failures.push('期望缓存后的第二次 transform 跳过 Agent4 exists 检查');
if (second.counts.agent4.reads !== first.counts.agent4.reads) failures.push('期望缓存后的第二次 transform 跳过 Agent4 读取');
if (second.counts.superpowers.exists !== first.counts.superpowers.exists) failures.push('期望缓存后的第二次 transform 跳过 Superpowers exists 检查');
if (second.counts.superpowers.reads !== first.counts.superpowers.reads) failures.push('期望缓存后的第二次 transform 跳过 Superpowers 读取');
if (second.counts.comet.exists !== first.counts.comet.exists) failures.push('期望缓存后的第二次 transform 跳过 Comet exists 检查');
if (second.counts.comet.reads !== first.counts.comet.reads) failures.push('期望缓存后的第二次 transform 跳过 Comet 读取');

if (failures.length > 0) {
  console.error(JSON.stringify({ first, second, duplicateParts }, null, 2));
  for (const failure of failures) console.error(`失败：${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({ first, second, duplicateParts }, null, 2));

function getBootstrapSkillType(filePath) {
  const normalized = String(filePath).replaceAll('\\', '/');
  if (normalized.includes('using-ysclaw-agent4/SKILL.md')) return 'agent4';
  if (normalized.includes('using-superpowers/SKILL.md')) return 'superpowers';
  if (normalized.includes('comet/SKILL.md')) return 'comet';
  return null;
}

function makeOutput(text) {
  return {
    messages: [{
      info: { role: 'user' },
      parts: [{ type: 'text', text }],
    }],
  };
}

function countBootstrapParts(output) {
  const agent4 = output.messages[0].parts.filter(
    (part) => part.type === 'text' && part.text.includes('YSCLAW_AGENT4_BOOTSTRAP')
  ).length;
  const superpowers = output.messages[0].parts.filter(
    (part) => part.type === 'text' && part.text.includes('SUPERPOWERS_BOOTSTRAP')
  ).length;
  const comet = output.messages[0].parts.filter(
    (part) => part.type === 'text' && part.text.includes('COMET_BOOTSTRAP')
  ).length;
  return { agent4, superpowers, comet };
}

function snapshotCounts(output) {
  const bootstrapParts = countBootstrapParts(output);
  return {
    counts: JSON.parse(JSON.stringify(bootstrapCounts)),
    agent4BootstrapParts: bootstrapParts.agent4,
    superpowersBootstrapParts: bootstrapParts.superpowers,
    cometBootstrapParts: bootstrapParts.comet,
  };
}
