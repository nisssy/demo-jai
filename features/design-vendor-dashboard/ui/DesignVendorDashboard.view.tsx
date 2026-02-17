import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUp, ChevronRight, MessageSquare, X, Palette, Calendar, Building2, Gift } from "lucide-react"
import type { DesignRequest } from "@/types/lottery"

export type DesignVendorDashboardViewProps = {
  requestsGroupedByStatus: {
    requested: { label: string; requests: DesignRequest[] }
    uploaded: { label: string; requests: DesignRequest[] }
  }
  selectedRequestId: string | null
  selectedRequest: DesignRequest | null
  onSelectRequest: (request: DesignRequest) => void
  onCloseDetail: () => void
  getRequestTypeLabel: (type: DesignRequest["requestType"]) => string

  // アップロード関連
  uploadFileName: string
  showUploadModal: boolean
  onUploadFileNameChange: (name: string) => void
  onOpenUploadModal: (requestId: string) => void
  onUpload: () => void
  onCloseUploadModal: () => void

  // コメント関連
  commentText: string
  showCommentModal: boolean
  onCommentTextChange: (text: string) => void
  onOpenCommentModal: () => void
  onAddComment: () => void
  onCloseCommentModal: () => void
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  requested: "bg-amber-600 text-white",
  uploaded: "bg-green-600 text-white",
}

