/** キャスティングステータス */
export type BookingStatus =
  | "tentative_requesting"   // 仮押さえ依頼中
  | "tentative_failed"       // 仮押さえ不可
  | "tentative_completed"    // 仮押さえ完了
  | "confirmed_requesting"   // 本押さえ依頼中
  | "confirmed_failed"       // 本押さえ不可
  | "confirmed_completed"    // 本押さえ完了

/** 提案ステータス（全商材共通） */
export type ProposalStatus = "before-proposal" | "proposing" | "order-received"

/** 実施ステータス（全商材共通） */
export type ExecutionStatus = "実施前" | "実施中" | "終了"

/** 外注業者進捗ステータス */
export type ProductProgressStatus = "not_started" | "report_uploaded" | "pachitown_linked" | "post_event_done"

/** マネジメント部確認ステータス */
export type ManagementConfirmationStatus = "unconfirmed" | "under-review" | "revision-requested" | "approved"

// ─── 案件エンティティ ───

export type Project = {
  id: number
  projectNumber: string
  projectName: string
  companyName: string
  companyId: string
  hallName: string
  hallId: string
  salesPersonName: string
  requestDate: string
  createdAt: string
  updatedAt: string
}

// ─── 商材エンティティ ───

export type Product = {
  id: number
  projectId: number
  projectNumber: string
  category: string
  eventType: string
  eventProductName: string
  eventDate: string
  estimatedBillingAmount: number
  proposalStatus: ProposalStatus
  // キャスト
  companionCount: string
  directorCount: string
  mcCount: string
  selectedCompanions: string[]
  selectedDirectors: string[]
  selectedMcs: string[]
  companionBookingStatus: Record<string, BookingStatus>
  directorBookingStatus: Record<string, BookingStatus>
  mcBookingStatus: Record<string, BookingStatus>
  companionCostumes?: Record<string, string>
  // 時間・表示設定
  startTime?: string
  endTime?: string
  mustSeeFlag?: string
  mustSeePublication?: string
  publicationDate?: string
  publicationTime?: string
  reportRequired?: string
  // 実施ステータス（全商材共通）
  executionStatus?: ExecutionStatus
  // コメント（ロール間のやり取り）
  comments?: ProductComment[]
  temporaryHoldFailureComment?: string
  // キャスト別仮押さえ不可コメント（マネジメント部用）
  companionTentativeHoldFailureComment?: Record<string, string>
  directorTentativeHoldFailureComment?: Record<string, string>
  mcTentativeHoldFailureComment?: Record<string, string>
  // ステータス履歴（マネジメント部用）
  statusHistory?: StatusHistoryEntry[]
  // コスト（マネジメント部用）
  castingCost?: number
  transportationFee?: number
  accommodationFee?: number
  postPRCost?: number
  // アンケート（マネジメント部・外注業者用）
  surveySent?: boolean
  surveySentDate?: string
  surveyResult?: SurveyResult
  // イベント写真・レポート（外注業者用）
  eventPhotos?: string[]
  reportUploaded?: boolean
  reportUploadedAt?: string
  reportNote?: string
  postEventTransactionResult?: string
  postEventMachineData?: string
  // 商材管理課用
  targetMachineNames?: string[]
  pachitownMachineNames?: string[]
  pachitownLinked?: boolean
  pachitownLinkedDate?: string
  bannerGenerated?: boolean
  bannerData?: BannerData
  // 合同抽選会
  dmMailing?: "yes" | "no"
  hallNames?: string[]
  eventStartDate?: string
  eventEndDate?: string
  salesPersonId?: number
  insightPersonId?: number
  readingCertainty?: "A" | "B" | "C"
  posterCount?: number
  area?: string
  budget?: string
  prizeInfo?: PrizeInfo[]
  hallQuotes?: HallQuote[]
  quoteConfig?: QuoteConfig
  prizeOrderedAt?: string
  winnerListUploadedAt?: string
  winnerListValidatedAt?: string
  // 合同抽選会 - 当選者・発注・配送（事務管理課用）
  winnerList?: WinnerInfo[]
  notificationOrderGeneratedAt?: string
  notificationOrderSentAt?: string
  notificationOrderDesignVendorId?: string
  notificationOrderDesignVendorName?: string
  prizeOrderGeneratedAt?: string
  prizeOrderRequestedAt?: string
  prizeOrdersByVendor?: PrizeOrderDocument[]
  quoCardLetterCheckedAt?: string
  prizeDeliveryInfoByVendor?: PrizeDeliveryInfoByVendor[]
  // マネジメント部確認
  managementConfirmationStatus?: ManagementConfirmationStatus
  // 部門間チャット
  chatMessages?: ChatMessage[]
}

