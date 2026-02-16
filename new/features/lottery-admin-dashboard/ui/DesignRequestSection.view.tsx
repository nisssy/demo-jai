import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import type { DesignRequest } from "@/new/api/types"
import {
  DESIGN_REQUEST_TYPE_LABELS,
  DESIGN_REQUEST_STATUS_LABELS,
} from "@/new/api/display"

export interface DesignRequestSectionViewProps {
  designRequests: DesignRequest[]
  commentText: string
  onCommentTextChange: (text: string) => void
  onAddComment: (requestId: string) => void
}

const requestTypeBadgeColor: Record<string, string> = {
  poster: "bg-blue-100 text-blue-800",
  dm: "bg-purple-100 text-purple-800",
  "winner-list": "bg-orange-100 text-orange-800",
}

const statusBadgeColor: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  uploaded: "bg-green-100 text-green-800",
}

export const DesignRequestSectionView = ({
  designRequests,
  commentText,
  onCommentTextChange,
  onAddComment,
}: DesignRequestSectionViewProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-base font-bold">デザイン依頼</h3>
      </CardHeader>
      <CardContent>
        {designRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            デザイン依頼がありません
          </p>
        ) : (
          <div className="space-y-4">
            {designRequests.map((request) => (
              <div key={request.id} className="border rounded-md p-3">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-xs ${requestTypeBadgeColor[request.requestType] ?? ""}`}>
                    {DESIGN_REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType}
                  </Badge>
                  <Badge className={`text-xs ${statusBadgeColor[request.status] ?? ""}`}>
                    {DESIGN_REQUEST_STATUS_LABELS[request.status] ?? request.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {request.vendorName ?? request.vendorId}
                  </span>
                </div>

                {/* Meta info */}
                <div className="text-xs text-muted-foreground mb-2">
                  <span>依頼日: {new Date(request.requestedAt).toLocaleDateString("ja-JP")}</span>
                  {request.uploadedAt && (
                    <span className="ml-3">
                      アップロード日: {new Date(request.uploadedAt).toLocaleDateString("ja-JP")}
                    </span>
                  )}
                  {request.uploadedFileName && (
                    <span className="ml-3">ファイル: {request.uploadedFileName}</span>
                  )}
                </div>

                {/* Comments */}
                {request.comments && request.comments.length > 0 && (
                  <div className="space-y-2 mt-3 border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground">コメント</p>
                    {request.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-muted/50 rounded-md p-2 text-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs">
                            {comment.authorName ?? comment.role}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString("ja-JP")}
                          </span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment */}
                <div className="mt-3 flex gap-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => onCommentTextChange(e.target.value)}
                    placeholder="コメントを入力..."
                    className="text-sm min-h-[60px]"
                  />
                  <Button
                    onClick={() => onAddComment(request.id)}
                    size="sm"
                    className="shrink-0 self-end"
                    disabled={!commentText.trim()}
                  >
                    送信
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
