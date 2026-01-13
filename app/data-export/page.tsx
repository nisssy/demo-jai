"use client"

import { useAppRouter } from "@/hooks/use-app-router"
import { DataExport } from "@/components/screens/data-export"
import { useProject } from "@/contexts/project-context"

export default function DataExportPage() {
  const router = useAppRouter()
  const { projectData } = useProject()

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <DataExport projectData={projectData} onBack={() => router.push("/data-collection")} />
    </main>
  )
}

