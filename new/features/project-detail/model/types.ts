import type { BookingStatus, ProposalStatus, ExecutionStatus, DesignRequest } from "@/new/api/types"

/** 案件情報 */
export type ProjectInfo = {
  projectNumber: string
  projectName?: string
  companyId?: string
  companyName?: string
  hallId?: string
  hallName?: string
  salesPersonName?: string
  requestDate?: string
}

/** キャスト情報（表示用） */
export type CastSummary = {
  name: string
  type: string
  bookingStatus: BookingStatus
}

/** 商材サマリ */
export type ProductSummary = {
  id: number
  category: string
  eventType: string
  eventProductName?: string
  eventDate?: string
  estimatedBillingAmount?: number
  // ステータス
  proposalStatus?: string
  proposalStatusRaw?: ProposalStatus
  executionStatus?: ExecutionStatus
  // キャスト
  casts: CastSummary[]
  // 合同抽選会
  dmMailing?: "yes" | "no"
  posterStatus: DesignRequest["status"] | null
  dmStatus: DesignRequest["status"] | null
  winnerListStatus: DesignRequest["status"] | null
  prizeOrdered: boolean
}
