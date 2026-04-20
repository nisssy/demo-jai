import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Pencil, Link2, CheckCircle2 } from "lucide-react"
import type { RecordDetailData } from "../hooks/useRecordDetail"
import { BOOKING_STATUS_LABELS } from "@/new/api/display"

type RecordDetailViewProps = {
  data: RecordDetailData | null
  canEdit: boolean
  onBack: () => void
  onEdit: () => void
  onGoToProject: () => void
  pspLinked: boolean
  onTogglePsp: () => void
}

/** Kintone風フィールド表示 */
const Field = ({ label, value, link, onClick }: { label: string; value?: string | number | null; link?: boolean; onClick?: () => void }) => (
  <div className="space-y-1">
    <div className="text-xs text-slate-500 font-medium">{label}</div>
    {link && onClick ? (
      <button
        type="button"
        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
        onClick={onClick}
      >
        {value ?? "-"}
      </button>
    ) : (
      <div className="text-sm text-slate-900 bg-slate-50 border rounded px-3 py-2 min-h-[38px] flex items-center">
        {value ?? "-"}
      </div>
    )}
  </div>
)

/** ステータスバッジ（ラベル付き） */
const StatusChip = ({ label, value, tone }: { label: string; value: string; tone: "blue" | "green" | "slate" | "amber" }) => {
  const bg = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
  }[tone]
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</span>
      <Badge className={`${bg} border text-xs px-2 py-0.5 justify-start`}>{value}</Badge>
    </div>
  )
}

/** 提案ステータスの色 */
function getProposalTone(s: string): "green" | "blue" | "slate" {
  if (s === "order-received") return "green"
  if (s === "proposing") return "blue"
  return "slate"
}

/** SectionHeader */
const SectionHeader = ({ title, right }: { title: string; right?: React.ReactNode }) => (
  <div className="flex items-center justify-between border-b pb-2 mb-3">
    <h3 className="text-base font-bold text-slate-900">{title}</h3>
    {right}
  </div>
)

