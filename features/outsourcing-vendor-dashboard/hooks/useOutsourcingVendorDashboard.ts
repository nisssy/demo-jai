"use client"

import { useState, useCallback, useMemo } from "react"
import type { ProjectData } from "@/types/project"
import { useProject } from "@/contexts/project-context"
import type { DemoProject } from "@/lib/demo-db/types"

export type UseOutsourcingVendorDashboardArgs = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  addNotification: (message: string) => void
}

/** 外注業者向けの進捗ステータス（表示順） */
export type ProductProgressStatus =
  | "not_started"      // 未対応
  | "report_uploaded"   // レポートアップロード済
  | "pachitown_linked"  // パチタウン連携済
  | "post_event_done"  // 事後データ入力済

const STATUS_LABELS: Record<ProductProgressStatus, string> = {
  not_started: "未対応",
  report_uploaded: "レポートアップロード済",
  pachitown_linked: "パチタウン連携済",
  post_event_done: "事後データ入力済",
}

const STATUS_ORDER: ProductProgressStatus[] = [
  "not_started",
  "report_uploaded",
  "pachitown_linked",
  "post_event_done",
]

export function getProductProgressStatus(p: DemoProject): ProductProgressStatus {
  const postResult = (p as any).postEventTransactionResult as string | undefined
  const postMachine = (p as any).postEventMachineData as string | undefined
  if ((postResult?.trim() ?? "") !== "" || (postMachine?.trim() ?? "") !== "") return "post_event_done"
  if ((p as any).pachitownLinked) return "pachitown_linked"
  if ((p as any).reportUploaded) return "report_uploaded"
  return "not_started"
}

export function getProductProgressStatusLabel(status: ProductProgressStatus): string {
  return STATUS_LABELS[status]
}

export function useOutsourcingVendorDashboard({
  projectData,
  setProjectData,
  addNotification,
}: UseOutsourcingVendorDashboardArgs) {
  const { getProducts, updateProduct } = useProject()
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  /** 依頼一覧にはスロセレかつステータスがイベント終了処理中の案件のみ表示する */
  const products = getProducts().filter((p) => {
    const row = p as { eventType?: string; projectStatus?: string }
    return row.eventType === "スロセレ" && row.projectStatus === "イベント終了処理中"
  })

  const selectedProduct = selectedProductId != null
    ? products.find((p) => p.id === selectedProductId) ?? null
    : null

  const clearSelection = useCallback(() => {
    setSelectedProductId(null)
  }, [])

  const handleReportUpload = useCallback(
    (productId: number, note: string) => {
      const at = new Date().toISOString()
      updateProduct(productId, {
        reportUploaded: true,
        reportUploadedAt: at,
        reportNote: note || undefined,
      })
      addNotification("レポートをアップロードしました。")
    },
    [updateProduct, addNotification]
  )

  const handlePachitownLink = useCallback(
    (productId: number) => {
      updateProduct(productId, {
        pachitownLinked: true,
        pachitownLinkedDate: new Date().toISOString().split("T")[0],
      })
      addNotification("パチタウンに連携しました。")
    },
    [updateProduct, addNotification]
  )

  const handlePostEventDataSave = useCallback(
    (productId: number, data: { transactionResult?: string; machineData?: string }) => {
      updateProduct(productId, {
        postEventTransactionResult: data.transactionResult,
        postEventMachineData: data.machineData,
      })
      addNotification("事後データを保存しました。商材データに反映されています。")
    },
    [updateProduct, addNotification]
  )

  const productsGroupedByStatus = useMemo(() => {
    const byStatus: Record<ProductProgressStatus, DemoProject[]> = {
      not_started: [],
      report_uploaded: [],
      pachitown_linked: [],
      post_event_done: [],
    }
    products.forEach((p) => {
      const status = getProductProgressStatus(p)
      byStatus[status].push(p)
    })
    return STATUS_ORDER.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      products: byStatus[status],
    }))
  }, [products])

  return {
    products,
    productsGroupedByStatus,
    selectedProductId,
    setSelectedProductId,
    selectedProduct,
    clearSelection,
    handleReportUpload,
    handlePachitownLink,
    handlePostEventDataSave,
    updateProduct,
    addNotification,
  }
}
