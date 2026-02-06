"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import type { ProjectData } from "@/types/project"
import { useProject } from "@/contexts/project-context"
import { useAppRouter } from "@/hooks/use-app-router"

export type Project = NonNullable<ProjectData["projects"]>[number]

export type UseEventTeamDashboardArgs = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  addNotification: (message: string) => void
}

// アンケート結果のCSVを生成する関数
const generateSurveyCsv = (project: Project): string => {
  const headers = ["回答者名", "満足度", "コメント", "次回開催希望", "改善点・要望"]
  const responses = [
    {
      name: "回答者1",
      satisfaction: "非常に満足",
      comment: "イベントの進行がスムーズで、キャストの対応も素晴らしかったです。",
      nextEventDesired: "来月も開催希望",
      improvement: "特に改善点はありません。",
    },
    {
      name: "回答者2",
      satisfaction: "満足",
      comment: "会場の雰囲気が良く、お客様の反応も上々でした。",
      nextEventDesired: "3ヶ月後に開催希望",
      improvement: "もう少し時間を長くしてほしいです。",
    },
    {
      name: "回答者3",
      satisfaction: "満足",
      comment: "キャストのパフォーマンスが良く、イベントは成功しました。",
      nextEventDesired: "次回の新台入替時も開催希望",
      improvement: "音響設備の改善をお願いしたいです。",
    },
    {
      name: "回答者4",
      satisfaction: "非常に満足",
      comment: "お客様の満足度が高く、来店数も増加しました。",
      nextEventDesired: "2ヶ月後に開催希望",
      improvement: "キャストの人数を増やしてほしいです。",
    },
    {
      name: "回答者5",
      satisfaction: "満足",
      comment: "イベントの内容が充実しており、お客様も楽しそうでした。",
      nextEventDesired: "来年の同じ時期に開催希望",
      improvement: "会場のレイアウトを少し変更してほしいです。",
    },
  ]

  const actualResult = (project as any).surveyResult
  if (actualResult) {
    responses[0] = {
      name: "回答者1",
      satisfaction: actualResult.satisfaction || "満足",
      comment: actualResult.comment || "",
      nextEventDesired: actualResult.nextEventDesired || "",
      improvement: "特に改善点はありません。",
    }
  }

  const csvRows: string[] = []
  csvRows.push(headers.map((h) => `"${h}"`).join(","))
  responses.forEach((response) => {
    const row = [response.name, response.satisfaction, response.comment, response.nextEventDesired, response.improvement]
    csvRows.push(row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
  })

  return "\uFEFF" + csvRows.join("\n")
}

export function useEventTeamDashboard({ projectData, setProjectData, addNotification }: UseEventTeamDashboardArgs) {
  const router = useAppRouter()
  const searchParams = useSearchParams()
  const { getProducts, updateProduct, getCompanions, getProductions } = useProject()
  const allProjects = useMemo(() => getProducts(), [getProducts])

  // URLパラメータからタブの初期値を取得
  const tabFromUrl = searchParams?.get("tab") as "arrangements" | "confirmation" | "postEvent" | null
  const subTabFromUrl = searchParams?.get("subTab") as "holdRequest" | "inProgress" | null

  // 共通状態
  const [activeTab, setActiveTab] = useState<"arrangements" | "confirmation" | "postEvent">(
    tabFromUrl && ["arrangements", "confirmation", "postEvent"].includes(tabFromUrl) ? tabFromUrl : "arrangements"
  )
  const [arrangementsSubTab, setArrangementsSubTab] = useState<"holdRequest" | "inProgress">(
    subTabFromUrl && ["holdRequest", "inProgress"].includes(subTabFromUrl) ? subTabFromUrl : "holdRequest"
  )

  // 選択されたプロジェクト
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedProjectForHistory, setSelectedProjectForHistory] = useState<Project | null>(null)

  // モーダル状態
  const [showCastingInfoModal, setShowCastingInfoModal] = useState(false)
  const [showTemporaryHoldModal, setShowTemporaryHoldModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [showTemporaryHoldFailureModal, setShowTemporaryHoldFailureModal] = useState(false)
  const [showStatusHistoryModal, setShowStatusHistoryModal] = useState(false)
  const [showAutoArrangementModal, setShowAutoArrangementModal] = useState(false)
  const [showSurveyResultModal, setShowSurveyResultModal] = useState(false)
  const [showCostExportModal, setShowCostExportModal] = useState(false)

  // 修正依頼関連
  const [correctionRequest, setCorrectionRequest] = useState("")
  const [temporaryHoldFailureComment, setTemporaryHoldFailureComment] = useState("")

  // 自動手配チェック
  const [autoArrangementChecks, setAutoArrangementChecks] = useState({
    pachitown: false,
    report: false,
    googleForm: false,
    xAccount: false,
  })

  // コスト出力関連
  const [costExportDateFrom, setCostExportDateFrom] = useState("")
  const [costExportDateTo, setCostExportDateTo] = useState("")
  const [costExportFormat, setCostExportFormat] = useState<"billing" | "cowboy">("billing")
  const [costExportStatuses, setCostExportStatuses] = useState<{
    inProgress: boolean
    postEvent: boolean
  }>({
    inProgress: true,
    postEvent: true,
  })

  // 仮押さえ進捗（キャストごと）
  const [draftCompanionBookingStatus, setDraftCompanionBookingStatus] = useState<
    Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
  >({})
  const [draftDirectorBookingStatus, setDraftDirectorBookingStatus] = useState<
    Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
  >({})
  const [draftMcBookingStatus, setDraftMcBookingStatus] = useState<Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">>({})
  const [draftCompanionFailureComment, setDraftCompanionFailureComment] = useState<Record<string, string>>({})
  const [draftDirectorFailureComment, setDraftDirectorFailureComment] = useState<Record<string, string>>({})
  const [draftMcFailureComment, setDraftMcFailureComment] = useState<Record<string, string>>({})

  // プロダクション情報とコンパニオン情報のマップ
  const productionsById = useMemo(() => {
    const byId = new Map<number, { id: number; name: string; address: string; phone: string }>()
    getProductions().forEach((p) => byId.set(p.id, p as any))
    return byId
  }, [getProductions])

  const companionsByName = useMemo(() => {
    const byName = new Map<string, { id: number; name: string; productionId: number }>()
    getCompanions().forEach((c) => byName.set(c.name, c as any))
    return byName
  }, [getCompanions])

  // ヘルパー関数
  const normalizeSelectedNames = useCallback((raw?: unknown) => {
    if (!Array.isArray(raw)) return [] as string[]
    return raw
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter((x) => x && x !== "未定")
  }, [])

  const computeTentativeProgress = useCallback(
    (
      names: string[],
      status: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">,
      failure: Record<string, string>,
    ) => {
      const done = names.filter((n) => status[n] === "tentative" || status[n] === "confirmed_request" || status[n] === "confirmed" || !!failure[n]).length
      return { done, total: names.length }
    },
    [],
  )

  const addStatusHistory = useCallback(
    (
      currentHistory: Array<{ status: string; timestamp: string; changedBy?: string; note?: string }> | undefined,
      newStatus: string,
      changedBy?: string,
      note?: string,
    ): Array<{ status: string; timestamp: string; changedBy?: string; note?: string }> => {
      const history = currentHistory || []
      return [
        ...history,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          changedBy,
          note,
        },
      ]
    },
    [],
  )

  const computeNextProjectStatusFromDraft = useCallback(
    (project: Project) => {
      const selectedCompanions = normalizeSelectedNames((project as any).selectedCompanions)
      const selectedDirectors = normalizeSelectedNames((project as any).selectedDirectors)
      const selectedMcs = normalizeSelectedNames((project as any).selectedMcs)

      if (project.projectStatus === "本押さえ依頼") {
        const allConfirmed =
          (selectedCompanions.length === 0 ||
            selectedCompanions.every((name) => draftCompanionBookingStatus[name] === "confirmed" && !draftCompanionFailureComment[name])) &&
          (selectedDirectors.length === 0 ||
            selectedDirectors.every((name) => draftDirectorBookingStatus[name] === "confirmed" && !draftDirectorFailureComment[name])) &&
          (selectedMcs.length === 0 || selectedMcs.every((name) => draftMcBookingStatus[name] === "confirmed" && !draftMcFailureComment[name]))

        if (allConfirmed && (selectedCompanions.length > 0 || selectedDirectors.length > 0 || selectedMcs.length > 0)) {
          return "手配進行中"
        }
        return "本押さえ依頼"
      }

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
    },
    [
      normalizeSelectedNames,
      draftCompanionBookingStatus,
      draftDirectorBookingStatus,
      draftMcBookingStatus,
      draftCompanionFailureComment,
      draftDirectorFailureComment,
      draftMcFailureComment,
      computeTentativeProgress,
    ],
  )

  // ぱちタウンの公開状況を取得する関数
  const getPachitownPublicationStatus = useCallback((project: Project): string | null => {
    const pachitownLinked = project.pachitownLinked
    if (!pachitownLinked) {
      return null
    }

    const publicationDate = project.publicationDate
    if (!publicationDate) {
      return "公開待ち"
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

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
      const eventDate = project.eventDate || project.date
      if (eventDate) {
        const eventDateStr = eventDate.replace(/-/g, "/")
        const [eventYear, eventMonth, eventDay] = eventDateStr.split("/").map(Number)
        if (!isNaN(eventYear) && !isNaN(eventMonth) && !isNaN(eventDay)) {
          const eventDateObj = new Date(eventYear, eventMonth - 1, eventDay)
          eventDateObj.setHours(0, 0, 0, 0)

          if (eventDateObj < today) {
            return "公開済み"
          } else {
            return "公開中"
          }
        }
      }
      return "公開中"
    }
  }, [])

  // プロジェクトフィルタリング
  const arrangementProjects = useMemo(() => {
    return allProjects.filter((p) => p.projectStatus === "手配進行中")
  }, [allProjects])

  const temporaryHoldRequests = useMemo(() => {
    return allProjects.filter((p) => p.projectStatus === "仮押さえ依頼" || p.projectStatus === "本押さえ依頼")
  }, [allProjects])

  const confirmationRequests = useMemo(() => {
    return allProjects.filter((p) => p.projectStatus === "マネジメント部確認中")
  }, [allProjects])

  const postEventProjects = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return allProjects.filter((p) => {
      const eventDate = p.eventDate || p.date
      if (!eventDate) return false

      const dateStr = eventDate.replace(/-/g, "/")
      const [year, month, day] = dateStr.split("/").map(Number)
      if (isNaN(year) || isNaN(month) || isNaN(day)) return false

      const projectDate = new Date(year, month - 1, day)
      projectDate.setHours(0, 0, 0, 0)

      return projectDate < today && (p.projectStatus === "手配進行中" || p.projectStatus === "イベント終了処理中")
    })
  }, [allProjects])

  // 実施日の翌日以降の案件のステータスを自動更新
  const updatedProjectsRef = useRef<Set<number>>(new Set())
  const updateProjectRef = useRef(updateProduct)
  const lastProjectsIdsRef = useRef<string>("")

  useEffect(() => {
    updateProjectRef.current = updateProduct
  }, [updateProduct])

  useEffect(() => {
    const currentProjectsIds = allProjects.map((p) => `${p.id}:${p.projectStatus}`).join(",")

    if (currentProjectsIds === lastProjectsIdsRef.current) {
      return
    }

    lastProjectsIdsRef.current = currentProjectsIds

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    allProjects.forEach((p) => {
      if ((p.projectStatus === "本押さえ依頼" || p.projectStatus === "手配進行中") && !updatedProjectsRef.current.has(p.id)) {
        const eventDate = p.eventDate || p.date
        if (eventDate) {
          const dateStr = eventDate.replace(/-/g, "/")
          const [year, month, day] = dateStr.split("/").map(Number)
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const projectDate = new Date(year, month - 1, day)
            projectDate.setHours(0, 0, 0, 0)

            if (projectDate < today) {
              updatedProjectsRef.current.add(p.id)
              const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`
              const currentHistory = (p as any).statusHistory as Array<{ status: string; timestamp: string; changedBy?: string; note?: string }> | undefined
              const updatedHistory = addStatusHistory(currentHistory, "イベント終了処理中", "システム", "実施日の翌日により自動更新")
              updateProjectRef.current(p.id, {
                projectStatus: "イベント終了処理中",
                surveySent: (p as any).surveySent !== undefined ? (p as any).surveySent : true,
                surveySentDate: (p as any).surveySentDate || todayStr,
                statusHistory: updatedHistory,
              })
            }
          }
        }
      } else if (p.projectStatus !== "本押さえ依頼" && p.projectStatus !== "手配進行中") {
        updatedProjectsRef.current.delete(p.id)
      }
    })
  }, [allProjects, addStatusHistory])

  // キャスティング情報モーダルを開いた時にdraft状態を初期化
  useEffect(() => {
    if (!selectedProject || !showCastingInfoModal) return
    const proj: any = selectedProject
    setDraftCompanionBookingStatus((proj.companionBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">)
    setDraftDirectorBookingStatus((proj.directorBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">)
    setDraftMcBookingStatus((proj.mcBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">)
    setDraftCompanionFailureComment((proj.companionTentativeHoldFailureComment ?? {}) as Record<string, string>)
    setDraftDirectorFailureComment((proj.directorTentativeHoldFailureComment ?? {}) as Record<string, string>)
    setDraftMcFailureComment((proj.mcTentativeHoldFailureComment ?? {}) as Record<string, string>)
  }, [selectedProject, showCastingInfoModal])

  // ハンドラー関数
  const handleViewCastingInfo = useCallback((project: Project) => {
    setSelectedProject(project)
    setShowCastingInfoModal(true)
  }, [])

  const handleTemporaryHold = useCallback(
    (project: Project) => {
      handleViewCastingInfo(project)
    },
    [handleViewCastingInfo],
  )

  const handleConfirmTemporaryHoldFromCasting = useCallback(() => {
    if (!selectedProject) return
    const nextProjectStatus = computeNextProjectStatusFromDraft(selectedProject)
    const currentStatus = selectedProject.projectStatus || ""

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

    const currentHistory = (selectedProject as any).statusHistory as Array<{ status: string; timestamp: string; changedBy?: string; note?: string }> | undefined
    const updatedHistory =
      currentStatus !== nextProjectStatus ? addStatusHistory(currentHistory, nextProjectStatus, "マネジメント部", "押さえ状況を保存") : currentHistory

    updateProduct(selectedProject.id, {
      companionBookingStatus: draftCompanionBookingStatus,
      directorBookingStatus: draftDirectorBookingStatus,
      mcBookingStatus: draftMcBookingStatus,
      companionTentativeHoldFailureComment: draftCompanionFailureComment,
      directorTentativeHoldFailureComment: draftDirectorFailureComment,
      mcTentativeHoldFailureComment: draftMcFailureComment,
      projectStatus: nextProjectStatus,
      temporaryHoldFailureComment,
      statusHistory: updatedHistory,
    })
    addNotification("押さえ状況を保存しました")
    setShowCastingInfoModal(false)
  }, [
    selectedProject,
    computeNextProjectStatusFromDraft,
    draftCompanionBookingStatus,
    draftDirectorBookingStatus,
    draftMcBookingStatus,
    draftCompanionFailureComment,
    draftDirectorFailureComment,
    draftMcFailureComment,
    updateProduct,
    addNotification,
    addStatusHistory,
  ])

  const handleConfirmTemporaryHold = useCallback(() => {
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
  }, [selectedProject, updateProduct, addNotification])

  const handleTemporaryHoldFailure = useCallback(
    (project: Project) => {
      handleViewCastingInfo(project)
    },
    [handleViewCastingInfo],
  )

  const handleConfirmTemporaryHoldFailure = useCallback(() => {
    addNotification("キャスティング情報でキャストごとに仮押さえ不可を設定してください")
    setShowTemporaryHoldFailureModal(false)
    setTemporaryHoldFailureComment("")
    setSelectedProject(null)
  }, [addNotification])

  const handleViewDetails = useCallback((project: Project) => {
    setSelectedProject(project)
    setShowConfirmationModal(true)
  }, [])

  const handleConfirmContent = useCallback(() => {
    if (!selectedProject) return

    const selectedCompanions = normalizeSelectedNames((selectedProject as any).selectedCompanions)
    const selectedDirectors = normalizeSelectedNames((selectedProject as any).selectedDirectors)
    const selectedMcs = normalizeSelectedNames((selectedProject as any).selectedMcs)

    const prevComp = ((selectedProject as any).companionBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
    const prevDir = ((selectedProject as any).directorBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
    const prevMc = ((selectedProject as any).mcBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">

    const companionBookingStatus: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed"> = { ...prevComp }
    const directorBookingStatus: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed"> = { ...prevDir }
    const mcBookingStatus: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed"> = { ...prevMc }

    selectedCompanions.forEach((name) => {
      if (companionBookingStatus[name] !== "confirmed") {
        companionBookingStatus[name] = "confirmed_request"
      }
    })
    selectedDirectors.forEach((name) => {
      if (directorBookingStatus[name] !== "confirmed") {
        directorBookingStatus[name] = "confirmed_request"
      }
    })
    selectedMcs.forEach((name) => {
      if (mcBookingStatus[name] !== "confirmed") {
        mcBookingStatus[name] = "confirmed_request"
      }
    })

    const currentHistory = (selectedProject as any).statusHistory as Array<{ status: string; timestamp: string; changedBy?: string; note?: string }> | undefined
    const updatedHistory = addStatusHistory(currentHistory, "本押さえ依頼", "マネジメント部", "内容確認を完了")

    updateProduct(selectedProject.id, {
      projectStatus: "本押さえ依頼",
      companionBookingStatus,
      directorBookingStatus,
      mcBookingStatus,
      statusHistory: updatedHistory,
    })
    addNotification("内容確認を完了しました")
    setShowConfirmationModal(false)
    setSelectedProject(null)
  }, [selectedProject, normalizeSelectedNames, updateProduct, addNotification, addStatusHistory])

  const handleRequestCorrection = useCallback(() => {
    if (!selectedProject) return
    setShowCorrectionModal(true)
  }, [selectedProject])

  const handleSubmitCorrection = useCallback(() => {
    if (!selectedProject || !correctionRequest.trim()) return
    const currentHistory = (selectedProject as any).statusHistory as Array<{ status: string; timestamp: string; changedBy?: string; note?: string }> | undefined
    const updatedHistory = addStatusHistory(currentHistory, "営業修正中", "マネジメント部", `修正依頼: ${correctionRequest}`)

    updateProduct(selectedProject.id, {
      projectStatus: "営業修正中",
      correctionRequest: correctionRequest,
      statusHistory: updatedHistory,
    })
    addNotification("営業に修正依頼を送信しました")
    setShowCorrectionModal(false)
    setShowConfirmationModal(false)
    setSelectedProject(null)
    setCorrectionRequest("")
  }, [selectedProject, correctionRequest, updateProduct, addNotification, addStatusHistory])

  const handleOpenAutoArrangementModal = useCallback((project: Project) => {
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
  }, [])

  const handleExecuteAutoArrangement = useCallback(() => {
    if (!selectedProject) return

    const actions: string[] = []
    if (autoArrangementChecks.pachitown) actions.push("ぱちタウン連携")
    if (autoArrangementChecks.report) actions.push("レポート作成依頼")
    if (autoArrangementChecks.googleForm) actions.push("Googleアンケートフォームの配布")
    if (autoArrangementChecks.xAccount) actions.push("専用Xアカウントによる事前告知依頼")

    if (actions.length > 0) {
      if (autoArrangementChecks.pachitown) {
        updateProduct(selectedProject.id, {
          pachitownLinked: true,
          pachitownLinkedDate: new Date().toISOString().split("T")[0],
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
  }, [selectedProject, autoArrangementChecks, updateProduct, addNotification])

  const handleDownloadSurveyCsv = useCallback(() => {
    if (!selectedProject) return
    const csvData = generateSurveyCsv(selectedProject)
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `アンケート結果_${selectedProject.projectName}_${selectedProject.eventDate || selectedProject.date || ""}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    addNotification("アンケート結果をCSVでダウンロードしました")
  }, [selectedProject, addNotification])

  const handleDownloadCostCsv = useCallback(() => {
    if (!costExportDateFrom || !costExportDateTo || (!costExportStatuses.inProgress && !costExportStatuses.postEvent)) return

    const fromDate = new Date(costExportDateFrom)
    const toDate = new Date(costExportDateTo)
    toDate.setHours(23, 59, 59, 999)

    const targetProjects = allProjects.filter((p) => {
      const eventDate = p.eventDate || p.date
      if (!eventDate) return false
      const dateStr = eventDate.replace(/-/g, "/")
      const [year, month, day] = dateStr.split("/").map(Number)
      if (isNaN(year) || isNaN(month) || isNaN(day)) return false
      const projectDate = new Date(year, month - 1, day)
      projectDate.setHours(0, 0, 0, 0)

      if (projectDate < fromDate || projectDate > toDate) return false

      const statusMatch =
        (costExportStatuses.inProgress && (p.projectStatus === "本押さえ依頼" || p.projectStatus === "手配進行中")) ||
        (costExportStatuses.postEvent && p.projectStatus === "イベント終了処理中")

      return statusMatch
    })

    if (targetProjects.length === 0) {
      addNotification("指定期間内に対象案件がありません")
      return
    }

    if (costExportFormat === "billing") {
      const csvRows = [
        ["案件No", "案件名", "実施日", "キャスティング費用", "交通費", "宿泊費", "PR費用", "合計金額"],
        ...targetProjects.map((p) => {
          const total =
            (p.castingCost || 0) + (p.transportationFee || 0) + (p.accommodationFee || 0) + (p.postPRCost || 0)
          return [
            p.projectNumber || "",
            p.projectName || "",
            p.eventDate || p.date || "",
            String(p.castingCost || 0),
            String(p.transportationFee || 0),
            String(p.accommodationFee || 0),
            String(p.postPRCost || 0),
            String(Math.round(total)),
          ]
        }),
      ]
      const csvContent =
        "\uFEFF" +
        csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `billing_${costExportDateFrom}_${costExportDateTo}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      addNotification(`請求データ(CSV)を出力しました（${targetProjects.length}件）`)
    } else {
      const csvRows = [
        ["案件No", "案件名", "実施日", "キャスティング費用", "交通費", "宿泊費", "PR費用", "合計金額"],
        ...targetProjects.map((p) => {
          const total =
            (p.castingCost || 0) + (p.transportationFee || 0) + (p.accommodationFee || 0) + (p.postPRCost || 0)
          return [
            p.projectNumber || "",
            p.projectName || "",
            p.eventDate || p.date || "",
            `¥${(p.castingCost || 0).toLocaleString()}`,
            `¥${(p.transportationFee || 0).toLocaleString()}`,
            `¥${(p.accommodationFee || 0).toLocaleString()}`,
            `¥${(p.postPRCost || 0).toLocaleString()}`,
            `¥${Math.round(total).toLocaleString()}`,
          ]
        }),
      ]
      const csvContent =
        "\uFEFF" +
        csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `cowboy_${costExportDateFrom}_${costExportDateTo}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      addNotification(`Cowboy形式で出力しました（${targetProjects.length}件）`)
    }
  }, [costExportDateFrom, costExportDateTo, costExportFormat, costExportStatuses, allProjects, addNotification])

  // キャストごとのステータス変更ハンドラー
  const handleCompanionStatusChange = useCallback((name: string, value: string) => {
    if (value === "pending") {
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
    if (value === "tentative") {
      setDraftCompanionBookingStatus((prev) => ({ ...prev, [name]: "tentative" }))
      setDraftCompanionFailureComment((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    if (value === "failed") {
      setDraftCompanionBookingStatus((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
      setDraftCompanionFailureComment((prev) => ({ ...prev, [name]: prev[name] ?? "" }))
    }
    if (value === "confirmed_request") {
      setDraftCompanionBookingStatus((prev) => ({ ...prev, [name]: "confirmed_request" }))
      setDraftCompanionFailureComment((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    if (value === "confirmed") {
      setDraftCompanionBookingStatus((prev) => ({ ...prev, [name]: "confirmed" }))
      setDraftCompanionFailureComment((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }, [])

  const handleDirectorStatusChange = useCallback((name: string, value: string) => {
    if (value === "pending") {
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
    if (value === "tentative") {
      setDraftDirectorBookingStatus((prev) => ({ ...prev, [name]: "tentative" }))
      setDraftDirectorFailureComment((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    if (value === "failed") {
      setDraftDirectorBookingStatus((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
      setDraftDirectorFailureComment((prev) => ({ ...prev, [name]: prev[name] ?? "" }))
    }
    if (value === "confirmed_request") {
      setDraftDirectorBookingStatus((prev) => ({ ...prev, [name]: "confirmed_request" }))
      setDraftDirectorFailureComment((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    if (value === "confirmed") {
      setDraftDirectorBookingStatus((prev) => ({ ...prev, [name]: "confirmed" }))
      setDraftDirectorFailureComment((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }, [])

  const handleMcStatusChange = useCallback((name: string, value: string) => {
    if (value === "pending") {
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
    if (value === "tentative") {
      setDraftMcBookingStatus((prev) => ({ ...prev, [name]: "tentative" }))
      setDraftMcFailureComment((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    if (value === "failed") {
      setDraftMcBookingStatus((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
      setDraftMcFailureComment((prev) => ({ ...prev, [name]: prev[name] ?? "" }))
    }
    if (value === "confirmed_request") {
      setDraftMcBookingStatus((prev) => ({ ...prev, [name]: "confirmed_request" }))
      setDraftMcFailureComment((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    if (value === "confirmed") {
      setDraftMcBookingStatus((prev) => ({ ...prev, [name]: "confirmed" }))
      setDraftMcFailureComment((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }, [])

  const handleCompanionFailureCommentChange = useCallback((name: string, value: string) => {
    setDraftCompanionFailureComment((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleDirectorFailureCommentChange = useCallback((name: string, value: string) => {
    setDraftDirectorFailureComment((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleMcFailureCommentChange = useCallback((name: string, value: string) => {
    setDraftMcFailureComment((prev) => ({ ...prev, [name]: value }))
  }, [])

  const closeCostExportModal = useCallback(() => {
    setShowCostExportModal(false)
    setCostExportDateFrom("")
    setCostExportDateTo("")
    setCostExportFormat("billing")
    setCostExportStatuses({ inProgress: true, postEvent: true })
  }, [])

  const closeAutoArrangementModal = useCallback(() => {
    setShowAutoArrangementModal(false)
    setAutoArrangementChecks({ pachitown: false, report: false, googleForm: false, xAccount: false })
  }, [])

  // コスト出力用の計算
  const costExportTargetProjects = useMemo(() => {
    if (!costExportDateFrom || !costExportDateTo || (!costExportStatuses.inProgress && !costExportStatuses.postEvent)) {
      return []
    }

    const fromDate = new Date(costExportDateFrom)
    const toDate = new Date(costExportDateTo)
    toDate.setHours(23, 59, 59, 999)

    return allProjects.filter((p) => {
      const eventDate = p.eventDate || p.date
      if (!eventDate) return false
      const dateStr = eventDate.replace(/-/g, "/")
      const [year, month, day] = dateStr.split("/").map(Number)
      if (isNaN(year) || isNaN(month) || isNaN(day)) return false
      const projectDate = new Date(year, month - 1, day)
      projectDate.setHours(0, 0, 0, 0)

      if (projectDate < fromDate || projectDate > toDate) return false

      const statusMatch =
        (costExportStatuses.inProgress && (p.projectStatus === "本押さえ依頼" || p.projectStatus === "手配進行中")) ||
        (costExportStatuses.postEvent && p.projectStatus === "イベント終了処理中")

      return statusMatch
    })
  }, [costExportDateFrom, costExportDateTo, costExportStatuses, allProjects])

  const costExportTotalAmount = useMemo(() => {
    return costExportTargetProjects.reduce((sum, p) => {
      return sum + ((p.castingCost || 0) + (p.transportationFee || 0) + (p.accommodationFee || 0) + (p.postPRCost || 0))
    }, 0)
  }, [costExportTargetProjects])

  // 押さえ依頼タブ用のグルーピングロジック
  type CastGroup = {
    castName: string
    castType: "companion" | "director" | "mc"
    status: "pending" | "confirmed_request"
    projects: Project[]
  }
  type ProductionGroup = {
    productionKey: string
    productionName: string
    casts: CastGroup[]
  }

  const holdRequestGroupsByProduction = useMemo(() => {
    const projectsByCast = new Map<string, { castName: string; castType: "companion" | "director" | "mc"; status: "pending" | "confirmed_request"; projects: Project[] }>()

    temporaryHoldRequests.forEach((project) => {
      const compStatus = ((project as any).companionBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
      const dirStatus = ((project as any).directorBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
      const mcStatus = ((project as any).mcBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">

      Object.entries(compStatus).forEach(([name, status]) => {
        if (status === "pending" || status === "confirmed_request") {
          const key = `companion-${name}`
          if (!projectsByCast.has(key)) {
            projectsByCast.set(key, { castName: name, castType: "companion", status: status as "pending" | "confirmed_request", projects: [] })
          }
          if (!projectsByCast.get(key)!.projects.find((p) => p.id === project.id)) {
            projectsByCast.get(key)!.projects.push(project)
          }
        }
      })

      Object.entries(dirStatus).forEach(([name, status]) => {
        if (status === "pending" || status === "confirmed_request") {
          const key = `director-${name}`
          if (!projectsByCast.has(key)) {
            projectsByCast.set(key, { castName: name, castType: "director", status: status as "pending" | "confirmed_request", projects: [] })
          }
          if (!projectsByCast.get(key)!.projects.find((p) => p.id === project.id)) {
            projectsByCast.get(key)!.projects.push(project)
          }
        }
      })

      Object.entries(mcStatus).forEach(([name, status]) => {
        if (status === "pending" || status === "confirmed_request") {
          const key = `mc-${name}`
          if (!projectsByCast.has(key)) {
            projectsByCast.set(key, { castName: name, castType: "mc", status: status as "pending" | "confirmed_request", projects: [] })
          }
          if (!projectsByCast.get(key)!.projects.find((p) => p.id === project.id)) {
            projectsByCast.get(key)!.projects.push(project)
          }
        }
      })
    })

    const groupsByProduction = new Map<string, ProductionGroup>()

    for (const [, { castName, castType, status, projects }] of projectsByCast.entries()) {
      let productionName = "フリー"
      let productionKey = "free"

      if (castType === "companion") {
        const companion = companionsByName.get(castName)
        if (companion) {
          const prod = productionsById.get(companion.productionId)
          if (prod) {
            productionName = prod.name
            productionKey = `production-${prod.id}`
          }
        }
      }

      const key = productionKey
      if (!groupsByProduction.has(key)) {
        groupsByProduction.set(key, {
          productionKey: key,
          productionName,
          casts: [],
        })
      }

      groupsByProduction.get(key)!.casts.push({
        castName,
        castType,
        status,
        projects,
      })
    }

    return Array.from(groupsByProduction.values())
  }, [temporaryHoldRequests, companionsByName, productionsById])

  const hasHoldRequestCastGroups = useMemo(() => {
    return holdRequestGroupsByProduction.length > 0
  }, [holdRequestGroupsByProduction])

  // タブ変更時にURLを更新する関数
  const handleActiveTabChange = useCallback((tab: "arrangements" | "confirmation" | "postEvent") => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("tab", tab)
    if (tab === "arrangements") {
      // arrangementsタブの場合はsubTabパラメータも保持
      if (!params.has("subTab")) {
        params.set("subTab", arrangementsSubTab)
      }
    } else {
      // 他のタブの場合はsubTabパラメータを削除
      params.delete("subTab")
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams, arrangementsSubTab])

  const handleArrangementsSubTabChange = useCallback((subTab: "holdRequest" | "inProgress") => {
    setArrangementsSubTab(subTab)
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("subTab", subTab)
    if (!params.has("tab")) {
      params.set("tab", "arrangements")
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return {
    router,
    updateProduct,
    allProjects,
    productionsById,
    companionsByName,
    normalizeSelectedNames,
    computeTentativeProgress,
    getPachitownPublicationStatus,

    // 共通状態
    activeTab,
    setActiveTab: handleActiveTabChange,
    arrangementsSubTab,
    setArrangementsSubTab: handleArrangementsSubTabChange,

    // プロジェクトリスト
    arrangementProjects,
    temporaryHoldRequests,
    confirmationRequests,
    postEventProjects,
    holdRequestGroupsByProduction,
    hasHoldRequestCastGroups,

    // 選択されたプロジェクト
    selectedProject,
    setSelectedProject,
    selectedProjectForHistory,
    setSelectedProjectForHistory,

    // モーダル状態
    showCastingInfoModal,
    setShowCastingInfoModal,
    showTemporaryHoldModal,
    setShowTemporaryHoldModal,
    showConfirmationModal,
    setShowConfirmationModal,
    showCorrectionModal,
    setShowCorrectionModal,
    showTemporaryHoldFailureModal,
    setShowTemporaryHoldFailureModal,
    showStatusHistoryModal,
    setShowStatusHistoryModal,
    showAutoArrangementModal,
    setShowAutoArrangementModal,
    showSurveyResultModal,
    setShowSurveyResultModal,
    showCostExportModal,
    setShowCostExportModal,

    // 修正依頼関連
    correctionRequest,
    setCorrectionRequest,
    temporaryHoldFailureComment,
    setTemporaryHoldFailureComment,

    // 自動手配チェック
    autoArrangementChecks,
    setAutoArrangementChecks,

    // コスト出力関連
    costExportDateFrom,
    setCostExportDateFrom,
    costExportDateTo,
    setCostExportDateTo,
    costExportFormat,
    setCostExportFormat,
    costExportStatuses,
    setCostExportStatuses,
    costExportTargetProjects,
    costExportTotalAmount,

    // キャストごとのdraft状態
    draftCompanionBookingStatus,
    draftDirectorBookingStatus,
    draftMcBookingStatus,
    draftCompanionFailureComment,
    draftDirectorFailureComment,
    draftMcFailureComment,

    // ハンドラー
    handleViewCastingInfo,
    handleTemporaryHold,
    handleConfirmTemporaryHoldFromCasting,
    handleConfirmTemporaryHold,
    handleTemporaryHoldFailure,
    handleConfirmTemporaryHoldFailure,
    handleViewDetails,
    handleConfirmContent,
    handleRequestCorrection,
    handleSubmitCorrection,
    handleOpenAutoArrangementModal,
    handleExecuteAutoArrangement,
    handleDownloadSurveyCsv,
    handleDownloadCostCsv,
    handleCompanionStatusChange,
    handleDirectorStatusChange,
    handleMcStatusChange,
    handleCompanionFailureCommentChange,
    handleDirectorFailureCommentChange,
    handleMcFailureCommentChange,
    closeCostExportModal,
    closeAutoArrangementModal,
  }
}
