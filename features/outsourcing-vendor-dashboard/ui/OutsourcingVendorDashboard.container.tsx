"use client"

import { useEffect, useState } from "react"
import { useOutsourcingVendorDashboard } from "@/features/outsourcing-vendor-dashboard/hooks/useOutsourcingVendorDashboard"
import { OutsourcingVendorDashboardView } from "@/features/outsourcing-vendor-dashboard/ui/OutsourcingVendorDashboard.view"
import type { ProjectData } from "@/types/project"

export type OutsourcingVendorDashboardContainerProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  addNotification: (message: string) => void
}

export const OutsourcingVendorDashboardContainer = ({
  projectData,
  setProjectData,
  addNotification,
}: OutsourcingVendorDashboardContainerProps) => {
  const state = useOutsourcingVendorDashboard({ projectData, setProjectData, addNotification })
  const [postEventTransactionResult, setPostEventTransactionResult] = useState("")
  const [postEventMachineData, setPostEventMachineData] = useState("")

  useEffect(() => {
    if (state.selectedProduct) {
      setPostEventTransactionResult((state.selectedProduct as any).postEventTransactionResult ?? "")
      setPostEventMachineData((state.selectedProduct as any).postEventMachineData ?? "")
    } else {
      setPostEventTransactionResult("")
      setPostEventMachineData("")
    }
  }, [state.selectedProduct])

  return (
    <OutsourcingVendorDashboardView
      productsGroupedByStatus={state.productsGroupedByStatus}
      selectedProductId={state.selectedProductId}
      onSelectProduct={(p) => state.setSelectedProductId(p.id)}
      selectedProduct={state.selectedProduct}
      onCloseDetail={state.clearSelection}
      onReportUpload={state.handleReportUpload}
      onPachitownLink={state.handlePachitownLink}
      onPostEventDataSave={state.handlePostEventDataSave}
      postEventTransactionResult={postEventTransactionResult}
      postEventMachineData={postEventMachineData}
      onPostEventTransactionResultChange={setPostEventTransactionResult}
      onPostEventMachineDataChange={setPostEventMachineData}
    />
  )
}
