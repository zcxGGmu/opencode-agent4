import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const cometSkills = [
  'comet',
  'comet-open',
  'comet-design',
  'comet-build',
  'comet-verify',
  'comet-archive',
  'comet-hotfix',
  'comet-tweak',
];
const cometScripts = [
  'comet-state.sh',
  'comet-guard.sh',
  'comet-handoff.sh',
  'comet-archive.sh',
  'comet-yaml-validate.sh',
];
const openspecSkills = [
  'openspec-explore',
  'openspec-propose',
  'openspec-new-change',
  'openspec-apply-change',
  'openspec-verify-change',
  'openspec-archive-change',
];

for (const skill of cometSkills) {
  const skillPath = path.join(repoRoot, 'skills', skill, 'SKILL.md');
  assert.ok(fs.existsSync(skillPath), `缺少 Comet skill: ${skill}`);
  assert.match(fs.readFileSync(skillPath, 'utf8'), new RegExp(`^name: ${skill}$`, 'm'));
}

for (const skill of openspecSkills) {
  const skillPath = path.join(repoRoot, 'skills', skill, 'SKILL.md');
  assert.ok(fs.existsSync(skillPath), `缺少 OpenSpec skill: ${skill}`);
  assert.match(fs.readFileSync(skillPath, 'utf8'), new RegExp(`^name: ${skill}$`, 'm'));
}

assert.match(readSkill('comet'), /RootCauseBlueprint[\s\S]*PatchPlan[\s\S]*PatchCandidate[\s\S]*PatchRegressionResult[\s\S]*VerifiedPatchPackage/);
assert.match(readSkill('comet'), /OpenSpec CLI 和 OpenSpec skills 随 `opencode-agent4` 一起安装/);
assert.match(readSkill('comet-build'), /RootCauseBlueprint[\s\S]*PatchPlan[\s\S]*PatchCandidate/);
assert.match(readSkill('comet-verify'), /PatchRegressionResult/);
assert.match(readSkill('comet-verify'), /openspec-verify-change/);
assert.match(readSkill('comet-archive'), /VerifiedPatchPackage[\s\S]*Agent5/);
assert.match(readSkill('comet-hotfix'), /不表示绕过 Agent4 产物链/);
assert.match(readSkill('comet-tweak'), /不表示绕过 Agent4 产物链/);

for (const script of cometScripts) {
  const scriptPath = path.join(repoRoot, 'skills', 'comet', 'scripts', script);
  assert.ok(fs.existsSync(scriptPath), `缺少 Comet 脚本: ${script}`);
  execFileSync('bash', ['-n', scriptPath], { stdio: 'pipe' });
}

