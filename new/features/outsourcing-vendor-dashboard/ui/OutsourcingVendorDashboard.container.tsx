"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useOutsourcingVendorDashboard } from "@/new/features/outsourcing-vendor-dashboard/hooks/useOutsourcingVendorDashboard"
import { OutsourcingVendorDashboardView } from "@/new/features/outsourcing-vendor-dashboard/ui/OutsourcingVendorDashboard.view"

export const OutsourcingVendorDashboardContainer = () => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])

  const {
    phaseGroups,
    selectedProduct,
    selectedProductId,
    reportDraft,
    onSelectProduct,
    onUpdateDraftField,
    onUpdateMachineField,
    onSaveReport,
    showChatDrawer,
    setShowChatDrawer,
    openChatDrawer,
  } = useOutsourcingVendorDashboard({ repository })

  return (
    <OutsourcingVendorDashboardView
      phaseGroups={phaseGroups}
      selectedProduct={selectedProduct}
      selectedProductId={selectedProductId}
      reportDraft={reportDraft}
      onSelectProduct={onSelectProduct}
      onUpdateDraftField={onUpdateDraftField}
      onUpdateMachineField={onUpdateMachineField}
      onSaveReport={onSaveReport}
      onOpenChat={openChatDrawer}
      showChatDrawer={showChatDrawer}
      onChatDrawerOpenChange={setShowChatDrawer}
    />
  )
}
