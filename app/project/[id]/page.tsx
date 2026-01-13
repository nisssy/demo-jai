"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import { ProjectRegistration } from "@/components/screens/project-registration"
import { useProject } from "@/contexts/project-context"
import { useEffect, useState } from "react"

export default function ProjectEditPage() {
  const router = useAppRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params?.id ? Number(params.id) : null
  const { projectData, setProjectData, addNotification, getProjectById } = useProject()
  const [isLoading, setIsLoading] = useState(true)
  const tab = searchParams?.get("tab")

  useEffect(() => {
    if (projectId && getProjectById) {
      const project = getProjectById(projectId)
      if (!project) {
        addNotification("案件が見つかりませんでした")
        router.push("/")
        return
      }
      // 営業修正中の場合は修正画面にリダイレクト
      if (project.projectStatus === "営業修正中") {
        router.push(`/project/${projectId}/correction${tab ? `?tab=${tab}` : ""}`)
        return
      }
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [projectId, getProjectById, router, addNotification, tab])

  if (isLoading) {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    )
  }

  const handleBack = () => {
    if (tab === "corrections") {
      router.push("/?tab=corrections")
    } else {
      router.push("/")
    }
  }

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectRegistration
        projectData={projectData}
        setProjectData={setProjectData}
        projectId={projectId}
        onNext={() => {
          if (tab === "corrections") {
            router.push("/?tab=corrections")
          } else {
            router.push("/")
          }
          addNotification("商材を更新しました")
        }}
        onBack={handleBack}
        addNotification={addNotification}
        isProductEditMode={true}
      />
    </main>
  )
}

