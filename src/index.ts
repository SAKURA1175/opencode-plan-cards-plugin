import type { Plugin } from "@opencode-ai/plugin";
import type { Part } from "@opencode-ai/sdk";

type CardModeCommand = "on" | "off";

const CARD_COMMAND_PATTERN = /^\/plan\s+card\s+(on|off)$/i;
const DEFAULT_CARD_MODE = true;
const cardModeBySession = new Map<string, boolean>();
const lastAgentBySession = new Map<string, string>();
const lastUserTextBySession = new Map<string, string>();

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
  const mode = cardModeBySession.get(sessionID);
  if (mode === undefined) return DEFAULT_CARD_MODE;
  return mode;
}

function planProfile(text: string) {
  const lower = text.toLowerCase();
  const lines = text.split(/\n+/).filter((x) => x.trim());
  const words = text.split(/\s+/).filter(Boolean);
  const bullets = lines.filter((line) => /^[-*\d.]/.test(line.trim())).length;
  const hard = [
    "architecture",
    "refactor",
    "migration",
    "performance",
    "security",
    "auth",
    "database",
    "plugin",
    "workflow",
    "release",
    "multi",
    "complex",
    "integrat",
  ].some((token) => lower.includes(token));
  const bounded = [
    "just",
    "only",
    "simple",
    "small",
    "minor",
    "typo",
    "quick",
    "bug",
    "fix this",
  ].some((token) => lower.includes(token));
  const ambiguous = [
    "maybe",
    "not sure",
    "help me",
    "look at",
    "optimize",
    "improve",
    "support",
    "better",
    "something",
  ].some((token) => lower.includes(token));
  const constrained = [
    "must",
    "should",
    "cannot",
    "don't",
    "compat",
    "preserve",
    "without",
    "need to",
    "require",
  ].some((token) => lower.includes(token));

  const score =
    (words.length > 120 ? 2 : words.length > 40 ? 1 : 0) +
    (bullets >= 3 ? 1 : 0) +
    (hard ? 2 : 0) +
    (ambiguous ? 1 : 0) +
    (constrained ? 1 : 0) -
    (bounded ? 1 : 0);

  if (score <= 1) {
    return {
      level: "low",
      rounds: "usually 1 round",
      questions:
        "ask 1 focused question by default; ask 2 only if one key blocker remains",
      total: "hard cap: 2 clarification questions before confirmation",
    };
  }

  if (score <= 3) {
    return {
      level: "medium",
      rounds: "usually 1-2 rounds",
      questions: "ask 1-2 focused questions per round",
      total: "hard cap: 4 clarification questions before confirmation",
    };
  }

  return {
    level: "high",
    rounds: "usually 2 rounds",
    questions:
      "ask 2 focused questions per round; use 3 only when multiple critical unknowns remain",
    total: "hard cap: 6 clarification questions before confirmation",
  };
}

function planCardSystemAppendix(text: string): string {
  const profile = planProfile(text);
  return `
Plan card mode is enabled for this session.

Questioning policy:
- Estimate request complexity from the latest user request. Current complexity: ${profile.level}.
- Do not use a fixed number of follow-up questions. Stop as soon as the implementation is clear.
- ${profile.rounds}.
- ${profile.questions}.
- ${profile.total}.
- Prefer combining related unknowns into the minimum viable number of questions.
- If the user already provided clear scope, constraints, and acceptance criteria, skip straight to confirmation.

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
      cardModeBySession.delete(sessionID);
      lastAgentBySession.delete(sessionID);
      lastUserTextBySession.delete(sessionID);
    },

    "chat.message": async (input, output) => {
      const sessionID = input.sessionID;
      const command = extractCardModeCommand(output.parts);
      const text = visibleText(output.parts);

      if (text) {
        lastUserTextBySession.set(sessionID, text);
      }

      if (command) {
        cardModeBySession.set(sessionID, command === "on");
        output.message.agent = "ask";
        output.message.system = appendUniqueDescription(
          output.message.system ?? "",
          commandConfirmationPrompt(command),
        );
      }

      lastAgentBySession.set(sessionID, output.message.agent);
    },

    "experimental.chat.system.transform": async (input, output) => {
      if (!input.sessionID) return;
      if (!isCardModeEnabled(input.sessionID)) return;
      if (lastAgentBySession.get(input.sessionID) !== "plan") return;
      output.system.push(
        planCardSystemAppendix(
          lastUserTextBySession.get(input.sessionID) ?? "",
        ),
      );
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
