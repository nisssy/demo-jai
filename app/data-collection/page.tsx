"use client"

import { useAppRouter } from "@/hooks/use-app-router"
import { DataCollection } from "@/components/screens/data-collection"
import { useProject } from "@/contexts/project-context"

export default function DataCollectionPage() {
  const router = useAppRouter()
  const { projectData } = useProject()

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <DataCollection
        projectData={projectData}
        onNext={() => router.push("/data-export")}
        onBack={() => router.push("/operations-management")}
      />
    </main>
  )
}

