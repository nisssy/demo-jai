"use client"

import { useState, useMemo, useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { DesignRequest, Product } from "@/new/api/types"
import { PROPOSAL_STATUS_LABELS } from "@/new/api/display"
import type { ProposalStatus } from "@/new/api/types"
import type { BookingStatus } from "@/new/api/types"
import type { ProjectInfo, ProductSummary, CastSummary, DepartmentActivitySummary } from "@/new/features/project-detail/model/types"

export type UseProjectDetailArgs = {
  repository: ProjectRepository
  projectNumber: string
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
    casts.push({ productId: product.id, name, type: "コンパニオン", bookingStatus: product.companionBookingStatus?.[name] ?? "tentative_requesting" })
  }
  for (const name of product.selectedDirectors ?? []) {
    casts.push({ productId: product.id, name, type: "ディレクター", bookingStatus: product.directorBookingStatus?.[name] ?? "tentative_requesting" })
  }
  for (const name of product.selectedMcs ?? []) {
    casts.push({ productId: product.id, name, type: "MC", bookingStatus: product.mcBookingStatus?.[name] ?? "tentative_requesting" })
  }
  return casts
}

/** Product → 未定キャスト数にマッピング */
function toUndecidedCasts(product: Product): { type: string; count: number }[] {
  const result: { type: string; count: number }[] = []
  const companionCount = parseInt(product.companionCount || "0")
  const directorCount = parseInt(product.directorCount || "0")
  const mcCount = parseInt(product.mcCount || "0")
  const undecidedCompanions = Math.max(0, companionCount - (product.selectedCompanions?.length ?? 0))
  const undecidedDirectors = Math.max(0, directorCount - (product.selectedDirectors?.length ?? 0))
  const undecidedMcs = Math.max(0, mcCount - (product.selectedMcs?.length ?? 0))
  if (undecidedCompanions > 0) result.push({ type: "コンパニオン", count: undecidedCompanions })
  if (undecidedDirectors > 0) result.push({ type: "ディレクター", count: undecidedDirectors })
  if (undecidedMcs > 0) result.push({ type: "MC", count: undecidedMcs })
  return result
}

export function useProjectDetail({ repository, projectNumber }: UseProjectDetailArgs) {
  const router = useAppRouter()
  const [refreshKey, setRefreshKey] = useState(0)

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
        undecidedCasts: toUndecidedCasts(p),
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

  // キャスト予約ステータス変更（仮押さえ↔本押さえ）
  const handleUpdateCastBookingStatus = useCallback((productId: number, castName: string, castType: string, targetStatus: BookingStatus) => {
    const product = repository.getProducts().find(p => p.id === productId)
    if (!product) return

    const now = new Date().toISOString()
    const statusField = castType === "コンパニオン" ? "companionBookingStatus"
      : castType === "ディレクター" ? "directorBookingStatus"
      : "mcBookingStatus"

    const currentStatuses = { ...(product[statusField] ?? {}) }
    const previousStatus = currentStatuses[castName]
    currentStatuses[castName] = targetStatus

    // 依頼中から別の依頼に切り替えた場合は特別なメッセージ
    const wasRequesting = previousStatus === "tentative_requesting" || previousStatus === "confirmed_requesting"
    const actionLabel = targetStatus === "confirmed_requesting" ? "本押さえ依頼"
      : targetStatus === "tentative_requesting" ? "仮押さえ再依頼"
      : targetStatus

    const message = wasRequesting
      ? `【${actionLabel}】${castName}さん（${castType}）は仮押さえ依頼中でしたが、取り下げて${actionLabel}に変更しました`
      : `【${actionLabel}】${castName}さん（${castType}）の${actionLabel}を行いました`

    repository.updateProduct(productId, {
      [statusField]: currentStatuses,
      statusHistory: [
        ...(product.statusHistory ?? []),
        { status: actionLabel, timestamp: now, changedBy: "営業", note: `${castName}（${castType}）${wasRequesting ? "（依頼中から変更）" : ""}` },
      ],
      chatMessages: [
        ...(product.chatMessages ?? []),
        { channel: "BS・CS", author: "営業", content: message, timestamp: now },
      ],
    })
    setRefreshKey(k => k + 1)
  }, [repository])

  // 戻る
  const handleBack = useCallback(() => {
    router.push("/?role=Sales")
  }, [router])

  return {
    projectInfo,
    products,
    departmentActivity,
    // ナビゲーション
    onUpdateProjectInfo: handleEditProjectInfo,
    onAddProduct: handleAddProduct,
    onEditProduct: handleEditProduct,
    onCreateQuote: handleCreateQuote,
    onBack: handleBack,
    onUpdateCastBookingStatus: handleUpdateCastBookingStatus,
  }
}
