"use client"

import { useState, useCallback, useMemo } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Project, Product, ProductComment, ChatMessage, Company, Hall, BookingStatus, ProposalStatus, ExecutionStatus, DesignRequest } from "@/new/api/types"
import type { ProjectListTab, FilterState, SavedSearchCondition } from "@/new/features/project-list/model/types"
import type { Role } from "@/new/types/role"
import { getCategoryByEventType } from "@/new/api/display"

/** Viewに渡す案件グループ表示用の型 */
export type ProductViewModel = {
  id: number
  projectNumber: string
  category: string
  eventType: string
  eventProductName: string
  eventDate: string
  estimatedBillingAmount: number
  proposalStatus: ProposalStatus
  readingCertainty?: "A" | "B" | "C"
  // キャスト（マッピング済み）
  casts: { name: string; type: string; bookingStatus: BookingStatus }[]
  undecidedCasts: { type: string; count: number }[]
  // コメント・チャット
  comments?: ProductComment[]
  temporaryHoldFailureComment?: string
  chatMessages?: ChatMessage[]
  /** 営業以外からの最新メッセージ（新着メッセージタブ用） */
  latestIncomingMessage?: { author: string; content: string; timestamp: string }
  // 合同抽選会
  executionStatus?: ExecutionStatus
  dmMailing?: "yes" | "no"
  posterStatus: DesignRequest["status"] | null
  dmStatus: DesignRequest["status"] | null
  winnerListStatus: DesignRequest["status"] | null
  prizeOrdered: boolean
  threeSetPlan: boolean
  designOrdered: boolean
  listConfirmed: boolean
}

export type ProjectGroupViewModel = {
  projectNumber: string
  projectName: string
  companyName: string
  companyId: string
  hallName: string
  hallId: string
  salesPersonName: string
  requestDate: string
  createdAt: string
  products: ProductViewModel[]
}

export type UseProjectListArgs = {
  repository: ProjectRepository
  role?: Role
}

const INITIAL_FILTERS: FilterState = {
  projectNumber: "",
  projectNo: "",
  recordNumber: "",
  projectName: "",
  salesPersonId: "",
  dateMode: "execution",
  dateFrom: "",
  dateTo: "",
  category: "",
  eventType: "",
  hallName: "",
  companyId: "",
  prefectures: [],
  areas: [],
  departments: [],
  statuses: [],
  executionStatuses: [],
  designOrderStatuses: [],
  prizeOrderStatuses: [],
  listConfirmStatuses: [],
  adminPersonId: "",
  insightPersonName: "",
}

const SAVED_CONDITIONS_KEY = "saved_search_conditions"

