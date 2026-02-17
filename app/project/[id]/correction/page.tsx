"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import { ProjectRegistration } from "@/components/screens/project-registration"
import { useProject } from "@/contexts/project-context"
import { useEffect, useState, Suspense } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function ProjectCorrectionPageContent() {
  const router = useAppRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params?.id ? Number(params.id) : null
  const { projectData, setProjectData, addNotification, getProductById, updateProduct, currentRole } = useProject()
  const [isLoading, setIsLoading] = useState(true)
  const [correctionComment, setCorrectionComment] = useState("")
  const [correctionRequest, setCorrectionRequest] = useState("")
  const tab = searchParams?.get("tab")

  useEffect(() => {
    if (projectId && getProductById) {
      const project = getProductById(projectId)
      if (!project) {
        addNotification("案件が見つかりませんでした")
        router.push("/")
        return
      }
      // 既存のコメントがあれば読み込む
      setCorrectionComment(project.correctionComment || "")
      // 修正依頼内容を読み込む
      setCorrectionRequest(project.correctionRequest || "")
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [projectId, getProductById, router, addNotification])

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
      const url = currentRole ? `/?tab=corrections&role=${currentRole}` : "/?tab=corrections"
      router.push(url)
      return
    }

    // 商材から案件番号を取得して案件詳細に遷移
    if (projectId && getProductById) {
      const product = getProductById(projectId)
      if (product && product.projectNumber) {
        const url = currentRole
          ? `/project-number/${product.projectNumber}?role=${currentRole}`
          : `/project-number/${product.projectNumber}`
        router.push(url)
        return
      }
    }

    // フォールバック: 案件一覧に戻る
    const url = currentRole ? `/?role=${currentRole}` : "/"
    router.push(url)
  }

  const handleSave = () => {
    if (!projectId) return

    // プロジェクトを更新し、ステータスを「マネジメント部確認中」に変更
    updateProduct(projectId, {
      projectStatus: "マネジメント部確認中",
      correctionComment: correctionComment,
    })

    addNotification("修正を完了しました")

    if (tab === "corrections") {
      const url = currentRole ? `/?tab=corrections&role=${currentRole}` : "/?tab=corrections"
      router.push(url)
    } else {
      // 商材から案件番号を取得して案件詳細に遷移
      if (projectId && getProductById) {
        const product = getProductById(projectId)
        if (product && product.projectNumber) {
          const url = currentRole
            ? `/project-number/${product.projectNumber}?role=${currentRole}`
            : `/project-number/${product.projectNumber}`
          router.push(url)
        } else {
          const url = currentRole ? `/?role=${currentRole}` : "/"
          router.push(url)
        }
      } else {
        const url = currentRole ? `/?role=${currentRole}` : "/"
        router.push(url)
      }
    }
  }

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectRegistration
        projectData={projectData}
        setProjectData={setProjectData}
        projectId={projectId}
        onNext={handleSave}
        onBack={handleBack}
        addNotification={addNotification}
        isProductEditMode={true}
        correctionComment={correctionComment}
        onCorrectionCommentChange={setCorrectionComment}
        correctionRequest={correctionRequest}
      />
    </main>
  )
}

export default function ProjectCorrectionPage() {
  return (
    <Suspense fallback={
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    }>
      <ProjectCorrectionPageContent />
    </Suspense>
  )
}
