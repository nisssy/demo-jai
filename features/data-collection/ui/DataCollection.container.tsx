"use client"

import type { ProjectData } from "@/types/project"
import { useDataCollection } from "@/features/data-collection/hooks/useDataCollection"
import { DataCollectionView } from "@/features/data-collection/ui/DataCollection.view"

interface DataCollectionProps {
  projectData: ProjectData
  onNext: () => void
  onBack: () => void
}

export const DataCollectionContainer = ({ projectData, onNext, onBack }: DataCollectionProps) => {
  const state = useDataCollection({ onNext, onBack })

  return (
    <DataCollectionView
      expenseData={state.expenseData}
      surveyData={state.surveyData}
      reminderSent={state.reminderSent}
      dataSynced={state.dataSynced}
      archiveComplete={state.archiveComplete}
      isArchiving={state.isArchiving}
      expenseProgress={state.expenseProgress}
      surveyProgress={state.surveyProgress}
      expenseDashArray={state.expenseDashArray}
      surveyDashArray={state.surveyDashArray}
      onReminder={state.handleReminder}
      onSync={state.handleSync}
      onArchive={state.handleArchive}
      onNext={state.onNext}
      onBack={state.onBack}
    />
  )
}
