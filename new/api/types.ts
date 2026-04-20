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

/** スロセレ中間/事後レポート: 機種別データ */
export type SlotMachineReportEntry = {
  machineName: string
  count?: string       // 台数
  avgGames?: string    // 平均G数
  avgDiff?: string     // 平均差枚
}

/** スロセレ中間/事後レポート */
export type SlotReport = {
  slot20Count?: string       // 20スロ台数
  slot20TotalDiff?: string   // 20スロ総差枚
  slot20AvgGames?: string    // 20スロ平均G数
  slot20AvgDiff?: string     // 20スロ平均差枚
  machineReports?: SlotMachineReportEntry[]
  uploadedAt?: string
}

/** マネジメント部確認ステータス */
export type ManagementConfirmationStatus = "unconfirmed" | "under-review" | "revision-requested" | "approved"

/** 支払チェックステータス */
export type PaymentCheckStatus = "unconfirmed" | "confirming" | "confirmed"

/** 月次計上ステータス */
export type BillingStatus =
  | "draft"                // 抽出済み（未送信）
  | "sent"                 // 業者に送信済み
  | "correction-requested" // 修正依頼あり
  | "confirmed"            // 業者確認済み
  | "invoice-received"     // 請求書受領
  | "agreed"               // 合意メール送信済み
  | "acknowledged"         // 了承メール受信済み

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
  // 中間レポート（外注業者用・構造化）
  interimReport?: SlotReport
  // 事後レポート（外注業者用・構造化）
  postEventReport?: SlotReport
  // スロセレ: 対象機種入力フォーム送信
  targetMachineFormSent?: boolean
  targetMachineFormSentDate?: string
  // 商材管理課用
  targetMachineNames?: string[]
  pachitownMachineNames?: string[]
  pachitownLinked?: boolean
  pachitownLinkedDate?: string
  // パチタウン連携（実施中・中間レポート）
  interimPachitownLinked?: boolean
  interimPachitownLinkedDate?: string
  // パチタウン連携（実施後・事後レポート）
  postEventPachitownLinked?: boolean
  postEventPachitownLinkedDate?: string
  bannerGenerated?: boolean
  bannerData?: BannerData
  // 3点セットプラン（スロセレ: 同月3回・週1回の割引プラン）
  threeSetPlan?: boolean
  // 合同抽選会
  serviceName?: "たまリッチ" | "SmartPoint"
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
  // 事務担当
  adminPersonId?: number
  // 部門間チャット
  chatMessages?: ChatMessage[]
}

// ─── 合同抽選会サブ型 ───

export type PrizeInfo = {
  rank: string
  name: string
  quantity: string
  unitPrice?: number
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
  category?: string
  eventSubject?: string
  modelNumber?: string
  rentalGrade?: string
  setting?: string
  purchaseReducedTax?: "対象" | "対象外"
  purchaseRecordDate?: string
  salesReducedTax?: "対象" | "対象外"
  salesUnitPrice?: number
  orderVendorName?: string
  orderDeadline?: string
  deliveryDate?: string
  orderId?: string
  orderDate?: string
  note?: string
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
  deliveredAt?: string
}

/** 景品発注書（1業者分） */
export type PrizeOrderDocument = {
  vendorId: string
  vendorName: string
  requestedAt: string
  desiredDeliveryDate?: string
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
  insightPersonName?: string
  companyId: number
  address?: string
  prefecture?: string
  area?: string
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

// ─── 月次計上 ───

/** 計上明細行 */
export type BillingLineItem = {
  productId: number
  productName: string
  projectNumber: string
  itemName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

/** 計上チャットメッセージ */
export type BillingChatMessage = {
  author: string
  content: string
  timestamp: string
}

/** 月次計上レコード（業者×月） */
export type MonthlyBilling = {
  id: string
  vendorType: "prize" | "design"
  vendorId: string
  vendorName: string
  billingMonth: string
  status: BillingStatus
  lineItems: BillingLineItem[]
  totalAmount: number
  createdAt: string
  updatedAt: string
  chatMessages?: BillingChatMessage[]
  correctionRequestedAt?: string
  confirmedAt?: string
  invoiceReceivedAt?: string
  agreedAt?: string
  acknowledgedAt?: string
}
