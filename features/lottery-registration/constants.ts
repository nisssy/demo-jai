import type { QuoteItem } from "@/types/lottery"

/** 景品セットテンプレート */
export type PrizeSetTemplate = {
  id: string
  label: string
  items: { prizeId: string; rank: string; quantity: string }[]
}

/** 事前定義の景品セット（景品マスタID参照） */
export const PRIZE_SETS: PrizeSetTemplate[] = [
  { id: "newyear", label: "年末大抽選会セット", items: [{ prizeId: "1", rank: "A賞", quantity: "1" }, { prizeId: "2", rank: "B賞", quantity: "3" }, { prizeId: "3", rank: "C賞", quantity: "50" }] },
  { id: "spring", label: "春のキャンペーンセット", items: [{ prizeId: "4", rank: "1等", quantity: "1" }, { prizeId: "5", rank: "2等", quantity: "5" }, { prizeId: "6", rank: "3等", quantity: "100" }] },
  { id: "gw", label: "ゴールデンウィークセット", items: [{ prizeId: "7", rank: "特賞", quantity: "2" }, { prizeId: "8", rank: "A賞", quantity: "10" }, { prizeId: "9", rank: "B賞", quantity: "30" }, { prizeId: "10", rank: "参加賞", quantity: "500" }] },
  { id: "summer", label: "夏祭りセット", items: [{ prizeId: "11", rank: "大賞", quantity: "1" }, { prizeId: "12", rank: "A賞", quantity: "5" }, { prizeId: "13", rank: "B賞", quantity: "100" }] },
  { id: "respect", label: "敬老の日セット", items: [{ prizeId: "1", rank: "特別賞", quantity: "3" }, { prizeId: "2", rank: "A賞", quantity: "20" }, { prizeId: "3", rank: "参加賞", quantity: "200" }] },
  { id: "halloween", label: "ハロウィンセット", items: [{ prizeId: "4", rank: "1等", quantity: "2" }, { prizeId: "5", rank: "2等", quantity: "20" }, { prizeId: "6", rank: "参加賞", quantity: "300" }] },
  { id: "christmas", label: "クリスマスセット", items: [{ prizeId: "7", rank: "特賞", quantity: "1" }, { prizeId: "8", rank: "A賞", quantity: "10" }, { prizeId: "9", rank: "B賞", quantity: "50" }] },
  { id: "newcustomer", label: "新規顧客獲得セット", items: [{ prizeId: "12", rank: "A賞", quantity: "5" }, { prizeId: "10", rank: "B賞", quantity: "30" }, { prizeId: "11", rank: "C賞", quantity: "100" }] },
  { id: "repeat", label: "リピーター感謝セット", items: [{ prizeId: "1", rank: "感謝賞", quantity: "20" }, { prizeId: "2", rank: "特別賞", quantity: "50" }] },
  { id: "simple", label: "シンプル1賞セット", items: [{ prizeId: "1", rank: "A賞", quantity: "1" }] },
]

/** デフォルトの見積もり項目 */
export const DEFAULT_QUOTE_ITEMS: QuoteItem[] = [
  { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 50000, included: true },
  { id: 2, name: "ポスター印刷", quantity: 50, unitPrice: 2000, included: true },
  { id: 3, name: "DM発送代行", quantity: 1000, unitPrice: 150, included: true },
  { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 30000, included: true },
]

/** デフォルトの全体金額 */
export const DEFAULT_TOTAL_QUOTE_ITEMS: Record<number, string> = {
  1: "50000",
  3: "150000",
  4: "30000",
}

/** ステータスラベル */
export const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  "before-proposal": "提案前",
  "proposing": "提案中",
  "order-received": "受注",
}

/** ヨミラベル */
export const READING_CERTAINTY_OPTIONS = ["A", "B", "C"] as const
