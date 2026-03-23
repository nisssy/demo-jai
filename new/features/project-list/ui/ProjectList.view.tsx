import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Download, PackagePlus, Copy } from "lucide-react"
import type { ProjectListTab, FilterState, SavedSearchCondition } from "@/new/features/project-list/model/types"
import type { ProjectGroupViewModel } from "@/new/features/project-list/hooks/useProjectList"
import type { Company, Hall } from "@/new/api/types"
import type { ProjectRepository } from "@/new/api/project-repository"
import { ProjectCard } from "./components/ProjectCard"
import { MessageCard } from "./components/MessageCard"
import { ProjectListFilters } from "./components/ProjectListFilters"
import { AddProductModal } from "./components/AddProductModal"
import { DuplicateProductModal } from "./components/DuplicateProductModal"
import { PROPOSAL_STATUS_LABELS, EXECUTION_STATUS_LABELS } from "@/new/api/display"
import type { ProposalStatus } from "@/new/api/types"

export type ProjectListViewProps = {
  // タブ
  activeTab: ProjectListTab
  onActiveTabChange: (tab: ProjectListTab) => void
  // データ
  projectsTabGroups: ProjectGroupViewModel[]
  messagesTabGroups: ProjectGroupViewModel[]
  messagesCount: number
  // フィルタ
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  // 法人/ホール検索
  companyHallSearchOpen: boolean
  onCompanyHallSearchOpenChange: (open: boolean) => void
  companyHallSearchType: "hall" | "company"
  onCompanyHallSearchTypeChange: (type: "hall" | "company") => void
  companyHallSearchQuery: string
  onCompanyHallSearchQueryChange: (query: string) => void
  filteredCompanies: Company[]
  filteredHalls: Hall[]
  getCompanyByCompanyId: (companyId: string) => Company | undefined
  onSelectHall: (hallName: string) => void
  onSelectCompany: (companyId: string) => void
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
  onClickMessageProduct: (productId: number) => void
  // 商材追加
  repository: ProjectRepository
  onProductCreated: (productId: number) => void
  // 複製
  onDuplicated: (newProjectNumber: string) => void
}

const tabTriggerClass = "relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"

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

