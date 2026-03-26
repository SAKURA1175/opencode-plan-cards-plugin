import type { Plugin } from "@opencode-ai/plugin";
import type { Part } from "@opencode-ai/sdk";

type CardModeCommand = "on" | "off";
type PlanField = "objective" | "scope" | "constraints" | "acceptance";
type PlanState = {
  enabled?: boolean;
  userTexts: string[];
  clarificationRounds: number;
};

const CARD_COMMAND_PATTERN = /^\/plan\s+card\s+(on|off)$/i;
const DEFAULT_CARD_MODE = true;
const sessionState = new Map<string, PlanState>();
const lastAgentBySession = new Map<string, string>();

const QUESTION_TOOL_APPENDIX = `
Card interaction requirements:
- Keep each question focused on one decision.
- Keep header short (<= 30 chars).
- Include 2-3 options with clear tradeoffs.
- Put the recommended option first and suffix it with "(Recommended)" when applicable.
- Do not add "Other" options; rely on custom input support.
`.trim();

function isTextPart(part: Part): part is Extract<Part, { type: "text" }> {
  return part.type === "text";
}

function isToolPart(part: Part): part is Extract<Part, { type: "tool" }> {
  return part.type === "tool";
}

function state(sessionID: string): PlanState {
  const existing = sessionState.get(sessionID);
  if (existing) return existing;
  const created = {
    userTexts: [],
    clarificationRounds: 0,
  } satisfies PlanState;
  sessionState.set(sessionID, created);
  return created;
}

