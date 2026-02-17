import type { DesignRequest } from "@/types/lottery"
import type { TradingPartnerData } from "@/lib/demo-db/types"
import type { ProductionStatus } from "../../types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Send, Sparkles, Loader2, AlertTriangle, CheckCircle2, Mail, Eye } from "lucide-react"

export type ProductionSectionViewProps = {
  productId?: number
  // ステータス
  posterStatus: ProductionStatus
  dmStatus: ProductionStatus
  dmMailing: "yes" | "no"
  // ポスター発注
  onOpenPosterOrderModal: () => void
  onOpenPosterOrderDocumentModal: () => void
  hasPosterRequests: boolean
  // DM作成依頼
  onOpenDmCreateModal: () => void
  // ポスタープレビュー・AI校正
  latestPosterRequest: DesignRequest | null
  aiProofing: boolean
  proofingComplete: boolean
  showDateError: boolean
  showFontError: boolean
  onAIProofing: () => void
  // ポスターコメント
  posterCommentText: string
  onPosterCommentTextChange: (value: string) => void
  onSendPosterComment: () => void
  // 顧客送信
  posterSentToCustomer: boolean
  onSendPosterToCustomer: () => void
  // DM依頼一覧・詳細
  dmRequests: DesignRequest[]
  latestDmRequest: DesignRequest | null
  onOpenDmDetail: (requestId: string) => void
  // 案件情報（プレビュー用）
  eventName: string
  eventStartDate: string
  eventEndDate: string
  halls: { hallName: string; companyName: string }[]
  salesPersonName: string
}

function StatusBadge({ status }: { status: ProductionStatus }) {
  const cn = status === "完了"
    ? "bg-green-100 text-green-800"
    : status === "未依頼"
      ? "bg-slate-100 text-slate-600"
      : "bg-blue-100 text-blue-800"
  return <Badge className={`text-xs ${cn}`}>{status}</Badge>
}

export function ProductionSectionView(props: ProductionSectionViewProps) {
  if (!props.productId) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-500">制作進行は案件保存後にご利用いただけます。</p>
        <p className="text-xs text-slate-400 mt-1">まず「保存」を行ってください。</p>
      </div>
    )
  }

  return (
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
        <PosterTabContent {...props} />
      </TabsContent>

      {props.dmMailing === "yes" && (
        <TabsContent value="dm" className="mt-0">
          <DmTabContent {...props} />
        </TabsContent>
      )}
    </Tabs>
  )
}

