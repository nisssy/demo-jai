import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { MonthlyBilling, BillingLineItem, BillingChatMessage, HallQuote, PaymentCheckStatus } from "@/new/api/types"
import type { InvoiceRow } from "../ui/components/BillingInvoiceTab"
import type { PaymentRow } from "../ui/components/BillingPaymentTab"
import { type BillingFilterState, INITIAL_BILLING_FILTERS } from "../ui/components/BillingFilters"
import { type PaymentFilterState, INITIAL_PAYMENT_FILTERS } from "../ui/components/PaymentFilters"
import { PROPOSAL_STATUS_LABELS } from "@/new/api/display"
import type { ProposalStatus } from "@/new/api/types"

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

/** 支払いチェックリスト静的データ（スクリーンショット準拠） */
const SEED_PAYMENT_ROWS: Omit<import("../ui/components/BillingPaymentTab").PaymentRow, "checkStatus">[] = [
  { vendorId: "9214901", vendorName: "株式会社 アイアンドシー", purchaseAmountExTax: 185040, purchaseAmountIncTax: 200779, billingId: "SP-001" },
  { vendorId: "9200901", vendorName: "株式会社 アウトライン", purchaseAmountExTax: 712235, purchaseAmountIncTax: 783459, billingId: "SP-002" },
  { vendorId: "9294901", vendorName: "青柳義塾所", purchaseAmountExTax: 35664, purchaseAmountIncTax: 38781, billingId: "SP-003" },
  { vendorId: "9073901", vendorName: "株式会社 アデリー", purchaseAmountExTax: 843944, purchaseAmountIncTax: 923928, billingId: "SP-004" },
  { vendorId: "9270901", vendorName: "株式会社 e&semble", purchaseAmountExTax: 141500, purchaseAmountIncTax: 155650, billingId: "SP-005" },
  { vendorId: "9999971", vendorName: "Ｗｅｂ購買ＤＭＭ１", purchaseAmountExTax: 742915, purchaseAmountIncTax: 807572, billingId: "SP-006" },
  { vendorId: "9999973", vendorName: "Ｗｅｂ購買ＤＭＭ３", purchaseAmountExTax: 23538, purchaseAmountIncTax: 25668, billingId: "SP-007" },
  { vendorId: "9999972", vendorName: "Ｗｅｂ購買ＤＭＭ２", purchaseAmountExTax: 165040, purchaseAmountIncTax: 179513, billingId: "SP-008" },
  { vendorId: "9067901", vendorName: "内海屋産業株式会社", purchaseAmountExTax: 858167, purchaseAmountIncTax: 942549, billingId: "SP-009" },
  { vendorId: "9999979", vendorName: "運営統括部手配案件", purchaseAmountExTax: 533243, purchaseAmountIncTax: 586041, billingId: "SP-010" },
  { vendorId: "9320901", vendorName: "株式会社オリジナルあい", purchaseAmountExTax: 42600, purchaseAmountIncTax: 46608, billingId: "SP-011" },
  { vendorId: "9178901", vendorName: "オン・ザ・コーナー", purchaseAmountExTax: 251246, purchaseAmountIncTax: 276371, billingId: "SP-012" },
  { vendorId: "9119901", vendorName: "株式会社 サイバーネット", purchaseAmountExTax: 1045362, purchaseAmountIncTax: 1149898, billingId: "SP-013" },
  { vendorId: "9284901", vendorName: "株式会社 サニーフーズ", purchaseAmountExTax: 847714, purchaseAmountIncTax: 914883, billingId: "SP-014" },
  { vendorId: "9153901", vendorName: "株式会社 シグナルマーケティング", purchaseAmountExTax: 300000, purchaseAmountIncTax: 330000, billingId: "SP-015" },
  { vendorId: "9293901", vendorName: "株式会社ジャリア", purchaseAmountExTax: 27500, purchaseAmountIncTax: 29742, billingId: "SP-016" },
  { vendorId: "9321901", vendorName: "社会福祉法人正和会", purchaseAmountExTax: 6986, purchaseAmountIncTax: 7573, billingId: "SP-017" },
  { vendorId: "9935901", vendorName: "合同会社ＳＯＴＡ", purchaseAmountExTax: 870552, purchaseAmountIncTax: 953638, billingId: "SP-018" },
  { vendorId: "9999999", vendorName: "その他", purchaseAmountExTax: 96667, purchaseAmountIncTax: 104400, billingId: "SP-019" },
  { vendorId: "9075903", vendorName: "ソルテプラン株式会社", purchaseAmountExTax: 118000, purchaseAmountIncTax: 129800, billingId: "SP-020" },
  { vendorId: "9278901", vendorName: "株式会社 高橋商店", purchaseAmountExTax: 18140, purchaseAmountIncTax: 19604, billingId: "SP-021" },
  { vendorId: "9075901", vendorName: "株式会社 ディスポート", purchaseAmountExTax: 323345, purchaseAmountIncTax: 355680, billingId: "SP-022" },
  { vendorId: "9245901", vendorName: "合同会社 ＤＭＭ．ｃｏｍ", purchaseAmountExTax: 30500, purchaseAmountIncTax: 32400, billingId: "SP-023" },
  { vendorId: "9272901", vendorName: "常盤村養鶏農業協同組合", purchaseAmountExTax: 231780, purchaseAmountIncTax: 251258, billingId: "SP-024" },
  { vendorId: "9323901", vendorName: "有限会社ニシワキ", purchaseAmountExTax: 104356, purchaseAmountIncTax: 114792, billingId: "SP-025" },
  { vendorId: "9291901", vendorName: "ねぎ餃子溝端上谷台店", purchaseAmountExTax: 12533, purchaseAmountIncTax: 13601, billingId: "SP-026" },
]

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
    r.month, r.projectNumber, r.productName, r.companyName, r.hallName,
    r.itemName, String(r.quantity), String(r.unitPrice), String(r.subtotal), String(r.hallTotal),
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
  const [billingMode, setBillingMode] = useState<BillingMode>("invoice")
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

  // Collect undelivered items
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

  const buildPrizeVendorBillings = useCallback(
    (lotteryProducts: ReturnType<ProjectRepository["getProducts"]>, excludedWinnerIds?: Set<string>) => {
      const prizeVendorMap: Record<string, { vendorName: string; items: BillingLineItem[] }> = {}
      for (const product of lotteryProducts) {
        if (!product.prizeOrderRequestedAt || !product.prizeInfo) continue
        for (const prize of product.prizeInfo) {
          const vId = prize.vendorId ?? "unknown"
          const vName = prize.vendorName ?? "不明"
          if (!prizeVendorMap[vId]) prizeVendorMap[vId] = { vendorName: vName, items: [] }
          let qty = Math.max(0, parseInt(prize.quantity, 10) || 0)
          const unitPrice = prize.unitPrice ?? 0
          if (excludedWinnerIds && product.winnerList) {
            const winnersOfThisPrize = product.winnerList.filter((w) => w.prize === prize.name)
            const excludedCount = winnersOfThisPrize.filter((w) => excludedWinnerIds.has(w.id)).length
            qty = Math.max(0, qty - excludedCount)
          }
          if (qty <= 0) continue
          prizeVendorMap[vId].items.push({
            productId: product.id, productName: product.eventProductName,
            projectNumber: product.projectNumber, itemName: prize.name,
            quantity: qty, unitPrice, subtotal: qty * unitPrice,
          })
        }
      }
      return prizeVendorMap
    },
    []
  )

  const createBillingsFromMaps = useCallback(
    (prizeVendorMap: Record<string, { vendorName: string; items: BillingLineItem[] }>,
     designVendorMap: Record<string, { vendorName: string; items: BillingLineItem[] }>,
     existingBillings: MonthlyBilling[]) => {
      const now = new Date().toISOString()
      for (const [vendorId, data] of Object.entries(prizeVendorMap)) {
        if (existingBillings.some((b) => b.vendorType === "prize" && b.vendorId === vendorId)) continue
        if (data.items.length === 0) continue
        const totalAmount = data.items.reduce((sum, item) => sum + item.subtotal, 0)
        repository.createMonthlyBilling({
          vendorType: "prize", vendorId, vendorName: data.vendorName,
          billingMonth: selectedMonth, status: "draft", lineItems: data.items,
          totalAmount, createdAt: now, updatedAt: now, chatMessages: [],
        })
      }
      for (const [vendorId, data] of Object.entries(designVendorMap)) {
        if (existingBillings.some((b) => b.vendorType === "design" && b.vendorId === vendorId)) continue
        const totalAmount = data.items.reduce((sum, item) => sum + item.subtotal, 0)
        repository.createMonthlyBilling({
          vendorType: "design", vendorId, vendorName: data.vendorName,
          billingMonth: selectedMonth, status: "draft", lineItems: data.items,
          totalAmount, createdAt: now, updatedAt: now, chatMessages: [],
        })
      }
      setRefreshKey((k) => k + 1)
    },
    [repository, selectedMonth]
  )

  const buildDesignVendorMap = useCallback(
    (lotteryProducts: ReturnType<ProjectRepository["getProducts"]>) => {
      const designVendorMap: Record<string, { vendorName: string; items: BillingLineItem[] }> = {}
      for (const product of lotteryProducts) {
        if (!product.notificationOrderSentAt || !product.notificationOrderDesignVendorId) continue
        const vId = product.notificationOrderDesignVendorId
        const vName = product.notificationOrderDesignVendorName ?? "不明"
        if (!designVendorMap[vId]) designVendorMap[vId] = { vendorName: vName, items: [] }
        designVendorMap[vId].items.push({
          productId: product.id, productName: product.eventProductName,
          projectNumber: product.projectNumber, itemName: "当選通知書制作費",
          quantity: 1, unitPrice: DESIGN_NOTIFICATION_FEE, subtotal: DESIGN_NOTIFICATION_FEE,
        })
      }
      return designVendorMap
    },
    []
  )

  const extractBillings = useCallback(() => {
    const products = repository.getProducts()
    const lotteryProducts = products.filter((p) => p.category === "ポイント" && p.eventType === "合同抽選会")
    const undelivered = collectUndeliveredItems(lotteryProducts)
    if (undelivered.length > 0) { setPendingCarryOver(undelivered); return }
    const existingBillings = repository.getMonthlyBillingsByMonth(selectedMonth)
    const prizeVendorMap = buildPrizeVendorBillings(lotteryProducts)
    const designVendorMap = buildDesignVendorMap(lotteryProducts)
    createBillingsFromMaps(prizeVendorMap, designVendorMap, existingBillings)
  }, [repository, selectedMonth, collectUndeliveredItems, buildPrizeVendorBillings, buildDesignVendorMap, createBillingsFromMaps])

  const confirmCarryOverAndExtract = useCallback(() => {
    if (!pendingCarryOver) return
    const excludedWinnerIds = new Set(pendingCarryOver.map((item) => item.winnerId))
    const products = repository.getProducts()
    const lotteryProducts = products.filter((p) => p.category === "ポイント" && p.eventType === "合同抽選会")
    const existingBillings = repository.getMonthlyBillingsByMonth(selectedMonth)
    const prizeVendorMap = buildPrizeVendorBillings(lotteryProducts, excludedWinnerIds)
    const designVendorMap = buildDesignVendorMap(lotteryProducts)
    createBillingsFromMaps(prizeVendorMap, designVendorMap, existingBillings)
    setCarriedOverItems(pendingCarryOver)
    setPendingCarryOver(null)
  }, [pendingCarryOver, repository, selectedMonth, buildPrizeVendorBillings, buildDesignVendorMap, createBillingsFromMaps])

  const cancelCarryOver = useCallback(() => setPendingCarryOver(null), [])

  const sendToVendor = useCallback((billingId: string) => {
    const billing = repository.getMonthlyBillingById(billingId)
    if (!billing || billing.status !== "draft") return
    const now = new Date().toISOString()
    const chatMessage: BillingChatMessage = {
      author: "事務管理課",
      content: `${billing.billingMonth.replace("-", "年")}月分の計上データをお送りします。内容をご確認ください。\n合計金額: ¥${billing.totalAmount.toLocaleString()}`,
      timestamp: now,
    }
    repository.updateMonthlyBilling(billingId, {
      status: "sent", updatedAt: now,
      chatMessages: [...(billing.chatMessages ?? []), chatMessage],
    })
    window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
    setRefreshKey((k) => k + 1)
  }, [repository])

  const resendToVendor = useCallback((billingId: string) => {
    const billing = repository.getMonthlyBillingById(billingId)
    if (!billing || billing.status !== "correction-requested") return
    const now = new Date().toISOString()
    const chatMessage: BillingChatMessage = {
      author: "事務管理課", content: "修正内容を反映しました。再度ご確認をお願いいたします。", timestamp: now,
    }
    repository.updateMonthlyBilling(billingId, {
      status: "sent", updatedAt: now,
      chatMessages: [...(billing.chatMessages ?? []), chatMessage],
    })
    window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
    setRefreshKey((k) => k + 1)
  }, [repository])

  const sendAgreement = useCallback((billingId: string) => {
    const billing = repository.getMonthlyBillingById(billingId)
    if (!billing || billing.status !== "invoice-received") return
    const now = new Date().toISOString()
    const chatMessage: BillingChatMessage = {
      author: "事務管理課", content: "請求内容を確認しました。合意いたします。", timestamp: now,
    }
    repository.updateMonthlyBilling(billingId, {
      status: "agreed", agreedAt: now, updatedAt: now,
      chatMessages: [...(billing.chatMessages ?? []), chatMessage],
    })
    window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
    setRefreshKey((k) => k + 1)
  }, [repository])

  const sendChatMessage = useCallback((billingId: string, content: string) => {
    const billing = repository.getMonthlyBillingById(billingId)
    if (!billing || !content.trim()) return
    const chatMessage: BillingChatMessage = {
      author: "事務管理課", content: content.trim(), timestamp: new Date().toISOString(),
    }
    repository.updateMonthlyBilling(billingId, {
      chatMessages: [...(billing.chatMessages ?? []), chatMessage],
      updatedAt: new Date().toISOString(),
    })
    window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
    setRefreshKey((k) => k + 1)
  }, [repository])

  const allAcknowledged = useMemo(() => billings.length > 0 && billings.every((b) => b.status === "acknowledged"), [billings])
  const [closingReported, setClosingReported] = useState(false)

  useEffect(() => {
    setClosingReported(false)
    setCustomerBillingRows([])
    setCarriedOverItems([])
  }, [selectedMonth])

  const reportClosing = useCallback(() => setClosingReported(true), [])

  const downloadCsv = useCallback(() => {
    if (billings.length === 0) return
    triggerDownload(buildVendorCsvContent(billings, selectedMonth), `支払データ_${selectedMonth}.csv`)
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
            month: selectedMonth, projectNumber: product.projectNumber,
            productName: product.eventProductName, companyName, hallName: hq.hallName,
            itemName: qi.name, quantity: qi.quantity, unitPrice: qi.unitPrice,
            subtotal: qi.quantity * qi.unitPrice, hallTotal,
          })
        }
      }
    }
    return rows
  }, [repository, selectedMonth])

  const extractCustomerBillings = useCallback(() => setCustomerBillingRows(buildCustomerRows()), [buildCustomerRows])

  const downloadCustomerBillingCsv = useCallback(() => {
    const rows = customerBillingRows.length > 0 ? customerBillingRows : buildCustomerRows()
    if (rows.length === 0) return
    triggerDownload(buildCustomerCsvContent(rows), `顧客請求データ_${selectedMonth}.csv`)
  }, [customerBillingRows, buildCustomerRows, selectedMonth])

  // ─── 請求タブ ───

  const [invoiceFilters, setInvoiceFilters] = useState<BillingFilterState>(INITIAL_BILLING_FILTERS)
  const [selectedInvoiceRow, setSelectedInvoiceRow] = useState<InvoiceRow | null>(null)
  const [confirmedQuoteIds, setConfirmedQuoteIds] = useState<Set<string>>(new Set())
  const [bulkConfirmRows, setBulkConfirmRows] = useState<InvoiceRow[] | null>(null)

  const confirmQuote = useCallback((quoteId: string) => {
    setConfirmedQuoteIds((prev) => new Set([...prev, quoteId]))
  }, [])

  const handleBulkConfirm = useCallback((rows: InvoiceRow[]) => {
    // 選択された全行を即座に確定
    setConfirmedQuoteIds((prev) => {
      const next = new Set(prev)
      for (const row of rows) next.add(row.quoteId)
      return next
    })
  }, [])

  const cancelBulkConfirm = useCallback(() => {
    setBulkConfirmRows(null)
  }, [])

  // Build invoice rows
  const allInvoiceRows = useMemo((): InvoiceRow[] => {
    const products = repository.getProducts()
    const projects = repository.getProjects()
    const rows: InvoiceRow[] = []

    for (const product of products) {
      if (!product.hallQuotes || product.hallQuotes.length === 0) continue
      const project = projects.find((pj) => pj.projectNumber === product.projectNumber)

      product.hallQuotes.forEach((hq, hallIdx) => {
        const total = hq.calculatedAmount ?? hq.quoteItems.reduce((s, qi) => s + qi.quantity * qi.unitPrice, 0)
        const quoteId = `Q-${product.projectNumber}-${String(hallIdx + 1).padStart(2, "0")}`
        const isConfirmed = confirmedQuoteIds.has(quoteId)
        const hasOrder = Boolean(product.prizeOrderRequestedAt)
        const isPaid = Boolean(product.notificationOrderSentAt && product.prizeOrderRequestedAt)
        const status: InvoiceRow["status"] = isConfirmed ? "請求完了" : isPaid ? "請求完了" : hasOrder ? "請求中" : "請求前"

        rows.push({
          quoteId,
          quoteAmount: total,
          status,
          projectNumber: product.projectNumber,
          recordNumber: `R-${String(product.id).padStart(4, "0")}`,
          category: product.category,
          productName: product.eventProductName,
          companyName: project?.companyName ?? "-",
          hallName: hq.hallName,
          eventDate: product.eventDate,
          proposalStatus: product.proposalStatus,
          proposalStatusLabel: PROPOSAL_STATUS_LABELS[product.proposalStatus as ProposalStatus] ?? product.proposalStatus,
          executionStatus: product.executionStatus ?? "-",
          designOrdered: Boolean(product.notificationOrderSentAt),
          prizeOrdered: Boolean(product.prizeOrderRequestedAt),
          listConfirmed: Boolean(product.winnerListValidatedAt),
          salesPersonName: project?.salesPersonName ?? "-",
          estimatedBillingAmount: product.estimatedBillingAmount,
          productId: product.id,
          hallIndex: hallIdx,
          serviceName: product.serviceName,
          adminPersonId: product.adminPersonId,
        })
      })
    }
    return rows
  }, [repository, refreshKey, confirmedQuoteIds]) // eslint-disable-line react-hooks/exhaustive-deps

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
      if (f.proposalStatuses.length > 0 && !f.proposalStatuses.includes(row.proposalStatus)) return false
      if (f.executionStatuses.length > 0 && !f.executionStatuses.includes(row.executionStatus)) return false
      if (f.designOrderStatuses.length > 0) {
        const val = row.designOrdered ? "done" : "not"
        if (!f.designOrderStatuses.includes(val)) return false
      }
      if (f.prizeOrderStatuses.length > 0) {
        const val = row.prizeOrdered ? "done" : "not"
        if (!f.prizeOrderStatuses.includes(val)) return false
      }
      if (f.listConfirmStatuses.length > 0) {
        const val = row.listConfirmed ? "done" : "not"
        if (!f.listConfirmStatuses.includes(val)) return false
      }
      if (f.serviceName && row.serviceName !== f.serviceName) return false
      if (f.adminPersonId && String(row.adminPersonId) !== f.adminPersonId) return false
      return true
    })
  }, [allInvoiceRows, invoiceFilters])

  // ─── 支払いタブ ───

  const [paymentFilters, setPaymentFilters] = useState<PaymentFilterState>(INITIAL_PAYMENT_FILTERS)
  const [selectedPaymentRow, setSelectedPaymentRow] = useState<PaymentRow | null>(null)
  const [paymentCheckStatuses, setPaymentCheckStatuses] = useState<Record<string, PaymentCheckStatus>>({})

  const getPaymentCheckStatus = useCallback((billingId: string): PaymentCheckStatus => {
    return paymentCheckStatuses[billingId] ?? "unconfirmed"
  }, [paymentCheckStatuses])

  const sendPaymentToVendor = useCallback((billingId: string) => {
    sendToVendor(billingId)
    setPaymentCheckStatuses((prev) => ({ ...prev, [billingId]: "confirming" }))
  }, [sendToVendor])

  const confirmPayment = useCallback((billingId: string) => {
    setPaymentCheckStatuses((prev) => ({ ...prev, [billingId]: "confirmed" }))
  }, [])

  // 静的な支払いデータ（抽出不要で初期表示）
  const allPaymentRows = useMemo((): PaymentRow[] => {
    // 抽出済みのbillingsがあればそれを使う
    if (billings.length > 0) {
      return billings.map((b) => ({
        vendorId: b.vendorId,
        vendorName: b.vendorName,
        purchaseAmountExTax: b.totalAmount,
        purchaseAmountIncTax: Math.round(b.totalAmount * 1.1),
        checkStatus: paymentCheckStatuses[b.id] ?? "unconfirmed",
        billingId: b.id,
      }))
    }
    // 静的シードデータ
    return SEED_PAYMENT_ROWS.map((r) => ({
      ...r,
      checkStatus: paymentCheckStatuses[r.billingId] ?? "unconfirmed",
    }))
  }, [billings, paymentCheckStatuses])

  const filteredPaymentRows = useMemo(() => {
    return allPaymentRows.filter((row) => {
      const f = paymentFilters
      if (f.vendorId && !row.vendorId.includes(f.vendorId)) return false
      if (f.vendorName && !row.vendorName.includes(f.vendorName)) return false
      if (f.checkStatus && row.checkStatus !== f.checkStatus) return false
      return true
    })
  }, [allPaymentRows, paymentFilters])

  const getInvoiceHallQuote = useCallback((productId: number, hallIndex: number): HallQuote | null => {
    const product = repository.getProductById(productId)
    if (!product?.hallQuotes || hallIndex >= product.hallQuotes.length) return null
    return product.hallQuotes[hallIndex]
  }, [repository])

  // 静的行クリック時にダミーのbillingを生成
  const selectedPaymentBilling = useMemo((): MonthlyBilling | null => {
    if (!selectedPaymentRow) return null
    // 実際のbillingがあればそれを使う
    const real = billings.find((b) => b.id === selectedPaymentRow.billingId)
    if (real) return real
    // 静的データ用のダミーbilling（明細10行）
    const dummyItems: BillingLineItem[] = [
      { productId: 1001, productName: "合同抽選会A", projectNumber: "PJ-2026-0101", itemName: "景品A（特賞）", quantity: 2, unitPrice: Math.round(selectedPaymentRow.purchaseAmountExTax * 0.18), subtotal: 0 },
      { productId: 1002, productName: "合同抽選会B", projectNumber: "PJ-2026-0102", itemName: "景品B（1等）", quantity: 5, unitPrice: Math.round(selectedPaymentRow.purchaseAmountExTax * 0.14), subtotal: 0 },
      { productId: 1003, productName: "合同抽選会C", projectNumber: "PJ-2026-0103", itemName: "景品C（2等）", quantity: 10, unitPrice: Math.round(selectedPaymentRow.purchaseAmountExTax * 0.08), subtotal: 0 },
      { productId: 1004, productName: "合同抽選会D", projectNumber: "PJ-2026-0104", itemName: "景品D（3等）", quantity: 20, unitPrice: Math.round(selectedPaymentRow.purchaseAmountExTax * 0.05), subtotal: 0 },
      { productId: 1005, productName: "合同抽選会E", projectNumber: "PJ-2026-0105", itemName: "景品E（4等）", quantity: 30, unitPrice: Math.round(selectedPaymentRow.purchaseAmountExTax * 0.03), subtotal: 0 },
      { productId: 1006, productName: "合同抽選会F", projectNumber: "PJ-2026-0106", itemName: "景品F（5等）", quantity: 50, unitPrice: Math.round(selectedPaymentRow.purchaseAmountExTax * 0.015), subtotal: 0 },
      { productId: 1007, productName: "合同抽選会G", projectNumber: "PJ-2026-0107", itemName: "当選通知書制作費", quantity: 1, unitPrice: 50000, subtotal: 0 },
      { productId: 1008, productName: "合同抽選会H", projectNumber: "PJ-2026-0108", itemName: "発送手数料", quantity: 117, unitPrice: 350, subtotal: 0 },
      { productId: 1009, productName: "合同抽選会I", projectNumber: "PJ-2026-0109", itemName: "梱包資材費", quantity: 117, unitPrice: 120, subtotal: 0 },
      { productId: 1010, productName: "合同抽選会J", projectNumber: "PJ-2026-0110", itemName: "管理手数料", quantity: 1, unitPrice: 30000, subtotal: 0 },
    ]
    // subtotalを計算し、合計がpurchaseAmountExTaxに近づくよう最後の行で調整
    let runningTotal = 0
    for (let i = 0; i < dummyItems.length - 1; i++) {
      dummyItems[i].subtotal = dummyItems[i].quantity * dummyItems[i].unitPrice
      runningTotal += dummyItems[i].subtotal
    }
    const lastItem = dummyItems[dummyItems.length - 1]
    lastItem.subtotal = lastItem.quantity * lastItem.unitPrice
    runningTotal += lastItem.subtotal

    return {
      id: selectedPaymentRow.billingId,
      vendorType: "prize",
      vendorId: selectedPaymentRow.vendorId,
      vendorName: selectedPaymentRow.vendorName,
      billingMonth: selectedMonth,
      status: "draft",
      lineItems: dummyItems,
      totalAmount: runningTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chatMessages: [],
    }
  }, [selectedPaymentRow, billings, selectedMonth])

  const handlePaymentRowClick = useCallback((row: PaymentRow) => {
    setSelectedBillingId(row.billingId)
    setSelectedPaymentRow(row)
  }, [])

  return {
    billingMode, setBillingMode,
    selectedMonth, setSelectedMonth,
    billings, selectedBillingId, setSelectedBillingId, selectedBilling,
    extractBillings, sendToVendor, resendToVendor, sendAgreement, sendChatMessage,
    allAcknowledged, closingReported, reportClosing, downloadCsv,
    customerBillingRows, extractCustomerBillings, downloadCustomerBillingCsv,
    pendingCarryOver, confirmCarryOverAndExtract, cancelCarryOver, carriedOverItems,
    // 請求タブ
    invoiceFilters, setInvoiceFilters,
    filteredInvoiceRows, selectedInvoiceRow, setSelectedInvoiceRow,
    getInvoiceHallQuote, confirmQuote, confirmedQuoteIds,
    bulkConfirmRows, handleBulkConfirm, cancelBulkConfirm,
    // 支払いタブ
    paymentFilters, setPaymentFilters,
    filteredPaymentRows, selectedPaymentRow, setSelectedPaymentRow,
    selectedPaymentBilling,
    handlePaymentRowClick, getPaymentCheckStatus,
    sendPaymentToVendor, confirmPayment,
    paymentVendors: useMemo(() => {
      const seen = new Map<string, string>()
      for (const row of allPaymentRows) {
        if (!seen.has(row.vendorId)) seen.set(row.vendorId, row.vendorName)
      }
      return Array.from(seen, ([vendorId, vendorName]) => ({ vendorId, vendorName }))
    }, [allPaymentRows]),
  }
}
