# opencode-agent4

YuanshengClaw Agent4 OpenCode extension pack.

Agent4 is the patch-production bridge between Agent3 diagnosis and Agent5 submission:

```text
RootCauseBlueprint
  -> PatchPlan
  -> PatchCandidate/git diff
  -> Agent1 patch_regression
  -> VerifiedPatchPackage
  -> Agent5
```

## What Is Included

- OpenCode plugin entry: `.opencode/plugins/ysclaw-agent4.js`
- Agent config: `.opencode/agents/ysclaw-agent4-patch.md`
- Commands:
  - `/ysclaw-patch-plan`
  - `/ysclaw-build-patch`
- Bundled skills under `skills/`
- JSON schemas under `schemas/`
- Deterministic local tools: `tools/ysclaw-agent4-tools.js`
- Fast verification tests under `tests/`

## Install In OpenCode

For this local checkout, add the package path to `opencode.json`:

```json
{
  "plugin": ["/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4"]
}
```

Restart OpenCode, then list skills and confirm the `ysclaw-*` Agent4 skills are available.

More details: `.opencode/INSTALL.md` and `docs/README.opencode.md`.

## Local Verification

```bash
npm test
```

The test suite checks plugin metadata, plugin syntax, bootstrap caching, schema validation, and deterministic tool behavior.

## Tool Examples

```bash
node tools/ysclaw-agent4-tools.js validate root-cause-blueprint tests/fixtures/root-cause-blueprint.valid.json
node tools/ysclaw-agent4-tools.js plan tests/fixtures/root-cause-blueprint.valid.json -
```
