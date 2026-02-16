"use client"

import { useState, useMemo, useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, DesignRequest } from "@/new/api/types"
import { PROPOSAL_STATUS_LABELS } from "@/new/api/display"
import type { ProposalStatus, BookingStatus } from "@/new/api/types"
import type { ProjectInfo, ProductSummary, CastSummary, DepartmentActivitySummary } from "@/new/features/project-detail/model/types"

export type UseProjectDetailArgs = {
  repository: ProjectRepository
  projectNumber: string
}

/** 受注確認モーダルに表示する仮押さえ完了キャスト情報 */
export type TentativeCompletedCast = {
  name: string
  role: "companion" | "director"
  roleLabel: string
}

/** デザイン依頼ステータスを解決 */
function resolveDesignStatus(requests: DesignRequest[]): DesignRequest["status"] | null {
  if (requests.length === 0) return null
  return requests[requests.length - 1].status
}

/** Product → CastSummary[] にマッピング */
function toCastSummaries(product: Product): CastSummary[] {
  const casts: CastSummary[] = []
  for (const name of product.selectedCompanions ?? []) {
    casts.push({ name, type: "コンパニオン", bookingStatus: product.companionBookingStatus?.[name] ?? "tentative_requesting" })
  }
  for (const name of product.selectedDirectors ?? []) {
    casts.push({ name, type: "ディレクター", bookingStatus: product.directorBookingStatus?.[name] ?? "tentative_requesting" })
  }
  for (const name of product.selectedMcs ?? []) {
    casts.push({ name, type: "MC", bookingStatus: product.mcBookingStatus?.[name] ?? "tentative_requesting" })
  }
  return casts
}

