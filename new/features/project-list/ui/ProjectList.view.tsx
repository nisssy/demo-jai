import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import type { ProjectListTab, FilterState } from "@/new/features/project-list/model/types"
import type { ProjectGroupViewModel } from "@/new/features/project-list/hooks/useProjectList"
import type { Company, Hall } from "@/new/api/types"
import { ProjectCard } from "./components/ProjectCard"
import { ProductCard } from "./components/ProductCard"
import { ProductAlertCard } from "./components/ProductAlertCard"
import { ProjectListFilters } from "./components/ProjectListFilters"

export type ProjectListViewProps = {
  // タブ
  activeTab: ProjectListTab
  onActiveTabChange: (tab: ProjectListTab) => void
  // データ
  projectsTabGroups: ProjectGroupViewModel[]
  correctionsTabGroups: ProjectGroupViewModel[]
  holdFailureTabGroups: ProjectGroupViewModel[]
  correctionsCount: number
  holdFailureCount: number
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
  // ナビゲーション
  onCreateNewProject: () => void
  onClickDetail: (projectNumber: string) => void
  onClickCorrectionProduct: (productId: number) => void
  onClickHoldFailureProduct: (productId: number) => void
}

const tabTriggerClass = "relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"

export const ProjectListView = ({
  activeTab,
  onActiveTabChange,
  projectsTabGroups,
  correctionsTabGroups,
  holdFailureTabGroups,
  correctionsCount,
  holdFailureCount,
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
  onCreateNewProject,
  onClickDetail,
  onClickCorrectionProduct,
  onClickHoldFailureProduct,
}: ProjectListViewProps) => {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">案件一覧</h1>
        <Button className="gap-2" onClick={onCreateNewProject}>
          <Plus className="h-4 w-4" />
          新規案件作成
        </Button>
      </div>

      {/* タブ */}
      <Tabs value={activeTab} onValueChange={(v) => onActiveTabChange(v as ProjectListTab)}>
        <div className="border-b border-slate-100 mb-8">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            <TabsTrigger value="projects" className={tabTriggerClass}>
              案件一覧
            </TabsTrigger>
            <TabsTrigger value="corrections" className={tabTriggerClass}>
              修正確認依頼
              {correctionsCount > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {correctionsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="temporaryHoldFailure" className={tabTriggerClass}>
              仮押さえ不可
              {holdFailureCount > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {holdFailureCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 案件一覧タブ */}
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
          />

          {projectsTabGroups.length === 0 ? (
            <div className="text-center py-12 text-slate-500">案件がありません</div>
          ) : (
            <div className="space-y-6">
              {projectsTabGroups.map((group) => (
                <div key={group.projectNumber} className="border rounded-lg bg-white">
                  <div className="p-4 border-b border-slate-100">
                    <ProjectCard project={group} onClickDetail={onClickDetail} />
                  </div>
                  <div className="p-4 space-y-3">
                    {group.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        projectSalesPersonName={group.salesPersonName}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 修正確認依頼タブ */}
        <TabsContent value="corrections" className="mt-0 space-y-4">
          {correctionsTabGroups.length === 0 ? (
            <div className="text-center py-12 text-slate-500">修正依頼はありません</div>
          ) : (
            <div className="space-y-6">
              {correctionsTabGroups.map((group) => (
                <div key={group.projectNumber} className="border rounded-lg bg-white">
                  <div className="p-4 border-b border-slate-100">
                    <ProjectCard project={group} onClickDetail={onClickDetail} />
                  </div>
                  <div className="p-4 space-y-3">
                    {group.products.map((product) => (
                      <ProductAlertCard
                        key={product.id}
                        product={product}
                        alertTitle="修正依頼内容"
                        alertText={product.comments?.[product.comments.length - 1]?.content ?? ""}
                        actionLabel="修正"
                        onAction={onClickCorrectionProduct}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 仮押さえ不可タブ */}
        <TabsContent value="temporaryHoldFailure" className="mt-0 space-y-4">
          {holdFailureTabGroups.length === 0 ? (
            <div className="text-center py-12 text-slate-500">仮押さえ不可の案件はありません</div>
          ) : (
            <div className="space-y-6">
              {holdFailureTabGroups.map((group) => (
                <div key={group.projectNumber} className="border rounded-lg bg-white">
                  <div className="p-4 border-b border-slate-100">
                    <ProjectCard project={group} onClickDetail={onClickDetail} />
                  </div>
                  <div className="p-4 space-y-3">
                    {group.products.map((product) => (
                      <ProductAlertCard
                        key={product.id}
                        product={product}
                        alertTitle="仮押さえ不可の理由"
                        alertText={product.temporaryHoldFailureComment ?? ""}
                        actionLabel="編集"
                        onAction={onClickHoldFailureProduct}
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
