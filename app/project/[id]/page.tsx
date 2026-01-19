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
  const { projectData, setProjectData, addNotification, getProductById } = useProject()
  const [isLoading, setIsLoading] = useState(true)
  const tab = searchParams?.get("tab")
  const addProduct = searchParams?.get("addProduct") === "true"
  const [correctionComment, setCorrectionComment] = useState("")
  const [correctionRequest, setCorrectionRequest] = useState("")

  useEffect(() => {
    // 商材追加モードの場合は既存データを読み込まない
    if (addProduct) {
      setIsLoading(false)
      return
    }
    
    if (projectId && getProductById) {
      const project = getProductById(projectId)
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
      // 既存のコメントを読み込む
      setCorrectionComment(project.correctionComment || "")
      // 修正依頼内容を読み込む
      setCorrectionRequest(project.correctionRequest || "")
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [projectId, getProductById, router, addNotification, tab, addProduct])

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
          addNotification(addProduct ? "商材を追加しました" : "商材を更新しました")
        }}
        onBack={handleBack}
        addNotification={addNotification}
        isProductEditMode={!addProduct}
        isProductAddMode={addProduct}
        correctionComment={correctionComment ?? ""}
        onCorrectionCommentChange={setCorrectionComment}
        correctionRequest={correctionRequest || undefined}
      />
    </main>
  )
}

