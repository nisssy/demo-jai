"use client"

import { useMemo, useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, Project } from "@/new/api/types"
import { PROPOSAL_STATUS_LABELS, EXECUTION_STATUS_LABELS } from "@/new/api/display"
import type { ProposalStatus } from "@/new/api/types"

export type RecordDetailData = {
  product: Product
  project: Project
  proposalStatusLabel: string
  executionStatusLabel: string
}

export type UseRecordDetailArgs = {
  repository: ProjectRepository
  productId: number
}

export function useRecordDetail({ repository, productId }: UseRecordDetailArgs) {
  const router = useAppRouter()

  const data = useMemo<RecordDetailData | null>(() => {
    const product = repository.getProducts().find((p) => p.id === productId)
    if (!product) return null

    const project = repository.getProjectByProjectNumber(product.projectNumber)
    if (!project) return null

    return {
      product,
      project,
      proposalStatusLabel: PROPOSAL_STATUS_LABELS[product.proposalStatus as ProposalStatus] ?? product.proposalStatus,
      executionStatusLabel: product.executionStatus ? EXECUTION_STATUS_LABELS[product.executionStatus] : "-",
    }
  }, [repository, productId])

  const handleBack = useCallback(() => {
    router.push("/?role=Sales")
  }, [router])

  const handleEdit = useCallback(() => {
    router.push(`/new/project-registration?mode=product-edit&productId=${productId}`)
  }, [router, productId])

  const handleGoToProject = useCallback(() => {
    if (data) {
      router.push(`/new/project-number/${data.project.projectNumber}?role=Sales`)
    }
  }, [router, data])

  return {
    data,
    handleBack,
    handleEdit,
    handleGoToProject,
  }
}
