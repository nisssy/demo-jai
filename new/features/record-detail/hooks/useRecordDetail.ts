"use client"

import { useMemo, useCallback, useState, useEffect } from "react"
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
  designOrdered: boolean
  prizeOrdered: boolean
  listConfirmed: boolean
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
      designOrdered: !!product.notificationOrderSentAt,
      prizeOrdered: !!product.prizeOrderRequestedAt,
      listConfirmed: !!product.winnerListValidatedAt,
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

  // PSP連携状態（localStorage永続化）
  const [pspLinked, setPspLinked] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    setPspLinked(localStorage.getItem(`psp_linked_${productId}`) === "1")
  }, [productId])
  const togglePsp = useCallback(() => {
    if (typeof window === "undefined") return
    setPspLinked((prev) => {
      const next = !prev
      localStorage.setItem(`psp_linked_${productId}`, next ? "1" : "0")
      return next
    })
  }, [productId])

  return {
    data,
    canEdit,
    handleBack,
    handleEdit,
    handleGoToProject,
    pspLinked,
    togglePsp,
  }
}