function loadSavedConditions(): SavedSearchCondition[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(SAVED_CONDITIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveSavedConditions(conditions: SavedSearchCondition[]) {
  localStorage.setItem(SAVED_CONDITIONS_KEY, JSON.stringify(conditions))
}

const FILTER_PERSISTENCE_KEY = "project_list_filters"

function loadPersistedFilters(): FilterState | null {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem(FILTER_PERSISTENCE_KEY)
    if (!data) return null
    const parsed = JSON.parse(data)
    // 古いデータに新フィールドが欠落している場合をINITIAL_FILTERSで補完
    return { ...INITIAL_FILTERS, ...parsed }
  } catch {
    return null
  }
}

/** Product → ProductViewModel にマッピング */
function toProductViewModel(product: Product, designStatuses: { poster: DesignRequest["status"] | null; dm: DesignRequest["status"] | null; winnerList: DesignRequest["status"] | null }): ProductViewModel {
  const casts: ProductViewModel["casts"] = []

  for (const name of product.selectedCompanions ?? []) {
    casts.push({ name, type: "コンパニオン", bookingStatus: product.companionBookingStatus?.[name] ?? "tentative_requesting" })
  }
  for (const name of product.selectedDirectors ?? []) {
    casts.push({ name, type: "ディレクター", bookingStatus: product.directorBookingStatus?.[name] ?? "tentative_requesting" })
  }
  for (const name of product.selectedMcs ?? []) {
    casts.push({ name, type: "MC", bookingStatus: product.mcBookingStatus?.[name] ?? "tentative_requesting" })
  }

  // 未定キャスト数
  const undecidedCasts: ProductViewModel["undecidedCasts"] = []
  const companionCount = parseInt(product.companionCount || "0")
  const directorCount = parseInt(product.directorCount || "0")
  const mcCount = parseInt(product.mcCount || "0")
  const undecidedCompanions = Math.max(0, companionCount - (product.selectedCompanions?.length ?? 0))
  const undecidedDirectors = Math.max(0, directorCount - (product.selectedDirectors?.length ?? 0))
  const undecidedMcs = Math.max(0, mcCount - (product.selectedMcs?.length ?? 0))
  if (undecidedCompanions > 0) undecidedCasts.push({ type: "コンパニオン", count: undecidedCompanions })
  if (undecidedDirectors > 0) undecidedCasts.push({ type: "ディレクター", count: undecidedDirectors })
  if (undecidedMcs > 0) undecidedCasts.push({ type: "MC", count: undecidedMcs })

  // 営業以外からの最新受信メッセージを特定
  const incomingMessages: { author: string; content: string; timestamp: string }[] = []
  for (const msg of product.chatMessages ?? []) {
    if (msg.author !== "営業") {
      incomingMessages.push({ author: msg.author, content: msg.content, timestamp: msg.timestamp })
    }
  }
  for (const comment of product.comments ?? []) {
    if (comment.author !== "営業") {
      incomingMessages.push({ author: comment.author, content: comment.content, timestamp: comment.timestamp })
    }
  }
  incomingMessages.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return {
    id: product.id,
    projectNumber: product.projectNumber,
    category: product.category,
    eventType: product.eventType,
    eventProductName: product.eventProductName,
    eventDate: product.eventDate,
    estimatedBillingAmount: product.estimatedBillingAmount,
    proposalStatus: product.proposalStatus,
    casts,
    undecidedCasts,
    comments: product.comments,
    temporaryHoldFailureComment: product.temporaryHoldFailureComment,
    chatMessages: product.chatMessages,
    latestIncomingMessage: incomingMessages[0] ?? undefined,
    executionStatus: product.executionStatus,
    dmMailing: product.dmMailing,
    posterStatus: designStatuses.poster,
    dmStatus: designStatuses.dm,
    winnerListStatus: designStatuses.winnerList,
    readingCertainty: product.readingCertainty,
    prizeOrdered: !!product.prizeOrderedAt,
    threeSetPlan: !!product.threeSetPlan,
    designOrdered: !!product.notificationOrderSentAt,
    listConfirmed: !!product.winnerListValidatedAt,
  }
}

/** デザイン依頼ステータスを解決（エンティティの型付き値またはnullを返す） */
function resolveDesignStatus(requests: { status: DesignRequest["status"] }[]): DesignRequest["status"] | null {
  if (requests.length === 0) return null
  const latest = requests[requests.length - 1]
  return latest.status
}

export function useProjectList({ repository, role = "Sales" }: UseProjectListArgs) {
  const router = useAppRouter()
  const [activeTab, setActiveTab] = useState<ProjectListTab>("projects")
  const [filters, setFiltersRaw] = useState<FilterState>(() => loadPersistedFilters() ?? INITIAL_FILTERS)
  const [savedConditions, setSavedConditionsState] = useState<SavedSearchCondition[]>(() => loadSavedConditions())
  const [addProductModalOpen, setAddProductModalOpen] = useState(false)

  // フィルタ変更時にlocalStorageに保持
  const setFilters = useCallback((f: FilterState | ((prev: FilterState) => FilterState)) => {
    setFiltersRaw((prev) => {
      const next = typeof f === "function" ? f(prev) : f
      localStorage.setItem(FILTER_PERSISTENCE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // 検索条件の保存
  const handleSaveCondition = useCallback((name: string) => {
    const newCondition: SavedSearchCondition = {
      id: crypto.randomUUID(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    }
    const updated = [...savedConditions, newCondition]
    setSavedConditionsState(updated)
    saveSavedConditions(updated)
  }, [filters, savedConditions])

  // 検索条件の削除
  const handleDeleteCondition = useCallback((id: string) => {
    const updated = savedConditions.filter((c) => c.id !== id)
    setSavedConditionsState(updated)
    saveSavedConditions(updated)
  }, [savedConditions])

  // 検索条件の適用
  const handleApplyCondition = useCallback((id: string) => {
    const condition = savedConditions.find((c) => c.id === id)
    if (condition) {
      setFilters({ ...INITIAL_FILTERS, ...condition.filters })
    }
  }, [savedConditions, setFilters])

  // 検索条件のエクスポート（CSV）
  const handleExportConditions = useCallback(() => {
    const headers = ["名前", "案件番号", "レコード番号", "案件名", "商材区分", "商材名", "ステータス", "保存日時"]
    const rows = savedConditions.map((c) => [
      c.name,
      c.filters.projectNumber,
      c.filters.recordNumber,
      c.filters.projectName,
      c.filters.category,
      c.filters.eventType,
      c.filters.statuses.join("/"),
      c.createdAt,
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `検索条件_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [savedConditions])

  // 法人検索のUI状態
  const [companySearchOpen, setCompanySearchOpen] = useState(false)
  const [companySearchQuery, setCompanySearchQuery] = useState("")

  // ホール検索のUI状態
  const [hallSearchOpen, setHallSearchOpen] = useState(false)
  const [hallSearchQuery, setHallSearchQuery] = useState("")

  // マスタデータ
  const allCompanies = useMemo(() => repository.getCompanies(), [repository])
  const allHalls = useMemo(() => repository.getHalls(), [repository])
  const allEmployees = useMemo(() => repository.getEmployees(), [repository])

  // 法人検索のフィルタ済みリスト
  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery) return allCompanies
    const q = companySearchQuery.toLowerCase()
    return allCompanies.filter((c) => c.name.toLowerCase().includes(q))
  }, [allCompanies, companySearchQuery])

  // ホール検索のフィルタ済みリスト
  const filteredHalls = useMemo(() => {
    if (!hallSearchQuery) return allHalls
    const q = hallSearchQuery.toLowerCase()
    return allHalls.filter((h) => h.name.toLowerCase().includes(q))
  }, [allHalls, hallSearchQuery])

  const getCompanyByCompanyId = useCallback(
    (companyId: string): Company | undefined => allCompanies.find((c) => c.companyId === companyId),
    [allCompanies],
  )

  // 法人選択ハンドラ
  const handleSelectCompany = useCallback((companyId: string) => {
    setFilters((prev) => ({ ...prev, companyId }))
    setCompanySearchOpen(false)
    setCompanySearchQuery("")
  }, [setFilters])

  // ホール選択ハンドラ
  const handleSelectHall = useCallback((hallName: string) => {
    setFilters((prev) => ({ ...prev, hallName }))
    setHallSearchOpen(false)
    setHallSearchQuery("")
  }, [setFilters])

  // リポジトリからデータ取得 + ViewModel変換
  const { projectsTabGroups, messagesTabGroups } = useMemo(() => {
    const projects = repository.getProjects()
    const products = repository.getProducts()

    // 案件番号 → Project のマップ
    const projectMap = new Map<string, Project>()
    for (const p of projects) {
      projectMap.set(p.projectNumber, p)
    }

    // 案件番号 → Product[] のマップ
    const productsByPn = new Map<string, Product[]>()
    for (const prod of products) {
      const list = productsByPn.get(prod.projectNumber) ?? []
      list.push(prod)
      productsByPn.set(prod.projectNumber, list)
    }

    // グループ構築 & 振り分け
    const allGroups: ProjectGroupViewModel[] = []
    const messageGroups: ProjectGroupViewModel[] = []

    for (const [pn, prods] of productsByPn.entries()) {
      const project = projectMap.get(pn)
      if (!project) continue

      // 案件レベルのフィルタ
      if (filters.projectNumber && !project.projectNumber.includes(filters.projectNumber)) continue
      if (filters.projectName && !project.projectName.includes(filters.projectName)) continue
      if (filters.hallName && project.hallName !== filters.hallName) continue
      if (filters.companyId && project.companyId !== filters.companyId) continue
      if (filters.salesPersonId && !project.salesPersonName.includes(filters.salesPersonId)) continue

      // インサイト担当フィルタ
      if (filters.insightPersonName) {
        const hall = allHalls.find((h) => h.name === project.hallName)
        if (!hall?.insightPersonName || !hall.insightPersonName.includes(filters.insightPersonName)) continue
      }

      // 都道府県フィルタ
      if (filters.prefectures.length > 0) {
        const hall = allHalls.find((h) => h.name === project.hallName)
        if (!hall?.prefecture || !filters.prefectures.includes(hall.prefecture)) continue
      }

      // 担当エリアフィルタ
      if (filters.areas.length > 0) {
        const hall = allHalls.find((h) => h.name === project.hallName)
        if (!hall?.area || !filters.areas.includes(hall.area)) continue
      }

      // 部署フィルタ（営業担当者の部署で絞り込み）
      if (filters.departments.length > 0) {
        const employee = allEmployees.find((e) => e.name === project.salesPersonName)
        if (!employee?.department || !filters.departments.includes(employee.department)) continue
      }

      // レコード番号フィルタ（商材IDで検索）
      if (filters.recordNumber) {
        const hasMatchingRecord = prods.some((p) => String(p.id).includes(filters.recordNumber))
        if (!hasMatchingRecord) continue
      }

      const productVMs = prods.map((prod) => {
        const designRequests = repository.getDesignRequestsByProjectId(prod.id)
        const posterReqs = designRequests.filter((dr) => dr.requestType === "poster")
        const dmReqs = designRequests.filter((dr) => dr.requestType === "dm")
        const winnerListReqs = designRequests.filter((dr) => dr.requestType === "winner-list")

        return toProductViewModel(prod, {
          poster: resolveDesignStatus(posterReqs),
          dm: resolveDesignStatus(dmReqs),
          winnerList: resolveDesignStatus(winnerListReqs),
        })
      })

      // 商材レベルのフィルタ（カテゴリ・商材名・日付・ステータス）
      const filteredProducts = productVMs.filter((p) => {
        if (filters.category && p.category !== filters.category) return false
        if (filters.eventType && !p.eventType.includes(filters.eventType) && !p.eventProductName.includes(filters.eventType)) return false
        // ステータス（提案ステータス）フィルタ
        if (filters.statuses.length > 0) {
          const proposalLabel = p.proposalStatus === "order-received" ? "受注済み"
            : p.proposalStatus === "proposing" ? "提案中" : "提案前"
          if (!filters.statuses.includes(proposalLabel)) return false
        }
        // 実施ステータスフィルタ
        if (filters.executionStatuses.length > 0) {
          if (!p.executionStatus || !filters.executionStatuses.includes(p.executionStatus)) return false
        }
        // 当選デザイン依頼フィルタ
        if (filters.designOrderStatuses.length > 0) {
          const label = p.designOrdered ? "依頼済み" : "未依頼"
          if (!filters.designOrderStatuses.includes(label)) return false
        }
        // 景品発注依頼フィルタ
        if (filters.prizeOrderStatuses.length > 0) {
          const label = p.prizeOrdered ? "発注済み" : "未発注"
          if (!filters.prizeOrderStatuses.includes(label)) return false
        }
        // リスト確認フィルタ
        if (filters.listConfirmStatuses.length > 0) {
          const label = p.listConfirmed ? "確認済み" : "未確認"
          if (!filters.listConfirmStatuses.includes(label)) return false
        }
        if (filters.adminPersonId) {
          const product = repository.getProductById(p.id)
          if (!product?.adminPersonId) return false
          const adminEmp = allEmployees.find((e) => e.id === product.adminPersonId)
          if (!adminEmp?.name || !adminEmp.name.includes(filters.adminPersonId)) return false
        }
        if (filters.dateFrom || filters.dateTo) {
          const dateValue = filters.dateMode === "execution" ? p.eventDate : project.createdAt
          if (dateValue) {
            const d = dateValue.replace(/\//g, "-").slice(0, 10)
            if (filters.dateFrom && d < filters.dateFrom) return false
            if (filters.dateTo && d > filters.dateTo) return false
          } else {
            // 日付がない商材はフィルタ時に除外
            if (filters.dateFrom || filters.dateTo) return false
          }
        }
        return true
      })

      // フィルタ後に商材が0件なら案件ごとスキップ
      if (filteredProducts.length === 0) continue

      const group: ProjectGroupViewModel = {
        projectNumber: project.projectNumber,
        projectName: project.projectName,
        companyName: project.companyName,
        companyId: project.companyId,
        hallName: project.hallName,
        hallId: project.hallId,
        salesPersonName: project.salesPersonName,
        requestDate: project.requestDate,
        createdAt: project.createdAt,
        products: filteredProducts,
      }

      // 新着メッセージタブ（営業以外からのメッセージがある商材）
      const messageProducts = productVMs.filter((p) => p.latestIncomingMessage)
      if (messageProducts.length > 0) {
        // 最新メッセージ順にソート
        const sorted = [...messageProducts].sort((a, b) =>
          (b.latestIncomingMessage?.timestamp ?? "").localeCompare(a.latestIncomingMessage?.timestamp ?? "")
        )
        messageGroups.push({ ...group, products: sorted })
      }

      // 案件一覧タブ（全件）
      allGroups.push(group)
    }

    // 作成日の降順でソート
    allGroups.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    // メッセージグループは最新メッセージの新しい順
    messageGroups.sort((a, b) => {
      const aTs = a.products[0]?.latestIncomingMessage?.timestamp ?? ""
      const bTs = b.products[0]?.latestIncomingMessage?.timestamp ?? ""
      return bTs.localeCompare(aTs)
    })

    return {
      projectsTabGroups: allGroups,
      messagesTabGroups: messageGroups,
    }
  }, [repository, filters, allHalls, allEmployees])

  const messagesCount = messagesTabGroups.reduce((sum, g) => sum + g.products.length, 0)

  // ナビゲーション
  const handleCreateNewProject = useCallback(() => {
    const params = new URLSearchParams()
    if (filters.companyId) {
      params.set("companyId", filters.companyId)
      const company = getCompanyByCompanyId(filters.companyId)
      if (company) params.set("companyName", company.name)
    }
    if (filters.hallName) {
      params.set("hallName", filters.hallName)
      const hall = allHalls.find((h) => h.name === filters.hallName)
      if (hall) {
        params.set("hallId", hall.hallId)
        // ホールから法人を自動解決（法人フィルタが未設定の場合）
        if (!filters.companyId) {
          const company = allCompanies.find((c) => c.id === hall.companyId)
          if (company) {
            params.set("companyId", company.companyId)
            params.set("companyName", company.name)
          }
        }
      }
    }
    if (filters.salesPersonId) params.set("salesPersonName", filters.salesPersonId)
    if (filters.category) params.set("category", filters.category)
    if (filters.eventType) {
      params.set("eventType", filters.eventType)
      // 商材名から商材区分を自動解決（商材区分フィルタが未設定の場合）
      if (!filters.category) {
        const category = getCategoryByEventType(filters.eventType)
        if (category) params.set("category", category)
      }
    }
    const qs = params.toString()
    router.push(`/new/project-registration${qs ? `?${qs}` : ""}`)
  }, [router, filters, getCompanyByCompanyId, allHalls, allCompanies])

  const handleClickDetail = useCallback((projectNumber: string) => {
    router.push(`/new/project-number/${projectNumber}?role=${role}`)
  }, [router, role])

  const handleClickProduct = useCallback((productId: number) => {
    router.push(`/new/project/${productId}?role=${role}`)
  }, [router, role])

  const handleClickMessageProduct = useCallback((productId: number) => {
    router.push(`/new/project-registration?mode=product-edit&productId=${productId}`)
  }, [router])

  // レコード詳細（商材詳細）への遷移
  const handleClickRecord = useCallback((productId: number) => {
    router.push(`/new/project/${productId}?role=${role}`)
  }, [router, role])

  // 新規商材追加後の遷移
  const handleProductCreated = useCallback((productId: number) => {
    router.push(`/new/project-registration?mode=product-edit&productId=${productId}`)
  }, [router])

  // 複製後の遷移
  const handleDuplicated = useCallback((newProjectNumber: string) => {
    router.push(`/new/project-number/${newProjectNumber}?role=${role}`)
  }, [router, role])

  return {
    activeTab,
    setActiveTab,
    projectsTabGroups,
    messagesTabGroups,
    messagesCount,
    filters,
    setFilters,
    // 法人検索
    companySearchOpen,
    setCompanySearchOpen,
    companySearchQuery,
    setCompanySearchQuery,
    filteredCompanies,
    getCompanyByCompanyId,
    handleSelectCompany,
    // ホール検索
    hallSearchOpen,
    setHallSearchOpen,
    hallSearchQuery,
    setHallSearchQuery,
    filteredHalls,
    handleSelectHall,
    // 検索条件管理
    savedConditions,
    handleSaveCondition,
    handleDeleteCondition,
    handleApplyCondition,
    handleExportConditions,
    // ナビゲーション
    handleCreateNewProject,
    handleClickDetail,
    handleClickProduct,
    handleClickRecord,
    handleClickMessageProduct,
    handleProductCreated,
    handleDuplicated,
    addProductModalOpen,
    setAddProductModalOpen,
    repository,
    allEmployees,
  }
}
