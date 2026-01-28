"use client"

import type { ProjectData } from "@/types/project"
import { useProjectCorrection } from "@/features/project-correction/hooks/useProjectCorrection"
import { ProjectCorrectionView } from "@/features/project-correction/ui/ProjectCorrection.view"

type ProjectCorrectionProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onResubmit: () => void
}

export const ProjectCorrectionContainer = ({ projectData, setProjectData, onResubmit }: ProjectCorrectionProps) => {
  const state = useProjectCorrection({ projectData, setProjectData, onResubmit })

  return (
    <ProjectCorrectionView
      projectData={projectData}
      localBillingAddress={state.localBillingAddress}
      localContractAmount={state.localContractAmount}
      hasAddressError={state.hasAddressError}
      hasAmountError={state.hasAmountError}
      isFormValid={state.isFormValid}
      onLocalBillingAddressChange={state.setLocalBillingAddress}
      onLocalContractAmountChange={state.setLocalContractAmount}
      onResubmit={state.handleResubmit}
    />
  )
}
