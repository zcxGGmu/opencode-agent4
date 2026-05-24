# YuanshengClaw Agent4 For OpenCode

This package follows the current OpenCode plugin pattern used by the `superpowers` reference project:

- `package.json` points `main` to `.opencode/plugins/ysclaw-agent4.js`.
- The plugin registers the top-level `skills/` directory through `config.skills.paths`.
- The plugin injects cached Agent4 bootstrap guidance into the first user message.
- The plugin adds default Agent4 agent and command config if the host config has not already defined them.

## Installation

Local checkout:

```json
{
  "plugin": ["/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4"]
}
```

Git-backed install:

```json
{
  "plugin": ["ysclaw-agent4@git+https://example.com/ysclaw-agent4.git"]
}
```

Restart OpenCode after changing `opencode.json`.

## Skills

OpenCode should discover these skills:

- `using-ysclaw-agent4`
- `ysclaw-root-cause-blueprint-reader`
- `ysclaw-patch-plan-writer`
- `ysclaw-regression-verifier`
- `ysclaw-verified-patch-package-writer`

## Commands

The plugin registers command templates for:

- `ysclaw-patch-plan`: validate a RootCauseBlueprint and produce PatchPlan without editing code.
- `ysclaw-build-patch`: build a patch from a confirmed PatchPlan, collect regression evidence, and produce VerifiedPatchPackage.

Markdown command descriptions are also stored in `.opencode/commands/`.

## Agent

The default agent id is `ysclaw-agent4-patch`. It is configured as a primary agent with restricted permissions:

- read/list/grep/glob allowed
- edits require ask
- `git` and `node` allowed
- `npm`, `agent1`, task delegation, and external directories require ask
- web fetch/search denied by default

## Troubleshooting

If skills are missing:

1. Confirm the plugin path in `opencode.json`.
2. Restart OpenCode.
3. Run `npm test` in this repository.
4. Check OpenCode logs for plugin loading errors.
