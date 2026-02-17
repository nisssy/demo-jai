"use client"

import { useState, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, SurveyResult, SlotReport, SlotMachineReportEntry } from "@/new/api/types"

// ─── ViewModel ───

export type OutsourcingProductViewModel = {
  id: number
  projectNumber: string
  eventProductName: string
  eventDate: string
  executionStatus: string
  // 案件情報
  hallName: string
  targetMachineNames: string[]
  // アンケート
  surveyResult: SurveyResult | undefined
  // イベント写真
  eventPhotos: string[]
  // 構造化レポート
  interimReport: SlotReport | undefined
  postEventReport: SlotReport | undefined
}

export type PhaseGroup = {
  phase: "during-event" | "post-event"
  products: OutsourcingProductViewModel[]
}

/** 構造化レポートのドラフト状態 */
export type SlotReportDraft = {
  slot20Count: string
  slot20TotalDiff: string
  slot20AvgGames: string
  slot20AvgDiff: string
  machineReports: SlotMachineReportEntry[]
}

export type UseOutsourcingVendorDashboardArgs = {
  repository: ProjectRepository
}

// ─── Helpers ───

function createEmptyDraft(machineNames: string[]): SlotReportDraft {
  return {
    slot20Count: "",
    slot20TotalDiff: "",
    slot20AvgGames: "",
    slot20AvgDiff: "",
    machineReports: machineNames.map((name) => ({
      machineName: name,
      count: "",
      avgGames: "",
      avgDiff: "",
    })),
  }
}

function reportToDraft(report: SlotReport | undefined, machineNames: string[]): SlotReportDraft {
  if (!report) return createEmptyDraft(machineNames)
  return {
    slot20Count: report.slot20Count ?? "",
    slot20TotalDiff: report.slot20TotalDiff ?? "",
    slot20AvgGames: report.slot20AvgGames ?? "",
    slot20AvgDiff: report.slot20AvgDiff ?? "",
    machineReports: machineNames.map((name) => {
      const existing = report.machineReports?.find((m) => m.machineName === name)
      return {
        machineName: name,
        count: existing?.count ?? "",
        avgGames: existing?.avgGames ?? "",
        avgDiff: existing?.avgDiff ?? "",
      }
    }),
  }
}

function draftToReport(draft: SlotReportDraft): SlotReport {
  return {
    slot20Count: draft.slot20Count || undefined,
    slot20TotalDiff: draft.slot20TotalDiff || undefined,
    slot20AvgGames: draft.slot20AvgGames || undefined,
    slot20AvgDiff: draft.slot20AvgDiff || undefined,
    machineReports: draft.machineReports,
    uploadedAt: new Date().toISOString().split("T")[0],
  }
}

// ─── Product → ViewModel ───

function toViewModel(product: Product, hallName: string): OutsourcingProductViewModel {
  return {
    id: product.id,
    projectNumber: product.projectNumber,
    eventProductName: product.eventProductName,
    eventDate: product.eventDate,
    executionStatus: product.executionStatus ?? "",
    hallName,
    targetMachineNames: product.targetMachineNames ?? [],
    surveyResult: product.surveyResult,
    eventPhotos: product.eventPhotos ?? [],
    interimReport: product.interimReport,
    postEventReport: product.postEventReport,
  }
}

// ─── Hook ───

export function useOutsourcingVendorDashboard({ repository }: UseOutsourcingVendorDashboardArgs) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [reportDraft, setReportDraft] = useState<SlotReportDraft>(createEmptyDraft([]))
  const [showChatDrawer, setShowChatDrawer] = useState(false)

  const openChatDrawer = useCallback(() => {
    if (selectedProductId === null) return
    setShowChatDrawer(true)
  }, [selectedProductId])

  // スロセレ商材かつ（実施中 OR イベント日が過去 OR executionStatus === "終了"）
  const filteredProducts = useMemo(() => {
    const products = repository.getProducts()
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return products.filter((p) => {
      if (p.eventType !== "スロセレ") return false
      const isDuringEvent = p.executionStatus === "実施中"
      const isPastEvent = p.eventDate ? new Date(p.eventDate) < now : false
      const isFinished = p.executionStatus === "終了"
      return isDuringEvent || isPastEvent || isFinished
    })
  }, [repository])

  // ViewModel変換（hallName は Project から取得）
  const productViewModels = useMemo(
    () => filteredProducts.map((p) => {
      const project = repository.getProjectByProjectNumber(p.projectNumber)
      const hallName = project?.hallName ?? ""
      return toViewModel(p, hallName)
    }),
    [filteredProducts, repository],
  )

  // フェーズ別グループ化（実施中 / 終了）
  const phaseGroups = useMemo(() => {
    const groups: PhaseGroup[] = []
    const during = productViewModels.filter((p) => p.executionStatus === "実施中")
    const post = productViewModels.filter((p) => p.executionStatus !== "実施中")
    if (during.length > 0) groups.push({ phase: "during-event", products: during })
    if (post.length > 0) groups.push({ phase: "post-event", products: post })
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
        const isDuringEvent = vm.executionStatus === "実施中"
        const report = isDuringEvent ? vm.interimReport : vm.postEventReport
        setReportDraft(reportToDraft(report, vm.targetMachineNames))
      }
    },
    [productViewModels],
  )

  // ドラフト全体フィールド更新
  const handleUpdateDraftField = useCallback((field: keyof Omit<SlotReportDraft, "machineReports">, value: string) => {
    setReportDraft((prev) => ({ ...prev, [field]: value }))
  }, [])

  // ドラフト機種別フィールド更新
  const handleUpdateMachineField = useCallback(
    (machineIndex: number, field: keyof Omit<SlotMachineReportEntry, "machineName">, value: string) => {
      setReportDraft((prev) => {
        const updated = [...prev.machineReports]
        updated[machineIndex] = { ...updated[machineIndex], [field]: value }
        return { ...prev, machineReports: updated }
      })
    },
    [],
  )

  // レポート保存（中間・事後共通）
  const handleSaveReport = useCallback(() => {
    if (selectedProductId === null || !selectedProduct) return
    const report = draftToReport(reportDraft)
    const isDuringEvent = selectedProduct.executionStatus === "実施中"
    repository.updateProduct(selectedProductId, isDuringEvent
      ? { interimReport: report }
      : { postEventReport: report },
    )
  }, [repository, selectedProductId, selectedProduct, reportDraft])

  return {
    phaseGroups,
    selectedProduct,
    selectedProductId,
    reportDraft,
    onSelectProduct: handleSelectProduct,
    onUpdateDraftField: handleUpdateDraftField,
    onUpdateMachineField: handleUpdateMachineField,
    onSaveReport: handleSaveReport,
    showChatDrawer,
    setShowChatDrawer,
    openChatDrawer,
  }
}
