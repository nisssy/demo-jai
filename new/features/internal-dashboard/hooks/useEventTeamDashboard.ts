"use client"
import { useState, useMemo, useCallback } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, BookingStatus, StatusHistoryEntry } from "@/new/api/types"
import { SEED_COMPANIONS, SEED_DIRECTORS, SEED_PRODUCTIONS } from "@/new/api/seed-data"

export type EventTeamTab = "cast-arrangement" | "arrangement" | "post-event"
export type CastSubTab = "tentative" | "confirmed"

/** 仮押さえ中（依頼中 or 不可） */
function isTentativeArranging(status: BookingStatus): boolean {
  return status === "tentative_requesting" || status === "tentative_failed"
}

/** 本押さえ対象（本押さえ依頼中、本押さえ不可） */
function needsConfirmedAction(status: BookingStatus): boolean {
  return status === "confirmed_requesting" || status === "confirmed_failed"
}

/** どちらかのタブに表示される（全体カウント用） */
function needsCastAction(status: BookingStatus): boolean {
  return isTentativeArranging(status) || needsConfirmedAction(status)
}

/** キャスト手配タブ用: プロダクション→キャスト→案件 のグルーピング */
export type CastProductEntry = {
  product: Product
  projectName: string
  bookingStatus: BookingStatus
}

export type CastEntry = {
  castName: string
  castRole: "コンパニオン" | "ディレクター" | "MC"
  entries: CastProductEntry[]
}

export type ProductionGroup = {
  productionName: string
  casts: CastEntry[]
}

/** プロダクション→キャスト→案件 グルーピングを構築 */
function buildProductionGroups(
  products: Product[],
  statusFilter: (s: BookingStatus) => boolean,
  getProjectName: (p: Product) => string,
  companionMap: Map<string, { productionId?: number }>,
  productionMap: Map<number, { name: string }>,
): ProductionGroup[] {
  const castMap = new Map<string, { role: "コンパニオン" | "ディレクター" | "MC"; entries: CastProductEntry[] }>()

  for (const product of products) {
    const projectName = getProjectName(product)
    for (const name of product.selectedCompanions) {
      const status = product.companionBookingStatus[name]
      if (!status || !statusFilter(status)) continue
      if (!castMap.has(name)) castMap.set(name, { role: "コンパニオン", entries: [] })
      castMap.get(name)!.entries.push({ product, projectName, bookingStatus: status })
    }
    for (const name of product.selectedDirectors) {
      const status = product.directorBookingStatus[name]
      if (!status || !statusFilter(status)) continue
      if (!castMap.has(name)) castMap.set(name, { role: "ディレクター", entries: [] })
      castMap.get(name)!.entries.push({ product, projectName, bookingStatus: status })
    }
    for (const name of product.selectedMcs) {
      const status = product.mcBookingStatus[name]
      if (!status || !statusFilter(status)) continue
      if (!castMap.has(name)) castMap.set(name, { role: "MC", entries: [] })
      castMap.get(name)!.entries.push({ product, projectName, bookingStatus: status })
    }
  }

  const groupMap = new Map<string, CastEntry[]>()
  for (const [castName, { role, entries }] of castMap) {
    const companion = companionMap.get(castName)
    let productionName = "フリー"
    if (companion?.productionId) {
      const prod = productionMap.get(companion.productionId)
      if (prod) productionName = prod.name
    }
    if (!groupMap.has(productionName)) groupMap.set(productionName, [])
    groupMap.get(productionName)!.push({ castName, castRole: role, entries })
  }

  const sorted = [...groupMap.entries()].sort((a, b) => {
    if (a[0] === "フリー") return 1
    if (b[0] === "フリー") return -1
    return a[0].localeCompare(b[0])
  })
  return sorted.map(([productionName, casts]) => ({ productionName, casts }))
}

/** 各種手配タブ用: チェック状態 */
export type ArrangementChecks = {
  pachitownLink: boolean
  reportRequest: boolean
  surveyForm: boolean
  xAnnouncement: boolean
}

/** コスト出力: ステータスフィルタ */
export type CostExportStatuses = {
  inProgress: boolean
  postEvent: boolean
}

