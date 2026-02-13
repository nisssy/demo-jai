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
    correctionsTabGroups,
    holdFailureTabGroups,
    correctionsCount,
    holdFailureCount,
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
    handleCreateNewProject,
    handleClickDetail,
    handleClickProduct,
    handleClickCorrectionProduct,
    handleClickHoldFailureProduct,
  } = useProjectList({ repository })

  return (
    <ProjectListView
      activeTab={activeTab}
      onActiveTabChange={setActiveTab}
      projectsTabGroups={projectsTabGroups}
      correctionsTabGroups={correctionsTabGroups}
      holdFailureTabGroups={holdFailureTabGroups}
      correctionsCount={correctionsCount}
      holdFailureCount={holdFailureCount}
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
      onCreateNewProject={handleCreateNewProject}
      onClickDetail={handleClickDetail}
      onClickProduct={handleClickProduct}
      onClickCorrectionProduct={handleClickCorrectionProduct}
      onClickHoldFailureProduct={handleClickHoldFailureProduct}
    />
  )
}
