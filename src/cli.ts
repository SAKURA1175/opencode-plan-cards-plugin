#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"

type JSONValue = string | number | boolean | null | JSONArray | JSONObject
type JSONArray = JSONValue[]
type JSONObject = { [key: string]: JSONValue | undefined }

type CLIOptions = {
  command?: string
  plugin?: string
  config?: string
  dryRun: boolean
  noBackup: boolean
  help: boolean
}

type SetupResult = {
  changed: boolean
  pluginUpdated: boolean
  askHiddenUpdated: boolean
}

const require = createRequire(import.meta.url)
const pkg = require("../package.json") as { name?: string; version?: string }

function usage(): string {
  const defaultPlugin = `${pkg.name ?? "opencode-plan-cards-plugin"}@${pkg.version ?? "latest"}`
  return [
    "Usage:",
    "  opencode-plan-cards-plugin setup [options]",
    "",
    "Options:",
    "  --plugin <spec>   Plugin spec to inject (default: current package version)",
    "  --config <path>   Path to opencode.json",
    "  --dry-run         Preview changes without writing files",
    "  --no-backup       Skip backup file creation",
    "  -h, --help        Show help",
    "",
    "Example:",
    `  npx -y ${pkg.name ?? "opencode-plan-cards-plugin"}@latest setup`,
    `  npx -y ${pkg.name ?? "opencode-plan-cards-plugin"}@latest setup --plugin ${defaultPlugin}`,
  ].join("\n")
}

function parseArgs(argv: string[]): CLIOptions {
  const options: CLIOptions = {
    dryRun: false,
    noBackup: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === "-h" || arg === "--help") {
      options.help = true
      continue
    }
    if (arg === "--dry-run") {
      options.dryRun = true
      continue
    }
    if (arg === "--no-backup") {
      options.noBackup = true
      continue
    }
    if (arg === "--plugin") {
      const value = argv[index + 1]
      if (!value) throw new Error("Missing value for --plugin")
      options.plugin = value.trim()
      index += 1
      continue
    }
    if (arg.startsWith("--plugin=")) {
      options.plugin = arg.slice("--plugin=".length).trim()
      continue
    }
    if (arg === "--config") {
      const value = argv[index + 1]
      if (!value) throw new Error("Missing value for --config")
      options.config = value.trim()
      index += 1
      continue
    }
    if (arg.startsWith("--config=")) {
      options.config = arg.slice("--config=".length).trim()
      continue
    }
    if (!options.command && !arg.startsWith("-")) {
      options.command = arg
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

function resolveConfigPath(configOverride?: string): string {
  if (configOverride && configOverride.trim()) {
    return resolve(configOverride.trim())
  }

  const configRoot = process.env.XDG_CONFIG_HOME?.trim() || join(homedir(), ".config")
  return join(configRoot, "opencode", "opencode.json")
}

function readJSONFile(filePath: string): JSONObject {
  if (!existsSync(filePath)) return {}

  const raw = readFileSync(filePath, "utf8")
  const normalized = raw.replace(/^\uFEFF/, "")
  if (!normalized.trim()) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(normalized)
  } catch {
    throw new Error(`Invalid JSON in config file: ${filePath}`)
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Config root must be a JSON object: ${filePath}`)
  }

  return parsed as JSONObject
}

function extractPackageName(spec: string): string | undefined {
  const trimmed = spec.trim()
  const match = /^(@[^/\s]+\/[^@\s/]+|[^@\s/]+)(?:@.+)?$/.exec(trimmed)
  return match?.[1]
}

function isSamePlugin(existing: string, targetSpec: string): boolean {
  if (existing === targetSpec) return true

  const targetName = extractPackageName(targetSpec)
  if (!targetName) return false
  const existingName = extractPackageName(existing)
  return !!existingName && existingName === targetName
}

function upsertPlugin(config: JSONObject, pluginSpec: string): boolean {
  const current = config.plugin

  if (
    current !== undefined &&
    typeof current !== "string" &&
    !Array.isArray(current)
  ) {
    throw new Error('Config key "plugin" must be a string or an array')
  }

  const pluginList = Array.isArray(current)
    ? [...current]
    : typeof current === "string"
      ? [current]
      : []

  let matched = false
  let changed = !Array.isArray(current)

  for (let index = 0; index < pluginList.length; index += 1) {
    const value = pluginList[index]
    if (typeof value !== "string") continue
    if (!isSamePlugin(value, pluginSpec)) continue

    matched = true
    if (value !== pluginSpec) {
      pluginList[index] = pluginSpec
      changed = true
    }
  }

  if (!matched) {
    pluginList.push(pluginSpec)
    changed = true
  }

  config.plugin = pluginList
  return changed
}

function ensureObject(parent: JSONObject, key: string): JSONObject {
  const value = parent[key]
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JSONObject
  }

  const next: JSONObject = {}
  parent[key] = next
  return next
}

function updateAskHidden(config: JSONObject): boolean {
  const agent = ensureObject(config, "agent")
  const ask = ensureObject(agent, "ask")

  if (ask.hidden === true) return false
  ask.hidden = true
  return true
}

function applySetup(config: JSONObject, pluginSpec: string): SetupResult {
  const pluginUpdated = upsertPlugin(config, pluginSpec)
  const askHiddenUpdated = updateAskHidden(config)
  return {
    changed: pluginUpdated || askHiddenUpdated,
    pluginUpdated,
    askHiddenUpdated,
  }
}

function backupPath(configPath: string): string {
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z").replace(/[:]/g, "-")
  return `${configPath}.bak-${stamp}`
}

function writeConfig(configPath: string, config: JSONObject, createBackup: boolean): string | undefined {
  mkdirSync(dirname(configPath), { recursive: true })

  let savedBackup: string | undefined
  if (createBackup && existsSync(configPath)) {
    savedBackup = backupPath(configPath)
    copyFileSync(configPath, savedBackup)
  }

  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8")
  return savedBackup
}

function run(): void {
  const options = parseArgs(process.argv.slice(2))
  if (options.help || !options.command) {
    console.log(usage())
    return
  }

  if (options.command !== "setup") {
    throw new Error(`Unknown command: ${options.command}`)
  }

  const packageName = pkg.name ?? "opencode-plan-cards-plugin"
  const packageVersion = pkg.version ?? "latest"
  const pluginSpec = options.plugin?.trim() || `${packageName}@${packageVersion}`
  const configPath = resolveConfigPath(options.config)
  const config = readJSONFile(configPath)
  const result = applySetup(config, pluginSpec)

  if (!result.changed) {
    console.log(`No changes needed: ${configPath}`)
    return
  }

  if (options.dryRun) {
    console.log(`[dry-run] Config file: ${configPath}`)
    console.log(`[dry-run] plugin updated: ${result.pluginUpdated}`)
    console.log(`[dry-run] ask.hidden updated: ${result.askHiddenUpdated}`)
    console.log(JSON.stringify(config, null, 2))
    return
  }

  const savedBackup = writeConfig(configPath, config, !options.noBackup)
  console.log(`Updated: ${configPath}`)
  if (savedBackup) {
    console.log(`Backup: ${savedBackup}`)
  }
  console.log(`Plugin: ${pluginSpec}`)
  console.log("Done. Restart OpenCode and run /plan card on in your session.")
}

try {
  run()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Error: ${message}`)
  console.error("")
  console.error(usage())
  process.exitCode = 1
}
