"use client"

import { useRouter } from "next/navigation"
import { OperationsManagement } from "@/components/screens/operations-management"
import { useProject } from "@/contexts/project-context"

export default function OperationsManagementPage() {
  const router = useRouter()
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

