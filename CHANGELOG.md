# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Open-source community files:
  - `CONTRIBUTING.md`
  - `SECURITY.md`
  - `CODE_OF_CONDUCT.md`
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) for type-check and build.

### Changed

- Added npm package metadata: `repository`, `homepage`, `bugs`, `author`, `engines`.
- Replaced placeholder git clone URLs in all README variants.
- Added `*.tgz` to `.gitignore`.

## [0.1.1] - 2026-02-16

### Added

- CLI setup command for one-command installation:
  - `npx -y opencode-plan-cards-plugin@latest setup`
- Automatic `opencode.json` update with:
  - `plugin: ["opencode-plan-cards-plugin@0.1.1"]`
  - `agent.ask.hidden = true`
- Automatic backup creation before writing config.

### Changed

- Added package binary entry for CLI execution.
- Updated multilingual README files with one-command setup guide.

## [0.1.0] - 2026-02-16

### Added

- Initial plugin scaffold for original OpenCode desktop + CLI.
- Session command handling for `/plan card on|off`.
- Session-level card mode state isolation via `Map<sessionID, boolean>`.
- `experimental.chat.system.transform` injection for plan card workflow guidance.
- `tool.definition` enhancement for `question` tool card-format instructions.
- README with `file://` and npm installation options.
