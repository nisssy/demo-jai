"use client"

import { useState, useCallback, useMemo } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Project, Product, ProductComment, Company, Hall, BookingStatus, ProposalStatus, ExecutionStatus, DesignRequest } from "@/new/api/types"
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
  // コメント
  comments?: ProductComment[]
  temporaryHoldFailureComment?: string
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
  const { projectsTabGroups, correctionsTabGroups, holdFailureTabGroups } = useMemo(() => {
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
    const correctionGroups: ProjectGroupViewModel[] = []
    const holdFailureGroups: ProjectGroupViewModel[] = []

    for (const [pn, prods] of productsByPn.entries()) {
      const project = projectMap.get(pn)
      if (!project) continue

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
        products: productVMs,
      }

      // 修正依頼タブ（コメントが存在する商材）
      const correctionProducts = productVMs.filter((p) => p.comments && p.comments.length > 0)
      if (correctionProducts.length > 0) {
        correctionGroups.push({ ...group, products: correctionProducts })
      }

      // 仮押さえ不可タブ（仮押さえ不可コメントが存在する商材）
      const holdFailureProducts = productVMs.filter((p) => p.temporaryHoldFailureComment)
      if (holdFailureProducts.length > 0) {
        holdFailureGroups.push({ ...group, products: holdFailureProducts })
      }

      // 案件一覧タブ（全件）
      allGroups.push(group)
    }

    // 作成日の降順でソート
    allGroups.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return {
      projectsTabGroups: allGroups,
      correctionsTabGroups: correctionGroups,
      holdFailureTabGroups: holdFailureGroups,
    }
  }, [repository])

  const correctionsCount = correctionsTabGroups.reduce((sum, g) => sum + g.products.length, 0)
  const holdFailureCount = holdFailureTabGroups.reduce((sum, g) => sum + g.products.length, 0)

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

  const handleClickCorrectionProduct = useCallback((productId: number) => {
    router.push(`/new/project/${productId}/correction?role=Sales`)
  }, [router])

  const handleClickHoldFailureProduct = useCallback((productId: number) => {
    router.push(`/new/project/${productId}?role=Sales`)
  }, [router])

  return {
    activeTab,
    setActiveTab,
    projectsTabGroups,
    correctionsTabGroups,
    holdFailureTabGroups,
    correctionsCount,
    holdFailureCount,
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
    handleClickCorrectionProduct,
    handleClickHoldFailureProduct,
  }
}
