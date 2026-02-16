# opencode-plan-cards-plugin

オリジナルの OpenCode（Desktop + CLI）で、`plan` エージェントのカード型質問フローを強化するプラグインです。`opencode-cli.exe` の差し替えは不要です。

## 機能

- セッションコマンドを提供：
  - `/plan card on`
  - `/plan card off`
- 有効化時、`plan` セッションにのみ「要件確認 → 最終確認 → 完全な実行計画出力」の制約を注入。
- `question` ツール定義を強化し、2〜3択 + トレードオフ説明のカード質問を促進。
- デフォルトは無効。セッションごとのスイッチで制御。

## 互換性

- OpenCode: `1.2.x`（Desktop / CLI）
- プラグイン配布形態：`file://` と npm の両対応
- ワンコマンド設定: Node.js `18+`

## インストール（方式 A：npm ワンコマンド設定、推奨）

```powershell
npx -y opencode-plan-cards-plugin@latest setup
```

このコマンドは自動で以下を実行します：

- `~/.config/opencode/opencode.json` のバックアップ作成
- `plugin: ["opencode-plan-cards-plugin@0.1.1"]` を設定
- `agent.ask.hidden = true` を設定

オプション：

```powershell
npx -y opencode-plan-cards-plugin@latest setup --plugin opencode-plan-cards-plugin@0.1.1
npx -y opencode-plan-cards-plugin@latest setup --config "C:\Users\<you>\.config\opencode\opencode.json"
```

## インストール（方式 B：Git + file://）

```powershell
git clone https://github.com/SAKURA1175/opencode-plan-cards-plugin.git opencode-plan-cards-plugin
cd opencode-plan-cards-plugin
npm install
npm run build
```

`~/.config/opencode/opencode.json` に以下を設定：

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

> Windows では `file:///` 形式を使用し、空白は `%20` にしてください。

## インストール（方式 C：npm 手動設定）

公開後、ユーザー設定：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-plan-cards-plugin@0.1.1"
  ],
  "agent": {
    "ask": {
      "hidden": true
    }
  }
}
```

## 使い方

1. 対象セッションで `/plan card on` を入力
2. `plan` で要件を入力すると、カードによる確認フローが優先される
3. 既定動作に戻す場合は `/plan card off`

## 動作確認チェックリスト

1. Desktop：`/plan card on` 後にカード質問フローが表示される
2. CLI：同様にコマンドが有効
3. `/plan card off` 後に標準 `plan` 挙動へ復帰
4. `agent.ask.hidden=true` で UI の ask を非表示化

## npm 公開

```powershell
npm run build
npm publish --access public
```

## 制限事項

- プラグイン層は「フロー誘導の強化」であり、コアレベルの強制制約ではありません。
- 例：`plan_exit` 前の厳格な必須チェックなどは、コア分岐の維持が必要です。
