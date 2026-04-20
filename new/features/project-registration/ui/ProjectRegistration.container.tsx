"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useProjectRegistration } from "@/new/features/project-registration/hooks/useProjectRegistration"
import { useLotteryForm } from "@/new/features/project-registration/hooks/useLotteryForm"
import { useCastCalendar } from "@/new/features/project-registration/hooks/useCastCalendar"
import { ProjectRegistrationView } from "./ProjectRegistration.view"
import type { ProductComment } from "@/new/api/types"
import type { RegistrationMode } from "@/new/features/project-registration/model/types"
import type { Role } from "@/new/types/role"

type ProjectRegistrationContainerProps = {
  mode: RegistrationMode
  productId?: number
  comments?: ProductComment[]
  role?: Role
}

export const ProjectRegistrationContainer = ({
  mode,
  productId,
  comments,
  role = "Sales",
}: ProjectRegistrationContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const lotteryForm = useLotteryForm({ repository, productId })
  const hookResult = useProjectRegistration({
    repository, mode, productId, comments,
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

  const allEmployees = useMemo(() => repository.getEmployees(), [repository])

  return <ProjectRegistrationView {...hookResult} lotteryForm={lotteryForm} castCalendar={castCalendar} role={role} allEmployees={allEmployees} />
}