export function useProjectDetail({ repository, projectNumber }: UseProjectDetailArgs) {
  const router = useAppRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  // 受注確認モーダル
  const [orderReceivedTargetId, setOrderReceivedTargetId] = useState<number | null>(null)

  const projectInfo = useMemo<ProjectInfo | null>(() => {
    const project = repository.getProjectByProjectNumber(projectNumber)
    if (!project) return null

    return {
      projectNumber: project.projectNumber,
      projectName: project.projectName,
      companyId: project.companyId,
      companyName: project.companyName,
      hallId: project.hallId,
      hallName: project.hallName,
      salesPersonName: project.salesPersonName,
      requestDate: project.requestDate,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, projectNumber, refreshKey])

  const products = useMemo<ProductSummary[]>(() => {
    return repository.getProductsByProjectNumber(projectNumber).map((p) => {
      // デザイン依頼ステータスを解決
      const designRequests = repository.getDesignRequestsByProjectId(p.id)
      const posterReqs = designRequests.filter((dr) => dr.requestType === "poster")
      const dmReqs = designRequests.filter((dr) => dr.requestType === "dm")
      const winnerListReqs = designRequests.filter((dr) => dr.requestType === "winner-list")

      return {
        id: p.id,
        category: p.category,
        eventType: p.eventType,
        eventProductName: p.eventProductName,
        eventDate: p.eventDate,
        estimatedBillingAmount: p.estimatedBillingAmount,
        // ステータス
        proposalStatus: PROPOSAL_STATUS_LABELS[p.proposalStatus as ProposalStatus] ?? undefined,
        proposalStatusRaw: p.proposalStatus,
        readingCertainty: p.readingCertainty,
        executionStatus: p.executionStatus,
        // キャスト
        casts: toCastSummaries(p),
        // コメント
        comments: p.comments ?? [],
        commentCount: p.comments?.length ?? 0,
        // 合同抽選会
        dmMailing: p.dmMailing,
        posterStatus: resolveDesignStatus(posterReqs),
        dmStatus: resolveDesignStatus(dmReqs),
        winnerListStatus: resolveDesignStatus(winnerListReqs),
        prizeOrdered: !!p.prizeOrderedAt,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, projectNumber, refreshKey])

  // 部門連携サマリ
  const departmentActivity = useMemo<DepartmentActivitySummary>(() => {
    // キャスト集計
    const allCasts = products.flatMap((p) => p.casts)
    const namedCasts = allCasts.filter((c) => c.name !== "未定")
    const requesting = namedCasts.filter((c) => c.bookingStatus === "tentative_requesting" || c.bookingStatus === "confirmed_requesting").length
    const completed = namedCasts.filter((c) => c.bookingStatus === "tentative_completed" || c.bookingStatus === "confirmed_completed").length
    const failed = namedCasts.filter((c) => c.bookingStatus === "tentative_failed" || c.bookingStatus === "confirmed_failed").length

    // デザイン依頼集計
    const posterProducts = products.filter((p) => p.posterStatus !== null)
    const dmProducts = products.filter((p) => p.dmStatus !== null)
    const winnerListProducts = products.filter((p) => p.winnerListStatus !== null)

    // 景品集計（合同抽選会のみ対象）
    const lotteryProducts = products.filter((p) => p.category === "ポイント")

    // 修正依頼集計
    const productsWithComments = products.filter((p) => p.commentCount > 0)
    const totalComments = products.reduce((sum, p) => sum + p.commentCount, 0)

    return {
      cast: {
        total: namedCasts.length,
        requesting,
        completed,
        failed,
      },
      design: {
        poster: {
          total: posterProducts.length,
          requested: posterProducts.filter((p) => p.posterStatus === "requested").length,
          uploaded: posterProducts.filter((p) => p.posterStatus === "uploaded").length,
        },
        dm: {
          total: dmProducts.length,
          requested: dmProducts.filter((p) => p.dmStatus === "requested").length,
          uploaded: dmProducts.filter((p) => p.dmStatus === "uploaded").length,
        },
        winnerList: {
          total: winnerListProducts.length,
          requested: winnerListProducts.filter((p) => p.winnerListStatus === "requested").length,
          uploaded: winnerListProducts.filter((p) => p.winnerListStatus === "uploaded").length,
        },
      },
      prize: {
        total: lotteryProducts.length,
        ordered: lotteryProducts.filter((p) => p.prizeOrdered).length,
      },
      corrections: {
        productCount: productsWithComments.length,
        commentCount: totalComments,
      },
    }
  }, [products])

  const firstProductId = products.length > 0 ? products[0].id : undefined

  // 受注確認モーダル: 仮押さえ完了キャスト一覧
  const tentativeCompletedCasts = useMemo<TentativeCompletedCast[]>(() => {
    if (orderReceivedTargetId == null) return []
    const product = repository.getProductById(orderReceivedTargetId)
    if (!product) return []

    const casts: TentativeCompletedCast[] = []
    for (const [name, status] of Object.entries(product.companionBookingStatus ?? {})) {
      if (status === "tentative_completed") {
        casts.push({ name, role: "companion", roleLabel: "コンパニオン" })
      }
    }
    for (const [name, status] of Object.entries(product.directorBookingStatus ?? {})) {
      if (status === "tentative_completed") {
        casts.push({ name, role: "director", roleLabel: "ディレクター" })
      }
    }
    return casts
  }, [repository, orderReceivedTargetId])

  // 受注確認モーダル: 対象商材名
  const orderReceivedTargetProduct = useMemo<ProductSummary | undefined>(() => {
    if (orderReceivedTargetId == null) return undefined
    return products.find((p) => p.id === orderReceivedTargetId)
  }, [products, orderReceivedTargetId])

  // 受注ボタンクリック → モーダル表示
  const handleRequestOrderReceived = useCallback((productId: number) => {
    setOrderReceivedTargetId(productId)
  }, [])

  // 受注確認 → 実行
  const handleConfirmOrderReceived = useCallback(() => {
    if (orderReceivedTargetId == null) return
    const product = repository.getProductById(orderReceivedTargetId)
    if (!product) return

    // 仮押さえ完了 → 本押さえ依頼中 に更新
    const updatedCompanionBookingStatus = { ...product.companionBookingStatus }
    for (const [name, status] of Object.entries(updatedCompanionBookingStatus)) {
      if (status === "tentative_completed") {
        updatedCompanionBookingStatus[name] = "confirmed_requesting" as BookingStatus
      }
    }
    const updatedDirectorBookingStatus = { ...product.directorBookingStatus }
    for (const [name, status] of Object.entries(updatedDirectorBookingStatus)) {
      if (status === "tentative_completed") {
        updatedDirectorBookingStatus[name] = "confirmed_requesting" as BookingStatus
      }
    }

    repository.updateProduct(orderReceivedTargetId, {
      proposalStatus: "order-received",
      companionBookingStatus: updatedCompanionBookingStatus,
      directorBookingStatus: updatedDirectorBookingStatus,
    })

    setOrderReceivedTargetId(null)
    setRefreshKey((k) => k + 1)
  }, [repository, orderReceivedTargetId])

  // 受注確認キャンセル
  const handleCancelOrderReceived = useCallback(() => {
    setOrderReceivedTargetId(null)
  }, [])

  // 案件情報編集
  const handleEditProjectInfo = useCallback(() => {
    if (!firstProductId) return
    router.push(`/new/project-registration?mode=project-edit&productId=${firstProductId}`)
  }, [router, firstProductId])

  // 商材追加
  const handleAddProduct = useCallback(() => {
    if (!firstProductId) return
    router.push(`/new/project-registration?mode=product-add&productId=${firstProductId}`)
  }, [router, firstProductId])

  // 商材編集
  const handleEditProduct = useCallback((productId: number) => {
    router.push(`/new/project-registration?mode=product-edit&productId=${productId}`)
  }, [router])

  // 見積作成
  const handleCreateQuote = useCallback(() => {
    router.push(`/new/project-number/${projectNumber}/quote`)
  }, [router, projectNumber])

  // 戻る
  const handleBack = useCallback(() => {
    router.push("/new?role=Sales")
  }, [router])

  return {
    projectInfo,
    products,
    departmentActivity,
    // 受注確認
    orderReceivedModalOpen: orderReceivedTargetId != null,
    orderReceivedTargetProduct,
    tentativeCompletedCasts,
    onRequestOrderReceived: handleRequestOrderReceived,
    onConfirmOrderReceived: handleConfirmOrderReceived,
    onCancelOrderReceived: handleCancelOrderReceived,
    // ナビゲーション
    onUpdateProjectInfo: handleEditProjectInfo,
    onAddProduct: handleAddProduct,
    onEditProduct: handleEditProduct,
    onCreateQuote: handleCreateQuote,
    onBack: handleBack,
  }
}
