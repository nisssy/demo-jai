"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, User, Building2, CheckCircle2, XCircle, Eye, Send, FileText, Download, Mail } from "lucide-react"
import type { ProjectData } from "@/types/project"
import { useProject } from "@/contexts/project-context"
import { useRouter } from "next/navigation"

type EventTeamDashboardProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  addNotification: (message: string) => void
}

type Project = NonNullable<ProjectData["projects"]>[number]

export function EventTeamDashboard({
  projectData,
  setProjectData,
  addNotification,
}: EventTeamDashboardProps) {
  const router = useRouter()
  const { getProjects, updateProject } = useProject()
  const allProjects = getProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCastingInfoModal, setShowCastingInfoModal] = useState(false)
  const [showTemporaryHoldModal, setShowTemporaryHoldModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionRequest, setCorrectionRequest] = useState("")
  const [activeTab, setActiveTab] = useState<"arrangements" | "temporaryHold" | "confirmation" | "postEvent">("arrangements")
  const [showAutoArrangementModal, setShowAutoArrangementModal] = useState(false)
  const [autoArrangementChecks, setAutoArrangementChecks] = useState({
    pachitown: false,
    report: false,
    googleForm: false,
    xAccount: false,
  })
  const [showSurveyResultModal, setShowSurveyResultModal] = useState(false)
  const [showCostExportModal, setShowCostExportModal] = useState(false)
  const [showTemporaryHoldFailureModal, setShowTemporaryHoldFailureModal] = useState(false)
  const [temporaryHoldFailureComment, setTemporaryHoldFailureComment] = useState("")

  // モーダルを開く際に、初期チェック状態を設定
  const handleOpenAutoArrangementModal = (project: Project) => {
    setSelectedProject(project)
    const mustSeePublication = (project as any).mustSeePublication || "不要"
    const reportRequired = (project as any).reportRequired || "不要"
    
    setAutoArrangementChecks({
      pachitown: mustSeePublication === "要",
      report: reportRequired === "要",
      googleForm: true,
      xAccount: true,
    })
    setShowAutoArrangementModal(true)
  }

  // 手配進行中の案件（projectStatus === "手配進行中"）
  const arrangementProjects = useMemo(() => {
    return allProjects.filter((p) => p.projectStatus === "手配進行中")
  }, [allProjects])

  // 仮押さえ依頼がきている案件（projectStatus === "仮押さえ依頼"）
  const temporaryHoldRequests = useMemo(() => {
    return allProjects.filter((p) => p.projectStatus === "仮押さえ依頼")
  }, [allProjects])

  // イベントチーム確認中の案件（projectStatus === "イベントチーム確認中"）
  const confirmationRequests = useMemo(() => {
    return allProjects.filter((p) => p.projectStatus === "イベントチーム確認中")
  }, [allProjects])

  // イベント終了処理中の案件（開催日の翌日以降のイベント）
  const postEventProjects = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return allProjects.filter((p) => {
      const eventDate = p.eventDate || p.date
      if (!eventDate) return false

      // 日付文字列をDateオブジェクトに変換（"2025/12/10" または "2025-12-10" 形式）
      const dateStr = eventDate.replace(/-/g, "/")
      const [year, month, day] = dateStr.split("/").map(Number)
      if (isNaN(year) || isNaN(month) || isNaN(day)) return false

      const projectDate = new Date(year, month - 1, day)
      projectDate.setHours(0, 0, 0, 0)

      // 開催日の翌日以降（開催日より前の日）かつ手配進行中またはそれ以降のステータスの案件
      return projectDate < today && (
        p.projectStatus === "手配進行中" ||
        p.projectStatus === "イベント終了処理中"
      )
    })
  }, [allProjects])

  // 開催日の翌日以降の案件のステータスを自動更新
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    allProjects.forEach((p) => {
      if (p.projectStatus === "手配進行中") {
        const eventDate = p.eventDate || p.date
        if (eventDate) {
          const dateStr = eventDate.replace(/-/g, "/")
          const [year, month, day] = dateStr.split("/").map(Number)
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const projectDate = new Date(year, month - 1, day)
            projectDate.setHours(0, 0, 0, 0)
            
            // 開催日の翌日以降（開催日より前の日）にステータスを更新
            if (projectDate < today) {
              updateProject(p.id, { projectStatus: "イベント終了処理中" } as any)
            }
          }
        }
      }
    })
  }, [allProjects, updateProject])

  const handleViewCastingInfo = (project: Project) => {
    setSelectedProject(project)
    setShowCastingInfoModal(true)
  }

  const handleTemporaryHold = (project: Project) => {
    setSelectedProject(project)
    setShowTemporaryHoldModal(true)
  }

  const handleConfirmTemporaryHoldFromCasting = () => {
    setShowCastingInfoModal(false)
    if (selectedProject) {
      setShowTemporaryHoldModal(true)
    }
  }

  const handleConfirmTemporaryHold = () => {
    if (!selectedProject) return
    updateProject(selectedProject.id, { projectStatus: "仮押さえ済み" })
    addNotification("仮押さえを完了しました")
    setShowTemporaryHoldModal(false)
    setSelectedProject(null)
  }

  const handleTemporaryHoldFailure = (project: Project) => {
    setSelectedProject(project)
    setTemporaryHoldFailureComment("")
    setShowTemporaryHoldFailureModal(true)
  }

  const handleConfirmTemporaryHoldFailure = () => {
    if (!selectedProject) return
    if (!temporaryHoldFailureComment.trim()) {
      addNotification("コメントを入力してください")
      return
    }
    updateProject(selectedProject.id, {
      projectStatus: "営業確認中",
      temporaryHoldFailureComment: temporaryHoldFailureComment,
    } as any)
    addNotification("仮押さえ不可の旨を営業に通知しました")
    setShowTemporaryHoldFailureModal(false)
    setTemporaryHoldFailureComment("")
    setSelectedProject(null)
  }

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setShowConfirmationModal(true)
  }

  const handleConfirmContent = () => {
    if (!selectedProject) return
    updateProject(selectedProject.id, { projectStatus: "手配進行中" })
    addNotification("内容確認を完了しました")
    setShowConfirmationModal(false)
    setSelectedProject(null)
  }

  const handleRequestCorrection = () => {
    if (!selectedProject) return
    setShowCorrectionModal(true)
  }

  const handleSubmitCorrection = () => {
    if (!selectedProject || !correctionRequest.trim()) return
    // 修正依頼を営業に送信（ステータスを「営業修正中」に変更）
    updateProject(selectedProject.id, { 
      projectStatus: "営業修正中",
      correctionRequest: correctionRequest,
    } as any)
    addNotification("営業に修正依頼を送信しました")
    setShowCorrectionModal(false)
    setShowConfirmationModal(false)
    setSelectedProject(null)
    setCorrectionRequest("")
  }

  const getStatusBadge = (status: string) => {
    if (!status) {
      return <Badge variant="secondary" className="bg-slate-100 text-slate-700">-</Badge>
    }
    switch (status) {
      case "見積送付完了":
        return <Badge className="bg-green-600 text-white">見積送付完了</Badge>
      case "見込み入力完了":
        return <Badge className="bg-slate-500 text-white">見込み入力完了</Badge>
      case "仮押さえ依頼":
        return <Badge className="bg-yellow-600 text-white">仮押さえ依頼</Badge>
      case "仮押さえ済み":
        return <Badge className="bg-green-600 text-white">仮押さえ済み</Badge>
      case "営業確認中":
        return <Badge className="bg-orange-600 text-white">営業確認中</Badge>
      case "イベントチーム確認中":
        return <Badge className="bg-blue-600 text-white">イベントチーム確認中</Badge>
      case "営業修正中":
        return <Badge className="bg-orange-600 text-white">営業修正中</Badge>
      case "手配進行中":
        return <Badge className="bg-blue-600 text-white">手配進行中</Badge>
      case "イベント終了処理中":
        return <Badge className="bg-blue-600 text-white">イベント終了処理中</Badge>
      case "手配完了":
        return <Badge className="bg-green-600 text-white">手配完了</Badge>
      case "キャンセル":
        return <Badge className="bg-red-600 text-white">キャンセル</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700">{status}</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">イベントチーム ダッシュボード</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
        <div className="border-b border-slate-100 mb-8">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            <TabsTrigger 
              value="temporaryHold"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              仮押さえ依頼
              {temporaryHoldRequests.length > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{temporaryHoldRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="confirmation"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              内容確認依頼
              {confirmationRequests.length > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{confirmationRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="arrangements"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              手配進行中
              {arrangementProjects.length > 0 && (
                <Badge className="ml-1.5 bg-slate-400 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{arrangementProjects.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="postEvent"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              イベント終了処理中
              {postEventProjects.length > 0 && (
                <Badge className="ml-1.5 bg-slate-400 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{postEventProjects.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 手配進行中タブ */}
        <TabsContent value="arrangements" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">手配進行中</CardTitle>
              <CardDescription className="text-slate-600">
                手配中の案件一覧
              </CardDescription>
            </CardHeader>
            <CardContent>
              {arrangementProjects.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  手配中の案件はありません
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="relative">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-white z-10">案件No</TableHead>
                          <TableHead>案件名</TableHead>
                          <TableHead>クライアント</TableHead>
                          <TableHead>開催日</TableHead>
                          <TableHead>コンパニオン確定</TableHead>
                          <TableHead>ディレクター確定</TableHead>
                          <TableHead>MC確定</TableHead>
                          <TableHead>ステータス</TableHead>
                          <TableHead className="sticky right-0 bg-white z-10">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {arrangementProjects.map((project) => {
                          const confirmedCompanions = (project as any).confirmedCompanions || []
                          const confirmedDirectors = (project as any).confirmedDirectors || []
                          const confirmedMcs = (project as any).confirmedMcs || []
                          const companionCount = Number(project.companionCount) || 0
                          const directorCount = Number(project.directorCount) || 0
                          const mcCount = Number(project.mcCount) || 0
                          
                          return (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium sticky left-0 bg-white z-10">{project.projectNumber}</TableCell>
                              <TableCell>{project.projectName}</TableCell>
                              <TableCell>{project.clientName}</TableCell>
                              <TableCell>{project.date}</TableCell>
                              <TableCell>
                                {confirmedCompanions.length > 0 ? (
                                  <div className="space-y-1">
                                    {confirmedCompanions.map((name: string, idx: number) => (
                                      <div key={idx} className="text-sm">
                                        {name}
                                        {(project as any).companionCostumes && (project as any).companionCostumes[name] && (
                                          <Badge variant="outline" className="ml-2 text-xs">
                                            {(project as any).companionCostumes[name]}
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                    {confirmedCompanions.length < companionCount && (
                                      <p className="text-xs text-slate-500">
                                        ({companionCount - confirmedCompanions.length}名未確定)
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400">未確定</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {confirmedDirectors.length > 0 ? (
                                  <div className="space-y-1">
                                    {confirmedDirectors.map((name: string, idx: number) => (
                                      <div key={idx} className="text-sm">{name}</div>
                                    ))}
                                    {confirmedDirectors.length < directorCount && (
                                      <p className="text-xs text-slate-500">
                                        ({directorCount - confirmedDirectors.length}名未確定)
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400">未確定</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {confirmedMcs.length > 0 ? (
                                  <div className="space-y-1">
                                    {confirmedMcs.map((name: string, idx: number) => (
                                      <div key={idx} className="text-sm">{name}</div>
                                    ))}
                                    {confirmedMcs.length < mcCount && (
                                      <p className="text-xs text-slate-500">
                                        ({mcCount - confirmedMcs.length}名未確定)
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400">未確定</span>
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(project.projectStatus || "")}</TableCell>
                              <TableCell className="sticky right-0 bg-white z-10">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    // 最終入力の状態に応じて遷移先を決定
                                    const confirmedCompanions = (project as any).confirmedCompanions || []
                                    const confirmedDirectors = (project as any).confirmedDirectors || []
                                    const confirmedMcs = (project as any).confirmedMcs || []
                                    const castingCost = (project as any).castingCost
                                    
                                    // 1. キャスト入力が未完了か確認
                                    const companionCount = Number(project.companionCount) || 0
                                    const directorCount = Number(project.directorCount) || 0
                                    const mcCount = Number(project.mcCount) || 0
                                    
                                    const isCastingIncomplete = 
                                      confirmedCompanions.length < companionCount ||
                                      confirmedDirectors.length < directorCount ||
                                      confirmedMcs.length < mcCount ||
                                      (companionCount > 0 && confirmedCompanions.length === 0) ||
                                      (directorCount > 0 && confirmedDirectors.length === 0) ||
                                      (mcCount > 0 && confirmedMcs.length === 0)
                                    
                                    if (isCastingIncomplete) {
                                      // キャスト入力が未完了 → 確定キャスト入力画面
                                      router.push(`/project/${project.id}/arrangement`)
                                    } else {
                                      // キャスト入力完了 → 各種手配実行画面
                                      router.push(`/project/${project.id}/auto-arrangement`)
                                    }
                                  }}
                                  className="gap-2"
                                >
                                  <Send className="h-4 w-4" />
                                  各種手配実行
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 仮押さえ依頼タブ */}
        <TabsContent value="temporaryHold" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">仮押さえ依頼</CardTitle>
              <CardDescription className="text-slate-600">
                キャスティング情報を確認して仮押さえを行ってください
              </CardDescription>
            </CardHeader>
            <CardContent>
              {temporaryHoldRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  仮押さえ依頼はありません
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>案件No</TableHead>
                      <TableHead>案件名</TableHead>
                      <TableHead>クライアント</TableHead>
                      <TableHead>開催日</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {temporaryHoldRequests.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.projectNumber}</TableCell>
                        <TableCell>{project.projectName}</TableCell>
                        <TableCell>{project.clientName}</TableCell>
                        <TableCell>{project.date}</TableCell>
                        <TableCell>{getStatusBadge(project.projectStatus || "")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewCastingInfo(project)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              キャスティング情報
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleTemporaryHold(project)}
                            >
                              仮押さえを完了
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleTemporaryHoldFailure(project)}
                            >
                              仮押さえ不可
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* イベント終了処理中タブ */}
        <TabsContent value="postEvent" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">イベント終了処理中</CardTitle>
              <CardDescription className="text-slate-600">
                開催日の翌日以降のイベントのコスト入力を行ってください
              </CardDescription>
            </CardHeader>
            <CardContent>
              {postEventProjects.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  イベント終了処理中の案件はありません
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="relative">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-white z-10">案件No</TableHead>
                          <TableHead>案件名</TableHead>
                          <TableHead>クライアント</TableHead>
                          <TableHead>開催日</TableHead>
                          <TableHead>ステータス</TableHead>
                          <TableHead className="sticky right-0 bg-white z-10">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {postEventProjects.map((project) => {
                          return (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium sticky left-0 bg-white z-10">{project.projectNumber}</TableCell>
                              <TableCell>{project.projectName}</TableCell>
                              <TableCell>{project.clientName}</TableCell>
                              <TableCell>{project.date}</TableCell>
                              <TableCell>{getStatusBadge(project.projectStatus || "")}</TableCell>
                              <TableCell className="sticky right-0 bg-white z-10">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => {
                                      router.push(`/project/${project.id}/cost`)
                                    }}
                                    className="gap-2"
                                  >
                                    コスト入力
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // クライアントへのアンケート送付
                                      updateProject(project.id, { surveySent: true, surveySentDate: new Date().toISOString().split('T')[0] } as any)
                                      addNotification("クライアントへのアンケートを送付しました")
                                    }}
                                    className="gap-2"
                                    disabled={(project as any).surveySent === true}
                                  >
                                    <Mail className="h-4 w-4" />
                                    {(project as any).surveySent ? "アンケート送付済み" : "アンケート送付"}
                                  </Button>
                                  {(project as any).surveySent && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedProject(project)
                                        setShowSurveyResultModal(true)
                                      }}
                                      className="gap-2"
                                    >
                                      <FileText className="h-4 w-4" />
                                      アンケート結果
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedProject(project)
                                      setShowCostExportModal(true)
                                    }}
                                    className="gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    コスト出力
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 内容確認依頼タブ */}
        <TabsContent value="confirmation" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">内容確認依頼</CardTitle>
              <CardDescription className="text-slate-600">
                受注確定した案件の内容を確認し、確認完了または修正依頼を行ってください
              </CardDescription>
            </CardHeader>
            <CardContent>
              {confirmationRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  確認依頼はありません
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>案件No</TableHead>
                      <TableHead>案件名</TableHead>
                      <TableHead>クライアント</TableHead>
                      <TableHead>開催日</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmationRequests.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.projectNumber}</TableCell>
                        <TableCell>{project.projectName}</TableCell>
                        <TableCell>{project.clientName}</TableCell>
                        <TableCell>{project.date}</TableCell>
                        <TableCell>{getStatusBadge(project.projectStatus || "")}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(project)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            詳細確認
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* キャスティング情報モーダル */}
      <Dialog open={showCastingInfoModal} onOpenChange={setShowCastingInfoModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>キャスティング情報</DialogTitle>
            <DialogDescription>
              イベントの開催日時とキャスティング情報を確認してください
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-lg mb-3">イベント情報</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-600">案件No</Label>
                    <p className="font-medium">{selectedProject.projectNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">案件名</Label>
                    <p className="font-medium">{selectedProject.projectName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">開催日</Label>
                    <p className="font-medium">{selectedProject.eventDate || selectedProject.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">開催時間</Label>
                    <p className="font-medium">
                      {selectedProject.startTime && selectedProject.endTime
                        ? `${selectedProject.startTime} - ${selectedProject.endTime}`
                        : "未設定"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">クライアント</Label>
                    <p className="font-medium">{selectedProject.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">会場</Label>
                    <p className="font-medium">{selectedProject.venue}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                <h4 className="font-semibold text-lg mb-3">キャスティング情報</h4>
                
                {/* コンパニオン */}
                <div className="bg-rose-50/50 border border-rose-200/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">コンパニオン</Label>
                    <span className="text-sm text-slate-600">
                      人数: {selectedProject.companionCount || "0"}名
                    </span>
                  </div>
                  {selectedProject.selectedCompanions && selectedProject.selectedCompanions.length > 0 ? (
                    <div className="space-y-1">
                      {selectedProject.selectedCompanions.map((name, index) => (
                        <div key={index} className="text-sm text-slate-700">
                          {name !== "未定" ? `・${name}` : "・未定"}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">未選択</p>
                  )}
                </div>

                {/* ディレクター */}
                <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">ディレクター</Label>
                    <span className="text-sm text-slate-600">
                      人数: {selectedProject.directorCount || "0"}名
                    </span>
                  </div>
                  {selectedProject.selectedDirectors && selectedProject.selectedDirectors.length > 0 ? (
                    <div className="space-y-1">
                      {selectedProject.selectedDirectors.map((name, index) => (
                        <div key={index} className="text-sm text-slate-700">
                          {name !== "未定" ? `・${name}` : "・未定"}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">未選択</p>
                  )}
                </div>

                {/* MC */}
                <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">MC</Label>
                    <span className="text-sm text-slate-600">
                      人数: {selectedProject.mcCount || "0"}名
                    </span>
                  </div>
                  {selectedProject.selectedMcs && selectedProject.selectedMcs.length > 0 ? (
                    <div className="space-y-1">
                      {selectedProject.selectedMcs.map((name, index) => (
                        <div key={index} className="text-sm text-slate-700">
                          {name !== "未定" ? `・${name}` : "・未定"}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">未選択</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCastingInfoModal(false)}>
              閉じる
            </Button>
            <Button onClick={handleConfirmTemporaryHoldFromCasting}>
              仮押さえを完了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 仮押さえ確認モーダル */}
      <Dialog open={showTemporaryHoldModal} onOpenChange={setShowTemporaryHoldModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>仮押さえの完了</DialogTitle>
            <DialogDescription>
              キャスティング情報を確認して仮押さえを完了してください
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-600">案件No</Label>
                    <p className="font-medium">{selectedProject.projectNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">案件名</Label>
                    <p className="font-medium">{selectedProject.projectName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">クライアント</Label>
                    <p className="font-medium">{selectedProject.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">開催日</Label>
                    <p className="font-medium">{selectedProject.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">会場</Label>
                    <p className="font-medium">{selectedProject.venue}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">イベント種別</Label>
                    <p className="font-medium">{selectedProject.eventType}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  ※ キャスティング情報は営業側で管理されています。仮押さえを完了すると、ステータスが「仮押さえ済み」に更新されます。
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemporaryHoldModal(false)}>
              キャンセル
            </Button>
            <Button onClick={handleConfirmTemporaryHold}>
              仮押さえを完了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 仮押さえ不可モーダル */}
      <Dialog open={showTemporaryHoldFailureModal} onOpenChange={(open) => {
        setShowTemporaryHoldFailureModal(open)
        if (!open) {
          setTemporaryHoldFailureComment("")
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>仮押さえ不可の通知</DialogTitle>
            <DialogDescription>
              仮押さえができない理由をコメントで営業に通知してください
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-600">案件No</Label>
                    <p className="font-medium">{selectedProject.projectNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">案件名</Label>
                    <p className="font-medium">{selectedProject.projectName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">クライアント</Label>
                    <p className="font-medium">{selectedProject.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">開催日</Label>
                    <p className="font-medium">{selectedProject.date}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temporaryHoldFailureComment">仮押さえ不可の理由・コメント</Label>
                <Textarea
                  id="temporaryHoldFailureComment"
                  placeholder="仮押さえができない理由を入力してください（例：希望キャストのスケジュールが合わない、キャストが不足しているなど）"
                  value={temporaryHoldFailureComment}
                  onChange={(e) => setTemporaryHoldFailureComment(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-900">
                  ※ コメントを入力して送信すると、営業に通知されます。ステータスが「営業確認中」に更新されます。
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemporaryHoldFailureModal(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleConfirmTemporaryHoldFailure}>
              営業に通知
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 内容確認モーダル */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>内容確認</DialogTitle>
            <DialogDescription>
              案件の詳細を確認し、確認完了または修正依頼を行ってください
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-lg mb-3">案件情報</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-600">案件No</Label>
                    <p className="font-medium">{selectedProject.projectNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">案件名</Label>
                    <p className="font-medium">{selectedProject.projectName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">クライアント</Label>
                    <p className="font-medium">{selectedProject.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">開催日</Label>
                    <p className="font-medium">{selectedProject.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">会場</Label>
                    <p className="font-medium">{selectedProject.venue}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">イベント種別</Label>
                    <p className="font-medium">{selectedProject.eventType}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">見積金額</Label>
                    <p className="font-medium">{selectedProject.estimateAmount}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">営業担当</Label>
                    <p className="font-medium">{selectedProject.salesPersonName}</p>
                  </div>
                </div>
              </div>
              {(selectedProject as any).correctionComment && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <Label className="text-sm font-semibold text-blue-900">営業からのコメント</Label>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{(selectedProject as any).correctionComment}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmationModal(false)}>
              閉じる
            </Button>
            <Button variant="destructive" onClick={handleRequestCorrection}>
              修正依頼
            </Button>
            <Button onClick={handleConfirmContent}>
              確認完了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 各種自動手配実行モーダル */}
      <Dialog open={showAutoArrangementModal} onOpenChange={(open) => {
        setShowAutoArrangementModal(open)
        if (!open) {
          setAutoArrangementChecks({
            pachitown: false,
            report: false,
            googleForm: false,
            xAccount: false,
          })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>各種自動手配実行</DialogTitle>
            <DialogDescription>
              以下の操作を自動で実行します。実行しない項目はチェックを外してください。
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="space-y-3">
                {(selectedProject as any).mustSeePublication === "要" && (
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
                {(selectedProject as any).reportRequired === "要" && (
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutoArrangementModal(false)}>
              キャンセル
            </Button>
            <Button
              onClick={() => {
                const actions: string[] = []
                if (autoArrangementChecks.pachitown) actions.push("ぱちタウン連携")
                if (autoArrangementChecks.report) actions.push("レポート作成依頼")
                if (autoArrangementChecks.googleForm) actions.push("Googleアンケートフォームの配布")
                if (autoArrangementChecks.xAccount) actions.push("専用Xアカウントによる事前告知依頼")
                
                if (actions.length > 0) {
                  addNotification(`以下の操作を実行しました: ${actions.join("、")}`)
                } else {
                  addNotification("実行する操作が選択されていません")
                }
                setShowAutoArrangementModal(false)
                setAutoArrangementChecks({
                  pachitown: false,
                  report: false,
                  googleForm: false,
                  xAccount: false,
                })
              }}
            >
              実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* アンケート結果確認モーダル */}
      <Dialog open={showSurveyResultModal} onOpenChange={setShowSurveyResultModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>アンケート結果</DialogTitle>
            <DialogDescription>
              クライアントからのアンケート回答を確認します
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-lg mb-3">案件情報</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-600">案件No</Label>
                    <p className="font-medium">{selectedProject.projectNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">案件名</Label>
                    <p className="font-medium">{selectedProject.projectName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">クライアント</Label>
                    <p className="font-medium">{selectedProject.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">開催日</Label>
                    <p className="font-medium">{selectedProject.eventDate || selectedProject.date}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">アンケート回答内容</h4>
                {(selectedProject as any).surveyResult ? (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div>
                      <Label className="text-sm font-medium">満足度</Label>
                      <p className="text-sm text-slate-700">{(selectedProject as any).surveyResult.satisfaction || "未回答"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">コメント</Label>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{(selectedProject as any).surveyResult.comment || "コメントなし"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">次回開催希望</Label>
                      <p className="text-sm text-slate-700">{(selectedProject as any).surveyResult.nextEventDesired || "未回答"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 text-center text-slate-500">
                    <p>アンケート結果はまだ回答されていません</p>
                    <p className="text-xs mt-2">送付日: {(selectedProject as any).surveySentDate || "未送付"}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSurveyResultModal(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* コストデータ出力モーダル */}
      <Dialog open={showCostExportModal} onOpenChange={setShowCostExportModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>コストデータ出力（Cowboy形式）</DialogTitle>
            <DialogDescription>
              会計システム（Cowboy）へのデータエクスポート
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: 生データ */}
                <div className="border-2 border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">DMM 生データ</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">キャスティング</div>
                      <div className="text-slate-600">¥{((selectedProject as any).castingCost || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">交通費</div>
                      <div className="text-slate-600">¥{((selectedProject as any).transportationFee || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">宿泊費</div>
                      <div className="text-slate-600">¥{((selectedProject as any).accommodationFee || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">ポストPR</div>
                      <div className="text-slate-600">¥{((selectedProject as any).postPRCost || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="font-medium">合計</div>
                      <div className="text-blue-600 font-semibold">
                        ¥{(
                          ((selectedProject as any).castingCost || 0) +
                          ((selectedProject as any).transportationFee || 0) +
                          ((selectedProject as any).accommodationFee || 0) +
                          ((selectedProject as any).postPRCost || 0)
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Cowboy Format */}
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-blue-600 text-white">Cowboy形式</Badge>
                  </div>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">案件No</div>
                      <div>{selectedProject.projectNumber}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">案件名</div>
                      <div>{selectedProject.projectName}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">開催日</div>
                      <div>{selectedProject.eventDate || selectedProject.date}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">キャスティング費用</div>
                      <div>¥{((selectedProject as any).castingCost || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">交通費</div>
                      <div>¥{((selectedProject as any).transportationFee || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">宿泊費</div>
                      <div>¥{((selectedProject as any).accommodationFee || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">PR費用</div>
                      <div>¥{((selectedProject as any).postPRCost || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-blue-100 rounded border-2 border-blue-300">
                      <div className="text-xs text-slate-500 mb-1">合計金額</div>
                      <div className="font-bold text-blue-700">
                        ¥{(
                          ((selectedProject as any).castingCost || 0) +
                          ((selectedProject as any).transportationFee || 0) +
                          ((selectedProject as any).accommodationFee || 0) +
                          ((selectedProject as any).postPRCost || 0)
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Button
                  onClick={() => {
                    // Cowboy形式のCSVデータを生成
                    const cowboyData = {
                      projectNumber: selectedProject.projectNumber,
                      projectName: selectedProject.projectName,
                      eventDate: selectedProject.eventDate || selectedProject.date,
                      castingCost: (selectedProject as any).castingCost || 0,
                      transportationFee: (selectedProject as any).transportationFee || 0,
                      accommodationFee: (selectedProject as any).accommodationFee || 0,
                      postPRCost: (selectedProject as any).postPRCost || 0,
                      total: (
                        ((selectedProject as any).castingCost || 0) +
                        ((selectedProject as any).transportationFee || 0) +
                        ((selectedProject as any).accommodationFee || 0) +
                        ((selectedProject as any).postPRCost || 0)
                      )
                    }
                    
                    // CSV形式でダウンロード
                    const csvContent = [
                      ["項目", "金額"],
                      ["案件No", cowboyData.projectNumber],
                      ["案件名", cowboyData.projectName],
                      ["開催日", cowboyData.eventDate],
                      ["キャスティング費用", `¥${cowboyData.castingCost.toLocaleString()}`],
                      ["交通費", `¥${cowboyData.transportationFee.toLocaleString()}`],
                      ["宿泊費", `¥${cowboyData.accommodationFee.toLocaleString()}`],
                      ["PR費用", `¥${cowboyData.postPRCost.toLocaleString()}`],
                      ["合計", `¥${cowboyData.total.toLocaleString()}`],
                    ].map(row => row.join(",")).join("\n")
                    
                    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
                    const link = document.createElement("a")
                    const url = URL.createObjectURL(blob)
                    link.setAttribute("href", url)
                    link.setAttribute("download", `cost_${selectedProject.projectNumber}_${cowboyData.eventDate.replace(/\//g, "-")}.csv`)
                    link.style.visibility = "hidden"
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    
                    addNotification("コストデータをCowboy形式で出力しました")
                  }}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Cowboy形式でダウンロード
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCostExportModal(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修正依頼モーダル */}
      <Dialog open={showCorrectionModal} onOpenChange={setShowCorrectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修正依頼</DialogTitle>
            <DialogDescription>
              営業担当に修正依頼を送信します。修正内容を記入してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="correction-request">修正依頼内容</Label>
              <Textarea
                id="correction-request"
                value={correctionRequest}
                onChange={(e) => setCorrectionRequest(e.target.value)}
                placeholder="修正が必要な内容を記入してください"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCorrectionModal(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmitCorrection} disabled={!correctionRequest.trim()}>
              修正依頼を送信
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
