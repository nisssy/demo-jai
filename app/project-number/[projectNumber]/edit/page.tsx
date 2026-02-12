"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import { useProject } from "@/contexts/project-context"
import { ProjectRegistration } from "@/components/screens/project-registration"

export default function ProjectNumberEditPage() {
  const router = useAppRouter()
  const params = useParams()
  const projectNumber = typeof params?.projectNumber === "string" ? params.projectNumber : null

  const { getProducts, projectData, setProjectData, addNotification, currentRole } = useProject()
  const all = useMemo(() => getProducts(), [getProducts])

  const representativeProjectId = useMemo(() => {
    if (!projectNumber) return null
    const group = all.filter((p) => String(p.projectNumber ?? "") === projectNumber)
    if (group.length === 0) return null
    return group
      .map((p) => p.id)
      .filter((id): id is number => typeof id === "number")
      .sort((a, b) => a - b)[0] ?? null
  }, [all, projectNumber])

  if (!projectNumber || !representativeProjectId) {
    // 最低限のフォールバック（詳細なエラーUIは ProjectRegistration 側の体裁に揃える）
    router.push("/")
    return null
  }

  const backUrl = currentRole
    ? `/project-number/${projectNumber}?role=${currentRole}`
    : `/project-number/${projectNumber}`

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectRegistration
        projectData={projectData}
        setProjectData={setProjectData}
        projectId={representativeProjectId}
        onNext={() => {
          addNotification("案件情報を更新しました")
          router.push(backUrl)
        }}
        onBack={() => router.push(backUrl)}
        addNotification={addNotification}
      />
    </main>
  )
}

