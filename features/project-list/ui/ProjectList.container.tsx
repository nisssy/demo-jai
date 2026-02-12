"use client"

import { Badge } from "@/components/ui/badge"
import type { ProjectListProps, ProjectItem } from "@/features/project-list/model/types"
import { useProjectList } from "@/features/project-list/hooks/useProjectList"
import { ProjectListView } from "@/features/project-list/ui/ProjectList.view"

const renderStatusBadge = (status: string | undefined) => {
  if (!status) {
    return (
      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
        -
      </Badge>
    )
  }
  switch (status) {
    case "見積送付完了":
      return <Badge className="bg-green-600 text-white">見積送付完了</Badge>
    case "見込み入力完了":
      return <Badge className="bg-slate-500 text-white">見込み入力完了</Badge>
    case "仮押さえ依頼":
      return <Badge className="bg-yellow-600 text-white">仮押さえ依頼</Badge>
    case "仮押さえ済み":
      return <Badge className="bg-green-600 text-white">仮押さえ済み</Badge>
    case "マネジメント部確認中":
      return <Badge className="bg-blue-600 text-white">マネジメント部確認中</Badge>
    case "営業修正中":
      return <Badge className="bg-orange-600 text-white">営業修正中</Badge>
    case "営業確認中":
      return <Badge className="bg-orange-600 text-white">営業確認中</Badge>
    case "本押さえ依頼":
      return <Badge className="bg-purple-600 text-white">本押さえ依頼</Badge>
    case "手配進行中":
      return <Badge className="bg-blue-600 text-white">手配進行中</Badge>
    case "イベント終了処理中":
      return <Badge className="bg-blue-600 text-white">イベント終了処理中</Badge>
    case "手配完了":
      return <Badge className="bg-green-600 text-white">手配完了</Badge>
    case "キャンセル":
      return <Badge className="bg-red-600 text-white">キャンセル</Badge>
    default:
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          {status}
        </Badge>
      )
  }
}

