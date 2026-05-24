import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const modulePath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(modulePath), '..');
const defaultSchemaDir = path.join(repoRoot, 'schemas');
const SAFE_REGRESSION_COMMAND_PATTERN = /^agent1[ \t]+patch_regression(?:[ \t]+[A-Za-z0-9_./:=,\-]+)*$/;
const SAFE_COMMAND_TOKEN_PATTERN = /^[A-Za-z0-9_./:=,\-]+$/;

export async function loadJsonFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export function loadJsonFileSync(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function validateBySchemaName(schemaName, value, schemaDir = defaultSchemaDir) {
  const schemaPath = path.join(schemaDir, `${schemaName}.schema.json`);
  const schema = loadJsonFileSync(schemaPath);
  return validateJson(schema, value);
}

export function validateJson(schema, value) {
  const errors = [];
  validateNode(schema, value, '$', errors);
  return { valid: errors.length === 0, errors };
}

export function createPatchPlanFromBlueprint(blueprint, options = {}) {
  const explicitRegressionCommand = blueprint.validation?.regressionCommand;
  if (explicitRegressionCommand) {
    assertSafeRegressionCommand(explicitRegressionCommand);
  }
  assertSchemaValid('root-cause-blueprint', blueprint);

  const generatedAt = options.generatedAt || new Date().toISOString();
  const candidateFiles = blueprint.rootCause.candidateFiles;
  const validationCommands = explicitRegressionCommand
    ? [explicitRegressionCommand]
    : blueprint.validation.requiredTests.map(formatRegressionCommandForTest);

  const plan = {
    schemaVersion: 'ysclaw.patch_plan.v1',
    patchPlanId: stableId('pp', blueprint.blueprintId),
    blueprintId: blueprint.blueprintId,
    createdAt: generatedAt,
    objective: blueprint.rootCause?.summary || blueprint.problem?.summary,
    changes: candidateFiles.map((filePath) => ({
      filePath,
      action: 'modify',
      rationale: blueprint.rootCause?.summary || 'Address the diagnosed root cause.',
      instructions: [
        'Inspect the file before editing.',
        'Make the smallest behavior-preserving performance fix that addresses the RootCauseBlueprint.',
        'Avoid unrelated refactors and formatting churn.'
      ],
      risk: blueprint.constraints?.riskLevel || 'medium'
    })),
    validationPlan: {
      regressionTarget: 'agent1 patch_regression',
      commands: validationCommands,
      requiredTests: blueprint.validation?.requiredTests || []
    },
    expectedDiffSummary: `Patch candidate should address blueprint ${blueprint.blueprintId} with focused changes in ${candidateFiles.join(', ')}.`
  };
  assertSchemaValid('patch-plan', plan);
  return plan;
}

export function extractChangedFilesFromDiff(diff) {
  const files = [];
  for (const line of String(diff).split(/\r?\n/)) {
    const match = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (!match) continue;
    const target = match[2];
    if (target !== '/dev/null' && !files.includes(target)) {
      files.push(target);
    }
  }
  return files;
}

export function createPatchCandidateFromDiff(patchPlan, diff, options = {}) {
  assertSchemaValid('patch-plan', patchPlan);

  const generatedAt = options.generatedAt || new Date().toISOString();
  const changedFiles = extractChangedFilesFromDiff(diff);
  const candidate = {
    schemaVersion: 'ysclaw.patch_candidate.v1',
    patchCandidateId: stableId('pc', patchPlan.blueprintId || patchPlan.patchPlanId),
    patchPlanId: patchPlan.patchPlanId,
    createdAt: generatedAt,
    changedFiles,
    gitDiff: diff,
    buildModeInvocation: options.buildModeInvocation || 'OpenCode Build mode',
    notes: options.notes || []
  };
  assertSchemaValid('patch-candidate', candidate);
  return candidate;
}

export function normalizeRegressionResult(input, options = {}) {
  const status = normalizeStatus(input.status);
  const patchCandidateId = input.patchCandidateId || options.patchCandidateId || 'unknown-candidate';
  const command = input.command || options.command || 'agent1 patch_regression';
  assertSafeRegressionCommand(command);

  const result = {
    schemaVersion: 'ysclaw.patch_regression_result.v1',
    regressionId: input.regressionId || stableId('reg', patchCandidateId),
    patchCandidateId,
    status,
    command,
    tests: Array.isArray(input.tests) ? input.tests.map(normalizeTestResult) : [],
    artifacts: Array.isArray(input.artifacts) ? input.artifacts : [],
    summary: input.summary || summarizeRegressionStatus(status)
  };
  assertSchemaValid('patch-regression-result', result);
  return result;
}

export function captureGitDiff(cwd = process.cwd()) {
  return execFileSync('git', ['diff', '--no-ext-diff'], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

export function createVerifiedPatchPackage({
  blueprint,
  patchPlan,
  patchCandidate,
  regressionResult,
  generatedAt,
}) {
  assertSchemaValid('root-cause-blueprint', blueprint);
  assertSchemaValid('patch-plan', patchPlan);
  assertSchemaValid('patch-candidate', patchCandidate);
  if (patchPlan.blueprintId !== blueprint.blueprintId) {
    throw new Error(`PatchPlan blueprintId does not match blueprint: ${patchPlan.blueprintId} !== ${blueprint.blueprintId}`);
  }
  if (patchCandidate.patchPlanId !== patchPlan.patchPlanId) {
    throw new Error(`PatchCandidate patchPlanId does not match PatchPlan: ${patchCandidate.patchPlanId} !== ${patchPlan.patchPlanId}`);
  }
  assertSchemaValid('patch-regression-result', regressionResult);
  if (regressionResult.patchCandidateId !== patchCandidate.patchCandidateId) {
    throw new Error(`RegressionResult patchCandidateId does not match PatchCandidate: ${regressionResult.patchCandidateId} !== ${patchCandidate.patchCandidateId}`);
  }

  const timestamp = generatedAt || new Date().toISOString();
  const normalizedRegression = normalizeRegressionResult(regressionResult);
  const status = normalizedRegression.status === 'pass' ? 'verified' : 'failed';

  const verifiedPackage = {
    schemaVersion: 'ysclaw.verified_patch_package.v1',
    packageId: stableId('vpp', patchCandidate.patchCandidateId),
    createdAt: timestamp,
    blueprintId: blueprint.blueprintId,
    patchPlanId: patchPlan.patchPlanId,
    patchCandidateId: patchCandidate.patchCandidateId,
    rootCauseSummary: blueprint.rootCause?.summary || blueprint.problem?.summary,
    patchSummary: patchPlan.expectedDiffSummary,
    blueprint,
    patchPlan,
    patchCandidate,
    regressionResult: normalizedRegression,
    verification: {
      status,
      verifiedAt: timestamp,
      commands: normalizedRegression.command ? [normalizedRegression.command] : [],
      artifacts: normalizedRegression.artifacts
    },
    handoff: {
      targetAgent: 'agent5',
      instructions: [
        'Use the git diff and regression evidence as the source of truth.',
        'Prepare PR and commit material without changing the verified patch content.',
        'Preserve the RootCauseBlueprint and regression evidence in the submission notes.'
      ]
    }
  };
  assertSchemaValid('verified-patch-package', verifiedPackage);
  return verifiedPackage;
}

export function assertSchemaValid(schemaName, value, schemaDir = defaultSchemaDir) {
  const result = validateBySchemaName(schemaName, value, schemaDir);
  if (!result.valid) {
    throw new Error(`${schemaName} validation failed:\n${result.errors.join('\n')}`);
  }
}

export function assertSafeRegressionCommand(command) {
  if (/[\r\n]/.test(String(command)) || !SAFE_REGRESSION_COMMAND_PATTERN.test(String(command))) {
    throw new Error(`Unsafe regression command: ${command}`);
  }
}

function validateNode(schema, value, pathLabel, errors) {
  if (!schema || typeof schema !== 'object') return;

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${pathLabel}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${pathLabel}: expected one of ${schema.enum.join(', ')}, got ${JSON.stringify(value)}`);
    return;
  }

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${pathLabel}: expected type ${formatType(schema.type)}, got ${actualType(value)}`);
    return;
  }

  if (schema.type === 'string' && typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${pathLabel}: expected minLength ${schema.minLength}`);
    }
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) {
      errors.push(`${pathLabel}: expected pattern ${schema.pattern}`);
    }
  }

  if (schema.type === 'array' && Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${pathLabel}: expected at least ${schema.minItems} items`);
    }
    if (schema.items) {
      value.forEach((item, index) => validateNode(schema.items, item, `${pathLabel}[${index}]`, errors));
    }
  }

  if (schema.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
    const required = schema.required || [];
    for (const key of required) {
      if (!(key in value)) {
        errors.push(`${pathLabel}.${key}: missing required property`);
      }
    }

    const properties = schema.properties || {};
    for (const [key, propertyValue] of Object.entries(value)) {
      if (properties[key]) {
        validateNode(properties[key], propertyValue, `${pathLabel}.${key}`, errors);
      } else if (schema.additionalProperties === false) {
        errors.push(`${pathLabel}.${key}: additional property is not allowed`);
      }
    }
  }
}

