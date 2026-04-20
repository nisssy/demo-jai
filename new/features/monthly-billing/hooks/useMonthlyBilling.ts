import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { MonthlyBilling, BillingLineItem, BillingChatMessage, HallQuote } from "@/new/api/types"
import type { InvoiceRow } from "../ui/components/BillingInvoiceTab"
import type { PaymentRow } from "../ui/components/BillingPaymentTab"
import { type BillingFilterState, INITIAL_BILLING_FILTERS } from "../ui/components/BillingFilters"

export type BillingMode = "payment" | "invoice"

export type UndeliveredItem = {
  vendorId: string
  vendorName: string
  productName: string
  projectNumber: string
  prizeName: string
  winnerName: string
  winnerId: string
}

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
  const [pendingCarryOver, setPendingCarryOver] = useState<UndeliveredItem[] | null>(null)
  const [carriedOverItems, setCarriedOverItems] = useState<UndeliveredItem[]>([])

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

  // Collect undelivered items across all lottery products and vendors
  const collectUndeliveredItems = useCallback(
    (lotteryProducts: ReturnType<ProjectRepository["getProducts"]>): UndeliveredItem[] => {
      const undelivered: UndeliveredItem[] = []
      for (const product of lotteryProducts) {
        if (!product.prizeOrderRequestedAt || !product.prizeInfo) continue
        if (!product.prizeDeliveryInfoByVendor || !product.winnerList) continue

        for (const deliveryVendor of product.prizeDeliveryInfoByVendor) {
          if (!deliveryVendor.deliveries) continue
          for (const delivery of deliveryVendor.deliveries) {
            if (!delivery.deliveredAt) {
              // Find prize name from winnerList
              const winner = product.winnerList.find((w) => w.id === delivery.winnerId)
              undelivered.push({
                vendorId: deliveryVendor.vendorId,
                vendorName: deliveryVendor.vendorName,
                productName: product.eventProductName,
                projectNumber: product.projectNumber,
                prizeName: winner?.prize ?? "不明",
                winnerName: delivery.winnerName,
                winnerId: delivery.winnerId,
              })
            }
          }
        }
      }
      return undelivered
    },
    []
  )

  // Build prize vendor billing items, optionally excluding undelivered winners
  const buildPrizeVendorBillings = useCallback(
    (
      lotteryProducts: ReturnType<ProjectRepository["getProducts"]>,
      excludedWinnerIds?: Set<string>
    ) => {
      const prizeVendorMap: Record<string, { vendorName: string; items: BillingLineItem[] }> = {}
      for (const product of lotteryProducts) {
        if (!product.prizeOrderRequestedAt || !product.prizeInfo) continue
        for (const prize of product.prizeInfo) {
          const vId = prize.vendorId ?? "unknown"
          const vName = prize.vendorName ?? "不明"
          if (!prizeVendorMap[vId]) {
            prizeVendorMap[vId] = { vendorName: vName, items: [] }
          }
          let qty = Math.max(0, parseInt(prize.quantity, 10) || 0)
          const unitPrice = prize.unitPrice ?? 0

          // If excluding, count how many winners of this prize are undelivered
          if (excludedWinnerIds && product.winnerList) {
            const winnersOfThisPrize = product.winnerList.filter((w) => w.prize === prize.name)
            const excludedCount = winnersOfThisPrize.filter((w) => excludedWinnerIds.has(w.id)).length
            qty = Math.max(0, qty - excludedCount)
          }

          if (qty <= 0) continue
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
      return prizeVendorMap
    },
    []
  )

  // Create billings from vendor maps
  const createBillingsFromMaps = useCallback(
    (
      prizeVendorMap: Record<string, { vendorName: string; items: BillingLineItem[] }>,
      designVendorMap: Record<string, { vendorName: string; items: BillingLineItem[] }>,
      existingBillings: MonthlyBilling[]
    ) => {
      const now = new Date().toISOString()

      for (const [vendorId, data] of Object.entries(prizeVendorMap)) {
        const alreadyExists = existingBillings.some(
          (b) => b.vendorType === "prize" && b.vendorId === vendorId
        )
        if (alreadyExists) continue
        if (data.items.length === 0) continue
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
    },
    [repository, selectedMonth]
  )

  // Build design vendor map (shared between extractBillings and confirmCarryOver)
  const buildDesignVendorMap = useCallback(
    (lotteryProducts: ReturnType<ProjectRepository["getProducts"]>) => {
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
      return designVendorMap
    },
    []
  )

  const extractBillings = useCallback(() => {
    const products = repository.getProducts()
    const lotteryProducts = products.filter(
      (p) => p.category === "ポイント" && p.eventType === "合同抽選会"
    )

    // Check for undelivered items
    const undelivered = collectUndeliveredItems(lotteryProducts)

    if (undelivered.length > 0) {
      // Show confirmation dialog — don't create billings yet
      setPendingCarryOver(undelivered)
      return
    }

    // No undelivered items — create billings immediately
    const existingBillings = repository.getMonthlyBillingsByMonth(selectedMonth)
    const prizeVendorMap = buildPrizeVendorBillings(lotteryProducts)
    const designVendorMap = buildDesignVendorMap(lotteryProducts)
    createBillingsFromMaps(prizeVendorMap, designVendorMap, existingBillings)
  }, [repository, selectedMonth, collectUndeliveredItems, buildPrizeVendorBillings, buildDesignVendorMap, createBillingsFromMaps])

  const confirmCarryOverAndExtract = useCallback(() => {
    if (!pendingCarryOver) return

    const excludedWinnerIds = new Set(pendingCarryOver.map((item) => item.winnerId))

    const products = repository.getProducts()
    const lotteryProducts = products.filter(
      (p) => p.category === "ポイント" && p.eventType === "合同抽選会"
    )
    const existingBillings = repository.getMonthlyBillingsByMonth(selectedMonth)
    const prizeVendorMap = buildPrizeVendorBillings(lotteryProducts, excludedWinnerIds)
    const designVendorMap = buildDesignVendorMap(lotteryProducts)
    createBillingsFromMaps(prizeVendorMap, designVendorMap, existingBillings)

    setCarriedOverItems(pendingCarryOver)
    setPendingCarryOver(null)
  }, [pendingCarryOver, repository, selectedMonth, buildPrizeVendorBillings, buildDesignVendorMap, createBillingsFromMaps])

  const cancelCarryOver = useCallback(() => {
    setPendingCarryOver(null)
  }, [])

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
    setCarriedOverItems([])
  }, [selectedMonth])

  const reportClosing = useCallback(() => {
    setClosingReported(true)
  }, [])

  const downloadCsv = useCallback(() => {
    if (billings.length === 0) return
    const csv = buildVendorCsvContent(billings, selectedMonth)
    const filename = `支払データ_${selectedMonth}.csv`
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

  // ─── 請求/支払い タブ用データ ───

  const [invoiceFilters, setInvoiceFilters] = useState<BillingFilterState>(INITIAL_BILLING_FILTERS)
  const [paymentFilters, setPaymentFilters] = useState<BillingFilterState>(INITIAL_BILLING_FILTERS)
  const [selectedInvoiceRow, setSelectedInvoiceRow] = useState<InvoiceRow | null>(null)
  const [selectedPaymentRow, setSelectedPaymentRow] = useState<PaymentRow | null>(null)

  // Build invoice rows from hallQuotes across all lottery products
  const allInvoiceRows = useMemo((): InvoiceRow[] => {
    const products = repository.getProducts()
    const projects = repository.getProjects()
    const rows: InvoiceRow[] = []

    for (const product of products) {
      if (!product.hallQuotes || product.hallQuotes.length === 0) continue
      const project = projects.find((pj) => pj.projectNumber === product.projectNumber)

      product.hallQuotes.forEach((hq, hallIdx) => {
        const total = hq.calculatedAmount ?? hq.quoteItems.reduce((s, qi) => s + qi.quantity * qi.unitPrice, 0)
        const hasOrder = Boolean(product.prizeOrderRequestedAt)
        const isPaid = Boolean(product.notificationOrderSentAt && product.prizeOrderRequestedAt)
        const status: InvoiceRow["status"] = isPaid ? "請求完了" : hasOrder ? "請求中" : "請求前"

        rows.push({
          quoteId: `Q-${product.projectNumber}-${String(hallIdx + 1).padStart(2, "0")}`,
          quoteAmount: total,
          status,
          projectNumber: product.projectNumber,
          recordNumber: `R-${String(product.id).padStart(4, "0")}`,
          category: product.category,
          productName: product.eventProductName,
          companyName: project?.companyName ?? "-",
          hallName: hq.hallName,
          productId: product.id,
          hallIndex: hallIdx,
        })
      })
    }
    return rows
  }, [repository, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter invoice rows
  const filteredInvoiceRows = useMemo(() => {
    return allInvoiceRows.filter((row) => {
      const f = invoiceFilters
      if (f.companyId && !row.companyName.includes(f.companyId)) return false
      if (f.hallName && row.hallName !== f.hallName) return false
      if (f.category && row.category !== f.category) return false
      if (f.productName && !row.productName.includes(f.productName)) return false
      if (f.quoteId && !row.quoteId.includes(f.quoteId)) return false
      if (f.projectNumber && !row.projectNumber.includes(f.projectNumber)) return false
      if (f.recordNumber && !row.recordNumber.includes(f.recordNumber)) return false
      if (f.projectName && !row.productName.includes(f.projectName)) return false
      return true
    })
  }, [allInvoiceRows, invoiceFilters])

  // Build payment rows from monthly billings
  const allPaymentRows = useMemo((): PaymentRow[] => {
    return billings.map((b) => {
      let status: PaymentRow["status"] = "支払い前"
      if (b.status === "acknowledged" || b.status === "agreed") {
        status = "支払い完了"
      } else if (b.status === "sent" || b.status === "confirmed" || b.status === "invoice-received" || b.status === "correction-requested") {
        status = "支払い中"
      }
      return {
        vendorId: b.vendorId,
        vendorName: b.vendorName,
        paymentAmount: b.totalAmount,
        status,
        billingId: b.id,
      }
    })
  }, [billings])

  const filteredPaymentRows = useMemo(() => {
    return allPaymentRows.filter((row) => {
      const f = paymentFilters
      if (f.projectName && !row.vendorName.includes(f.projectName)) return false
      return true
    })
  }, [allPaymentRows, paymentFilters])

  // Get hall quote for invoice detail
  const getInvoiceHallQuote = useCallback((productId: number, hallIndex: number): HallQuote | null => {
    const product = repository.getProductById(productId)
    if (!product?.hallQuotes || hallIndex >= product.hallQuotes.length) return null
    return product.hallQuotes[hallIndex]
  }, [repository])

  // Handle payment row click → select the billing and show detail
  const handlePaymentRowClick = useCallback((row: PaymentRow) => {
    setSelectedBillingId(row.billingId)
    setSelectedPaymentRow(row)
  }, [])

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
    pendingCarryOver,
    confirmCarryOverAndExtract,
    cancelCarryOver,
    carriedOverItems,
    // 請求/支払い タブ
    invoiceFilters,
    setInvoiceFilters,
    paymentFilters,
    setPaymentFilters,
    filteredInvoiceRows,
    filteredPaymentRows,
    selectedInvoiceRow,
    setSelectedInvoiceRow,
    selectedPaymentRow,
    setSelectedPaymentRow,
    getInvoiceHallQuote,
    handlePaymentRowClick,
  }
}
