# opencode-plan-cards-plugin

Official website (Netlify, replace with your actual domain after deploy):
- https://<your-netlify-site>.netlify.app

A plugin that enhances card-based planning interactions for original OpenCode (Desktop + CLI), without replacing `opencode-cli.exe`.

## Features

- Provides session commands:
  - `/plan card on`
  - `/plan card off`
- When enabled, it injects a stricter `plan` workflow: clarify first, confirm, then output a complete plan.
- Enhances the `question` tool definition to encourage card questions with 2–3 options and clear tradeoff descriptions.
- Enabled by default after installation; still controllable per session.

## Compatibility

- OpenCode: `1.2.x` (Desktop / CLI)
- Plugin distribution: both `file://` and npm package
- One-command installer: Node.js `18+`

## Installation (Method A: npm one-command setup, recommended)

```powershell
npx -y opencode-plan-cards-plugin@latest setup
```

By default this command:

- creates a backup of `~/.config/opencode/opencode.json`
- writes `plugin: ["opencode-plan-cards-plugin@0.1.2"]`
- writes `agent.ask.hidden = true`

Optional flags:

```powershell
npx -y opencode-plan-cards-plugin@latest setup --plugin opencode-plan-cards-plugin@0.1.2
npx -y opencode-plan-cards-plugin@latest setup --config "C:\Users\<you>\.config\opencode\opencode.json"
```

## Installation (Method B: Git + file://)

```powershell
git clone https://github.com/SAKURA1175/opencode-plan-cards-plugin.git opencode-plan-cards-plugin
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

## Installation (Method C: npm manual config)

After publishing, user config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-plan-cards-plugin@0.1.2"
  ],
  "agent": {
    "ask": {
      "hidden": true
    }
  }
}
```

## Usage

1. After install and restart, card mode is enabled by default in `plan` sessions
2. To disable card mode in the current session, run `/plan card off`
3. To re-enable card mode in the current session, run `/plan card on`

## Validation Checklist

1. Desktop: card interaction appears by default in `plan` sessions
2. CLI: same default behavior works
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
