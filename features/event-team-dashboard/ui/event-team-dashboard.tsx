"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, User, Building2, CheckCircle2, XCircle, Eye, Send, FileText, Download, Mail } from "lucide-react"
import type { ProjectData } from "@/types/project"
import { useProject } from "@/contexts/project-context"
import { useAppRouter } from "@/hooks/use-app-router"

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
  const router = useAppRouter()
  const { getProducts, updateProduct } = useProject()
  const allProjects = useMemo(() => getProducts(), [getProducts])
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
  // 旧「仮押さえ不可」モーダル（キャスト別に置き換えたため、実質未使用だが破壊的変更を避けるため残す）
  const [showTemporaryHoldFailureModal, setShowTemporaryHoldFailureModal] = useState(false)
  const [temporaryHoldFailureComment, setTemporaryHoldFailureComment] = useState("")

  // 仮押さえ進捗（キャストごと）
  const [draftCompanionBookingStatus, setDraftCompanionBookingStatus] = useState<Record<string, "tentative" | "confirmed">>({})
  const [draftDirectorBookingStatus, setDraftDirectorBookingStatus] = useState<Record<string, "tentative" | "confirmed">>({})
  const [draftMcBookingStatus, setDraftMcBookingStatus] = useState<Record<string, "tentative" | "confirmed">>({})
  const [draftCompanionFailureComment, setDraftCompanionFailureComment] = useState<Record<string, string>>({})
  const [draftDirectorFailureComment, setDraftDirectorFailureComment] = useState<Record<string, string>>({})
  const [draftMcFailureComment, setDraftMcFailureComment] = useState<Record<string, string>>({})

  const normalizeSelectedNames = (raw?: unknown) => {
    if (!Array.isArray(raw)) return [] as string[]
    return raw
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter((x) => x && x !== "未定")
  }

  const computeTentativeProgress = (
    names: string[],
    status: Record<string, "tentative" | "confirmed">,
    failure: Record<string, string>,
  ) => {
    const done = names.filter((n) => status[n] === "tentative" || status[n] === "confirmed" || !!failure[n]).length
    return { done, total: names.length }
  }

  const computeNextProjectStatusFromDraft = (project: Project) => {
    const selectedCompanions = normalizeSelectedNames((project as any).selectedCompanions)
    const selectedDirectors = normalizeSelectedNames((project as any).selectedDirectors)
    const selectedMcs = normalizeSelectedNames((project as any).selectedMcs)

    const allDone =
      computeTentativeProgress(selectedCompanions, draftCompanionBookingStatus, draftCompanionFailureComment).done === selectedCompanions.length &&
      computeTentativeProgress(selectedDirectors, draftDirectorBookingStatus, draftDirectorFailureComment).done === selectedDirectors.length &&
      computeTentativeProgress(selectedMcs, draftMcBookingStatus, draftMcFailureComment).done === selectedMcs.length

    const hasAnyFailure =
      Object.keys(draftCompanionFailureComment).length > 0 ||
      Object.keys(draftDirectorFailureComment).length > 0 ||
      Object.keys(draftMcFailureComment).length > 0

    if (allDone && !hasAnyFailure) return "仮押さえ済み"
    if (allDone && hasAnyFailure) return "営業確認中"
    return "仮押さえ依頼"
  }

  useEffect(() => {
    if (!selectedProject || !showCastingInfoModal) return
    const proj: any = selectedProject
    setDraftCompanionBookingStatus((proj.companionBookingStatus ?? {}) as Record<string, "tentative" | "confirmed">)
    setDraftDirectorBookingStatus((proj.directorBookingStatus ?? {}) as Record<string, "tentative" | "confirmed">)
    setDraftMcBookingStatus((proj.mcBookingStatus ?? {}) as Record<string, "tentative" | "confirmed">)
    setDraftCompanionFailureComment((proj.companionTentativeHoldFailureComment ?? {}) as Record<string, string>)
    setDraftDirectorFailureComment((proj.directorTentativeHoldFailureComment ?? {}) as Record<string, string>)
    setDraftMcFailureComment((proj.mcTentativeHoldFailureComment ?? {}) as Record<string, string>)
  }, [selectedProject, showCastingInfoModal])

  // モーダルを開く際に、初期チェック状態を設定
  const handleOpenAutoArrangementModal = (project: Project) => {
    setSelectedProject(project)
    const mustSeePublication = project.mustSeePublication || "不要"
    const reportRequired = project.reportRequired || "不要"
    
    setAutoArrangementChecks({
      pachitown: mustSeePublication === "要",
      report: reportRequired === "要",
      googleForm: true,
      xAccount: true,
    })
    setShowAutoArrangementModal(true)
  }

  // ぱちタウンの公開状況を取得する関数
  const getPachitownPublicationStatus = (project: Project): string | null => {
    const pachitownLinked = project.pachitownLinked
    if (!pachitownLinked) {
      return null // ぱちタウン連携が実行されていない場合はnullを返す
    }

    const publicationDate = project.publicationDate
    if (!publicationDate) {
      return "公開待ち" // 掲載日が設定されていない場合
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 日付文字列をDateオブジェクトに変換
    const dateStr = publicationDate.replace(/-/g, "/")
    const [year, month, day] = dateStr.split("/").map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return "公開待ち"
    }

    const pubDate = new Date(year, month - 1, day)
    pubDate.setHours(0, 0, 0, 0)

    if (pubDate > today) {
      return "公開待ち"
    } else if (pubDate.getTime() === today.getTime()) {
      return "公開中"
    } else {
      // 公開日が過去の場合、イベント日を確認して公開期間を判断
      const eventDate = project.eventDate || project.date
      if (eventDate) {
        const eventDateStr = eventDate.replace(/-/g, "/")
        const [eventYear, eventMonth, eventDay] = eventDateStr.split("/").map(Number)
        if (!isNaN(eventYear) && !isNaN(eventMonth) && !isNaN(eventDay)) {
          const eventDateObj = new Date(eventYear, eventMonth - 1, eventDay)
          eventDateObj.setHours(0, 0, 0, 0)
          
          // イベント日が過去の場合は公開済み、未来の場合は公開中
          if (eventDateObj < today) {
            return "公開済み"
          } else {
            return "公開中"
          }
        }
      }
      return "公開中"
    }
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

  // イベント終了処理中の案件（実施日の翌日以降のイベント）
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

      // 実施日の翌日以降（実施日より前の日）かつ手配進行中またはそれ以降のステータスの案件
      return projectDate < today && (
        p.projectStatus === "手配進行中" ||
        p.projectStatus === "イベント終了処理中"
      )
    })
  }, [allProjects])

  // 実施日の翌日以降の案件のステータスを自動更新（更新済みフラグ）
  const updatedProjectsRef = useRef<Set<number>>(new Set())
  const updateProjectRef = useRef(updateProduct)
  const lastProjectsIdsRef = useRef<string>("")
  
  // updateProduct の最新の参照を保持
  useEffect(() => {
    updateProjectRef.current = updateProduct
  }, [updateProduct])
  
  useEffect(() => {
    // プロジェクトIDのリストを文字列化して比較（変更検知）
    const currentProjectsIds = allProjects.map(p => `${p.id}:${p.projectStatus}`).join(",")
    
    // 前回と同じ場合はスキップ（無限ループ防止）
    if (currentProjectsIds === lastProjectsIdsRef.current) {
      return
    }
    
    lastProjectsIdsRef.current = currentProjectsIds
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    allProjects.forEach((p) => {
      if (p.projectStatus === "手配進行中" && !updatedProjectsRef.current.has(p.id)) {
        const eventDate = p.eventDate || p.date
        if (eventDate) {
          const dateStr = eventDate.replace(/-/g, "/")
          const [year, month, day] = dateStr.split("/").map(Number)
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const projectDate = new Date(year, month - 1, day)
            projectDate.setHours(0, 0, 0, 0)
            
            // 実施日の翌日以降（実施日より前の日）にステータスを更新
            if (projectDate < today) {
              updatedProjectsRef.current.add(p.id)
              updateProjectRef.current(p.id, { projectStatus: "イベント終了処理中" })
            }
          }
        }
      } else if (p.projectStatus !== "手配進行中") {
        // ステータスが変わった場合は更新済みフラグをクリア
        updatedProjectsRef.current.delete(p.id)
      }
    })
  }, [allProjects])

  const handleViewCastingInfo = (project: Project) => {
    setSelectedProject(project)
    setShowCastingInfoModal(true)
  }

  const handleTemporaryHold = (project: Project) => {
    // 旧: 直接「仮押さえ完了」モーダルへ
    // 新: キャストごとの進捗（部分完了）を操作できるキャスティング情報へ誘導
    handleViewCastingInfo(project)
  }

  const handleConfirmTemporaryHoldFromCasting = () => {
    // 「キャスティング情報」内でチェックした内容を保存して閉じる
    if (!selectedProject) return
    const nextProjectStatus = computeNextProjectStatusFromDraft(selectedProject)

    const failureSummaryParts: string[] = []
    const pushFailureSummary = (label: string, map: Record<string, string>) => {
      Object.entries(map).forEach(([name, comment]) => {
        const c = String(comment ?? "").trim()
        failureSummaryParts.push(`${label}:${name}${c ? `（${c}）` : ""}`)
      })
    }
    pushFailureSummary("Co", draftCompanionFailureComment)
    pushFailureSummary("Dir", draftDirectorFailureComment)
    pushFailureSummary("MC", draftMcFailureComment)
    const temporaryHoldFailureComment = failureSummaryParts.length > 0 ? failureSummaryParts.join(" / ") : undefined

    updateProduct(selectedProject.id, {
      companionBookingStatus: draftCompanionBookingStatus,
      directorBookingStatus: draftDirectorBookingStatus,
      mcBookingStatus: draftMcBookingStatus,
      companionTentativeHoldFailureComment: draftCompanionFailureComment,
      directorTentativeHoldFailureComment: draftDirectorFailureComment,
      mcTentativeHoldFailureComment: draftMcFailureComment,
      projectStatus: nextProjectStatus,
      temporaryHoldFailureComment,
    })
    addNotification("仮押さえ状況を保存しました")
    setShowCastingInfoModal(false)
  }

  const handleConfirmTemporaryHold = () => {
    if (!selectedProject) return

    const selectedCompanions = (selectedProject.selectedCompanions ?? []).filter((n: string) => n && n !== "未定")
    const selectedDirectors = (selectedProject.selectedDirectors ?? []).filter((n: string) => n && n !== "未定")
    const selectedMcs = (selectedProject.selectedMcs ?? []).filter((n: string) => n && n !== "未定")

    const prevComp = ((selectedProject as any).companionBookingStatus ?? {}) as Record<string, "tentative" | "confirmed">
    const prevDir = ((selectedProject as any).directorBookingStatus ?? {}) as Record<string, "tentative" | "confirmed">
    const prevMc = ((selectedProject as any).mcBookingStatus ?? {}) as Record<string, "tentative" | "confirmed">

    const companionBookingStatus: Record<string, "tentative" | "confirmed"> = { ...prevComp }
    const directorBookingStatus: Record<string, "tentative" | "confirmed"> = { ...prevDir }
    const mcBookingStatus: Record<string, "tentative" | "confirmed"> = { ...prevMc }

    selectedCompanions.forEach((name: string) => {
      if (!companionBookingStatus[name]) companionBookingStatus[name] = "tentative"
    })
    selectedDirectors.forEach((name: string) => {
      if (!directorBookingStatus[name]) directorBookingStatus[name] = "tentative"
    })
    selectedMcs.forEach((name: string) => {
      if (!mcBookingStatus[name]) mcBookingStatus[name] = "tentative"
    })

    const isAllTentativeDone = (names: string[], status: Record<string, "tentative" | "confirmed">) =>
      names.every((n) => status[n] === "tentative" || status[n] === "confirmed")

    const nextProjectStatus =
      isAllTentativeDone(selectedCompanions, companionBookingStatus) &&
      isAllTentativeDone(selectedDirectors, directorBookingStatus) &&
      isAllTentativeDone(selectedMcs, mcBookingStatus)
        ? "仮押さえ済み"
        : "仮押さえ依頼"

    updateProduct(selectedProject.id, {
      companionBookingStatus,
      directorBookingStatus,
      mcBookingStatus,
      projectStatus: nextProjectStatus,
    })
    addNotification("仮押さえを完了しました")
    setShowTemporaryHoldModal(false)
    setSelectedProject(null)
  }

  const handleTemporaryHoldFailure = (project: Project) => {
    // 旧モーダルではなく、キャスト別の「仮押さえ不可」を設定する画面へ誘導
    handleViewCastingInfo(project)
  }

  const handleConfirmTemporaryHoldFailure = () => {
    // 旧: 一括「仮押さえ不可」送信
    // 新: キャスト別で「仮押さえ不可」を設定し、キャスティング情報モーダルの保存で反映する
    addNotification("キャスティング情報でキャストごとに仮押さえ不可を設定してください")
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
    updateProduct(selectedProject.id, { projectStatus: "手配進行中" })
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
    updateProduct(selectedProject.id, { 
      projectStatus: "営業修正中",
      correctionRequest: correctionRequest,
    })
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
                          <TableHead className="sticky left-0 bg-white z-10">案件名</TableHead>
                          <TableHead>案件No</TableHead>
                          <TableHead>クライアント</TableHead>
                          <TableHead>実施日</TableHead>
                          <TableHead>コンパニオン確定</TableHead>
                          <TableHead>ディレクター確定</TableHead>
                          <TableHead>MC確定</TableHead>
                          <TableHead>ステータス</TableHead>
                          <TableHead>ぱちタウン公開状況</TableHead>
                          <TableHead className="sticky right-0 bg-white z-10">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {arrangementProjects.map((project) => {
                          const confirmedCompanions = project.confirmedCompanions ?? []
                          const confirmedDirectors = project.confirmedDirectors ?? []
                          const confirmedMcs = project.confirmedMcs ?? []
                          const nominatedCompanions = (project as any).nominatedCompanions as Record<string, boolean> | undefined
                          const nominatedDirectors = (project as any).nominatedDirectors as Record<string, boolean> | undefined
                          const nominatedMcs = (project as any).nominatedMcs as Record<string, boolean> | undefined
                          const companionCount = Number(project.companionCount) || 0
                          const directorCount = Number(project.directorCount) || 0
                          const mcCount = Number(project.mcCount) || 0
                          
                          return (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium sticky left-0 bg-white z-10">{project.projectName}</TableCell>
                              <TableCell>{project.projectNumber}</TableCell>
                              <TableCell>{project.clientName}</TableCell>
                              <TableCell>{project.date}</TableCell>
                              <TableCell>
                                {confirmedCompanions.length > 0 ? (
                                  <div className="space-y-1">
                                    {confirmedCompanions.map((name: string, idx: number) => (
                                      <div key={idx} className="text-sm">
                                        {name}
                                        {nominatedCompanions?.[name] && (
                                          <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                                            指名
                                          </Badge>
                                        )}
                                        {project.companionCostumes && project.companionCostumes[name] && (
                                          <Badge variant="outline" className="ml-2 text-xs">
                                            {project.companionCostumes[name]}
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
                                      <div key={idx} className="text-sm">
                                        {name}
                                        {nominatedDirectors?.[name] && (
                                          <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                                            指名
                                          </Badge>
                                        )}
                                      </div>
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
                                      <div key={idx} className="text-sm">
                                        {name}
                                        {nominatedMcs?.[name] && (
                                          <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                                            指名
                                          </Badge>
                                        )}
                                      </div>
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
                              <TableCell>
                                {(() => {
                                  const publicationStatus = getPachitownPublicationStatus(project)
                                  if (publicationStatus === null) {
                                    return <span className="text-sm text-slate-400">-</span>
                                  }
                                  let badgeVariant: "default" | "secondary" | "outline" = "default"
                                  let badgeColor = ""
                                  if (publicationStatus === "公開待ち") {
                                    badgeColor = "bg-yellow-100 text-yellow-800"
                                  } else if (publicationStatus === "公開中") {
                                    badgeColor = "bg-green-100 text-green-800"
                                  } else if (publicationStatus === "公開済み") {
                                    badgeColor = "bg-blue-100 text-blue-800"
                                  }
                                  return (
                                    <Badge className={badgeColor}>
                                      {publicationStatus}
                                    </Badge>
                                  )
                                })()}
                              </TableCell>
                              <TableCell className="sticky right-0 bg-white z-10">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    // 最終入力の状態に応じて遷移先を決定
                                    const confirmedCompanions = project.confirmedCompanions ?? []
                                    const confirmedDirectors = project.confirmedDirectors ?? []
                                    const confirmedMcs = project.confirmedMcs ?? []
                                    
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
                      <TableHead>案件名</TableHead>
                      <TableHead>案件No</TableHead>
                      <TableHead>クライアント</TableHead>
                      <TableHead>実施日</TableHead>
                      <TableHead>仮押さえ進捗</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {temporaryHoldRequests.map((project) => {
                      const selectedCompanions = normalizeSelectedNames((project as any).selectedCompanions)
                      const selectedDirectors = normalizeSelectedNames((project as any).selectedDirectors)
                      const selectedMcs = normalizeSelectedNames((project as any).selectedMcs)
                      const compStatus = ((project as any).companionBookingStatus ?? {}) as Record<string, "tentative" | "confirmed">
                      const dirStatus = ((project as any).directorBookingStatus ?? {}) as Record<string, "tentative" | "confirmed">
                      const mcStatus = ((project as any).mcBookingStatus ?? {}) as Record<string, "tentative" | "confirmed">
                      const compFail = ((project as any).companionTentativeHoldFailureComment ?? {}) as Record<string, string>
                      const dirFail = ((project as any).directorTentativeHoldFailureComment ?? {}) as Record<string, string>
                      const mcFail = ((project as any).mcTentativeHoldFailureComment ?? {}) as Record<string, string>
                      const compProg = computeTentativeProgress(selectedCompanions, compStatus, compFail)
                      const dirProg = computeTentativeProgress(selectedDirectors, dirStatus, dirFail)
                      const mcProg = computeTentativeProgress(selectedMcs, mcStatus, mcFail)
                      const done = compProg.done + dirProg.done + mcProg.done
                      const total = compProg.total + dirProg.total + mcProg.total
                      return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.projectName}</TableCell>
                        <TableCell>{project.projectNumber}</TableCell>
                        <TableCell>{project.clientName}</TableCell>
                        <TableCell>{project.date}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{done}</span>/<span>{total}</span>
                            <div className="text-xs text-slate-500 mt-1">
                              Co {compProg.done}/{compProg.total} ・ Dir {dirProg.done}/{dirProg.total} ・ MC {mcProg.done}/{mcProg.total}
                            </div>
                          </div>
                        </TableCell>
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
                              variant="destructive"
                              onClick={() => handleTemporaryHoldFailure(project)}
                            >
                              仮押さえ不可
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      )
                    })}
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
                実施日の翌日以降のイベントのコスト入力を行ってください
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
                          <TableHead className="sticky left-0 bg-white z-10">案件名</TableHead>
                          <TableHead>案件No</TableHead>
                          <TableHead>クライアント</TableHead>
                          <TableHead>実施日</TableHead>
                          <TableHead>ステータス</TableHead>
                          <TableHead className="sticky right-0 bg-white z-10">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {postEventProjects.map((project) => {
                          return (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium sticky left-0 bg-white z-10">{project.projectName}</TableCell>
                              <TableCell>{project.projectNumber}</TableCell>
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
                                      updateProduct(project.id, { surveySent: true, surveySentDate: new Date().toISOString().split('T')[0] })
                                      addNotification("クライアントへのアンケートを送付しました")
                                    }}
                                    className="gap-2"
                                    disabled={project.surveySent === true}
                                  >
                                    <Mail className="h-4 w-4" />
                                    {project.surveySent ? "アンケート送付済み" : "アンケート送付"}
                                  </Button>
                                  {project.surveySent && (
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
                      <TableHead>案件名</TableHead>
                      <TableHead>案件No</TableHead>
                      <TableHead>クライアント</TableHead>
                      <TableHead>実施日</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmationRequests.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.projectName}</TableCell>
                        <TableCell>{project.projectNumber}</TableCell>
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
              イベントの実施日時とキャスティング情報を確認してください
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-lg mb-3">イベント情報</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-600">案件名</Label>
                    <p className="font-medium">{selectedProject.projectName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">案件No</Label>
                    <p className="font-medium">{selectedProject.projectNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">実施日</Label>
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
                      {selectedProject.selectedCompanions.map((name, index) => {
                        const isNominated = Boolean((selectedProject as any).nominatedCompanions?.[name])
                        return (
                        <div key={index} className="text-sm text-slate-700">
                          {name !== "未定" ? `・${name}` : "・未定"}
                          {name !== "未定" && isNominated && (
                            <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                              指名
                            </Badge>
                          )}
                        </div>
                        )
                      })}
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
                      {selectedProject.selectedDirectors.map((name, index) => {
                        const isNominated = Boolean((selectedProject as any).nominatedDirectors?.[name])
                        return (
                        <div key={index} className="text-sm text-slate-700">
                          {name !== "未定" ? `・${name}` : "・未定"}
                          {name !== "未定" && isNominated && (
                            <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                              指名
                            </Badge>
                          )}
                        </div>
                        )
                      })}
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
                      {selectedProject.selectedMcs.map((name, index) => {
                        const isNominated = Boolean((selectedProject as any).nominatedMcs?.[name])
                        return (
                        <div key={index} className="text-sm text-slate-700">
                          {name !== "未定" ? `・${name}` : "・未定"}
                          {name !== "未定" && isNominated && (
                            <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                              指名
                            </Badge>
                          )}
                        </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">未選択</p>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">仮押さえ状況（キャストごと）</h4>
                  <Badge className="bg-yellow-100 text-yellow-900 border border-yellow-200">
                    進捗: {(() => {
                      const selectedCompanions = normalizeSelectedNames((selectedProject as any).selectedCompanions)
                      const selectedDirectors = normalizeSelectedNames((selectedProject as any).selectedDirectors)
                      const selectedMcs = normalizeSelectedNames((selectedProject as any).selectedMcs)
                      const compProg = computeTentativeProgress(selectedCompanions, draftCompanionBookingStatus, draftCompanionFailureComment)
                      const dirProg = computeTentativeProgress(selectedDirectors, draftDirectorBookingStatus, draftDirectorFailureComment)
                      const mcProg = computeTentativeProgress(selectedMcs, draftMcBookingStatus, draftMcFailureComment)
                      return `${compProg.done + dirProg.done + mcProg.done}/${compProg.total + dirProg.total + mcProg.total}`
                    })()}
                  </Badge>
                </div>

                {/* コンパニオン */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-800">コンパニオン</div>
                  {normalizeSelectedNames((selectedProject as any).selectedCompanions).length === 0 ? (
                    <div className="text-sm text-slate-500">対象なし</div>
                  ) : (
                    <div className="space-y-1">
                      {normalizeSelectedNames((selectedProject as any).selectedCompanions).map((name) => {
                        const current = draftCompanionBookingStatus[name]
                        const failureComment = draftCompanionFailureComment[name]
                        const value =
                          current === "confirmed" ? "confirmed" : failureComment !== undefined ? "failed" : current === "tentative" ? "tentative" : "pending"
                        const disabled = current === "confirmed"
                        return (
                          <div key={name} className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-slate-900 min-w-[140px]">{name}</div>
                              <Select
                                value={value}
                                onValueChange={(v) => {
                                  if (disabled) return
                                  if (v === "pending") {
                                    setDraftCompanionBookingStatus((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                    setDraftCompanionFailureComment((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                  }
                                  if (v === "tentative") {
                                    setDraftCompanionBookingStatus((prev) => ({ ...prev, [name]: "tentative" }))
                                    setDraftCompanionFailureComment((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                  }
                                  if (v === "failed") {
                                    setDraftCompanionBookingStatus((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                    setDraftCompanionFailureComment((prev) => ({ ...prev, [name]: prev[name] ?? "" }))
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="状態" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">未</SelectItem>
                                  <SelectItem value="tentative">仮押さえ</SelectItem>
                                  <SelectItem value="failed">仮押さえ不可</SelectItem>
                                  <SelectItem value="confirmed" disabled>
                                    本押さえ
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {current === "confirmed" && (
                                <Badge variant="outline" className="text-xs border-slate-300 bg-white text-slate-700">
                                  本押さえ
                                </Badge>
                              )}
                              {value === "tentative" && (
                                <Badge variant="outline" className="text-xs border-yellow-200 bg-yellow-100 text-yellow-900">
                                  仮押さえ
                                </Badge>
                              )}
                              {value === "failed" && (
                                <Badge variant="outline" className="text-xs border-red-200 bg-red-50 text-red-700">
                                  仮押さえ不可
                                </Badge>
                              )}
                            </div>
                            {value === "failed" && (
                              <Input
                                value={draftCompanionFailureComment[name] ?? ""}
                                onChange={(e) =>
                                  setDraftCompanionFailureComment((prev) => ({ ...prev, [name]: e.target.value }))
                                }
                                placeholder="不可理由（例：スケジュール都合/体調/移動不可 など）"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ディレクター */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-800">ディレクター</div>
                  {normalizeSelectedNames((selectedProject as any).selectedDirectors).length === 0 ? (
                    <div className="text-sm text-slate-500">対象なし</div>
                  ) : (
                    <div className="space-y-1">
                      {normalizeSelectedNames((selectedProject as any).selectedDirectors).map((name) => {
                        const current = draftDirectorBookingStatus[name]
                        const failureComment = draftDirectorFailureComment[name]
                        const value =
                          current === "confirmed" ? "confirmed" : failureComment !== undefined ? "failed" : current === "tentative" ? "tentative" : "pending"
                        const disabled = current === "confirmed"
                        return (
                          <div key={name} className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-slate-900 min-w-[140px]">{name}</div>
                              <Select
                                value={value}
                                onValueChange={(v) => {
                                  if (disabled) return
                                  if (v === "pending") {
                                    setDraftDirectorBookingStatus((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                    setDraftDirectorFailureComment((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                  }
                                  if (v === "tentative") {
                                    setDraftDirectorBookingStatus((prev) => ({ ...prev, [name]: "tentative" }))
                                    setDraftDirectorFailureComment((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                  }
                                  if (v === "failed") {
                                    setDraftDirectorBookingStatus((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                    setDraftDirectorFailureComment((prev) => ({ ...prev, [name]: prev[name] ?? "" }))
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="状態" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">未</SelectItem>
                                  <SelectItem value="tentative">仮押さえ</SelectItem>
                                  <SelectItem value="failed">仮押さえ不可</SelectItem>
                                  <SelectItem value="confirmed" disabled>
                                    本押さえ
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {current === "confirmed" && (
                                <Badge variant="outline" className="text-xs border-slate-300 bg-white text-slate-700">
                                  本押さえ
                                </Badge>
                              )}
                              {value === "tentative" && (
                                <Badge variant="outline" className="text-xs border-yellow-200 bg-yellow-100 text-yellow-900">
                                  仮押さえ
                                </Badge>
                              )}
                              {value === "failed" && (
                                <Badge variant="outline" className="text-xs border-red-200 bg-red-50 text-red-700">
                                  仮押さえ不可
                                </Badge>
                              )}
                            </div>
                            {value === "failed" && (
                              <Input
                                value={draftDirectorFailureComment[name] ?? ""}
                                onChange={(e) =>
                                  setDraftDirectorFailureComment((prev) => ({ ...prev, [name]: e.target.value }))
                                }
                                placeholder="不可理由（例：スケジュール都合/体調/移動不可 など）"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* MC */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-800">MC</div>
                  {normalizeSelectedNames((selectedProject as any).selectedMcs).length === 0 ? (
                    <div className="text-sm text-slate-500">対象なし</div>
                  ) : (
                    <div className="space-y-1">
                      {normalizeSelectedNames((selectedProject as any).selectedMcs).map((name) => {
                        const current = draftMcBookingStatus[name]
                        const failureComment = draftMcFailureComment[name]
                        const value =
                          current === "confirmed" ? "confirmed" : failureComment !== undefined ? "failed" : current === "tentative" ? "tentative" : "pending"
                        const disabled = current === "confirmed"
                        return (
                          <div key={name} className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-slate-900 min-w-[140px]">{name}</div>
                              <Select
                                value={value}
                                onValueChange={(v) => {
                                  if (disabled) return
                                  if (v === "pending") {
                                    setDraftMcBookingStatus((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                    setDraftMcFailureComment((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                  }
                                  if (v === "tentative") {
                                    setDraftMcBookingStatus((prev) => ({ ...prev, [name]: "tentative" }))
                                    setDraftMcFailureComment((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                  }
                                  if (v === "failed") {
                                    setDraftMcBookingStatus((prev) => {
                                      const next = { ...prev }
                                      delete next[name]
                                      return next
                                    })
                                    setDraftMcFailureComment((prev) => ({ ...prev, [name]: prev[name] ?? "" }))
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="状態" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">未</SelectItem>
                                  <SelectItem value="tentative">仮押さえ</SelectItem>
                                  <SelectItem value="failed">仮押さえ不可</SelectItem>
                                  <SelectItem value="confirmed" disabled>
                                    本押さえ
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {current === "confirmed" && (
                                <Badge variant="outline" className="text-xs border-slate-300 bg-white text-slate-700">
                                  本押さえ
                                </Badge>
                              )}
                              {value === "tentative" && (
                                <Badge variant="outline" className="text-xs border-yellow-200 bg-yellow-100 text-yellow-900">
                                  仮押さえ
                                </Badge>
                              )}
                              {value === "failed" && (
                                <Badge variant="outline" className="text-xs border-red-200 bg-red-50 text-red-700">
                                  仮押さえ不可
                                </Badge>
                              )}
                            </div>
                            {value === "failed" && (
                              <Input
                                value={draftMcFailureComment[name] ?? ""}
                                onChange={(e) => setDraftMcFailureComment((prev) => ({ ...prev, [name]: e.target.value }))}
                                placeholder="不可理由（例：スケジュール都合/体調/移動不可 など）"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-sm text-yellow-900">
                    「仮押さえ」はカレンダーに反映されます。「仮押さえ不可」は営業への共有（サマリコメント）に反映されます。本押さえ（確定）は手配詳細で確定した場合に自動で反映されます。
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCastingInfoModal(false)}>
              閉じる
            </Button>
            <Button onClick={handleConfirmTemporaryHoldFromCasting}>
              仮押さえ状況を保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 仮押さえ確認モーダル（旧フロー。キャストごとの進捗管理へ移行したため非表示） */}

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
                    <Label className="text-sm text-slate-600">案件名</Label>
                    <p className="font-medium">{selectedProject.projectName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">案件No</Label>
                    <p className="font-medium">{selectedProject.projectNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">クライアント</Label>
                    <p className="font-medium">{selectedProject.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">実施日</Label>
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
                    <Label className="text-sm text-slate-600">案件名</Label>
                    <p className="font-medium">{selectedProject.projectName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">案件No</Label>
                    <p className="font-medium">{selectedProject.projectNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">クライアント</Label>
                    <p className="font-medium">{selectedProject.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">実施日</Label>
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
              {selectedProject.correctionComment && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <Label className="text-sm font-semibold text-blue-900">営業からのコメント</Label>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedProject.correctionComment}</p>
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
                {selectedProject.mustSeePublication === "要" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pachitown"
                      checked={autoArrangementChecks.pachitown}
                      onCheckedChange={(checked) => {
                        setAutoArrangementChecks((prev) => ({ ...prev, pachitown: checked === true }))
                      }}
                    />
                    <Label htmlFor="pachitown" className="text-sm font-medium cursor-pointer">
                      ぱちタウン連携
                    </Label>
                  </div>
                )}
                {selectedProject.reportRequired === "要" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="report"
                      checked={autoArrangementChecks.report}
                      onCheckedChange={(checked) => {
                        setAutoArrangementChecks((prev) => ({ ...prev, report: checked === true }))
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
                      setAutoArrangementChecks((prev) => ({ ...prev, googleForm: checked === true }))
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
                      setAutoArrangementChecks((prev) => ({ ...prev, xAccount: checked === true }))
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
                  // ぱちタウン連携が実行された場合、連携情報を保存
                  if (autoArrangementChecks.pachitown && selectedProject) {
                    updateProduct(selectedProject.id, {
                      pachitownLinked: true,
                      pachitownLinkedDate: new Date().toISOString().split('T')[0],
                    })
                  }
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
                    <Label className="text-sm text-slate-600">案件名</Label>
                    <p className="font-medium">{selectedProject.projectName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">案件No</Label>
                    <p className="font-medium">{selectedProject.projectNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">クライアント</Label>
                    <p className="font-medium">{selectedProject.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">実施日</Label>
                    <p className="font-medium">{selectedProject.eventDate || selectedProject.date}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">アンケート回答内容</h4>
                {selectedProject.surveyResult ? (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div>
                      <Label className="text-sm font-medium">満足度</Label>
                      <p className="text-sm text-slate-700">{selectedProject.surveyResult.satisfaction || "未回答"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">コメント</Label>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedProject.surveyResult.comment || "コメントなし"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">次回開催希望</Label>
                      <p className="text-sm text-slate-700">{selectedProject.surveyResult.nextEventDesired || "未回答"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 text-center text-slate-500">
                    <p>アンケート結果はまだ回答されていません</p>
                    <p className="text-xs mt-2">送付日: {selectedProject.surveySentDate || "未送付"}</p>
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
                      <div className="text-slate-600">¥{(selectedProject.castingCost || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">交通費</div>
                      <div className="text-slate-600">¥{(selectedProject.transportationFee || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">宿泊費</div>
                      <div className="text-slate-600">¥{(selectedProject.accommodationFee || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">ポストPR</div>
                      <div className="text-slate-600">¥{(selectedProject.postPRCost || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="font-medium">合計</div>
                      <div className="text-blue-600 font-semibold">
                        ¥{(
                          (selectedProject.castingCost || 0) +
                          (selectedProject.transportationFee || 0) +
                          (selectedProject.accommodationFee || 0) +
                          (selectedProject.postPRCost || 0)
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
                      <div className="text-xs text-slate-500 mb-1">実施日</div>
                      <div>{selectedProject.eventDate || selectedProject.date}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">キャスティング費用</div>
                      <div>¥{(selectedProject.castingCost || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">交通費</div>
                      <div>¥{(selectedProject.transportationFee || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">宿泊費</div>
                      <div>¥{(selectedProject.accommodationFee || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-slate-500 mb-1">PR費用</div>
                      <div>¥{(selectedProject.postPRCost || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-blue-100 rounded border-2 border-blue-300">
                      <div className="text-xs text-slate-500 mb-1">合計金額</div>
                      <div className="font-bold text-blue-700">
                        ¥{(
                          (selectedProject.castingCost || 0) +
                          (selectedProject.transportationFee || 0) +
                          (selectedProject.accommodationFee || 0) +
                          (selectedProject.postPRCost || 0)
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
                      castingCost: selectedProject.castingCost || 0,
                      transportationFee: selectedProject.transportationFee || 0,
                      accommodationFee: selectedProject.accommodationFee || 0,
                      postPRCost: selectedProject.postPRCost || 0,
                      total: (
                        (selectedProject.castingCost || 0) +
                        (selectedProject.transportationFee || 0) +
                        (selectedProject.accommodationFee || 0) +
                        (selectedProject.postPRCost || 0)
                      )
                    }
                    
                    // CSV形式でダウンロード
                    const csvContent = [
                      ["項目", "金額"],
                      ["案件No", cowboyData.projectNumber],
                      ["案件名", cowboyData.projectName],
                      ["実施日", cowboyData.eventDate],
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
