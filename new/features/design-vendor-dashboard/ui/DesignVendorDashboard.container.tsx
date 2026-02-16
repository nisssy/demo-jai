"use client"

import type { ProjectRepository } from "@/new/api/project-repository"
import { useDesignVendorDashboard } from "@/new/features/design-vendor-dashboard/hooks/useDesignVendorDashboard"
import { DesignVendorDashboardView } from "@/new/features/design-vendor-dashboard/ui/DesignVendorDashboard.view"

export interface DesignVendorDashboardContainerProps {
  repository: ProjectRepository
}

export const DesignVendorDashboardContainer = ({
  repository,
}: DesignVendorDashboardContainerProps) => {
  const {
    requestedRequests,
    uploadedRequests,
    selectedRequest,
    selectedRequestId,
    commentText,
    setCommentText,
    handleSelectRequest,
    handleFileUpload,
    handleCommentSubmit,
  } = useDesignVendorDashboard(repository)

  return (
    <DesignVendorDashboardView
      requestedRequests={requestedRequests}
      uploadedRequests={uploadedRequests}
      selectedRequest={selectedRequest}
      selectedRequestId={selectedRequestId}
      commentText={commentText}
      onCommentTextChange={setCommentText}
      onSelectRequest={handleSelectRequest}
      onFileUpload={handleFileUpload}
      onCommentSubmit={handleCommentSubmit}
    />
  )
}
