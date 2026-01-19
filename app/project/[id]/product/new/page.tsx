"use client"

import { useParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import { ProjectRegistration } from "@/components/screens/project-registration"
import { useProject } from "@/contexts/project-context"

export default function ProductRegistrationPage() {
  const router = useAppRouter()
  const params = useParams()
  const projectId = params.id ? Number(params.id) : null
  const { projectData, setProjectData, addNotification, getProductById } = useProject()

  if (!projectId) {
    return <div>案件IDが不正です</div>
  }

  const project = getProductById(projectId)
  if (!project) {
    return <div>案件が見つかりません</div>
  }

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectRegistration
        projectData={projectData}
        setProjectData={setProjectData}
        onNext={() => {
          router.push("/")
          addNotification("商材を追加しました")
        }}
        onBack={() => router.push("/")}
        addNotification={addNotification}
        projectId={projectId}
        isProductAddMode={true}
      />
    </main>
  )
}

