"use client"

import { useAppRouter } from "@/hooks/use-app-router"
import { ProjectRegistration } from "@/components/screens/project-registration"
import { useProject } from "@/contexts/project-context"

export default function ProjectRegistrationPage() {
  const router = useAppRouter()
  const { projectData, setProjectData, addNotification } = useProject()

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectRegistration
        projectData={projectData}
        setProjectData={setProjectData}
        onNext={() => {
          router.push("/quote-creation")
          addNotification("案件登録が完了しました。見積作成に進みます。")
        }}
        onBack={() => router.push("/?role=Sales")}
        addNotification={addNotification}
      />
    </main>
  )
}

