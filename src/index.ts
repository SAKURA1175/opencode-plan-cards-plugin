import type { Plugin } from "@opencode-ai/plugin"
import type { Part } from "@opencode-ai/sdk"

type CardModeCommand = "on" | "off"

const CARD_COMMAND_PATTERN = /^\/plan\s+card\s+(on|off)$/i
const cardModeBySession = new Map<string, boolean>()
const lastAgentBySession = new Map<string, string>()

const PLAN_CARD_SYSTEM_APPENDIX = `
Plan card mode is enabled for this session.

Mandatory workflow:
1. Clarify missing requirements before generating a final plan.
2. Use the question tool for clarification and confirmation gates.
3. Ask 1-3 focused questions per round.
4. Each question must represent one decision only, with a short header.
5. Provide 2-3 options per question, each with a short tradeoff description.
6. Keep custom input available (do not add catch-all "Other" options).
7. After clarification, ask one final confirmation question before outputting the final plan.
8. Output one complete actionable plan only after user confirmation.
`.trim()

const QUESTION_TOOL_APPENDIX = `
Card interaction requirements:
- Keep each question focused on one decision.
- Keep header short (<= 30 chars).
- Include 2-3 options with clear tradeoffs.
- Put the recommended option first and suffix it with "(Recommended)" when applicable.
- Do not add "Other" options; rely on custom input support.
`.trim()

function isTextPart(part: Part): part is Extract<Part, { type: "text" }> {
  return part.type === "text"
}

function extractCardModeCommand(parts: Part[]): CardModeCommand | undefined {
  const textParts = parts.filter(isTextPart).filter((part) => !part.synthetic)
  if (textParts.length !== 1) return

  const match = CARD_COMMAND_PATTERN.exec(textParts[0].text.trim())
  if (!match) return
  return match[1].toLowerCase() as CardModeCommand
}

function commandConfirmationPrompt(command: CardModeCommand): string {
  if (command === "on") {
    return [
      "The command /plan card on has already been applied for this session.",
      "Reply with exactly one short confirmation sentence in the user's language.",
      "Do not ask extra questions and do not produce a plan in this reply.",
    ].join("\n")
  }

  return [
    "The command /plan card off has already been applied for this session.",
    "Reply with exactly one short confirmation sentence in the user's language.",
    "Do not ask extra questions and do not produce a plan in this reply.",
  ].join("\n")
}

function appendUniqueDescription(base: string, appendix: string): string {
  const normalized = appendix.trim()
  if (!normalized) return base
  if (base.includes(normalized)) return base
  if (!base.trim()) return normalized
  return `${base.trim()}\n\n${normalized}`
}

function patchQuestionParameters(parameters: any) {
  const questionItem = parameters?.properties?.questions?.items
  const questionProps = questionItem?.properties
  if (!questionProps || typeof questionProps !== "object") return

  if (questionProps.header) {
    questionProps.header.description = "Very short header (<=30 chars) for one decision."
  }

  if (questionProps.question) {
    questionProps.question.description = "Single clear question for one decision."
  }

  if (questionProps.options) {
    questionProps.options.description =
      "Provide 2-3 options; each option must include a short tradeoff description."
  }
}

export const PlanCardsPlugin: Plugin = async () => {
  return {
    event: async ({ event }) => {
      if (event.type !== "session.deleted") return
      const sessionID = (event.properties as { sessionID?: string } | undefined)?.sessionID
      if (!sessionID) return
      cardModeBySession.delete(sessionID)
      lastAgentBySession.delete(sessionID)
    },

    "chat.message": async (input, output) => {
      const sessionID = input.sessionID
      const command = extractCardModeCommand(output.parts)

      if (command) {
        cardModeBySession.set(sessionID, command === "on")
        output.message.agent = "ask"
        output.message.system = appendUniqueDescription(output.message.system ?? "", commandConfirmationPrompt(command))
      }

      lastAgentBySession.set(sessionID, output.message.agent)
    },

    "experimental.chat.system.transform": async (input, output) => {
      if (!input.sessionID) return
      if (!cardModeBySession.get(input.sessionID)) return
      if (lastAgentBySession.get(input.sessionID) !== "plan") return
      output.system.push(PLAN_CARD_SYSTEM_APPENDIX)
    },

    "tool.definition": async (input, output) => {
      if (input.toolID !== "question") return
      output.description = appendUniqueDescription(output.description, QUESTION_TOOL_APPENDIX)
      patchQuestionParameters(output.parameters)
    },
  }
}

export default PlanCardsPlugin
