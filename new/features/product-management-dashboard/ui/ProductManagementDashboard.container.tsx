"use client"

import { useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import { useProductManagementDashboard } from "../hooks/useProductManagementDashboard"
import { ProductManagementDashboardView } from "@/features/product-management-dashboard/ui/ProductManagementDashboard.view"
import type { ProductManagementDashboardTab } from "@/features/product-management-dashboard/hooks/useProductManagementDashboard"
import type { ProjectWithMachines } from "@/features/product-management-dashboard/ui/sections/ProjectMachinesSection.view"
import { normalizeBannerData } from "@/features/product-management-dashboard/model/types"

export interface ProductManagementDashboardContainerProps {
  repository: ProjectRepository
}

export const ProductManagementDashboardContainer = ({
  repository,
}: ProductManagementDashboardContainerProps) => {
  const state = useProductManagementDashboard(repository)

  const projectMachinesList: ProjectWithMachines[] = useMemo(() => {
    return state.products.map((p) => ({
      id: p.id,
      projectNumber: p.projectNumber,
      projectName: state.productViewModels.find((vm) => vm.productId === p.id)?.projectName ?? p.eventProductName ?? "",
      eventProductName: p.eventProductName,
      targetMachineNames: p.targetMachineNames ?? [],
      pachitownMachineNames: p.pachitownMachineNames ?? [],
      pachitownLinked: p.pachitownLinked,
      pachitownLinkedDate: p.pachitownLinkedDate,
      bannerGenerated: p.bannerGenerated,
      bannerData: normalizeBannerData(p.bannerData),
    }))
  }, [state.products, state.productViewModels])

  const handleOpenBanner = (productId: number) => {
    state.openBannerModal(productId)
  }

  return (
    <ProductManagementDashboardView
      activeTab={state.activeTab as ProductManagementDashboardTab}
      onActiveTabChange={state.setActiveTab as (tab: ProductManagementDashboardTab) => void}
      machineMasters={state.machineMasters}
      newMachineName={state.newMasterName}
      newPachitownName={state.newMasterPachitownName}
      onNewMachineNameChange={state.setNewMasterName}
      onNewPachitownNameChange={state.setNewMasterPachitownName}
      onAddMachineMaster={state.addMachineMaster}
      onRemoveMachineMaster={state.deleteMachineMaster}
      addMachineMasterDisabled={!state.newMasterName.trim() || !state.newMasterPachitownName.trim()}
      projectMachinesList={projectMachinesList}
      onOpenBanner={handleOpenBanner}
      onPachitownLink={state.handlePachitownLink}
      editingProductId={state.editingProductId}
      editingMachineIndex={state.editingMachineIndex}
      editingMachineName={state.editingMachineName}
      onStartEditMachine={state.handleStartEditMachine}
      onEditMachineNameChange={state.handleEditMachineNameChange}
      onSaveEditMachine={state.handleSaveEditMachine}
      onCancelEditMachine={state.handleCancelEditMachine}
      bannerModalOpen={state.bannerModalOpen}
      onBannerModalOpenChange={state.onBannerModalOpenChange}
      bannerEdit={state.bannerEdit}
      onBannerEditChange={state.updateBannerEdit}
      onCloseBannerModal={state.closeBannerModal}
    />
  )
}
