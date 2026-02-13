"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useProjectRegistration } from "@/new/features/project-registration/hooks/useProjectRegistration"
import { useLotteryForm } from "@/new/features/project-registration/hooks/useLotteryForm"
import { ProjectRegistrationView } from "./ProjectRegistration.view"
import type { RegistrationMode } from "@/new/features/project-registration/model/types"

type ProjectRegistrationContainerProps = {
  mode: RegistrationMode
  productId?: number
  correctionRequest?: string
}

export const ProjectRegistrationContainer = ({
  mode,
  productId,
  correctionRequest,
}: ProjectRegistrationContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const lotteryForm = useLotteryForm({ repository, productId })
  const hookResult = useProjectRegistration({
    repository, mode, productId, correctionRequest,
    getLotteryData: lotteryForm.getLotteryData,
  })

  return <ProjectRegistrationView {...hookResult} lotteryForm={lotteryForm} />
}
