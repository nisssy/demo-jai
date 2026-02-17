import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, ClipboardEdit, FileCheck, CheckCircle2, AlertCircle, Building2 } from "lucide-react"
import type { OutsourcingProductViewModel, PhaseGroup, SlotReportDraft } from "../hooks/useOutsourcingVendorDashboard"
import type { SlotMachineReportEntry } from "@/new/api/types"
import { ChatDrawerView } from "./modals/ChatDrawer.view"

// ─── サブコンポーネント: 商材カード（アクションバッジ付き） ───

type ProductCardProps = {
  product: OutsourcingProductViewModel
  phase: "during-event" | "post-event"
  isSelected: boolean
  onSelect: (id: number) => void
}

const ProductCard = ({ product, phase, isSelected, onSelect }: ProductCardProps) => {
  const hasReport = phase === "during-event"
    ? !!product.interimReport
    : !!product.postEventReport

  const actionBadge = hasReport
    ? { label: "入力済み", className: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> }
    : phase === "during-event"
      ? { label: "中間レポート未入力", className: "bg-amber-100 text-amber-800 border-amber-200", icon: <AlertCircle className="h-3 w-3" /> }
      : { label: "事後レポート未入力", className: "bg-red-100 text-red-800 border-red-200", icon: <AlertCircle className="h-3 w-3" /> }

  return (
    <div
      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-300 bg-white"
      }`}
      onClick={() => onSelect(product.id)}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{product.projectNumber}</span>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 ${actionBadge.className}`}>
          {actionBadge.icon}
          {actionBadge.label}
        </Badge>
      </div>
      <div className="font-medium text-sm mt-1">{product.eventProductName}</div>
      <div className="text-xs text-gray-500 mt-1">{product.eventDate}</div>
      {product.hallName && (
        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {product.hallName}
        </div>
      )}
    </div>
  )
}

// ─── フェーズ設定 ───

const PHASE_CONFIG = {
  "during-event": {
    title: "中間レポート入力",
    description: "実施中のイベントの中間レポートを入力してください",
    icon: <ClipboardEdit className="h-4 w-4 text-blue-600" />,
    badgeClass: "bg-blue-500",
  },
  "post-event": {
    title: "事後レポート・データ入力",
    description: "終了したイベントのレポートと事後データを入力してください",
    icon: <FileCheck className="h-4 w-4 text-emerald-600" />,
    badgeClass: "bg-emerald-500",
  },
} as const

// ─── サブコンポーネント: フェーズグループ ───

type PhaseGroupViewProps = {
  group: PhaseGroup
  selectedProductId: number | null
  onSelectProduct: (id: number) => void
}

const PhaseGroupView = ({ group, selectedProductId, onSelectProduct }: PhaseGroupViewProps) => {
  const config = PHASE_CONFIG[group.phase]
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        {config.icon}
        <span className="text-sm font-semibold text-gray-900">{config.title}</span>
        <Badge className={`${config.badgeClass} text-white text-[10px] px-1.5 py-0 rounded-full min-w-[18px] h-[18px] flex items-center justify-center`}>
          {group.products.length}
        </Badge>
      </div>
      <p className="text-xs text-gray-500 mb-2 ml-6">{config.description}</p>
      <div className="space-y-2">
        {group.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            phase={group.phase}
            isSelected={product.id === selectedProductId}
            onSelect={onSelectProduct}
          />
        ))}
      </div>
    </div>
  )
}

// ─── サブコンポーネント: 商材リストパネル ───

type ProductListPanelProps = {
  phaseGroups: PhaseGroup[]
  selectedProductId: number | null
  onSelectProduct: (id: number) => void
}

const ProductListPanel = ({ phaseGroups, selectedProductId, onSelectProduct }: ProductListPanelProps) => {
  return (
    <div className="w-[350px] border-r overflow-y-auto p-4">
      <h2 className="text-lg font-bold mb-4">スロセレ商材一覧</h2>
      {phaseGroups.length === 0 ? (
        <p className="text-sm text-gray-500">対象の商材がありません</p>
      ) : (
        phaseGroups.map((group) => (
          <PhaseGroupView
            key={group.phase}
            group={group}
            selectedProductId={selectedProductId}
            onSelectProduct={onSelectProduct}
          />
        ))
      )}
    </div>
  )
}

// ─── サブコンポーネント: 案件情報カード ───

type ProjectInfoCardProps = {
  product: OutsourcingProductViewModel
}