// ─── 合同抽選会サブ型 ───

export type PrizeInfo = {
  rank: string
  name: string
  quantity: string
  prizeId?: string
  vendorId?: string
  vendorName?: string
}

export type QuoteItem = {
  id: number
  name: string
  quantity: number
  unitPrice: number
  included: boolean
}

export type HallQuote = {
  hallName: string
  quoteItems: QuoteItem[]
  percentage?: number
  calculatedAmount?: number
}

/** 見積設定（割合・項目金額の入力値） */
export type QuoteConfig = {
  totalQuoteItems: Record<number, string>
  posterPrintQuantity: string
  posterPrintUnitPrice: string
  dmOrderCount: string
  proportionMode: "hall" | "company"
  hallPercentages: Record<string, number>
  companyPercentages: Record<string, number>
}

/** 当選者情報 */
export type WinnerInfo = {
  id: string
  name: string
  address?: string
  phone?: string
  prize?: string
}

/** 配送情報（当選者ごと） */
export type DeliveryInfo = {
  winnerId: string
  winnerName: string
  carrierName?: string
  trackingNumber?: string
  shippedAt?: string
}

/** 景品発注書（1業者分） */
export type PrizeOrderDocument = {
  vendorId: string
  vendorName: string
  requestedAt: string
  prizeItems: PrizeInfo[]
}

/** 業者ごとの配送情報 */
export type PrizeDeliveryInfoByVendor = {
  vendorId: string
  vendorName: string
  deliveredAt?: string
  carrierName?: string
  trackingNumber?: string
  shippedAt?: string
  deliveries?: DeliveryInfo[]
}

// ─── 商材コメント（ロール間やり取り） ───

export type ProductComment = {
  author: string
  content: string
  timestamp: string
}

// ─── 部門間チャットメッセージ ───

export type ChatMessage = {
  channel: string    // 部門名（例: "マネジメント部", "外注業者"）
  author: string     // 発言者ロール
  content: string
  timestamp: string
}

// ─── ステータス履歴 ───

export type StatusHistoryEntry = {
  status: string
  timestamp: string
  changedBy?: string
  note?: string
}

// ─── アンケート結果 ───

export type SurveyResult = {
  satisfaction?: string
  comment?: string
  nextEventDesired?: string
  improvementRequest?: string
}

// ─── 商材管理課サブ型 ───

export type MachineMaster = {
  id: number
  name: string
  pachitownName: string
}

export type BannerData = {
  date: string
  dayOfWeek: string
  prefecture: string
  storeName: string
  targetMachines: string[]
}

// ─── デザイン依頼 ───

export type DesignRequestComment = {
  id: string
  text: string
  role: string
  authorName?: string
  createdAt: string
}

export type DesignRequest = {
  id: string
  requestType: "poster" | "dm" | "winner-list"
  projectId: number
  projectNumber?: string
  projectName?: string
  companyName?: string
  hallNames?: string[]
  eventStartDate?: string
  eventEndDate?: string
  status: "requested" | "uploaded"
  vendorId: string
  vendorName?: string
  requestedAt: string
  requestedBy?: string
  requestedByName?: string
  uploadedAt?: string
  uploadedFileName?: string
  comments?: DesignRequestComment[]
  prizeInfo?: PrizeInfo[]
}

// ─── マスタデータ ───

export type Company = {
  id: number
  companyId: string
  name: string
}

export type Hall = {
  id: number
  hallId: string
  name: string
  salesPersonName: string
  companyId: number
  address?: string
}

export type Employee = {
  id: number
  name: string
  department?: string
}

// ─── キャストスケジュール ───

/** キャストの予定1件（曜日ベース） */
export type CastScheduleItem = {
  /** 0=日曜, 1=月曜, ..., 6=土曜 */
  dayOfWeek: number
  startTime: string
  endTime: string
  holdType: "confirmed" | "tentative"
  nominated: boolean
}

/** キャスト種別 */
export type CastRole = "companion" | "director"

/** キャスト別スケジュールマスタ */
export type CastSchedule = {
  castName: string
  role: CastRole
  items: CastScheduleItem[]
}
