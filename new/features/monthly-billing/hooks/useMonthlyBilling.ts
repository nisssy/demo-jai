import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { MonthlyBilling, BillingLineItem, BillingChatMessage } from "@/new/api/types"

export type BillingMode = "payment" | "invoice"

const DESIGN_NOTIFICATION_FEE = 50000

function buildVendorCsvContent(billings: MonthlyBilling[], month: string): string {
  const header = ["計上月", "業者種別", "業者名", "案件番号", "商材名", "品目", "数量", "単価", "小計"]
  const rows = billings.flatMap((b) =>
    b.lineItems.map((item) => [
      month,
      b.vendorType === "prize" ? "景品業者" : "デザイン業者",
      b.vendorName,
      item.projectNumber,
      item.productName,
      item.itemName,
      String(item.quantity),
      String(item.unitPrice),
      String(item.subtotal),
    ])
  )
  const totalRow = ["", "", "", "", "", "合計", "", "", String(billings.reduce((s, b) => s + b.totalAmount, 0))]
  return [header, ...rows, totalRow].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
}

export type CustomerBillingRow = {
  month: string
  projectNumber: string
  productName: string
  companyName: string
  hallName: string
  itemName: string
  quantity: number
  unitPrice: number
  subtotal: number
  hallTotal: number
}

function buildCustomerCsvContent(rows: CustomerBillingRow[]): string {
  const header = ["計上月", "案件番号", "商材名", "法人名", "ホール名", "項目名", "数量", "単価", "小計", "ホール請求合計"]
  const csvRows = rows.map((r) => [
    r.month,
    r.projectNumber,
    r.productName,
    r.companyName,
    r.hallName,
    r.itemName,
    String(r.quantity),
    String(r.unitPrice),
    String(r.subtotal),
    String(r.hallTotal),
  ])
  const total = rows.length > 0
    ? [...new Set(rows.map((r) => `${r.projectNumber}:${r.hallName}`))].reduce((sum, key) => {
        const row = rows.find((r) => `${r.projectNumber}:${r.hallName}` === key)
        return sum + (row?.hallTotal ?? 0)
      }, 0)
    : 0
  const totalRow = ["", "", "", "", "", "合計", "", "", "", String(total)]
  return [header, ...csvRows, totalRow].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
}

