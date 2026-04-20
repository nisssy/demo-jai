import type { PrizeInfo, HallQuote, QuoteItem } from "@/new/api/types"

/** 受注ステータス */
export type OrderStatus = "before-proposal" | "proposing" | "order-received"

/** 実施ステータス */
export type ExecutionStatus = "実施前" | "実施中" | "終了"

/** 制作進行ステータス */
export type ProductionStatus = "未依頼" | "初稿待ち" | "修正依頼済み" | "修正待ち" | "完了"

/** ホール行の入力状態 */
export type LotteryHallEntry = {
  hallName: string
  companyId: string
  companyName: string
  companySalesPersonName: string
  hallSalesPersonName: string
}

/** 見積もり設定の入力状態 */
export type QuoteConfigState = {
  totalQuoteItems: Record<number, string>
  posterPrintQuantity: string
  posterPrintUnitPrice: string
  dmOrderCount: string
  proportionMode: "hall" | "company"
  hallPercentages: Record<string, number>
  companyPercentages: Record<string, number>
}

/** 合同抽選会フォーム全体の状態 */
export type LotteryFormState = {
  // 基本情報
  halls: LotteryHallEntry[]
  serviceName: "たまリッチ" | "SmartPoint" | ""
  dmMailing: "yes" | "no"
  eventStartDate: string
  eventEndDate: string
  salesPersonId: string
  salesPersonName: string
  insightPersonId: string
  insightPersonName: string
  eventName: string
  // 景品セット
  selectedPrizeSetId: string
  prizeInfo: PrizeInfo[]
  // 見積設定
  quoteConfig: QuoteConfigState
  // 見積表示
  quoteGenerated: boolean
  hallQuotes: HallQuote[]
  // ステータス
  proposalStatus: OrderStatus
  readingCertainty: "A" | "B" | "C" | ""
  executionStatus: ExecutionStatus | null
}

/** useLotteryForm の返り値の型 */
export type UseLotteryFormReturn = {
  // タブ
  activeTab: string
  setActiveTab: (tab: string) => void
  goToNextTab: () => void
  isLastTab: boolean
  // 基本情報
  halls: LotteryHallEntry[]
  serviceName: "たまリッチ" | "SmartPoint" | ""
  dmMailing: "yes" | "no"
  eventStartDate: string
  eventEndDate: string
  salesPersonId: string
  salesPersonName: string
  insightPersonId: string
  insightPersonName: string
  eventName: string
  addHall: () => void
  removeHall: (index: number) => void
  selectCompanyForHall: (index: number, companyId: string) => void
  selectHallForEntry: (index: number, hallName: string) => void
  setServiceName: (value: "たまリッチ" | "SmartPoint" | "") => void
  setDmMailing: (value: "yes" | "no") => void
  setEventStartDate: (value: string) => void
  setEventEndDate: (value: string) => void
  setSalesPersonId: (value: string) => void
  setSalesPersonName: (value: string) => void
  setInsightPersonId: (value: string) => void
  setInsightPersonName: (value: string) => void
  setEventName: (value: string) => void
  // マスタ
  allCompanies: { id: number; companyId: string; name: string }[]
  allHalls: { id: number; hallId: string; name: string; salesPersonName: string; companyId: number }[]
  allEmployees: { id: number; name: string; department?: string }[]
  getHallsByCompanyId: (companyId: number) => { id: number; hallId: string; name: string; salesPersonName: string; companyId: number }[]
  // 景品
  selectedPrizeSetId: string
  prizeInfo: PrizeInfo[]
  vendorCount: number
  selectPrizeSet: (setId: string) => void
  addPrize: () => void
  removePrize: (index: number) => void
  updatePrize: (index: number, updates: Partial<PrizeInfo>) => void
  // 見積
  quoteConfig: QuoteConfigState
  posterPrintQuantity: string
  posterPrintUnitPrice: string
  dmOrderCount: string
  proportionMode: "hall" | "company"
  hallPercentages: Record<string, number>
  companyPercentages: Record<string, number>
  updateTotalQuoteItem: (itemId: number, value: string) => void
  setPosterPrintQuantity: (value: string) => void
  setPosterPrintUnitPrice: (value: string) => void
  setDmOrderCount: (value: string) => void
  setProportionMode: (mode: "hall" | "company") => void
  updateHallPercentage: (hallName: string, value: number) => void
  updateCompanyPercentage: (companyId: string, value: number) => void
  handleDistributeEvenly: () => void
  quoteCalc: {
    posterPrintTotal: number
    totalAmount: number
    percentageSum: number
    isPercentageValid: boolean
  }
  quoteGenerated: boolean
  hallQuotes: HallQuote[]
  updateHallQuoteItem: (hallName: string, itemId: number, updates: Partial<QuoteItem>) => void
  // ステータス
  proposalStatus: OrderStatus
  readingCertainty: "A" | "B" | "C" | ""
  executionStatus: ExecutionStatus | null
  handleStatusChange: (status: OrderStatus) => void
  setReadingCertainty: (value: "A" | "B" | "C" | "") => void
  setExecutionStatus: (status: ExecutionStatus) => void
  handleConfirmOrder: () => void
  // 制作進行
  productId?: number
  posterStatus: ProductionStatus
  dmStatus: ProductionStatus
  posterRequests: DesignRequestInfo[]
  latestPosterRequest: DesignRequestInfo | null
  dmRequests: DesignRequestInfo[]
  latestDmRequest: DesignRequestInfo | null
  aiProofing: boolean
  proofingComplete: boolean
  showDateError: boolean
  showFontError: boolean
  handleAIProofing: () => void
  posterCommentText: string
  setPosterCommentText: (value: string) => void
  handlePosterComment: () => void
  posterSentToCustomer: boolean
  handleSendPosterToCustomer: () => void
  handlePosterOrder: () => void
  handleDmCreate: () => void
  showPosterOrderModal: boolean
  setShowPosterOrderModal: (open: boolean) => void
  showDmCreateModal: boolean
  setShowDmCreateModal: (open: boolean) => void
  posterOrderVendorId: string
  setPosterOrderVendorId: (id: string) => void
  dmCreateVendorId: string
  setDmCreateVendorId: (id: string) => void
  // バリデーション
  isFormValid: boolean
  // データ取得
  getLotteryData: () => LotteryFormState
}

/** デザイン依頼情報（View向け簡略版） */
export type DesignRequestInfo = {
  id: string
  requestType: "poster" | "dm" | "winner-list"
  status: "requested" | "uploaded"
  vendorId: string
  vendorName?: string
  requestedAt: string
  uploadedAt?: string
  uploadedFileName?: string
  comments?: { id: string; text: string; role: string; authorName?: string; createdAt: string }[]
}
