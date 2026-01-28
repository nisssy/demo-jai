"use client"

import { Badge } from "@/components/ui/badge"
import type { ProjectData } from "@/types/project"
import { useProjectArrangements } from "@/features/project-arrangements/hooks/useProjectArrangements"
import { ProjectArrangementsView } from "@/features/project-arrangements/ui/ProjectArrangements.view"

type ProjectArrangementsProps = {
  projectData: ProjectData
  onNext: () => void
  onBack: () => void
}

const renderStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-600">完了</Badge>
    case "in-progress":
      return <Badge className="bg-yellow-600">進行中</Badge>
    default:
      return <Badge variant="secondary">未着手</Badge>
  }
}

export const ProjectArrangementsContainer = ({ projectData, onNext, onBack }: ProjectArrangementsProps) => {
  const state = useProjectArrangements({ projectData, onNext, onBack })

  return (
    <ProjectArrangementsView
      projectData={projectData}
      arrangements={state.arrangements}
      selectedArrangement={state.selectedArrangement}
      formData={state.formData}
      completedCount={state.completedCount}
      totalCount={state.totalCount}
      allCompleted={state.allCompleted}
      onOpenModal={state.handleOpenModal}
      onCloseModal={state.handleCloseModal}
      onSubmitArrangement={state.handleSubmitArrangement}
      onFormDataChange={state.handleFormDataChange}
      onNext={state.onNext}
      onBack={state.onBack}
      renderStatusBadge={renderStatusBadge}
    />
  )
}
