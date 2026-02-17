import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send } from "lucide-react"
import type { ChatMessage } from "@/new/api/types"

type ChatChannelViewProps = {
  department: string
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  currentAuthor?: string
}

/** 発言者ロールごとの色 */
const AUTHOR_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  "営業": { bg: "bg-blue-50", text: "text-blue-900", badge: "bg-blue-100 text-blue-700" },
  "マネジメント部": { bg: "bg-purple-50", text: "text-purple-900", badge: "bg-purple-100 text-purple-700" },
  "外注業者": { bg: "bg-orange-50", text: "text-orange-900", badge: "bg-orange-100 text-orange-700" },
  "商材管理課": { bg: "bg-teal-50", text: "text-teal-900", badge: "bg-teal-100 text-teal-700" },
  "事務管理課": { bg: "bg-amber-50", text: "text-amber-900", badge: "bg-amber-100 text-amber-700" },
  "デザイン業者": { bg: "bg-pink-50", text: "text-pink-900", badge: "bg-pink-100 text-pink-700" },
  "景品業者": { bg: "bg-emerald-50", text: "text-emerald-900", badge: "bg-emerald-100 text-emerald-700" },
}

const DEFAULT_COLOR = { bg: "bg-slate-50", text: "text-slate-900", badge: "bg-slate-100 text-slate-700" }

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${month}/${day} ${hours}:${minutes}`
  } catch {
    return ts
  }
}

export const ChatChannelView = ({ department, messages, onSendMessage, currentAuthor }: ChatChannelViewProps) => {
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const deptColor = AUTHOR_COLORS[department] ?? DEFAULT_COLOR

  return (
    <div className="flex flex-col h-full">
      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className={`w-10 h-10 rounded-full ${deptColor.bg} flex items-center justify-center mb-3`}>
              <span className={`text-sm font-medium ${deptColor.text}`}>{department[0]}</span>
            </div>
            <p className="text-sm">{department}とのチャット</p>
            <p className="text-xs mt-1">メッセージはまだありません</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSelf = msg.author === (currentAuthor ?? "営業")
            const colors = AUTHOR_COLORS[msg.author] ?? DEFAULT_COLOR

            return (
              <div key={i} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Badge className={`${colors.badge} text-[10px] px-1.5 py-0 font-normal`}>
                    {msg.author}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{formatTimestamp(msg.timestamp)}</span>
                </div>
                <div className={`${colors.bg} ${colors.text} rounded-lg px-3 py-2 text-sm max-w-[90%] whitespace-pre-wrap`}>
                  {msg.content}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 入力エリア */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${department}にメッセージを送信...`}
            className="flex-1 resize-none border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[36px] max-h-[100px]"
            rows={1}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 ml-1">Cmd + Enter で送信</p>
      </div>
    </div>
  )
}