const ProjectInfoCard = ({ product }: ProjectInfoCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">案件情報</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">案件番号</span>
            <p className="font-medium">{product.projectNumber}</p>
          </div>
          <div>
            <span className="text-gray-500">イベント日</span>
            <p className="font-medium">{product.eventDate}</p>
          </div>
          <div>
            <span className="text-gray-500">ホール名</span>
            <p className="font-medium">{product.hallName || "-"}</p>
          </div>
          <div>
            <span className="text-gray-500">対象機種</span>
            <div className="flex gap-1 flex-wrap mt-0.5">
              {product.targetMachineNames.length > 0
                ? product.targetMachineNames.map((name, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{name}</Badge>
                  ))
                : <span className="text-gray-400">-</span>
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── サブコンポーネント: 構造化レポート入力フォーム ───

type SlotReportFormProps = {
  title: string
  draft: SlotReportDraft
  uploadedAt: string | undefined
  onUpdateField: (field: keyof Omit<SlotReportDraft, "machineReports">, value: string) => void
  onUpdateMachineField: (machineIndex: number, field: keyof Omit<SlotMachineReportEntry, "machineName">, value: string) => void
  onSave: () => void
}

const SlotReportForm = ({
  title,
  draft,
  uploadedAt,
  onUpdateField,
  onUpdateMachineField,
  onSave,
}: SlotReportFormProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* 全体項目（20スロ） */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">20スロ 全体データ</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">20スロ台数</label>
              <Input
                value={draft.slot20Count}
                onChange={(e) => onUpdateField("slot20Count", e.target.value)}
                placeholder="例: 120"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">20スロ総差枚</label>
              <Input
                value={draft.slot20TotalDiff}
                onChange={(e) => onUpdateField("slot20TotalDiff", e.target.value)}
                placeholder="例: +45000"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">20スロ平均G数</label>
              <Input
                value={draft.slot20AvgGames}
                onChange={(e) => onUpdateField("slot20AvgGames", e.target.value)}
                placeholder="例: 8500"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">20スロ平均差枚</label>
              <Input
                value={draft.slot20AvgDiff}
                onChange={(e) => onUpdateField("slot20AvgDiff", e.target.value)}
                placeholder="例: +375"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 機種別入力 */}
        {draft.machineReports.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">対象機種別データ</h4>
            <div className="space-y-4">
              {draft.machineReports.map((machine, idx) => (
                <div key={machine.machineName} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs font-medium">{machine.machineName}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">台数</label>
                      <Input
                        value={machine.count ?? ""}
                        onChange={(e) => onUpdateMachineField(idx, "count", e.target.value)}
                        placeholder="例: 8"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">平均G数</label>
                      <Input
                        value={machine.avgGames ?? ""}
                        onChange={(e) => onUpdateMachineField(idx, "avgGames", e.target.value)}
                        placeholder="例: 9200"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">平均差枚</label>
                      <Input
                        value={machine.avgDiff ?? ""}
                        onChange={(e) => onUpdateMachineField(idx, "avgDiff", e.target.value)}
                        placeholder="例: +520"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadedAt && (
          <p className="text-xs text-gray-500">最終保存: {uploadedAt}</p>
        )}
        <div className="flex justify-end">
          <Button onClick={onSave} size="sm">
            保存
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── サブコンポーネント: 詳細パネル ───

type DetailPanelProps = {
  selectedProduct: OutsourcingProductViewModel | null
  reportDraft: SlotReportDraft
  onUpdateDraftField: (field: keyof Omit<SlotReportDraft, "machineReports">, value: string) => void
  onUpdateMachineField: (machineIndex: number, field: keyof Omit<SlotMachineReportEntry, "machineName">, value: string) => void
  onSaveReport: () => void
  onOpenChat: () => void
}

const DetailPanel = ({
  selectedProduct,
  reportDraft,
  onUpdateDraftField,
  onUpdateMachineField,
  onSaveReport,
  onOpenChat,
}: DetailPanelProps) => {
  if (!selectedProduct) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        左の一覧から商材を選択してください
      </div>
    )
  }

  const isDuringEvent = selectedProduct.executionStatus === "実施中"
  const report = isDuringEvent ? selectedProduct.interimReport : selectedProduct.postEventReport

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold">{selectedProduct.eventProductName}</h2>
          <p className="text-sm text-gray-500">
            {selectedProduct.projectNumber} / {selectedProduct.eventDate}
          </p>
          {isDuringEvent && (
            <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800 border-blue-200">
              実施中
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onOpenChat}>
          <MessageCircle className="h-4 w-4" />
          チャット
        </Button>
      </div>

      <ProjectInfoCard product={selectedProduct} />

      <SlotReportForm
        title={isDuringEvent ? "中間レポート" : "事後レポート"}
        draft={reportDraft}
        uploadedAt={report?.uploadedAt}
        onUpdateField={onUpdateDraftField}
        onUpdateMachineField={onUpdateMachineField}
        onSave={onSaveReport}
      />
    </div>
  )
}

// ─── メインView ───

export type OutsourcingVendorDashboardViewProps = {
  phaseGroups: PhaseGroup[]
  selectedProduct: OutsourcingProductViewModel | null
  selectedProductId: number | null
  reportDraft: SlotReportDraft
  onSelectProduct: (id: number) => void
  onUpdateDraftField: (field: keyof Omit<SlotReportDraft, "machineReports">, value: string) => void
  onUpdateMachineField: (machineIndex: number, field: keyof Omit<SlotMachineReportEntry, "machineName">, value: string) => void
  onSaveReport: () => void
  onOpenChat: () => void
  showChatDrawer: boolean
  onChatDrawerOpenChange: (open: boolean) => void
}

export const OutsourcingVendorDashboardView = ({
  phaseGroups,
  selectedProduct,
  selectedProductId,
  reportDraft,
  onSelectProduct,
  onUpdateDraftField,
  onUpdateMachineField,
  onSaveReport,
  onOpenChat,
  showChatDrawer,
  onChatDrawerOpenChange,
}: OutsourcingVendorDashboardViewProps) => {
  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <ProductListPanel
        phaseGroups={phaseGroups}
        selectedProductId={selectedProductId}
        onSelectProduct={onSelectProduct}
      />
      <DetailPanel
        selectedProduct={selectedProduct}
        reportDraft={reportDraft}
        onUpdateDraftField={onUpdateDraftField}
        onUpdateMachineField={onUpdateMachineField}
        onSaveReport={onSaveReport}
        onOpenChat={onOpenChat}
      />
      <ChatDrawerView
        open={showChatDrawer}
        onOpenChange={onChatDrawerOpenChange}
        productId={selectedProductId}
        productName={selectedProduct?.eventProductName ?? ""}
      />
    </div>
  )
}
