import type { PrizeInfo, HallQuote, QuoteItem } from "@/types/lottery"

/** 受注ステータス（全商材共通） */
export type OrderStatus = "before-proposal" | "proposing" | "order-received"

/** 実施ステータス（受注済み案件のみ） */
export type ExecutionStatus = "実施前" | "実施中" | "終了"

/** キャスティングステータス（全商材共通） */
export type CastingStatus = "未依頼" | "仮押さえ依頼" | "本押さえ依頼" | "仮押さえ済み" | "本押さえ済み"

/** キャストタイプ */
export type CastType = "トリニティガール" | "スロセレ" | "その他"

/** キャスト割り当て情報 */
export type CastAssignment = {
  id: string
  castType: CastType
  castName: string
  status: CastingStatus
  requestedAt?: string
  confirmedAt?: string
  notes?: string
}

/** 制作進行ステータス（ポスター・DM等） */
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
  /** 項目ID → 全体金額（文字列） */
  totalQuoteItems: Record<number, string>
  /** ポスター印刷枚数 */
  posterPrintQuantity: string
  /** ポスター印刷単価 */
  posterPrintUnitPrice: string
  /** DM発注枚数 */
  dmOrderCount: string
  /** 割合モード */
  proportionMode: "hall" | "company"
  /** ホール名 → 割合(%) */
  hallPercentages: Record<string, number>
  /** 法人ID → 割合(%) */
  companyPercentages: Record<string, number>
}

/** 合同抽選会フォーム全体の状態 */
export type LotteryFormState = {
  // セクション1: 基本情報
  halls: LotteryHallEntry[]
  dmMailing: "yes" | "no"
  eventStartDate: string
  eventEndDate: string
  salesPersonId: string
  salesPersonName: string
  insightPersonId: string
  insightPersonName: string
  eventName: string

  // セクション2: 景品セット
  selectedPrizeSetId: string
  prizeInfo: PrizeInfo[]

  // セクション3: 見積設定
  quoteConfig: QuoteConfigState

  // セクション4: 見積表示
  quoteGenerated: boolean
  hallQuotes: HallQuote[]

  // セクション5: ステータス管理
  proposalStatus: OrderStatus
  readingCertainty: "A" | "B" | "C" | ""
  executionStatus: ExecutionStatus | null
  castAssignments: CastAssignment[]
}

/** LotteryRegistration.container.tsx のProps */
export type LotteryRegistrationProps = {
  /** 編集対象のproductId（新規の場合はundefined） */
  productId?: number
  /** 親フォームのproductInfo（カテゴリ/イベントタイプ等の基本情報） */
  productInfo: {
    category: string
    eventType: string
    eventProductName: string
    eventStartDate?: string
    eventEndDate?: string
    lotteryBillingAmount?: string
  }
  /** 親フォームのproductInfo更新 */
  onUpdateProductInfo: (updates: Record<string, unknown>) => void
  /** 保存完了コールバック */
  onSaveComplete?: () => void
  /** 通知コールバック */
  addNotification: (message: string) => void
  /** 親フォームのcompanyId/hallId */
  companyId?: string
  companyName?: string
  hallId?: string
  hallName?: string
}
