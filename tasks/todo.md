# opencode-agent4 Design And Development Plan

## Context Reviewed

- [x] Review project lessons file if present. Result: `tasks/lessons.md` is not present.
- [x] Extract and validate `assets/design.pptx` content. Agent4 is defined on slides 9-11.
- [x] Study `/Users/zq/Desktop/ai-projs/posp/template/superpowers` OpenCode plugin structure.
- [x] Dispatch subagents for reference-project and target-project exploration.

## Design Summary

Agent4 is a controlled patch-production and regression-verification bridge:

`RootCauseBlueprint -> PatchPlan -> PatchCandidate/git diff -> Agent1 patch_regression -> VerifiedPatchPackage -> Agent5`

The implementation will follow the current Superpowers OpenCode pattern:

- package entry: `package.json` with `type: module` and `main: .opencode/plugins/ysclaw-agent4.js`
- plugin hook: `.opencode/plugins/ysclaw-agent4.js`
- bundled skills: top-level `skills/<skill-name>/SKILL.md`, registered through `config.skills.paths`
- bootstrap: inject a short Agent4 operating contract into the first user message with cached file reads
- Codex metadata: `.codex-plugin/plugin.json`
- tests: fast shell/Node tests modeled after `template/superpowers/tests/opencode`

## Implementation Scope

- [x] Create OpenCode/Codex plugin package metadata.
- [x] Add Agent4 bootstrap plugin that registers skills and injects Agent4 guidance.
- [x] Add Agent4 agent configuration for plan-first patching with restricted permissions.
- [x] Add four Agent4 skills:
  - `ysclaw-root-cause-blueprint-reader`
  - `ysclaw-patch-plan-writer`
  - `ysclaw-regression-verifier`
  - `ysclaw-verified-patch-package-writer`
- [x] Add JSON schemas for all Agent4 handoff objects.
- [x] Add deterministic local tools for schema validation, git diff capture, patch plan generation, regression result normalization, and verified package writing.
- [x] Add OpenCode commands:
  - `/ysclaw-patch-plan`
  - `/ysclaw-build-patch`
- [x] Add fast tests for plugin loading, bootstrap caching, schema validation, and tool behavior.
- [x] Add regression tests for plugin config merging, invalid upstream package artifacts, id mismatches, unsafe regression commands, and invalid blueprint fail-closed behavior.
- [x] Add docs for installation, Agent4 flow, schemas, and Agent1 regression integration.
- [x] Update README with usage and verification commands.

## File Plan

- [x] Create `package.json`
- [x] Create `.codex-plugin/plugin.json`
- [x] Create `.opencode/plugins/ysclaw-agent4.js`
- [x] Create `.opencode/INSTALL.md`
- [x] Create `.opencode/agents/ysclaw-agent4-patch.md`
- [x] Create `.opencode/commands/ysclaw-patch-plan.md`
- [x] Create `.opencode/commands/ysclaw-build-patch.md`
- [x] Create `skills/using-ysclaw-agent4/SKILL.md`
- [x] Create `skills/ysclaw-root-cause-blueprint-reader/SKILL.md`
- [x] Create `skills/ysclaw-patch-plan-writer/SKILL.md`
- [x] Create `skills/ysclaw-regression-verifier/SKILL.md`
- [x] Create `skills/ysclaw-verified-patch-package-writer/SKILL.md`
- [x] Create `schemas/root-cause-blueprint.schema.json`
- [x] Create `schemas/patch-plan.schema.json`
- [x] Create `schemas/patch-candidate.schema.json`
- [x] Create `schemas/patch-regression-result.schema.json`
- [x] Create `schemas/verified-patch-package.schema.json`
- [x] Create `tools/ysclaw-agent4-tools.js`
- [x] Create `docs/README.opencode.md`
- [x] Create `docs/agent4.md`
- [x] Create `docs/schemas.md`
- [x] Create `docs/agent1-patch-regression-integration.md`
- [x] Create `tests/opencode/run-tests.sh`
- [x] Create `tests/opencode/setup.sh`
- [x] Create `tests/opencode/test-plugin-loading.sh`
- [x] Create `tests/opencode/test-plugin-config.mjs`
- [x] Create `tests/opencode/test-bootstrap-caching.mjs`
- [x] Create `tests/opencode/test-bootstrap-caching.sh`
- [x] Create `tests/schemas/validate-schemas.mjs`
- [x] Create `tests/tools/test-agent4-tools.mjs`
- [x] Create `tests/fixtures/root-cause-blueprint.valid.json`
- [x] Create `tests/fixtures/patch-regression-result.pass.json`

## TDD And Verification Plan

- [x] RED: write plugin loading and bootstrap caching tests before plugin implementation.
- [x] GREEN: implement minimal plugin registration and bootstrap injection.
- [x] RED: write schema fixture validation tests before schemas/tools.
- [x] GREEN: implement schemas and validation utilities.
- [x] RED: write tool behavior tests for patch plan and verified package generation.
- [x] GREEN: implement deterministic tool functions.
- [x] Fix review blocker: merge plugin safety defaults into existing `.opencode` agent/command config.
- [x] Fix review blocker: validate upstream artifacts and id consistency before writing `VerifiedPatchPackage`.
- [x] Fix review blocker: reject unsafe/free-form regression commands and invalid blueprints before planning.
- [x] Verify with `bash tests/opencode/run-tests.sh`.
- [x] Verify JavaScript syntax with `node --check .opencode/plugins/ysclaw-agent4.js`.
- [x] Verify package entry with `node -e "import('./.opencode/plugins/ysclaw-agent4.js').then(...)"`.
- [x] Re-read `assets/design.pptx` summary and confirm all Agent4 slide requirements are represented.

## Check-In Required Before Implementation

Confirmed by user with "ok，继续吧".

## Review

Implementation completed. Code reviews found blocking safety and schema issues; fixes were added with regression coverage.

Final verification:

- `npm test` passed.
- `node --check` passed for plugin, tool module, and all `.mjs` tests.
- JSON parsing passed for package metadata, fixtures, and schemas.
- Safety probes passed for scalar permission config, newline command injection, mismatched regression evidence ids, and invalid embedded package artifacts.