function visibleText(parts: Part[]): string {
  return parts
    .filter(isTextPart)
    .filter((part) => !part.synthetic)
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractCardModeCommand(parts: Part[]): CardModeCommand | undefined {
  const textParts = parts.filter(isTextPart).filter((part) => !part.synthetic);
  if (textParts.length !== 1) return;

  const match = CARD_COMMAND_PATTERN.exec(textParts[0].text.trim());
  if (!match) return;
  return match[1].toLowerCase() as CardModeCommand;
}

function commandConfirmationPrompt(command: CardModeCommand): string {
  if (command === "on") {
    return [
      "The command /plan card on has already been applied for this session.",
      "Reply with exactly one short confirmation sentence in the user's language.",
      "Do not ask extra questions and do not produce a plan in this reply.",
    ].join("\n");
  }

  return [
    "The command /plan card off has already been applied for this session.",
    "Reply with exactly one short confirmation sentence in the user's language.",
    "Do not ask extra questions and do not produce a plan in this reply.",
  ].join("\n");
}

function appendUniqueDescription(base: string, appendix: string): string {
  const normalized = appendix.trim();
  if (!normalized) return base;
  if (base.includes(normalized)) return base;
  if (!base.trim()) return normalized;
  return `${base.trim()}\n\n${normalized}`;
}

function isCardModeEnabled(sessionID: string): boolean {
  const mode = sessionState.get(sessionID)?.enabled;
  if (mode === undefined) return DEFAULT_CARD_MODE;
  return mode;
}

function setCardMode(sessionID: string, enabled: boolean) {
  Object.assign(state(sessionID), { enabled });
}

function hasKeyword(text: string, list: string[]) {
  return list.some((item) => text.includes(item));
}

function analyzePlanState(texts: string[]) {
  const merged = texts.join("\n").trim();
  const lower = merged.toLowerCase();
  const lines = merged.split(/\n+/).filter((item) => item.trim());
  const words = merged.split(/\s+/).filter(Boolean);
  const bullets = lines.filter((line) => /^[-*\d.]/.test(line.trim())).length;
  const objective =
    merged.length > 24 ||
    hasKeyword(lower, [
      "fix",
      "add",
      "update",
      "implement",
      "support",
      "remove",
      "refactor",
      "optimize",
      "want",
      "need",
      "修复",
      "新增",
      "更新",
      "实现",
      "支持",
      "优化",
      "需要",
    ]);
  const scope =
    hasKeyword(lower, [
      "ui",
      "api",
      "cli",
      "desktop",
      "plugin",
      "session",
      "workflow",
      "build",
      "plan",
      "test",
      "docs",
      "frontend",
      "backend",
      "component",
      "module",
      "repository",
      "页面",
      "接口",
      "插件",
      "仓库",
      "模块",
      "前端",
      "后端",
      "测试",
    ]) || bullets >= 2;
  const constraints = hasKeyword(lower, [
    "must",
    "should",
    "cannot",
    "can't",
    "don't",
    "without",
    "preserve",
    "compatible",
    "compatibility",
    "minimal",
    "no new",
    "avoid",
    "keep",
    "require",
    "必须",
    "不能",
    "不要",
    "兼容",
    "保留",
    "最小改动",
    "不引入",
  ]);
  const acceptance = hasKeyword(lower, [
    "verify",
    "verification",
    "test",
    "works",
    "working",
    "should be able",
    "done when",
    "expected",
    "success",
    "acceptance",
    "验证",
    "测试",
    "成功",
    "完成条件",
    "应该",
    "可以",
    "能够",
    "自动切换",
  ]);
  const ambiguous = hasKeyword(lower, [
    "maybe",
    "not sure",
    "help me",
    "look at",
    "improve",
    "better",
    "something",
    "看看",
    "优化一下",
    "不太确定",
  ]);
  const bounded = hasKeyword(lower, [
    "just",
    "only",
    "simple",
    "small",
    "minor",
    "quick",
    "just need",
    "只是",
    "仅",
    "小改",
    "顺手",
  ]);
  const hard = hasKeyword(lower, [
    "architecture",
    "migration",
    "security",
    "database",
    "performance",
    "release",
    "multi",
    "complex",
    "integrat",
    "cross",
    "架构",
    "迁移",
    "安全",
    "数据库",
    "性能",
    "发布",
    "多端",
    "复杂",
    "集成",
  ]);

  const fields = { objective, scope, constraints, acceptance };
  const missing = Object.entries(fields)
    .filter(([, known]) => !known)
    .map(([name]) => name as PlanField);
  const score =
    (words.length > 120 ? 2 : words.length > 40 ? 1 : 0) +
    (bullets >= 3 ? 1 : 0) +
    (hard ? 2 : 0) +
    (ambiguous ? 1 : 0) +
    (constraints ? 1 : 0) +
    Math.min(missing.length, 2) -
    (bounded ? 1 : 0);

  if (score <= 1) {
    return {
      level: "low",
      fields,
      missing,
      maxRounds: 1,
      maxQuestions: 2,
      perRound: 1,
    };
  }

  if (score <= 3) {
    return {
      level: "medium",
      fields,
      missing,
      maxRounds: 2,
      maxQuestions: 4,
      perRound: 2,
    };
  }

  return {
    level: "high",
    fields,
    missing,
    maxRounds: 3,
    maxQuestions: 6,
    perRound: 2,
  };
}

function label(field: PlanField) {
  if (field === "objective") return "objective";
  if (field === "scope") return "scope";
  if (field === "constraints") return "constraints";
  return "acceptance criteria";
}

function status(field: boolean) {
  return field ? "known" : "missing";
}

function planCardSystemAppendix(sessionID: string): string {
  const snapshot = state(sessionID);
  const analysis = analyzePlanState(snapshot.userTexts);
  const remainingRounds = Math.max(
    analysis.maxRounds - snapshot.clarificationRounds,
    0,
  );
  const remainingQuestions = Math.max(
    analysis.maxQuestions - snapshot.clarificationRounds * analysis.perRound,
    0,
  );
  const nextQuestions = Math.min(
    analysis.perRound,
    Math.max(analysis.missing.length, 1),
    Math.max(remainingQuestions, analysis.missing.length === 0 ? 1 : 0),
  );
  const ready =
    analysis.missing.length === 0 ||
    remainingRounds === 0 ||
    remainingQuestions === 0;

  return `
Plan card mode is enabled for this session.

Clarification state machine:
- Complexity level: ${analysis.level}.
- objective: ${status(analysis.fields.objective)}.
- scope: ${status(analysis.fields.scope)}.
- constraints: ${status(analysis.fields.constraints)}.
- acceptance criteria: ${status(analysis.fields.acceptance)}.
- Missing fields: ${analysis.missing.length ? analysis.missing.map(label).join(", ") : "none"}.
- Clarification rounds already used: ${snapshot.clarificationRounds}/${analysis.maxRounds}.
- Remaining clarification budget: ${remainingQuestions} question(s).

Clarification policy:
- Do not use a fixed number of follow-up questions.
- Ask only for missing fields that materially change implementation.
- Collapse related unknowns into the minimum viable number of questions.
- Low-risk gaps should become explicit assumptions in the final plan instead of extra questions.
- If objective, scope, constraints, and acceptance criteria are all clear, stop clarifying immediately.

Next-step policy:
${
  ready
    ? "- Do not ask more clarification questions. Ask exactly one final confirmation question via the question tool, then finalize the plan after confirmation."
    : `- Ask at most ${nextQuestions} high-value clarification question(s) in this turn, focused only on the missing fields above.`
}

Mandatory workflow:
0. Keep all existing core plan-mode requirements from the host OpenCode version.
1. Clarify missing requirements before generating a final plan.
2. Use the question tool for clarification and confirmation gates.
3. Each question must represent one decision only, with a short header.
4. Provide 2-3 options per question, each with a short tradeoff description.
5. Keep custom input available (do not add catch-all "Other" options).
6. After clarification, ask one final confirmation question before outputting the final plan.
7. Output one complete actionable plan only after user confirmation.
8. When planning artifacts are complete, call plan_exit exactly once to switch back to build mode.
`.trim();
}

function patchQuestionParameters(parameters: any) {
  const questionItem = parameters?.properties?.questions?.items;
  const questionProps = questionItem?.properties;
  if (!questionProps || typeof questionProps !== "object") return;

  if (questionProps.header) {
    questionProps.header.description =
      "Very short header (<=30 chars) for one decision.";
  }

  if (questionProps.question) {
    questionProps.question.description =
      "Single clear question for one decision.";
  }

  if (questionProps.options) {
    questionProps.options.description =
      "Provide 2-3 options; each option must include a short tradeoff description.";
  }
}

export const PlanCardsPlugin: Plugin = async () => {
  return {
    event: async ({ event }) => {
      if (event.type !== "session.deleted") return;
      const sessionID = (event.properties as { sessionID?: string } | undefined)
        ?.sessionID;
      if (!sessionID) return;
      sessionState.delete(sessionID);
      lastAgentBySession.delete(sessionID);
    },

    "chat.message": async (input, output) => {
      const sessionID = input.sessionID;
      const command = extractCardModeCommand(output.parts);
      const text = visibleText(output.parts);
      const snapshot = state(sessionID);

      if (command) {
        setCardMode(sessionID, command === "on");
        output.message.agent = "ask";
        output.message.system = appendUniqueDescription(
          output.message.system ?? "",
          commandConfirmationPrompt(command),
        );
      }

      if (text && !command) {
        snapshot.userTexts = [...snapshot.userTexts, text].slice(-8);
      }

      if (
        output.message.agent === "plan" &&
        output.parts.some(
          (part) => isToolPart(part) && part.tool === "question",
        )
      ) {
        snapshot.clarificationRounds += 1;
      }

      lastAgentBySession.set(sessionID, output.message.agent);
    },

    "experimental.chat.system.transform": async (input, output) => {
      if (!input.sessionID) return;
      if (!isCardModeEnabled(input.sessionID)) return;
      if (lastAgentBySession.get(input.sessionID) !== "plan") return;
      output.system.push(planCardSystemAppendix(input.sessionID));
    },

    "tool.definition": async (input, output) => {
      if (input.toolID !== "question") return;
      output.description = appendUniqueDescription(
        output.description,
        QUESTION_TOOL_APPENDIX,
      );
      patchQuestionParameters(output.parameters);
    },
  };
};

export default PlanCardsPlugin;
