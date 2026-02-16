import type { ChatMessage } from "@/new/api/types"

/** チャットチャンネル（部門） */
export type ChatChannel = {
  department: string
  messages: ChatMessage[]
}
