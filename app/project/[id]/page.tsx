"use client"

import { useRouter, useParams } from "next/navigation"
import { ProjectRegistration } from "@/components/screens/project-registration"
import { useProject } from "@/contexts/project-context"
import { useEffect, useState } from "react"

export default function ProjectEditPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id ? Number(params.id) : null
  const { projectData, setProjectData, addNotification, getProjectById } = useProject()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (projectId && getProjectById) {
      const project = getProjectById(projectId)
      if (!project) {
        addNotification("案件が見つかりませんでした")
        router.push("/")
      }
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [projectId, getProjectById, router, addNotification])

  if (isLoading) {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectRegistration
        projectData={projectData}
        setProjectData={setProjectData}
        projectId={projectId}
        onNext={() => {
          router.push("/")
          addNotification("商材を更新しました")
        }}
        onBack={() => router.push("/")}
        addNotification={addNotification}
        isProductEditMode={true}
      />
    </main>
  )
}

