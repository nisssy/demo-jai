import type { DesignRequest, DesignRequestComment } from "@/new/api/types"
import {
  DESIGN_REQUEST_TYPE_LABELS,
  DESIGN_REQUEST_STATUS_LABELS,
} from "@/new/api/display"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, Send, FileText, MessageSquare } from "lucide-react"

// ─── Sub-component: Request Card ───

interface RequestCardProps {
  request: DesignRequest
  isSelected: boolean
  onSelect: (id: string) => void
}

const RequestCard = ({ request, isSelected, onSelect }: RequestCardProps) => {
  const dateRange =
    request.eventStartDate && request.eventEndDate
      ? `${request.eventStartDate} ~ ${request.eventEndDate}`
      : request.eventStartDate ?? ""

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-accent/50 ${
        isSelected ? "border-primary bg-accent" : ""
      }`}
      onClick={() => onSelect(request.id)}
    >
      <CardContent className="p-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {DESIGN_REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType}
          </Badge>
          <StatusBadge status={request.status} />
        </div>
        <p className="text-sm font-medium truncate">{request.projectName}</p>
        {request.hallNames && request.hallNames.length > 0 && (
          <p className="text-xs text-muted-foreground truncate">
            {request.hallNames.join(", ")}
          </p>
        )}
        {dateRange && (
          <p className="text-xs text-muted-foreground">{dateRange}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Sub-component: Status Badge ───

interface StatusBadgeProps {
  status: DesignRequest["status"]
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variant = status === "requested" ? "destructive" : "default"
  return (
    <Badge variant={variant} className="text-xs">
      {DESIGN_REQUEST_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

// ─── Sub-component: Comment Item ───

interface CommentItemProps {
  comment: DesignRequestComment
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  Sales: "bg-blue-100 text-blue-800 border-blue-200",
  DesignVendor: "bg-green-100 text-green-800 border-green-200",
}

const ROLE_LABELS: Record<string, string> = {
  Sales: "営業",
  DesignVendor: "デザイン業者",
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const badgeStyle = ROLE_BADGE_STYLES[comment.role] ?? "bg-gray-100 text-gray-800 border-gray-200"
  const roleLabel = ROLE_LABELS[comment.role] ?? comment.role

  return (
    <div className="border rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{comment.authorName ?? "不明"}</span>
        <Badge variant="outline" className={`text-xs ${badgeStyle}`}>
          {roleLabel}
        </Badge>
        <span className="text-xs text-muted-foreground ml-auto">
          {formatTimestamp(comment.createdAt)}
        </span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
    </div>
  )
}

// ─── Sub-component: Request Detail ───

interface RequestDetailProps {
  request: DesignRequest
  commentText: string
  onCommentTextChange: (text: string) => void
  onFileUpload: (id: string) => void
  onCommentSubmit: (id: string) => void
}

const RequestDetail = ({
  request,
  commentText,
  onCommentTextChange,
  onFileUpload,
  onCommentSubmit,
}: RequestDetailProps) => {
  const dateRange =
    request.eventStartDate && request.eventEndDate
      ? `${request.eventStartDate} ~ ${request.eventEndDate}`
      : request.eventStartDate ?? "-"

  const comments = request.comments ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Info Section */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">依頼詳細</h2>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <InfoRow label="依頼種別" value={DESIGN_REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType} />
          <InfoRow label="案件名" value={request.projectName ?? "-"} />
          <InfoRow label="法人名" value={request.companyName ?? "-"} />
          <InfoRow
            label="ホール"
            value={request.hallNames && request.hallNames.length > 0 ? request.hallNames.join(", ") : "-"}
          />
          <InfoRow label="期間" value={dateRange} />
          <InfoRow label="依頼者" value={request.requestedByName ?? request.requestedBy ?? "-"} />
          <InfoRow label="依頼日時" value={formatTimestamp(request.requestedAt)} />
        </div>

        {/* Action Area */}
        {request.status === "requested" && (
          <div className="pt-2">
            <Button onClick={() => onFileUpload(request.id)} className="gap-2">
              <Upload className="h-4 w-4" />
              ファイルをアップロード
            </Button>
          </div>
        )}

        {request.status === "uploaded" && request.uploadedFileName && (
          <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{request.uploadedFileName}</span>
            {request.uploadedAt && (
              <span className="text-xs">({formatTimestamp(request.uploadedAt)})</span>
            )}
          </div>
        )}
      </div>

      {/* Comment Thread */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-3 pb-2 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">コメント ({comments.length})</h3>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pb-3">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                コメントはありません
              </p>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-4 border-t space-y-2">
          <Textarea
            placeholder="コメントを入力..."
            value={commentText}
            onChange={(e) => onCommentTextChange(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => onCommentSubmit(request.id)}
              disabled={!commentText.trim()}
              size="sm"
              className="gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              送信
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-component: Info Row ───

interface InfoRowProps {
  label: string
  value: string
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div>
    <span className="text-muted-foreground">{label}:</span>{" "}
    <span className="font-medium">{value}</span>
  </div>
)

// ─── Helper ───

function formatTimestamp(isoString: string): string {
  if (!isoString) return "-"
  try {
    const d = new Date(isoString)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${year}/${month}/${day} ${hours}:${minutes}`
  } catch {
    return isoString
  }
}

// ─── Main View ───

export interface DesignVendorDashboardViewProps {
  requestedRequests: DesignRequest[]
  uploadedRequests: DesignRequest[]
  selectedRequest: DesignRequest | null
  selectedRequestId: string | null
  commentText: string
  onCommentTextChange: (text: string) => void
  onSelectRequest: (id: string) => void
  onFileUpload: (id: string) => void
  onCommentSubmit: (id: string) => void
}

export const DesignVendorDashboardView = ({
  requestedRequests,
  uploadedRequests,
  selectedRequest,
  selectedRequestId,
  commentText,
  onCommentTextChange,
  onSelectRequest,
  onFileUpload,
  onCommentSubmit,
}: DesignVendorDashboardViewProps) => {
  return (
    <div className="flex h-full">
      {/* Left Panel: Request List */}
      <div className="w-[350px] border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold">デザイン依頼一覧</h1>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {/* Requested group */}
            {requestedRequests.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Badge variant="destructive" className="text-xs">
                    {DESIGN_REQUEST_STATUS_LABELS["requested"]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({requestedRequests.length}件)
                  </span>
                </div>
                {requestedRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    isSelected={selectedRequestId === req.id}
                    onSelect={onSelectRequest}
                  />
                ))}
              </div>
            )}

            {/* Uploaded group */}
            {uploadedRequests.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Badge variant="default" className="text-xs">
                    {DESIGN_REQUEST_STATUS_LABELS["uploaded"]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({uploadedRequests.length}件)
                  </span>
                </div>
                {uploadedRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    isSelected={selectedRequestId === req.id}
                    onSelect={onSelectRequest}
                  />
                ))}
              </div>
            )}

            {requestedRequests.length === 0 && uploadedRequests.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                デザイン依頼はありません
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel: Detail */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedRequest ? (
          <RequestDetail
            request={selectedRequest}
            commentText={commentText}
            onCommentTextChange={onCommentTextChange}
            onFileUpload={onFileUpload}
            onCommentSubmit={onCommentSubmit}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">左のリストから依頼を選択してください</p>
          </div>
        )}
      </div>
    </div>
  )
}
