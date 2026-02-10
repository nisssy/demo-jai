"use client"

import { Suspense, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useProject } from "@/contexts/project-context"
import { Calendar, ChevronLeft, ArrowRight } from "lucide-react"
import { LotteryAdminContent } from "@/components/screens/lottery-admin-content"

function AdminPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get("projectId")
  const projectId = projectIdParam ? parseInt(projectIdParam, 10) : null
  const screen = searchParams.get("screen") || "list"

  const { getProducts, getProductById, setCurrentGoudouRole } = useProject()
  const projects = getProducts()
  const selectedProject = projectId ? getProductById(projectId) : null

  useEffect(() => {
    setCurrentGoudouRole("Admin")
  }, [setCurrentGoudouRole])

  const navigateTo = useCallback(
    (newScreen: string, opts?: { projectId?: string | null }) => {
      const p = new URLSearchParams()
      p.set("screen", newScreen)
      if (opts?.projectId) p.set("projectId", opts.projectId)
      else if (projectId && newScreen === "lottery") p.set("projectId", String(projectId))
      router.push(`/admin?${p.toString()}`)
    },
    [router, projectId]
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto p-6">
          {screen === "list" && (
            <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
              <div className="border-b border-slate-100 mb-8">
                <h2 className="text-2xl font-bold text-slate-900">案件一覧（事務管理課）</h2>
                <p className="text-muted-foreground mt-1">抽選・景品・配送を実行する案件を選択してください</p>
              </div>

              <div className="space-y-4">
                {projects.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">案件がありません</p>
                ) : (
                  projects
                    .filter((p) => p.category === "Point")
                    .map((project) => {
                      const projectNumber = project.projectNumber || String(project.id)
                      const hallNames = (project as any).hallNames || [project.hallName]
                      const eventStartDate = (project as any).eventStartDate || project.date
                      const eventEndDate = (project as any).eventEndDate || project.date
                      const budget = (project as any).budget || project.estimateAmount
                      return (
                        <Card key={project.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div
                              className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                              onClick={() => navigateTo("lottery", { projectId: String(project.id) })}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-base font-semibold text-slate-900">
                                      {project.projectName || project.companyName + " " + (hallNames?.join("／") || "")}
                                    </h3>
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                      案件No: {projectNumber}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-sm">
                                    <div>
                                      <div className="text-xs text-slate-500 mb-0.5">実施日</div>
                                      <div className="font-medium flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {eventStartDate === eventEndDate
                                          ? eventStartDate
                                          : `${eventStartDate} ～ ${eventEndDate}`}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-slate-500 mb-0.5">見積金額</div>
                                      <div className="font-semibold">{budget}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-slate-500 mb-0.5">法人・ホール</div>
                                      <div className="font-medium">{project.companyName} / {hallNames?.join("・") || ""}</div>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigateTo("lottery", { projectId: String(project.id) })
                                  }}
                                  className="shrink-0"
                                >
                                  抽選・景品・配送を実行
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                )}
              </div>
            </div>
          )}

          {screen === "lottery" && selectedProject && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateTo("list")}
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">抽選・景品・配送</h2>
                  <p className="text-muted-foreground text-sm">
                    {selectedProject.projectName || selectedProject.companyName}
                    （{((selectedProject as any).hallNames || [selectedProject.hallName]).join("／")}）
                  </p>
                </div>
              </div>
              <LotteryAdminContent project={selectedProject as any} />
            </div>
          )}

          {screen === "lottery" && !selectedProject && (
            <div className="max-w-4xl mx-auto py-12 text-center">
              <p className="text-muted-foreground mb-4">案件が見つかりません</p>
              <Button variant="outline" onClick={() => navigateTo("list")}>
                案件一覧に戻る
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background">読み込み中...</div>}>
      <AdminPageContent />
    </Suspense>
  )
}
