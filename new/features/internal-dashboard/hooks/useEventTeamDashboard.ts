"use client"
import { useState, useMemo, useCallback } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, BookingStatus, StatusHistoryEntry, ChatMessage } from "@/new/api/types"
import type { ProductFormState } from "@/new/features/project-registration/model/types"
import type { CostItem } from "../ui/modals/CostInputModal.view"
import { SEED_COMPANIONS, SEED_DIRECTORS, SEED_PRODUCTIONS, SEED_MACHINE_MASTERS } from "@/new/api/seed-data"

/** Product エンティティ → ProductFormState への変換（読み取り専用表示用） */
function productToFormState(product: Product): ProductFormState {
  return {
    id: product.id,
    category: product.category,
    eventType: product.eventType,
    eventProductName: product.eventProductName,
    eventDate: product.eventDate,
    startTime: product.startTime ?? "08:00",
    endTime: product.endTime ?? "15:00",
    mustSeeFlag: product.mustSeeFlag ?? "0",
    mustSeePublication: product.mustSeePublication ?? "不要",
    publicationDate: product.publicationDate ?? "",
    publicationTime: product.publicationTime ?? "",
    reportRequired: product.reportRequired ?? "不要",
    isOpen: true,
    companionCount: product.companionCount ?? "",
    directorCount: product.directorCount ?? "",
    selectedCompanions: product.selectedCompanions?.length ? product.selectedCompanions : ["未定"],
    selectedDirectors: product.selectedDirectors?.length ? product.selectedDirectors : ["未定"],
    nominatedCompanions: {},
    nominatedDirectors: {},
    companionHoldTypes: Object.fromEntries(
      Object.entries(product.companionBookingStatus ?? {}).map(([name, status]) => [name, status.startsWith("confirmed") ? "confirmed" as const : "tentative" as const])
    ),
    directorHoldTypes: Object.fromEntries(
      Object.entries(product.directorBookingStatus ?? {}).map(([name, status]) => [name, status.startsWith("confirmed") ? "confirmed" as const : "tentative" as const])
    ),
    performanceFeeDiscount: "",
    accommodationFeePerPerson: "",
    eventBaseFeeDiscount: "",
    proposalStatus: product.proposalStatus ?? "before-proposal",
    readingCertainty: product.readingCertainty ?? "",
    executionStatus: product.executionStatus ?? null,
  }
}

export type EventTeamTab = "cast-arrangement" | "arrangement" | "post-event" | "product-confirmation"
export type CastSubTab = "tentative" | "confirmed"
export type ArrangementSubTab = "trinity-girl" | "slosele"

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

