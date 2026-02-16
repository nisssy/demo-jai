"use client"
import { useEventTeamDashboard } from "../hooks/useEventTeamDashboard"
import { EventTeamDashboardView } from "./EventTeamDashboard.view"
import type { ProjectRepository } from "@/new/api/project-repository"

type Props = { repository: ProjectRepository }

export const EventTeamDashboardContainer = ({ repository }: Props) => {
  const dashboard = useEventTeamDashboard({ repository })
  return <EventTeamDashboardView {...dashboard} />
}
