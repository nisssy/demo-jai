"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { PrizeInfo, HallQuote, QuoteItem, Company, Hall, Employee, DesignRequest } from "@/new/api/types"
import { PRIZE_SETS, PRIZE_MASTER, PRIZE_VENDORS, TRADING_PARTNERS, DEFAULT_TOTAL_QUOTE_ITEMS, prizesFromTemplate } from "@/new/api/lottery-data"
import type {
  LotteryFormState,
  LotteryHallEntry,
  QuoteConfigState,
  OrderStatus,
  ExecutionStatus,
  ProductionStatus,
  DesignRequestInfo,
} from "@/new/features/project-registration/model/lottery-types"

export type UseLotteryFormArgs = {
  repository: ProjectRepository
  productId?: number
  initialHallName?: string
  initialCompanyId?: string
}

const TAB_ORDER = ["basic-info", "prize-set", "status", "quote", "production"] as const
type TabId = (typeof TAB_ORDER)[number]

function emptyHallEntry(): LotteryHallEntry {
  return { hallName: "", companyId: "", companyName: "", companySalesPersonName: "", hallSalesPersonName: "" }
}

function emptyQuoteConfig(): QuoteConfigState {
  return {
    totalQuoteItems: { ...DEFAULT_TOTAL_QUOTE_ITEMS },
    posterPrintQuantity: "50",
    posterPrintUnitPrice: "2000",
    dmOrderCount: "1000",
    proportionMode: "hall",
    hallPercentages: {},
    companyPercentages: {},
  }
}