export const RecordDetailView = ({ data, canEdit, onBack, onEdit, onGoToProject, pspLinked, onTogglePsp }: RecordDetailViewProps) => {
  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-600">レコードが見つかりません</p>
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            レコード一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  const { product, project, proposalStatusLabel, executionStatusLabel, designOrdered, prizeOrdered, listConfirmed } = data
  const isLottery = product.category === "ポイント" && product.eventType === "合同抽選会"

  return (
    <div className="max-w-5xl mx-auto">
      {/* 固定ヘッダー */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">レコード詳細</h1>
              <p className="text-xs text-slate-500">案件番号: {project.projectNumber} / レコード番号: {product.id}</p>
            </div>
          </div>
          {canEdit && (
            <Button size="sm" className="gap-2" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              編集
            </Button>
          )}
        </div>
        {/* 5種類のステータス */}
        <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatusChip label="案件ステータス" value={proposalStatusLabel} tone={getProposalTone(product.proposalStatus)} />
          <StatusChip label="レコードステータス" value={executionStatusLabel} tone="slate" />
          <StatusChip label="当選デザイン依頼" value={designOrdered ? "実施済み" : "未実施"} tone={designOrdered ? "green" : "slate"} />
          <StatusChip label="景品発注依頼" value={prizeOrdered ? "実施済み" : "未実施"} tone={prizeOrdered ? "green" : "slate"} />
          <StatusChip label="リスト確認" value={listConfirmed ? "確認済" : "確認前"} tone={listConfirmed ? "green" : "amber"} />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. 基本情報 */}
        <Card>
          <CardContent className="p-6">
            <SectionHeader
              title="基本情報"
              right={
                <Button
                  type="button"
                  size="sm"
                  variant={pspLinked ? "default" : "outline"}
                  onClick={onTogglePsp}
                  className={`h-8 text-xs gap-1 ${pspLinked ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                >
                  {pspLinked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                  {pspLinked ? "連携済み" : "PSP連携"}
                </Button>
              }
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="案件番号" value={project.projectNumber} link onClick={onGoToProject} />
              <Field label="レコード番号" value={product.id} />
              <Field label="営業申込日" value={project.requestDate} />
              <Field label="担当営業" value={project.salesPersonName} />
              <Field label="法人" value={project.companyName} />
              <Field label="ホール" value={project.hallName} />
              <Field label="商材区分" value={product.category} />
              <Field label="商材名" value={product.eventProductName || product.eventType} />
              <Field label="実施日" value={product.eventDate} />
              {isLottery && product.eventStartDate && <Field label="掲載開始日" value={product.eventStartDate} />}
              {isLottery && product.eventEndDate && <Field label="掲載終了日" value={product.eventEndDate} />}
              {!isLottery && product.startTime && <Field label="開始時間" value={product.startTime} />}
              {!isLottery && product.endTime && <Field label="終了時間" value={product.endTime} />}
            </div>
          </CardContent>
        </Card>

        {/* 2. 景品セット（合同抽選会のみ） */}
        {isLottery && (
          <Card>
            <CardContent className="p-6">
              <SectionHeader title="景品セット" />
              {product.prizeInfo && product.prizeInfo.length > 0 ? (
                <div className="space-y-2">
                  {product.prizeInfo.map((p, i) => (
                    <div key={i} className="grid grid-cols-3 gap-3 bg-slate-50 border rounded px-3 py-2 text-sm">
                      <div><span className="text-xs text-slate-500">等級:</span> <span className="font-medium">{p.rank}</span></div>
                      <div><span className="text-xs text-slate-500">景品:</span> <span className="font-medium">{p.name}</span></div>
                      <div><span className="text-xs text-slate-500">数量:</span> <span className="font-medium">{p.quantity}</span></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">景品情報はありません</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 3. 見積もり */}
        <Card>
          <CardContent className="p-6">
            <SectionHeader title="見積もり" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="見積金額" value={`¥${product.estimatedBillingAmount.toLocaleString()}`} />
              {isLottery && product.area && <Field label="配信エリア" value={product.area} />}
              {isLottery && product.budget && <Field label="日予算" value={`¥${Number(product.budget).toLocaleString()}`} />}
            </div>
            {isLottery && product.hallQuotes && product.hallQuotes.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold text-slate-700">ホール別見積</div>
                {product.hallQuotes.map((hq, i) => (
                  <div key={i} className="border rounded px-3 py-2 bg-slate-50 text-sm flex items-center justify-between">
                    <span className="font-medium">{hq.hallName}</span>
                    <span className="text-slate-600">按分: {hq.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. 制作進行 */}
        <Card>
          <CardContent className="p-6">
            <SectionHeader title="制作進行" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field
                label="当選者リスト"
                value={listConfirmed ? "検証完了" : product.winnerListUploadedAt ? "アップロード済" : "未アップロード"}
              />
              <Field
                label="当選通知書発注"
                value={product.notificationOrderSentAt ? "発注済" : product.notificationOrderGeneratedAt ? "作成済" : "未作成"}
              />
              <Field
                label="景品発注"
                value={product.prizeOrderRequestedAt ? "発注済" : product.prizeOrderGeneratedAt ? "作成済" : "未作成"}
              />
              <Field
                label="デザイン業者"
                value={product.notificationOrderDesignVendorName ?? "-"}
              />
            </div>
          </CardContent>
        </Card>

        {/* 5. 詳細管理 */}
        <Card>
          <CardContent className="p-6">
            <SectionHeader title="詳細管理" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="提案ステータス" value={proposalStatusLabel} />
              <Field label="実施ステータス" value={executionStatusLabel} />
              <Field label="ヨミ" value={product.readingCertainty ?? "-"} />
              <Field label="マネジメント部確認" value={product.managementConfirmationStatus ?? "-"} />
              <Field label="法人ID" value={project.companyId} />
              <Field label="ホールID" value={project.hallId} />
              <Field label="発注日" value={project.createdAt?.slice(0, 10)} />
            </div>

            {/* キャスト情報（イベント商材の場合のみ補足） */}
            {!isLottery && (product.selectedCompanions?.length > 0 || product.selectedDirectors?.length > 0 || product.selectedMcs?.length > 0) && (
              <div className="mt-4 space-y-3 border-t pt-4">
                <div className="text-xs font-semibold text-slate-700">キャスト情報</div>
                {product.selectedCompanions?.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">コンパニオン</div>
                    {product.selectedCompanions.map((name) => (
                      <div key={name} className="flex items-center gap-3 bg-slate-50 border rounded px-3 py-2">
                        <span className="text-sm font-medium">{name}</span>
                        <Badge className="text-xs">
                          {BOOKING_STATUS_LABELS[product.companionBookingStatus?.[name] ?? "tentative_requesting"]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                {product.selectedDirectors?.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">ディレクター</div>
                    {product.selectedDirectors.map((name) => (
                      <div key={name} className="flex items-center gap-3 bg-slate-50 border rounded px-3 py-2">
                        <span className="text-sm font-medium">{name}</span>
                        <Badge className="text-xs">
                          {BOOKING_STATUS_LABELS[product.directorBookingStatus?.[name] ?? "tentative_requesting"]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                {product.selectedMcs?.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">MC</div>
                    {product.selectedMcs.map((name) => (
                      <div key={name} className="flex items-center gap-3 bg-slate-50 border rounded px-3 py-2">
                        <span className="text-sm font-medium">{name}</span>
                        <Badge className="text-xs">
                          {BOOKING_STATUS_LABELS[product.mcBookingStatus?.[name] ?? "tentative_requesting"]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
