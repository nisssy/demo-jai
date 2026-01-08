"use client"

import { useRouter } from "next/navigation"
import { ProjectList } from "@/components/screens/project-list"
import { useProject } from "@/contexts/project-context"

export default function HomePage() {
  const router = useRouter()
  const { projectData, setProjectData, currentRole, addNotification } = useProject()

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectList
              projectData={projectData}
              setProjectData={setProjectData}
              onNext={() => {
          router.push("/project-arrangements")
                addNotification("案件バリデーション完了。各種手配を開始してください。")
              }}
        onBack={() => router.push("/quote-creation")}
              addNotification={addNotification}
              role={currentRole}
              setCurrentScreen={(screen) => {
          const routes: Record<number, string> = {
            4: "/project-arrangements",
            7: "/operations-management",
          }
          const route = routes[screen]
          if (route) {
            router.push(route)
                if (screen === 7) {
                  addNotification("広報文面生成画面に移動しました")
                }
          }
        }}
        onCreateNewProject={() => router.push("/project-registration")}
            />
        </main>
  )
}
