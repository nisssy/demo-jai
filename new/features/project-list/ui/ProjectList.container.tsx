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
    companyHallSearchOpen,
    setCompanyHallSearchOpen,
    companyHallSearchType,
    companyHallSearchQuery,
    setCompanyHallSearchQuery,
    filteredCompanies,
    filteredHalls,
    getCompanyByCompanyId,
    handleSelectHall,
    handleSelectCompany,
    handleCompanyHallSearchTypeChange,
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
      companyHallSearchOpen={companyHallSearchOpen}
      onCompanyHallSearchOpenChange={setCompanyHallSearchOpen}
      companyHallSearchType={companyHallSearchType}
      onCompanyHallSearchTypeChange={handleCompanyHallSearchTypeChange}
      companyHallSearchQuery={companyHallSearchQuery}
      onCompanyHallSearchQueryChange={setCompanyHallSearchQuery}
      filteredCompanies={filteredCompanies}
      filteredHalls={filteredHalls}
      getCompanyByCompanyId={getCompanyByCompanyId}
      onSelectHall={handleSelectHall}
      onSelectCompany={handleSelectCompany}
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
    />
  )
}
