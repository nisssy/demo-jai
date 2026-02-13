"use client"

import { useMemo } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useProjectQuote } from "@/new/features/project-quote/hooks/useProjectQuote"
import { ProjectQuoteView } from "./ProjectQuote.view"

type ProjectQuoteContainerProps = {
  projectNumber: string
}

export const ProjectQuoteContainer = ({ projectNumber }: ProjectQuoteContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const router = useAppRouter()
  const hookResult = useProjectQuote({ repository, projectNumber })

  const handleClose = () => {
    router.push(`/new/project-number/${projectNumber}`)
  }

  return <ProjectQuoteView {...hookResult} onClose={handleClose} />
}
