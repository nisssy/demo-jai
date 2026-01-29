import type { ProjectData, Role } from "@/types/project"
import type { ProjectItem, ProjectListProps } from "@/features/project-list/model/types"
import type { DemoProject } from "@/lib/demo-db/types"
import type { ProjectListTab } from "@/features/project-list/hooks/useProjectList"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Calendar, Edit2, MapPin, Plus, User, Download, FileText } from "lucide-react"

import { OrderConfirmDialog } from "@/features/project-list/ui/modals/order-confirm-dialog"
import { ValidationDialog } from "@/features/project-list/ui/modals/validation-dialog"
import { PrDialog } from "@/features/project-list/ui/modals/pr-dialog"
import { CostDialog } from "@/features/project-list/ui/modals/cost-dialog"
import { DataCollectionDialog } from "@/features/project-list/ui/modals/data-collection-dialog"
import { DataExportDialog } from "@/features/project-list/ui/modals/data-export-dialog"
import { QuoteDialog } from "@/features/project-list/ui/modals/quote-dialog"

import { ProjectProductCard } from "@/features/project-list/ui/components/project-product-card"
import { ProjectAlertCard } from "@/features/project-list/ui/components/project-alert-card"
import { ProjectListFilters } from "@/features/project-list/ui/components/project-list-filters"

type StatusBadgeRenderer = (status: string | undefined) => ReactNode

export type ProjectListViewProps = ProjectListProps & {
  activeTab: ProjectListTab
  onActiveTabChange: (tab: ProjectListTab) => void

  eligibleProjects: Array<{ projectNumber: string; projectName?: string; hallName?: string; hallCode?: string; companyId?: string; companyName?: string; salesPersonName?: string; requestDate?: string; clientName?: string }>
  allProducts: DemoProject[]

  productsByProjectNumberProjectsTab: Record<string, DemoProject[]>
  productsByProjectNumberCorrectionsTab: Record<string, DemoProject[]>
  productsByProjectNumberTemporaryHoldFailureTab: Record<string, DemoProject[]>
  correctionRequestsCount: number
  temporaryHoldFailureRequestsCount: number

  isLoadingNotify: boolean

  searchProjectNumber: string
  onSearchProjectNumberChange: (v: string) => void
  searchProjectName: string
  onSearchProjectNameChange: (v: string) => void
  selectedSalesPersonId: number | null
  onSelectedSalesPersonIdChange: (v: number | null) => void
  salesPersonSearchOpen: boolean
  onSalesPersonSearchOpenChange: (v: boolean) => void
  salesPersonSearchQuery: string
  onSalesPersonSearchQueryChange: (v: string) => void
  searchEmployees: (q: string) => any[]
  getEmployeeById: (id: number) => any | null

  searchDateMode: "execution" | "created"
  onSearchDateModeChange: (v: "execution" | "created") => void
  searchDateFrom: string
  onSearchDateFromChange: (v: string) => void
  searchDateTo: string
  onSearchDateToChange: (v: string) => void
  searchCategory: string | null
  onSearchCategoryChange: (v: string | null) => void
  searchEventType: string | null
  onSearchEventTypeChange: (v: string | null) => void
  eventTypeSearchOpen: boolean
  onEventTypeSearchOpenChange: (v: boolean) => void
  eventTypeSearchQuery: string
  onEventTypeSearchQueryChange: (v: string) => void

  searchOpen: boolean
  onSearchOpenChange: (v: boolean) => void
  searchType: "hall" | "company"
  onSearchTypeChange: (v: "hall" | "company") => void
  searchQuery: string
  onSearchQueryChange: (v: string) => void
  selectedHallName: string | null
  onSelectedHallNameChange: (v: string | null) => void
  selectedCompanyId: string | null
  onSelectedCompanyIdChange: (v: string | null) => void
  searchHalls: (q: string, companyId?: number) => any[]
  searchCompanies: (q: string) => any[]
  getCompanyByCompanyId: (companyId: string) => any | null

  isModalOpen: boolean
  onModalOpenChange: (open: boolean) => void
  selectedProject: ProjectItem | null
  onSelectedProjectChange: (p: ProjectItem | null) => void

  isValidationModalOpen: boolean
  onValidationModalOpenChange: (open: boolean) => void
  validationProject: ProjectItem | null
  isValidating: boolean
  validationResult: any | null
  correctionMessage: string
  onCorrectionMessageChange: (v: string) => void
  correctionFormData: { contractAmount: string; billingAddress: string }
  onCorrectionFormDataChange: (v: { contractAmount: string; billingAddress: string }) => void
  onGenerateCorrection: () => void
  onSubmitCorrection: () => void
  onNotifyInternal: () => void

  isPRModalOpen: boolean
  onPRModalOpenChange: (open: boolean) => void
  isCostModalOpen: boolean
  onCostModalOpenChange: (open: boolean) => void
  selectedModalProject: DemoProject | null
  onOpenPRModal: (p: DemoProject) => void
  onOpenCostModal: (p: DemoProject) => void
  onGeneratePR: () => void
  isGenerating: boolean
  prGenerated: boolean
  prText: string
  onPrTextChange: (v: string) => void

  costs: Array<{ item: string; amount: string }>
  onCostsChange: (v: Array<{ item: string; amount: string }>) => void
  autoFilled: boolean
  onAutoFill: () => void

  showDataCollectionModal: boolean
  onShowDataCollectionModalChange: (open: boolean) => void
  showDataExportModal: boolean
  onShowDataExportModalChange: (open: boolean) => void
  onOpenDataCollectionModal: (p: ProjectItem) => void
  onOpenDataExportModal: (p: ProjectItem) => void

  isQuoteModalOpen: boolean
  onQuoteModalOpenChange: (open: boolean) => void
  selectedProjectForQuote: { projectNumber: string; products: DemoProject[] } | null
  onSelectedProjectForQuoteChange: (v: { projectNumber: string; products: DemoProject[] } | null) => void
  onOpenQuoteModal: (projectNumber: string, products: DemoProject[]) => void
  onDownloadQuotePdf: (projectNumber: string, products: DemoProject[]) => void

  renderStatusBadge: StatusBadgeRenderer

  updateProduct: (id: number, updates: Partial<DemoProject>) => DemoProject | null
  onToggleStatus: (project: ProjectItem, checked: boolean) => void

  onClickEditProject: (projectNumber: string) => void
  onClickAddProduct: (firstProductId: number) => void
  onClickOpenProduct: (productId: number, isCorrection: boolean) => void
}

