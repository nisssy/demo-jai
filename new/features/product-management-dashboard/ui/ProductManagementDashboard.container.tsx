"use client"

import { useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import { useProductManagementDashboard } from "../hooks/useProductManagementDashboard"
import { useProjectList } from "@/new/features/project-list/hooks/useProjectList"
import { ProductManagementDashboardView } from "@/features/product-management-dashboard/ui/ProductManagementDashboard.view"
import type { ProductManagementDashboardTab } from "@/features/product-management-dashboard/hooks/useProductManagementDashboard"
import type { ProjectWithMachines } from "@/features/product-management-dashboard/ui/sections/ProjectMachinesSection.view"
import type { DuringEventProduct } from "@/features/product-management-dashboard/ui/sections/DuringEventSection.view"
import type { PostEventProduct } from "@/features/product-management-dashboard/ui/sections/PostEventSection.view"
import { normalizeBannerData } from "@/features/product-management-dashboard/model/types"

export interface ProductManagementDashboardContainerProps {
  repository: ProjectRepository
}

export const ProductManagementDashboardContainer = ({
  repository,
}: ProductManagementDashboardContainerProps) => {
  const state = useProductManagementDashboard(repository)
  const projectList = useProjectList({ repository, role: "ProductManagement" })

  // 実施前: ProjectWithMachines に変換
  const preEventProjects: ProjectWithMachines[] = useMemo(() => {
    return state.preEventProducts.map((p) => ({
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
      targetMachineFormSent: p.targetMachineFormSent,
    }))
  }, [state.preEventProducts, state.productViewModels])

  // 実施中: DuringEventProduct に変換
  const duringEventProducts: DuringEventProduct[] = useMemo(() => {
    return state.duringEventProducts.map((p) => ({
      id: p.id,
      projectNumber: p.projectNumber,
      projectName: state.productViewModels.find((vm) => vm.productId === p.id)?.projectName ?? p.eventProductName ?? "",
      eventProductName: p.eventProductName,
      interimReport: p.interimReport,
      interimPachitownLinked: p.interimPachitownLinked,
      interimPachitownLinkedDate: p.interimPachitownLinkedDate,
    }))
  }, [state.duringEventProducts, state.productViewModels])

  // 実施後: PostEventProduct に変換
  const postEventProducts: PostEventProduct[] = useMemo(() => {
    return state.postEventProducts.map((p) => ({
      id: p.id,
      projectNumber: p.projectNumber,
      projectName: state.productViewModels.find((vm) => vm.productId === p.id)?.projectName ?? p.eventProductName ?? "",
      eventProductName: p.eventProductName,
      reportUploaded: p.reportUploaded,
      reportUploadedAt: p.reportUploadedAt,
      postEventReport: p.postEventReport,
      postEventPachitownLinked: p.postEventPachitownLinked,
      postEventPachitownLinkedDate: p.postEventPachitownLinkedDate,
    }))
  }, [state.postEventProducts, state.productViewModels])

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
      projectMachinesSubTab={state.projectMachinesSubTab}
      onProjectMachinesSubTabChange={state.setProjectMachinesSubTab}
      preEventProjects={preEventProjects}
      onOpenBanner={handleOpenBanner}
      onPachitownLink={state.handlePachitownLink}
      onSendTargetMachineForm={state.sendTargetMachineForm}
      duringEventProducts={duringEventProducts}
      onLinkInterimPachitown={state.linkInterimPachitown}
      postEventProducts={postEventProducts}
      onLinkPostEventPachitown={state.linkPostEventPachitown}
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
      onOpenChat={state.openChatDrawer}
      showChatDrawer={state.showChatDrawer}
      onChatDrawerOpenChange={state.setShowChatDrawer}
      chatProductId={state.chatProductId}
      chatProductName={state.chatProductName}
      toastMessage={state.toastMessage}
      projectList={projectList}
    />
  )
}
