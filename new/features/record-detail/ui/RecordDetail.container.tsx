"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useRecordDetail } from "../hooks/useRecordDetail"
import { RecordDetailView } from "./RecordDetail.view"

type RecordDetailContainerProps = {
  productId: number
}

export const RecordDetailContainer = ({ productId }: RecordDetailContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])

  const { data, handleBack, handleEdit, handleGoToProject } = useRecordDetail({
    repository,
    productId,
  })

  return (
    <RecordDetailView
      data={data}
      onBack={handleBack}
      onEdit={handleEdit}
      onGoToProject={handleGoToProject}
    />
  )
}
