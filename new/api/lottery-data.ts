import type { PrizeInfo } from "./types"

/** 景品セットテンプレート */
export type PrizeSetTemplate = {
  id: string
  label: string
  items: { prizeId: string; rank: string; quantity: string }[]
}

/** 景品マスタ */
export type PrizeMaster = {
  id: number
  name: string
  vendorId: number
  vendorName: string
}

/** 景品業者マスタ */
export type PrizeVendorMaster = {
  id: number
  name: string
}

/** 印刷会社 / デザイン会社 */
export type TradingPartner = {
  id: string
  name: string
  type: "printing" | "design"
}

/** 景品マスタデータ */
export const PRIZE_MASTER: PrizeMaster[] = [
  { id: 1, name: "液晶テレビ 50インチ", vendorId: 1, vendorName: "景品卸売センター" },
  { id: 2, name: "Nintendo Switch", vendorId: 1, vendorName: "景品卸売センター" },
  { id: 3, name: "Dysonドライヤー", vendorId: 1, vendorName: "景品卸売センター" },
  { id: 4, name: "JTB旅行券 3万円", vendorId: 2, vendorName: "トラベル景品ワールド" },
  { id: 5, name: "Amazonギフト 1万円", vendorId: 2, vendorName: "トラベル景品ワールド" },
  { id: 6, name: "QUOカード 500円", vendorId: 2, vendorName: "トラベル景品ワールド" },
  { id: 7, name: "ルンバ i7+", vendorId: 3, vendorName: "家電プロ" },
  { id: 8, name: "iPad Air", vendorId: 3, vendorName: "家電プロ" },
  { id: 9, name: "空気清浄機", vendorId: 3, vendorName: "家電プロ" },
  { id: 10, name: "お米券 5kg", vendorId: 1, vendorName: "景品卸売センター" },
  { id: 11, name: "カタログギフト 1万円", vendorId: 2, vendorName: "トラベル景品ワールド" },
  { id: 12, name: "高級果物セット", vendorId: 1, vendorName: "景品卸売センター" },
  { id: 13, name: "ティッシュ5箱パック", vendorId: 1, vendorName: "景品卸売センター" },
]

/** 景品業者マスタデータ */
export const PRIZE_VENDORS: PrizeVendorMaster[] = [
  { id: 1, name: "景品卸売センター" },
  { id: 2, name: "トラベル景品ワールド" },
  { id: 3, name: "家電プロ" },
]

/** 印刷会社・デザイン会社 */
export const TRADING_PARTNERS: TradingPartner[] = [
  { id: "V-001", name: "デザインスタジオA", type: "design" },
  { id: "V-002", name: "プリントショップB", type: "printing" },
  { id: "V-003", name: "クリエイティブC", type: "design" },
]

/** 事前定義の景品セット */
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

/** 景品マスタIDから景品情報を取得 */
export function getPrizeMasterById(prizeId: string): PrizeMaster | undefined {
  return PRIZE_MASTER.find((p) => String(p.id) === prizeId)
}

/** 景品セットから PrizeInfo[] を生成 */
export function prizesFromTemplate(setId: string): PrizeInfo[] {
  const set = PRIZE_SETS.find((s) => s.id === setId)
  if (!set) return []
  return set.items.map((item) => {
    const master = getPrizeMasterById(item.prizeId)
    return {
      rank: item.rank,
      name: master?.name ?? "",
      quantity: item.quantity,
      prizeId: item.prizeId,
      vendorId: master ? String(master.vendorId) : undefined,
      vendorName: master?.vendorName,
    }
  })
}
