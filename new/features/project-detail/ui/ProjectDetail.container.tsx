"use client"

import { useMemo, useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useProjectDetail } from "@/new/features/project-detail/hooks/useProjectDetail"
import { ProjectDetailView } from "./ProjectDetail.view"

type ProjectDetailContainerProps = {
  projectNumber: string
}

export const ProjectDetailContainer = ({ projectNumber }: ProjectDetailContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const router = useAppRouter()
  const result = useProjectDetail({ repository, projectNumber })

  const handleDuplicated = useCallback((newProjectNumber: string) => {
    router.push(`/new/project-number/${newProjectNumber}?role=Sales`)
  }, [router])

  return <ProjectDetailView {...result} repository={repository} onDuplicated={handleDuplicated} />
}
