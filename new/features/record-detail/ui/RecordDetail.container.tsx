"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useRecordDetail } from "../hooks/useRecordDetail"
import { RecordDetailView } from "./RecordDetail.view"

type RecordDetailContainerProps = {
  productId: number
  role?: import("@/new/types/role").Role
}

export const RecordDetailContainer = ({ productId, role = "Sales" }: RecordDetailContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])

  const { data, canEdit, handleBack, handleEdit, handleGoToProject } = useRecordDetail({
    repository,
    productId,
    role,
  })

  return (
    <RecordDetailView
      data={data}
      canEdit={canEdit}
      onBack={handleBack}
      onEdit={handleEdit}
      onGoToProject={handleGoToProject}
    />
  )
}