function triggerDownload(content: string, filename: string): void {
  const bom = "\uFEFF"
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function useMonthlyBilling(repository: ProjectRepository) {
  const [billingMode, setBillingMode] = useState<BillingMode>("payment")
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [customerBillingRows, setCustomerBillingRows] = useState<CustomerBillingRow[]>([])

  const billings = useMemo(() => {
    return repository.getMonthlyBillingsByMonth(selectedMonth)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, selectedMonth, refreshKey])

  const selectedBilling = useMemo(() => {
    if (!selectedBillingId) return null
    return billings.find((b) => b.id === selectedBillingId) ?? null
  }, [billings, selectedBillingId])

  // Cross-tab sync
  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1)
    window.addEventListener("billing-chat-updated", handler)
    window.addEventListener("storage", handler)
    window.addEventListener("focus", handler)
    return () => {
      window.removeEventListener("billing-chat-updated", handler)
      window.removeEventListener("storage", handler)
      window.removeEventListener("focus", handler)
    }
  }, [])

  const extractBillings = useCallback(() => {
    const products = repository.getProducts()
    const lotteryProducts = products.filter(
      (p) => p.category === "ポイント" && p.eventType === "合同抽選会"
    )

    const existingBillings = repository.getMonthlyBillingsByMonth(selectedMonth)
    const now = new Date().toISOString()

    // Prize vendors: group by vendorId from prizeInfo of products with prizeOrderRequestedAt
    const prizeVendorMap: Record<string, { vendorName: string; items: BillingLineItem[] }> = {}
    for (const product of lotteryProducts) {
      if (!product.prizeOrderRequestedAt || !product.prizeInfo) continue
      for (const prize of product.prizeInfo) {
        const vId = prize.vendorId ?? "unknown"
        const vName = prize.vendorName ?? "不明"
        if (!prizeVendorMap[vId]) {
          prizeVendorMap[vId] = { vendorName: vName, items: [] }
        }
        const qty = Math.max(0, parseInt(prize.quantity, 10) || 0)
        const unitPrice = prize.unitPrice ?? 0
        prizeVendorMap[vId].items.push({
          productId: product.id,
          productName: product.eventProductName,
          projectNumber: product.projectNumber,
          itemName: prize.name,
          quantity: qty,
          unitPrice,
          subtotal: qty * unitPrice,
        })
      }
    }

    for (const [vendorId, data] of Object.entries(prizeVendorMap)) {
      const alreadyExists = existingBillings.some(
        (b) => b.vendorType === "prize" && b.vendorId === vendorId
      )
      if (alreadyExists) continue
      const totalAmount = data.items.reduce((sum, item) => sum + item.subtotal, 0)
      repository.createMonthlyBilling({
        vendorType: "prize",
        vendorId,
        vendorName: data.vendorName,
        billingMonth: selectedMonth,
        status: "draft",
        lineItems: data.items,
        totalAmount,
        createdAt: now,
        updatedAt: now,
        chatMessages: [],
      })
    }

    // Design vendors: products with notificationOrderSentAt
    const designVendorMap: Record<string, { vendorName: string; items: BillingLineItem[] }> = {}
    for (const product of lotteryProducts) {
      if (!product.notificationOrderSentAt || !product.notificationOrderDesignVendorId) continue
      const vId = product.notificationOrderDesignVendorId
      const vName = product.notificationOrderDesignVendorName ?? "不明"
      if (!designVendorMap[vId]) {
        designVendorMap[vId] = { vendorName: vName, items: [] }
      }
      designVendorMap[vId].items.push({
        productId: product.id,
        productName: product.eventProductName,
        projectNumber: product.projectNumber,
        itemName: "当選通知書制作費",
        quantity: 1,
        unitPrice: DESIGN_NOTIFICATION_FEE,
        subtotal: DESIGN_NOTIFICATION_FEE,
      })
    }

    for (const [vendorId, data] of Object.entries(designVendorMap)) {
      const alreadyExists = existingBillings.some(
        (b) => b.vendorType === "design" && b.vendorId === vendorId
      )
      if (alreadyExists) continue
      const totalAmount = data.items.reduce((sum, item) => sum + item.subtotal, 0)
      repository.createMonthlyBilling({
        vendorType: "design",
        vendorId,
        vendorName: data.vendorName,
        billingMonth: selectedMonth,
        status: "draft",
        lineItems: data.items,
        totalAmount,
        createdAt: now,
        updatedAt: now,
        chatMessages: [],
      })
    }

    setRefreshKey((k) => k + 1)
  }, [repository, selectedMonth])

  const sendToVendor = useCallback(
    (billingId: string) => {
      const billing = repository.getMonthlyBillingById(billingId)
      if (!billing || billing.status !== "draft") return
      const now = new Date().toISOString()
      const chatMessage: BillingChatMessage = {
        author: "事務管理課",
        content: `${billing.billingMonth.replace("-", "年")}月分の計上データをお送りします。内容をご確認ください。\n合計金額: ¥${billing.totalAmount.toLocaleString()}`,
        timestamp: now,
      }
      repository.updateMonthlyBilling(billingId, {
        status: "sent",
        updatedAt: now,
        chatMessages: [...(billing.chatMessages ?? []), chatMessage],
      })
      window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
      setRefreshKey((k) => k + 1)
    },
    [repository]
  )

  const resendToVendor = useCallback(
    (billingId: string) => {
      const billing = repository.getMonthlyBillingById(billingId)
      if (!billing || billing.status !== "correction-requested") return
      const now = new Date().toISOString()
      const chatMessage: BillingChatMessage = {
        author: "事務管理課",
        content: "修正内容を反映しました。再度ご確認をお願いいたします。",
        timestamp: now,
      }
      repository.updateMonthlyBilling(billingId, {
        status: "sent",
        updatedAt: now,
        chatMessages: [...(billing.chatMessages ?? []), chatMessage],
      })
      window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
      setRefreshKey((k) => k + 1)
    },
    [repository]
  )

  const sendAgreement = useCallback(
    (billingId: string) => {
      const billing = repository.getMonthlyBillingById(billingId)
      if (!billing || billing.status !== "invoice-received") return
      const now = new Date().toISOString()
      const chatMessage: BillingChatMessage = {
        author: "事務管理課",
        content: "請求内容を確認しました。合意いたします。",
        timestamp: now,
      }
      repository.updateMonthlyBilling(billingId, {
        status: "agreed",
        agreedAt: now,
        updatedAt: now,
        chatMessages: [...(billing.chatMessages ?? []), chatMessage],
      })
      window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
      setRefreshKey((k) => k + 1)
    },
    [repository]
  )

  const sendChatMessage = useCallback(
    (billingId: string, content: string) => {
      const billing = repository.getMonthlyBillingById(billingId)
      if (!billing || !content.trim()) return
      const chatMessage: BillingChatMessage = {
        author: "事務管理課",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }
      repository.updateMonthlyBilling(billingId, {
        chatMessages: [...(billing.chatMessages ?? []), chatMessage],
        updatedAt: new Date().toISOString(),
      })
      window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
      setRefreshKey((k) => k + 1)
    },
    [repository]
  )

  const allAcknowledged = useMemo(() => {
    return billings.length > 0 && billings.every((b) => b.status === "acknowledged")
  }, [billings])

  const [closingReported, setClosingReported] = useState(false)

  // Reset when month changes
  useEffect(() => {
    setClosingReported(false)
    setCustomerBillingRows([])
  }, [selectedMonth])

  const reportClosing = useCallback(() => {
    setClosingReported(true)
  }, [])

  const downloadCsv = useCallback(() => {
    if (billings.length === 0) return
    const csv = buildVendorCsvContent(billings, selectedMonth)
    const filename = `売上計上データ_${selectedMonth}.csv`
    triggerDownload(csv, filename)
  }, [billings, selectedMonth])

  const buildCustomerRows = useCallback((): CustomerBillingRow[] => {
    const products = repository.getProducts()
    const projects = repository.getProjects()
    const lotteryProducts = products.filter(
      (p) => p.category === "ポイント" && p.eventType === "合同抽選会" && p.hallQuotes && p.hallQuotes.length > 0
    )

    const rows: CustomerBillingRow[] = []
    for (const product of lotteryProducts) {
      const project = projects.find((pj) => pj.projectNumber === product.projectNumber)
      const companyName = project?.companyName ?? "-"

      for (const hq of product.hallQuotes!) {
        const includedItems = hq.quoteItems.filter((qi) => qi.included)
        const hallTotal = hq.calculatedAmount ?? includedItems.reduce((s, qi) => s + qi.quantity * qi.unitPrice, 0)
        for (const qi of includedItems) {
          rows.push({
            month: selectedMonth,
            projectNumber: product.projectNumber,
            productName: product.eventProductName,
            companyName,
            hallName: hq.hallName,
            itemName: qi.name,
            quantity: qi.quantity,
            unitPrice: qi.unitPrice,
            subtotal: qi.quantity * qi.unitPrice,
            hallTotal,
          })
        }
      }
    }
    return rows
  }, [repository, selectedMonth])

  const extractCustomerBillings = useCallback(() => {
    const rows = buildCustomerRows()
    setCustomerBillingRows(rows)
  }, [buildCustomerRows])

  const downloadCustomerBillingCsv = useCallback(() => {
    const rows = customerBillingRows.length > 0 ? customerBillingRows : buildCustomerRows()
    if (rows.length === 0) return
    const csv = buildCustomerCsvContent(rows)
    const filename = `顧客請求データ_${selectedMonth}.csv`
    triggerDownload(csv, filename)
  }, [customerBillingRows, buildCustomerRows, selectedMonth])

  return {
    billingMode,
    setBillingMode,
    selectedMonth,
    setSelectedMonth,
    billings,
    selectedBillingId,
    setSelectedBillingId,
    selectedBilling,
    extractBillings,
    sendToVendor,
    resendToVendor,
    sendAgreement,
    sendChatMessage,
    allAcknowledged,
    closingReported,
    reportClosing,
    downloadCsv,
    customerBillingRows,
    extractCustomerBillings,
    downloadCustomerBillingCsv,
  }
}
