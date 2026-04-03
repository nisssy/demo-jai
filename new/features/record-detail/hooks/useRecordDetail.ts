"use client"

import { useMemo, useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, Project } from "@/new/api/types"
import { PROPOSAL_STATUS_LABELS, EXECUTION_STATUS_LABELS } from "@/new/api/display"
import type { ProposalStatus } from "@/new/api/types"
import type { Role } from "@/new/types/role"

export type RecordDetailData = {
  product: Product
  project: Project
  proposalStatusLabel: string
  executionStatusLabel: string
}

export type UseRecordDetailArgs = {
  repository: ProjectRepository
  productId: number
  role: Role
}

export function useRecordDetail({ repository, productId, role }: UseRecordDetailArgs) {
  const router = useAppRouter()

  const canEdit = role === "Sales"

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
    router.push(`/?role=${role}`)
  }, [router, role])

  const handleEdit = useCallback(() => {
    router.push(`/new/project-registration?mode=product-edit&productId=${productId}`)
  }, [router, productId])

  const handleGoToProject = useCallback(() => {
    if (data) {
      router.push(`/new/project-number/${data.project.projectNumber}?role=${role}`)
    }
  }, [router, data, role])

  return {
    data,
    canEdit,
    handleBack,
    handleEdit,
    handleGoToProject,
  }
}
