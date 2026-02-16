"use client"

import { useState, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, ProductProgressStatus, SurveyResult } from "@/new/api/types"

// ─── ViewModel ───

export type OutsourcingProductViewModel = {
  id: number
  projectNumber: string
  eventProductName: string
  eventDate: string
  progressStatus: ProductProgressStatus
  // アンケート
  surveyResult: SurveyResult | undefined
  // イベント写真
  eventPhotos: string[]
  // レポート
  reportUploaded: boolean
  reportUploadedAt: string | undefined
  // 事後データ
  postEventTransactionResult: string
  postEventMachineData: string
}

export type GroupedProducts = {
  status: ProductProgressStatus
  products: OutsourcingProductViewModel[]
}

export type UseOutsourcingVendorDashboardArgs = {
  repository: ProjectRepository
}

// ─── 進捗ステータス導出 ───

function deriveProgressStatus(product: Product): ProductProgressStatus {
  if (product.postEventTransactionResult || product.postEventMachineData) {
    return "post_event_done"
  }
  if (product.pachitownLinked) {
    return "pachitown_linked"
  }
  if (product.reportUploaded) {
    return "report_uploaded"
  }
  return "not_started"
}

// ─── Product → ViewModel ───

function toViewModel(product: Product): OutsourcingProductViewModel {
  return {
    id: product.id,
    projectNumber: product.projectNumber,
    eventProductName: product.eventProductName,
    eventDate: product.eventDate,
    progressStatus: deriveProgressStatus(product),
    surveyResult: product.surveyResult,
    eventPhotos: product.eventPhotos ?? [],
    reportUploaded: !!product.reportUploaded,
    reportUploadedAt: product.reportUploadedAt,
    postEventTransactionResult: product.postEventTransactionResult ?? "",
    postEventMachineData: product.postEventMachineData ?? "",
  }
}

// ─── ステータス表示順 ───

const STATUS_ORDER: ProductProgressStatus[] = [
  "not_started",
  "report_uploaded",
  "pachitown_linked",
  "post_event_done",
]

// ─── Hook ───

export function useOutsourcingVendorDashboard({ repository }: UseOutsourcingVendorDashboardArgs) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [transactionResultDraft, setTransactionResultDraft] = useState("")
  const [machineDataDraft, setMachineDataDraft] = useState("")

  // スロセレ商材かつ（イベント日が過去 OR executionStatus === "終了"）のみ
  const filteredProducts = useMemo(() => {
    const products = repository.getProducts()
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return products.filter((p) => {
      if (p.eventType !== "スロセレ") return false
      const isPastEvent = p.eventDate ? new Date(p.eventDate) < now : false
      const isFinished = p.executionStatus === "終了"
      return isPastEvent || isFinished
    })
  }, [repository])

  // ViewModel変換
  const productViewModels = useMemo(
    () => filteredProducts.map(toViewModel),
    [filteredProducts],
  )

  // ステータス別グループ化
  const groupedProducts = useMemo(() => {
    const groups: GroupedProducts[] = []
    for (const status of STATUS_ORDER) {
      const products = productViewModels.filter((p) => p.progressStatus === status)
      if (products.length > 0) {
        groups.push({ status, products })
      }
    }
    return groups
  }, [productViewModels])

  // 選択中の商材
  const selectedProduct = useMemo(
    () => productViewModels.find((p) => p.id === selectedProductId) ?? null,
    [productViewModels, selectedProductId],
  )

  // 商材選択時にドラフトを同期
  const handleSelectProduct = useCallback(
    (productId: number) => {
      setSelectedProductId(productId)
      const vm = productViewModels.find((p) => p.id === productId)
      if (vm) {
        setTransactionResultDraft(vm.postEventTransactionResult)
        setMachineDataDraft(vm.postEventMachineData)
      }
    },
    [productViewModels],
  )

  // レポートアップロード
  const handleUploadReport = useCallback(() => {
    if (selectedProductId === null) return
    repository.updateProduct(selectedProductId, {
      reportUploaded: true,
      reportUploadedAt: new Date().toISOString().split("T")[0],
    })
    // 再選択して状態を反映
    setSelectedProductId((prev) => prev)
  }, [repository, selectedProductId])

  // 事後データ保存
  const handleSavePostEventData = useCallback(() => {
    if (selectedProductId === null) return
    repository.updateProduct(selectedProductId, {
      postEventTransactionResult: transactionResultDraft || undefined,
      postEventMachineData: machineDataDraft || undefined,
    })
  }, [repository, selectedProductId, transactionResultDraft, machineDataDraft])

  return {
    groupedProducts,
    selectedProduct,
    selectedProductId,
    transactionResultDraft,
    machineDataDraft,
    onSelectProduct: handleSelectProduct,
    onTransactionResultChange: setTransactionResultDraft,
    onMachineDataChange: setMachineDataDraft,
    onUploadReport: handleUploadReport,
    onSavePostEventData: handleSavePostEventData,
  }
}
