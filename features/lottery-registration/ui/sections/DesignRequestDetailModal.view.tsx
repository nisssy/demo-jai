import type { DesignRequest } from "@/types/lottery"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Send, CheckCircle2, ArrowLeft } from "lucide-react"

export type DesignRequestDetailModalViewProps = {
  request: DesignRequest
  commentText: string
  onCommentTextChange: (value: string) => void
  onSendComment: () => void
  onClose: () => void
}

export function DesignRequestDetailModalView({
  request,
  commentText,
  onCommentTextChange,
  onSendComment,
  onClose,
}: DesignRequestDetailModalViewProps) {
  const typeLabel = request.requestType === "poster" ? "ポスター" : request.requestType === "dm" ? "DM" : "当選通知書"

  return (
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-sm">{typeLabel}依頼 詳細・コメント</DialogTitle>
        <DialogDescription className="text-xs">{request.projectName || request.companyName}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {/* 依頼内容 */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <Label className="text-[10px] text-slate-400">依頼元</Label>
            <div className="font-medium mt-0.5">{request.requestedByName ?? "営業"}</div>
          </div>
          <div>
            <Label className="text-[10px] text-slate-400">発注先</Label>
            <div className="font-medium mt-0.5">{request.vendorName ?? "-"}</div>
          </div>
          <div>
            <Label className="text-[10px] text-slate-400">案件</Label>
            <div className="font-medium mt-0.5">{request.projectName || request.companyName}</div>
          </div>
          <div>
            <Label className="text-[10px] text-slate-400">会場</Label>
            <div className="font-medium mt-0.5">{Array.isArray(request.hallNames) ? request.hallNames.join(", ") : ""}</div>
          </div>
          {request.eventStartDate && (
            <div className="col-span-2">
              <Label className="text-[10px] text-slate-400">開催日</Label>
              <div className="font-medium mt-0.5">{request.eventStartDate} 〜 {request.eventEndDate}</div>
            </div>
          )}
        </div>

        {/* アップロード状態 */}
        {request.status === "uploaded" ? (
          <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>アップロード済み: {request.uploadedFileName}
              {request.uploadedAt && <span className="text-slate-500 ml-1">（{new Date(request.uploadedAt).toLocaleString("ja")}）</span>}
            </span>
          </div>
        ) : (
          <div className="p-2.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            依頼済み — デザイン業者のアップロード待ち
          </div>
        )}

        {/* コメント */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">コメント</Label>
          <div className="rounded border p-2 bg-slate-50 space-y-1.5 max-h-40 overflow-y-auto">
            {(!request.comments || request.comments.length === 0) ? (
              <p className="text-xs text-slate-400">まだコメントはありません</p>
            ) : (
              request.comments.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="font-medium text-slate-500">
                    {c.role === "Sales" ? "営業・事務管理課" : "デザイン業者"}
                    {c.authorName && `（${c.authorName}）`}:
                  </span>{" "}
                  {c.text}
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {new Date(c.createdAt).toLocaleString("ja")}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="返信や確認メッセージを入力"
              value={commentText}
              onChange={(e) => onCommentTextChange(e.target.value)}
              rows={2}
              className="resize-none flex-1 text-xs"
            />
            <Button
              size="sm"
              className="shrink-0 text-xs gap-1"
              onClick={onSendComment}
            >
              <Send className="h-3 w-3" />
              送信
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-start pt-2">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          閉じる
        </Button>
      </div>
    </DialogContent>
  )
}
