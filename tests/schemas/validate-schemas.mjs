import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  createPatchCandidateFromDiff,
  createPatchPlanFromBlueprint,
  createVerifiedPatchPackage,
  loadJsonFile,
  validateBySchemaName,
} from '../../tools/ysclaw-agent4-tools.js';

const root = new URL('../..', import.meta.url).pathname;

const blueprint = await loadJsonFile(join(root, 'tests/fixtures/root-cause-blueprint.valid.json'));
const regression = await loadJsonFile(join(root, 'tests/fixtures/patch-regression-result.pass.json'));

assertValid('root-cause-blueprint', blueprint);
assertValid('patch-regression-result', regression);

const plan = createPatchPlanFromBlueprint(blueprint, { generatedAt: '2026-05-24T03:10:00Z' });
assertValid('patch-plan', plan);

const diff = await readFile(new URL('../fixtures/sample.diff', import.meta.url), 'utf8').catch(() => {
  return 'diff --git a/src/matmul.c b/src/matmul.c\n--- a/src/matmul.c\n+++ b/src/matmul.c\n@@ -1 +1 @@\n-old\n+new\n';
});
const candidate = createPatchCandidateFromDiff(plan, diff, { generatedAt: '2026-05-24T03:20:00Z' });
assertValid('patch-candidate', candidate);

const verifiedPackage = createVerifiedPatchPackage({
  blueprint,
  patchPlan: plan,
  patchCandidate: candidate,
  regressionResult: regression,
  generatedAt: '2026-05-24T03:30:00Z',
});
assertValid('verified-patch-package', verifiedPackage);

const invalidPackage = {
  ...verifiedPackage,
  blueprint: {},
  patchPlan: {},
  patchCandidate: {},
  regressionResult: {}
};
const invalidResult = validateBySchemaName('verified-patch-package', invalidPackage, join(root, 'schemas'));
if (invalidResult.valid) {
  throw new Error('verified-patch-package 结构约束接受了空的嵌入产物');
}

const newlineCommandBlueprint = {
  ...blueprint,
  validation: {
    ...blueprint.validation,
    regressionCommand: 'agent1 patch_regression\nrm -rf /'
  }
};
const newlineCommandResult = validateBySchemaName('root-cause-blueprint', newlineCommandBlueprint, join(root, 'schemas'));
if (newlineCommandResult.valid) {
  throw new Error('root-cause-blueprint 结构约束接受了换行命令注入');
}

console.log('结构约束校验测试通过。');

function assertValid(schemaName, value) {
  const result = validateBySchemaName(schemaName, value, join(root, 'schemas'));
  if (!result.valid) {
    throw new Error(`${schemaName} 校验失败：\n${result.errors.join('\n')}`);
  }
}
