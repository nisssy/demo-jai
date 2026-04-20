import { useState } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Download, PackagePlus, Copy, Send, Gift } from "lucide-react"
import type { FilterState, SavedSearchCondition } from "@/new/features/project-list/model/types"
import type { ProjectGroupViewModel } from "@/new/features/project-list/hooks/useProjectList"
import type { Company, Hall, Employee } from "@/new/api/types"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { ProposalStatus } from "@/new/api/types"
import { PROPOSAL_STATUS_LABELS, EXECUTION_STATUS_LABELS } from "@/new/api/display"
import { ProjectListFilters } from "./ProjectListFilters"
import { AddProductModal } from "./AddProductModal"
import { DuplicateProductModal } from "./DuplicateProductModal"

/** ステータスに応じたバッジカラー */
function getStatusBadgeClass(proposalStatus: string): string {
  if (proposalStatus === "order-received") return "bg-green-100 text-green-800"
  if (proposalStatus === "proposing") return "bg-blue-100 text-blue-800"
  return "bg-slate-100 text-slate-600"
}

/** レコード一覧テーブルで表示するフラットなレコード型 */
type RecordRow = {
  productId: number
  projectNumber: string
  projectName: string
  companyName: string
  hallName: string
  salesPersonName: string
  category: string
  eventType: string
  eventProductName: string
  eventDate: string
  proposalStatus: string
  proposalStatusRaw: string
  executionStatus: string
  estimatedBillingAmount: number
  requestDate: string
  designOrdered: boolean
  prizeOrdered: boolean
  listConfirmed: boolean
}

