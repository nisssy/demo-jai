"use client"

import { useAppRouter } from "@/hooks/use-app-router"
import { OperationsManagement } from "@/components/screens/operations-management"
import { useProject } from "@/contexts/project-context"

export default function OperationsManagementPage() {
  const router = useAppRouter()
  const { projectData } = useProject()

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <OperationsManagement
        projectData={projectData}
        onNext={() => router.push("/data-collection")}
        onBack={() => router.push("/project-arrangements")}
      />
    </main>
  )
}

