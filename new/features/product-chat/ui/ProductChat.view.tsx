import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"
import type { ChatChannel } from "@/new/features/product-chat/model/types"
import { ChatChannelView } from "./components/ChatChannelView"

export type ProductChatViewProps = {
  productName: string
  channels: ChatChannel[]
  departments: string[]
  activeChannel: string
  onActiveChannelChange: (channel: string) => void
  onSendMessage: (channel: string, content: string) => void
  currentAuthor?: string
  /** チャンネル内部名 → 画面表示名のマッピング */
  channelDisplayNames?: Record<string, string>
}

/** 部門ごとのアクセントカラー */
const DEPARTMENT_ACCENT: Record<string, string> = {
  "マネジメント部": "border-purple-200",
  "外注業者": "border-orange-200",
  "商材管理課": "border-teal-200",
}

const DEPARTMENT_TAB_ACTIVE: Record<string, string> = {
  "マネジメント部": "bg-purple-50 text-purple-800 border-purple-300",
  "外注業者": "bg-orange-50 text-orange-800 border-orange-300",
  "商材管理課": "bg-teal-50 text-teal-800 border-teal-300",
}

const DEPARTMENT_TAB_INACTIVE: Record<string, string> = {
  "マネジメント部": "text-purple-600 hover:bg-purple-50",
  "外注業者": "text-orange-600 hover:bg-orange-50",
  "商材管理課": "text-teal-600 hover:bg-teal-50",
}

export const ProductChatView = ({
  productName,
  channels,
  departments,
  activeChannel,
  onActiveChannelChange,
  onSendMessage,
  currentAuthor,
  channelDisplayNames = {},
}: ProductChatViewProps) => {
  if (departments.length === 0) {
    return null
  }

  const activeChannelData = channels.find((c) => c.department === activeChannel)
  const activeDisplayName = channelDisplayNames[activeChannel] ?? activeChannel
  const accentBorder = DEPARTMENT_ACCENT[activeDisplayName] ?? "border-slate-200"

  return (
    <Card className={`h-full flex flex-col ${accentBorder}`}>
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          チャット
        </CardTitle>
        <p className="text-xs text-slate-500 mt-0.5">{productName}</p>

        {/* 部門タブ */}
        {departments.length > 1 ? (
          <div className="flex gap-1.5 mt-2">
            {departments.map((dept) => {
              const displayName = channelDisplayNames[dept] ?? dept
              const isActive = dept === activeChannel
              const msgCount = channels.find((c) => c.department === dept)?.messages.length ?? 0
              const activeClass = DEPARTMENT_TAB_ACTIVE[displayName] ?? "bg-slate-100 text-slate-800 border-slate-300"
              const inactiveClass = DEPARTMENT_TAB_INACTIVE[displayName] ?? "text-slate-600 hover:bg-slate-50"

              return (
                <button
                  key={dept}
                  onClick={() => onActiveChannelChange(dept)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${isActive ? activeClass : `border-transparent ${inactiveClass}`}`}
                >
                  {displayName}
                  {msgCount > 0 && (
                    <Badge className="ml-1.5 text-[9px] px-1 py-0 bg-white/50">{msgCount}</Badge>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="mt-2">
            {(() => {
              const displayName = channelDisplayNames[departments[0]] ?? departments[0]
              return (
                <Badge className={`${DEPARTMENT_TAB_ACTIVE[displayName] ?? "bg-slate-100 text-slate-800"} text-xs px-2 py-0.5 border-0`}>
                  {displayName}
                </Badge>
              )
            })()}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        {activeChannelData && (
          <ChatChannelView
            department={channelDisplayNames[activeChannelData.department] ?? activeChannelData.department}
            messages={activeChannelData.messages}
            onSendMessage={(content) => onSendMessage(activeChannelData.department, content)}
            currentAuthor={currentAuthor}
          />
        )}
      </CardContent>
    </Card>
  )
}
