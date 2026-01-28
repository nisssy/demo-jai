"use client"

import type { ProjectData } from "@/types/project"
import { useDataExport } from "@/features/data-export/hooks/useDataExport"
import { DataExportView } from "@/features/data-export/ui/DataExport.view"

interface DataExportProps {
  projectData: ProjectData
  onNext?: () => void
  onBack: () => void
}

export const DataExportContainer = ({ projectData, onBack }: DataExportProps) => {
  const state = useDataExport({ onBack })

  return (
    <DataExportView
      reportUrl={state.reportUrl}
      isScanning={state.isScanning}
      publicationChecked={state.publicationChecked}
      isMappingData={state.isMappingData}
      dataMapped={state.dataMapped}
      onReportUrlChange={state.setReportUrl}
      onPublicationCheck={state.handlePublicationCheck}
      onMapping={state.handleMapping}
      onBack={state.onBack}
    />
  )
}
