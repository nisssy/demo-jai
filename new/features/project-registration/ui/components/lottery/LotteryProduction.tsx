import type { DesignRequestInfo, ProductionStatus, LotteryHallEntry } from "@/new/features/project-registration/model/lottery-types"
import { TRADING_PARTNERS } from "@/new/api/lottery-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FileText, Send, Sparkles, Loader2, AlertTriangle, CheckCircle2, Mail, Eye } from "lucide-react"

type LotteryProductionProps = {
  productId?: number
  posterStatus: ProductionStatus
  dmStatus: ProductionStatus
  dmMailing: "yes" | "no"
  // ポスター
  latestPosterRequest: DesignRequestInfo | null
  posterRequests: DesignRequestInfo[]
  aiProofing: boolean
  proofingComplete: boolean
  showDateError: boolean
  showFontError: boolean
  onAIProofing: () => void
  posterCommentText: string
  onPosterCommentTextChange: (value: string) => void
  onSendPosterComment: () => void
  posterSentToCustomer: boolean
  onSendPosterToCustomer: () => void
  // ポスター発注モーダル
  showPosterOrderModal: boolean
  onShowPosterOrderModal: (open: boolean) => void
  posterOrderVendorId: string
  onPosterOrderVendorIdChange: (id: string) => void
  onPosterOrder: () => void
  // DM
  dmRequests: DesignRequestInfo[]
  latestDmRequest: DesignRequestInfo | null
  showDmCreateModal: boolean
  onShowDmCreateModal: (open: boolean) => void
  dmCreateVendorId: string
  onDmCreateVendorIdChange: (id: string) => void
  onDmCreate: () => void
  // 案件情報
  eventName: string
  eventStartDate: string
  eventEndDate: string
  halls: LotteryHallEntry[]
}

function StatusBadge({ status }: { status: ProductionStatus }) {
  const cn = status === "完了"
    ? "bg-green-100 text-green-800"
    : status === "未依頼"
      ? "bg-slate-100 text-slate-600"
      : "bg-blue-100 text-blue-800"
  return <Badge className={`text-xs ${cn}`}>{status}</Badge>
}