export function useLotteryForm({ repository, productId, initialHallName, initialCompanyId }: UseLotteryFormArgs) {
  // ─── タブ管理 ───
  const [activeTab, setActiveTab] = useState<TabId>("basic-info")

  const goToNextTab = useCallback(() => {
    const idx = TAB_ORDER.indexOf(activeTab)
    if (idx < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[idx + 1])
  }, [activeTab])

  const isLastTab = activeTab === TAB_ORDER[TAB_ORDER.length - 1]

  // ─── マスタデータ ───
  const allCompanies = useMemo(() => repository.getCompanies(), [repository])
  const allHalls = useMemo(() => repository.getHalls(), [repository])
  const allEmployees = useMemo(() => repository.getEmployees(), [repository])

  const getHallsByCompanyId = useCallback(
    (companyId: number) => allHalls.filter((h) => h.companyId === companyId),
    [allHalls]
  )

  // ─── セクション1: 基本情報 ───
  const [halls, setHalls] = useState<LotteryHallEntry[]>([emptyHallEntry()])
  const [serviceName, setServiceName] = useState<"たまリッチ" | "SmartPoint" | "">("たまリッチ")
  const [dmMailing, setDmMailing] = useState<"yes" | "no">("yes")
  const [posterDesignChange, setPosterDesignChange] = useState<"yes" | "no">("no")

  // ポスターデザイン変更無を選択したらポスターデザイン費用を固定値で自動反映
  const DEFAULT_POSTER_DESIGN_AMOUNT = "50000"
  useEffect(() => {
    if (posterDesignChange === "no") {
      setQuoteConfig((prev) => ({
        ...prev,
        totalQuoteItems: { ...prev.totalQuoteItems, 1: DEFAULT_POSTER_DESIGN_AMOUNT },
      }))
    }
  }, [posterDesignChange])
  const [eventStartDate, setEventStartDate] = useState("")
  const [eventEndDate, setEventEndDate] = useState("")
  const [salesPersonId, setSalesPersonId] = useState("")
  const [salesPersonName, setSalesPersonName] = useState("")
  const [insightPersonId, setInsightPersonId] = useState("")
  const [insightPersonName, setInsightPersonName] = useState("")
  const [eventName, setEventName] = useState("")

  const addHall = useCallback(() => {
    setHalls((prev) => [...prev, emptyHallEntry()])
  }, [])

  const removeHall = useCallback((index: number) => {
    setHalls((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const selectCompanyForHall = useCallback(
    (index: number, companyId: string) => {
      setHalls((prev) => {
        const next = [...prev]
        const company = allCompanies.find((c) => c.companyId === companyId)
        if (!company) return prev
        next[index] = {
          ...next[index],
          companyId: company.companyId,
          companyName: company.name,
          companySalesPersonName: "",
          hallName: "",
          hallSalesPersonName: "",
        }
        return next
      })
    },
    [allCompanies]
  )

  const selectHallForEntry = useCallback(
    (index: number, hallName: string) => {
      const hall = allHalls.find((h) => h.name === hallName)
      if (!hall) return
      const company = allCompanies.find((c) => c.id === hall.companyId)

      setHalls((prev) => {
        const next = [...prev]
        next[index] = {
          ...next[index],
          hallName: hall.name,
          hallSalesPersonName: hall.salesPersonName,
          companyId: company?.companyId ?? next[index].companyId,
          companyName: company?.name ?? next[index].companyName,
        }
        return next
      })

      // 最初のホール選択時、営業担当が未設定なら自動セット
      if (index === 0 && hall.salesPersonName) {
        setSalesPersonName((prev) => {
          if (prev) return prev
          const emp = allEmployees.find((e) => e.name === hall.salesPersonName)
          if (emp) setSalesPersonId(String(emp.id))
          return hall.salesPersonName
        })
      }
    },
    [allHalls, allCompanies, allEmployees]
  )

  // ─── セクション2: 景品セット ───
  const [selectedPrizeSetId, setSelectedPrizeSetId] = useState("")
  const [prizeInfo, setPrizeInfo] = useState<PrizeInfo[]>([])

  const vendorCount = useMemo(() => {
    const vendorIds = new Set(prizeInfo.filter((p) => p.vendorId).map((p) => p.vendorId))
    return vendorIds.size
  }, [prizeInfo])

  const selectPrizeSet = useCallback((setId: string) => {
    setSelectedPrizeSetId(setId)
    setPrizeInfo(prizesFromTemplate(setId))
  }, [])

  const addPrize = useCallback(() => {
    setPrizeInfo((prev) => [...prev, { rank: "", name: "", quantity: "1" }])
  }, [])

  const removePrize = useCallback((index: number) => {
    setPrizeInfo((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updatePrize = useCallback((index: number, updates: Partial<PrizeInfo>) => {
    setPrizeInfo((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }, [])

  // ─── セクション3: 見積設定 ───
  const [quoteConfig, setQuoteConfig] = useState<QuoteConfigState>(emptyQuoteConfig)
  const { posterPrintQuantity, posterPrintUnitPrice, dmOrderCount, proportionMode, hallPercentages, companyPercentages } = quoteConfig

  const setPosterPrintQuantity = useCallback((v: string) => setQuoteConfig((p) => ({ ...p, posterPrintQuantity: v })), [])
  const setPosterPrintUnitPrice = useCallback((v: string) => setQuoteConfig((p) => ({ ...p, posterPrintUnitPrice: v })), [])
  const setDmOrderCount = useCallback((v: string) => setQuoteConfig((p) => ({ ...p, dmOrderCount: v })), [])
  const setProportionMode = useCallback((mode: "hall" | "company") => setQuoteConfig((p) => ({ ...p, proportionMode: mode })), [])

  const updateTotalQuoteItem = useCallback((itemId: number, value: string) => {
    setQuoteConfig((prev) => ({
      ...prev,
      totalQuoteItems: { ...prev.totalQuoteItems, [itemId]: value },
    }))
  }, [])

  const updateHallPercentage = useCallback((hallName: string, value: number) => {
    setQuoteConfig((prev) => ({
      ...prev,
      hallPercentages: { ...prev.hallPercentages, [hallName]: value },
    }))
  }, [])

  const updateCompanyPercentage = useCallback((companyId: string, value: number) => {
    setQuoteConfig((prev) => ({
      ...prev,
      companyPercentages: { ...prev.companyPercentages, [companyId]: value },
    }))
  }, [])

  // ─── 見積計算 ───
  const posterPrintTotal = useMemo(() => {
    const qty = parseFloat(posterPrintQuantity) || 0
    const price = parseFloat(posterPrintUnitPrice) || 0
    return qty * price
  }, [posterPrintQuantity, posterPrintUnitPrice])

  const totalAmount = useMemo(() => {
    let total = 0
    total += parseFloat(quoteConfig.totalQuoteItems[1] || "0") || 0
    total += posterPrintTotal
    if (dmMailing === "yes") {
      total += parseFloat(quoteConfig.totalQuoteItems[3] || "0") || 0
    }
    total += parseFloat(quoteConfig.totalQuoteItems[4] || "0") || 0
    return total
  }, [quoteConfig.totalQuoteItems, posterPrintTotal, dmMailing])

  const percentageSum = useMemo(() => {
    const validHallNames = halls.filter((h) => h.hallName.trim()).map((h) => h.hallName)
    if (proportionMode === "hall") {
      return validHallNames.reduce((sum, name) => sum + (hallPercentages[name] || 0), 0)
    }
    const uniqueCompanyIds = [...new Set(halls.filter((h) => h.companyId).map((h) => h.companyId))]
    return uniqueCompanyIds.reduce((sum, id) => sum + (companyPercentages[id] || 0), 0)
  }, [halls, proportionMode, hallPercentages, companyPercentages])

  const isPercentageValid = useMemo(() => Math.abs(percentageSum - 100) < 0.01, [percentageSum])

  const handleDistributeEvenly = useCallback(() => {
    const validHallNames = halls.filter((h) => h.hallName.trim()).map((h) => h.hallName)
    if (proportionMode === "hall") {
      const count = validHallNames.length
      if (count === 0) return
      const base = Math.floor(100 / count)
      const remainder = 100 - base * count
      const newPct: Record<string, number> = {}
      validHallNames.forEach((name, i) => { newPct[name] = base + (i < remainder ? 1 : 0) })
      setQuoteConfig((prev) => ({ ...prev, hallPercentages: newPct }))
    } else {
      const uniqueCompanyIds = [...new Set(halls.filter((h) => h.companyId).map((h) => h.companyId))]
      const count = uniqueCompanyIds.length
      if (count === 0) return
      const base = Math.floor(100 / count)
      const remainder = 100 - base * count
      const newPct: Record<string, number> = {}
      uniqueCompanyIds.forEach((id, i) => { newPct[id] = base + (i < remainder ? 1 : 0) })
      setQuoteConfig((prev) => ({ ...prev, companyPercentages: newPct }))
    }
  }, [halls, proportionMode])

  const quoteCalc = useMemo(() => ({
    posterPrintTotal,
    totalAmount,
    percentageSum,
    isPercentageValid,
  }), [posterPrintTotal, totalAmount, percentageSum, isPercentageValid])

  // ─── ホール別見積生成（自動） ───
  const generateHallQuotes = useCallback((): HallQuote[] => {
    const validHalls = halls.filter((h) => h.hallName.trim())
    if (validHalls.length === 0 || !isPercentageValid) return []

    const posterPrintQty = parseFloat(posterPrintQuantity) || 0
    const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0

    const getHallPct = (hall: LotteryHallEntry): number => {
      if (proportionMode === "hall") return hallPercentages[hall.hallName] || 0
      const companyHalls = validHalls.filter((h) => h.companyId === hall.companyId)
      const companyPct = companyPercentages[hall.companyId] || 0
      return companyHalls.length > 0 ? companyPct / companyHalls.length : 0
    }

    /** 納品予定日を生成（25日以前のランダム日付） */
    const makeDeliveryDate = (baseId: number): string => {
      const now = new Date()
      const month = now.getMonth() + (baseId <= 2 ? 0 : 1)
      const year = now.getFullYear() + Math.floor(month / 12)
      const m = month % 12
      const day = 5 + ((baseId * 7) % 20) // 5〜24の範囲
      return `${year}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }
    /** 仕入計上日 = 納品予定日の翌月末 */
    const makePurchaseRecordDate = (deliveryDate: string): string => {
      const d = new Date(deliveryDate)
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 2, 0) // 翌月末
      return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-${String(nextMonth.getDate()).padStart(2, "0")}`
    }

    return validHalls.map((hall) => {
      const pct = getHallPct(hall)
      const items: QuoteItem[] = []

      /** 発注期限 = 納品予定日の7日前 */
      const makeOrderDeadline = (deliveryDate: string): string => {
        const d = new Date(deliveryDate)
        d.setDate(d.getDate() - 7)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      }

      const designAmt = parseFloat(quoteConfig.totalQuoteItems[1] || "0") || 0
      const designUnitPrice = Math.floor((designAmt * pct) / 100)
      const dd1 = makeDeliveryDate(1)
      items.push({ id: 1, name: "ポスターデザイン", category: "イベント", eventSubject: "販促費", modelNumber: "PD-001", rentalGrade: "-", setting: "-", quantity: 1, unitPrice: designUnitPrice, included: true, purchaseReducedTax: "対象外", salesReducedTax: "対象外", purchaseRecordDate: makePurchaseRecordDate(dd1), salesUnitPrice: Math.floor(designUnitPrice * 1.2), orderVendorName: "仕入先A", orderDeadline: makeOrderDeadline(dd1), deliveryDate: dd1, orderId: "", orderDate: "", note: "" })

      const totalPoster = posterPrintQty * posterPrintPrice
      const hallPosterAmt = Math.floor((totalPoster * pct) / 100)
      const hallPosterQty = posterPrintPrice > 0 ? Math.floor(hallPosterAmt / posterPrintPrice) : 0
      const dd2 = makeDeliveryDate(2)
      items.push({ id: 2, name: "ポスター印刷", category: "イベント", eventSubject: "印刷費", modelNumber: "PP-A3", rentalGrade: "-", setting: "-", quantity: hallPosterQty, unitPrice: posterPrintPrice, included: true, purchaseReducedTax: "対象外", salesReducedTax: "対象外", purchaseRecordDate: makePurchaseRecordDate(dd2), salesUnitPrice: Math.floor(posterPrintPrice * 1.25), orderVendorName: "仕入先B", orderDeadline: makeOrderDeadline(dd2), deliveryDate: dd2, orderId: "", orderDate: "", note: "" })

      if (dmMailing === "yes") {
        const dmAmt = parseFloat(quoteConfig.totalQuoteItems[3] || "0") || 0
        const dmUnitPrice = Math.floor((dmAmt * pct) / 100)
        const dd3 = makeDeliveryDate(3)
        items.push({ id: 3, name: "DM発送代行", category: "ポイント", eventSubject: "発送費", modelNumber: "DM-100", rentalGrade: "-", setting: "-", quantity: 1, unitPrice: dmUnitPrice, included: true, purchaseReducedTax: "対象外", salesReducedTax: "対象外", purchaseRecordDate: makePurchaseRecordDate(dd3), salesUnitPrice: Math.floor(dmUnitPrice * 1.2), orderVendorName: "仕入先C", orderDeadline: makeOrderDeadline(dd3), deliveryDate: dd3, orderId: "", orderDate: "", note: "" })
      }

      const sysAmt = parseFloat(quoteConfig.totalQuoteItems[4] || "0") || 0
      const sysUnitPrice = Math.floor((sysAmt * pct) / 100)
      const dd4 = makeDeliveryDate(4)
      items.push({ id: 4, name: "抽選システム利用料", category: "ポイント", eventSubject: "システム費", modelNumber: "SYS-01", rentalGrade: "-", setting: "-", quantity: 1, unitPrice: sysUnitPrice, included: true, purchaseReducedTax: "対象外", salesReducedTax: "対象外", purchaseRecordDate: makePurchaseRecordDate(dd4), salesUnitPrice: Math.floor(sysUnitPrice * 1.2), orderVendorName: "仕入先D", orderDeadline: makeOrderDeadline(dd4), deliveryDate: dd4, orderId: "", orderDate: "", note: "" })

      return {
        hallName: hall.hallName,
        quoteItems: items,
        percentage: pct,
        calculatedAmount: Math.floor((totalAmount * pct) / 100),
      }
    })
  }, [halls, isPercentageValid, posterPrintQuantity, posterPrintUnitPrice, proportionMode, hallPercentages, companyPercentages, quoteConfig.totalQuoteItems, dmMailing, totalAmount])

  const [quoteGenerated, setQuoteGenerated] = useState(false)
  const [hallQuotes, setHallQuotes] = useState<HallQuote[]>([])

  // 自動生成: 割合が有効になったら見積を自動更新
  useEffect(() => {
    if (isPercentageValid && totalAmount > 0) {
      setHallQuotes(generateHallQuotes())
      setQuoteGenerated(true)
    }
  }, [isPercentageValid, totalAmount, generateHallQuotes])

  // デザイン修正費をホール別見積もりに追加
  const addDesignCorrectionToHallQuotes = useCallback((amount: number) => {
    setHallQuotes((prev) => {
      if (prev.length === 0) return prev
      const now = new Date()
      const dd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.min(now.getDate() + 14, 24)).padStart(2, "0")}`
      const prd = (() => { const d = new Date(dd); const nme = new Date(d.getFullYear(), d.getMonth() + 2, 0); return `${nme.getFullYear()}-${String(nme.getMonth() + 1).padStart(2, "0")}-${String(nme.getDate()).padStart(2, "0")}` })()
      const odl = (() => { const d = new Date(dd); d.setDate(d.getDate() - 7); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` })()
      return prev.map((hq) => {
        const pct = hq.percentage || 100
        const hallAmount = Math.floor((amount * pct) / 100)
        const existing = hq.quoteItems.find((item) => item.name === "デザイン修正費")
        const newItem: QuoteItem = {
          id: Math.max(...hq.quoteItems.map((i) => i.id), 0) + 1,
          name: "デザイン修正費", category: "イベント", eventSubject: "修正費", modelNumber: "", rentalGrade: "-",
          quantity: 1, unitPrice: hallAmount, included: true,
          purchaseReducedTax: "対象外", salesReducedTax: "対象外", purchaseRecordDate: prd,
          salesUnitPrice: Math.floor(hallAmount * 1.2),
          orderVendorName: "", orderDeadline: odl, deliveryDate: dd, orderId: "", orderDate: "", note: "",
        }
        const updatedItems = existing
          ? hq.quoteItems.map((item) => item.name === "デザイン修正費" ? { ...item, unitPrice: hallAmount, salesUnitPrice: Math.floor(hallAmount * 1.2) } : item)
          : [...hq.quoteItems, newItem]
        const newTotal = updatedItems.filter((i) => i.included).reduce((s, i) => s + i.quantity * i.unitPrice, 0)
        return { ...hq, quoteItems: updatedItems, calculatedAmount: newTotal }
      })
    })
  }, [])

  // ホール別見積もりの個別項目を編集
  const updateHallQuoteItem = useCallback((hallName: string, itemId: number, updates: Partial<QuoteItem>) => {
    setHallQuotes((prev) => prev.map((hq) => {
      if (hq.hallName !== hallName) return hq
      const updatedItems = hq.quoteItems.map((item) => {
        if (item.id !== itemId) return item
        const updated = { ...item, ...updates }
        // 仕入計上日の自動計算: deliveryDate が変更されたら翌月末を設定
        if (updates.deliveryDate && !updates.purchaseRecordDate) {
          const d = new Date(updates.deliveryDate)
          const nextMonthEnd = new Date(d.getFullYear(), d.getMonth() + 2, 0)
          updated.purchaseRecordDate = `${nextMonthEnd.getFullYear()}-${String(nextMonthEnd.getMonth() + 1).padStart(2, "0")}-${String(nextMonthEnd.getDate()).padStart(2, "0")}`
        }
        return updated
      })
      const newTotal = updatedItems.filter((i) => i.included).reduce((s, i) => s + i.quantity * i.unitPrice, 0)
      return { ...hq, quoteItems: updatedItems, calculatedAmount: newTotal }
    }))
  }, [])

  // ─── セクション4: ステータス ───
  const [proposalStatus, setProposalStatus] = useState<OrderStatus>("before-proposal")
  const [readingCertainty, setReadingCertainty] = useState<"A" | "B" | "C" | "">("")
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus | null>(null)

  const handleStatusChange = useCallback((status: OrderStatus) => {
    setProposalStatus(status)
    if (status === "order-received") {
      setReadingCertainty("")
      setExecutionStatus("実施前")
    }
  }, [])

  const handleConfirmOrder = useCallback(() => {
    handleStatusChange("order-received")
  }, [handleStatusChange])

  // ─── セクション5: 制作進行 ───
  const [aiProofing, setAiProofing] = useState(false)
  const [proofingComplete, setProofingComplete] = useState(false)
  const [showDateError, setShowDateError] = useState(false)
  const [showFontError, setShowFontError] = useState(false)
  const [posterSentToCustomer, setPosterSentToCustomer] = useState(false)
  const [showPosterOrderModal, setShowPosterOrderModal] = useState(false)
  const [showDmCreateModal, setShowDmCreateModal] = useState(false)
  const [posterOrderVendorId, setPosterOrderVendorId] = useState("")
  const [dmCreateVendorId, setDmCreateVendorId] = useState("")

  // デザイン依頼データ
  const [designRequestsVersion, setDesignRequestsVersion] = useState(0)

  // 他タブ・他画面でのデザインリクエスト更新を検知して再読み込み
  useEffect(() => {
    const refresh = () => setDesignRequestsVersion((v) => v + 1)
    // 別タブでlocalStorageが更新された場合
    window.addEventListener("storage", refresh)
    // タブにフォーカスが戻った場合（同タブでのページ遷移後も対応）
    window.addEventListener("focus", refresh)
    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener("focus", refresh)
    }
  }, [])

  const allDesignRequests = useMemo(() => {
    if (!productId) return []
    const product = repository.getProductById(productId)
    if (!product) return []
    return repository.getDesignRequestsByProjectId(product.projectId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, productId, designRequestsVersion])

  const posterRequests = useMemo<DesignRequestInfo[]>(
    () =>
      allDesignRequests
        .filter((r) => r.requestType === "poster")
        .map((r) => ({
          id: r.id,
          requestType: r.requestType,
          status: r.status,
          vendorId: r.vendorId,
          vendorName: r.vendorName,
          requestedAt: r.requestedAt,
          uploadedAt: r.uploadedAt,
          uploadedFileName: r.uploadedFileName,
          comments: r.comments,
        })),
    [allDesignRequests]
  )

  const dmRequests = useMemo<DesignRequestInfo[]>(
    () =>
      allDesignRequests
        .filter((r) => r.requestType === "dm")
        .map((r) => ({
          id: r.id,
          requestType: r.requestType,
          status: r.status,
          vendorId: r.vendorId,
          vendorName: r.vendorName,
          requestedAt: r.requestedAt,
          uploadedAt: r.uploadedAt,
          uploadedFileName: r.uploadedFileName,
          comments: r.comments,
        })),
    [allDesignRequests]
  )

  const latestPosterRequest = useMemo(() => {
    if (posterRequests.length === 0) return null
    return [...posterRequests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0]
  }, [posterRequests])

  const latestDmRequest = useMemo(() => {
    if (dmRequests.length === 0) return null
    return [...dmRequests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0]
  }, [dmRequests])

  const getProductionStatus = useCallback((requests: DesignRequestInfo[]): ProductionStatus => {
    const sorted = [...requests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    const latest = sorted[0]
    if (!latest) return "未依頼"
    if (latest.status === "requested") return "初稿待ち"
    if (latest.status === "uploaded") {
      if (!latest.comments || latest.comments.length === 0) return "修正待ち"
      const last = latest.comments[latest.comments.length - 1]
      if (last.role === "Sales") return "修正依頼済み"
      return "完了"
    }
    return "完了"
  }, [])

  const posterStatus = useMemo(() => getProductionStatus(posterRequests), [getProductionStatus, posterRequests])
  const dmStatus = useMemo(() => getProductionStatus(dmRequests), [getProductionStatus, dmRequests])

  const handleAIProofing = useCallback(() => {
    setAiProofing(true)
    setShowDateError(false)
    setShowFontError(false)
    setTimeout(() => setShowDateError(true), 1500)
    setTimeout(() => {
      setShowFontError(true)
      setAiProofing(false)
      setProofingComplete(true)
    }, 2500)
  }, [])

  const handlePosterOrder = useCallback(() => {
    if (!productId) return
    const product = repository.getProductById(productId)
    if (!product) return
    const partners = TRADING_PARTNERS.filter((t) => t.type === "printing")
    const vendor = partners.find((t) => t.id === posterOrderVendorId) ?? partners[0]
    if (!vendor) return
    const project = repository.getProjects().find((pj) => pj.projectNumber === product.projectNumber)

    repository.createDesignRequest({
      requestType: "poster",
      projectId: product.projectId,
      projectNumber: product.projectNumber,
      projectName: product.eventProductName,
      companyName: project?.companyName ?? "",
      hallNames: product.hallNames ?? [],
      eventStartDate: product.eventStartDate,
      eventEndDate: product.eventEndDate,
      status: "requested",
      vendorId: vendor.id,
      vendorName: vendor.name,
      requestedAt: new Date().toISOString(),
    })
    // 発注後にチャットへ自動メッセージ送信
    const chatMessage = {
      channel: "poster",
      author: "営業",
      content: `ポスター作成を発注しました。\n発注先: ${vendor.name}`,
      timestamp: new Date().toISOString(),
    }
    repository.updateProduct(productId, {
      chatMessages: [...(product.chatMessages ?? []), chatMessage],
    })
    window.dispatchEvent(new CustomEvent("chat-updated", { detail: { productId } }))
    setDesignRequestsVersion((v) => v + 1)
    setShowPosterOrderModal(false)
  }, [productId, posterOrderVendorId, repository])

  const handleDmCreate = useCallback(() => {
    if (!productId) return
    const product = repository.getProductById(productId)
    if (!product) return
    const partners = TRADING_PARTNERS.filter((t) => t.type === "design")
    const vendor = partners.find((t) => t.id === dmCreateVendorId) ?? partners[0]
    if (!vendor) return
    const project = repository.getProjects().find((pj) => pj.projectNumber === product.projectNumber)

    repository.createDesignRequest({
      requestType: "dm",
      projectId: product.projectId,
      projectNumber: product.projectNumber,
      projectName: product.eventProductName,
      companyName: project?.companyName ?? "",
      hallNames: product.hallNames ?? [],
      eventStartDate: product.eventStartDate,
      eventEndDate: product.eventEndDate,
      status: "requested",
      vendorId: vendor.id,
      vendorName: vendor.name,
      requestedAt: new Date().toISOString(),
    })
    // 発注後にチャットへ自動メッセージ送信
    const chatMessage = {
      channel: "dm",
      author: "営業",
      content: `DM作成を依頼しました。\n依頼先: ${vendor.name}`,
      timestamp: new Date().toISOString(),
    }
    repository.updateProduct(productId, {
      chatMessages: [...(product.chatMessages ?? []), chatMessage],
    })
    window.dispatchEvent(new CustomEvent("chat-updated", { detail: { productId } }))
    setDesignRequestsVersion((v) => v + 1)
    setShowDmCreateModal(false)
  }, [productId, dmCreateVendorId, repository])

  const handleSendPosterToCustomer = useCallback(() => {
    setPosterSentToCustomer(true)
  }, [])

  // ─── バリデーション ───
  const isFormValid = useMemo(() => {
    const validHalls = halls.filter((h) => h.hallName.trim())
    return validHalls.length > 0 && eventName.trim() !== "" && eventStartDate !== "" && eventEndDate !== ""
  }, [halls, eventName, eventStartDate, eventEndDate])

  // ─── 編集モード: データロード ───
  useEffect(() => {
    if (!productId) return
    const product = repository.getProductById(productId)
    if (!product) return
    if (product.category !== "ポイント") return

    // 基本情報
    if (product.hallNames?.length) {
      const loadedHalls: LotteryHallEntry[] = product.hallNames.map((name) => {
        const hall = allHalls.find((h) => h.name === name)
        const company = hall ? allCompanies.find((c) => c.id === hall.companyId) : undefined
        return {
          hallName: name,
          companyId: company?.companyId ?? "",
          companyName: company?.name ?? "",
          companySalesPersonName: "",
          hallSalesPersonName: hall?.salesPersonName ?? "",
        }
      })
      setHalls(loadedHalls)
    }
    if (product.serviceName) setServiceName(product.serviceName)
    if (product.dmMailing) setDmMailing(product.dmMailing)
    if (product.eventStartDate) setEventStartDate(product.eventStartDate.replace(/\//g, "-"))
    if (product.eventEndDate) setEventEndDate(product.eventEndDate.replace(/\//g, "-"))
    if (product.salesPersonId) setSalesPersonId(String(product.salesPersonId))
    if (product.insightPersonId) setInsightPersonId(String(product.insightPersonId))
    if (product.readingCertainty) setReadingCertainty(product.readingCertainty)
    if (product.executionStatus) setExecutionStatus(product.executionStatus as ExecutionStatus)
    if (product.proposalStatus) setProposalStatus(product.proposalStatus as OrderStatus)
    if (product.eventProductName) setEventName(product.eventProductName)

    // 景品
    if (product.prizeInfo?.length) setPrizeInfo(product.prizeInfo)

    // 見積
    if (product.quoteConfig) {
      const loadedConfig = { ...product.quoteConfig }
      // ホールがあるが hallPercentages が空の場合、均等配分を自動設定
      if (product.hallNames?.length && (!loadedConfig.hallPercentages || Object.keys(loadedConfig.hallPercentages).length === 0)) {
        const count = product.hallNames.length
        const pct = Math.floor(10000 / count) / 100
        const newPercentages: Record<string, number> = {}
        product.hallNames.forEach((name) => { newPercentages[name] = pct })
        loadedConfig.hallPercentages = newPercentages
      }
      setQuoteConfig(loadedConfig)
    } else if (product.hallNames?.length) {
      // quoteConfig 自体がない場合でもホールがあれば均等配分を設定
      const count = product.hallNames.length
      const pct = Math.floor(10000 / count) / 100
      const newPercentages: Record<string, number> = {}
      product.hallNames.forEach((name) => { newPercentages[name] = pct })
      setQuoteConfig((prev) => ({ ...prev, hallPercentages: newPercentages }))
    }
    if (product.hallQuotes?.length) {
      setHallQuotes(product.hallQuotes)
      setQuoteGenerated(true)
    } else if (product.hallNames?.length) {
      // hallQuotesが未生成の場合、quoteConfigとhallNamesからその場で生成
      const cfg = product.quoteConfig ?? emptyQuoteConfig()
      const hpct: Record<string, number> = (cfg.hallPercentages && Object.keys(cfg.hallPercentages).length > 0)
        ? cfg.hallPercentages
        : (() => {
            const p: Record<string, number> = {}
            const c = product.hallNames!.length
            product.hallNames!.forEach((n) => { p[n] = Math.floor(10000 / c) / 100 })
            return p
          })()
      const pQty = parseFloat(cfg.posterPrintQuantity || "50") || 0
      const pPrice = parseFloat(cfg.posterPrintUnitPrice || "2000") || 0
      const pTotal = pQty * pPrice
      const isDm = (product.dmMailing ?? "yes") === "yes"
      let tAmount = 0
      tAmount += parseFloat(cfg.totalQuoteItems?.[1] || "0") || 0
      tAmount += pTotal
      if (isDm) tAmount += parseFloat(cfg.totalQuoteItems?.[3] || "0") || 0
      tAmount += parseFloat(cfg.totalQuoteItems?.[4] || "0") || 0
      if (tAmount > 0) {
        const mkDD = (baseId: number): string => {
          const now = new Date()
          const month = now.getMonth() + (baseId <= 2 ? 0 : 1)
          const year = now.getFullYear() + Math.floor(month / 12)
          const m = month % 12
          const day = 5 + ((baseId * 7) % 20)
          return `${year}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        }
        const mkPRD = (dd: string): string => {
          const d = new Date(dd)
          const nme = new Date(d.getFullYear(), d.getMonth() + 2, 0)
          return `${nme.getFullYear()}-${String(nme.getMonth() + 1).padStart(2, "0")}-${String(nme.getDate()).padStart(2, "0")}`
        }
        const mkODL = (dd: string): string => {
          const d = new Date(dd); d.setDate(d.getDate() - 7)
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        }
        const generated: HallQuote[] = product.hallNames!.map((name) => {
          const pct = hpct[name] || 0
          const dd1 = mkDD(1); const dd2 = mkDD(2); const dd3 = mkDD(3); const dd4 = mkDD(4)
          const designUp = Math.floor((parseFloat(cfg.totalQuoteItems?.[1] || "0") * pct) / 100)
          const posterQty = pPrice > 0 ? Math.floor((pTotal * pct / 100) / pPrice) : 0
          const items: QuoteItem[] = [
            { id: 1, name: "ポスターデザイン", category: "イベント", eventSubject: "販促費", modelNumber: "PD-001", rentalGrade: "-", setting: "-", quantity: 1, unitPrice: designUp, included: true, purchaseReducedTax: "対象外", salesReducedTax: "対象外", purchaseRecordDate: mkPRD(dd1), salesUnitPrice: Math.floor(designUp * 1.2), orderVendorName: "仕入先A", orderDeadline: mkODL(dd1), deliveryDate: dd1, orderId: "", orderDate: "", note: "" },
            { id: 2, name: "ポスター印刷", category: "イベント", eventSubject: "印刷費", modelNumber: "PP-A3", rentalGrade: "-", setting: "-", quantity: posterQty, unitPrice: pPrice, included: true, purchaseReducedTax: "対象外", salesReducedTax: "対象外", purchaseRecordDate: mkPRD(dd2), salesUnitPrice: Math.floor(pPrice * 1.25), orderVendorName: "仕入先B", orderDeadline: mkODL(dd2), deliveryDate: dd2, orderId: "", orderDate: "", note: "" },
          ]
          if (isDm) {
            const dmUp = Math.floor((parseFloat(cfg.totalQuoteItems?.[3] || "0") * pct) / 100)
            items.push({ id: 3, name: "DM発送代行", category: "ポイント", eventSubject: "発送費", modelNumber: "DM-100", rentalGrade: "-", setting: "-", quantity: 1, unitPrice: dmUp, included: true, purchaseReducedTax: "対象外", salesReducedTax: "対象外", purchaseRecordDate: mkPRD(dd3), salesUnitPrice: Math.floor(dmUp * 1.2), orderVendorName: "仕入先C", orderDeadline: mkODL(dd3), deliveryDate: dd3, orderId: "", orderDate: "", note: "" })
          }
          const sysUp = Math.floor((parseFloat(cfg.totalQuoteItems?.[4] || "0") * pct) / 100)
          items.push({ id: 4, name: "抽選システム利用料", category: "ポイント", eventSubject: "システム費", modelNumber: "SYS-01", rentalGrade: "-", setting: "-", quantity: 1, unitPrice: sysUp, included: true, purchaseReducedTax: "対象外", salesReducedTax: "対象外", purchaseRecordDate: mkPRD(dd4), salesUnitPrice: Math.floor(sysUp * 1.2), orderVendorName: "仕入先D", orderDeadline: mkODL(dd4), deliveryDate: dd4, orderId: "", orderDate: "", note: "" })
          return { hallName: name, quoteItems: items, percentage: pct, calculatedAmount: Math.floor((tAmount * pct) / 100) }
        })
        setHallQuotes(generated)
        setQuoteGenerated(true)
      }
    }

    // salesPerson名
    if (product.salesPersonId) {
      const emp = allEmployees.find((e) => e.id === product.salesPersonId)
      if (emp) setSalesPersonName(emp.name)
    }
    if (product.insightPersonId) {
      const emp = allEmployees.find((e) => e.id === product.insightPersonId)
      if (emp) setInsightPersonName(emp.name)
    }
  }, [productId, repository, allHalls, allCompanies, allEmployees])

  // ─── getLotteryData: 保存用データ ───
  const getLotteryData = useCallback((): LotteryFormState => ({
    halls,
    serviceName,
    dmMailing,
    eventStartDate,
    eventEndDate,
    salesPersonId,
    salesPersonName,
    insightPersonId,
    insightPersonName,
    eventName,
    selectedPrizeSetId,
    prizeInfo,
    quoteConfig,
    quoteGenerated,
    hallQuotes,
    proposalStatus,
    readingCertainty,
    executionStatus,
  }), [
    halls, serviceName, dmMailing, eventStartDate, eventEndDate, salesPersonId, salesPersonName,
    insightPersonId, insightPersonName, eventName, selectedPrizeSetId, prizeInfo,
    quoteConfig, quoteGenerated, hallQuotes, proposalStatus, readingCertainty, executionStatus,
  ])

  return {
    // タブ
    activeTab,
    setActiveTab,
    goToNextTab,
    isLastTab,
    // 基本情報
    halls,
    serviceName,
    dmMailing,
    posterDesignChange,
    eventStartDate,
    eventEndDate,
    salesPersonId,
    salesPersonName,
    insightPersonId,
    insightPersonName,
    eventName,
    addHall,
    removeHall,
    selectCompanyForHall,
    selectHallForEntry,
    setServiceName,
    setDmMailing,
    setPosterDesignChange,
    setEventStartDate,
    setEventEndDate,
    setSalesPersonId,
    setSalesPersonName,
    setInsightPersonId,
    setInsightPersonName,
    setEventName,
    // マスタ
    allCompanies,
    allHalls,
    allEmployees,
    getHallsByCompanyId,
    // 景品
    selectedPrizeSetId,
    prizeInfo,
    vendorCount,
    selectPrizeSet,
    addPrize,
    removePrize,
    updatePrize,
    // 見積
    quoteConfig,
    posterPrintQuantity,
    posterPrintUnitPrice,
    dmOrderCount,
    proportionMode,
    hallPercentages,
    companyPercentages,
    updateTotalQuoteItem,
    addDesignCorrectionToHallQuotes,
    setPosterPrintQuantity,
    setPosterPrintUnitPrice,
    setDmOrderCount,
    setProportionMode,
    updateHallPercentage,
    updateCompanyPercentage,
    handleDistributeEvenly,
    quoteCalc,
    quoteGenerated,
    hallQuotes,
    updateHallQuoteItem,
    // ステータス
    proposalStatus,
    readingCertainty,
    executionStatus,
    handleStatusChange,
    setReadingCertainty,
    setExecutionStatus,
    handleConfirmOrder,
    // 制作進行
    productId,
    posterStatus,
    dmStatus,
    posterRequests,
    latestPosterRequest,
    dmRequests,
    latestDmRequest,
    aiProofing,
    proofingComplete,
    showDateError,
    showFontError,
    handleAIProofing,
    posterSentToCustomer,
    handleSendPosterToCustomer,
    handlePosterOrder,
    handleDmCreate,
    showPosterOrderModal,
    setShowPosterOrderModal,
    showDmCreateModal,
    setShowDmCreateModal,
    posterOrderVendorId,
    setPosterOrderVendorId,
    dmCreateVendorId,
    setDmCreateVendorId,
    // バリデーション
    isFormValid,
    // データ取得
    getLotteryData,
  }
}

export type UseLotteryFormReturn = ReturnType<typeof useLotteryForm>
