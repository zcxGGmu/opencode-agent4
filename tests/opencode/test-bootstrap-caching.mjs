import fs from 'fs';
import { pathToFileURL } from 'url';

const [, , pluginPath] = process.argv;

if (!pluginPath) {
  console.error('用法：node test-bootstrap-caching.mjs 插件路径');
  process.exit(2);
}

let existsCount = 0;
let readCount = 0;

const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;

fs.existsSync = function (...args) {
  if (isBootstrapSkillPath(args[0])) existsCount += 1;
  return originalExistsSync.apply(this, args);
};

fs.readFileSync = function (...args) {
  if (isBootstrapSkillPath(args[0])) readCount += 1;
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
const first = { existsCount, readCount, bootstrapParts: countBootstrapParts(firstOutput) };

const secondOutput = makeOutput('第二条消息');
await transform({}, secondOutput);
const second = { existsCount, readCount, bootstrapParts: countBootstrapParts(secondOutput) };

const duplicateOutput = makeOutput('第三条消息');
await transform({}, duplicateOutput);
await transform({}, duplicateOutput);
const duplicateParts = countBootstrapParts(duplicateOutput);

const failures = [];
if (first.bootstrapParts !== 1) failures.push(`期望第一次 transform 注入一个启动指引，实际为 ${first.bootstrapParts}`);
if (second.bootstrapParts !== 1) failures.push(`期望第二次 transform 注入一个启动指引，实际为 ${second.bootstrapParts}`);
if (duplicateParts !== 1) failures.push(`期望重复 transform 保留一个启动指引，实际为 ${duplicateParts}`);
if (first.existsCount !== 1) failures.push(`期望第一次 transform 检查启动指引一次，实际为 ${first.existsCount}`);
if (first.readCount !== 1) failures.push(`期望第一次 transform 读取启动指引一次，实际为 ${first.readCount}`);
if (second.existsCount !== first.existsCount) failures.push('期望缓存后的第二次 transform 跳过 exists 检查');
if (second.readCount !== first.readCount) failures.push('期望缓存后的第二次 transform 跳过读取');

if (failures.length > 0) {
  console.error(JSON.stringify({ first, second, duplicateParts }, null, 2));
  for (const failure of failures) console.error(`失败：${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({ first, second, duplicateParts }, null, 2));

function isBootstrapSkillPath(filePath) {
  return String(filePath).replaceAll('\\', '/').includes('using-ysclaw-agent4/SKILL.md');
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
  return output.messages[0].parts.filter(
    (part) => part.type === 'text' && part.text.includes('YSCLAW_AGENT4_BOOTSTRAP')
  ).length;
}
