"use client"

import { useAppRouter } from "@/hooks/use-app-router"
import { QuoteCreation } from "@/components/screens/quote-creation"
import { useProject } from "@/contexts/project-context"

export default function QuoteCreationPage() {
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

