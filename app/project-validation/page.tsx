"use client"

import { useRouter } from "next/navigation"
import { ProjectValidation } from "@/components/screens/project-validation"
import { useProject } from "@/contexts/project-context"
import { useEffect } from "react"

export default function ProjectValidationPage() {
  const router = useRouter()
  const { projectData, setProjectData, setCurrentRole, currentRole, addNotification } = useProject()

  useEffect(() => {
    if (currentRole === null || currentRole !== "Internal") {
      setCurrentRole("Internal")
    }
  }, [currentRole, setCurrentRole])

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectValidation
        projectData={projectData}
        setProjectData={setProjectData}
        onSendCorrection={() => {
          router.push("/project-correction")
          setCurrentRole("Sales")
          addNotification("営業担当へ修正依頼を送信しました")
        }}
      />
    </main>
  )
}

