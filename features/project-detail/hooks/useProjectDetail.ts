"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useProject } from "@/contexts/project-context"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectInfo, ProductSummary, ProjectDetailContainerProps } from "../model/types"

export function useProjectDetail({ projectNumber, addNotification }: ProjectDetailContainerProps) {
  const router = useAppRouter()
  const { getProjects, getProducts, updateProject } = useProject()

  const [isLoading, setIsLoading] = useState(true)

  // 案件情報を取得
  const projectInfo = useMemo<ProjectInfo | null>(() => {
    const projects = getProjects()
    const project = projects.find((p) => p.projectNumber === projectNumber)

    if (!project) return null

    return {
      projectNumber: project.projectNumber || "",
      projectName: project.projectName,
      companyId: project.companyId,
      companyName: project.companyName,
      hallId: project.hallCode,
      hallName: project.hallName,
      salesPersonName: (project as any).salesPersonName,
      requestDate: (project as any).requestDate,
    }
  }, [getProjects, projectNumber])

  // 商材一覧を取得
  const products = useMemo<ProductSummary[]>(() => {
    const allProducts = getProducts()
    return allProducts
      .filter((p) => p.projectNumber === projectNumber)
      .map((p) => ({
        id: p.id,
        category: (p as any).category || "",
        eventType: (p as any).eventType || "",
        eventProductName: (p as any).eventProductName,
        eventDate: (p as any).eventDate,
        projectStatus: (p as any).projectStatus,
        estimatedBillingAmount: (p as any).estimatedBillingAmount,
      }))
  }, [getProducts, projectNumber])

  useEffect(() => {
    setIsLoading(false)
  }, [])

  // 案件情報更新
  const handleUpdateProjectInfo = useCallback((updates: Partial<ProjectInfo>) => {
    // TODO: 案件情報の更新処理を実装
    addNotification?.("案件情報を更新しました")
  }, [addNotification])

  // 商材追加
  const handleAddProduct = useCallback(() => {
    router.replace(`/project-registration?projectNumber=${projectNumber}&mode=add`)
  }, [router, projectNumber])

  // 商材編集
  const handleEditProduct = useCallback((productId: number) => {
    router.replace(`/project/${productId}`)
  }, [router])

  // 戻る
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  return {
    projectInfo,
    products,
    isLoading,
    onUpdateProjectInfo: handleUpdateProjectInfo,
    onAddProduct: handleAddProduct,
    onEditProduct: handleEditProduct,
    onBack: handleBack,
  }
}