export const DesignVendorDashboardView = ({
  requestsGroupedByStatus,
  selectedRequestId,
  selectedRequest,
  onSelectRequest,
  onCloseDetail,
  getRequestTypeLabel,
  uploadFileName,
  showUploadModal,
  onUploadFileNameChange,
  onOpenUploadModal,
  onUpload,
  onCloseUploadModal,
  commentText,
  showCommentModal,
  onCommentTextChange,
  onOpenCommentModal,
  onAddComment,
  onCloseCommentModal,
}: DesignVendorDashboardViewProps) => {
  const hasAnyRequests = requestsGroupedByStatus.requested.requests.length > 0 || requestsGroupedByStatus.uploaded.requests.length > 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">デザイン業者 ダッシュボード</h1>
        <p className="text-slate-600 mt-1">デザイン依頼の確認とファイルアップロード</p>
      </div>

      {/* メインコンテンツ: 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左パネル: 依頼一覧 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-indigo-600" />
                デザイン依頼一覧
              </CardTitle>
              <CardDescription>受付中の依頼とアップロード済みの依頼</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasAnyRequests && (
                <div className="text-center py-8 text-slate-500">
                  <Palette className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>デザイン依頼はありません</p>
                </div>
              )}

              {/* 依頼受付中 */}
              {requestsGroupedByStatus.requested.requests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">
                    {requestsGroupedByStatus.requested.label}
                    <span className="ml-1.5 text-slate-400">({requestsGroupedByStatus.requested.requests.length})</span>
                  </h3>
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {requestsGroupedByStatus.requested.requests.map((req) => (
                      <li key={req.id}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-between h-auto py-3 px-4 ${
                            req.id === selectedRequestId ? "bg-indigo-50 border-l-4 border-l-indigo-500" : ""
                          }`}
                          onClick={() => onSelectRequest(req)}
                        >
                          <div className="flex flex-col items-start gap-1.5 text-left flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={STATUS_BADGE_CLASS.requested}>受付中</Badge>
                              <span className="font-medium text-slate-900">{getRequestTypeLabel(req.requestType)}</span>
                            </div>
                            <span className="text-xs text-slate-500">案件: {req.projectName || req.projectNumber}</span>
                            <span className="text-xs text-slate-500">依頼日: {new Date(req.requestedAt).toLocaleDateString("ja-JP")}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 ml-2" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* アップロード済み */}
              {requestsGroupedByStatus.uploaded.requests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">
                    {requestsGroupedByStatus.uploaded.label}
                    <span className="ml-1.5 text-slate-400">({requestsGroupedByStatus.uploaded.requests.length})</span>
                  </h3>
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {requestsGroupedByStatus.uploaded.requests.map((req) => (
                      <li key={req.id}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-between h-auto py-3 px-4 ${
                            req.id === selectedRequestId ? "bg-indigo-50 border-l-4 border-l-indigo-500" : ""
                          }`}
                          onClick={() => onSelectRequest(req)}
                        >
                          <div className="flex flex-col items-start gap-1.5 text-left flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={STATUS_BADGE_CLASS.uploaded}>完了</Badge>
                              <span className="font-medium text-slate-900">{getRequestTypeLabel(req.requestType)}</span>
                            </div>
                            <span className="text-xs text-slate-500">案件: {req.projectName || req.projectNumber}</span>
                            <span className="text-xs text-slate-500">
                              アップロード日: {req.uploadedAt ? new Date(req.uploadedAt).toLocaleDateString("ja-JP") : "-"}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 ml-2" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右パネル: 依頼詳細 */}
        <div className="lg:col-span-2">
          {!selectedRequest && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  <Palette className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p>左の一覧からデザイン依頼を選択してください</p>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedRequest && (
            <div className="space-y-6">
              {/* 依頼詳細カード */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getRequestTypeLabel(selectedRequest.requestType)}デザイン依頼
                        <Badge className={STATUS_BADGE_CLASS[selectedRequest.status]}>
                          {selectedRequest.status === "requested" ? "受付中" : "完了"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">依頼ID: {selectedRequest.id}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onCloseDetail}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 案件情報 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-slate-600">案件番号</Label>
                      <p className="font-medium">{selectedRequest.projectNumber || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">案件名</Label>
                      <p className="font-medium">{selectedRequest.projectName || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">法人名</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        {selectedRequest.companyName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">依頼日</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(selectedRequest.requestedAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>

                  {/* ホール情報 */}
                  {selectedRequest.hallNames && selectedRequest.hallNames.length > 0 && (
                    <div>
                      <Label className="text-sm text-slate-600 mb-2 block">対象ホール</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.hallNames.map((hall, idx) => (
                          <Badge key={idx} variant="secondary">
                            {hall}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 期間 */}
                  {selectedRequest.eventStartDate && selectedRequest.eventEndDate && (
                    <div>
                      <Label className="text-sm text-slate-600">イベント期間</Label>
                      <p className="font-medium">
                        {selectedRequest.eventStartDate} 〜 {selectedRequest.eventEndDate}
                      </p>
                    </div>
                  )}

                  {/* 景品情報（当選通知書の場合） */}
                  {selectedRequest.requestType === "winner-list" && selectedRequest.prizeInfo && selectedRequest.prizeInfo.length > 0 && (
                    <div>
                      <Label className="text-sm text-slate-600 mb-2 block flex items-center gap-1">
                        <Gift className="h-4 w-4" />
                        景品情報
                      </Label>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-3 py-2 text-left">順位</th>
                              <th className="px-3 py-2 text-left">景品名</th>
                              <th className="px-3 py-2 text-left">数量</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedRequest.prizeInfo.map((prize, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2">{prize.rank}</td>
                                <td className="px-3 py-2">{prize.name}</td>
                                <td className="px-3 py-2">{prize.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* アップロード情報 */}
                  {selectedRequest.status === "uploaded" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <Label className="text-sm text-green-700 mb-1 block">アップロード済み</Label>
                      <p className="text-sm font-medium">{selectedRequest.uploadedFileName}</p>
                      {selectedRequest.uploadedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          アップロード日時: {new Date(selectedRequest.uploadedAt).toLocaleString("ja-JP")}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* アクションボタン */}
              {selectedRequest.status === "requested" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">アクション</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full gap-2" onClick={() => onOpenUploadModal(selectedRequest.id)}>
                      <FileUp className="h-4 w-4" />
                      デザインファイルをアップロード
                    </Button>
                    <Button variant="outline" className="w-full gap-2" onClick={onOpenCommentModal}>
                      <MessageSquare className="h-4 w-4" />
                      コメントを追加
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* コメント履歴 */}
              {selectedRequest.comments && selectedRequest.comments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-slate-600" />
                      コメント履歴
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedRequest.comments.map((comment) => (
                        <div key={comment.id} className={`p-3 rounded-lg ${comment.role === "Sales" ? "bg-blue-50" : "bg-indigo-50"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{comment.authorName}</span>
                            <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString("ja-JP")}</span>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* アップロードモーダル */}
      <Dialog open={showUploadModal} onOpenChange={onCloseUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>デザインファイルをアップロード</DialogTitle>
            <DialogDescription>デザインファイル名を入力してください（デモ用）</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="upload-file-name">ファイル名</Label>
              <Input
                id="upload-file-name"
                placeholder="例: poster_design_final.pdf"
                value={uploadFileName}
                onChange={(e) => onUploadFileNameChange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseUploadModal}>
              キャンセル
            </Button>
            <Button onClick={onUpload} disabled={!uploadFileName.trim()}>
              アップロード
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* コメント追加モーダル */}
      <Dialog open={showCommentModal} onOpenChange={onCloseCommentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>コメントを追加</DialogTitle>
            <DialogDescription>営業担当者へのコメントや質問を入力してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment-text">コメント</Label>
              <Textarea
                id="comment-text"
                placeholder="コメントを入力..."
                value={commentText}
                onChange={(e) => onCommentTextChange(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseCommentModal}>
              キャンセル
            </Button>
            <Button onClick={onAddComment} disabled={!commentText.trim()}>
              送信
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
