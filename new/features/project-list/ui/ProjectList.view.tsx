import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, PackagePlus } from "lucide-react"
import type { ProjectListTab, FilterState, SavedSearchCondition } from "@/new/features/project-list/model/types"
import type { ProjectGroupViewModel } from "@/new/features/project-list/hooks/useProjectList"
import type { Company, Hall } from "@/new/api/types"
import type { ProjectRepository } from "@/new/api/project-repository"
import { ProjectCard } from "./components/ProjectCard"
import { MessageCard } from "./components/MessageCard"
import { RecordListPanel } from "./components/RecordListPanel"

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
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">案件一覧</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => {}}>
            <PackagePlus className="h-4 w-4" />
            新規商材追加
          </Button>
          <Button className="gap-2" onClick={onCreateNewProject}>
            <Plus className="h-4 w-4" />
            新規案件作成
          </Button>
        </div>
      </div>

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
          <RecordListPanel
            projectGroups={projectsTabGroups}
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
            onCreateNewProject={onCreateNewProject}
            onClickDetail={onClickDetail}
            onClickRecord={onClickRecord}
            repository={repository}
            onProductCreated={onProductCreated}
            onDuplicated={onDuplicated}
            showHeader={false}
          />
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