// ──────────────── ポスタータブ ────────────────
function PosterTabContent({
  onOpenPosterOrderModal,
  onOpenPosterOrderDocumentModal,
  hasPosterRequests,
  latestPosterRequest,
  aiProofing,
  proofingComplete,
  showDateError,
  showFontError,
  onAIProofing,
  posterCommentText,
  onPosterCommentTextChange,
  onSendPosterComment,
  posterSentToCustomer,
  onSendPosterToCustomer,
  eventName,
  eventStartDate,
  eventEndDate,
  halls,
}: ProductionSectionViewProps) {
  return (
    <div className="space-y-5">
      {/* ポスター発注 */}
      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <Label className="text-sm font-semibold">ポスター発注</Label>
          <p className="text-xs text-slate-500 mt-0.5">印刷会社へポスター作成を発注。発注時に発注書を自動作成します。</p>
        </div>
        <Button
          onClick={onOpenPosterOrderModal}
          size="sm"
          className="w-full text-xs gap-1 bg-gradient-to-r from-blue-600 to-blue-700"
        >
          <Mail className="h-3.5 w-3.5" />
          ポスター発注（依頼文自動生成）
        </Button>
        {hasPosterRequests && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs text-slate-500 font-medium">発注書</p>
            <p className="text-xs text-slate-400">発注時に発注書を自動作成しました。</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs gap-1"
              onClick={onOpenPosterOrderDocumentModal}
            >
              <FileText className="h-3.5 w-3.5" />
              発注書を表示
            </Button>
          </div>
        )}
      </div>

      {/* ポスタープレビュー・AI校正・修正依頼 */}
      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <Label className="text-sm font-semibold">ポスター プレビュー・AI校正・修正依頼</Label>
          <p className="text-xs text-slate-500 mt-0.5">アップロード確認 → プレビュー参照 → AI校正チェック → 修正依頼（コメント）</p>
        </div>

        {!latestPosterRequest ? (
          <p className="text-xs text-slate-400 py-3">まだポスター発注はありません。上記の「ポスター発注」から依頼してください。</p>
        ) : (
          <>
            {/* ステータス */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">対象依頼</span>
              <span className="font-medium">{latestPosterRequest.vendorName ?? "発注先"}</span>
              <Badge className={latestPosterRequest.status === "uploaded" ? "bg-green-100 text-green-800 text-xs" : "bg-yellow-100 text-yellow-800 text-xs"}>
                {latestPosterRequest.status === "uploaded" ? "アップロード済み" : "初稿待ち"}
              </Badge>
            </div>

            {/* プレビュー */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">アップロードされたもののプレビュー</p>
              {latestPosterRequest.status === "uploaded" ? (
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-5 border-2 border-dashed border-slate-300 aspect-[3/4] max-w-[220px]">
                  <div className="text-center space-y-3">
                    <h3 className="text-base font-bold">{eventName || "大抽選会"}</h3>
                    <p className="text-sm font-semibold">{eventStartDate || "開催日"}開催</p>
                    <p className="text-sm">{halls[0]?.hallName || "ホール名"}</p>
                  </div>
                  {latestPosterRequest.uploadedFileName && (
                    <p className="absolute bottom-1 left-1 right-1 text-center text-[10px] text-slate-400 truncate">
                      {latestPosterRequest.uploadedFileName}
                      {latestPosterRequest.uploadedAt && `（${new Date(latestPosterRequest.uploadedAt).toLocaleString("ja")}）`}
                    </p>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50 aspect-[3/4] max-w-[220px] flex items-center justify-center">
                  <p className="text-xs text-slate-400">初稿のアップロード待ち</p>
                </div>
              )}
            </div>

            {/* AI校正チェック */}
            {latestPosterRequest.status === "uploaded" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">AI校正チェック</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* JASデータ */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400">JASデータ</p>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">日付:</span>
                        <span className="font-medium">{eventStartDate || "ー"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">店舗:</span>
                        <span className="font-medium">{halls[0]?.hallName || "ー"}</span>
                      </div>
                    </div>
                  </div>
                  {/* ポスタープレビュー */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400">ポスタープレビュー</p>
                    <div className={`relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 border border-slate-200 aspect-[3/4] ${showDateError ? "ring-2 ring-red-400" : ""}`}>
                      {aiProofing && (
                        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center rounded-lg animate-pulse">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                      )}
                      <div className="text-center space-y-1.5">
                        <h4 className="text-xs font-bold">{eventName || "大抽選会"}</h4>
                        <p className="text-xs">{eventStartDate ? eventStartDate.replace(/-/g, "/").slice(5) : "12/24"}開催</p>
                        <p className="text-xs">{halls[0]?.hallName || "ホール名"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI校正結果 */}
                {proofingComplete && (
                  <div className="space-y-2">
                    {showDateError && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>日付不一致を検出しました。画像: {eventStartDate ? eventStartDate.replace(/-/g, "/").slice(5).replace(/0(\d)/, "$1") : "12/24"}、データ: {eventStartDate || "ー"}</span>
                      </div>
                    )}
                    {showFontError && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>フォントの問題を検出しました。</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        修正依頼（下記コメントで送信）
                      </Button>
                      <Button size="sm" className="flex-1 text-xs">
                        承認する
                      </Button>
                    </div>
                  </div>
                )}

                {!proofingComplete && (
                  <Button
                    onClick={onAIProofing}
                    disabled={aiProofing}
                    size="sm"
                    className="w-full text-xs gap-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {aiProofing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        スキャン中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        AI校正チェック実行
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* コメント・修正依頼 */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">コメント・修正依頼</p>
              <div className="rounded border p-2 bg-slate-50 space-y-1.5 max-h-36 overflow-y-auto">
                {(!latestPosterRequest.comments || latestPosterRequest.comments.length === 0) ? (
                  <p className="text-xs text-slate-400">まだコメントはありません</p>
                ) : (
                  latestPosterRequest.comments.map((c) => (
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
                  value={posterCommentText}
                  onChange={(e) => onPosterCommentTextChange(e.target.value)}
                  rows={2}
                  className="resize-none flex-1 text-xs"
                />
                <Button
                  size="sm"
                  className="shrink-0 text-xs gap-1"
                  onClick={onSendPosterComment}
                >
                  <Send className="h-3 w-3" />
                  送信
                </Button>
              </div>
            </div>

            {/* 顧客（ホール）へ確認用送信 */}
            {latestPosterRequest.status === "uploaded" && (
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500 font-medium">顧客（ホール）へ確認用送信</p>
                {posterSentToCustomer ? (
                  <div className="flex items-start gap-2 p-2.5 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">顧客（ホール）へ送信済み</span>
                      <br />
                      <span>ポスターをメール添付で送信しました。確認のご返信をお待ちください。</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border p-3 bg-slate-50 space-y-2">
                    <p className="text-xs text-slate-400">出来上がったポスターを顧客（ホール）にメール添付で送信し、内容の確認を依頼します。</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onSendPosterToCustomer}
                      className="w-full text-xs gap-1"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      出来上がったポスターを顧客(ホール)にメール添付して送信（確認のため）
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ──────────────── DMタブ ────────────────
function DmTabContent({
  onOpenDmCreateModal,
  dmRequests,
  latestDmRequest,
  onOpenDmDetail,
  eventStartDate,
  eventEndDate,
  halls,
}: ProductionSectionViewProps) {
  return (
    <div className="space-y-5">
      {/* DM作成依頼 */}
      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <Label className="text-sm font-semibold">DM作成依頼・状況確認・コメント</Label>
          <p className="text-xs text-slate-500 mt-0.5">ポスターの後にDM作成依頼を送信し、アップロード確認・コメントでやり取り</p>
        </div>
        <Button
          onClick={onOpenDmCreateModal}
          size="sm"
          className="w-full text-xs gap-1 bg-gradient-to-r from-blue-600/80 to-blue-700/80"
        >
          <Mail className="h-3.5 w-3.5" />
          DM作成依頼（依頼文自動生成）
        </Button>
      </div>

      {dmRequests.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 text-center">まだDM作成依頼はありません</p>
      ) : (
        <>
          {/* 最新DMのプレビュー */}
          {latestDmRequest && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">対象依頼</span>
                <span className="font-medium">{latestDmRequest.vendorName ?? "デザイン業者"}</span>
                <Badge className={latestDmRequest.status === "uploaded" ? "bg-green-100 text-green-800 text-xs" : "bg-yellow-100 text-yellow-800 text-xs"}>
                  {latestDmRequest.status === "uploaded" ? "アップロード済み" : "初稿待ち"}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium">アップロードされたもののプレビュー</p>
                {latestDmRequest.status === "uploaded" && latestDmRequest.uploadedFileName ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 aspect-[3/4] max-w-[220px] flex flex-col">
                    <div className="flex-1 p-4 flex flex-col justify-center text-center space-y-2">
                      <h3 className="text-sm font-bold">大抽選会のご案内</h3>
                      <p className="text-xs font-semibold">
                        {eventStartDate === eventEndDate
                          ? eventStartDate
                          : `${eventStartDate || "ー"} ～ ${eventEndDate || ""}`}
                      </p>
                      <p className="text-[10px] text-slate-500">{halls.map((h) => h.hallName).join("／") || "ー"}</p>
                      <p className="text-[10px] text-slate-500">{halls[0]?.companyName || ""}</p>
                    </div>
                    <p className="p-2 text-center text-[10px] text-slate-400 truncate border-t bg-slate-50">
                      {latestDmRequest.uploadedFileName}
                      {latestDmRequest.uploadedAt && `（${new Date(latestDmRequest.uploadedAt).toLocaleString("ja")}）`}
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50 aspect-[3/4] max-w-[220px] flex items-center justify-center">
                    <p className="text-xs text-slate-400">初稿のアップロード待ち</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DM依頼一覧 */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-500 font-medium">依頼一覧・詳細・コメント</Label>
            <div className="space-y-2">
              {dmRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium">{r.vendorName ?? "デザイン業者"}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(r.requestedAt).toLocaleString("ja")}
                      {r.uploadedFileName && (
                        <span className="ml-1.5 text-green-600">・アップロード済み: {r.uploadedFileName}</span>
                      )}
                    </div>
                    {r.comments && r.comments.length > 0 && (
                      <div className="text-[10px] text-blue-600 mt-0.5">コメント {r.comments.length} 件</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={r.status === "uploaded" ? "bg-green-100 text-green-800 text-[10px]" : "bg-yellow-100 text-yellow-800 text-[10px]"}>
                      {r.status === "uploaded" ? "アップロード済み" : "依頼済み"}
                    </Badge>
                    <Button variant="outline" size="sm" className="text-xs gap-1 h-7" onClick={() => onOpenDmDetail(r.id)}>
                      <Eye className="h-3 w-3" />
                      詳細・コメント
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
