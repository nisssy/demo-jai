/**
 * 合同抽選会（ポイント商材）専用の型定義
 */

/** 見積もり項目 */
export type QuoteItem = {
  id: number
  name: string
  quantity: number
  unitPrice: number
  included: boolean
}

/** ホール単位の見積もり */
export type HallQuote = {
  hallName: string
  quoteItems: QuoteItem[]
  /** 割合（％） */
  percentage?: number
  /** 計算後金額 */
  calculatedAmount?: number
}

/** 景品情報 */
export type PrizeInfo = {
  rank: string
  name: string
  quantity: string
  /** 景品マスタのID */
  prizeId?: string
  /** 景品業者のID */
  vendorId?: string
  /** 景品業者名 */
  vendorName?: string
}

/** 当選者情報 */
export type WinnerInfo = {
  id: string
  name: string
  address?: string
  phone?: string
  /** 当選景品 */
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

/** デザイン依頼タイプ */
export type DesignRequestType = "poster" | "dm" | "winner-list"

/** デザイン依頼のコメント */
export type DesignRequestComment = {
  id: string
  role: "Sales" | "DesignVendor"
  authorId?: string
  authorName: string
  text: string
  createdAt: string
}

/** デザイン依頼 */
export type DesignRequest = {
  id: string
  requestType: DesignRequestType
  projectId: number
  projectNumber?: string
  projectName?: string
  companyName: string
  hallNames: string[]
  eventStartDate?: string
  eventEndDate?: string
  requestedAt: string
  requestedBy: string
  requestedByName?: string
  status: "requested" | "uploaded"
  vendorId: string
  vendorName?: string
  uploadedFileName?: string
  uploadedAt?: string
  comments: DesignRequestComment[]
  /** 景品情報（ポスター/DMに表示するため） */
  prizeInfo?: PrizeInfo[]
}

/** 合同抽選会用の商材フィールド（DemoProductEntityに追加） */
export type LotteryProductFields = {
  /** 複数ホール対応（合同抽選会は複数ホール参加可能） */
  hallNames?: string[]
  /** 実施開始日 */
  eventStartDate?: string
  /** 実施終了日 */
  eventEndDate?: string
  /** エリア */
  area?: string
  /** 読み確度 */
  readingCertainty?: "A" | "B" | "C"
  /** DM発送 */
  dmMailing?: "yes" | "no"
  /** 予算 */
  budget?: string

  // 見積もり関連
  /** ホール単位の見積もり */
  hallQuotes?: HallQuote[]

  // 景品関連
  /** 景品情報 */
  prizeInfo?: PrizeInfo[]
  /** 配送業者 */
  deliveryVendor?: string
  /** 景品発注依頼日時 */
  prizeOrderRequestedAt?: string
  /** 景品発注書生成日時 */
  prizeOrderGeneratedAt?: string
  /** 景品発注書（1業者の場合） */
  prizeOrderDocument?: PrizeOrderDocument
  /** 景品発注書（複数業者の場合） */
  prizeOrdersByVendor?: PrizeOrderDocument[]

  // 当選者リスト関連
  /** 当選者リストアップロード日時 */
  winnerListUploadedAt?: string
  /** 当選者リスト検証日時 */
  winnerListValidatedAt?: string
  /** 当選者リスト */
  winnerList?: WinnerInfo[]

  // 当選通知書関連
  /** 当選通知書発注先デザイン業者ID */
  notificationOrderDesignVendorId?: string
  /** 当選通知書発注先デザイン業者名 */
  notificationOrderDesignVendorName?: string
  /** 当選通知書生成日時 */
  notificationOrderGeneratedAt?: string
  /** 当選通知書発注日時 */
  notificationOrderSentAt?: string

  // クオカード関連
  /** クオカード書簡チェック日時 */
  quoCardLetterCheckedAt?: string

  // 配送情報
  /** 業者ごとの配送情報 */
  prizeDeliveryInfoByVendor?: PrizeDeliveryInfoByVendor[]
}
