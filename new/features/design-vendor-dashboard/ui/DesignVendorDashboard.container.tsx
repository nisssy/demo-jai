"use client"

import type { ProjectRepository } from "@/new/api/project-repository"
import { useDesignVendorDashboard } from "@/new/features/design-vendor-dashboard/hooks/useDesignVendorDashboard"
import { DesignVendorDashboardView } from "@/new/features/design-vendor-dashboard/ui/DesignVendorDashboard.view"
import { DesignVendorBillingContainer } from "@/new/features/design-vendor-billing/ui/DesignVendorBilling.container"

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
    chatMessages,
    handleSelectRequest,
    handleFileUpload,
    handleChatSend,
  } = useDesignVendorDashboard(repository)

  return (
    <DesignVendorDashboardView
      requestedRequests={requestedRequests}
      uploadedRequests={uploadedRequests}
      selectedRequest={selectedRequest}
      selectedRequestId={selectedRequestId}
      chatMessages={chatMessages}
      onSelectRequest={handleSelectRequest}
      onFileUpload={handleFileUpload}
      onChatSend={handleChatSend}
      billingTab={<DesignVendorBillingContainer repository={repository} />}
    />
  )
}
