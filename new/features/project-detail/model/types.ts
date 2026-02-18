import type { BookingStatus, ProposalStatus, ExecutionStatus, DesignRequest, ProductComment } from "@/new/api/types"

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
  productId: number
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
  // 3点セット
  threeSetPlan?: boolean
  // ステータス
  proposalStatus?: string
  proposalStatusRaw?: ProposalStatus
  readingCertainty?: "A" | "B" | "C"
  executionStatus?: ExecutionStatus
  // キャスト
  casts: CastSummary[]
  undecidedCasts: { type: string; count: number }[]
  // コメント（部門間チャット）
  comments: ProductComment[]
  commentCount: number
  // 合同抽選会
  dmMailing?: "yes" | "no"
  posterStatus: DesignRequest["status"] | null
  dmStatus: DesignRequest["status"] | null
  winnerListStatus: DesignRequest["status"] | null
  prizeOrdered: boolean
}

/** 部門連携サマリ */
export type DepartmentActivitySummary = {
  // キャスト手配（マネジメント部）
  cast: {
    total: number
    requesting: number // 仮押さえ依頼中 + 本押さえ依頼中
    completed: number  // 仮押さえ完了 + 本押さえ完了
    failed: number     // 仮押さえ不可 + 本押さえ不可
  }
  // デザイン依頼（デザイン業者）
  design: {
    poster: { total: number; requested: number; uploaded: number }
    dm: { total: number; requested: number; uploaded: number }
    winnerList: { total: number; requested: number; uploaded: number }
  }
  // 景品発注（景品業者）
  prize: {
    total: number    // 景品発注対象の商材数
    ordered: number  // 発注済み
  }
  // 修正依頼
  corrections: {
    productCount: number  // コメントがある商材数
    commentCount: number  // 合計コメント数
  }
}
