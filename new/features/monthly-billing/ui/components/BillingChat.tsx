import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { BillingChatMessage } from "@/new/api/types"

const AUTHOR_STYLES: Record<string, string> = {
  "事務管理課": "bg-amber-100 text-amber-800",
  "景品業者": "bg-emerald-100 text-emerald-800",
  "デザイン業者": "bg-pink-100 text-pink-800",
}

interface BillingChatProps {
  messages: BillingChatMessage[]
  chatText: string
  onChatTextChange: (text: string) => void
  onSend: () => void
  currentAuthor: string
}

export const BillingChat = ({
  messages,
  chatText,
  onChatTextChange,
  onSend,
  currentAuthor,
}: BillingChatProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (chatText.trim()) onSend()
    }
  }

  return (
    <div className="flex flex-col">
      <h4 className="text-sm font-medium mb-2">チャット</h4>
      <div ref={scrollRef} className="h-[240px] overflow-y-auto border rounded-md p-3 space-y-3 mb-2">
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            メッセージはまだありません
          </p>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.author === currentAuthor
            return (
              <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1 mb-0.5">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      AUTHOR_STYLES[msg.author] ?? "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.author}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div
                  className={`text-sm rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap ${
                    isMe ? "bg-amber-50 text-amber-900" : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className="flex gap-2">
        <Textarea
          value={chatText}
          onChange={(e) => onChatTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Cmd+Enter で送信)"
          className="resize-none h-16 text-sm"
        />
        <Button
          onClick={onSend}
          disabled={!chatText.trim()}
          size="sm"
          className="shrink-0 self-end"
        >
          送信
        </Button>
      </div>
    </div>
  )
}
