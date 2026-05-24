# Superpowers for OpenCode in opencode-agent4

This repository embeds Superpowers skills into the `opencode-agent4` OpenCode plugin. You do not need to install the upstream Superpowers plugin separately when this package is already configured.

The embedded Superpowers content was migrated from `/Users/zq/Desktop/ai-projs/posp/template/superpowers`; its upstream MIT license is preserved in `docs/LICENSE.superpowers`.

## Installation

Add `opencode-agent4` to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4"]
}
```

Restart OpenCode. The Agent4 plugin registers both Agent4 skills and the embedded Superpowers skills from the shared `skills/` directory.

Verify by asking OpenCode to list skills and checking for `using-superpowers`, `writing-plans`, `test-driven-development`, and `systematic-debugging`.

If you also use Claude Code, Codex, or another harness outside this plugin, install Superpowers separately for that environment.

### Migrating from the old symlink-based install

If you previously installed superpowers using `git clone` and symlinks, remove the old setup:

```bash
# Remove old symlinks
rm -f ~/.config/opencode/plugins/superpowers.js
rm -rf ~/.config/opencode/skills/superpowers

# Optionally remove the cloned repo
rm -rf ~/.config/opencode/superpowers

# Remove skills.paths from opencode.json if you added one for superpowers
```

Then follow the `opencode-agent4` installation steps above.

## Usage

### Finding Skills

Use OpenCode's native `skill` tool to list all available skills:

```
use skill tool to list skills
```

### Loading a Skill

```
use skill tool to load superpowers/brainstorming
```

### Personal Skills

Create your own skills in `~/.config/opencode/skills/`:

```bash
mkdir -p ~/.config/opencode/skills/my-skill
```

Create `~/.config/opencode/skills/my-skill/SKILL.md`:

```markdown
---
name: my-skill
description: Use when [condition] - [what it does]
---

# My Skill

[Your skill content here]
```

### Project Skills

Create project-specific skills in `.opencode/skills/` within your project.

**Skill Priority:** Project skills > Personal skills > Superpowers skills

## Updating

This repository vendors a local copy of the Superpowers skills. To update them,
copy the desired upstream `skills/` content into this repository and rerun
`npm test`.

If you choose to install upstream Superpowers separately, pin a specific version
with a branch or tag:

```json
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git#v5.0.3"]
}
```

## How It Works

The plugin does two things:

1. **Injects bootstrap context** via the `experimental.chat.messages.transform` hook, adding Agent4 and Superpowers awareness to every conversation.
2. **Registers the skills directory** via the `config` hook, so OpenCode discovers Agent4 and Superpowers skills without symlinks or manual config.

### Tool Mapping

Skills written for Claude Code are automatically adapted for OpenCode:

- `TodoWrite` → `todowrite`
- `Task` with subagents → OpenCode's `@mention` system
- `Skill` tool → OpenCode's native `skill` tool
- File operations → Native OpenCode tools

## Troubleshooting

### Plugin not loading

1. Check OpenCode logs: `opencode run --print-logs "hello" 2>&1 | grep -i ysclaw`
2. Verify the plugin line in your `opencode.json` is correct
3. Make sure you're running a recent version of OpenCode

### Windows install issues

Some Windows OpenCode builds have upstream installer issues with git-backed
plugin specs, including cache paths for `git+https` URLs and Bun not finding
`git.exe` even when it works in a normal terminal. If OpenCode cannot install a
git-backed plugin, use a local checkout of `opencode-agent4` and point
`opencode.json` at that path.

### Skills not found

1. Use OpenCode's `skill` tool to list available skills
2. Check that the plugin is loading (see above)
3. Each skill needs a `SKILL.md` file with valid YAML frontmatter

### Bootstrap not appearing

1. Check OpenCode version supports `experimental.chat.messages.transform` hook
2. Restart OpenCode after config changes

## Getting Help

- Report issues: https://github.com/obra/superpowers/issues
- Main documentation: https://github.com/obra/superpowers
- OpenCode docs: https://opencode.ai/docs/
