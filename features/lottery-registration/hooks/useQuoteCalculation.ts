import { useMemo, useCallback } from "react"
import type { QuoteItem, HallQuote } from "@/types/lottery"
import type { QuoteConfigState, LotteryHallEntry } from "../types"

type UseQuoteCalculationArgs = {
  quoteConfig: QuoteConfigState
  halls: LotteryHallEntry[]
  dmMailing: "yes" | "no"
}

export function useQuoteCalculation({ quoteConfig, halls, dmMailing }: UseQuoteCalculationArgs) {
  const { totalQuoteItems, posterPrintQuantity, posterPrintUnitPrice, proportionMode, hallPercentages, companyPercentages } = quoteConfig

  /** ポスター印刷の合計金額 */
  const posterPrintTotal = useMemo(() => {
    const qty = parseFloat(posterPrintQuantity) || 0
    const price = parseFloat(posterPrintUnitPrice) || 0
    return qty * price
  }, [posterPrintQuantity, posterPrintUnitPrice])

  /** 全項目の合計金額 */
  const totalAmount = useMemo(() => {
    let total = 0
    // ポスターデザイン (id=1)
    total += parseFloat(totalQuoteItems[1] || "0") || 0
    // ポスター印刷 (id=2) = 枚数×単価
    total += posterPrintTotal
    // DM発送代行 (id=3) - DM有の場合のみ
    if (dmMailing === "yes") {
      total += parseFloat(totalQuoteItems[3] || "0") || 0
    }
    // 抽選システム利用料 (id=4)
    total += parseFloat(totalQuoteItems[4] || "0") || 0
    return total
  }, [totalQuoteItems, posterPrintTotal, dmMailing])

  /** 割合の合計(%) */
  const percentageSum = useMemo(() => {
    const validHallNames = halls.filter((h) => h.hallName.trim()).map((h) => h.hallName)
    if (proportionMode === "hall") {
      return validHallNames.reduce((sum, name) => sum + (hallPercentages[name] || 0), 0)
    }
    const uniqueCompanyIds = [...new Set(halls.filter((h) => h.companyId).map((h) => h.companyId))]
    return uniqueCompanyIds.reduce((sum, id) => sum + (companyPercentages[id] || 0), 0)
  }, [halls, proportionMode, hallPercentages, companyPercentages])

  /** 割合が100%かどうか */
  const isPercentageValid = useMemo(() => Math.abs(percentageSum - 100) < 0.01, [percentageSum])

  /** 均等に分配 */
  const distributeEvenly = useCallback((): { hallPercentages: Record<string, number>; companyPercentages: Record<string, number> } => {
    const validHallNames = halls.filter((h) => h.hallName.trim()).map((h) => h.hallName)
    if (proportionMode === "hall") {
      const count = validHallNames.length
      if (count === 0) return { hallPercentages: {}, companyPercentages }
      const base = Math.floor(100 / count)
      const remainder = 100 - base * count
      const newPercentages: Record<string, number> = {}
      validHallNames.forEach((name, i) => {
        newPercentages[name] = base + (i < remainder ? 1 : 0)
      })
      return { hallPercentages: newPercentages, companyPercentages }
    }
    const uniqueCompanyIds = [...new Set(halls.filter((h) => h.companyId).map((h) => h.companyId))]
    const count = uniqueCompanyIds.length
    if (count === 0) return { hallPercentages, companyPercentages: {} }
    const base = Math.floor(100 / count)
    const remainder = 100 - base * count
    const newPercentages: Record<string, number> = {}
    uniqueCompanyIds.forEach((id, i) => {
      newPercentages[id] = base + (i < remainder ? 1 : 0)
    })
    return { hallPercentages, companyPercentages: newPercentages }
  }, [halls, proportionMode, hallPercentages, companyPercentages])

  /** ホール別の見積もりを生成 */
  const generateHallQuotes = useCallback((): HallQuote[] => {
    const validHalls = halls.filter((h) => h.hallName.trim())
    if (validHalls.length === 0) return []

    const posterPrintQty = parseFloat(posterPrintQuantity) || 0
    const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0

    // 各ホールの実質割合を計算
    const getHallPercentage = (hall: LotteryHallEntry): number => {
      if (proportionMode === "hall") {
        return hallPercentages[hall.hallName] || 0
      }
      // 法人モード: 法人の割合を法人内のホール数で均等分割
      const companyHalls = validHalls.filter((h) => h.companyId === hall.companyId)
      const companyPct = companyPercentages[hall.companyId] || 0
      return companyHalls.length > 0 ? companyPct / companyHalls.length : 0
    }

    return validHalls.map((hall) => {
      const percentage = getHallPercentage(hall)

      const quoteItems: QuoteItem[] = []

      // ポスターデザイン (id=1)
      const designAmount = parseFloat(totalQuoteItems[1] || "0") || 0
      const hallDesignAmount = Math.floor((designAmount * percentage) / 100)
      quoteItems.push({ id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: hallDesignAmount, included: true })

      // ポスター印刷 (id=2)
      const totalPosterAmount = posterPrintQty * posterPrintPrice
      const hallPosterAmount = Math.floor((totalPosterAmount * percentage) / 100)
      const hallPosterQty = posterPrintPrice > 0 ? Math.floor(hallPosterAmount / posterPrintPrice) : 0
      quoteItems.push({ id: 2, name: "ポスター印刷", quantity: hallPosterQty, unitPrice: posterPrintPrice, included: true })

      // DM発送代行 (id=3)
      if (dmMailing === "yes") {
        const dmAmount = parseFloat(totalQuoteItems[3] || "0") || 0
        const hallDmAmount = Math.floor((dmAmount * percentage) / 100)
        quoteItems.push({ id: 3, name: "DM発送代行", quantity: 1, unitPrice: hallDmAmount, included: true })
      }

      // 抽選システム利用料 (id=4)
      const systemAmount = parseFloat(totalQuoteItems[4] || "0") || 0
      const hallSystemAmount = Math.floor((systemAmount * percentage) / 100)
      quoteItems.push({ id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: hallSystemAmount, included: true })

      const calculatedAmount = Math.floor((totalAmount * percentage) / 100)

      return {
        hallName: hall.hallName,
        quoteItems,
        percentage,
        calculatedAmount,
      }
    })
  }, [halls, totalQuoteItems, posterPrintQuantity, posterPrintUnitPrice, proportionMode, hallPercentages, companyPercentages, dmMailing, totalAmount])

  return {
    posterPrintTotal,
    totalAmount,
    percentageSum,
    isPercentageValid,
    distributeEvenly,
    generateHallQuotes,
  }
}
