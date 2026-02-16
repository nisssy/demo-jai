import React from "react";
import type { ProjectRepository } from "@/new/api/project-repository";
import { useProductManagementDashboard } from "../hooks/useProductManagementDashboard";
import { ProductManagementDashboardView } from "./ProductManagementDashboard.view";

export interface ProductManagementDashboardContainerProps {
  repository: ProjectRepository;
}

export const ProductManagementDashboardContainer = ({
  repository,
}: ProductManagementDashboardContainerProps) => {
  const {
    activeTab,
    setActiveTab,
    machineMasters,
    newMasterName,
    setNewMasterName,
    newMasterPachitownName,
    setNewMasterPachitownName,
    addMachineMaster,
    deleteMachineMaster,
    productViewModels,
    autoConvertMachines,
    editingMachineNames,
    updatePachitownMachineNames,
    savePachitownMachineNames,
    handlePachitownLink,
    bannerModalOpen,
    bannerModalData,
    openBannerModal,
    closeBannerModal,
    saveBanner,
  } = useProductManagementDashboard(repository);

  return (
    <ProductManagementDashboardView
      activeTab={activeTab}
      onTabChange={setActiveTab}
      machineMasters={machineMasters}
      newMasterName={newMasterName}
      newMasterPachitownName={newMasterPachitownName}
      onNewMasterNameChange={setNewMasterName}
      onNewMasterPachitownNameChange={setNewMasterPachitownName}
      onAddMaster={addMachineMaster}
      onDeleteMaster={deleteMachineMaster}
      productViewModels={productViewModels}
      editingMachineNames={editingMachineNames}
      onAutoConvert={autoConvertMachines}
      onUpdatePachitownNames={updatePachitownMachineNames}
      onSavePachitownNames={savePachitownMachineNames}
      onPachitownLink={handlePachitownLink}
      onOpenBanner={openBannerModal}
      bannerModalOpen={bannerModalOpen}
      bannerModalData={bannerModalData}
      onCloseBanner={closeBannerModal}
      onSaveBanner={saveBanner}
    />
  );
};