export const LotteryProduction = (props: LotteryProductionProps) => {
  const printingPartners = TRADING_PARTNERS.filter((t) => t.type === "printing")
  const designPartners = TRADING_PARTNERS.filter((t) => t.type === "design")

  if (!props.productId) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-500">制作進行は案件保存後にご利用いただけます。</p>
        <p className="text-xs text-slate-400 mt-1">まず「保存」を行ってください。</p>
      </div>
    )
  }

  return (
    <>
      <Tabs defaultValue="poster" className="w-full">
        <TabsList className={`w-full grid ${props.dmMailing === "yes" ? "grid-cols-2" : "grid-cols-1"} mb-3`}>
          <TabsTrigger value="poster" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            ポスター
            <StatusBadge status={props.posterStatus} />
          </TabsTrigger>
          {props.dmMailing === "yes" && (
            <TabsTrigger value="dm" className="text-xs gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              DM
              <StatusBadge status={props.dmStatus} />
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="poster" className="mt-0">
          <PosterTab {...props} />
        </TabsContent>

        {props.dmMailing === "yes" && (
          <TabsContent value="dm" className="mt-0">
            <DmTab {...props} designPartners={designPartners} />
          </TabsContent>
        )}
      </Tabs>

      {/* ポスター発注モーダル */}
      <Dialog open={props.showPosterOrderModal} onOpenChange={props.onShowPosterOrderModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">ポスター発注</DialogTitle>
            <DialogDescription className="text-xs">印刷会社を選択して発注してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">印刷会社</Label>
              <Select value={props.posterOrderVendorId} onValueChange={props.onPosterOrderVendorIdChange}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="印刷会社を選択..." />
                </SelectTrigger>
                <SelectContent>
                  {printingPartners.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => props.onShowPosterOrderModal(false)} className="text-xs">キャンセル</Button>
              <Button size="sm" onClick={props.onPosterOrder} className="text-xs">発注</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DM作成モーダル */}
      <Dialog open={props.showDmCreateModal} onOpenChange={props.onShowDmCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">DM作成依頼</DialogTitle>
            <DialogDescription className="text-xs">デザイン会社を選択して依頼してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">デザイン会社</Label>
              <Select value={props.dmCreateVendorId} onValueChange={props.onDmCreateVendorIdChange}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="デザイン会社を選択..." />
                </SelectTrigger>
                <SelectContent>
                  {designPartners.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => props.onShowDmCreateModal(false)} className="text-xs">キャンセル</Button>
              <Button size="sm" onClick={props.onDmCreate} className="text-xs">依頼</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ──── ポスタータブ ────
function PosterTab(props: LotteryProductionProps) {
  return (
    <div className="space-y-5">
      {/* ポスター発注 */}
      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <Label className="text-sm font-semibold">ポスター発注</Label>
          <p className="text-xs text-slate-500 mt-0.5">印刷会社へポスター作成を発注します。</p>
        </div>
        <Button
          onClick={() => props.onShowPosterOrderModal(true)}
          size="sm"
          className="w-full text-xs gap-1 bg-gradient-to-r from-blue-600 to-blue-700"
        >
          <Mail className="h-3.5 w-3.5" />
          ポスター発注（依頼文自動生成）
        </Button>
      </div>

      {/* ポスタープレビュー・AI校正 */}
      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <Label className="text-sm font-semibold">ポスター プレビュー・AI校正・修正依頼</Label>
          <p className="text-xs text-slate-500 mt-0.5">アップロード確認 → AI校正チェック → 修正依頼（コメント）</p>
        </div>

        {!props.latestPosterRequest ? (
          <p className="text-xs text-slate-400 py-3">まだポスター発注はありません。上記の「ポスター発注」から依頼してください。</p>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">対象依頼</span>
              <span className="font-medium">{props.latestPosterRequest.vendorName ?? "発注先"}</span>
              <Badge className={props.latestPosterRequest.status === "uploaded" ? "bg-green-100 text-green-800 text-xs" : "bg-yellow-100 text-yellow-800 text-xs"}>
                {props.latestPosterRequest.status === "uploaded" ? "アップロード済み" : "初稿待ち"}
              </Badge>
            </div>

            {/* プレビュー */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">プレビュー</p>
              {props.latestPosterRequest.status === "uploaded" ? (
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-5 border-2 border-dashed border-slate-300 aspect-[3/4] max-w-[220px]">
                  <div className="text-center space-y-3">
                    <h3 className="text-base font-bold">{props.eventName || "大抽選会"}</h3>
                    <p className="text-sm font-semibold">{props.eventStartDate || "開催日"}開催</p>
                    <p className="text-sm">{props.halls[0]?.hallName || "ホール名"}</p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50 aspect-[3/4] max-w-[220px] flex items-center justify-center">
                  <p className="text-xs text-slate-400">初稿のアップロード待ち</p>
                </div>
              )}
            </div>

            {/* AI校正 */}
            {props.latestPosterRequest.status === "uploaded" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">AI校正チェック</p>

                {props.proofingComplete && (
                  <div className="space-y-2">
                    {props.showDateError && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>日付不一致を検出しました。</span>
                      </div>
                    )}
                    {props.showFontError && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>フォントの問題を検出しました。</span>
                      </div>
                    )}
                  </div>
                )}

                {!props.proofingComplete && (
                  <Button
                    onClick={props.onAIProofing}
                    disabled={props.aiProofing}
                    size="sm"
                    className="w-full text-xs gap-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {props.aiProofing ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" />スキャン中...</>
                    ) : (
                      <><Sparkles className="h-3.5 w-3.5" />AI校正チェック実行</>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* コメント */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">コメント・修正依頼</p>
              <div className="rounded border p-2 bg-slate-50 space-y-1.5 max-h-36 overflow-y-auto">
                {(!props.latestPosterRequest.comments || props.latestPosterRequest.comments.length === 0) ? (
                  <p className="text-xs text-slate-400">まだコメントはありません</p>
                ) : (
                  props.latestPosterRequest.comments.map((c) => (
                    <div key={c.id} className="text-xs">
                      <span className="font-medium text-slate-500">
                        {c.role === "Sales" ? "営業" : "デザイン業者"}
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
                  placeholder="修正依頼や確認メッセージを入力"
                  value={props.posterCommentText}
                  onChange={(e) => props.onPosterCommentTextChange(e.target.value)}
                  rows={2}
                  className="resize-none flex-1 text-xs"
                />
                <Button size="sm" className="shrink-0 text-xs gap-1" onClick={props.onSendPosterComment}>
                  <Send className="h-3 w-3" />
                  送信
                </Button>
              </div>
            </div>

            {/* 顧客送信 */}
            {props.latestPosterRequest.status === "uploaded" && (
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500 font-medium">顧客（ホール）へ確認用送信</p>
                {props.posterSentToCustomer ? (
                  <div className="flex items-start gap-2 p-2.5 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span className="font-medium">顧客（ホール）へ送信済み</span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={props.onSendPosterToCustomer} className="w-full text-xs gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    顧客(ホール)にメール送信
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ──── DMタブ ────
function DmTab(props: LotteryProductionProps & { designPartners: typeof TRADING_PARTNERS }) {
  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <Label className="text-sm font-semibold">DM作成依頼</Label>
          <p className="text-xs text-slate-500 mt-0.5">デザイン会社にDM作成を依頼します。</p>
        </div>
        <Button
          onClick={() => props.onShowDmCreateModal(true)}
          size="sm"
          className="w-full text-xs gap-1 bg-gradient-to-r from-blue-600/80 to-blue-700/80"
        >
          <Mail className="h-3.5 w-3.5" />
          DM作成依頼（依頼文自動生成）
        </Button>
      </div>

      {props.dmRequests.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 text-center">まだDM作成依頼はありません</p>
      ) : (
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 font-medium">依頼一覧</Label>
          <div className="space-y-2">
            {props.dmRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium">{r.vendorName ?? "デザイン業者"}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(r.requestedAt).toLocaleString("ja")}
                  </div>
                </div>
                <Badge className={r.status === "uploaded" ? "bg-green-100 text-green-800 text-[10px]" : "bg-yellow-100 text-yellow-800 text-[10px]"}>
                  {r.status === "uploaded" ? "アップロード済み" : "依頼済み"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
