"use client"

import type { ProjectData } from "@/types/project"
import { useQuoteCreation } from "@/features/quote-creation/hooks/useQuoteCreation"
import { QuoteCreationView } from "@/features/quote-creation/ui/QuoteCreation.view"

type QuoteCreationProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onNext: () => void
  onBack: () => void
}

export const QuoteCreationContainer = ({ projectData, setProjectData, onNext, onBack }: QuoteCreationProps) => {
  const state = useQuoteCreation({ projectData, setProjectData, onNext, onBack })

  return (
    <QuoteCreationView
      projectData={projectData}
      showPDF={state.showPDF}
      quoteGenerated={state.quoteGenerated}
      emailGenerated={state.emailGenerated}
      activeTab={state.activeTab}
      onActiveTabChange={state.setActiveTab}
      isLoadingSend={state.isLoadingSend}
      totalAmount={state.totalAmount}
      onGenerateQuote={state.handleGenerateQuote}
      onGenerateEmail={state.handleGenerateEmail}
      onSendQuote={state.handleSendQuote}
      onEmailDraftChange={state.handleEmailDraftChange}
      onBack={state.onBack}
    />
  )
}
