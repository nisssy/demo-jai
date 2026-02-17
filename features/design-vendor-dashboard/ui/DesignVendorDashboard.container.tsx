"use client"

import { useDesignVendorDashboard } from "@/features/design-vendor-dashboard/hooks/useDesignVendorDashboard"
import { DesignVendorDashboardView } from "@/features/design-vendor-dashboard/ui/DesignVendorDashboard.view"

export type DesignVendorDashboardContainerProps = {
  addNotification: (message: string) => void
}

export const DesignVendorDashboardContainer = ({ addNotification }: DesignVendorDashboardContainerProps) => {
  const state = useDesignVendorDashboard({ addNotification })

  return (
    <DesignVendorDashboardView
      requestsGroupedByStatus={state.requestsGroupedByStatus}
      selectedRequestId={state.selectedRequestId}
      selectedRequest={state.selectedRequest}
      onSelectRequest={(req) => state.setSelectedRequestId(req.id)}
      onCloseDetail={state.clearSelection}
      getRequestTypeLabel={state.getRequestTypeLabel}
      uploadFileName={state.uploadFileName}
      showUploadModal={state.showUploadModal}
      onUploadFileNameChange={state.setUploadFileName}
      onOpenUploadModal={state.handleOpenUploadModal}
      onUpload={state.handleUpload}
      onCloseUploadModal={() => state.setShowUploadModal(false)}
      commentText={state.commentText}
      showCommentModal={state.showCommentModal}
      onCommentTextChange={state.setCommentText}
      onOpenCommentModal={state.handleOpenCommentModal}
      onAddComment={state.handleAddComment}
      onCloseCommentModal={() => state.setShowCommentModal(false)}
    />
  )
}
