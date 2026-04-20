import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import { CastArrangementTabView } from "./sections/CastArrangementTab.view"
import { ArrangementTabView } from "./sections/ArrangementTab.view"
import { PostEventTabView } from "./sections/PostEventTab.view"
import { ProductConfirmationTabView } from "./sections/ProductConfirmationTab.view"
import { HoldFailureModalView } from "./modals/HoldFailureModal.view"
import { AutoArrangementModalView } from "./modals/AutoArrangementModal.view"
import { SurveyResultModalView } from "./modals/SurveyResultModal.view"
import { StatusHistoryModalView } from "./modals/StatusHistoryModal.view"
import { CostExportModalView } from "./modals/CostExportModal.view"
import { CostumeArrangementModalView } from "./modals/CostumeArrangementModal.view"
import { ProductConfirmationDetailModalView } from "./modals/ProductConfirmationDetailModal.view"
import { CostInputModalView } from "./modals/CostInputModal.view"
import { CastAssignmentModalView } from "./modals/CastAssignmentModal.view"
import { ChatDrawerView } from "./modals/ChatDrawer.view"
import { RecordListPanel } from "@/new/features/project-list/ui/components/RecordListPanel"
import type { UseEventTeamDashboardReturn } from "../hooks/useEventTeamDashboard"
import type { ArrangementChecks, CostExportStatuses } from "../hooks/useEventTeamDashboard"
import type { UseLotteryFormReturn } from "@/new/features/project-registration/hooks/useLotteryForm"
import type { useProjectList } from "@/new/features/project-list/hooks/useProjectList"

export type EventTeamDashboardViewProps = UseEventTeamDashboardReturn & {
  confirmationLotteryForm: UseLotteryFormReturn
  projectList: ReturnType<typeof useProjectList>
  onClickProduct: (productId: number) => void
}

const tabTriggerClass = "relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"

