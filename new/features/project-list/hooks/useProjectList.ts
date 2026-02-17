"use client"

import { useState, useCallback, useMemo } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Project, Product, ProductComment, ChatMessage, Company, Hall, BookingStatus, ProposalStatus, ExecutionStatus, DesignRequest } from "@/new/api/types"
import type { ProjectListTab, FilterState } from "@/new/features/project-list/model/types"

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
}

const INITIAL_FILTERS: FilterState = {
  projectNumber: "",
  projectName: "",
  salesPersonId: "",
  dateMode: "execution",
  dateFrom: "",
  dateTo: "",
  category: "",
  eventType: "",
  hallName: "",
  companyId: "",
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
  }
}

/** デザイン依頼ステータスを解決（エンティティの型付き値またはnullを返す） */
function resolveDesignStatus(requests: { status: DesignRequest["status"] }[]): DesignRequest["status"] | null {
  if (requests.length === 0) return null
  const latest = requests[requests.length - 1]
  return latest.status
}

export function useProjectList({ repository }: UseProjectListArgs) {
  const router = useAppRouter()
  const [activeTab, setActiveTab] = useState<ProjectListTab>("projects")
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)

  // 法人/ホール検索のUI状態
  const [companyHallSearchOpen, setCompanyHallSearchOpen] = useState(false)
  const [companyHallSearchType, setCompanyHallSearchType] = useState<"hall" | "company">("company")
  const [companyHallSearchQuery, setCompanyHallSearchQuery] = useState("")

  // マスタデータ
  const allCompanies = useMemo(() => repository.getCompanies(), [repository])
  const allHalls = useMemo(() => repository.getHalls(), [repository])

  // 法人/ホール検索のフィルタ済みリスト
  const filteredCompanies = useMemo(() => {
    if (!companyHallSearchQuery) return allCompanies
    const q = companyHallSearchQuery.toLowerCase()
    return allCompanies.filter((c) => c.name.toLowerCase().includes(q))
  }, [allCompanies, companyHallSearchQuery])

  const filteredHalls = useMemo(() => {
    if (!companyHallSearchQuery) return allHalls
    const q = companyHallSearchQuery.toLowerCase()
    return allHalls.filter((h) => h.name.toLowerCase().includes(q))
  }, [allHalls, companyHallSearchQuery])

  const getCompanyByCompanyId = useCallback(
    (companyId: string): Company | undefined => allCompanies.find((c) => c.companyId === companyId),
    [allCompanies],
  )

  // 法人/ホール選択ハンドラ
  const handleSelectHall = useCallback((hallName: string) => {
    setFilters((prev) => ({ ...prev, hallName, companyId: "" }))
    setCompanyHallSearchOpen(false)
    setCompanyHallSearchQuery("")
  }, [])

  const handleSelectCompany = useCallback((companyId: string) => {
    setFilters((prev) => ({ ...prev, companyId, hallName: "" }))
    setCompanyHallSearchOpen(false)
    setCompanyHallSearchQuery("")
  }, [])

  const handleCompanyHallSearchTypeChange = useCallback((type: "hall" | "company") => {
    setCompanyHallSearchType(type)
    setFilters((prev) => ({ ...prev, hallName: "", companyId: "" }))
    setCompanyHallSearchQuery("")
  }, [])

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

      // 商材レベルのフィルタ（カテゴリ・イベント区分・日付）
      const filteredProducts = productVMs.filter((p) => {
        if (filters.category && p.category !== filters.category) return false
        if (filters.eventType && p.eventType !== filters.eventType) return false
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
  }, [repository, filters])

  const messagesCount = messagesTabGroups.reduce((sum, g) => sum + g.products.length, 0)

  // ナビゲーション
  const handleCreateNewProject = useCallback(() => {
    router.push("/new/project-registration")
  }, [router])

  const handleClickDetail = useCallback((projectNumber: string) => {
    router.push(`/new/project-number/${projectNumber}?role=Sales`)
  }, [router])

  const handleClickProduct = useCallback((productId: number) => {
    router.push(`/new/project/${productId}?role=Sales`)
  }, [router])

  const handleClickMessageProduct = useCallback((productId: number) => {
    router.push(`/new/project-registration?mode=product-edit&productId=${productId}`)
  }, [router])

  return {
    activeTab,
    setActiveTab,
    projectsTabGroups,
    messagesTabGroups,
    messagesCount,
    filters,
    setFilters,
    // 法人/ホール検索
    companyHallSearchOpen,
    setCompanyHallSearchOpen,
    companyHallSearchType,
    companyHallSearchQuery,
    setCompanyHallSearchQuery,
    filteredCompanies,
    filteredHalls,
    getCompanyByCompanyId,
    handleSelectHall,
    handleSelectCompany,
    handleCompanyHallSearchTypeChange,
    // ナビゲーション
    handleCreateNewProject,
    handleClickDetail,
    handleClickProduct,
    handleClickMessageProduct,
  }
}