assert.ok(
  fs.existsSync(path.join(repoRoot, 'skills', 'comet', 'reference', 'dirty-worktree.md')),
  '缺少 Comet 脏工作树协议',
);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent4-comet-'));
try {
  const stateScript = path.join(repoRoot, 'skills', 'comet', 'scripts', 'comet-state.sh');
  const guardScript = path.join(repoRoot, 'skills', 'comet', 'scripts', 'comet-guard.sh');
  const handoffScript = path.join(repoRoot, 'skills', 'comet', 'scripts', 'comet-handoff.sh');
  const validateScript = path.join(repoRoot, 'skills', 'comet', 'scripts', 'comet-yaml-validate.sh');
  const archiveScript = path.join(repoRoot, 'skills', 'comet', 'scripts', 'comet-archive.sh');

  runBash(tmpDir, stateScript, ['init', 'sample-change', 'full']);
  const phase = runBash(tmpDir, stateScript, ['get', 'sample-change', 'phase']).stdout.trim();
  assert.equal(phase, 'open');

  const blocked = runBash(tmpDir, guardScript, ['sample-change', 'open']);
  assert.notEqual(blocked.status, 0);
  assert.match(blocked.stderr, /proposal\.md exists and non-empty/);

  const changeDir = path.join(tmpDir, 'openspec', 'changes', 'sample-change');
  fs.writeFileSync(path.join(changeDir, 'proposal.md'), 'proposal\n');
  fs.writeFileSync(path.join(changeDir, 'design.md'), 'design\n');
  fs.writeFileSync(path.join(changeDir, 'tasks.md'), '- [ ] implement\n');
  fs.mkdirSync(path.join(tmpDir, 'docs', 'superpowers', 'specs'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'docs', 'superpowers', 'plans'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'docs', 'superpowers', 'reports'), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'docs', 'superpowers', 'specs', 'sample-design.md'), '---\ncomet_change: sample-change\nrole: technical-design\ncanonical_spec: openspec\n---\nbody\n');
  fs.writeFileSync(path.join(tmpDir, 'docs', 'superpowers', 'plans', 'sample-plan.md'), 'plan\n');
  fs.writeFileSync(path.join(tmpDir, 'docs', 'superpowers', 'reports', 'sample-verify.md'), 'report\n');

  const passed = runBash(tmpDir, guardScript, ['sample-change', 'open', '--apply']);
  assert.equal(passed.status, 0, passed.stderr);
  const nextPhase = runBash(tmpDir, stateScript, ['get', 'sample-change', 'phase']).stdout.trim();
  assert.equal(nextPhase, 'design');

  const handoff = runBash(tmpDir, handoffScript, ['sample-change', 'design', '--write']);
  assert.equal(handoff.status, 0, handoff.stderr);

  const designBlocked = runBash(tmpDir, guardScript, ['sample-change', 'design']);
  assert.notEqual(designBlocked.status, 0);
  assert.match(designBlocked.stderr, /design_doc is missing/i);

  const setSafeDesign = runBash(tmpDir, stateScript, [
    'set',
    'sample-change',
    'design_doc',
    'docs/superpowers/specs/sample-design.md',
  ]);
  assert.equal(setSafeDesign.status, 0, setSafeDesign.stderr);

  const safeYaml = runBash(tmpDir, validateScript, ['sample-change']);
  assert.equal(safeYaml.status, 0, safeYaml.stderr);

  const badYamlPath = path.join(tmpDir, 'openspec', 'changes', 'bad-change');
  fs.mkdirSync(badYamlPath, { recursive: true });
  fs.writeFileSync(
    path.join(badYamlPath, '.comet.yaml'),
    [
      'workflow: full',
      'phase: design',
      'design_doc: ../../outside.md',
      'plan: null',
      'build_mode: null',
      'isolation: null',
      'verify_mode: null',
      'verify_result: pending',
      'verification_report: null',
      'branch_status: pending',
      'verified_at: null',
      'archived: false',
      '',
    ].join('\n'),
  );
  const badYaml = runBash(tmpDir, validateScript, ['bad-change']);
  assert.notEqual(badYaml.status, 0);
  assert.match(badYaml.stderr, /design_doc/i);

  const commandYaml = path.join(tmpDir, 'openspec', 'changes', 'command-change');
  fs.mkdirSync(commandYaml, { recursive: true });
  fs.writeFileSync(
    path.join(commandYaml, '.comet.yaml'),
    [
      'workflow: full',
      'phase: build',
      'design_doc: docs/superpowers/specs/sample-design.md',
      'plan: docs/superpowers/plans/sample-plan.md',
      'build_mode: executing-plans',
      'isolation: branch',
      'verify_mode: full',
      'verify_result: pending',
      'verification_report: null',
      'branch_status: pending',
      'verified_at: null',
      'archived: false',
      'build_command: node -e "require(\'fs\').writeFileSync(\'blocked.txt\', \'x\')"',
      '',
    ].join('\n'),
  );
  const guardBlocked = runBash(tmpDir, guardScript, ['command-change', 'build']);
  assert.notEqual(guardBlocked.status, 0);
  assert.ok(!fs.existsSync(path.join(tmpDir, 'blocked.txt')));
  assert.match(guardBlocked.stderr, /COMET_ALLOW_CONFIGURED_COMMANDS/);

  const symlinkTarget = path.join(tmpDir, 'outside.md');
  fs.writeFileSync(symlinkTarget, 'outside\n');
  const symlinkPath = path.join(tmpDir, 'docs', 'superpowers', 'specs', 'escape.md');
  fs.symlinkSync(symlinkTarget, symlinkPath);
  const symlinkChange = path.join(tmpDir, 'openspec', 'changes', 'symlink-change');
  fs.mkdirSync(symlinkChange, { recursive: true });
  fs.writeFileSync(
    path.join(symlinkChange, '.comet.yaml'),
    [
      'workflow: full',
      'phase: design',
      `design_doc: ${path.relative(tmpDir, symlinkPath)}`,
      'plan: null',
      'build_mode: null',
      'isolation: null',
      'verify_mode: null',
      'verify_result: pending',
      'verification_report: null',
      'branch_status: pending',
      'verified_at: null',
      'archived: false',
      '',
    ].join('\n'),
  );
  const symlinkValidate = runBash(tmpDir, validateScript, ['symlink-change']);
  assert.notEqual(symlinkValidate.status, 0);

  writeArchiveChange(tmpDir, 'archive-missing-report', {
    verification_report: 'null',
    branch_status: 'handled',
  });
  const missingReportArchive = runBash(tmpDir, archiveScript, ['archive-missing-report', '--dry-run']);
  assert.notEqual(missingReportArchive.status, 0);
  assert.match(missingReportArchive.stderr, /verification_report/i);

  writeArchiveChange(tmpDir, 'archive-pending-branch', {
    verification_report: 'docs/superpowers/reports/sample-verify.md',
    branch_status: 'pending',
  });
  const pendingBranchArchive = runBash(tmpDir, archiveScript, ['archive-pending-branch', '--dry-run']);
  assert.notEqual(pendingBranchArchive.status, 0);
  assert.match(pendingBranchArchive.stderr, /branch_status/i);

  const mainSpecDir = path.join(tmpDir, 'openspec', 'specs', 'billing');
  fs.mkdirSync(mainSpecDir, { recursive: true });
  const mainSpec = path.join(mainSpecDir, 'spec.md');
  const mainSpecContent = [
    '# Billing',
    '',
    '## Requirements',
    '### Requirement: Existing Invoice',
    'The system SHALL keep existing invoice behavior.',
    '',
    '### Requirement: Existing Receipt',
    'The system SHALL keep existing receipt behavior.',
    '',
  ].join('\n');
  fs.writeFileSync(mainSpec, mainSpecContent);

  const deltaChange = writeArchiveChange(tmpDir, 'archive-delta-spec');
  const deltaSpecDir = path.join(deltaChange, 'specs', 'billing');
  fs.mkdirSync(deltaSpecDir, { recursive: true });
  fs.writeFileSync(
    path.join(deltaSpecDir, 'spec.md'),
    [
      '# Billing',
      '',
      '## MODIFIED Requirements',
      '### Requirement: Existing Invoice',
      'The system SHALL keep updated invoice behavior.',
      '',
    ].join('\n'),
  );
  const deltaArchive = runBash(tmpDir, archiveScript, ['archive-delta-spec', '--dry-run'], {
    env: { PATH: '/usr/bin:/bin:/usr/sbin:/sbin' },
  });
  assert.notEqual(deltaArchive.status, 0);
  assert.match(deltaArchive.stderr, /delta specs require OpenSpec archive\/merge/i);
  assert.equal(fs.readFileSync(mainSpec, 'utf8'), mainSpecContent);

  const archiveDate = execFileSync('date', ['+%Y-%m-%d'], { encoding: 'utf8' }).trim();
  writeArchiveChange(tmpDir, 'archive-collision');
  const collidingActiveChange = path.join(tmpDir, 'openspec', 'changes', `${archiveDate}-archive-collision`);
  fs.mkdirSync(collidingActiveChange, { recursive: true });
  fs.writeFileSync(path.join(collidingActiveChange, '.comet.yaml'), 'phase: archive\narchived: false\n');
  const archiveCollision = runBash(tmpDir, archiveScript, ['archive-collision', '--dry-run']);
  assert.notEqual(archiveCollision.status, 0);
  assert.match(archiveCollision.stderr, /active change already exists with archive name/i);

  writeArchiveChange(tmpDir, 'archive-live');
  const archiveLive = runBash(tmpDir, archiveScript, ['archive-live']);
  assert.equal(archiveLive.status, 0, archiveLive.stderr);
  const archivedYaml = path.join(tmpDir, 'openspec', 'changes', 'archive', `${archiveDate}-archive-live`, '.comet.yaml');
  assert.match(fs.readFileSync(archivedYaml, 'utf8'), /^archived: true$/m);
  assert.ok(!fs.existsSync(path.join(tmpDir, 'openspec', 'changes', 'archive-live')));

  const archiveChange = path.join(tmpDir, 'openspec', 'changes', 'archive-change');
  fs.mkdirSync(archiveChange, { recursive: true });
  fs.writeFileSync(
    path.join(archiveChange, '.comet.yaml'),
    [
      'workflow: full',
      'phase: archive',
      'design_doc: docs/superpowers/specs/sample-design.md',
      'plan: docs/superpowers/plans/sample-plan.md',
      'build_mode: executing-plans',
      'isolation: branch',
      'verify_mode: full',
      'verify_result: pass',
      'verification_report: docs/superpowers/reports/sample-verify.md',
      'branch_status: handled',
      'verified_at: 2026-05-26',
      'archived: false',
      '',
    ].join('\n'),
  );
  const archiveResult = runBash(tmpDir, archiveScript, ['archive-change', '--dry-run']);
  assert.equal(archiveResult.status, 0, archiveResult.stderr);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log('Comet 资产与状态机 smoke 测试通过。');

function runBash(cwd, scriptPath, args = [], options = {}) {
  return spawnSync('/bin/bash', [scriptPath, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...options.env },
  });
}

function readSkill(skill) {
  return fs.readFileSync(path.join(repoRoot, 'skills', skill, 'SKILL.md'), 'utf8');
}

function writeArchiveChange(tmpDir, changeName, overrides = {}) {
  const changeDir = path.join(tmpDir, 'openspec', 'changes', changeName);
  fs.mkdirSync(changeDir, { recursive: true });

  const fields = {
    workflow: 'full',
    phase: 'archive',
    design_doc: 'docs/superpowers/specs/sample-design.md',
    plan: 'docs/superpowers/plans/sample-plan.md',
    build_mode: 'executing-plans',
    isolation: 'branch',
    verify_mode: 'full',
    verify_result: 'pass',
    verification_report: 'docs/superpowers/reports/sample-verify.md',
    branch_status: 'handled',
    verified_at: '2026-05-26',
    archived: 'false',
    ...overrides,
  };

  fs.writeFileSync(
    path.join(changeDir, '.comet.yaml'),
    `${Object.entries(fields).map(([field, value]) => `${field}: ${value}`).join('\n')}\n`,
  );
  return changeDir;
}
