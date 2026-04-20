"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useProjectList } from "@/new/features/project-list/hooks/useProjectList"
import { ProjectListView } from "@/new/features/project-list/ui/ProjectList.view"

export const ProjectListContainer = () => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])

  const {
    activeTab,
    setActiveTab,
    projectsTabGroups,
    messagesTabGroups,
    messagesCount,
    filters,
    setFilters,
    companySearchOpen,
    setCompanySearchOpen,
    companySearchQuery,
    setCompanySearchQuery,
    filteredCompanies,
    getCompanyByCompanyId,
    handleSelectCompany,
    hallSearchOpen,
    setHallSearchOpen,
    hallSearchQuery,
    setHallSearchQuery,
    filteredHalls,
    handleSelectHall,
    savedConditions,
    handleSaveCondition,
    handleDeleteCondition,
    handleApplyCondition,
    handleExportConditions,
    handleCreateNewProject,
    handleClickDetail,
    handleClickRecord,
    handleClickMessageProduct,
    handleProductCreated,
    handleDuplicated,
    addProductModalOpen,
    setAddProductModalOpen,
    repository: hookRepository,
  } = useProjectList({ repository })

  return (
    <ProjectListView
      activeTab={activeTab}
      onActiveTabChange={setActiveTab}
      projectsTabGroups={projectsTabGroups}
      messagesTabGroups={messagesTabGroups}
      messagesCount={messagesCount}
      filters={filters}
      onFiltersChange={setFilters}
      companySearchOpen={companySearchOpen}
      onCompanySearchOpenChange={setCompanySearchOpen}
      companySearchQuery={companySearchQuery}
      onCompanySearchQueryChange={setCompanySearchQuery}
      filteredCompanies={filteredCompanies}
      getCompanyByCompanyId={getCompanyByCompanyId}
      onSelectCompany={handleSelectCompany}
      hallSearchOpen={hallSearchOpen}
      onHallSearchOpenChange={setHallSearchOpen}
      hallSearchQuery={hallSearchQuery}
      onHallSearchQueryChange={setHallSearchQuery}
      filteredHalls={filteredHalls}
      onSelectHall={handleSelectHall}
      savedConditions={savedConditions}
      onSaveCondition={handleSaveCondition}
      onDeleteCondition={handleDeleteCondition}
      onApplyCondition={handleApplyCondition}
      onExportConditions={handleExportConditions}
      onCreateNewProject={handleCreateNewProject}
      onClickDetail={handleClickDetail}
      onClickRecord={handleClickRecord}
      onClickMessageProduct={handleClickMessageProduct}
      repository={hookRepository}
      onProductCreated={handleProductCreated}
      onDuplicated={handleDuplicated}
      addProductModalOpen={addProductModalOpen}
      onAddProductModalOpenChange={setAddProductModalOpen}
    />
  )
}