/** 未定キャスト手配依頼 */
export type UndecidedCastRequest = {
  product: Product
  projectName: string
  companionCount: number
  directorCount: number
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
  const [arrangementSubTab, setArrangementSubTab] = useState<ArrangementSubTab>("trinity-girl")

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

  // ─── イベント終了処理: コスト入力モーダル ───
  const [showCostInputModal, setShowCostInputModal] = useState(false)
  const [costInputProduct, setCostInputProduct] = useState<Product | null>(null)
  const [costInputItems, setCostInputItems] = useState<CostItem[]>([])
  const [costInputAutoFilled, setCostInputAutoFilled] = useState(false)

  // ─── イベント終了処理: コストCSVモーダル ───
  const [showCostExportModal, setShowCostExportModal] = useState(false)
  const [costExportDateFrom, setCostExportDateFrom] = useState("")
  const [costExportDateTo, setCostExportDateTo] = useState("")
  const [costExportFormat, setCostExportFormat] = useState<"billing" | "cowboy">("billing")
  const [costExportStatuses, setCostExportStatuses] = useState<CostExportStatuses>({
    inProgress: true,
    postEvent: true,
  })

  // ─── キャスト割り当てモーダル ───
  const [showCastAssignmentModal, setShowCastAssignmentModal] = useState(false)
  const [castAssignmentProduct, setCastAssignmentProduct] = useState<Product | null>(null)
  const [selectedAssignCompanions, setSelectedAssignCompanions] = useState<string[]>([])
  const [selectedAssignDirectors, setSelectedAssignDirectors] = useState<string[]>([])

  // ─── 商材確認モーダル ───
  const [showConfirmationDetailModal, setShowConfirmationDetailModal] = useState(false)
  const [confirmationComment, setConfirmationComment] = useState("")
  const [selectedConfirmationProduct, setSelectedConfirmationProduct] = useState<Product | null>(null)

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

  /** productionId → name の Record（View用） */
  const productionNameRecord = useMemo(() => {
    const record: Record<number, string> = {}
    for (const [id, prod] of productionMap) {
      record[id] = prod.name
    }
    return record
  }, [productionMap])

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

  /** 未定キャスト手配依頼（companionCount/directorCountと実名キャスト数の差分） */
  const undecidedCastRequests = useMemo<UndecidedCastRequest[]>(() => {
    const requests: UndecidedCastRequest[] = []
    for (const product of allProducts) {
      if (product.category !== "イベント") continue
      const companionNeeded = parseInt(product.companionCount || "0") - product.selectedCompanions.length
      const directorNeeded = parseInt(product.directorCount || "0") - product.selectedDirectors.length
      if (companionNeeded > 0 || directorNeeded > 0) {
        requests.push({
          product,
          projectName: getProjectName(product),
          companionCount: Math.max(0, companionNeeded),
          directorCount: Math.max(0, directorNeeded),
        })
      }
    }
    return requests
  }, [allProducts, getProjectName])

  // ─── キャスト割り当て（未定キャスト手配依頼からキャストを選択） ───

  const castAssignmentProjectName = useMemo(() => {
    if (!castAssignmentProduct) return ""
    return getProjectForProduct(castAssignmentProduct)?.projectName ?? ""
  }, [castAssignmentProduct, getProjectForProduct])

  const availableCompanionsForAssignment = useMemo(() => {
    if (!castAssignmentProduct) return []
    const assigned = new Set(castAssignmentProduct.selectedCompanions)
    return SEED_COMPANIONS.filter(c => !assigned.has(c.name))
  }, [castAssignmentProduct])

  const availableDirectorsForAssignment = useMemo(() => {
    if (!castAssignmentProduct) return []
    const assigned = new Set(castAssignmentProduct.selectedDirectors)
    return SEED_DIRECTORS.filter(d => !assigned.has(d.name))
  }, [castAssignmentProduct])

  const maxAssignCompanions = useMemo(() => {
    if (!castAssignmentProduct) return 0
    return Math.max(0, parseInt(castAssignmentProduct.companionCount || "0") - castAssignmentProduct.selectedCompanions.length)
  }, [castAssignmentProduct])

  const maxAssignDirectors = useMemo(() => {
    if (!castAssignmentProduct) return 0
    return Math.max(0, parseInt(castAssignmentProduct.directorCount || "0") - castAssignmentProduct.selectedDirectors.length)
  }, [castAssignmentProduct])

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

  const trinityGirlArrangementProducts = useMemo(() =>
    arrangementProducts.filter(p => p.eventType === "トリニティガール")
  , [arrangementProducts])

  const sloseleArrangementProducts = useMemo(() =>
    arrangementProducts.filter(p => p.eventType === "スロセレ")
  , [arrangementProducts])

  // ═══════════════════════════════════════════════════
  // タブ3: イベント終了処理
  // ═══════════════════════════════════════════════════

  const postEventProducts = useMemo(() =>
    allProducts.filter(p =>
      p.category === "イベント" &&
      p.executionStatus === "終了"
    )
  , [allProducts])

  // ═══════════════════════════════════════════════════
  // タブ4: 商材確認 — マネジメント部確認ステータスが「確認中」の商材
  // ═══════════════════════════════════════════════════

  const confirmationProducts = useMemo(() =>
    allProducts.filter(p => p.managementConfirmationStatus === "under-review")
  , [allProducts])

  const selectedConfirmationClientName = useMemo(() => {
    if (!selectedConfirmationProduct) return ""
    const project = allProjects.find(pj => pj.id === selectedConfirmationProduct.projectId)
    return project?.companyName ?? ""
  }, [selectedConfirmationProduct, allProjects])

  /** 確認モーダル表示用: Product → ProductFormState 変換 */
  const confirmationProductForm = useMemo(() =>
    selectedConfirmationProduct ? productToFormState(selectedConfirmationProduct) : null
  , [selectedConfirmationProduct])

  // ─── サマリー ───

  const summaryCounts = useMemo(() => ({
    castArrangement: tentativeEntryCount + confirmedEntryCount + undecidedCastRequests.length,
    arrangement: arrangementProducts.length,
    postEvent: postEventProducts.length,
    productConfirmation: confirmationProducts.length,
  }), [tentativeEntryCount, confirmedEntryCount, undecidedCastRequests, arrangementProducts, postEventProducts, confirmationProducts])

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

    // チャットメッセージとしても送信
    updates.chatMessages = [...(product.chatMessages ?? []), {
      channel: "BS・CS",
      author: "BS・CS",
      content: `【${statusLabel}】${holdFailureCastName}さん: ${holdFailureComment}`,
      timestamp: now,
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

  /** スロセレ: 対象機種入力フォームを顧客に送信（顧客入力をシミュレート） */
  const sendTargetMachineForm = useCallback((product: Product) => {
    const now = new Date().toISOString()
    // マスタからランダムに2〜3機種を選んで顧客入力をシミュレート
    const shuffled = [...SEED_MACHINE_MASTERS].sort(() => Math.random() - 0.5)
    const count = 2 + Math.floor(Math.random() * 2) // 2 or 3
    const picked = shuffled.slice(0, count)
    const targetMachineNames = picked.map(m => m.name)
    const pachitownMachineNames = picked.map(m => m.pachitownName)

    repository.updateProduct(product.id, {
      targetMachineFormSent: true,
      targetMachineFormSentDate: now.split("T")[0],
      targetMachineNames,
      pachitownMachineNames,
      statusHistory: [...(product.statusHistory ?? []), {
        status: "対象機種入力フォーム送信",
        timestamp: now,
        changedBy: "マネジメント部",
        note: "顧客へ対象機種入力フォームを送信",
      }],
    })
    setAutoArrangementToast("対象機種入力フォームを送信しました")
    refresh()
    setTimeout(() => setAutoArrangementToast(null), 3000)
  }, [repository, refresh])

  // ─── キャスト割り当てハンドラ ───

  const openCastAssignment = useCallback((product: Product) => {
    setCastAssignmentProduct(product)
    setSelectedAssignCompanions([])
    setSelectedAssignDirectors([])
    setShowCastAssignmentModal(true)
  }, [])

  const toggleAssignCompanion = useCallback((name: string) => {
    setSelectedAssignCompanions(prev => {
      if (prev.includes(name)) return prev.filter(n => n !== name)
      if (prev.length >= maxAssignCompanions) return prev
      return [...prev, name]
    })
  }, [maxAssignCompanions])

  const toggleAssignDirector = useCallback((name: string) => {
    setSelectedAssignDirectors(prev => {
      if (prev.includes(name)) return prev.filter(n => n !== name)
      if (prev.length >= maxAssignDirectors) return prev
      return [...prev, name]
    })
  }, [maxAssignDirectors])

  const submitCastAssignment = useCallback(() => {
    if (!castAssignmentProduct) return
    const product = castAssignmentProduct
    const updates: Partial<Product> = {}
    const now = new Date().toISOString()

    if (selectedAssignCompanions.length > 0) {
      updates.selectedCompanions = [...product.selectedCompanions, ...selectedAssignCompanions]
      const newStatus = { ...product.companionBookingStatus }
      for (const name of selectedAssignCompanions) {
        newStatus[name] = "tentative_requesting"
      }
      updates.companionBookingStatus = newStatus
    }

    if (selectedAssignDirectors.length > 0) {
      updates.selectedDirectors = [...product.selectedDirectors, ...selectedAssignDirectors]
      const newStatus = { ...product.directorBookingStatus }
      for (const name of selectedAssignDirectors) {
        newStatus[name] = "tentative_requesting"
      }
      updates.directorBookingStatus = newStatus
    }

    const assignedNames = [...selectedAssignCompanions, ...selectedAssignDirectors]
    updates.statusHistory = [...(product.statusHistory ?? []), {
      status: "キャスト割り当て",
      timestamp: now,
      changedBy: "マネジメント部",
      note: assignedNames.join("、"),
    }]

    updates.chatMessages = [...(product.chatMessages ?? []), {
      channel: "BS・CS",
      author: "BS・CS",
      content: `${assignedNames.join("、")}を割り当てました（仮押さえ依頼中）`,
      timestamp: now,
    }]

    repository.updateProduct(product.id, updates)
    setShowCastAssignmentModal(false)
    refresh()
  }, [castAssignmentProduct, selectedAssignCompanions, selectedAssignDirectors, repository, refresh])

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

  // ─── コスト入力 ───

  const costInputProjectName = useMemo(() => {
    if (!costInputProduct) return ""
    return getProjectForProduct(costInputProduct)?.projectName ?? ""
  }, [costInputProduct, getProjectForProduct])

  const costInputClientName = useMemo(() => {
    if (!costInputProduct) return ""
    return getProjectForProduct(costInputProduct)?.clientName ?? ""
  }, [costInputProduct, getProjectForProduct])

  const costInputEstimatedAmount = useMemo(() => {
    if (!costInputProduct) return 0
    return costInputProduct.estimatedBillingAmount ?? 0
  }, [costInputProduct])

  const openCostInput = useCallback((product: Product) => {
    setCostInputProduct(product)
    setCostInputAutoFilled(false)
    setCostInputItems([
      { item: "キャスティング費用", amount: String(product.castingCost ?? 0) },
      { item: "交通費", amount: String(product.transportationFee ?? 0) },
      { item: "宿泊費", amount: String(product.accommodationFee ?? 0) },
      { item: "PR費用", amount: String(product.postPRCost ?? 0) },
    ])
    setShowCostInputModal(true)
  }, [])

  const autoFillCostInput = useCallback(() => {
    if (!costInputProduct) return
    // マスタ参照: BillingSection と同じ計算ロジックを使って自動入力
    const companionCount = parseInt(costInputProduct.companionCount || "0")
    const directorCount = parseInt(costInputProduct.directorCount || "0")
    const castCount = companionCount + directorCount
    // 簡易的な自動入力（実際のキャスト時給×時間の概算）
    const hours = 7 // デフォルト稼働時間
    const castingCost = (companionCount * 3000 + directorCount * 4000) * hours
    const transportFee = castCount * 5000
    const accommodation = 0
    const prCost = 0
    setCostInputItems([
      { item: "キャスティング費用", amount: String(castingCost) },
      { item: "交通費", amount: String(transportFee) },
      { item: "宿泊費", amount: String(accommodation) },
      { item: "PR費用", amount: String(prCost) },
    ])
    setCostInputAutoFilled(true)
  }, [costInputProduct])

  const saveCostInput = useCallback(() => {
    if (!costInputProduct) return
    const findAmount = (label: string) =>
      parseInt(costInputItems.find(c => c.item === label)?.amount || "0") || 0

    repository.updateProduct(costInputProduct.id, {
      castingCost: findAmount("キャスティング費用"),
      transportationFee: findAmount("交通費"),
      accommodationFee: findAmount("宿泊費"),
      postPRCost: findAmount("PR費用"),
    })
    setShowCostInputModal(false)
    refresh()
  }, [costInputProduct, costInputItems, repository, refresh])

  const closeCostExportModal = useCallback(() => {
    setShowCostExportModal(false)
  }, [])

  // ═══════════════════════════════════════════════════
  // ハンドラ: 商材確認
  // ═══════════════════════════════════════════════════

  const openConfirmationDetail = useCallback((product: Product) => {
    setSelectedConfirmationProduct(product)
    setConfirmationComment("")
    setShowConfirmationDetailModal(true)
  }, [])

  const handleApproveProduct = useCallback(() => {
    if (!selectedConfirmationProduct) return
    const now = new Date().toISOString()
    const message: ChatMessage = {
      channel: "BS・CS",
      author: "BS・CS",
      content: `商材情報を承認しました（商材名: ${selectedConfirmationProduct.eventProductName || selectedConfirmationProduct.eventType}）`,
      timestamp: now,
    }
    repository.updateProduct(selectedConfirmationProduct.id, {
      managementConfirmationStatus: "approved",
      chatMessages: [...(selectedConfirmationProduct.chatMessages ?? []), message],
    })
    setShowConfirmationDetailModal(false)
    refresh()
  }, [selectedConfirmationProduct, repository, refresh])

  const handleRequestRevision = useCallback(() => {
    if (!selectedConfirmationProduct || !confirmationComment.trim()) return
    const now = new Date().toISOString()
    const chatMessage: ChatMessage = {
      channel: "BS・CS",
      author: "BS・CS",
      content: `【修正依頼】${confirmationComment}`,
      timestamp: now,
    }
    const comment = {
      author: "BS・CS",
      content: confirmationComment,
      timestamp: now,
    }
    repository.updateProduct(selectedConfirmationProduct.id, {
      managementConfirmationStatus: "revision-requested",
      chatMessages: [...(selectedConfirmationProduct.chatMessages ?? []), chatMessage],
      comments: [...(selectedConfirmationProduct.comments ?? []), comment],
    })
    setShowConfirmationDetailModal(false)
    refresh()
  }, [selectedConfirmationProduct, confirmationComment, repository, refresh])

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

  // チャットドロワー
  const [chatProductId, setChatProductId] = useState<number | null>(null)
  const [chatProductName, setChatProductName] = useState("")
  const [showChatDrawer, setShowChatDrawer] = useState(false)

  const openChatDrawer = useCallback((product: Product) => {
    setChatProductId(product.id)
    setChatProductName(product.eventProductName || product.eventType)
    setShowChatDrawer(true)
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
    undecidedCastRequests,
    // キャスト割り当て
    showCastAssignmentModal, setShowCastAssignmentModal,
    castAssignmentProduct, castAssignmentProjectName,
    availableCompanionsForAssignment, availableDirectorsForAssignment,
    maxAssignCompanions, maxAssignDirectors,
    selectedAssignCompanions, selectedAssignDirectors,
    openCastAssignment, toggleAssignCompanion, toggleAssignDirector, submitCastAssignment,
    productionNameRecord,
    completeCastHold, requestConfirmedHold,
    showHoldFailureModal, setShowHoldFailureModal, openHoldFailure, submitHoldFailure,
    holdFailureCastName, holdFailureComment, setHoldFailureComment,
    holdFailureProduct, holdFailureClientName,
    // 各種手配
    arrangementProducts,
    trinityGirlArrangementProducts, sloseleArrangementProducts,
    arrangementSubTab, setArrangementSubTab,
    showAutoArrangementModal, setShowAutoArrangementModal, openAutoArrangement,
    arrangementChecks, setArrangementChecks, executeAutoArrangement,
    autoArrangementToast,
    sendTargetMachineForm,
    // 衣装手配
    showCostumeModal, setShowCostumeModal, openCostumeArrangement, saveCostumeArrangement,
    costumeDraft, setCostumeDraft, companionSizeMap,
    // イベント終了処理
    postEventProducts,
    showSurveyResultModal, setShowSurveyResultModal, openSurveyResult,
    downloadSurveyCsv,
    // コスト入力
    showCostInputModal, setShowCostInputModal, openCostInput,
    costInputProduct, costInputProjectName, costInputClientName, costInputEstimatedAmount,
    costInputItems, setCostInputItems, costInputAutoFilled,
    autoFillCostInput, saveCostInput,
    showCostExportModal, setShowCostExportModal, downloadCostCsv, closeCostExportModal,
    costExportDateFrom, setCostExportDateFrom, costExportDateTo, setCostExportDateTo,
    costExportFormat, setCostExportFormat,
    costExportStatuses, setCostExportStatuses,
    costExportTargetProducts, costExportTotalAmount,
    // 商材確認
    confirmationProducts,
    showConfirmationDetailModal, setShowConfirmationDetailModal,
    selectedConfirmationProduct, selectedConfirmationClientName,
    confirmationProductForm,
    confirmationComment, setConfirmationComment,
    openConfirmationDetail, handleApproveProduct, handleRequestRevision,
    // チャット
    chatProductId, chatProductName, showChatDrawer, setShowChatDrawer, openChatDrawer,
    // 共通
    showStatusHistoryModal, setShowStatusHistoryModal, openStatusHistory,
  }
}

export type UseEventTeamDashboardReturn = ReturnType<typeof useEventTeamDashboard>
