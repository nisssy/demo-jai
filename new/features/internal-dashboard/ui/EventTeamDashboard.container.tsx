"use client"
import { useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import { useEventTeamDashboard } from "../hooks/useEventTeamDashboard"
import { useLotteryForm } from "@/new/features/project-registration/hooks/useLotteryForm"
import { useProjectList } from "@/new/features/project-list/hooks/useProjectList"
import { EventTeamDashboardView } from "./EventTeamDashboard.view"
import type { ProjectRepository } from "@/new/api/project-repository"

type Props = { repository: ProjectRepository }

export const EventTeamDashboardContainer = ({ repository }: Props) => {
  const router = useAppRouter()
  const dashboard = useEventTeamDashboard({ repository })
  const confirmationLotteryForm = useLotteryForm({
    repository,
    productId: dashboard.selectedConfirmationProduct?.id,
  })
  const projectList = useProjectList({ repository, role: "Internal" })

  const handleClickProduct = useCallback((productId: number) => {
    router.push(`/new/project/${productId}?role=Internal`)
  }, [router])

  return <EventTeamDashboardView {...dashboard} confirmationLotteryForm={confirmationLotteryForm} projectList={projectList} onClickProduct={handleClickProduct} />
}
