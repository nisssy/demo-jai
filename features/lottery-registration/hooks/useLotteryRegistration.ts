"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useProject } from "@/contexts/project-context"
import type { PrizeInfo, HallQuote, DesignRequest, DesignRequestComment } from "@/types/lottery"
import type { LotteryFormState, LotteryHallEntry, QuoteConfigState, CastAssignment, OrderStatus, CastingStatus, ProductionStatus, ExecutionStatus } from "../types"
import { PRIZE_SETS, DEFAULT_TOTAL_QUOTE_ITEMS } from "../constants"
import { useQuoteCalculation } from "./useQuoteCalculation"

type UseLotteryRegistrationArgs = {
  productId?: number
  addNotification: (message: string) => void
}

export function useLotteryRegistration({ productId, addNotification }: UseLotteryRegistrationArgs) {
  const {
    getProductById,
    updateProduct,
    createProduct,
    getHalls,
    getCompanies,
    getCompanyById,
    searchHalls,
    searchCompanies,
    searchEmployees,
    getEmployees,
    getPrizes,
    getPrizeVendors,
    getHallsByCompanyId,
    createDesignRequest: addDesignRequest,
    getDesignRequestsByProjectAndType,
    addDesignRequestComment: addPosterRequestComment,
    updateDesignRequest,
    getTradingPartnersByIndustry,
    designRequests: allDesignRequests,
  } = useProject()

  // --- セクション1: 基本情報 ---
  const [halls, setHalls] = useState<LotteryHallEntry[]>([{ hallName: "", companyId: "", companyName: "", companySalesPersonName: "", hallSalesPersonName: "" }])
  const [dmMailing, setDmMailing] = useState<"yes" | "no">("no")
  const [eventStartDate, setEventStartDate] = useState("")
  const [eventEndDate, setEventEndDate] = useState("")
  const [salesPersonId, setSalesPersonId] = useState("")
  const [salesPersonName, setSalesPersonName] = useState("")
  const [insightPersonId, setInsightPersonId] = useState("")
  const [insightPersonName, setInsightPersonName] = useState("")
  const [eventName, setEventName] = useState("")

  // --- セクション2: 景品セット ---
  const [selectedPrizeSetId, setSelectedPrizeSetId] = useState("")
  const [prizeInfo, setPrizeInfo] = useState<PrizeInfo[]>([{ rank: "A賞", name: "", quantity: "" }])

  // --- セクション3: 見積設定 ---
  const [totalQuoteItems, setTotalQuoteItems] = useState<Record<number, string>>(DEFAULT_TOTAL_QUOTE_ITEMS)
  const [posterPrintQuantity, setPosterPrintQuantity] = useState("50")
  const [posterPrintUnitPrice, setPosterPrintUnitPrice] = useState("2000")
  const [dmOrderCount, setDmOrderCount] = useState("")
  const [proportionMode, setProportionMode] = useState<"hall" | "company">("hall")
  const [hallPercentages, setHallPercentages] = useState<Record<string, number>>({})
  const [companyPercentages, setCompanyPercentages] = useState<Record<string, number>>({})

  // --- セクション4: 見積表示 ---
  const [quoteGenerated, setQuoteGenerated] = useState(false)
  const [hallQuotes, setHallQuotes] = useState<HallQuote[]>([])

  // --- セクション5: ステータス ---
  const [proposalStatus, setProposalStatus] = useState<OrderStatus>("before-proposal")
  const [readingCertainty, setReadingCertainty] = useState<"A" | "B" | "C" | "">("")
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus | null>(null)
  const [castAssignments, setCastAssignments] = useState<CastAssignment[]>([])

  // --- 制作進行 ---
  const [aiProofing, setAiProofing] = useState(false)
  const [proofingComplete, setProofingComplete] = useState(false)
  const [showDateError, setShowDateError] = useState(false)
  const [showFontError, setShowFontError] = useState(false)
  const [showPosterOrderModal, setShowPosterOrderModal] = useState(false)
  const [posterOrderVendorId, setPosterOrderVendorId] = useState("")
  const [showPosterOrderDocumentModal, setShowPosterOrderDocumentModal] = useState(false)
  const [showDmCreateModal, setShowDmCreateModal] = useState(false)
  const [dmCreateVendorId, setDmCreateVendorId] = useState("")
  const [posterCommentText, setPosterCommentText] = useState("")
  const [posterSentToCustomer, setPosterSentToCustomer] = useState(false)
  /** DM依頼詳細・コメント表示中の依頼ID */
  const [designRequestDetailId, setDesignRequestDetailId] = useState<string | null>(null)
  const [designRequestCommentText, setDesignRequestCommentText] = useState("")

  // UI state
  const [hallSearchQueries, setHallSearchQueries] = useState<Record<number, string>>({})
  const [companySearchQueries, setCompanySearchQueries] = useState<Record<number, string>>({})
  const [prizeMasterSearchQuery, setPrizeMasterSearchQuery] = useState("")

  const quoteConfig: QuoteConfigState = useMemo(() => ({
    totalQuoteItems,
    posterPrintQuantity,
    posterPrintUnitPrice,
    dmOrderCount,
    proportionMode,
    hallPercentages,
    companyPercentages,
  }), [totalQuoteItems, posterPrintQuantity, posterPrintUnitPrice, dmOrderCount, proportionMode, hallPercentages, companyPercentages])

  const quoteCalc = useQuoteCalculation({ quoteConfig, halls, dmMailing })

  // マスタデータ
  const allHalls = useMemo(() => getHalls(), [getHalls])
  const allCompanies = useMemo(() => getCompanies(), [getCompanies])
  const allEmployees = useMemo(() => getEmployees(), [getEmployees])
  const allPrizes = useMemo(() => getPrizes(), [getPrizes])
  const allPrizeVendors = useMemo(() => getPrizeVendors(), [getPrizeVendors])

  // --- 既存データの読み込み ---
  useEffect(() => {
    if (!productId) return
    const product = getProductById(productId)
    if (!product || product.category !== "Point") return

    // セクション1
    const productHallNames = (product as any).hallNames as string[] | undefined
    if (productHallNames && productHallNames.length > 0) {
      const hallEntries: LotteryHallEntry[] = productHallNames.map((name) => {
        const hall = allHalls.find((h) => h.name === name)
        const company = hall ? allCompanies.find((c) => c.id === hall.companyId) : undefined
        return {
          hallName: name,
          companyId: company?.companyId || "",
          companyName: company?.name || "",
          companySalesPersonName: company?.salesPersonName || "",
          hallSalesPersonName: hall?.salesPersonName || "",
        }
      })
      setHalls(hallEntries)
    }

    if ((product as any).dmMailing) setDmMailing((product as any).dmMailing)
    if ((product as any).eventStartDate) setEventStartDate(((product as any).eventStartDate as string).replace(/\//g, "-"))
    if ((product as any).eventEndDate) setEventEndDate(((product as any).eventEndDate as string).replace(/\//g, "-"))
    if (product.salesPersonName) {
      setSalesPersonName(product.salesPersonName)
      const emp = allEmployees.find((e) => e.name === product.salesPersonName)
      if (emp) setSalesPersonId(String(emp.id))
    }
    if ((product as any).eventProductName) setEventName((product as any).eventProductName)

    // セクション2
    const productPrizeInfo = (product as any).prizeInfo as PrizeInfo[] | undefined
    if (productPrizeInfo && productPrizeInfo.length > 0) {
      setPrizeInfo(productPrizeInfo)
    }

    // セクション3 & 4: 見積データの復元
    const productHallQuotes = (product as any).hallQuotes as HallQuote[] | undefined
    if (productHallQuotes && productHallQuotes.length > 0) {
      setHallQuotes(productHallQuotes)
      setQuoteGenerated(true)

      // 割合の復元
      const newHallPercentages: Record<string, number> = {}
      productHallQuotes.forEach((hq) => {
        if (hq.percentage !== undefined) {
          newHallPercentages[hq.hallName] = hq.percentage
        }
      })
      setHallPercentages(newHallPercentages)

      // 見積項目金額の逆算
      const firstQuote = productHallQuotes[0]
      if (firstQuote) {
        // ポスター印刷の単価復元
        const posterItem = firstQuote.quoteItems.find((qi) => qi.id === 2)
        if (posterItem && posterItem.unitPrice > 0) {
          setPosterPrintUnitPrice(posterItem.unitPrice.toString())
          let totalQty = 0
          productHallQuotes.forEach((hq) => {
            const item = hq.quoteItems.find((qi) => qi.id === 2)
            if (item) totalQty += item.quantity
          })
          setPosterPrintQuantity(totalQty.toString())
        }

        // 各項目の全体金額を逆算（割合が分かっている場合）
        const newTotalItems: Record<number, string> = { ...DEFAULT_TOTAL_QUOTE_ITEMS }
        ;[1, 3, 4].forEach((itemId) => {
          let totalForItem = 0
          productHallQuotes.forEach((hq) => {
            const item = hq.quoteItems.find((qi) => qi.id === itemId)
            if (item) totalForItem += item.unitPrice
          })
          if (totalForItem > 0) {
            newTotalItems[itemId] = totalForItem.toString()
          }
        })
        setTotalQuoteItems(newTotalItems)
      }
    }

    // セクション5
    const productStatus = (product as any).projectStatus as string | undefined
    if (productStatus) {
      if (productStatus === "受注" || productStatus === "order-received") {
        setProposalStatus("order-received")
      } else if (productStatus === "提案中" || productStatus === "proposing") {
        setProposalStatus("proposing")
      } else {
        setProposalStatus("before-proposal")
      }
    }
    const rc = (product as any).readingCertainty as string | undefined
    if (rc === "A" || rc === "B" || rc === "C") {
      setReadingCertainty(rc)
    }

    // 実施ステータスの復元
    const productExecutionStatus = (product as any).executionStatus as ExecutionStatus | undefined
    if (productExecutionStatus) {
      setExecutionStatus(productExecutionStatus)
    }

    // キャストアサインメントの復元
    const productCastAssignments = (product as any).castAssignments as CastAssignment[] | undefined
    if (productCastAssignments && Array.isArray(productCastAssignments)) {
      setCastAssignments(productCastAssignments)
    }
  }, [productId, getProductById, allHalls, allCompanies, allEmployees])

  // --- ホール操作 ---
  const addHall = useCallback(() => {
    setHalls((prev) => [...prev, { hallName: "", companyId: "", companyName: "", companySalesPersonName: "", hallSalesPersonName: "" }])
  }, [])

  const removeHall = useCallback((index: number) => {
    setHalls((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateHall = useCallback((index: number, updates: Partial<LotteryHallEntry>) => {
    setHalls((prev) => prev.map((h, i) => (i === index ? { ...h, ...updates } : h)))
  }, [])

  const selectCompanyForHall = useCallback((index: number, companyId: string) => {
    const company = allCompanies.find((c) => c.companyId === companyId)
    if (!company) return
    updateHall(index, {
      companyId: company.companyId,
      companyName: company.name,
      companySalesPersonName: company.salesPersonName || "",
      hallName: "",
      hallSalesPersonName: "",
    })
  }, [allCompanies, updateHall])

  const selectHallForEntry = useCallback((index: number, hallName: string) => {
    const hall = allHalls.find((h) => h.name === hallName)
    if (!hall) return
    const company = allCompanies.find((c) => c.id === hall.companyId)
    updateHall(index, {
      hallName: hall.name,
      hallSalesPersonName: hall.salesPersonName,
      companyId: company?.companyId || "",
      companyName: company?.name || "",
      companySalesPersonName: company?.salesPersonName || "",
    })
  }, [allHalls, allCompanies, updateHall])

  // --- 景品操作 ---
  const selectPrizeSet = useCallback((setId: string) => {
    const prizeSet = PRIZE_SETS.find((s) => s.id === setId)
    if (!prizeSet) return
    setSelectedPrizeSetId(setId)
    setPrizeInfo(
      prizeSet.items.map((item) => {
        const prize = allPrizes.find((p) => String(p.id) === item.prizeId)
        const vendor = prize ? allPrizeVendors.find((v) => v.id === prize.vendorId) : undefined
        return {
          prizeId: item.prizeId,
          name: prize?.name ?? "",
          rank: item.rank,
          quantity: item.quantity,
          vendorId: vendor ? String(vendor.id) : undefined,
          vendorName: vendor?.name,
        }
      })
    )
  }, [allPrizes, allPrizeVendors])

  const addPrize = useCallback(() => {
    setPrizeInfo((prev) => [...prev, { rank: "", name: "", quantity: "" }])
  }, [])

  const removePrize = useCallback((index: number) => {
    setPrizeInfo((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updatePrize = useCallback((index: number, updates: Partial<PrizeInfo>) => {
    setPrizeInfo((prev) => prev.map((p, i) => (i === index ? { ...p, ...updates } : p)))
  }, [])

  const addPrizeFromMaster = useCallback((prizeId: string) => {
    const prize = allPrizes.find((p) => String(p.id) === prizeId)
    if (!prize) return
    const vendor = allPrizeVendors.find((v) => v.id === prize.vendorId)
    setPrizeInfo((prev) => [
      ...prev,
      {
        rank: "",
        name: prize.name,
        quantity: "1",
        prizeId: String(prize.id),
        vendorId: vendor ? String(vendor.id) : undefined,
        vendorName: vendor?.name,
      },
    ])
  }, [allPrizes, allPrizeVendors])

  // 業者数の警告
  const vendorCount = useMemo(() => {
    const vendorIds = new Set(prizeInfo.filter((p) => p.vendorId).map((p) => p.vendorId))
    return vendorIds.size
  }, [prizeInfo])

  // --- 見積操作 ---
  const updateTotalQuoteItem = useCallback((itemId: number, value: string) => {
    setTotalQuoteItems((prev) => ({ ...prev, [itemId]: value }))
  }, [])

  const handleDistributeEvenly = useCallback(() => {
    const result = quoteCalc.distributeEvenly()
    setHallPercentages(result.hallPercentages)
    setCompanyPercentages(result.companyPercentages)
  }, [quoteCalc])

  const updateHallPercentage = useCallback((hallName: string, value: number) => {
    setHallPercentages((prev) => ({ ...prev, [hallName]: value }))
  }, [])

  const updateCompanyPercentage = useCallback((companyId: string, value: number) => {
    setCompanyPercentages((prev) => ({ ...prev, [companyId]: value }))
  }, [])

  // 自動見積生成（割合が有効な場合は自動的にホール別見積を更新）
  useEffect(() => {
    if (!quoteCalc.isPercentageValid) return
    const validHalls = halls.filter((h) => h.hallName.trim())
    if (validHalls.length === 0) return
    const generatedQuotes = quoteCalc.generateHallQuotes()
    setHallQuotes(generatedQuotes)
    setQuoteGenerated(true)
  }, [halls, quoteCalc.isPercentageValid, quoteCalc.totalAmount, hallPercentages, companyPercentages, proportionMode, dmMailing, totalQuoteItems, posterPrintQuantity, posterPrintUnitPrice])

  // --- ステータス操作 ---
  const handleStatusChange = useCallback((newStatus: "before-proposal" | "proposing" | "order-received") => {
    setProposalStatus(newStatus)
    if (newStatus === "order-received") {
      setReadingCertainty("")
      setExecutionStatus("実施前")
    } else {
      setExecutionStatus(null)
    }
  }, [])

  const handleConfirmOrder = useCallback(() => {
    setProposalStatus("order-received")
    setReadingCertainty("")
    setExecutionStatus("実施前")
  }, [])

  // --- キャスト管理 ---
  const addCast = useCallback(() => {
    const newCast: CastAssignment = {
      id: `cast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      castType: "その他",
      castName: "",
      status: "未依頼",
    }
    setCastAssignments((prev) => [...prev, newCast])
  }, [])

  const removeCast = useCallback((id: string) => {
    setCastAssignments((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const updateCast = useCallback((id: string, updates: Partial<CastAssignment>) => {
    setCastAssignments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }, [])

  // --- 制作進行: マスタ・依頼データ ---
  const printingPartners = useMemo(() => getTradingPartnersByIndustry("printing"), [getTradingPartnersByIndustry])
  const designPartners = useMemo(() => getTradingPartnersByIndustry("design"), [getTradingPartnersByIndustry])

  const posterRequests = useMemo(() => {
    if (!productId) return [] as DesignRequest[]
    return getDesignRequestsByProjectAndType(productId, "poster")
  }, [productId, getDesignRequestsByProjectAndType, allDesignRequests])

  const dmRequests = useMemo(() => {
    if (!productId) return [] as DesignRequest[]
    return getDesignRequestsByProjectAndType(productId, "dm")
  }, [productId, getDesignRequestsByProjectAndType, allDesignRequests])

  const latestPosterRequest = useMemo(() => {
    if (posterRequests.length === 0) return null
    return [...posterRequests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0]
  }, [posterRequests])

  const latestDmRequest = useMemo(() => {
    if (dmRequests.length === 0) return null
    return [...dmRequests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0]
  }, [dmRequests])

  const getProductionStatus = useCallback((type: "poster" | "dm"): ProductionStatus => {
    const requests = type === "poster" ? posterRequests : dmRequests
    const sorted = [...requests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    const latest = sorted[0]
    if (!latest) return "未依頼"
    if (latest.status === "requested") return "初稿待ち"
    if (latest.status === "uploaded") {
      const comments = latest.comments
      if (comments.length === 0) return "修正待ち"
      const last = comments[comments.length - 1]
      if (last.role === "Sales") return "修正依頼済み"
      return "完了"
    }
    return "完了"
  }, [posterRequests, dmRequests])

  const posterStatus = useMemo(() => getProductionStatus("poster"), [getProductionStatus])
  const dmStatus = useMemo(() => getProductionStatus("dm"), [getProductionStatus])

  // --- 制作進行: ハンドラ ---
  const handleAIProofing = useCallback(() => {
    setAiProofing(true)
    setShowDateError(false)
    setShowFontError(false)
    setTimeout(() => { setShowDateError(true) }, 1500)
    setTimeout(() => { setShowFontError(true); setAiProofing(false); setProofingComplete(true) }, 2500)
  }, [])

  const handlePosterOrder = useCallback(() => {
    if (!productId) return
    const vendor = printingPartners.find((t) => String(t.id) === posterOrderVendorId) ?? printingPartners[0]
    if (!vendor) return
    const validHalls = halls.filter((h) => h.hallName.trim())
    addDesignRequest({
      requestType: "poster",
      projectId: productId,
      projectName: eventName,
      companyName: validHalls[0]?.companyName || "",
      hallNames: validHalls.map((h) => h.hallName),
      eventStartDate: eventStartDate.replace(/-/g, "/"),
      eventEndDate: eventEndDate.replace(/-/g, "/"),
      requestedAt: new Date().toISOString(),
      requestedBy: salesPersonId || "Sales",
      requestedByName: salesPersonName || "営業",
      status: "requested",
      vendorId: String(vendor.id),
      vendorName: vendor.name,
      comments: [],
      prizeInfo,
    })
    setShowPosterOrderModal(false)
    addNotification(`${vendor.name}にポスター制作を依頼しました`)
  }, [productId, posterOrderVendorId, printingPartners, halls, eventName, eventStartDate, eventEndDate, salesPersonId, salesPersonName, prizeInfo, addDesignRequest, addNotification])

  const handleDmCreate = useCallback(() => {
    if (!productId) return
    const vendor = designPartners.find((t) => String(t.id) === dmCreateVendorId) ?? designPartners[0]
    if (!vendor) return
    const validHalls = halls.filter((h) => h.hallName.trim())
    addDesignRequest({
      requestType: "dm",
      projectId: productId,
      projectName: eventName,
      companyName: validHalls[0]?.companyName || "",
      hallNames: validHalls.map((h) => h.hallName),
      eventStartDate: eventStartDate.replace(/-/g, "/"),
      eventEndDate: eventEndDate.replace(/-/g, "/"),
      requestedAt: new Date().toISOString(),
      requestedBy: salesPersonId || "Sales",
      requestedByName: salesPersonName || "営業",
      status: "requested",
      vendorId: String(vendor.id),
      vendorName: vendor.name,
      comments: [],
    })
    setShowDmCreateModal(false)
    addNotification(`${vendor.name}にDM作成を依頼しました`)
  }, [productId, dmCreateVendorId, designPartners, halls, eventName, eventStartDate, eventEndDate, salesPersonId, salesPersonName, addDesignRequest, addNotification])

  const handlePosterComment = useCallback(() => {
    if (!posterCommentText.trim() || !latestPosterRequest) return
    addPosterRequestComment(latestPosterRequest.id, {
      role: "Sales",
      authorId: salesPersonId,
      authorName: salesPersonName || "営業",
      text: posterCommentText.trim(),
      createdAt: new Date().toISOString(),
    })
    setPosterCommentText("")
    addNotification("コメントを送信しました")
  }, [posterCommentText, latestPosterRequest, salesPersonId, salesPersonName, addPosterRequestComment, addNotification])

  const handleSendPosterToCustomer = useCallback(() => {
    setPosterSentToCustomer(true)
    addNotification("顧客（ホール）へポスターを送信しました")
  }, [addNotification])

  /** デザイン依頼詳細のコメント送信（DM等汎用） */
  const handleDesignRequestComment = useCallback(() => {
    if (!designRequestCommentText.trim() || !designRequestDetailId) return
    addPosterRequestComment(designRequestDetailId, {
      role: "Sales",
      authorId: salesPersonId,
      authorName: salesPersonName || "営業",
      text: designRequestCommentText.trim(),
      createdAt: new Date().toISOString(),
    })
    setDesignRequestCommentText("")
    addNotification("コメントを送信しました")
  }, [designRequestCommentText, designRequestDetailId, salesPersonId, salesPersonName, addPosterRequestComment, addNotification])

  /** デザイン依頼詳細を取得 */
  const selectedDesignRequest = useMemo(() => {
    if (!designRequestDetailId) return null
    return allDesignRequests.find((r) => r.id === designRequestDetailId) ?? null
  }, [designRequestDetailId, allDesignRequests])

  // --- タブ管理 ---
  const TAB_ORDER = ["basic-info", "prize-set", "quote", "status", "production"] as const
  type TabId = typeof TAB_ORDER[number]
  const [activeTab, setActiveTab] = useState<TabId>("basic-info")

  const goToNextTab = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab)
    if (currentIndex < TAB_ORDER.length - 1) {
      setActiveTab(TAB_ORDER[currentIndex + 1])
    }
  }, [activeTab])

  const goToPreviousTab = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(TAB_ORDER[currentIndex - 1])
    }
  }, [activeTab])

  // --- PDF/通知モーダル ---
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfOutputHallName, setPdfOutputHallName] = useState<string | null>(null)
  const [pdfStep, setPdfStep] = useState<"template" | "preview">("template")
  const [pdfEditableItems, setPdfEditableItems] = useState<import("@/types/lottery").QuoteItem[]>([])
  const [isEditingPdf, setIsEditingPdf] = useState(false)

  const openPdfModal = useCallback((hallName: string) => {
    const hq = hallQuotes.find((q) => q.hallName === hallName)
    const baseItems = hq && hq.quoteItems.length > 0
      ? hq.quoteItems
      : [
          { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 50000, included: true },
          { id: 2, name: "ポスター印刷", quantity: 50, unitPrice: 2000, included: true },
          { id: 3, name: "DM発送代行", quantity: 1, unitPrice: 150000, included: true },
          { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 30000, included: true },
        ]
    const filtered = dmMailing === "yes" ? baseItems : baseItems.filter((i) => i.id !== 3)
    setPdfEditableItems(filtered.map((i) => ({ ...i })))
    setPdfOutputHallName(hallName)
    setPdfStep("template")
    setIsEditingPdf(false)
    setShowPdfModal(true)
  }, [hallQuotes, dmMailing])

  const closePdfModal = useCallback(() => {
    setShowPdfModal(false)
    setPdfOutputHallName(null)
    setPdfEditableItems([])
    setIsEditingPdf(false)
  }, [])

  const handlePdfDownload = useCallback(() => {
    closePdfModal()
    addNotification("見積書PDFがダウンロードされました")
  }, [closePdfModal, addNotification])

  // --- メール通知モーダル ---
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [notifyHallName, setNotifyHallName] = useState<string | null>(null)
  const [notifyStep, setNotifyStep] = useState(0)
  const [notifyMessage, setNotifyMessage] = useState("")
  const [emailTo, setEmailTo] = useState<string[]>([])
  const [emailFrom, setEmailFrom] = useState<number | string | null>(null)
  const [emailFromInput, setEmailFromInput] = useState("")
  const [emailCc, setEmailCc] = useState<number[]>([])
  const [emailBcc, setEmailBcc] = useState<number[]>([])

  const openNotifyModal = useCallback((hallName: string) => {
    setNotifyHallName(hallName)
    const hall = halls.find((h) => h.hallName === hallName)
    // To: ホールのメールアドレスを初期値に
    const hallData = allHalls.find((h) => h.name === hallName)
    const initialTo: string[] = []
    if (hallData?.email) initialTo.push(hallData.email)
    setEmailTo(initialTo)
    // From: 営業担当を初期値に
    const salesEmp = salesPersonName ? allEmployees.find((e) => e.name === salesPersonName) : null
    if (salesEmp) {
      setEmailFrom(salesEmp.id)
      setEmailFromInput(salesEmp.name)
    } else {
      const defaultEmp = allEmployees.find((e) => e.id === 1)
      setEmailFrom(defaultEmp?.id ?? null)
      setEmailFromInput(defaultEmp?.name || "")
    }
    setEmailCc([])
    setEmailBcc([])
    setNotifyMessage(
      `${hall?.companyName || ""} ${hallName} 御中\n\n` +
      `いつもお世話になっております。\n` +
      `下記の通り、合同抽選会のお見積書をお送りいたします。\n\n` +
      `イベント名: ${eventName}\n` +
      `期間: ${eventStartDate} ～ ${eventEndDate}\n\n` +
      `ご確認のほどよろしくお願いいたします。`
    )
    setNotifyStep(0)
    setShowNotifyModal(true)
  }, [halls, allHalls, allEmployees, salesPersonName, eventName, eventStartDate, eventEndDate])

  const closeNotifyModal = useCallback(() => {
    setShowNotifyModal(false)
    setNotifyHallName(null)
    setNotifyStep(0)
    setEmailTo([])
    setEmailFrom(null)
    setEmailFromInput("")
    setEmailCc([])
    setEmailBcc([])
  }, [])

  const handleSendNotification = useCallback(() => {
    closeNotifyModal()
    addNotification("見積書を顧客に送信しました")
  }, [closeNotifyModal, addNotification])

  // --- 保存 ---
  const save = useCallback((): { success: boolean; productId?: number } => {
    const validHalls = halls.filter((h) => h.hallName.trim())
    const hallNames = validHalls.map((h) => h.hallName)
    const startDate = (eventStartDate || "").replace(/-/g, "/")
    const endDate = (eventEndDate || "").replace(/-/g, "/")

    // ステータスマッピング（合同抽選会固有のラベル）
    const projectStatusMap: Record<string, string> = {
      "before-proposal": "提案前",
      "proposing": "提案中",
      "order-received": "受注",
    }
    const statusMap: Record<string, "proposed" | "ordered"> = {
      "before-proposal": "proposed",
      "proposing": "proposed",
      "order-received": "ordered",
    }

    // 合計見積金額
    const totalBillingAmount = hallQuotes.length > 0
      ? hallQuotes.reduce((sum, hq) => sum + (hq.calculatedAmount || 0), 0)
      : quoteCalc.totalAmount

    const lotteryData = {
      category: "Point",
      eventType: "合同抽選会",
      eventProductName: eventName,
      eventStartDate: startDate,
      eventEndDate: endDate,
      hallNames,
      dmMailing,
      area: "",
      readingCertainty: readingCertainty || undefined,
      budget: `¥${totalBillingAmount.toLocaleString()}`,
      prizeInfo,
      hallQuotes: hallQuotes.length > 0 ? hallQuotes : undefined,
      quoteGenerated,
      estimatedBillingAmount: totalBillingAmount,
      estimateAmount: `¥${totalBillingAmount.toLocaleString()}`,
      date: startDate,
      status: statusMap[proposalStatus] || "proposed",
      projectStatus: projectStatusMap[proposalStatus] || "見積送付完了",
      salesPersonName,
      executionStatus: executionStatus || undefined,
      castAssignments,
    }

    if (productId) {
      // 編集
      const existing = getProductById(productId)
      if (!existing) {
        addNotification("案件が見つかりませんでした")
        return { success: false }
      }
      updateProduct(productId, {
        ...lotteryData,
        clientName: existing.clientName || hallNames[0] || "",
        venue: existing.venue || hallNames[0] || "",
        talent: salesPersonName || existing.talent,
        hallName: existing.hallName || hallNames[0] || "",
        companyId: existing.companyId,
        companyName: existing.companyName,
      })
      return { success: true, productId }
    }

    // 新規作成
    const primaryHall = validHalls[0]
    const created = createProduct({
      ...lotteryData,
      clientName: primaryHall?.companyName || primaryHall?.hallName || "",
      venue: primaryHall?.hallName || "",
      talent: salesPersonName,
      hallName: primaryHall?.hallName || "",
      companyId: primaryHall?.companyId || "",
      companyName: primaryHall?.companyName || "",
      requestDate: new Date().toISOString().split("T")[0],
    } as any)
    return { success: true, productId: created.id }
  }, [
    halls, eventStartDate, eventEndDate, eventName, dmMailing,
    readingCertainty, prizeInfo, hallQuotes, quoteGenerated,
    proposalStatus, salesPersonName, productId, quoteCalc.totalAmount,
    executionStatus, castAssignments,
    getProductById, updateProduct, createProduct, addNotification,
  ])

  // フォーム全体の有効性
  const isFormValid = useMemo(() => {
    const validHalls = halls.filter((h) => h.hallName.trim())
    return validHalls.length > 0 && eventName.trim() !== "" && eventStartDate !== "" && eventEndDate !== ""
  }, [halls, eventName, eventStartDate, eventEndDate])

  return {
    // 案件ID
    productId,

    // セクション1
    halls,
    dmMailing,
    eventStartDate,
    eventEndDate,
    salesPersonId,
    salesPersonName,
    insightPersonId,
    insightPersonName,
    eventName,
    setDmMailing,
    setEventStartDate,
    setEventEndDate,
    setSalesPersonId,
    setSalesPersonName,
    setInsightPersonId,
    setInsightPersonName,
    setEventName,
    addHall,
    removeHall,
    updateHall,
    selectCompanyForHall,
    selectHallForEntry,
    hallSearchQueries,
    setHallSearchQueries,
    companySearchQueries,
    setCompanySearchQueries,

    // セクション2
    selectedPrizeSetId,
    prizeInfo,
    selectPrizeSet,
    addPrize,
    removePrize,
    updatePrize,
    addPrizeFromMaster,
    vendorCount,
    prizeMasterSearchQuery,
    setPrizeMasterSearchQuery,

    // セクション3
    quoteConfig,
    updateTotalQuoteItem,
    posterPrintQuantity,
    posterPrintUnitPrice,
    dmOrderCount,
    setPosterPrintQuantity,
    setPosterPrintUnitPrice,
    setDmOrderCount,
    proportionMode,
    setProportionMode,
    hallPercentages,
    companyPercentages,
    updateHallPercentage,
    updateCompanyPercentage,
    handleDistributeEvenly,
    quoteCalc,

    // セクション3+4: 見積（統合）
    quoteGenerated,
    hallQuotes,

    // 制作進行
    aiProofing,
    proofingComplete,
    showDateError,
    showFontError,
    showPosterOrderModal,
    setShowPosterOrderModal,
    posterOrderVendorId,
    setPosterOrderVendorId,
    showPosterOrderDocumentModal,
    setShowPosterOrderDocumentModal,
    showDmCreateModal,
    setShowDmCreateModal,
    dmCreateVendorId,
    setDmCreateVendorId,
    posterCommentText,
    setPosterCommentText,
    posterSentToCustomer,
    designRequestDetailId,
    setDesignRequestDetailId,
    designRequestCommentText,
    setDesignRequestCommentText,
    selectedDesignRequest,
    handleDesignRequestComment,
    printingPartners,
    designPartners,
    posterRequests,
    dmRequests,
    latestPosterRequest,
    latestDmRequest,
    posterStatus,
    dmStatus,
    handleAIProofing,
    handlePosterOrder,
    handleDmCreate,
    handlePosterComment,
    handleSendPosterToCustomer,

    // セクション5
    proposalStatus,
    readingCertainty,
    executionStatus,
    castAssignments,
    handleStatusChange,
    setReadingCertainty,
    setExecutionStatus,
    handleConfirmOrder,
    addCast,
    removeCast,
    updateCast,

    // タブ管理
    activeTab,
    setActiveTab,
    goToNextTab,
    goToPreviousTab,
    TAB_ORDER,

    // PDF/通知モーダル
    showPdfModal,
    pdfOutputHallName,
    pdfStep,
    setPdfStep,
    pdfEditableItems,
    setPdfEditableItems,
    isEditingPdf,
    setIsEditingPdf,
    openPdfModal,
    closePdfModal,
    handlePdfDownload,
    showNotifyModal,
    notifyHallName,
    notifyStep,
    setNotifyStep,
    notifyMessage,
    setNotifyMessage,
    emailTo,
    setEmailTo,
    emailFrom,
    setEmailFrom,
    emailFromInput,
    setEmailFromInput,
    emailCc,
    setEmailCc,
    emailBcc,
    setEmailBcc,
    openNotifyModal,
    closeNotifyModal,
    handleSendNotification,

    // 全体
    save,
    isFormValid,

    // マスタデータ
    allHalls,
    allCompanies,
    allEmployees,
    allPrizes,
    allPrizeVendors,
    searchHalls,
    searchCompanies,
    searchEmployees,
    getHallsByCompanyId,
  }
}

export type UseLotteryRegistrationReturn = ReturnType<typeof useLotteryRegistration>