export function useEventTeamDashboard({ repository }: { repository: ProjectRepository }) {
  const [activeTab, setActiveTab] = useState<EventTeamTab>("cast-arrangement")
  const [castSubTab, setCastSubTab] = useState<CastSubTab>("tentative")

  // ─── リフレッシュ（repository更新後にデータ再取得を強制する） ───
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  // ─── 共通状態 ───
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showStatusHistoryModal, setShowStatusHistoryModal] = useState(false)

  // ─── キャスト手配: 仮押さえ不可モーダル ───
  const [showHoldFailureModal, setShowHoldFailureModal] = useState(false)
  const [holdFailureCastName, setHoldFailureCastName] = useState("")
  const [holdFailureCastRole, setHoldFailureCastRole] = useState<"companion" | "director" | "mc">("companion")
  const [holdFailureComment, setHoldFailureComment] = useState("")
  const [holdFailureProductId, setHoldFailureProductId] = useState<number | null>(null)

  // ─── 各種手配: 自動手配モーダル ───
  const [showAutoArrangementModal, setShowAutoArrangementModal] = useState(false)
  const [arrangementChecks, setArrangementChecks] = useState<ArrangementChecks>({
    pachitownLink: true,
    reportRequest: true,
    surveyForm: true,
    xAnnouncement: true,
  })
  const [autoArrangementToast, setAutoArrangementToast] = useState<string | null>(null)

  // ─── 各種手配: 衣装手配モーダル ───
  const [showCostumeModal, setShowCostumeModal] = useState(false)
  const [costumeDraft, setCostumeDraft] = useState<Record<string, string>>({})

  // ─── イベント終了処理: アンケート結果モーダル ───
  const [showSurveyResultModal, setShowSurveyResultModal] = useState(false)

  // ─── イベント終了処理: コストCSVモーダル ───
  const [showCostExportModal, setShowCostExportModal] = useState(false)
  const [costExportDateFrom, setCostExportDateFrom] = useState("")
  const [costExportDateTo, setCostExportDateTo] = useState("")
  const [costExportFormat, setCostExportFormat] = useState<"billing" | "cowboy">("billing")
  const [costExportStatuses, setCostExportStatuses] = useState<CostExportStatuses>({
    inProgress: true,
    postEvent: true,
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allProducts = useMemo(() => repository.getProducts(), [repository, refreshKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allProjects = useMemo(() => repository.getProjects(), [repository, refreshKey])

  const getProjectForProduct = useCallback((product: Product) =>
    allProjects.find(pj => pj.id === product.projectId)
  , [allProjects])

  /** selectedProduct の clientName を解決 */
  const selectedProductClientName = useMemo(() => {
    if (!selectedProduct) return ""
    const project = allProjects.find(pj => pj.id === selectedProduct.projectId)
    return project?.clientName ?? ""
  }, [selectedProduct, allProjects])

  /** holdFailureProduct を holdFailureProductId から解決 */
  const holdFailureProduct = useMemo(() =>
    holdFailureProductId ? allProducts.find(p => p.id === holdFailureProductId) ?? null : null
  , [holdFailureProductId, allProducts])

  const holdFailureClientName = useMemo(() => {
    if (!holdFailureProduct) return ""
    const project = allProjects.find(pj => pj.id === holdFailureProduct.projectId)
    return project?.clientName ?? ""
  }, [holdFailureProduct, allProjects])

  // ═══════════════════════════════════════════════════
  // タブ1: キャスト手配 — プロダクション→キャスト→案件グルーピング
  // ═══════════════════════════════════════════════════

  const companionMap = useMemo(() =>
    new Map(SEED_COMPANIONS.map(c => [c.name, c]))
  , [])
  /** コンパニオン名 → サイズ のマップ */
  const companionSizeMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of SEED_COMPANIONS) {
      if (c.size) map[c.name] = c.size
    }
    return map
  }, [])
  const productionMap = useMemo(() =>
    new Map(SEED_PRODUCTIONS.map(p => [p.id, p]))
  , [])

  /** キャスト手配対象のイベント商材（仮 or 本押さえでアクションが必要なキャストが1人以上いる） */
  const castArrangementEventProducts = useMemo(() =>
    allProducts.filter(p => {
      if (p.category !== "イベント") return false
      const allStatuses = [
        ...Object.values(p.companionBookingStatus),
        ...Object.values(p.directorBookingStatus),
        ...Object.values(p.mcBookingStatus),
      ]
      return allStatuses.some(needsCastAction)
    })
  , [allProducts])

  const getProjectName = useCallback((p: Product) =>
    getProjectForProduct(p)?.projectName ?? ""
  , [getProjectForProduct])

  /** 仮押さえタブ用グルーピング */
  const tentativeProductionGroups = useMemo(() =>
    buildProductionGroups(castArrangementEventProducts, isTentativeArranging, getProjectName, companionMap, productionMap)
  , [castArrangementEventProducts, getProjectName, companionMap, productionMap])

  /** 本押さえタブ用グルーピング */
  const confirmedProductionGroups = useMemo(() =>
    buildProductionGroups(castArrangementEventProducts, needsConfirmedAction, getProjectName, companionMap, productionMap)
  , [castArrangementEventProducts, getProjectName, companionMap, productionMap])

  /** エントリ数（バッジ表示用） */
  const tentativeEntryCount = useMemo(() =>
    tentativeProductionGroups.reduce((sum, g) => sum + g.casts.reduce((s, c) => s + c.entries.length, 0), 0)
  , [tentativeProductionGroups])
  const confirmedEntryCount = useMemo(() =>
    confirmedProductionGroups.reduce((sum, g) => sum + g.casts.reduce((s, c) => s + c.entries.length, 0), 0)
  , [confirmedProductionGroups])

  // ═══════════════════════════════════════════════════
  // タブ2: 各種手配 — 受注+実施前
  // ═══════════════════════════════════════════════════

  const arrangementProducts = useMemo(() =>
    allProducts.filter(p =>
      p.category === "イベント" &&
      p.proposalStatus === "order-received" &&
      p.executionStatus === "実施前"
    )
  , [allProducts])

  // ═══════════════════════════════════════════════════
  // タブ3: イベント終了処理
  // ═══════════════════════════════════════════════════

  const postEventProducts = useMemo(() =>
    allProducts.filter(p =>
      p.category === "イベント" &&
      p.executionStatus === "終了"
    )
  , [allProducts])

  // ─── サマリー ───

  const summaryCounts = useMemo(() => ({
    castArrangement: tentativeEntryCount + confirmedEntryCount,
    arrangement: arrangementProducts.length,
    postEvent: postEventProducts.length,
  }), [tentativeEntryCount, confirmedEntryCount, arrangementProducts, postEventProducts])

  // ═══════════════════════════════════════════════════
  // コスト出力: 対象商材の計算
  // ═══════════════════════════════════════════════════

  const costExportTargetProducts = useMemo(() => {
    if (!costExportDateFrom || !costExportDateTo) return []
    if (!costExportStatuses.inProgress && !costExportStatuses.postEvent) return []

    return allProducts.filter(p => {
      if (p.category !== "イベント") return false

      // ステータスフィルタ
      const isInProgress = p.proposalStatus === "order-received" && p.executionStatus === "実施前"
      const isPostEvent = p.executionStatus === "終了"
      if (!((costExportStatuses.inProgress && isInProgress) || (costExportStatuses.postEvent && isPostEvent))) return false

      // 日付フィルタ
      const d = p.eventDate?.replace(/\//g, "-") ?? ""
      if (costExportDateFrom && d < costExportDateFrom) return false
      if (costExportDateTo && d > costExportDateTo) return false
      return true
    })
  }, [allProducts, costExportDateFrom, costExportDateTo, costExportStatuses])

  const costExportTotalAmount = useMemo(() =>
    costExportTargetProducts.reduce((sum, p) =>
      sum + (p.castingCost ?? 0) + (p.transportationFee ?? 0) + (p.accommodationFee ?? 0) + (p.postPRCost ?? 0)
    , 0)
  , [costExportTargetProducts])

  // ═══════════════════════════════════════════════════
  // ハンドラ: キャスト手配
  // ═══════════════════════════════════════════════════

  /** 特定キャストの押さえステータスを「完了」に変更する */
  const completeCastHold = useCallback((
    castName: string,
    castRole: "companion" | "director" | "mc",
    productId: number,
  ) => {
    const product = allProducts.find(p => p.id === productId)
    if (!product) return

    const updates: Partial<Product> = {}
    const now = new Date().toISOString()

    // 現在のステータスに応じて完了ステータスを決定
    if (castRole === "companion") {
      const current = product.companionBookingStatus[castName]
      const completed: BookingStatus = (current === "confirmed_requesting" || current === "confirmed_failed")
        ? "confirmed_completed" : "tentative_completed"
      updates.companionBookingStatus = {
        ...product.companionBookingStatus,
        [castName]: completed,
      }
    } else if (castRole === "director") {
      const current = product.directorBookingStatus[castName]
      const completed: BookingStatus = (current === "confirmed_requesting" || current === "confirmed_failed")
        ? "confirmed_completed" : "tentative_completed"
      updates.directorBookingStatus = {
        ...product.directorBookingStatus,
        [castName]: completed,
      }
    } else {
      const current = product.mcBookingStatus[castName]
      const completed: BookingStatus = (current === "confirmed_requesting" || current === "confirmed_failed")
        ? "confirmed_completed" : "tentative_completed"
      updates.mcBookingStatus = {
        ...product.mcBookingStatus,
        [castName]: completed,
      }
    }

    const isConfirmed = (() => {
      if (castRole === "companion") return product.companionBookingStatus[castName]?.startsWith("confirmed")
      if (castRole === "director") return product.directorBookingStatus[castName]?.startsWith("confirmed")
      return product.mcBookingStatus[castName]?.startsWith("confirmed")
    })()

    updates.statusHistory = [...(product.statusHistory ?? []), {
      status: isConfirmed ? "本押さえ完了" : "仮押さえ完了",
      timestamp: now,
      changedBy: "マネジメント部",
      note: castName,
    }]

    repository.updateProduct(product.id, updates)
    refresh()
  }, [allProducts, repository, refresh])

  /** 仮押さえ完了 → 本押さえ依頼中に変更する */
  const requestConfirmedHold = useCallback((
    castName: string,
    castRole: "companion" | "director" | "mc",
    productId: number,
  ) => {
    const product = allProducts.find(p => p.id === productId)
    if (!product) return

    const updates: Partial<Product> = {}
    const now = new Date().toISOString()

    if (castRole === "companion") {
      updates.companionBookingStatus = {
        ...product.companionBookingStatus,
        [castName]: "confirmed_requesting" as BookingStatus,
      }
    } else if (castRole === "director") {
      updates.directorBookingStatus = {
        ...product.directorBookingStatus,
        [castName]: "confirmed_requesting" as BookingStatus,
      }
    } else {
      updates.mcBookingStatus = {
        ...product.mcBookingStatus,
        [castName]: "confirmed_requesting" as BookingStatus,
      }
    }

    updates.statusHistory = [...(product.statusHistory ?? []), {
      status: "本押さえ依頼",
      timestamp: now,
      changedBy: "マネジメント部",
      note: castName,
    }]

    repository.updateProduct(product.id, updates)
    refresh()
  }, [allProducts, repository, refresh])

  const openHoldFailure = useCallback((
    castName: string,
    castRole: "companion" | "director" | "mc",
    productId: number,
  ) => {
    setHoldFailureCastName(castName)
    setHoldFailureCastRole(castRole)
    setHoldFailureProductId(productId)
    setHoldFailureComment("")
    setShowHoldFailureModal(true)
  }, [])

  const submitHoldFailure = useCallback(() => {
    if (!holdFailureProductId || !holdFailureCastName) return
    const product = allProducts.find(p => p.id === holdFailureProductId)
    if (!product) return

    const updates: Partial<Product> = {}
    const now = new Date().toISOString()

    // 現在のステータスから仮/本を判定
    let currentStatus: BookingStatus | undefined
    if (holdFailureCastRole === "companion") currentStatus = product.companionBookingStatus[holdFailureCastName]
    else if (holdFailureCastRole === "director") currentStatus = product.directorBookingStatus[holdFailureCastName]
    else currentStatus = product.mcBookingStatus[holdFailureCastName]

    const isConfirmed = currentStatus === "confirmed_requesting"
    const failedStatus: BookingStatus = isConfirmed ? "confirmed_failed" : "tentative_failed"
    const statusLabel = isConfirmed ? "本押さえ不可" : "仮押さえ不可"

    if (holdFailureCastRole === "companion") {
      updates.companionBookingStatus = {
        ...product.companionBookingStatus,
        [holdFailureCastName]: failedStatus,
      }
      updates.companionTentativeHoldFailureComment = {
        ...(product.companionTentativeHoldFailureComment ?? {}),
        [holdFailureCastName]: holdFailureComment,
      }
    } else if (holdFailureCastRole === "director") {
      updates.directorBookingStatus = {
        ...product.directorBookingStatus,
        [holdFailureCastName]: failedStatus,
      }
      updates.directorTentativeHoldFailureComment = {
        ...(product.directorTentativeHoldFailureComment ?? {}),
        [holdFailureCastName]: holdFailureComment,
      }
    } else {
      updates.mcBookingStatus = {
        ...product.mcBookingStatus,
        [holdFailureCastName]: failedStatus,
      }
      updates.mcTentativeHoldFailureComment = {
        ...(product.mcTentativeHoldFailureComment ?? {}),
        [holdFailureCastName]: holdFailureComment,
      }
    }

    updates.temporaryHoldFailureComment = `${holdFailureCastName}さんは${statusLabel}: ${holdFailureComment}`
    updates.statusHistory = [...(product.statusHistory ?? []), {
      status: statusLabel,
      timestamp: now,
      changedBy: "マネジメント部",
      note: `${holdFailureCastName}: ${holdFailureComment}`,
    }]

    repository.updateProduct(product.id, updates)
    setShowHoldFailureModal(false)
    refresh()
  }, [holdFailureProductId, holdFailureCastName, holdFailureCastRole, holdFailureComment, allProducts, repository, refresh])

  // ─── ステータス履歴 ───

  const openStatusHistory = useCallback((product: Product) => {
    setSelectedProduct(product)
    setShowStatusHistoryModal(true)
  }, [])

  // ═══════════════════════════════════════════════════
  // ハンドラ: 各種手配
  // ═══════════════════════════════════════════════════

  const openAutoArrangement = useCallback((product: Product) => {
    setSelectedProduct(product)
    setArrangementChecks({
      pachitownLink: product.mustSeePublication === "要",
      reportRequest: product.reportRequired === "要",
      surveyForm: true,
      xAnnouncement: true,
    })
    setShowAutoArrangementModal(true)
  }, [])

  const executeAutoArrangement = useCallback(() => {
    if (!selectedProduct) return
    const updates: Partial<Product> = {}
    const now = new Date().toISOString()
    const executed: string[] = []

    if (arrangementChecks.pachitownLink) {
      updates.pachitownLinked = true
      updates.pachitownLinkedDate = now.split("T")[0]
      executed.push("ぱちタウン連携")
    }
    if (arrangementChecks.reportRequest) {
      executed.push("レポート作成依頼")
    }
    if (arrangementChecks.surveyForm) {
      updates.surveySent = true
      updates.surveySentDate = now.split("T")[0]
      executed.push("アンケートフォーム配布")
    }
    if (arrangementChecks.xAnnouncement) {
      executed.push("X事前告知依頼")
    }

    updates.statusHistory = [...(selectedProduct.statusHistory ?? []), {
      status: "各種手配実行",
      timestamp: now,
      changedBy: "マネジメント部",
      note: executed.join("、"),
    }]

    repository.updateProduct(selectedProduct.id, updates)
    setAutoArrangementToast(`${executed.join("、")}を実行しました`)
    setShowAutoArrangementModal(false)
    refresh()
    setTimeout(() => setAutoArrangementToast(null), 3000)
  }, [selectedProduct, arrangementChecks, repository, refresh])

  // ═══════════════════════════════════════════════════
  // ハンドラ: イベント終了処理
  // ═══════════════════════════════════════════════════

  const openSurveyResult = useCallback((product: Product) => {
    setSelectedProduct(product)
    setShowSurveyResultModal(true)
  }, [])

  const downloadCostCsv = useCallback(() => {
    const targets = costExportTargetProducts
    if (targets.length === 0) return
    const header = "案件No,商材名,実施日,キャスティング費用,交通費,宿泊費,PR費用,合計\n"
    const rows = targets.map(p => {
      const total = (p.castingCost ?? 0) + (p.transportationFee ?? 0) + (p.accommodationFee ?? 0) + (p.postPRCost ?? 0)
      return `${p.projectNumber},${p.eventProductName},${p.eventDate},${p.castingCost ?? 0},${p.transportationFee ?? 0},${p.accommodationFee ?? 0},${p.postPRCost ?? 0},${total}`
    }).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cost_export.csv"
    a.click()
    URL.revokeObjectURL(url)
    setShowCostExportModal(false)
  }, [costExportTargetProducts])

  const downloadSurveyCsv = useCallback((product: Product) => {
    const sr = product.surveyResult
    if (!sr) return
    const header = "案件No,商材名,満足度,コメント,次回開催希望,改善要望\n"
    const row = `${product.projectNumber},${product.eventProductName},${sr.satisfaction ?? ""},${sr.comment ?? ""},${sr.nextEventDesired ?? ""},${sr.improvementRequest ?? ""}`
    const blob = new Blob([header + row], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `survey_${product.projectNumber}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const closeCostExportModal = useCallback(() => {
    setShowCostExportModal(false)
  }, [])

  // ═══════════════════════════════════════════════════
  // ハンドラ: 衣装手配
  // ═══════════════════════════════════════════════════

  const openCostumeArrangement = useCallback((product: Product) => {
    setSelectedProduct(product)
    // 既存の衣装を読み込み、未設定のコンパニオンにはサイズから自動選択
    const existing = product.companionCostumes ?? {}
    const draft: Record<string, string> = { ...existing }
    for (const name of product.selectedCompanions) {
      if (name === "未定") continue
      if (!draft[name]) {
        // サイズに基づくデフォルト衣装 (全衣装がS/M/L対応なのでcostume1を自動選択)
        draft[name] = "costume1"
      }
    }
    setCostumeDraft(draft)
    setShowCostumeModal(true)
  }, [])

  const saveCostumeArrangement = useCallback(() => {
    if (!selectedProduct) return
    repository.updateProduct(selectedProduct.id, {
      companionCostumes: costumeDraft,
    })
    setShowCostumeModal(false)
    refresh()
  }, [selectedProduct, costumeDraft, repository, refresh])

  return {
    activeTab, setActiveTab,
    summaryCounts,
    selectedProduct, getProjectForProduct,
    selectedProductClientName,
    // キャスト手配
    castSubTab, setCastSubTab,
    tentativeProductionGroups, confirmedProductionGroups,
    tentativeEntryCount, confirmedEntryCount,
    completeCastHold, requestConfirmedHold,
    showHoldFailureModal, setShowHoldFailureModal, openHoldFailure, submitHoldFailure,
    holdFailureCastName, holdFailureComment, setHoldFailureComment,
    holdFailureProduct, holdFailureClientName,
    // 各種手配
    arrangementProducts,
    showAutoArrangementModal, setShowAutoArrangementModal, openAutoArrangement,
    arrangementChecks, setArrangementChecks, executeAutoArrangement,
    autoArrangementToast,
    // 衣装手配
    showCostumeModal, setShowCostumeModal, openCostumeArrangement, saveCostumeArrangement,
    costumeDraft, setCostumeDraft, companionSizeMap,
    // イベント終了処理
    postEventProducts,
    showSurveyResultModal, setShowSurveyResultModal, openSurveyResult,
    downloadSurveyCsv,
    showCostExportModal, setShowCostExportModal, downloadCostCsv, closeCostExportModal,
    costExportDateFrom, setCostExportDateFrom, costExportDateTo, setCostExportDateTo,
    costExportFormat, setCostExportFormat,
    costExportStatuses, setCostExportStatuses,
    costExportTargetProducts, costExportTotalAmount,
    // 共通
    showStatusHistoryModal, setShowStatusHistoryModal, openStatusHistory,
  }
}

export type UseEventTeamDashboardReturn = ReturnType<typeof useEventTeamDashboard>