export function EventTeamDashboardView(props: EventTeamDashboardViewProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">マネジメント部 ダッシュボード</h1>
        <Button variant="outline" onClick={() => props.setShowCostExportModal(true)} className="gap-2">
          <Download className="h-4 w-4" />
          コスト出力
        </Button>
      </div>

      {/* トースト通知 */}
      {props.autoArrangementToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg">
          {props.autoArrangementToast}
        </div>
      )}

      <Tabs
        value={props.activeTab}
        onValueChange={val => props.setActiveTab(val as typeof props.activeTab)}
        className="w-full"
      >
        <div className="border-b border-slate-100 mb-8">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            <TabsTrigger value="project-list" className={tabTriggerClass}>
              案件一覧
            </TabsTrigger>
            <TabsTrigger value="cast-arrangement" className={tabTriggerClass}>
              キャスト手配
              {props.summaryCounts.castArrangement > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {props.summaryCounts.castArrangement}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="product-confirmation" className={tabTriggerClass}>
              商材確認
              {props.summaryCounts.productConfirmation > 0 && (
                <Badge className="ml-1.5 bg-orange-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {props.summaryCounts.productConfirmation}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="arrangement" className={tabTriggerClass}>
              各種手配
              {props.summaryCounts.arrangement > 0 && (
                <Badge className="ml-1.5 bg-slate-400 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {props.summaryCounts.arrangement}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="post-event" className={tabTriggerClass}>
              イベント終了処理
              {props.summaryCounts.postEvent > 0 && (
                <Badge className="ml-1.5 bg-slate-400 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {props.summaryCounts.postEvent}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="project-list" className="mt-0">
          <RecordListPanel
            projectGroups={props.projectList.projectsTabGroups}
            filters={props.projectList.filters}
            onFiltersChange={props.projectList.setFilters}
            companySearchOpen={props.projectList.companySearchOpen}
            onCompanySearchOpenChange={props.projectList.setCompanySearchOpen}
            companySearchQuery={props.projectList.companySearchQuery}
            onCompanySearchQueryChange={props.projectList.setCompanySearchQuery}
            filteredCompanies={props.projectList.filteredCompanies}
            getCompanyByCompanyId={props.projectList.getCompanyByCompanyId}
            onSelectCompany={props.projectList.handleSelectCompany}
            hallSearchOpen={props.projectList.hallSearchOpen}
            onHallSearchOpenChange={props.projectList.setHallSearchOpen}
            hallSearchQuery={props.projectList.hallSearchQuery}
            onHallSearchQueryChange={props.projectList.setHallSearchQuery}
            filteredHalls={props.projectList.filteredHalls}
            onSelectHall={props.projectList.handleSelectHall}
            savedConditions={props.projectList.savedConditions}
            onSaveCondition={props.projectList.handleSaveCondition}
            onDeleteCondition={props.projectList.handleDeleteCondition}
            onApplyCondition={props.projectList.handleApplyCondition}
            onExportConditions={props.projectList.handleExportConditions}
            onCreateNewProject={props.projectList.handleCreateNewProject}
            onClickDetail={props.projectList.handleClickDetail}
            onClickRecord={props.projectList.handleClickRecord}
            repository={props.projectList.repository}
            onProductCreated={props.projectList.handleProductCreated}
            onDuplicated={props.projectList.handleDuplicated}
          />
        </TabsContent>

        <TabsContent value="cast-arrangement" className="mt-0">
          <CastArrangementTabView
            castSubTab={props.castSubTab}
            onSubTabChange={props.setCastSubTab}
            tentativeGroups={props.tentativeProductionGroups}
            confirmedGroups={props.confirmedProductionGroups}
            tentativeEntryCount={props.tentativeEntryCount}
            confirmedEntryCount={props.confirmedEntryCount}
            undecidedCastRequests={props.undecidedCastRequests}
            onCompleteCast={props.completeCastHold}
            onOpenHoldFailure={props.openHoldFailure}
            onOpenCastAssignment={props.openCastAssignment}
            onOpenChat={props.openChatDrawer}
            onClickProduct={props.onClickProduct}
          />
        </TabsContent>

        <TabsContent value="product-confirmation" className="mt-0">
          <ProductConfirmationTabView
            products={props.confirmationProducts}
            getProjectForProduct={props.getProjectForProduct}
            onOpenDetail={props.openConfirmationDetail}
            onOpenChat={props.openChatDrawer}
            onClickProduct={props.onClickProduct}
          />
        </TabsContent>

        <TabsContent value="arrangement" className="mt-0">
          <ArrangementTabView
            trinityGirlProducts={props.trinityGirlArrangementProducts}
            getProjectForProduct={props.getProjectForProduct}
            onOpenAutoArrangement={props.openAutoArrangement}
            onOpenStatusHistory={props.openStatusHistory}
            onOpenCostumeArrangement={props.openCostumeArrangement}
            onOpenChat={props.openChatDrawer}
            onClickProduct={props.onClickProduct}
          />
        </TabsContent>

        <TabsContent value="post-event" className="mt-0">
          <PostEventTabView
            products={props.postEventProducts}
            getProjectForProduct={props.getProjectForProduct}
            onOpenSurveyResult={props.openSurveyResult}
            onOpenCostInput={props.openCostInput}
            onOpenCostExport={() => props.setShowCostExportModal(true)}
            onClickProduct={props.onClickProduct}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <HoldFailureModalView
        open={props.showHoldFailureModal}
        onOpenChange={props.setShowHoldFailureModal}
        product={props.holdFailureProduct}
        castName={props.holdFailureCastName}
        clientName={props.holdFailureClientName}
        comment={props.holdFailureComment}
        onCommentChange={props.setHoldFailureComment}
        onSubmit={props.submitHoldFailure}
      />

      <AutoArrangementModalView
        open={props.showAutoArrangementModal}
        onOpenChange={props.setShowAutoArrangementModal}
        product={props.selectedProduct}
        checks={props.arrangementChecks}
        onCheckChange={(key: keyof ArrangementChecks, checked: boolean) =>
          props.setArrangementChecks(prev => ({ ...prev, [key]: checked }))
        }
        onExecute={props.executeAutoArrangement}
        onClose={() => props.setShowAutoArrangementModal(false)}
      />

      <SurveyResultModalView
        open={props.showSurveyResultModal}
        onOpenChange={props.setShowSurveyResultModal}
        product={props.selectedProduct}
        clientName={props.selectedProductClientName}
        onDownloadCsv={props.downloadSurveyCsv}
      />

      <StatusHistoryModalView
        open={props.showStatusHistoryModal}
        onOpenChange={props.setShowStatusHistoryModal}
        product={props.selectedProduct}
        clientName={props.selectedProductClientName}
      />

      <CostumeArrangementModalView
        open={props.showCostumeModal}
        onOpenChange={props.setShowCostumeModal}
        product={props.selectedProduct}
        companionSizes={props.companionSizeMap}
        costumes={props.costumeDraft}
        onCostumeChange={(name, value) =>
          props.setCostumeDraft(prev => ({ ...prev, [name]: value }))
        }
        onSave={props.saveCostumeArrangement}
      />

      <CostExportModalView
        open={props.showCostExportModal}
        onOpenChange={props.setShowCostExportModal}
        dateFrom={props.costExportDateFrom}
        dateTo={props.costExportDateTo}
        onDateFromChange={props.setCostExportDateFrom}
        onDateToChange={props.setCostExportDateTo}
        format={props.costExportFormat}
        onFormatChange={props.setCostExportFormat}
        statuses={props.costExportStatuses}
        onStatusChange={(key: keyof CostExportStatuses, checked: boolean) =>
          props.setCostExportStatuses(prev => ({ ...prev, [key]: checked }))
        }
        targetProducts={props.costExportTargetProducts}
        totalAmount={props.costExportTotalAmount}
        onDownload={props.downloadCostCsv}
        downloadDisabled={props.costExportTargetProducts.length === 0}
        onClose={props.closeCostExportModal}
      />

      <ProductConfirmationDetailModalView
        open={props.showConfirmationDetailModal}
        onOpenChange={props.setShowConfirmationDetailModal}
        productForm={props.confirmationProductForm}
        projectName={props.selectedConfirmationProduct ? (props.getProjectForProduct(props.selectedConfirmationProduct)?.projectName ?? "") : ""}
        clientName={props.selectedConfirmationClientName}
        hallAddress=""
        lotteryForm={props.confirmationLotteryForm}
        comment={props.confirmationComment}
        onCommentChange={props.setConfirmationComment}
        onApprove={props.handleApproveProduct}
        onRequestRevision={props.handleRequestRevision}
      />

      <CostInputModalView
        open={props.showCostInputModal}
        onOpenChange={props.setShowCostInputModal}
        product={props.costInputProduct}
        projectName={props.costInputProjectName}
        clientName={props.costInputClientName}
        estimatedAmount={props.costInputEstimatedAmount}
        costs={props.costInputItems}
        onCostsChange={props.setCostInputItems}
        onAutoFill={props.autoFillCostInput}
        autoFilled={props.costInputAutoFilled}
        onSave={props.saveCostInput}
      />

      <CastAssignmentModalView
        open={props.showCastAssignmentModal}
        onOpenChange={props.setShowCastAssignmentModal}
        product={props.castAssignmentProduct}
        projectName={props.castAssignmentProjectName}
        availableCompanions={props.availableCompanionsForAssignment}
        selectedCompanions={props.selectedAssignCompanions}
        maxCompanions={props.maxAssignCompanions}
        onToggleCompanion={props.toggleAssignCompanion}
        showCompanionSection={props.castAssignmentProduct?.eventType !== "スロセレ" && (props.maxAssignCompanions > 0)}
        availableDirectors={props.availableDirectorsForAssignment}
        selectedDirectors={props.selectedAssignDirectors}
        maxDirectors={props.maxAssignDirectors}
        onToggleDirector={props.toggleAssignDirector}
        showDirectorSection={props.maxAssignDirectors > 0}
        productionNames={props.productionNameRecord}
        onSubmit={props.submitCastAssignment}
      />

      <ChatDrawerView
        open={props.showChatDrawer}
        onOpenChange={props.setShowChatDrawer}
        productId={props.chatProductId}
        productName={props.chatProductName}
      />
    </div>
  )
}
