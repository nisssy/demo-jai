"use client"

import { useMemo } from "react"
import { useProductManagementDashboard } from "@/features/product-management-dashboard/hooks/useProductManagementDashboard"
import { normalizeBannerData } from "@/features/product-management-dashboard/model/types"
import { ProductManagementDashboardView } from "@/features/product-management-dashboard/ui/ProductManagementDashboard.view"
import type { ProjectData } from "@/types/project"
import type { ProjectWithMachines } from "@/features/product-management-dashboard/ui/sections/ProjectMachinesSection.view"

export type ProductManagementDashboardContainerProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  addNotification: (message: string) => void
}

export const ProductManagementDashboardContainer = ({
  projectData,
  setProjectData,
  addNotification,
}: ProductManagementDashboardContainerProps) => {
  const state = useProductManagementDashboard({ projectData, setProjectData, addNotification })

  const projectMachinesList: ProjectWithMachines[] = useMemo(() => {
    return state.products.map((p) => ({
      id: p.id,
      projectNumber: (p as any).projectNumber,
      projectName: (p as any).projectName ?? "",
      eventProductName: (p as any).eventProductName,
      targetMachineNames: (p as any).targetMachineNames ?? [],
      pachitownMachineNames: (p as any).pachitownMachineNames ?? [],
      pachitownLinked: (p as any).pachitownLinked,
      pachitownLinkedDate: (p as any).pachitownLinkedDate,
      bannerGenerated: (p as any).bannerGenerated,
      bannerData: normalizeBannerData((p as any).bannerData),
    }))
  }, [state.products])

  const handleOpenBanner = (productId: number) => {
    const product = state.products.find((p) => p.id === productId)
    if (product) state.openBannerModal(product)
  }

  return (
    <ProductManagementDashboardView
      activeTab={state.activeTab}
      onActiveTabChange={state.setActiveTab}
      machineMasters={state.machineMasters}
      newMachineName={state.newMachineName}
      newPachitownName={state.newPachitownName}
      onNewMachineNameChange={state.setNewMachineName}
      onNewPachitownNameChange={state.setNewPachitownName}
      onAddMachineMaster={state.addMachineMaster}
      onRemoveMachineMaster={state.removeMachineMaster}
      addMachineMasterDisabled={!state.newMachineName.trim() || !state.newPachitownName.trim()}
      projectMachinesList={projectMachinesList}
      onOpenBanner={handleOpenBanner}
      onPachitownLink={state.handlePachitownLink}
      bannerModalOpen={state.bannerModalOpen}
      onBannerModalOpenChange={state.setBannerModalOpen}
      bannerEdit={state.bannerEdit}
      onBannerEditChange={state.updateBannerEdit}
      onCloseBannerModal={state.closeBannerModal}
      editingProductId={state.editingProductId}
      editingMachineIndex={state.editingMachineIndex}
      editingMachineName={state.editingMachineName}
      onStartEditMachine={state.handleStartEditMachine}
      onEditMachineNameChange={state.handleEditMachineNameChange}
      onSaveEditMachine={state.handleSaveEditMachine}
      onCancelEditMachine={state.handleCancelEditMachine}
    />
  )
}
