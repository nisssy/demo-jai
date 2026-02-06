"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import { ProjectList } from "@/components/screens/project-list"
import { RoleSelection } from "@/components/screens/role-selection"
import { EventTeamDashboard } from "@/components/screens/event-team-dashboard"
import { ProductManagementDashboard } from "@/components/screens/product-management-dashboard"
import { OutsourcingVendorDashboard } from "@/components/screens/outsourcing-vendor-dashboard"
import { useProject } from "@/contexts/project-context"
import { Suspense } from "react"
import type { Role } from "@/types/project"

function HomePageContent() {
  const router = useAppRouter()
  const searchParams = useSearchParams()
  const { projectData, setProjectData, currentRole, setCurrentRole, addNotification } = useProject()

  // クエリパラメータからロールとタブを取得
  const roleFromQuery = searchParams?.get("role") as Role | null
  const tabFromQuery = searchParams?.get("tab")
  const initialTab: "projects" | "corrections" = tabFromQuery === "corrections" ? "corrections" : "projects"

  // URLパラメータとロール状態を同期
  useEffect(() => {
    const validRoles: Role[] = [
      "Sales",
      "Internal",
      "ProductManagement",
      "OutsourcingVendor",
      "LotteryAdmin",
      "DesignVendor",
      "PrizeVendor",
    ]

    if (roleFromQuery && validRoles.includes(roleFromQuery)) {
      // URLにロールパラメータがある場合、contextのロールと同期
      if (currentRole !== roleFromQuery) {
        setCurrentRole(roleFromQuery)
      }
    } else if (!roleFromQuery && currentRole) {
      // URLにロールパラメータがない場合、contextのロールをクリア
      setCurrentRole(null)
    }
  }, [roleFromQuery, currentRole, setCurrentRole])

  // ロールが選択されていない場合はロール選択画面を表示
  if (currentRole === null) {
    return (
      <main>
        <RoleSelection
          onSelectRole={(role) => {
            setCurrentRole(role)
            // ロール選択時にURLパラメータを追加
            const params = new URLSearchParams(searchParams?.toString() || "")
            params.set("role", role)
            router.replace(`?${params.toString()}`, { scroll: false })
          }}
        />
      </main>
    )
  }

  // マネジメント部の場合は専用ダッシュボードを表示
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

  // 商材管理課の場合は専用ダッシュボードを表示
  if (currentRole === "ProductManagement") {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <ProductManagementDashboard
          projectData={projectData}
          setProjectData={setProjectData}
          addNotification={addNotification}
        />
      </main>
    )
  }

  // 外注業者の場合は専用ダッシュボードを表示
  if (currentRole === "OutsourcingVendor") {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <OutsourcingVendorDashboard
          projectData={projectData}
          setProjectData={setProjectData}
          addNotification={addNotification}
        />
      </main>
    )
  }

  // 事務管理課（抽選）の場合は専用ダッシュボードを表示
  if (currentRole === "LotteryAdmin") {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">事務管理課（抽選管理）</h1>
          <p className="text-slate-600">実装準備中...</p>
        </div>
      </main>
    )
  }

  // デザイン業者の場合は専用ダッシュボードを表示
  if (currentRole === "DesignVendor") {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">デザイン業者</h1>
          <p className="text-slate-600">実装準備中...</p>
        </div>
      </main>
    )
  }

  // 景品業者の場合は専用ダッシュボードを表示
  if (currentRole === "PrizeVendor") {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">景品業者</h1>
          <p className="text-slate-600">実装準備中...</p>
        </div>
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
