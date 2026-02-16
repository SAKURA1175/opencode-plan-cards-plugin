# opencode-plan-cards-plugin

A plugin that enhances card-based planning interactions for original OpenCode (Desktop + CLI), without replacing `opencode-cli.exe`.

## Features

- Provides session commands:
  - `/plan card on`
  - `/plan card off`
- When enabled, it injects a stricter `plan` workflow: clarify first, confirm, then output a complete plan.
- Enhances the `question` tool definition to encourage card questions with 2–3 options and clear tradeoff descriptions.
- Disabled by default; controlled per session.

## Compatibility

- OpenCode: `1.2.x` (Desktop / CLI)
- Plugin distribution: both `file://` and npm package

## Installation (Method A: Git + file://, recommended first)

```powershell
git clone <your-repo-url> opencode-plan-cards-plugin
cd opencode-plan-cards-plugin
npm install
npm run build
```

Configure plugin in `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "file:///ABSOLUTE_PATH_TO/opencode-plan-cards-plugin/dist/index.js"
  ],
  "agent": {
    "ask": {
      "hidden": true
    }
  }
}
```

> On Windows, use `file:///` paths and encode spaces as `%20`.

## Installation (Method B: npm)

After publishing, user config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-plan-cards-plugin@0.1.0"
  ],
  "agent": {
    "ask": {
      "hidden": true
    }
  }
}
```

## Usage

1. In a target session, run `/plan card on`
2. Continue describing requirements in `plan`; the model prioritizes card-based clarification and confirmation
3. To restore default behavior, run `/plan card off`

## Validation Checklist

1. Desktop: card interaction appears after `/plan card on`
2. CLI: same command works
3. `/plan card off` restores default `plan` behavior
4. `agent.ask.hidden=true` hides ask in UI by default

## Publish to npm

```powershell
npm run build
npm publish --access public
```

## Limitations

- This plugin is a workflow-guidance enhancement, not a core-level hard enforcement.
- For hard guards (for example, strict preconditions before `plan_exit`), maintain a core fork.
