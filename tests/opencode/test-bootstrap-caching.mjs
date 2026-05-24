import fs from 'fs';
import { pathToFileURL } from 'url';

const [, , pluginPath] = process.argv;

if (!pluginPath) {
  console.error('Usage: node test-bootstrap-caching.mjs PLUGIN_PATH');
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
  throw new Error('plugin must expose experimental.chat.messages.transform');
}

const firstOutput = makeOutput('first message');
await transform({}, firstOutput);
const first = { existsCount, readCount, bootstrapParts: countBootstrapParts(firstOutput) };

const secondOutput = makeOutput('second message');
await transform({}, secondOutput);
const second = { existsCount, readCount, bootstrapParts: countBootstrapParts(secondOutput) };

const duplicateOutput = makeOutput('third message');
await transform({}, duplicateOutput);
await transform({}, duplicateOutput);
const duplicateParts = countBootstrapParts(duplicateOutput);

const failures = [];
if (first.bootstrapParts !== 1) failures.push(`expected first transform to inject one bootstrap, got ${first.bootstrapParts}`);
if (second.bootstrapParts !== 1) failures.push(`expected second transform to inject one bootstrap, got ${second.bootstrapParts}`);
if (duplicateParts !== 1) failures.push(`expected duplicate transform to keep one bootstrap, got ${duplicateParts}`);
if (first.existsCount !== 1) failures.push(`expected first transform to check bootstrap once, got ${first.existsCount}`);
if (first.readCount !== 1) failures.push(`expected first transform to read bootstrap once, got ${first.readCount}`);
if (second.existsCount !== first.existsCount) failures.push('expected cached second transform to skip exists checks');
if (second.readCount !== first.readCount) failures.push('expected cached second transform to skip reads');

if (failures.length > 0) {
  console.error(JSON.stringify({ first, second, duplicateParts }, null, 2));
  for (const failure of failures) console.error(`FAIL: ${failure}`);
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
