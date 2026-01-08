"use client"

import { useRouter } from "next/navigation"
import { QuoteCreation } from "@/components/screens/quote-creation"
import { useProject } from "@/contexts/project-context"

export default function QuoteCreationPage() {
  const router = useRouter()
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

