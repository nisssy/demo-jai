"use client"

import { useRouter } from "next/navigation"
import { ProjectArrangements } from "@/components/screens/project-arrangements"
import { useProject } from "@/contexts/project-context"

export default function ProjectArrangementsPage() {
  const router = useRouter()
  const { projectData, addNotification } = useProject()

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectArrangements
        projectData={projectData}
        onNext={() => {
          router.push("/project-validation")
          addNotification("全ての手配が完了しました")
        }}
        onBack={() => router.push("/")}
      />
    </main>
  )
}