/** テーブルデータのCSVエクスポート */
function exportRecordsAsCSV(records: RecordRow[]) {
  const headers = ["案件番号", "レコード番号", "案件名", "法人", "ホール", "担当営業", "商材区分", "商材名", "実施日", "提案ステータス", "実施ステータス", "見積金額"]
  const rows = records.map((r) => [
    r.projectNumber, String(r.productId), r.projectName, r.companyName, r.hallName,
    r.salesPersonName, r.category, r.eventProductName || r.eventType, r.eventDate,
    r.proposalStatus, r.executionStatus, String(r.estimatedBillingAmount),
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `レコード一覧_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export type RecordListPanelProps = {
  // データ
  projectGroups: ProjectGroupViewModel[]
  // フィルタ
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  // 法人検索
  companySearchOpen: boolean
  onCompanySearchOpenChange: (open: boolean) => void
  companySearchQuery: string
  onCompanySearchQueryChange: (query: string) => void
  filteredCompanies: Company[]
  getCompanyByCompanyId: (companyId: string) => Company | undefined
  onSelectCompany: (companyId: string) => void
  // ホール検索
  hallSearchOpen: boolean
  onHallSearchOpenChange: (open: boolean) => void
  hallSearchQuery: string
  onHallSearchQueryChange: (query: string) => void
  filteredHalls: Hall[]
  onSelectHall: (hallName: string) => void
  // 検索条件管理
  savedConditions: SavedSearchCondition[]
  onSaveCondition: (name: string) => void
  onDeleteCondition: (id: string) => void
  onApplyCondition: (id: string) => void
  onExportConditions: () => void
  // ナビゲーション
  onCreateNewProject: () => void
  onClickDetail: (projectNumber: string) => void
  onClickRecord: (productId: number) => void
  // 商材追加
  repository: ProjectRepository
  onProductCreated: (productId: number) => void
  // 複製
  onDuplicated: (newProjectNumber: string) => void
  // ヘッダー表示制御
  showHeader?: boolean
  // 事務管理向け: チェックボックス + 一括依頼ボタン
  adminBulkMode?: boolean
}

export const RecordListPanel = ({
  projectGroups,
  filters,
  onFiltersChange,
  companySearchOpen,
  onCompanySearchOpenChange,
  companySearchQuery,
  onCompanySearchQueryChange,
  filteredCompanies,
  getCompanyByCompanyId,
  onSelectCompany,
  hallSearchOpen,
  onHallSearchOpenChange,
  hallSearchQuery,
  onHallSearchQueryChange,
  filteredHalls,
  onSelectHall,
  savedConditions,
  onSaveCondition,
  onDeleteCondition,
  onApplyCondition,
  onExportConditions,
  onCreateNewProject,
  onClickDetail,
  onClickRecord,
  repository,
  onProductCreated,
  onDuplicated,
  showHeader = true,
  adminBulkMode = false,
}: RecordListPanelProps) => {
  const router = useAppRouter()
  const employees = repository.getEmployees()
  const [addProductModalOpen, setAddProductModalOpen] = useState(false)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [duplicateTargetProjectNumber, setDuplicateTargetProjectNumber] = useState<string | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])

  const toggleSelection = (id: number) => {
    setSelectedProductIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const goBulkNotification = () => {
    if (selectedProductIds.length === 0) return
    router.push(`/new/bulk-notification?ids=${selectedProductIds.join(",")}`)
  }

  const goBulkPrize = () => {
    if (selectedProductIds.length === 0) return
    router.push(`/new/bulk-prize?ids=${selectedProductIds.join(",")}`)
  }

  // フラットなレコード行に変換
  const recordRows: RecordRow[] = projectGroups.flatMap((group) =>
    group.products.map((product) => ({
      productId: product.id,
      projectNumber: group.projectNumber,
      projectName: group.projectName,
      companyName: group.companyName,
      hallName: group.hallName,
      salesPersonName: group.salesPersonName,
      category: product.category,
      eventType: product.eventType,
      eventProductName: product.eventProductName,
      eventDate: product.eventDate,
      proposalStatus: PROPOSAL_STATUS_LABELS[product.proposalStatus as ProposalStatus] ?? product.proposalStatus,
      proposalStatusRaw: product.proposalStatus,
      executionStatus: product.executionStatus ? EXECUTION_STATUS_LABELS[product.executionStatus] : "-",
      estimatedBillingAmount: product.estimatedBillingAmount,
      requestDate: group.requestDate,
      designOrdered: product.designOrdered,
      prizeOrdered: product.prizeOrdered,
      listConfirmed: product.listConfirmed,
    }))
  )

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={() => setAddProductModalOpen(true)}>
              <PackagePlus className="h-4 w-4" />
              新規商材追加
            </Button>
            <Button className="gap-2" onClick={onCreateNewProject}>
              <Plus className="h-4 w-4" />
              新規案件作成
            </Button>
          </div>
        </div>
      )}

      {/* 商材追加モーダル */}
      <AddProductModal
        open={addProductModalOpen}
        onOpenChange={setAddProductModalOpen}
        repository={repository}
        onProductCreated={onProductCreated}
      />

      {/* 複製モーダル */}
      <DuplicateProductModal
        open={duplicateModalOpen}
        onOpenChange={setDuplicateModalOpen}
        projectNumber={duplicateTargetProjectNumber}
        repository={repository}
        onDuplicated={onDuplicated}
      />

      {/* フィルタ */}
      <ProjectListFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        companySearchOpen={companySearchOpen}
        onCompanySearchOpenChange={onCompanySearchOpenChange}
        companySearchQuery={companySearchQuery}
        onCompanySearchQueryChange={onCompanySearchQueryChange}
        filteredCompanies={filteredCompanies}
        getCompanyByCompanyId={getCompanyByCompanyId}
        onSelectCompany={onSelectCompany}
        hallSearchOpen={hallSearchOpen}
        onHallSearchOpenChange={onHallSearchOpenChange}
        hallSearchQuery={hallSearchQuery}
        onHallSearchQueryChange={onHallSearchQueryChange}
        filteredHalls={filteredHalls}
        onSelectHall={onSelectHall}
        savedConditions={savedConditions}
        onSaveCondition={onSaveCondition}
        onDeleteCondition={onDeleteCondition}
        onApplyCondition={onApplyCondition}
        onExportConditions={onExportConditions}
        employees={employees}
      />

      {recordRows.length === 0 ? (
        <div className="text-center py-12 text-slate-500">レコードがありません</div>
      ) : (
        <div className="border rounded-lg bg-white overflow-hidden">
          {/* テーブルヘッダー上部のアクション */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
            <div className="text-sm text-slate-600">
              {recordRows.length}件のレコード
              {adminBulkMode && selectedProductIds.length > 0 && (
                <span className="ml-2 text-blue-700 font-medium">（{selectedProductIds.length}件選択中）</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {adminBulkMode && selectedProductIds.length > 0 && (
                <>
                  <Button size="sm" className="gap-1.5" onClick={goBulkNotification}>
                    <Send className="h-4 w-4" />
                    当選デザイン一括依頼
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={goBulkPrize}>
                    <Gift className="h-4 w-4" />
                    景品発注一括依頼
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => exportRecordsAsCSV(recordRows)}
              >
                <Download className="h-4 w-4" />
                エクスポート
              </Button>
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  {adminBulkMode && <TableHead className="w-[40px]"></TableHead>}
                  <TableHead className="w-[100px] font-semibold text-slate-700">案件番号</TableHead>
                  <TableHead className="w-[100px] font-semibold text-slate-700">レコード番号</TableHead>
                  <TableHead className="font-semibold text-slate-700">ステータス</TableHead>
                  <TableHead className="font-semibold text-slate-700">商材区分</TableHead>
                  <TableHead className="font-semibold text-slate-700">商材名</TableHead>
                  <TableHead className="font-semibold text-slate-700">法人</TableHead>
                  <TableHead className="font-semibold text-slate-700">ホール</TableHead>
                  <TableHead className="font-semibold text-slate-700">実施日</TableHead>
                  <TableHead className="font-semibold text-slate-700">実施ステータス</TableHead>
                  <TableHead className="font-semibold text-slate-700">当選デザイン依頼</TableHead>
                  <TableHead className="font-semibold text-slate-700">景品発注依頼</TableHead>
                  <TableHead className="font-semibold text-slate-700">リスト確認</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">見積金額</TableHead>
                  <TableHead className="font-semibold text-slate-700">担当営業</TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordRows.map((row) => (
                  <TableRow
                    key={row.productId}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    {adminBulkMode && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedProductIds.includes(row.productId)}
                          onCheckedChange={() => toggleSelection(row.productId)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                        onClick={(e) => { e.stopPropagation(); onClickDetail(row.projectNumber) }}
                      >
                        {row.projectNumber}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                        onClick={(e) => { e.stopPropagation(); onClickRecord(row.productId) }}
                      >
                        {row.productId}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs px-2 py-0.5 ${getStatusBadgeClass(row.proposalStatusRaw)}`}>
                        {row.proposalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-700 text-white text-xs">{row.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">
                      {row.eventProductName || row.eventType}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{row.companyName}</TableCell>
                    <TableCell className="text-sm text-slate-600">{row.hallName}</TableCell>
                    <TableCell className="text-sm text-slate-600">{row.eventDate || "-"}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5">
                        {row.executionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs px-2 py-0.5 ${row.designOrdered ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                        {row.designOrdered ? "実施済み" : "未実施"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs px-2 py-0.5 ${row.prizeOrdered ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                        {row.prizeOrdered ? "実施済み" : "未実施"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs px-2 py-0.5 ${row.listConfirmed ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                        {row.listConfirmed ? "確認済" : "確認前"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-slate-900">
                      ¥{row.estimatedBillingAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{row.salesPersonName}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="レコード複製"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDuplicateTargetProjectNumber(row.projectNumber)
                          setDuplicateModalOpen(true)
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
