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
  // 実施ステータス（全商材共通）
  executionStatus?: ExecutionStatus
  // 修正・コメント
  correctionRequest?: string
  correctionComment?: string
  temporaryHoldFailureComment?: string
  // 合同抽選会
  dmMailing?: "yes" | "no"
  hallNames?: string[]
  eventStartDate?: string
  eventEndDate?: string
  salesPersonId?: number
  insightPersonId?: number
  readingCertainty?: "A" | "B" | "C"
  posterCount?: number
  prizeInfo?: PrizeInfo[]
  hallQuotes?: HallQuote[]
  prizeOrderedAt?: string
  winnerListUploadedAt?: string
  winnerListValidatedAt?: string
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

// ─── デザイン依頼 ───

export type DesignRequest = {
  id: string
  requestType: "poster" | "dm" | "winner-list"
  projectId: number
  projectNumber?: string
  status: "requested" | "uploaded"
  vendorId: string
  vendorName?: string
  requestedAt: string
  uploadedAt?: string
  uploadedFileName?: string
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
