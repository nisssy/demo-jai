"use client"

import { useRouter } from "next/navigation"
import { ProjectCorrection } from "@/components/screens/project-correction"
import { useProject } from "@/contexts/project-context"
import { useEffect } from "react"

export default function ProjectCorrectionPage() {
  const router = useRouter()
  const { projectData, setProjectData, setCurrentRole, currentRole, addNotification } = useProject()

  useEffect(() => {
    if (currentRole === null || currentRole !== "Sales") {
      setCurrentRole("Sales")
    }
  }, [currentRole, setCurrentRole])

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectCorrection
        projectData={projectData}
        setProjectData={setProjectData}
        onResubmit={() => {
          router.push("/project-validation")
          setCurrentRole("Internal")
          addNotification("修正完了・再提出されました")
        }}
      />
    </main>
  )
}

