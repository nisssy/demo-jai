"use client"

import type { ProjectData } from "@/types/project"
import { useOperationsManagement } from "@/features/operations-management/hooks/useOperationsManagement"
import { OperationsManagementView } from "@/features/operations-management/ui/OperationsManagement.view"

interface OperationsManagementProps {
  projectData: ProjectData
  onNext: () => void
  onBack: () => void
}

export const OperationsManagementContainer = ({ projectData, onNext, onBack }: OperationsManagementProps) => {
  const state = useOperationsManagement({ projectData, onNext, onBack })

  return (
    <OperationsManagementView
      projectData={projectData}
      prGenerated={state.prGenerated}
      prText={state.prText}
      costsAutoFilled={state.costsAutoFilled}
      complianceStep={state.complianceStep}
      isGenerating={state.isGenerating}
      costs={state.costs}
      totalCost={state.totalCost}
      onPrTextChange={state.setPrText}
      onCostChange={state.handleCostChange}
      onGeneratePR={state.handleGeneratePR}
      onAutoFillCosts={state.handleAutoFillCosts}
      onComplianceCheck={state.handleComplianceCheck}
      onNext={state.onNext}
      onBack={state.onBack}
    />
  )
}
