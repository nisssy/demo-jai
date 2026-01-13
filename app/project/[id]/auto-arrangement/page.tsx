"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import { useProject } from "@/contexts/project-context"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Send } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

function ProjectAutoArrangementPageContent() {
  const router = useAppRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params?.id ? (typeof params.id === 'string' ? Number(params.id) : params.id) : null
  const { getProjectById, addNotification } = useProject()
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [autoArrangementChecks, setAutoArrangementChecks] = useState({
    pachitown: false,
    report: false,
    googleForm: false,
    xAccount: false,
  })

  useEffect(() => {
    if (projectId && getProjectById) {
      const loadedProject = getProjectById(projectId)
      if (!loadedProject) {
        addNotification("案件が見つかりませんでした")
        router.push("/")
        return
      }
      setProject(loadedProject)
      
      // 初期チェック状態を設定
      const mustSeePublication = (loadedProject as any).mustSeePublication || "不要"
      const reportRequired = (loadedProject as any).reportRequired || "不要"
      
      setAutoArrangementChecks({
        pachitown: mustSeePublication === "要",
        report: reportRequired === "要",
        googleForm: true,
        xAccount: true,
      })
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

  if (!project) {
    return null
  }

  const handleBack = () => {
    router.push(`/project/${projectId}/arrangement`)
  }

  const handleExecute = () => {
    const actions: string[] = []
    if (autoArrangementChecks.pachitown) actions.push("ぱちタウン連携")
    if (autoArrangementChecks.report) actions.push("レポート作成依頼")
    if (autoArrangementChecks.googleForm) actions.push("Googleアンケートフォームの配布")
    if (autoArrangementChecks.xAccount) actions.push("専用Xアカウントによる事前告知依頼")
    
    if (actions.length > 0) {
      addNotification(`以下の操作を実行しました: ${actions.join("、")}`)
    } else {
      addNotification("実行する操作が選択されていません")
      return
    }
    
    // ダッシュボードに戻る
    router.push("/")
  }

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">各種自動手配実行</h1>
        </div>

        {/* 案件情報 */}
        <Card>
          <CardHeader>
            <CardTitle>案件情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-600">案件No</Label>
                <p className="font-medium">{project.projectNumber}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">案件名</Label>
                <p className="font-medium">{project.projectName}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">クライアント</Label>
                <p className="font-medium">{project.clientName}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">開催日</Label>
                <p className="font-medium">{project.eventDate || project.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 各種自動手配実行 */}
        <Card>
          <CardHeader>
            <CardTitle>各種自動手配実行</CardTitle>
            <CardDescription>
              以下の操作を自動で実行します。実行しない項目はチェックを外してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                {(project as any).mustSeePublication === "要" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pachitown"
                      checked={autoArrangementChecks.pachitown}
                      onCheckedChange={(checked) => {
                        setAutoArrangementChecks({ ...autoArrangementChecks, pachitown: checked === true })
                      }}
                    />
                    <Label htmlFor="pachitown" className="text-sm font-medium cursor-pointer">
                      ぱちタウン連携
                    </Label>
                  </div>
                )}
                {(project as any).reportRequired === "要" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="report"
                      checked={autoArrangementChecks.report}
                      onCheckedChange={(checked) => {
                        setAutoArrangementChecks({ ...autoArrangementChecks, report: checked === true })
                      }}
                    />
                    <Label htmlFor="report" className="text-sm font-medium cursor-pointer">
                      レポート作成依頼
                    </Label>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="googleForm"
                    checked={autoArrangementChecks.googleForm}
                    onCheckedChange={(checked) => {
                      setAutoArrangementChecks({ ...autoArrangementChecks, googleForm: checked === true })
                    }}
                  />
                  <Label htmlFor="googleForm" className="text-sm font-medium cursor-pointer">
                    Googleアンケートフォームの配布
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="xAccount"
                    checked={autoArrangementChecks.xAccount}
                    onCheckedChange={(checked) => {
                      setAutoArrangementChecks({ ...autoArrangementChecks, xAccount: checked === true })
                    }}
                  />
                  <Label htmlFor="xAccount" className="text-sm font-medium cursor-pointer">
                    専用Xアカウントによる事前告知依頼
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ボタン */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleBack}>
            戻る
          </Button>
          <Button onClick={handleExecute} className="gap-2">
            <Send className="h-4 w-4" />
            実行
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function ProjectAutoArrangementPage() {
  return (
    <Suspense fallback={
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    }>
      <ProjectAutoArrangementPageContent />
    </Suspense>
  )
}
