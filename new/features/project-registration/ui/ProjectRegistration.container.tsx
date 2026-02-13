"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useProjectRegistration } from "@/new/features/project-registration/hooks/useProjectRegistration"
import { useLotteryForm } from "@/new/features/project-registration/hooks/useLotteryForm"
import { useCastCalendar } from "@/new/features/project-registration/hooks/useCastCalendar"
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

  // 最初の商材の実施日時を取得（カレンダー用）
  const firstProduct = hookResult.form.products[0]
  const castCalendar = useCastCalendar({
    repository,
    eventDate: firstProduct?.eventDate ?? "",
    startTime: firstProduct?.startTime ?? "",
    endTime: firstProduct?.endTime ?? "",
  })

  return <ProjectRegistrationView {...hookResult} lotteryForm={lotteryForm} castCalendar={castCalendar} />
}
