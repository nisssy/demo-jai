"use client"

import { useRouter } from "next/navigation"
import { ProjectRegistration } from "@/components/screens/project-registration"
import { useProject } from "@/contexts/project-context"

export default function ProjectRegistrationPage() {
  const router = useRouter()
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
        onBack={() => router.push("/")}
        addNotification={addNotification}
      />
    </main>
  )
}

