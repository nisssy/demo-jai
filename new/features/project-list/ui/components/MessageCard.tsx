import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MessageCircle, ExternalLink } from "lucide-react"
import type { ProductViewModel } from "@/new/features/project-list/hooks/useProjectList"

type MessageCardProps = {
  product: ProductViewModel
  onAction: (productId: number) => void
}

const DEPARTMENT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "マネジメント部": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "外注業者": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
}

const DEFAULT_STYLE = { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" }

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "たった今"
  if (diffMin < 60) return `${diffMin}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export const MessageCard = ({ product, onAction }: MessageCardProps) => {
  const msg = product.latestIncomingMessage
  if (!msg) return null

  const style = DEPARTMENT_STYLES[msg.author] ?? DEFAULT_STYLE

  return (
    <div className={`border rounded-lg p-4 bg-white ${style.border}`}>
      <div className="space-y-3">
        {/* 商材ヘッダー */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-700 text-white text-xs">{product.category}</Badge>
              <Badge variant="outline" className="text-xs">{product.eventType}</Badge>
            </div>
            <h4 className="font-medium text-slate-900">
              {product.eventProductName}
            </h4>
          </div>
          <span className="text-xs text-slate-400 shrink-0">
            {formatTimestamp(msg.timestamp)}
          </span>
        </div>

        {/* 基本情報 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {product.eventDate}
          </span>
        </div>

        {/* メッセージプレビュー */}
        <div className={`${style.bg} border ${style.border} rounded-md p-3`}>
          <div className="flex items-start gap-2">
            <MessageCircle className={`h-4 w-4 ${style.text} mt-0.5 shrink-0`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] ${style.text} ${style.border}`}>
                  {msg.author}
                </Badge>
              </div>
              <p className={`text-sm ${style.text} mt-1 line-clamp-2`}>{msg.content}</p>
            </div>
          </div>
        </div>

        {/* アクション */}
        <div className="flex justify-end">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => onAction(product.id)}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            チャットを開く
          </Button>
        </div>
      </div>
    </div>
  )
}
