# Lessons

## 2026-05-24 Agent4 Safety Review

- Do not use `\s` in command allowlist regexes. It matches newlines. Use `[ \t]` and explicitly reject `\r`/`\n`.
- Do not silently rewrite upstream evidence ids when packaging verification artifacts. Validate the evidence first, then fail if ids do not match.
- Do not let scalar permission config such as `"allow"` replace Agent4 safety defaults. Convert scalar permissions into the default object policy or reject them.
- For handoff packages, validate every embedded upstream artifact and enforce cross-object id consistency before emitting the package.
