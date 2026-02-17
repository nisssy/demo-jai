"use client"

import type { ProjectData } from "@/types/project"
import { useProjectValidation } from "@/features/project-validation/hooks/useProjectValidation"
import { ProjectValidationView } from "@/features/project-validation/ui/ProjectValidation.view"

type ProjectValidationProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onSendCorrection: () => void
}

export const ProjectValidationContainer = ({ projectData, setProjectData, onSendCorrection }: ProjectValidationProps) => {
  const state = useProjectValidation({ projectData, setProjectData, onSendCorrection })

  return (
    <ProjectValidationView
      projectData={projectData}
      isValidating={state.isValidating}
      correctionMessage={state.correctionMessage}
      localBillingAddress={state.localBillingAddress}
      localContractAmount={state.localContractAmount}
      hasAddressError={state.hasAddressError}
      hasAmountError={state.hasAmountError}
      isFormValid={state.isFormValid}
      onCorrectionMessageChange={state.setCorrectionMessage}
      onLocalBillingAddressChange={state.setLocalBillingAddress}
      onLocalContractAmountChange={state.setLocalContractAmount}
      onGenerateCorrection={state.handleGenerateCorrection}
      onResubmit={state.handleResubmit}
      onSendCorrection={onSendCorrection}
    />
  )
}
