import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DesignRequest } from "@/new/api/types"
import type { DesignVendorOption } from "../hooks/useLotteryAdminDashboard"

// ─── Step number badge ───

const StepNumber = ({ n }: { n: number }) => (
  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs shrink-0">
    {n}
  </span>
)

// ─── Props ───

export interface NotificationOrderSectionViewProps {
  notificationOrderGeneratedAt?: string
  notificationOrderSentAt?: string
  notificationOrderDesignVendorName?: string
  winnerCount: number
  designVendors: DesignVendorOption[]
  notificationDesignRequests: DesignRequest[]
  notificationCommentText: string
  onNotificationCommentTextChange: (text: string) => void
  onGenerate: () => void
  onSelectVendor: (vendorId: string, vendorName: string) => void
  selectedVendor: { id: string; name: string } | null
  draftDeadline: string
  onDraftDeadlineChange: (value: string) => void
  onRequestSend: () => void
  onConfirmSend: () => void
  onCancelSend: () => void
  pendingVendor: { id: string; name: string } | null
  onAddComment: (requestId: string, text: string) => void
  canGenerate: boolean
}

// ─── Helper ───

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ja-JP")
  } catch {
    return iso
  }
}

// ─── Main View ───

export const NotificationOrderSectionView = ({
  notificationOrderGeneratedAt,
  notificationOrderSentAt,
  notificationOrderDesignVendorName,
  winnerCount,
  designVendors,
  notificationDesignRequests,
  notificationCommentText,
  onNotificationCommentTextChange,
  onGenerate,
  onSelectVendor,
  selectedVendor,
  draftDeadline,
  onDraftDeadlineChange,
  onRequestSend,
  onConfirmSend,
  onCancelSend,
  pendingVendor,
  onAddComment,
  canGenerate,
}: NotificationOrderSectionViewProps) => {
  const isSent = notificationDesignRequests.length > 0

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">当選通知書発注処理</CardTitle>
          <CardDescription className="text-xs">
            1. デザイン業者選択 → 2. 発注書生成 → 3. 発注メール送信 → 4. 業者とのやり取り確認
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* ── Step 1: デザイン業者選択 ── */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <StepNumber n={1} />
              依頼するデザイン業者の選択
            </h4>
            <p className="text-xs text-muted-foreground">
              当選通知書の発注先となるデザイン業者を1社選択してください。
            </p>
            {notificationOrderSentAt && notificationOrderDesignVendorName ? (
              <div className="bg-muted/50 rounded-md p-3 text-sm">
                <span className="text-muted-foreground">選択済み:</span>{" "}
                <span className="font-medium">{notificationOrderDesignVendorName}</span>
                <p className="text-xs text-muted-foreground mt-1">発注依頼送信済みのため変更できません。</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Select
                  value={selectedVendor?.id ?? ""}
                  onValueChange={(value) => {
                    const vendor = designVendors.find((v) => v.id === value)
                    if (vendor) onSelectVendor(vendor.id, vendor.name)
                  }}
                  disabled={isSent}
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="デザイン業者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {designVendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVendor && (
                  <p className="text-xs text-muted-foreground">
                    選択中: <span className="font-medium text-foreground">{selectedVendor.name}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* ── 初稿希望日 ── */}
          <div className="space-y-1.5 max-w-[240px]">
            <Label className="text-xs">初稿希望日</Label>
            <Input
              type="date"
              className="h-9 text-xs"
              value={draftDeadline}
              onChange={(e) => onDraftDeadlineChange(e.target.value)}
            />
          </div>

          <div className="h-px bg-border" />

          {/* ── Step 2: 発注書生成 ── */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <StepNumber n={2} />
              当選通知書発注書の生成
            </h4>
            <p className="text-xs text-muted-foreground">
              当選者リストを元に当選通知書発注書を生成します。
            </p>
            {!notificationOrderGeneratedAt ? (
              <Button onClick={onGenerate} size="sm" disabled={!canGenerate}>
                発注書を生成
              </Button>
            ) : (
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm space-y-1">
                <p className="font-medium">発注書を生成しました</p>
                <p className="text-xs text-muted-foreground">
                  当選者数: {winnerCount}名 ／ 出力形式: はがき印刷用・DM発送用
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* ── Step 3: メール送信 ── */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <StepNumber n={3} />
              発注依頼メールの送信
            </h4>
            {isSent ? (
              <div className="space-y-2">
                <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm">
                  <p className="font-medium">発注メール送信済み</p>
                  {notificationDesignRequests.map((r) => (
                    <div key={r.id} className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{r.vendorName ?? r.vendorId}</span>
                      <span>{fmtDate(r.requestedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : !notificationOrderGeneratedAt || !selectedVendor ? (
              <p className="text-xs text-muted-foreground">
                {!notificationOrderGeneratedAt && !selectedVendor
                  ? "Step 1 でデザイン業者を選択し、Step 2 で発注書を生成すると送信が可能になります。"
                  : !selectedVendor
                    ? "Step 1 でデザイン業者を選択すると送信が可能になります。"
                    : "Step 2 で発注書を生成すると送信が可能になります。"}
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {selectedVendor.name} に発注依頼メールを送信します。パスワード付きファイルが添付されます。
                </p>
                <Button size="sm" onClick={onRequestSend} className="gap-2">
                  <Send className="h-4 w-4" />
                  発注メールを送信
                </Button>
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* ── Step 4: 業者とのやり取り確認 ── */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <StepNumber n={4} />
              デザイン業者とのやり取りの確認
            </h4>
            <p className="text-xs text-muted-foreground">
              デザイン業者画面でのアップロード・コメントの状況を確認できます。
            </p>

            {notificationDesignRequests.length === 0 ? (
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-md p-4 text-center bg-muted/20">
                <p className="text-sm text-muted-foreground">Step 3 で発注メールを送信するとやり取りが確認できます。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notificationDesignRequests.map((r) => (
                  <div key={r.id} className="border rounded-md p-4 space-y-3 bg-background">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div>
                        <p className="font-medium text-sm">{r.vendorName ?? r.vendorId}</p>
                        <p className="text-xs text-muted-foreground">送信: {fmtDate(r.requestedAt)}</p>
                      </div>
                      <Badge variant={r.status === "uploaded" ? "default" : "secondary"}>
                        {r.status === "uploaded" ? "アップロード済み" : "依頼受付中"}
                      </Badge>
                    </div>

                    {/* Upload info */}
                    {r.uploadedFileName && (
                      <div className="bg-muted/30 rounded-md p-3 text-sm space-y-1">
                        <p className="font-medium">アップロード済み: {r.uploadedFileName}</p>
                        {r.uploadedAt && (
                          <p className="text-xs text-muted-foreground">日時: {fmtDate(r.uploadedAt)}</p>
                        )}
                      </div>
                    )}

                    {/* Comment history */}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">やり取り履歴</p>
                      <div className="max-h-48 overflow-y-auto rounded border p-3 bg-muted/10 space-y-2">
                        {(!r.comments || r.comments.length === 0) ? (
                          <p className="text-xs text-muted-foreground">まだコメントはありません</p>
                        ) : (
                          r.comments.map((c) => (
                            <div key={c.id} className="text-sm pb-2 border-b last:border-0 last:pb-0">
                              <div className="flex items-start justify-between gap-2 mb-0.5">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {c.role === "Sales" ? "事務管理課" : "デザイン業者"}
                                  {c.authorName && ` (${c.authorName})`}
                                </span>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {fmtDate(c.createdAt)}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap text-xs">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Comment input */}
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-xs font-semibold">コメントを送信（事務管理課）</p>
                      <Textarea
                        placeholder="デザイン業者へ返信や確認メッセージを入力"
                        value={notificationCommentText}
                        onChange={(e) => onNotificationCommentTextChange(e.target.value)}
                        rows={2}
                        className="resize-none text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => onAddComment(r.id, notificationCommentText)}
                        disabled={!notificationCommentText.trim()}
                      >
                        送信
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── 当選通知書 送信確認モーダル ── */}
      <Dialog open={!!pendingVendor} onOpenChange={(open) => { if (!open) onCancelSend() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>当選通知書発注メール送信</DialogTitle>
            <DialogDescription>
              以下の内容で発注依頼メールを送信します。
            </DialogDescription>
          </DialogHeader>
          {pendingVendor && (
            <div className="rounded-md border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">送信先</span>
                <span className="font-medium">{pendingVendor.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">添付ファイル</span>
                <span className="font-medium">winner_notification_data.xlsx（パスワード保護）</span>
              </div>
              {draftDeadline && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">初稿希望日</span>
                  <span className="font-medium">{draftDeadline}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onCancelSend}>
              キャンセル
            </Button>
            <Button onClick={onConfirmSend} className="gap-2">
              <Send className="h-4 w-4" />
              メール送信を実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