export const ProjectListView = ({
  activeTab,
  onActiveTabChange,
  projectsTabGroups,
  messagesTabGroups,
  messagesCount,
  filters,
  onFiltersChange,
  companyHallSearchOpen,
  onCompanyHallSearchOpenChange,
  companyHallSearchType,
  onCompanyHallSearchTypeChange,
  companyHallSearchQuery,
  onCompanyHallSearchQueryChange,
  filteredCompanies,
  filteredHalls,
  getCompanyByCompanyId,
  onSelectHall,
  onSelectCompany,
  savedConditions,
  onSaveCondition,
  onDeleteCondition,
  onApplyCondition,
  onExportConditions,
  onCreateNewProject,
  onClickDetail,
  onClickRecord,
  onClickMessageProduct,
  repository,
  onProductCreated,
  onDuplicated,
}: ProjectListViewProps) => {
  const [addProductModalOpen, setAddProductModalOpen] = useState(false)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [duplicateTargetProjectNumber, setDuplicateTargetProjectNumber] = useState<string | null>(null)
  // フラットなレコード行に変換
  const recordRows: RecordRow[] = projectsTabGroups.flatMap((group) =>
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
    }))
  )

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">案件一覧</h1>
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

      {/* タブ */}
      <Tabs value={activeTab} onValueChange={(v) => onActiveTabChange(v as ProjectListTab)}>
        <div className="border-b border-slate-100 mb-8">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            <TabsTrigger value="projects" className={tabTriggerClass}>
              レコード一覧
            </TabsTrigger>
            <TabsTrigger value="messages" className={tabTriggerClass}>
              新着メッセージ
              {messagesCount > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {messagesCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* レコード一覧タブ */}
        <TabsContent value="projects" className="mt-0 space-y-4">
          <ProjectListFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            companyHallSearchOpen={companyHallSearchOpen}
            onCompanyHallSearchOpenChange={onCompanyHallSearchOpenChange}
            companyHallSearchType={companyHallSearchType}
            onCompanyHallSearchTypeChange={onCompanyHallSearchTypeChange}
            companyHallSearchQuery={companyHallSearchQuery}
            onCompanyHallSearchQueryChange={onCompanyHallSearchQueryChange}
            filteredCompanies={filteredCompanies}
            filteredHalls={filteredHalls}
            getCompanyByCompanyId={getCompanyByCompanyId}
            onSelectHall={onSelectHall}
            onSelectCompany={onSelectCompany}
            savedConditions={savedConditions}
            onSaveCondition={onSaveCondition}
            onDeleteCondition={onDeleteCondition}
            onApplyCondition={onApplyCondition}
            onExportConditions={onExportConditions}
          />

          {recordRows.length === 0 ? (
            <div className="text-center py-12 text-slate-500">レコードがありません</div>
          ) : (
            <div className="border rounded-lg bg-white overflow-hidden">
              {/* テーブルヘッダー上部のアクション */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                <div className="text-sm text-slate-600">
                  {recordRows.length}件のレコード
                </div>
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

              {/* Kintone風テーブル */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-[100px] font-semibold text-slate-700">案件番号</TableHead>
                      <TableHead className="w-[100px] font-semibold text-slate-700">レコード番号</TableHead>
                      <TableHead className="font-semibold text-slate-700">ステータス</TableHead>
                      <TableHead className="font-semibold text-slate-700">商材区分</TableHead>
                      <TableHead className="font-semibold text-slate-700">商材名</TableHead>
                      <TableHead className="font-semibold text-slate-700">法人</TableHead>
                      <TableHead className="font-semibold text-slate-700">ホール</TableHead>
                      <TableHead className="font-semibold text-slate-700">実施日</TableHead>
                      <TableHead className="font-semibold text-slate-700">実施ステータス</TableHead>
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
                        {/* 案件番号 → 案件詳細へ遷移 */}
                        <TableCell>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                            onClick={(e) => { e.stopPropagation(); onClickDetail(row.projectNumber) }}
                          >
                            {row.projectNumber}
                          </button>
                        </TableCell>
                        {/* レコード番号 → レコード詳細へ遷移 */}
                        <TableCell>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                            onClick={(e) => { e.stopPropagation(); onClickRecord(row.productId) }}
                          >
                            {row.productId}
                          </button>
                        </TableCell>
                        {/* 提案ステータス */}
                        <TableCell>
                          <Badge className={`text-xs px-2 py-0.5 ${getStatusBadgeClass(row.proposalStatusRaw)}`}>
                            {row.proposalStatus}
                          </Badge>
                        </TableCell>
                        {/* 商材区分 */}
                        <TableCell>
                          <Badge className="bg-slate-700 text-white text-xs">{row.category}</Badge>
                        </TableCell>
                        {/* 商材名 */}
                        <TableCell className="text-sm text-slate-900">
                          {row.eventProductName || row.eventType}
                        </TableCell>
                        {/* 法人 */}
                        <TableCell className="text-sm text-slate-600">{row.companyName}</TableCell>
                        {/* ホール */}
                        <TableCell className="text-sm text-slate-600">{row.hallName}</TableCell>
                        {/* 実施日 */}
                        <TableCell className="text-sm text-slate-600">{row.eventDate || "-"}</TableCell>
                        {/* 実施ステータス */}
                        <TableCell>
                          <Badge className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5">
                            {row.executionStatus}
                          </Badge>
                        </TableCell>
                        {/* 見積金額 */}
                        <TableCell className="text-right text-sm font-medium text-slate-900">
                          ¥{row.estimatedBillingAmount.toLocaleString()}
                        </TableCell>
                        {/* 担当営業 */}
                        <TableCell className="text-sm text-slate-600">{row.salesPersonName}</TableCell>
                        {/* 複製 */}
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
        </TabsContent>

        {/* 新着メッセージタブ */}
        <TabsContent value="messages" className="mt-0 space-y-4">
          {messagesTabGroups.length === 0 ? (
            <div className="text-center py-12 text-slate-500">新着メッセージはありません</div>
          ) : (
            <div className="space-y-6">
              {messagesTabGroups.map((group) => (
                <div key={group.projectNumber} className="border rounded-lg bg-white">
                  <div className="p-4 border-b border-slate-100">
                    <ProjectCard project={group} onClickDetail={onClickDetail} />
                  </div>
                  <div className="p-4 space-y-3">
                    {group.products.map((product) => (
                      <MessageCard
                        key={product.id}
                        product={product}
                        onAction={onClickMessageProduct}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