export const ProjectListView = ({
  projectData,
  setProjectData,
  onNext,
  onBack,
  addNotification,
  role,
  setCurrentScreen,
  onCreateNewProject,

  activeTab,
  onActiveTabChange,

  eligibleProjects,
  allProducts,
  productsByProjectNumberProjectsTab,
  productsByProjectNumberCorrectionsTab,
  productsByProjectNumberTemporaryHoldFailureTab,
  correctionRequestsCount,
  temporaryHoldFailureRequestsCount,

  isLoadingNotify,

  searchProjectNumber,
  onSearchProjectNumberChange,
  searchProjectName,
  onSearchProjectNameChange,
  selectedSalesPersonId,
  onSelectedSalesPersonIdChange,
  salesPersonSearchOpen,
  onSalesPersonSearchOpenChange,
  salesPersonSearchQuery,
  onSalesPersonSearchQueryChange,
  searchEmployees,
  getEmployeeById,

  searchDateMode,
  onSearchDateModeChange,
  searchDateFrom,
  onSearchDateFromChange,
  searchDateTo,
  onSearchDateToChange,
  searchCategory,
  onSearchCategoryChange,
  searchEventType,
  onSearchEventTypeChange,
  eventTypeSearchOpen,
  onEventTypeSearchOpenChange,
  eventTypeSearchQuery,
  onEventTypeSearchQueryChange,

  searchOpen,
  onSearchOpenChange,
  searchType,
  onSearchTypeChange,
  searchQuery,
  onSearchQueryChange,
  selectedHallName,
  onSelectedHallNameChange,
  selectedCompanyId,
  onSelectedCompanyIdChange,
  searchHalls,
  searchCompanies,
  getCompanyByCompanyId,

  isModalOpen,
  onModalOpenChange,
  selectedProject,

  isValidationModalOpen,
  onValidationModalOpenChange,
  validationProject,
  isValidating,
  validationResult,
  correctionMessage,
  onCorrectionMessageChange,
  correctionFormData,
  onCorrectionFormDataChange,
  onGenerateCorrection,
  onSubmitCorrection,
  onNotifyInternal,

  isPRModalOpen,
  onPRModalOpenChange,
  isCostModalOpen,
  onCostModalOpenChange,
  selectedModalProject,
  onGeneratePR,
  isGenerating,
  prGenerated,
  prText,
  onPrTextChange,

  costs,
  onCostsChange,
  autoFilled,
  onAutoFill,

  showDataCollectionModal,
  onShowDataCollectionModalChange,
  showDataExportModal,
  onShowDataExportModalChange,

  isQuoteModalOpen,
  onQuoteModalOpenChange,
  selectedProjectForQuote,
  onSelectedProjectForQuoteChange,
  onOpenQuoteModal,
  onDownloadQuotePdf,

  renderStatusBadge,
  updateProduct,
  onToggleStatus,

  onClickEditProject,
  onClickAddProduct,
  onClickOpenProduct,
}: ProjectListViewProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {isLoadingNotify && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-700">内勤へ通知中...</p>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => onActiveTabChange(value as ProjectListTab)} className="w-full">
        <div className="border-b border-slate-100 mb-8">
          <div className="flex items-center justify-between">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger
                value="projects"
                className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              >
                案件一覧
              </TabsTrigger>
              <TabsTrigger
                value="corrections"
                className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              >
                修正確認依頼
                {correctionRequestsCount > 0 && (
                  <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {correctionRequestsCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="temporaryHoldFailure"
                className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              >
                仮押さえ不可
                {temporaryHoldFailureRequestsCount > 0 && (
                  <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {temporaryHoldFailureRequestsCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <button
              onClick={onCreateNewProject}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              新規案件作成
            </button>
          </div>
        </div>

        <TabsContent value="projects" className="mt-0">
          <ProjectListFilters
            searchProjectNumber={searchProjectNumber}
            onSearchProjectNumberChange={onSearchProjectNumberChange}
            searchProjectName={searchProjectName}
            onSearchProjectNameChange={onSearchProjectNameChange}
            selectedSalesPersonId={selectedSalesPersonId}
            onSelectedSalesPersonIdChange={onSelectedSalesPersonIdChange}
            salesPersonSearchOpen={salesPersonSearchOpen}
            onSalesPersonSearchOpenChange={onSalesPersonSearchOpenChange}
            salesPersonSearchQuery={salesPersonSearchQuery}
            onSalesPersonSearchQueryChange={onSalesPersonSearchQueryChange}
            searchEmployees={searchEmployees}
            getEmployeeById={getEmployeeById}
            searchDateMode={searchDateMode}
            onSearchDateModeChange={onSearchDateModeChange}
            searchDateFrom={searchDateFrom}
            onSearchDateFromChange={onSearchDateFromChange}
            searchDateTo={searchDateTo}
            onSearchDateToChange={onSearchDateToChange}
            searchCategory={searchCategory}
            onSearchCategoryChange={onSearchCategoryChange}
            searchEventType={searchEventType}
            onSearchEventTypeChange={onSearchEventTypeChange}
            eventTypeSearchOpen={eventTypeSearchOpen}
            onEventTypeSearchOpenChange={onEventTypeSearchOpenChange}
            eventTypeSearchQuery={eventTypeSearchQuery}
            onEventTypeSearchQueryChange={onEventTypeSearchQueryChange}
            searchOpen={searchOpen}
            onSearchOpenChange={onSearchOpenChange}
            searchType={searchType}
            onSearchTypeChange={onSearchTypeChange}
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            selectedHallName={selectedHallName}
            onSelectedHallNameChange={onSelectedHallNameChange}
            selectedCompanyId={selectedCompanyId}
            onSelectedCompanyIdChange={onSelectedCompanyIdChange}
            searchHalls={searchHalls}
            searchCompanies={searchCompanies}
            getCompanyByCompanyId={getCompanyByCompanyId}
          />

          {Object.keys(productsByProjectNumberProjectsTab).length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {(searchProjectNumber ||
              searchProjectName ||
              selectedSalesPersonId != null ||
              searchDateFrom ||
              searchDateTo ||
              searchCategory ||
              searchEventType ||
              selectedHallName ||
              selectedCompanyId)
                ? "検索結果が見つかりませんでした"
                : "案件がありません"}
            </div>
          ) : (
            <div className="space-y-6">
              {eligibleProjects
                .filter((p) => (productsByProjectNumberProjectsTab[p.projectNumber]?.length ?? 0) > 0)
                .map((p) => {
                  const projectNumber = p.projectNumber
                  const projectProducts = productsByProjectNumberProjectsTab[projectNumber] ?? []
                  const firstProduct = projectProducts[0]
                  const hallName =
                    p.hallName || (p as any).clientName || (firstProduct as any)?.hallName || (firstProduct as any)?.clientName || "未分類"
                  const salesPersonName = p.salesPersonName || (firstProduct as any)?.salesPersonName || "-"
                  const requestDate = p.requestDate || (firstProduct as any)?.requestDate || "-"
                  const companyName = p.companyName || (firstProduct as any)?.companyName || "-"
                  const companyId = p.companyId || (firstProduct as any)?.companyId || "-"
                  const hallId = p.hallCode || (firstProduct as any)?.hallId || "-"
                  const projectName = p.projectName || (firstProduct as any)?.projectName || "-"

                  return (
                    <Card key={projectNumber} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="mb-4 pb-4 border-b-2 border-slate-300">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="flex flex-col gap-1">
                                <h2 className="text-3xl font-bold text-slate-900 whitespace-nowrap">{projectName}</h2>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-slate-600 whitespace-nowrap">案件No: {projectNumber}</span>
                                  <Badge variant="outline" className="whitespace-nowrap">
                                    {projectProducts.length}件の商材
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>
                                  法人名: <span className="font-medium text-slate-900">{companyName}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>
                                  法人ID: <span className="font-medium text-slate-900">{companyId}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  ホール名: <span className="font-medium text-slate-900">{String(hallName ?? "-")}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>
                                  ホールID: <span className="font-medium text-slate-900">{hallId}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  担当営業: <span className="font-medium text-slate-900">{salesPersonName}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  依頼日: <span className="font-medium text-slate-900">{requestDate}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button onClick={() => onClickEditProject(projectNumber)} variant="outline" className="gap-2">
                                <Edit2 className="h-4 w-4" />
                                案件を編集
                              </Button>
                              <Button onClick={() => onOpenQuoteModal(projectNumber, projectProducts)} variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" />
                                見積書作成
                              </Button>
                              {projectProducts.some((p) => (p as any).quoteGenerated) && (
                                <Button onClick={() => onDownloadQuotePdf(projectNumber, projectProducts)} variant="outline" className="gap-2">
                                  <Download className="h-4 w-4" />
                                  見積書ダウンロード
                                </Button>
                              )}
                              <Button onClick={() => onClickAddProduct((firstProduct as any).id)} variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                商材を追加
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {projectProducts.map((project) => {
                            const projectItem: ProjectItem = {
                              id: (project as any).id,
                              projectNumber: (project as any).projectNumber,
                              projectName: (project as any).projectName,
                              clientName: (project as any).clientName,
                              talent: (project as any).talent,
                              date: (project as any).date,
                              venue: (project as any).venue,
                              status: (project as any).status,
                              estimateAmount: (project as any).estimateAmount,
                              salesPersonName: (project as any).salesPersonName,
                              requestDate: (project as any).requestDate,
                              hallName: (project as any).hallName,
                              hallId: (project as any).hallId,
                              companyId: (project as any).companyId,
                              companyName: (project as any).companyName,
                              projectStatus: (project as any).projectStatus,
                              category: (project as any).category,
                              eventType: (project as any).eventType,
                              eventProductName: (project as any).eventProductName,
                              eventDate: (project as any).eventDate,
                            }
                            return (
                              <ProjectProductCard
                                key={(project as any).id}
                                project={project as any}
                                projectItem={projectItem}
                                statusBadge={renderStatusBadge(projectItem.projectStatus)}
                                onClick={() => {
                                  const isCorrection = projectItem.projectStatus === "営業修正中"
                                  onClickOpenProduct((project as any).id, isCorrection)
                                }}
                                onToggleStatus={(checked) => onToggleStatus(projectItem, checked)}
                              />
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}

          <OrderConfirmDialog
            open={isModalOpen}
            onOpenChange={onModalOpenChange}
            project={selectedProject}
            getStatusBadge={renderStatusBadge as any}
            projectData={projectData}
            setProjectData={setProjectData}
            updateProduct={updateProduct}
            addNotification={addNotification as any}
          />

          <ValidationDialog
            open={isValidationModalOpen}
            onOpenChange={onValidationModalOpenChange}
            validationProject={validationProject}
            isValidating={isValidating}
            validationResult={validationResult}
            correctionMessage={correctionMessage}
            onCorrectionMessageChange={onCorrectionMessageChange}
            onGenerateCorrection={onGenerateCorrection}
            correctionFormData={correctionFormData}
            onCorrectionFormDataChange={onCorrectionFormDataChange}
            onSubmitCorrection={onSubmitCorrection}
            onNotifyInternal={onNotifyInternal}
          />

          <PrDialog
            open={isPRModalOpen}
            onOpenChange={onPRModalOpenChange}
            project={selectedModalProject as any}
            onGenerate={onGeneratePR}
            isGenerating={isGenerating}
            generated={prGenerated}
            text={prText}
            onTextChange={onPrTextChange}
          />

          <CostDialog
            open={isCostModalOpen}
            onOpenChange={onCostModalOpenChange}
            project={selectedModalProject as any}
            costs={costs}
            onCostsChange={onCostsChange}
            onAutoFill={onAutoFill}
            autoFilled={autoFilled}
            onSave={() => addNotification?.("コスト情報を保存しました")}
          />

          <DataCollectionDialog open={showDataCollectionModal} onOpenChange={onShowDataCollectionModalChange} project={selectedProject} />
          <DataExportDialog open={showDataExportModal} onOpenChange={onShowDataExportModalChange} project={selectedProject} />
        </TabsContent>

        <TabsContent value="corrections" className="mt-0">
          {correctionRequestsCount === 0 ? (
            <div className="text-center py-12 text-slate-500">修正依頼はありません</div>
          ) : (
            <div className="space-y-6">
              {eligibleProjects
                .filter((p) => (productsByProjectNumberCorrectionsTab[p.projectNumber]?.length ?? 0) > 0)
                .map((p) => {
                  const projectNumber = p.projectNumber
                  const projectProducts = productsByProjectNumberCorrectionsTab[projectNumber] ?? []
                  const firstProduct = projectProducts[0]

                  const hallName =
                    p.hallName || (p as any).clientName || (firstProduct as any)?.hallName || (firstProduct as any)?.clientName || "未分類"
                  const salesPersonName = p.salesPersonName || (firstProduct as any)?.salesPersonName || "-"
                  const requestDate = p.requestDate || (firstProduct as any)?.requestDate || "-"
                  const companyName = p.companyName || (firstProduct as any)?.companyName || "-"
                  const companyId = p.companyId || (firstProduct as any)?.companyId || "-"
                  const hallId = p.hallCode || (firstProduct as any)?.hallId || "-"
                  const projectName = p.projectName || (firstProduct as any)?.projectName || "-"

                  return (
                    <Card key={projectNumber} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="mb-4 pb-4 border-b-2 border-slate-300">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="flex flex-col gap-1">
                                <h2 className="text-3xl font-bold text-slate-900 whitespace-nowrap">{projectName}</h2>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-slate-600 whitespace-nowrap">案件No: {projectNumber}</span>
                                  <Badge variant="outline" className="whitespace-nowrap">
                                    {projectProducts.length}件の修正対象商材
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>
                                  法人名: <span className="font-medium text-slate-900">{companyName}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>
                                  法人ID: <span className="font-medium text-slate-900">{companyId}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  ホール名: <span className="font-medium text-slate-900">{String(hallName ?? "-")}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>
                                  ホールID: <span className="font-medium text-slate-900">{hallId}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  担当営業: <span className="font-medium text-slate-900">{salesPersonName}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  依頼日: <span className="font-medium text-slate-900">{requestDate}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button onClick={() => onClickEditProject(projectNumber)} variant="outline" className="gap-2">
                                <Edit2 className="h-4 w-4" />
                                案件を編集
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {projectProducts.map((project) => {
                            const projectItem: ProjectItem = {
                              id: (project as any).id,
                              projectNumber: (project as any).projectNumber,
                              projectName: (project as any).projectName,
                              clientName: (project as any).clientName,
                              talent: (project as any).talent,
                              date: (project as any).date,
                              venue: (project as any).venue,
                              status: (project as any).status,
                              estimateAmount: (project as any).estimateAmount,
                              salesPersonName: (project as any).salesPersonName,
                              requestDate: (project as any).requestDate,
                              hallName: (project as any).hallName,
                              hallId: (project as any).hallId,
                              companyId: (project as any).companyId,
                              companyName: (project as any).companyName,
                              projectStatus: (project as any).projectStatus,
                              category: (project as any).category,
                              eventType: (project as any).eventType,
                              eventProductName: (project as any).eventProductName,
                              eventDate: (project as any).eventDate,
                            }
                            const correctionRequest = (project as any).correctionRequest || ""
                            return (
                              <ProjectAlertCard
                                key={(project as any).id}
                                project={project as any}
                                projectItem={projectItem}
                                statusBadge={renderStatusBadge(projectItem.projectStatus)}
                                alertTitle="修正依頼内容"
                                alertText={correctionRequest}
                                actionLabel="修正"
                                onAction={() => onClickOpenProduct((project as any).id, true)}
                              />
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="temporaryHoldFailure" className="mt-0">
          {temporaryHoldFailureRequestsCount === 0 ? (
            <div className="text-center py-12 text-slate-500">仮押さえ不可の通知はありません</div>
          ) : (
            <div className="space-y-6">
              {eligibleProjects
                .filter((p) => (productsByProjectNumberTemporaryHoldFailureTab[p.projectNumber]?.length ?? 0) > 0)
                .map((p) => {
                  const projectNumber = p.projectNumber
                  const projectProducts = productsByProjectNumberTemporaryHoldFailureTab[projectNumber] ?? []
                  const firstProduct = projectProducts[0]

                  const hallName =
                    p.hallName || (p as any).clientName || (firstProduct as any)?.hallName || (firstProduct as any)?.clientName || "未分類"
                  const salesPersonName = p.salesPersonName || (firstProduct as any)?.salesPersonName || "-"
                  const requestDate = p.requestDate || (firstProduct as any)?.requestDate || "-"
                  const companyName = p.companyName || (firstProduct as any)?.companyName || "-"
                  const companyId = p.companyId || (firstProduct as any)?.companyId || "-"
                  const hallId = p.hallCode || (firstProduct as any)?.hallId || "-"
                  const projectName = p.projectName || (firstProduct as any)?.projectName || "-"

                  return (
                    <Card key={projectNumber} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="mb-4 pb-4 border-b-2 border-slate-300">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="flex flex-col gap-1">
                                <h2 className="text-3xl font-bold text-slate-900 whitespace-nowrap">{projectName}</h2>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-slate-600 whitespace-nowrap">案件No: {projectNumber}</span>
                                  <Badge variant="outline" className="whitespace-nowrap">
                                    {projectProducts.length}件の仮押さえ不可商材
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>
                                  法人名: <span className="font-medium text-slate-900">{companyName}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>
                                  法人ID: <span className="font-medium text-slate-900">{companyId}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  ホール名: <span className="font-medium text-slate-900">{String(hallName ?? "-")}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>
                                  ホールID: <span className="font-medium text-slate-900">{hallId}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  担当営業: <span className="font-medium text-slate-900">{salesPersonName}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  依頼日: <span className="font-medium text-slate-900">{requestDate}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button onClick={() => onClickEditProject(projectNumber)} variant="outline" className="gap-2">
                                <Edit2 className="h-4 w-4" />
                                案件を編集
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {projectProducts.map((project) => {
                            const projectItem: ProjectItem = {
                              id: (project as any).id,
                              projectNumber: (project as any).projectNumber,
                              projectName: (project as any).projectName,
                              clientName: (project as any).clientName,
                              talent: (project as any).talent,
                              date: (project as any).date,
                              venue: (project as any).venue,
                              status: (project as any).status,
                              estimateAmount: (project as any).estimateAmount,
                              salesPersonName: (project as any).salesPersonName,
                              requestDate: (project as any).requestDate,
                              hallName: (project as any).hallName,
                              hallId: (project as any).hallId,
                              companyId: (project as any).companyId,
                              companyName: (project as any).companyName,
                              projectStatus: (project as any).projectStatus,
                              category: (project as any).category,
                              eventType: (project as any).eventType,
                              eventProductName: (project as any).eventProductName,
                              eventDate: (project as any).eventDate,
                            }
                            const temporaryHoldFailureComment = (project as any).temporaryHoldFailureComment || ""
                            return (
                              <ProjectAlertCard
                                key={(project as any).id}
                                project={project as any}
                                projectItem={projectItem}
                                statusBadge={renderStatusBadge(projectItem.projectStatus)}
                                alertTitle="仮押さえ不可の理由"
                                alertText={temporaryHoldFailureComment}
                                actionLabel="編集"
                                actionIcon={<Edit2 className="h-4 w-4" />}
                                onAction={() => onClickOpenProduct((project as any).id, false)}
                              />
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <QuoteDialog
        open={isQuoteModalOpen}
        onOpenChange={(open) => {
          onQuoteModalOpenChange(open)
          if (!open) onSelectedProjectForQuoteChange(null)
        }}
        project={selectedProjectForQuote as any}
        onRequestClose={() => {
          onQuoteModalOpenChange(false)
          onSelectedProjectForQuoteChange(null)
        }}
        updateProduct={updateProduct}
        addNotification={addNotification as any}
      />
    </div>
  )
}

