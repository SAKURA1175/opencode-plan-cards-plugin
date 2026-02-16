(() => {
  const links = {
    repo: "https://github.com/SAKURA1175/opencode-plan-cards-plugin",
    follow: "https://github.com/SAKURA1175",
    npm: "https://www.npmjs.com/package/opencode-plan-cards-plugin",
    issues: "https://github.com/SAKURA1175/opencode-plan-cards-plugin/issues",
    license: "https://github.com/SAKURA1175/opencode-plan-cards-plugin/blob/main/LICENSE",
    readme: "https://github.com/SAKURA1175/opencode-plan-cards-plugin#readme",
  }

  const badges = {
    npm: {
      image: "https://img.shields.io/npm/v/opencode-plan-cards-plugin?label=npm&color=4f46e5",
      href: links.npm,
    },
    tag: {
      image: "https://img.shields.io/github/v/tag/SAKURA1175/opencode-plan-cards-plugin?label=tag&color=6366f1",
      href: links.repo,
    },
    stars: {
      image: "https://img.shields.io/github/stars/SAKURA1175/opencode-plan-cards-plugin?style=social",
      href: links.repo,
    },
    followers: {
      image: "https://img.shields.io/github/followers/SAKURA1175?style=social&label=Follow%20%40SAKURA1175",
      href: links.follow,
    },
  }

  const commands = {
    setup: "npx -y opencode-plan-cards-plugin@latest setup",
    disable: "/plan card off",
    enable: "/plan card on",
    checkRegistry: "npm config get registry",
    checkNode: "node -v",
  }

  window.SITE_LINKS = links
  window.SUPPORTED_LANGS = ["zh", "en", "ja"]
  window.DEFAULT_LANG = "zh"
  window.LANGUAGE_STORAGE_KEY = "opencode-plan-cards-lang"

  window.SITE_CONTENT = {
    zh: {
      meta: {
        title: "OpenCode Plan Cards 插件官网",
        description:
          "opencode-plan-cards-plugin 官方宣传页：三语言切换、完整安装手册、GitHub Star/Follow 转化入口。",
      },
      brand: "opencode-plan-cards-plugin",
      nav: {
        why: "功能亮点",
        quickstart: "快速开始",
        manual: "详细手册",
        commands: "命令速查",
        faq: "常见问题",
      },
      header: {
        star: "Star Repo",
        follow: "关注作者",
      },
      hero: {
        eyebrow: "原版 OpenCode 可用 · 桌面端 + CLI",
        title: "让 Plan 变成真正可执行的卡片问答流程",
        subtitle:
          "安装后默认自动开启卡片模式，支持中英日文档切换，提供完整命令手册与故障排查指南，快速稳定落地。",
        demoCaption: "演示图：需求输入 → 卡片澄清 → 确认 → 输出完整计划",
        install: "立即安装",
        manual: "查看手册",
      },
      badgeTitle: "项目状态",
      badgeItems: [
        { label: "npm version", image: badges.npm.image, href: badges.npm.href },
        { label: "github tag", image: badges.tag.image, href: badges.tag.href },
        { label: "github stars", image: badges.stars.image, href: badges.stars.href },
        { label: "github followers", image: badges.followers.image, href: badges.followers.href },
      ],
      why: {
        title: "为什么用这个插件",
        items: [
          {
            title: "默认自动卡片模式",
            description: "安装后进入 Plan 会话即触发卡片澄清流程，无需每次先输命令。",
          },
          {
            title: "会话级快速开关",
            description: "随时用 /plan card off 临时关闭，/plan card on 重新开启。",
          },
          {
            title: "原版兼容",
            description: "不替换 opencode-cli.exe，原版 OpenCode 桌面端与 CLI 直接可用。",
          },
          {
            title: "一键 setup",
            description: "npx 命令自动写入配置并备份文件，降低安装与升级摩擦。",
          },
        ],
      },
      quickstart: {
        title: "30 秒快速开始",
        subtitle: "推荐新用户直接按下面 3 步执行。",
        stepsTitle: "步骤",
        steps: [
          "执行 setup 命令，自动写入插件配置。",
          "重启 OpenCode（确保新配置生效）。",
          "切到 Plan agent，直接描述需求验证卡片流程。",
        ],
        commandsTitle: "推荐命令",
        commands: [{ label: "一键安装/升级", code: commands.setup }],
        checklistTitle: "成功判定",
        checklist: [
          "Plan 会话默认出现卡片式澄清问题。",
          "执行 /plan card off 后回到普通 Plan。",
          "执行 /plan card on 后恢复卡片模式。",
        ],
      },
      manual: {
        title: "详细操作手册",
        subtitle: "覆盖安装、升级、启停控制、配置说明与排错。",
        sections: [
          {
            title: "1) 新用户安装",
            description: "建议使用 setup 自动写配置，避免手动 JSON 出错。",
            bullets: [
              "运行 setup 后会自动备份 opencode.json。",
              "写入 plugin: [\"opencode-plan-cards-plugin@latest\"]。",
              "写入 agent.ask.hidden = true。",
            ],
            codeBlocks: [{ label: "安装命令", code: commands.setup }],
          },
          {
            title: "2) 旧版本升级",
            description: "setup 是幂等操作，可重复执行进行版本升级。",
            bullets: [
              "再次执行 setup 即可升级到最新版本。",
              "检查 plugin 数组，避免同时保留 npm 与 file:// 两种来源。",
              "同一插件建议只保留一条来源，防止重复注入。",
            ],
            codeBlocks: [{ label: "升级命令", code: commands.setup }],
          },
          {
            title: "3) 会话控制（Plan 内输入）",
            description: "以下命令是对话命令，不是在系统终端执行。",
            bullets: [
              "默认开启：进入 Plan 会话即生效。",
              "临时关闭：/plan card off。",
              "重新开启：/plan card on。",
            ],
            codeBlocks: [
              { label: "关闭当前会话卡片模式", code: commands.disable },
              { label: "开启当前会话卡片模式", code: commands.enable },
            ],
          },
          {
            title: "4) 配置参考",
            description: "如需手动配置，可参考以下最小可用示例。",
            bullets: [
              "Windows: C:\\Users\\<用户名>\\.config\\opencode\\opencode.json",
              "macOS/Linux: ~/.config/opencode/opencode.json",
            ],
            codeBlocks: [
              {
                label: "opencode.json 最小配置",
                code: `{
  "plugin": ["opencode-plan-cards-plugin@latest"],
  "agent": {
    "ask": { "hidden": true }
  }
}`,
              },
            ],
          },
          {
            title: "5) 常见排错",
            description: "遇到“重启后没效果”时按顺序检查。",
            bullets: [
              "是否处于 Plan agent（Ask/Build 不会触发该流程）。",
              "是否误把 /plan card on 当作系统终端命令执行。",
              "是否重复加载插件（npm + file://）。",
              "检查 npm registry 是否为 https://registry.npmjs.org/。",
              "确认 Node 版本 >= 18。",
            ],
            codeBlocks: [
              { label: "检查 npm registry", code: commands.checkRegistry },
              { label: "检查 Node 版本", code: commands.checkNode },
            ],
          },
        ],
      },
      commandTable: {
        title: "命令速查表",
        subtitle: "常用命令一屏查全，可直接复制。",
        head: {
          command: "命令",
          desc: "说明",
          action: "复制",
        },
        rows: [
          { command: commands.setup, desc: "安装或升级插件（幂等）。" },
          { command: commands.disable, desc: "关闭当前 Plan 会话的卡片模式。" },
          { command: commands.enable, desc: "开启当前 Plan 会话的卡片模式。" },
          { command: commands.checkRegistry, desc: "排查 npx 拉包失败时的 registry 配置。" },
          { command: commands.checkNode, desc: "确认 Node 版本满足要求（>=18）。" },
        ],
      },
      faq: {
        title: "FAQ",
        items: [
          {
            q: "为什么重启后没生效？",
            a: "先确认你当前在 Plan agent，再确认 plugin 来源没有重复。若之前只装旧版本，重新执行一次 setup 并重启。",
          },
          {
            q: "是和智能体说，还是在终端执行 /plan card on？",
            a: "/plan card on 是会话命令，要在 OpenCode 对话框里发送给智能体，不是在系统终端执行。",
          },
          {
            q: "重复执行 setup 会冲突吗？",
            a: "不会。setup 是幂等的，重复执行用于升级很安全。冲突通常来自同插件双来源并存（npm + file://）。",
          },
          {
            q: "旧版本用户怎么改成默认自动卡片模式？",
            a: "直接再次执行 npx -y opencode-plan-cards-plugin@latest setup，然后重启 OpenCode 即可。",
          },
        ],
      },
      bottom: {
        title: "如果这个插件对你有帮助，欢迎 Star 和 Follow",
        subtitle: "你的支持会直接推动后续版本迭代。",
        star: "Star Repo",
        follow: "Follow @SAKURA1175",
        npm: "npm 包主页",
      },
      footer: {
        note: "© 2026 sakura1175 · opencode-plan-cards-plugin",
        repo: "Repository",
        issues: "Issues",
        license: "License",
      },
      ui: {
        copy: "复制",
        copied: "已复制",
      },
    },
    en: {
      meta: {
        title: "opencode-plan-cards-plugin Official Site",
        description:
          "Official website for opencode-plan-cards-plugin with multilingual docs, setup guide, and GitHub conversion CTA.",
      },
      brand: "opencode-plan-cards-plugin",
      nav: {
        why: "Highlights",
        quickstart: "Quick Start",
        manual: "Manual",
        commands: "Cheat Sheet",
        faq: "FAQ",
      },
      header: {
        star: "Star Repo",
        follow: "Follow Author",
      },
      hero: {
        eyebrow: "Works on original OpenCode · Desktop + CLI",
        title: "Turn Plan into a card-driven execution workflow",
        subtitle:
          "Card mode is enabled by default after install. Get full tri-language docs, exact commands, and practical troubleshooting in one page.",
        demoCaption: "Demo flow: input request → card questions → confirmation → complete plan",
        install: "Install Now",
        manual: "Read Manual",
      },
      badgeTitle: "Project Status",
      badgeItems: [
        { label: "npm version", image: badges.npm.image, href: badges.npm.href },
        { label: "github tag", image: badges.tag.image, href: badges.tag.href },
        { label: "github stars", image: badges.stars.image, href: badges.stars.href },
        { label: "github followers", image: badges.followers.image, href: badges.followers.href },
      ],
      why: {
        title: "Why this plugin",
        items: [
          {
            title: "Default-on card mode",
            description: "No pre-command needed. Card-based clarification starts automatically in Plan sessions.",
          },
          {
            title: "Session-level switch",
            description: "Use /plan card off to pause and /plan card on to restore for current session.",
          },
          {
            title: "Original OpenCode compatible",
            description: "No binary replacement. Works directly on official OpenCode desktop and CLI.",
          },
          {
            title: "One-command setup",
            description: "npx setup writes config and creates backup automatically.",
          },
        ],
      },
      quickstart: {
        title: "30-second quick start",
        subtitle: "Recommended path for new users.",
        stepsTitle: "Steps",
        steps: [
          "Run setup to inject plugin configuration.",
          "Restart OpenCode to ensure config reload.",
          "Switch to Plan agent and describe your task.",
        ],
        commandsTitle: "Recommended Command",
        commands: [{ label: "Install / upgrade", code: commands.setup }],
        checklistTitle: "Success checklist",
        checklist: [
          "Card-style clarification appears by default in Plan.",
          "/plan card off switches back to plain Plan behavior.",
          "/plan card on re-enables card mode.",
        ],
      },
      manual: {
        title: "Detailed operation manual",
        subtitle: "Installation, upgrade, session control, config reference, and troubleshooting.",
        sections: [
          {
            title: "1) New installation",
            description: "Use setup to avoid manual JSON mistakes.",
            bullets: [
              "Automatically backs up opencode.json.",
              "Writes plugin: [\"opencode-plan-cards-plugin@latest\"].",
              "Writes agent.ask.hidden = true.",
            ],
            codeBlocks: [{ label: "Setup command", code: commands.setup }],
          },
          {
            title: "2) Upgrade from old versions",
            description: "setup is idempotent and safe to run repeatedly.",
            bullets: [
              "Run setup again to move to latest version.",
              "Avoid duplicate plugin sources in config.",
              "Keep only one source for this plugin (npm or file://).",
            ],
            codeBlocks: [{ label: "Upgrade command", code: commands.setup }],
          },
          {
            title: "3) Session controls (type in chat, not terminal)",
            description: "These are conversation commands for OpenCode sessions.",
            bullets: [
              "Default behavior: card mode enabled in Plan.",
              "Temporary off: /plan card off.",
              "Turn on again: /plan card on.",
            ],
            codeBlocks: [
              { label: "Disable for current session", code: commands.disable },
              { label: "Enable for current session", code: commands.enable },
            ],
          },
          {
            title: "4) Config reference",
            description: "Minimal config example for manual setup.",
            bullets: [
              "Windows: C:\\Users\\<user>\\.config\\opencode\\opencode.json",
              "macOS/Linux: ~/.config/opencode/opencode.json",
            ],
            codeBlocks: [
              {
                label: "Minimal opencode.json",
                code: `{
  "plugin": ["opencode-plan-cards-plugin@latest"],
  "agent": {
    "ask": { "hidden": true }
  }
}`,
              },
            ],
          },
          {
            title: "5) Troubleshooting",
            description: "Use this checklist when users report “no effect after restart”.",
            bullets: [
              "Confirm current agent is Plan.",
              "Confirm /plan card on is sent in chat, not system terminal.",
              "Check duplicate plugin sources (npm + file://).",
              "Ensure npm registry is https://registry.npmjs.org/.",
              "Ensure Node version >= 18.",
            ],
            codeBlocks: [
              { label: "Check npm registry", code: commands.checkRegistry },
              { label: "Check Node version", code: commands.checkNode },
            ],
          },
        ],
      },
      commandTable: {
        title: "Command cheat sheet",
        subtitle: "Copy-and-run commands for daily usage.",
        head: {
          command: "Command",
          desc: "Description",
          action: "Copy",
        },
        rows: [
          { command: commands.setup, desc: "Install or upgrade plugin (idempotent)." },
          { command: commands.disable, desc: "Disable card mode in current Plan session." },
          { command: commands.enable, desc: "Enable card mode in current Plan session." },
          { command: commands.checkRegistry, desc: "Verify npm registry for install issues." },
          { command: commands.checkNode, desc: "Verify Node runtime version (>=18)." },
        ],
      },
      faq: {
        title: "FAQ",
        items: [
          {
            q: "Why does it look ineffective after restart?",
            a: "Most cases are Plan agent mismatch or duplicate plugin source config. Re-run setup and restart OpenCode.",
          },
          {
            q: "Should I tell the agent or run /plan card on in terminal?",
            a: "/plan card on is a chat command for OpenCode conversation, not a system shell command.",
          },
          {
            q: "Will running setup multiple times cause conflicts?",
            a: "No. setup is idempotent. Conflicts usually come from loading both npm and file:// source at the same time.",
          },
          {
            q: "How do old-version users migrate to default-on behavior?",
            a: "Run npx -y opencode-plan-cards-plugin@latest setup again, then restart OpenCode.",
          },
        ],
      },
      bottom: {
        title: "If this plugin helps you, please Star and Follow",
        subtitle: "Your support directly helps future iterations.",
        star: "Star Repo",
        follow: "Follow @SAKURA1175",
        npm: "npm package",
      },
      footer: {
        note: "© 2026 sakura1175 · opencode-plan-cards-plugin",
        repo: "Repository",
        issues: "Issues",
        license: "License",
      },
      ui: {
        copy: "Copy",
        copied: "Copied",
      },
    },
    ja: {
      meta: {
        title: "opencode-plan-cards-plugin 公式サイト",
        description:
          "opencode-plan-cards-plugin の公式紹介ページ。三言語切替、詳細手順、GitHub Star/Follow 導線を提供。",
      },
      brand: "opencode-plan-cards-plugin",
      nav: {
        why: "特長",
        quickstart: "クイックスタート",
        manual: "詳細手順",
        commands: "コマンド一覧",
        faq: "FAQ",
      },
      header: {
        star: "Star Repo",
        follow: "Follow Author",
      },
      hero: {
        eyebrow: "オリジナル OpenCode 対応 · Desktop + CLI",
        title: "Plan をカード型の実行フローへ",
        subtitle:
          "インストール後は Plan セッションでカードモードがデフォルト有効。導入・運用・トラブル対応を一ページで確認できます。",
        demoCaption: "デモ: 要件入力 → カード確認 → 最終確認 → 完全な計画出力",
        install: "今すぐ導入",
        manual: "手順を見る",
      },
      badgeTitle: "プロジェクト状態",
      badgeItems: [
        { label: "npm version", image: badges.npm.image, href: badges.npm.href },
        { label: "github tag", image: badges.tag.image, href: badges.tag.href },
        { label: "github stars", image: badges.stars.image, href: badges.stars.href },
        { label: "github followers", image: badges.followers.image, href: badges.followers.href },
      ],
      why: {
        title: "このプラグインを使う理由",
        items: [
          {
            title: "デフォルトでカードモード有効",
            description: "Plan セッションに入るだけでカード型の確認フローが開始されます。",
          },
          {
            title: "セッション単位で切替",
            description: "/plan card off で一時停止、/plan card on で再開できます。",
          },
          {
            title: "公式 OpenCode にそのまま対応",
            description: "バイナリ差し替え不要。Desktop/CLI の両方で利用可能です。",
          },
          {
            title: "ワンコマンド設定",
            description: "npx setup で設定の追記とバックアップを自動化します。",
          },
        ],
      },
      quickstart: {
        title: "30秒クイックスタート",
        subtitle: "初回導入は次の3ステップが最短です。",
        stepsTitle: "手順",
        steps: [
          "setup コマンドを実行して設定を反映。",
          "OpenCode を再起動。",
          "Plan agent で要件を入力して動作確認。",
        ],
        commandsTitle: "推奨コマンド",
        commands: [{ label: "導入 / 更新", code: commands.setup }],
        checklistTitle: "確認ポイント",
        checklist: [
          "Plan でカード型質問がデフォルト表示される。",
          "/plan card off で通常 Plan に戻る。",
          "/plan card on でカードモードに戻る。",
        ],
      },
      manual: {
        title: "詳細操作マニュアル",
        subtitle: "導入・更新・切替・設定・障害対応を網羅。",
        sections: [
          {
            title: "1) 新規インストール",
            description: "JSON 手修正のミスを避けるため setup 推奨。",
            bullets: [
              "opencode.json を自動バックアップ。",
              "plugin: [\"opencode-plan-cards-plugin@latest\"] を追加。",
              "agent.ask.hidden = true を追加。",
            ],
            codeBlocks: [{ label: "セットアップ", code: commands.setup }],
          },
          {
            title: "2) 旧バージョンから更新",
            description: "setup は冪等のため何度実行しても安全です。",
            bullets: [
              "再実行で最新へ更新可能。",
              "plugin 配列で重複読込を確認。",
              "npm と file:// の二重登録は避ける。",
            ],
            codeBlocks: [{ label: "更新コマンド", code: commands.setup }],
          },
          {
            title: "3) セッション制御（チャット欄で入力）",
            description: "以下はターミナルではなく OpenCode 会話欄で使います。",
            bullets: [
              "デフォルト: Plan でカードモード有効。",
              "一時停止: /plan card off。",
              "再有効化: /plan card on。",
            ],
            codeBlocks: [
              { label: "このセッションで無効化", code: commands.disable },
              { label: "このセッションで有効化", code: commands.enable },
            ],
          },
          {
            title: "4) 設定ファイル参考",
            description: "手動設定時の最小構成。",
            bullets: [
              "Windows: C:\\Users\\<user>\\.config\\opencode\\opencode.json",
              "macOS/Linux: ~/.config/opencode/opencode.json",
            ],
            codeBlocks: [
              {
                label: "最小 opencode.json",
                code: `{
  "plugin": ["opencode-plan-cards-plugin@latest"],
  "agent": {
    "ask": { "hidden": true }
  }
}`,
              },
            ],
          },
          {
            title: "5) トラブルシューティング",
            description: "「再起動後に効かない」報告時の確認順。",
            bullets: [
              "Plan agent で実行しているか確認。",
              "/plan card on を端末で実行していないか確認。",
              "plugin の重複読込（npm + file://）を確認。",
              "npm registry を確認。",
              "Node バージョンが 18 以上か確認。",
            ],
            codeBlocks: [
              { label: "registry 確認", code: commands.checkRegistry },
              { label: "Node 確認", code: commands.checkNode },
            ],
          },
        ],
      },
      commandTable: {
        title: "コマンド速見表",
        subtitle: "よく使う操作をそのままコピーできます。",
        head: {
          command: "コマンド",
          desc: "説明",
          action: "コピー",
        },
        rows: [
          { command: commands.setup, desc: "導入/更新（冪等）。" },
          { command: commands.disable, desc: "現在の Plan セッションでカードモードを無効化。" },
          { command: commands.enable, desc: "現在の Plan セッションでカードモードを有効化。" },
          { command: commands.checkRegistry, desc: "npx 失敗時の registry 設定確認。" },
          { command: commands.checkNode, desc: "Node バージョン確認（>=18）。" },
        ],
      },
      faq: {
        title: "FAQ",
        items: [
          {
            q: "再起動後に効果がないのはなぜ？",
            a: "多くは Plan agent 以外での利用、または plugin の二重読込です。setup 再実行後に再起動してください。",
          },
          {
            q: "/plan card on はチャット？端末？",
            a: "OpenCode のチャット欄で入力する会話コマンドです。OS ターミナルではありません。",
          },
          {
            q: "setup を何度も実行すると競合しますか？",
            a: "競合しません。setup は冪等です。問題は npm と file:// の重複設定が主因です。",
          },
          {
            q: "旧版ユーザーをデフォルト有効にするには？",
            a: "npx -y opencode-plan-cards-plugin@latest setup を再実行し、OpenCode を再起動してください。",
          },
        ],
      },
      bottom: {
        title: "役に立ったら Star と Follow をお願いします",
        subtitle: "継続的な改善のモチベーションになります。",
        star: "Star Repo",
        follow: "Follow @SAKURA1175",
        npm: "npm パッケージ",
      },
      footer: {
        note: "© 2026 sakura1175 · opencode-plan-cards-plugin",
        repo: "Repository",
        issues: "Issues",
        license: "License",
      },
      ui: {
        copy: "コピー",
        copied: "コピー済み",
      },
    },
  }
})()