function matchesType(value, type) {
  if (Array.isArray(type)) return type.some((entry) => matchesType(value, entry));
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'null') return value === null;
  return typeof value === type;
}

function actualType(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
}

function formatType(type) {
  return Array.isArray(type) ? type.join('|') : type;
}

function stableId(prefix, value) {
  const normalized = String(value || 'generated')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${prefix}-${normalized || 'generated'}`;
}

function normalizeStatus(status) {
  if (['pass', 'fail', 'error'].includes(status)) return status;
  if (status === 'passed') return 'pass';
  if (status === 'failed') return 'fail';
  return 'error';
}

function normalizeTestResult(test) {
  return {
    name: String(test.name || 'unnamed-test'),
    status: normalizeStatus(test.status),
    ...(Number.isFinite(test.durationMs) ? { durationMs: test.durationMs } : {}),
    ...(test.output ? { output: String(test.output) } : {})
  };
}

function summarizeRegressionStatus(status) {
  if (status === 'pass') return 'Regression passed.';
  if (status === 'fail') return 'Regression failed.';
  return 'Regression errored.';
}

function formatRegressionCommandForTest(testcase) {
  if (!SAFE_COMMAND_TOKEN_PATTERN.test(String(testcase))) {
    throw new Error(`Unsafe regression testcase token: ${testcase}`);
  }
  return `agent1 patch_regression --case ${testcase}`;
}

async function main(argv) {
  const [command, ...args] = argv;
  if (!command || command === '--help') {
    printHelp();
    return;
  }

  if (command === 'validate') {
    const [schemaName, jsonPath] = args;
    const value = await loadJsonFile(jsonPath);
    const result = validateBySchemaName(schemaName, value);
    if (!result.valid) {
      console.error(result.errors.join('\n'));
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify({ valid: true }, null, 2));
    return;
  }

  if (command === 'plan') {
    const [blueprintPath, outputPath] = args;
    const blueprint = await loadJsonFile(blueprintPath);
    const plan = createPatchPlanFromBlueprint(blueprint);
    await writeJsonOutput(outputPath, plan);
    return;
  }

  if (command === 'candidate') {
    const [planPath, diffPath, outputPath] = args;
    const plan = await loadJsonFile(planPath);
    const diff = await readFile(diffPath, 'utf8');
    const candidate = createPatchCandidateFromDiff(plan, diff);
    await writeJsonOutput(outputPath, candidate);
    return;
  }

  if (command === 'normalize-regression') {
    const [inputPath, outputPath] = args;
    const input = await loadJsonFile(inputPath);
    await writeJsonOutput(outputPath, normalizeRegressionResult(input));
    return;
  }

  if (command === 'package') {
    const [blueprintPath, planPath, candidatePath, regressionPath, outputPath] = args;
    const verifiedPackage = createVerifiedPatchPackage({
      blueprint: await loadJsonFile(blueprintPath),
      patchPlan: await loadJsonFile(planPath),
      patchCandidate: await loadJsonFile(candidatePath),
      regressionResult: await loadJsonFile(regressionPath),
    });
    await writeJsonOutput(outputPath, verifiedPackage);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

async function writeJsonOutput(outputPath, value) {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  if (!outputPath || outputPath === '-') {
    process.stdout.write(text);
    return;
  }
  await writeFile(outputPath, text);
}

function printHelp() {
  console.log(`ysclaw-agent4-tools

Commands:
  validate SCHEMA_NAME JSON_PATH
  plan BLUEPRINT_JSON [OUTPUT_JSON|-]
  candidate PATCH_PLAN_JSON DIFF_PATH [OUTPUT_JSON|-]
  normalize-regression REGRESSION_JSON [OUTPUT_JSON|-]
  package BLUEPRINT_JSON PATCH_PLAN_JSON PATCH_CANDIDATE_JSON REGRESSION_JSON [OUTPUT_JSON|-]
`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
