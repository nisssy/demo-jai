"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useRecordDetail } from "../hooks/useRecordDetail"
import { RecordDetailView } from "./RecordDetail.view"
import type { Role } from "@/new/types/role"

type RecordDetailContainerProps = {
  productId: number
  role?: Role
}

export const RecordDetailContainer = ({ productId, role = "Sales" }: RecordDetailContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const {
    data,
    canEdit,
    canEditAdmin,
    allEmployees,
    handleBack,
    handleEdit,
    handleGoToProject,
    handleAdminPersonChange,
    pspLinked,
    togglePsp,
  } = useRecordDetail({ repository, productId, role })

  return (
    <RecordDetailView
      data={data}
      canEdit={canEdit}
      canEditAdmin={canEditAdmin}
      allEmployees={allEmployees}
      onBack={handleBack}
      onEdit={handleEdit}
      onGoToProject={handleGoToProject}
      onAdminPersonChange={handleAdminPersonChange}
      pspLinked={pspLinked}
      onTogglePsp={togglePsp}
    />
  )
}
