"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useProjectDetail } from "@/new/features/project-detail/hooks/useProjectDetail"
import { ProjectDetailView } from "./ProjectDetail.view"

type ProjectDetailContainerProps = {
  projectNumber: string
}

export const ProjectDetailContainer = ({ projectNumber }: ProjectDetailContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const result = useProjectDetail({ repository, projectNumber })

  return <ProjectDetailView {...result} />
}
