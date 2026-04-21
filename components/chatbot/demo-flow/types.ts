export type UserMessageOrigin = "services" | "manual"

export type AssistantStep =
  | "services_first"
  | "services_v3"
  | "services_followup"
  | "services_combined_v4"
  | "parking_body"
  | "parking_source"
  | "parking_followup"
  | "parking_combined_v4"
  | "hospital_address"

export interface ChatUserMessage {
  id: string
  kind: "user"
  text: string
  origin: UserMessageOrigin
}

export interface ChatAssistantMessage {
  id: string
  kind: "assistant"
  step: AssistantStep
  /** Grows during progressive_chunks playback; for full_message may be prefilled or unused for structured steps */
  displayText: string
  /** After progressive stream completes or immediately for full_message */
  revealComplete: boolean
  /** When true, services_first uses structured copy; parking_body uses plain body from parking copy via displayText? Actually parking structured uses RichBlockLines from displayText filled at start for full_message */
  playbackStructured: boolean
  /** V4 progressive: true after answer stream finishes so sources + follow-up render in the same bubble */
  combinedTailVisible?: boolean
}

export type ChatMessage = ChatUserMessage | ChatAssistantMessage

export function isAssistantMessage(m: ChatMessage): m is ChatAssistantMessage {
  return m.kind === "assistant"
}

export function isUserMessage(m: ChatMessage): m is ChatUserMessage {
  return m.kind === "user"
}
