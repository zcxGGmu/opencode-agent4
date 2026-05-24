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
if (second.agent4BootstrapParts !== 1) failures.push(`期望第二次 transform 注入一个 Agent4 启动指引，实际为 ${second.agent4BootstrapParts}`);
if (second.superpowersBootstrapParts !== 1) failures.push(`期望第二次 transform 注入一个 Superpowers 启动指引，实际为 ${second.superpowersBootstrapParts}`);
if (duplicateParts.agent4 !== 1) failures.push(`期望重复 transform 保留一个 Agent4 启动指引，实际为 ${duplicateParts.agent4}`);
if (duplicateParts.superpowers !== 1) failures.push(`期望重复 transform 保留一个 Superpowers 启动指引，实际为 ${duplicateParts.superpowers}`);
if (first.counts.agent4.exists !== 1) failures.push(`期望第一次 transform 检查 Agent4 启动指引一次，实际为 ${first.counts.agent4.exists}`);
if (first.counts.agent4.reads !== 1) failures.push(`期望第一次 transform 读取 Agent4 启动指引一次，实际为 ${first.counts.agent4.reads}`);
if (first.counts.superpowers.exists !== 1) failures.push(`期望第一次 transform 检查 Superpowers 启动指引一次，实际为 ${first.counts.superpowers.exists}`);
if (first.counts.superpowers.reads !== 1) failures.push(`期望第一次 transform 读取 Superpowers 启动指引一次，实际为 ${first.counts.superpowers.reads}`);
if (second.counts.agent4.exists !== first.counts.agent4.exists) failures.push('期望缓存后的第二次 transform 跳过 Agent4 exists 检查');
if (second.counts.agent4.reads !== first.counts.agent4.reads) failures.push('期望缓存后的第二次 transform 跳过 Agent4 读取');
if (second.counts.superpowers.exists !== first.counts.superpowers.exists) failures.push('期望缓存后的第二次 transform 跳过 Superpowers exists 检查');
if (second.counts.superpowers.reads !== first.counts.superpowers.reads) failures.push('期望缓存后的第二次 transform 跳过 Superpowers 读取');

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
  return { agent4, superpowers };
}

function snapshotCounts(output) {
  const bootstrapParts = countBootstrapParts(output);
  return {
    counts: JSON.parse(JSON.stringify(bootstrapCounts)),
    agent4BootstrapParts: bootstrapParts.agent4,
    superpowersBootstrapParts: bootstrapParts.superpowers,
  };
}
