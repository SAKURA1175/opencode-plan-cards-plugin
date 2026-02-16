# opencode-plan-cards-plugin

让原版 OpenCode（桌面端 + CLI）获得更强的 `plan` 卡片问答流程，无需替换 `opencode-cli.exe`。

## 功能

- 提供会话命令：
  - `/plan card on`
  - `/plan card off`
- 开启后仅在 `plan` 会话注入“先澄清、再确认、再输出完整计划”的系统约束。
- 强化 `question` 工具描述，推动 2–3 选项 + 权衡说明的卡片提问格式。
- 默认不强开，按会话开关控制。

## 兼容性

- OpenCode: `1.2.x`（桌面端 / CLI）
- 插件形态：`file://` 与 npm 包均可

## 安装（方式 A：Git + file://，推荐首发）

```powershell
git clone <your-repo-url> opencode-plan-cards-plugin
cd opencode-plan-cards-plugin
npm install
npm run build
```

在 `~/.config/opencode/opencode.json` 中配置插件：

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

> Windows 路径需要使用 `file:///`，空格写成 `%20`。

## 安装（方式 B：npm）

发布后，用户配置：

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

## 使用

1. 在目标会话输入：`/plan card on`
2. 继续在 `plan` 中描述需求，模型会优先走卡片澄清与确认流程
3. 需要恢复默认行为时输入：`/plan card off`

## 验证清单

1. 桌面端：`/plan card on` 后出现卡片问答流程
2. CLI：同样命令生效
3. `/plan card off` 后恢复原始 `plan` 行为
4. `agent.ask.hidden=true` 后 UI 默认不展示 ask

## 发布 npm

```powershell
npm run build
npm publish --access public
```

## 限制说明

- 插件层是“流程引导增强”，不等于内核级强约束。
- 如需硬拦截（例如强制 plan_exit 前置条件），仍需维护内核分支。
