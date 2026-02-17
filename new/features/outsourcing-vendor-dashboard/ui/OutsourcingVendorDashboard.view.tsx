import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { PRODUCT_PROGRESS_STATUS_LABELS } from "@/new/api/display"
import type { ProductProgressStatus } from "@/new/api/types"
import type { OutsourcingProductViewModel, GroupedProducts } from "../hooks/useOutsourcingVendorDashboard"

// ─── ステータスバッジ色 ───

const STATUS_BADGE_VARIANT: Record<ProductProgressStatus, "default" | "secondary" | "outline" | "destructive"> = {
  not_started: "destructive",
  report_uploaded: "secondary",
  pachitown_linked: "outline",
  post_event_done: "default",
}

// ─── サブコンポーネント: 商材カード ───

type ProductCardProps = {
  product: OutsourcingProductViewModel
  isSelected: boolean
  onSelect: (id: number) => void
}

const ProductCard = ({ product, isSelected, onSelect }: ProductCardProps) => {
  return (
    <div
      className={`p-3 rounded-md border cursor-pointer transition-colors ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
      }`}
      onClick={() => onSelect(product.id)}
    >
      <div className="text-xs text-gray-500">{product.projectNumber}</div>
      <div className="font-medium text-sm mt-1">{product.eventProductName}</div>
      <div className="text-xs text-gray-500 mt-1">{product.eventDate}</div>
    </div>
  )
}

// ─── サブコンポーネント: ステータスグループ ───

type StatusGroupProps = {
  group: GroupedProducts
  selectedProductId: number | null
  onSelectProduct: (id: number) => void
}

const StatusGroup = ({ group, selectedProductId, onSelectProduct }: StatusGroupProps) => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={STATUS_BADGE_VARIANT[group.status]}>
          {PRODUCT_PROGRESS_STATUS_LABELS[group.status]}
        </Badge>
        <span className="text-xs text-gray-500">{group.products.length}件</span>
      </div>
      <div className="space-y-2">
        {group.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
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
  groupedProducts: GroupedProducts[]
  selectedProductId: number | null
  onSelectProduct: (id: number) => void
}

const ProductListPanel = ({ groupedProducts, selectedProductId, onSelectProduct }: ProductListPanelProps) => {
  return (
    <div className="w-[350px] border-r overflow-y-auto p-4">
      <h2 className="text-lg font-bold mb-4">スロセレ商材一覧</h2>
      {groupedProducts.length === 0 ? (
        <p className="text-sm text-gray-500">対象の商材がありません</p>
      ) : (
        groupedProducts.map((group) => (
          <StatusGroup
            key={group.status}
            group={group}
            selectedProductId={selectedProductId}
            onSelectProduct={onSelectProduct}
          />
        ))
      )}
    </div>
  )
}

// ─── サブコンポーネント: レポートカード ───

type ReportCardProps = {
  reportUploaded: boolean
  reportUploadedAt: string | undefined
  onUploadReport: () => void
}

const ReportCard = ({ reportUploaded, reportUploadedAt, onUploadReport }: ReportCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">レポート</CardTitle>
      </CardHeader>
      <CardContent>
        {reportUploaded ? (
          <div className="flex items-center gap-2">
            <Badge variant="default">アップロード済み</Badge>
            {reportUploadedAt && (
              <span className="text-sm text-gray-500">{reportUploadedAt}</span>
            )}
          </div>
        ) : (
          <Button onClick={onUploadReport} variant="outline" size="sm">
            レポートをアップロード
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ─── サブコンポーネント: 事後データカード ───

type PostEventDataCardProps = {
  transactionResultDraft: string
  machineDataDraft: string
  onTransactionResultChange: (value: string) => void
  onMachineDataChange: (value: string) => void
  onSave: () => void
}

const PostEventDataCard = ({
  transactionResultDraft,
  machineDataDraft,
  onTransactionResultChange,
  onMachineDataChange,
  onSave,
}: PostEventDataCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">事後データ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">稼働実績</label>
          <Textarea
            value={transactionResultDraft}
            onChange={(e) => onTransactionResultChange(e.target.value)}
            placeholder="稼働実績を入力してください"
            rows={4}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">機種データ</label>
          <Textarea
            value={machineDataDraft}
            onChange={(e) => onMachineDataChange(e.target.value)}
            placeholder="機種データを入力してください"
            rows={4}
          />
        </div>
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
  transactionResultDraft: string
  machineDataDraft: string
  onTransactionResultChange: (value: string) => void
  onMachineDataChange: (value: string) => void
  onUploadReport: () => void
  onSavePostEventData: () => void
}

const DetailPanel = ({
  selectedProduct,
  transactionResultDraft,
  machineDataDraft,
  onTransactionResultChange,
  onMachineDataChange,
  onUploadReport,
  onSavePostEventData,
}: DetailPanelProps) => {
  if (!selectedProduct) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        左の一覧から商材を選択してください
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-bold">{selectedProduct.eventProductName}</h2>
        <p className="text-sm text-gray-500">
          {selectedProduct.projectNumber} / {selectedProduct.eventDate}
        </p>
      </div>

      <ReportCard
        reportUploaded={selectedProduct.reportUploaded}
        reportUploadedAt={selectedProduct.reportUploadedAt}
        onUploadReport={onUploadReport}
      />
      <PostEventDataCard
        transactionResultDraft={transactionResultDraft}
        machineDataDraft={machineDataDraft}
        onTransactionResultChange={onTransactionResultChange}
        onMachineDataChange={onMachineDataChange}
        onSave={onSavePostEventData}
      />
    </div>
  )
}

// ─── メインView ───

export type OutsourcingVendorDashboardViewProps = {
  groupedProducts: GroupedProducts[]
  selectedProduct: OutsourcingProductViewModel | null
  selectedProductId: number | null
  transactionResultDraft: string
  machineDataDraft: string
  onSelectProduct: (id: number) => void
  onTransactionResultChange: (value: string) => void
  onMachineDataChange: (value: string) => void
  onUploadReport: () => void
  onSavePostEventData: () => void
}

export const OutsourcingVendorDashboardView = ({
  groupedProducts,
  selectedProduct,
  selectedProductId,
  transactionResultDraft,
  machineDataDraft,
  onSelectProduct,
  onTransactionResultChange,
  onMachineDataChange,
  onUploadReport,
  onSavePostEventData,
}: OutsourcingVendorDashboardViewProps) => {
  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <ProductListPanel
        groupedProducts={groupedProducts}
        selectedProductId={selectedProductId}
        onSelectProduct={onSelectProduct}
      />
      <DetailPanel
        selectedProduct={selectedProduct}
        transactionResultDraft={transactionResultDraft}
        machineDataDraft={machineDataDraft}
        onTransactionResultChange={onTransactionResultChange}
        onMachineDataChange={onMachineDataChange}
        onUploadReport={onUploadReport}
        onSavePostEventData={onSavePostEventData}
      />
    </div>
  )
}
