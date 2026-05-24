# Installing YuanshengClaw Agent4 For OpenCode

Add this package to the `plugin` array in your global or project `opencode.json`.

For a local checkout:

```json
{
  "plugin": ["/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4"]
}
```

For a git-backed install, replace the path with your repository URL:

```json
{
  "plugin": ["ysclaw-agent4@git+https://example.com/ysclaw-agent4.git"]
}
```

Restart OpenCode after updating config.

## Verify

Ask OpenCode to list skills and confirm the following names appear:

- `using-ysclaw-agent4`
- `ysclaw-root-cause-blueprint-reader`
- `ysclaw-patch-plan-writer`
- `ysclaw-regression-verifier`
- `ysclaw-verified-patch-package-writer`

Run local checks:

```bash
npm test
```
