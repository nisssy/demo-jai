"use client"

import { Suspense } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import { QuoteCreation } from "@/components/screens/quote-creation"
import { useProject } from "@/contexts/project-context"

function QuoteCreationContent() {
  const router = useAppRouter()
  const { projectData, setProjectData } = useProject()

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <QuoteCreation
        projectData={projectData}
        setProjectData={setProjectData}
        onNext={() => router.push("/")}
        onBack={() => router.push("/project-registration")}
      />
    </main>
  )
}

export default function QuoteCreationPage() {
  return (
    <Suspense fallback={
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    }>
      <QuoteCreationContent />
    </Suspense>
  )
}
