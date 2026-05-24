import assert from 'node:assert/strict';
import { join } from 'node:path';
import {
  createPatchCandidateFromDiff,
  createPatchPlanFromBlueprint,
  createVerifiedPatchPackage,
  extractChangedFilesFromDiff,
  loadJsonFile,
  normalizeRegressionResult,
  validateBySchemaName,
} from '../../tools/ysclaw-agent4-tools.js';

const root = new URL('../..', import.meta.url).pathname;
const blueprint = await loadJsonFile(join(root, 'tests/fixtures/root-cause-blueprint.valid.json'));
const regression = await loadJsonFile(join(root, 'tests/fixtures/patch-regression-result.pass.json'));

const plan = createPatchPlanFromBlueprint(blueprint, { generatedAt: '2026-05-24T03:10:00Z' });
assert.equal(plan.schemaVersion, 'ysclaw.patch_plan.v1');
assert.equal(plan.blueprintId, blueprint.blueprintId);
assert.equal(plan.changes[0].filePath, 'src/matmul.c');
assert.equal(plan.validationPlan.commands[0], 'agent1 patch_regression --case matmul-1024');
assert.equal(validateBySchemaName('patch-plan', plan, join(root, 'schemas')).valid, true);

assert.throws(
  () => createPatchPlanFromBlueprint({ ...blueprint, rootCause: { ...blueprint.rootCause, candidateFiles: [] } }),
  /root-cause-blueprint validation failed/
);
assert.throws(
  () => createPatchPlanFromBlueprint({
    ...blueprint,
    validation: {
      ...blueprint.validation,
      regressionCommand: 'agent1 patch_regression --case matmul-1024; rm -rf /'
    }
  }),
  /Unsafe regression command/
);
assert.throws(
  () => createPatchPlanFromBlueprint({
    ...blueprint,
    validation: {
      ...blueprint.validation,
      regressionCommand: 'agent1 patch_regression\nrm -rf /'
    }
  }),
  /Unsafe regression command/
);

const diff = [
  'diff --git a/src/matmul.c b/src/matmul.c',
  '--- a/src/matmul.c',
  '+++ b/src/matmul.c',
  '@@ -1 +1 @@',
  '-old',
  '+new',
].join('\n');
assert.deepEqual(extractChangedFilesFromDiff(diff), ['src/matmul.c']);

const candidate = createPatchCandidateFromDiff(plan, diff, { generatedAt: '2026-05-24T03:20:00Z' });
assert.equal(candidate.patchPlanId, plan.patchPlanId);
assert.deepEqual(candidate.changedFiles, ['src/matmul.c']);
assert.equal(validateBySchemaName('patch-candidate', candidate, join(root, 'schemas')).valid, true);
assert.throws(
  () => createPatchCandidateFromDiff(plan, ''),
  /patch-candidate validation failed/
);

const normalized = normalizeRegressionResult({
  patchCandidateId: candidate.patchCandidateId,
  command: 'agent1 patch_regression --case matmul-1024',
  status: 'pass',
  tests: [{ name: 'matmul-1024', status: 'pass' }],
});
assert.equal(normalized.schemaVersion, 'ysclaw.patch_regression_result.v1');
assert.equal(normalized.status, 'pass');

const verified = createVerifiedPatchPackage({
  blueprint,
  patchPlan: plan,
  patchCandidate: candidate,
  regressionResult: {
    ...regression,
    patchCandidateId: candidate.patchCandidateId
  },
  generatedAt: '2026-05-24T03:30:00Z',
});
assert.equal(verified.schemaVersion, 'ysclaw.verified_patch_package.v1');
assert.equal(verified.verification.status, 'verified');
assert.equal(verified.handoff.targetAgent, 'agent5');
assert.equal(verified.regressionResult.patchCandidateId, candidate.patchCandidateId);
assert.equal(validateBySchemaName('verified-patch-package', verified, join(root, 'schemas')).valid, true);

assert.throws(
  () => createVerifiedPatchPackage({
    blueprint,
    patchPlan: plan,
    patchCandidate: candidate,
    regressionResult: {
      ...regression,
      patchCandidateId: 'pc-stale-result-id'
    },
  }),
  /RegressionResult patchCandidateId does not match/
);

assert.throws(
  () => createVerifiedPatchPackage({
    blueprint: {},
    patchPlan: plan,
    patchCandidate: candidate,
    regressionResult: regression,
  }),
  /root-cause-blueprint validation failed/
);
assert.throws(
  () => createVerifiedPatchPackage({
    blueprint,
    patchPlan: { ...plan, blueprintId: 'bp-other' },
    patchCandidate: candidate,
    regressionResult: regression,
  }),
  /PatchPlan blueprintId does not match/
);
assert.throws(
  () => createVerifiedPatchPackage({
    blueprint,
    patchPlan: plan,
    patchCandidate: { ...candidate, patchPlanId: 'pp-other' },
    regressionResult: regression,
  }),
  /PatchCandidate patchPlanId does not match/
);

console.log('Agent4 tool tests passed.');
