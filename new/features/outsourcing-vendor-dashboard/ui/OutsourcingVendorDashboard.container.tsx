"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useOutsourcingVendorDashboard } from "@/new/features/outsourcing-vendor-dashboard/hooks/useOutsourcingVendorDashboard"
import { OutsourcingVendorDashboardView } from "@/new/features/outsourcing-vendor-dashboard/ui/OutsourcingVendorDashboard.view"

export const OutsourcingVendorDashboardContainer = () => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])

  const {
    groupedProducts,
    selectedProduct,
    selectedProductId,
    transactionResultDraft,
    machineDataDraft,
    onSelectProduct,
    onTransactionResultChange,
    onMachineDataChange,
    onUploadReport,
    onSavePostEventData,
  } = useOutsourcingVendorDashboard({ repository })

  return (
    <OutsourcingVendorDashboardView
      groupedProducts={groupedProducts}
      selectedProduct={selectedProduct}
      selectedProductId={selectedProductId}
      transactionResultDraft={transactionResultDraft}
      machineDataDraft={machineDataDraft}
      onSelectProduct={onSelectProduct}
      onTransactionResultChange={onTransactionResultChange}
      onMachineDataChange={onMachineDataChange}
      onUploadReport={onUploadReport}
      onSavePostEventData={onSavePostEventData}
    />
  )
}
