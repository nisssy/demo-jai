"use client"

import { useEventTeamDashboard } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"
import { EventTeamDashboardView } from "@/features/event-team-dashboard/ui/EventTeamDashboard.view"
import { CastingInfoModalView } from "@/features/event-team-dashboard/ui/modals/CastingInfoModal.view"
import { TemporaryHoldFailureModalView } from "@/features/event-team-dashboard/ui/modals/TemporaryHoldFailureModal.view"
import { ConfirmationModalView } from "@/features/event-team-dashboard/ui/modals/ConfirmationModal.view"
import { CorrectionModalView } from "@/features/event-team-dashboard/ui/modals/CorrectionModal.view"
import { AutoArrangementModalView } from "@/features/event-team-dashboard/ui/modals/AutoArrangementModal.view"
import { SurveyResultModalView } from "@/features/event-team-dashboard/ui/modals/SurveyResultModal.view"
import { CostExportModalView } from "@/features/event-team-dashboard/ui/modals/CostExportModal.view"
import { StatusHistoryModalView } from "@/features/event-team-dashboard/ui/modals/StatusHistoryModal.view"
import type { ProjectData } from "@/types/project"

export type EventTeamDashboardContainerProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  addNotification: (message: string) => void
}

export const EventTeamDashboardContainer = ({ projectData, setProjectData, addNotification }: EventTeamDashboardContainerProps) => {
  const state = useEventTeamDashboard({ projectData, setProjectData, addNotification })

  return (
    <>
      <EventTeamDashboardView
        activeTab={state.activeTab}
        onActiveTabChange={state.setActiveTab}
        arrangementsSubTab={state.arrangementsSubTab}
        onArrangementsSubTabChange={state.setArrangementsSubTab}
        arrangementProjects={state.arrangementProjects}
        temporaryHoldRequests={state.temporaryHoldRequests}
        confirmationRequests={state.confirmationRequests}
        postEventProjects={state.postEventProjects}
        holdRequestGroupsByProduction={state.holdRequestGroupsByProduction}
        hasHoldRequestCastGroups={state.hasHoldRequestCastGroups}
        normalizeSelectedNames={state.normalizeSelectedNames}
        computeTentativeProgress={state.computeTentativeProgress}
        getPachitownPublicationStatus={state.getPachitownPublicationStatus}
        onViewCastingInfo={state.handleViewCastingInfo}
        onTemporaryHoldFailure={state.handleTemporaryHoldFailure}
        onViewStatusHistory={(project) => {
          state.setSelectedProjectForHistory(project)
          state.setShowStatusHistoryModal(true)
        }}
        onNavigateToArrangement={(projectId) => {
          state.router.push(`/project/${projectId}/arrangement`)
        }}
        onNavigateToAutoArrangement={(projectId) => {
          state.router.push(`/project/${projectId}/auto-arrangement`)
        }}
        onViewDetails={state.handleViewDetails}
        onNavigateToCost={(projectId) => {
          state.router.push(`/project/${projectId}/cost`)
        }}
        onViewSurveyResult={(project) => {
          state.setSelectedProject(project)
          state.setShowSurveyResultModal(true)
        }}
        onOpenCostExportModal={() => {
          state.setShowCostExportModal(true)
        }}
      />

      <CastingInfoModalView
        open={state.showCastingInfoModal}
        onOpenChange={state.setShowCastingInfoModal}
        project={state.selectedProject}
        normalizeSelectedNames={state.normalizeSelectedNames}
        computeTentativeProgress={state.computeTentativeProgress}
        draftCompanionBookingStatus={state.draftCompanionBookingStatus}
        draftDirectorBookingStatus={state.draftDirectorBookingStatus}
        draftMcBookingStatus={state.draftMcBookingStatus}
        draftCompanionFailureComment={state.draftCompanionFailureComment}
        draftDirectorFailureComment={state.draftDirectorFailureComment}
        draftMcFailureComment={state.draftMcFailureComment}
        onCompanionStatusChange={state.handleCompanionStatusChange}
        onDirectorStatusChange={state.handleDirectorStatusChange}
        onMcStatusChange={state.handleMcStatusChange}
        onCompanionFailureCommentChange={state.handleCompanionFailureCommentChange}
        onDirectorFailureCommentChange={state.handleDirectorFailureCommentChange}
        onMcFailureCommentChange={state.handleMcFailureCommentChange}
        onSave={state.handleConfirmTemporaryHoldFromCasting}
        onClose={() => state.setShowCastingInfoModal(false)}
      />

      <TemporaryHoldFailureModalView
        open={state.showTemporaryHoldFailureModal}
        onOpenChange={state.setShowTemporaryHoldFailureModal}
        project={state.selectedProject}
        comment={state.temporaryHoldFailureComment}
        onCommentChange={state.setTemporaryHoldFailureComment}
        onConfirm={state.handleConfirmTemporaryHoldFailure}
      />

      <ConfirmationModalView
        open={state.showConfirmationModal}
        onOpenChange={state.setShowConfirmationModal}
        project={state.selectedProject}
        onClose={() => state.setShowConfirmationModal(false)}
        onRequestCorrection={state.handleRequestCorrection}
        onConfirmContent={state.handleConfirmContent}
      />

      <CorrectionModalView
        open={state.showCorrectionModal}
        onOpenChange={state.setShowCorrectionModal}
        correctionRequest={state.correctionRequest}
        onCorrectionRequestChange={state.setCorrectionRequest}
        onSubmit={state.handleSubmitCorrection}
        submitDisabled={!state.correctionRequest.trim()}
      />

      <AutoArrangementModalView
        open={state.showAutoArrangementModal}
        onOpenChange={state.setShowAutoArrangementModal}
        project={state.selectedProject}
        checks={state.autoArrangementChecks}
        onCheckChange={(key, checked) =>
          state.setAutoArrangementChecks((prev) => ({ ...prev, [key]: checked }))
        }
        onExecute={state.handleExecuteAutoArrangement}
        onClose={state.closeAutoArrangementModal}
      />

      <SurveyResultModalView
        open={state.showSurveyResultModal}
        onOpenChange={state.setShowSurveyResultModal}
        project={state.selectedProject}
        onDownloadCsv={state.handleDownloadSurveyCsv}
      />

      <CostExportModalView
        open={state.showCostExportModal}
        onOpenChange={state.setShowCostExportModal}
        dateFrom={state.costExportDateFrom}
        dateTo={state.costExportDateTo}
        onDateFromChange={state.setCostExportDateFrom}
        onDateToChange={state.setCostExportDateTo}
        format={state.costExportFormat}
        onFormatChange={state.setCostExportFormat}
        statuses={state.costExportStatuses}
        onStatusChange={(key, checked) =>
          state.setCostExportStatuses((prev) => ({ ...prev, [key]: checked }))
        }
        targetProjects={state.costExportTargetProjects}
        totalAmount={state.costExportTotalAmount}
        onDownload={state.handleDownloadCostCsv}
        downloadDisabled={
          !state.costExportDateFrom ||
          !state.costExportDateTo ||
          (!state.costExportStatuses.inProgress && !state.costExportStatuses.postEvent) ||
          state.costExportTargetProjects.length === 0
        }
        onClose={state.closeCostExportModal}
      />

      <StatusHistoryModalView
        open={state.showStatusHistoryModal}
        onOpenChange={state.setShowStatusHistoryModal}
        project={state.selectedProjectForHistory}
      />
    </>
  )
}
