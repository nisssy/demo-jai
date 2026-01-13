"use client"

import { useSearchParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import { ProjectList } from "@/components/screens/project-list"
import { RoleSelection } from "@/components/screens/role-selection"
import { EventTeamDashboard } from "@/components/screens/event-team-dashboard"
import { useProject } from "@/contexts/project-context"
import { Suspense } from "react"

function HomePageContent() {
  const router = useAppRouter()
  const searchParams = useSearchParams()
  const { projectData, setProjectData, currentRole, setCurrentRole, addNotification } = useProject()
  
  // クエリパラメータからタブを取得（デフォルトは"projects"）
  const tabFromQuery = searchParams?.get("tab")
  const initialTab: "projects" | "corrections" = tabFromQuery === "corrections" ? "corrections" : "projects"

  // ロールが選択されていない場合はロール選択画面を表示
  if (currentRole === null) {
    return (
      <main>
        <RoleSelection
          onSelectRole={(role) => {
            setCurrentRole(role)
          }}
        />
      </main>
    )
  }

  // イベントチームの場合は専用ダッシュボードを表示
  if (currentRole === "Internal") {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <EventTeamDashboard
          projectData={projectData}
          setProjectData={setProjectData}
          addNotification={addNotification}
        />
      </main>
    )
  }

  // 営業の場合は案件一覧を表示
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
              role={currentRole!}
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
        initialTab={initialTab}
            />
        </main>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    }>
      <HomePageContent />
    </Suspense>
  )
}
