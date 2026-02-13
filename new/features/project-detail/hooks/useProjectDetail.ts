"use client"

import { useMemo, useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectRepository } from "@/new/api/project-repository"
import { PROPOSAL_STATUS_LABELS } from "@/new/api/display"
import type { ProposalStatus } from "@/new/api/types"
import type { ProjectInfo, ProductSummary } from "@/new/features/project-detail/model/types"

export type UseProjectDetailArgs = {
  repository: ProjectRepository
  projectNumber: string
}

export function useProjectDetail({ repository, projectNumber }: UseProjectDetailArgs) {
  const router = useAppRouter()

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
  }, [repository, projectNumber])

  const products = useMemo<ProductSummary[]>(() => {
    return repository.getProductsByProjectNumber(projectNumber).map((p) => ({
      id: p.id,
      category: p.category,
      eventType: p.eventType,
      eventProductName: p.eventProductName,
      eventDate: p.eventDate,
      proposalStatus: PROPOSAL_STATUS_LABELS[p.proposalStatus as ProposalStatus] ?? undefined,
      estimatedBillingAmount: p.estimatedBillingAmount,
    }))
  }, [repository, projectNumber])

  const firstProductId = products.length > 0 ? products[0].id : undefined

  // 案件情報編集
  const handleEditProjectInfo = useCallback(() => {
    if (!firstProductId) return
    router.push(`/new/project-registration?mode=edit&productId=${firstProductId}`)
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

  // 戻る
  const handleBack = useCallback(() => {
    router.push("/new?role=Sales")
  }, [router])

  return {
    projectInfo,
    products,
    onUpdateProjectInfo: handleEditProjectInfo,
    onAddProduct: handleAddProduct,
    onEditProduct: handleEditProduct,
    onBack: handleBack,
  }
}
