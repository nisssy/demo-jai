"use client"

import { useMemo, useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useProjectDetail } from "@/new/features/project-detail/hooks/useProjectDetail"
import { ProjectDetailView } from "./ProjectDetail.view"
import type { Role } from "@/new/types/role"

type ProjectDetailContainerProps = {
  projectNumber: string
  role?: Role
}

export const ProjectDetailContainer = ({ projectNumber, role = "Sales" }: ProjectDetailContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const router = useAppRouter()
  const result = useProjectDetail({ repository, projectNumber, role })

  const handleDuplicated = useCallback((newProjectNumber: string) => {
    router.push(`/new/project-number/${newProjectNumber}?role=${role}`)
  }, [router, role])

  return <ProjectDetailView {...result} role={role} repository={repository} onDuplicated={handleDuplicated} />
}
