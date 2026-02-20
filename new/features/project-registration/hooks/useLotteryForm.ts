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
  const [dmMailing, setDmMailing] = useState<"yes" | "no">("no")
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

    return validHalls.map((hall) => {
      const pct = getHallPct(hall)
      const items: QuoteItem[] = []

      const designAmt = parseFloat(quoteConfig.totalQuoteItems[1] || "0") || 0
      items.push({ id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: Math.floor((designAmt * pct) / 100), included: true })

      const totalPoster = posterPrintQty * posterPrintPrice
      const hallPosterAmt = Math.floor((totalPoster * pct) / 100)
      const hallPosterQty = posterPrintPrice > 0 ? Math.floor(hallPosterAmt / posterPrintPrice) : 0
      items.push({ id: 2, name: "ポスター印刷", quantity: hallPosterQty, unitPrice: posterPrintPrice, included: true })

      if (dmMailing === "yes") {
        const dmAmt = parseFloat(quoteConfig.totalQuoteItems[3] || "0") || 0
        items.push({ id: 3, name: "DM発送代行", quantity: 1, unitPrice: Math.floor((dmAmt * pct) / 100), included: true })
      }

      const sysAmt = parseFloat(quoteConfig.totalQuoteItems[4] || "0") || 0
      items.push({ id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: Math.floor((sysAmt * pct) / 100), included: true })

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
      setQuoteConfig(product.quoteConfig)
    }
    if (product.hallQuotes?.length) {
      setHallQuotes(product.hallQuotes)
      setQuoteGenerated(true)
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
    halls, dmMailing, eventStartDate, eventEndDate, salesPersonId, salesPersonName,
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
    dmMailing,
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
    setDmMailing,
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
