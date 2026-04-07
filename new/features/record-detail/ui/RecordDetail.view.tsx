import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Pencil } from "lucide-react"
import type { RecordDetailData } from "../hooks/useRecordDetail"
import { PROPOSAL_STATUS_LABELS, BOOKING_STATUS_LABELS } from "@/new/api/display"
import type { ProposalStatus } from "@/new/api/types"

type RecordDetailViewProps = {
  data: RecordDetailData | null
  canEdit: boolean
  onBack: () => void
  onEdit: () => void
  onGoToProject: () => void
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

/** ステータスの色 */
function getStatusColor(proposalStatus: string): string {
  switch (proposalStatus) {
    case "order-received": return "bg-green-600 text-white"
    case "proposing": return "bg-blue-600 text-white"
    default: return "bg-slate-500 text-white"
  }
}

export const RecordDetailView = ({ data, canEdit, onBack, onEdit, onGoToProject }: RecordDetailViewProps) => {
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

  const { product, project, proposalStatusLabel, executionStatusLabel } = data
  const isLottery = product.category === "ポイント" && product.eventType === "合同抽選会"

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* ステータスバー */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-600">ステータス:</span>
        <Badge className={`${getStatusColor(product.proposalStatus)} px-3 py-1 text-sm`}>
          {proposalStatusLabel}
        </Badge>
        {product.executionStatus && (
          <Badge className="bg-slate-100 text-slate-700 px-3 py-1 text-sm">
            {executionStatusLabel}
          </Badge>
        )}
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              レコード詳細
            </h1>
            <p className="text-sm text-slate-500">レコード番号: {product.id}</p>
          </div>
        </div>
        {canEdit && (
          <Button className="gap-2" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            編集
          </Button>
        )}
      </div>

      {/* メッセージエリア */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p>レコード保存後、「申請」ボタンを押してください！</p>
        <p className="text-red-600 font-medium mt-1">ステータスが「未処理」のままの案件は事務側で処理致しかねますのでご了承ください。</p>
        <p className="mt-2 text-slate-600">なお、「申請」ボタンを押した後はレコードの編集ができなくなりますので、<br />必ず入力内容を確認した上で申請してください。</p>
      </div>

      {/* 基本情報セクション */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="レコード番号" value={product.id} />
            <Field label="営業申込日" value={project.requestDate} />
            <Field label="発注日" value={project.createdAt?.slice(0, 10)} />
            <Field label="担当営業" value={project.salesPersonName} />
          </div>
        </CardContent>
      </Card>

      {/* 店舗情報セクション */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2">店舗情報</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="案件番号"
              value={project.projectNumber}
              link
              onClick={onGoToProject}
            />
            <Field label="店舗名" value={project.hallName} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="法人" value={project.companyName} />
            <Field label="法人ID" value={project.companyId} />
            <Field label="ホールID" value={project.hallId} />
            <Field label="担当営業" value={project.salesPersonName} />
          </div>
        </CardContent>
      </Card>

      {/* 商材情報セクション */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2">商材情報</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="商材区分" value={product.category} />
            <Field label="商材名" value={product.eventProductName || product.eventType} />
            <Field label="イベント区分" value={product.eventType} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="実施日" value={product.eventDate} />
            {product.startTime && <Field label="開始時間" value={product.startTime} />}
            {product.endTime && <Field label="終了時間" value={product.endTime} />}
            <Field label="見積金額" value={`¥${product.estimatedBillingAmount.toLocaleString()}`} />
          </div>

          {/* 合同抽選会固有 */}
          {isLottery && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.eventStartDate && <Field label="掲載開始日" value={product.eventStartDate} />}
              {product.eventEndDate && <Field label="掲載終了日" value={product.eventEndDate} />}
              {product.area && <Field label="配信エリア" value={product.area} />}
              {product.budget && <Field label="日予算" value={`¥${Number(product.budget).toLocaleString()}`} />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* キャスト情報セクション（イベント商材の場合） */}
      {!isLottery && (product.selectedCompanions?.length > 0 || product.selectedDirectors?.length > 0 || product.selectedMcs?.length > 0) && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">キャスト情報</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="コンパニオン人数" value={product.companionCount || "0"} />
              <Field label="ディレクター人数" value={product.directorCount || "0"} />
              <Field label="MC人数" value={product.mcCount || "0"} />
            </div>
            {product.selectedCompanions?.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 font-medium">コンパニオン</div>
                <div className="space-y-1">
                  {product.selectedCompanions.map((name) => (
                    <div key={name} className="flex items-center gap-3 bg-slate-50 border rounded px-3 py-2">
                      <span className="text-sm font-medium">{name}</span>
                      <Badge className="text-xs">
                        {BOOKING_STATUS_LABELS[product.companionBookingStatus?.[name] ?? "tentative_requesting"]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {product.selectedDirectors?.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 font-medium">ディレクター</div>
                <div className="space-y-1">
                  {product.selectedDirectors.map((name) => (
                    <div key={name} className="flex items-center gap-3 bg-slate-50 border rounded px-3 py-2">
                      <span className="text-sm font-medium">{name}</span>
                      <Badge className="text-xs">
                        {BOOKING_STATUS_LABELS[product.directorBookingStatus?.[name] ?? "tentative_requesting"]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {product.selectedMcs?.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 font-medium">MC</div>
                <div className="space-y-1">
                  {product.selectedMcs.map((name) => (
                    <div key={name} className="flex items-center gap-3 bg-slate-50 border rounded px-3 py-2">
                      <span className="text-sm font-medium">{name}</span>
                      <Badge className="text-xs">
                        {BOOKING_STATUS_LABELS[product.mcBookingStatus?.[name] ?? "tentative_requesting"]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ステータス・ヨミ */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2">ステータス</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="提案ステータス" value={proposalStatusLabel} />
            <Field label="実施ステータス" value={executionStatusLabel} />
            <Field label="ヨミ" value={product.readingCertainty || "-"} />
            <Field label="マネジメント部確認" value={!product.managementConfirmationStatus || product.managementConfirmationStatus === "unconfirmed" ? "-" : product.managementConfirmationStatus} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