export const ProjectListContainer = (props: ProjectListProps) => {
  const state = useProjectList(props as any)

  const addNotification = state.addNotification ?? (() => {})

  return (
    <ProjectListView
      {...props}
      activeTab={state.activeTab}
      onActiveTabChange={state.setActiveTab}
      eligibleProjects={state.eligibleProjects as any}
      allProducts={state.allProducts as any}
      productsByProjectNumberProjectsTab={state.productsByProjectNumberProjectsTab as any}
      productsByProjectNumberCorrectionsTab={state.productsByProjectNumberCorrectionsTab as any}
      productsByProjectNumberTemporaryHoldFailureTab={state.productsByProjectNumberTemporaryHoldFailureTab as any}
      correctionRequestsCount={state.correctionRequestsCount}
      temporaryHoldFailureRequestsCount={state.temporaryHoldFailureRequestsCount}
      isLoadingNotify={state.isLoadingNotify}
      searchProjectNumber={state.searchProjectNumber}
      onSearchProjectNumberChange={state.setSearchProjectNumber}
      searchProjectName={state.searchProjectName}
      onSearchProjectNameChange={state.setSearchProjectName}
      selectedSalesPersonId={state.selectedSalesPersonId}
      onSelectedSalesPersonIdChange={state.setSelectedSalesPersonId}
      salesPersonSearchOpen={state.salesPersonSearchOpen}
      onSalesPersonSearchOpenChange={state.setSalesPersonSearchOpen}
      salesPersonSearchQuery={state.salesPersonSearchQuery}
      onSalesPersonSearchQueryChange={state.setSalesPersonSearchQuery}
      searchEmployees={state.searchEmployees}
      getEmployeeById={state.getEmployeeById}
      searchDateMode={state.searchDateMode}
      onSearchDateModeChange={state.setSearchDateMode}
      searchDateFrom={state.searchDateFrom}
      onSearchDateFromChange={state.setSearchDateFrom}
      searchDateTo={state.searchDateTo}
      onSearchDateToChange={state.setSearchDateTo}
      searchCategory={state.searchCategory}
      onSearchCategoryChange={state.setSearchCategory}
      searchEventType={state.searchEventType}
      onSearchEventTypeChange={state.setSearchEventType}
      eventTypeSearchOpen={state.eventTypeSearchOpen}
      onEventTypeSearchOpenChange={state.setEventTypeSearchOpen}
      eventTypeSearchQuery={state.eventTypeSearchQuery}
      onEventTypeSearchQueryChange={state.setEventTypeSearchQuery}
      searchOpen={state.searchOpen}
      onSearchOpenChange={state.setSearchOpen}
      searchType={state.searchType}
      onSearchTypeChange={state.setSearchType}
      searchQuery={state.searchQuery}
      onSearchQueryChange={state.setSearchQuery}
      selectedHallName={state.selectedHallName}
      onSelectedHallNameChange={state.setSelectedHallName}
      selectedCompanyId={state.selectedCompanyId}
      onSelectedCompanyIdChange={state.setSelectedCompanyId}
      searchHalls={state.searchHalls}
      searchCompanies={state.searchCompanies}
      getCompanyByCompanyId={state.getCompanyByCompanyId}
      isModalOpen={state.isModalOpen}
      onModalOpenChange={state.setIsModalOpen}
      selectedProject={state.selectedProject}
      onSelectedProjectChange={state.setSelectedProject}
      isValidationModalOpen={state.isValidationModalOpen}
      onValidationModalOpenChange={state.setIsValidationModalOpen}
      validationProject={state.validationProject}
      isValidating={state.isValidating}
      validationResult={state.validationResult}
      correctionMessage={state.correctionMessage}
      onCorrectionMessageChange={state.setCorrectionMessage}
      correctionFormData={state.correctionFormData}
      onCorrectionFormDataChange={state.setCorrectionFormData as any}
      onGenerateCorrection={state.handlers.handleGenerateCorrection}
      onSubmitCorrection={state.handlers.handleSubmitCorrection}
      onNotifyInternal={state.handlers.handleNotifyInternal}
      isPRModalOpen={state.isPRModalOpen}
      onPRModalOpenChange={state.setIsPRModalOpen}
      isCostModalOpen={state.isCostModalOpen}
      onCostModalOpenChange={state.setIsCostModalOpen}
      selectedModalProject={state.selectedModalProject as any}
      onOpenPRModal={state.handlers.handleOpenPRModal as any}
      onOpenCostModal={state.handlers.handleOpenCostModal as any}
      onGeneratePR={state.handlers.handleGeneratePR}
      isGenerating={state.isGenerating}
      prGenerated={state.prGenerated}
      prText={state.prText}
      onPrTextChange={state.setPrText}
      costs={state.costs}
      onCostsChange={state.setCosts}
      autoFilled={state.costsAutoFilled}
      onAutoFill={state.handlers.handleAutoFillCosts}
      showDataCollectionModal={state.showDataCollectionModal}
      onShowDataCollectionModalChange={state.setShowDataCollectionModal}
      showDataExportModal={state.showDataExportModal}
      onShowDataExportModalChange={state.setShowDataExportModal}
      onOpenDataCollectionModal={state.handlers.handleOpenDataCollectionModal}
      onOpenDataExportModal={state.handlers.handleOpenDataExportModal}
      isQuoteModalOpen={state.isQuoteModalOpen}
      onQuoteModalOpenChange={state.setIsQuoteModalOpen}
      selectedProjectForQuote={state.selectedProjectForQuote}
      onSelectedProjectForQuoteChange={state.setSelectedProjectForQuote}
      onOpenQuoteModal={state.handlers.handleOpenQuoteModal}
      onDownloadQuotePdf={state.handlers.handleDownloadQuotePdf}
      renderStatusBadge={renderStatusBadge}
      updateProduct={state.updateProduct as any}
      onClickEditProject={(projectNumber) => state.router.push(`/project-number/${projectNumber}`)}
      onClickAddProduct={(firstProductId) => state.router.push(`/project/${firstProductId}?addProduct=true`)}
      onClickOpenProduct={(productId, isCorrection) =>
        state.router.push(isCorrection ? `/project/${productId}/correction` : `/project/${productId}`)
      }
      addNotification={addNotification as any}
    />
  )
}

