/**
 * 見積ヘルパー
 *
 * 商材データ（Product）から見積明細行（QuoteLineItem）を自動生成する。
 * イベント商材は BillingSection と同じロジックで出演料・交通費等を算出し、
 * 合同抽選会商材は HallQuote の合計値を取り込む。
 */
import type { Product } from "./types"
import type { QuoteLineItem, QuoteLineSubitem, ProductQuoteSummary } from "@/new/features/project-quote/model/types"
import {
  COMPANION_HOURLY_RATES,
  DIRECTOR_HOURLY_RATES,
  getDurationInHours,
  getAverageCompanionRate,
  getAverageDirectorRate,
  getEventBaseFee,
  computeTransportFee,
  THREE_SET_BASE_FEE_PER_EVENT,
} from "./cast-data"

let nextId = 1
function uid(): string {
  return `qi-${nextId++}`
}

/** イベント商材の見積サマリを計算（BillingSection と同一ロジック） */
function computeEventBilling(product: Product, hallAddress: string): ProductQuoteSummary {
  const durationHours = getDurationInHours(product.startTime ?? "", product.endTime ?? "")
  const companionCount = parseInt(product.companionCount, 10) || 0
  const directorCount = parseInt(product.directorCount, 10) || 0
  const companionSelectedNames = product.selectedCompanions.filter((n) => n !== "未定")
  const directorSelectedNames = product.selectedDirectors.filter((n) => n !== "未定")

  // コンパニオン出演料
  const companionSelectedCost = companionSelectedNames.reduce(
    (t, name) => t + (COMPANION_HOURLY_RATES[name] ?? 0) * durationHours, 0,
  )
  const companionUndecided = Math.max(0, companionCount - companionSelectedNames.length)
  const companionCost = Math.round(companionSelectedCost + companionUndecided * getAverageCompanionRate() * durationHours)

  // ディレクター出演料
  const directorSelectedCost = directorSelectedNames.reduce(
    (t, name) => t + (DIRECTOR_HOURLY_RATES[name] ?? 0) * durationHours, 0,
  )
  const directorUndecided = Math.max(0, directorCount - directorSelectedNames.length)
  const directorCost = Math.round(directorSelectedCost + directorUndecided * getAverageDirectorRate() * durationHours)

  const performanceFee = companionCost + directorCost
  const transportFee = computeTransportFee(product.selectedCompanions, hallAddress)
  const accommodationFee = 0 // 宿泊費は手動入力のため初期値0
  const eventBaseFee = product.threeSetPlan && product.eventType === "スロセレ"
    ? THREE_SET_BASE_FEE_PER_EVENT
    : getEventBaseFee(product.eventType)

  return {
    id: product.id,
    category: product.category,
    eventType: product.eventType,
    eventProductName: product.eventProductName,
    eventDate: product.eventDate,
    performanceFee,
    transportFee,
    accommodationFee,
    eventBaseFee,
    subtotal: performanceFee + transportFee + accommodationFee + eventBaseFee,
  }
}

/** 合同抽選会の見積サマリを計算（HallQuote の合計を取り込む） */
function computeLotteryBilling(product: Product): ProductQuoteSummary {
  const lotteryItems: { name: string; amount: number }[] = []
  let total = 0

  if (product.hallQuotes && product.hallQuotes.length > 0) {
    // 全ホールの QuoteItem を名前別に集計
    const itemTotals = new Map<string, number>()
    for (const hq of product.hallQuotes) {
      for (const qi of hq.quoteItems) {
        if (!qi.included) continue
        const current = itemTotals.get(qi.name) ?? 0
        itemTotals.set(qi.name, current + qi.quantity * qi.unitPrice)
      }
    }
    for (const [name, amount] of itemTotals) {
      lotteryItems.push({ name, amount })
      total += amount
    }
  }

  return {
    id: product.id,
    category: product.category,
    eventType: product.eventType,
    eventProductName: product.eventProductName,
    eventDate: product.eventDate,
    performanceFee: 0,
    transportFee: 0,
    accommodationFee: 0,
    eventBaseFee: 0,
    subtotal: total,
    lotteryItems,
  }
}

/** 商材リストから見積サマリを計算 */
export function computeProductSummaries(
  products: Product[],
  hallAddress: string,
): ProductQuoteSummary[] {
  return products.map((p) => {
    if (p.category === "ポイント") return computeLotteryBilling(p)
    return computeEventBilling(p, hallAddress)
  })
}

/** 商材サマリから見積明細行を自動生成 */
export function generateQuoteLineItems(
  summaries: ProductQuoteSummary[],
): QuoteLineItem[] {
  // idカウンタをリセット
  nextId = 1

  // 全商材を集約: 出演料/交通費/宿泊費/イベント基本料金/合同抽選会項目
  let totalPerformance = 0
  let totalTransport = 0
  let totalAccommodation = 0
  let totalEventBase = 0
  const eventSubitems: QuoteLineSubitem[] = []
  const lotterySubitems: QuoteLineSubitem[] = []
  let totalLottery = 0

  for (const s of summaries) {
    if (s.category === "ポイント" && s.lotteryItems) {
      // 合同抽選会
      for (const li of s.lotteryItems) {
        lotterySubitems.push({ id: uid(), name: li.name, amount: li.amount, visible: true })
        totalLottery += li.amount
      }
    } else {
      // イベント商材
      totalPerformance += s.performanceFee
      totalTransport += s.transportFee
      totalAccommodation += s.accommodationFee
      totalEventBase += s.eventBaseFee
      if (summaries.filter((x) => x.category !== "ポイント").length > 1) {
        eventSubitems.push({
          id: uid(),
          name: `${s.eventType}（${s.eventProductName || s.eventDate}）`,
          amount: s.subtotal,
          visible: true,
        })
      }
    }
  }

  const items: QuoteLineItem[] = []

  if (totalPerformance > 0) {
    items.push({ id: uid(), name: "出演料", amount: totalPerformance, visible: true })
  }
  if (totalTransport > 0) {
    items.push({ id: uid(), name: "交通費", amount: totalTransport, visible: true })
  }
  if (totalAccommodation > 0) {
    items.push({ id: uid(), name: "宿泊費", amount: totalAccommodation, visible: true })
  }
  if (totalEventBase > 0) {
    items.push({ id: uid(), name: "イベント基本料金", amount: totalEventBase, visible: true })
  }
  if (totalLottery > 0) {
    items.push({
      id: uid(),
      name: "合同抽選会",
      amount: totalLottery,
      visible: true,
      subitems: lotterySubitems,
    })
  }

  // 管理費（デフォルト項目として追加、金額0で手動入力を想定）
  items.push({ id: uid(), name: "管理費", amount: 0, visible: true })

  return items
}
