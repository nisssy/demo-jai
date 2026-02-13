import type { LotteryHallEntry } from "@/new/features/project-registration/model/lottery-types"
import type { HallQuote } from "@/new/api/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Equal } from "lucide-react"
import { LotteryQuoteItemRow } from "./LotteryQuoteItemRow"
import { LotteryProportionInput } from "./LotteryProportionInput"
import { LotteryHallQuoteCard } from "./LotteryHallQuoteCard"

type LotteryQuoteConfigProps = {
  // 項目金額
  totalQuoteItems: Record<number, string>
  posterPrintQuantity: string
  posterPrintUnitPrice: string
  dmOrderCount: string
  dmMailing: "yes" | "no"
  onTotalQuoteItemChange: (itemId: number, value: string) => void
  onPosterPrintQuantityChange: (value: string) => void
  onPosterPrintUnitPriceChange: (value: string) => void
  onDmOrderCountChange: (value: string) => void
  // 割合
  proportionMode: "hall" | "company"
  halls: LotteryHallEntry[]
  hallPercentages: Record<string, number>
  companyPercentages: Record<string, number>
  onProportionModeChange: (mode: "hall" | "company") => void
  onHallPercentageChange: (hallName: string, value: number) => void
  onCompanyPercentageChange: (companyId: string, value: number) => void
  onDistributeEvenly: () => void
  // 計算結果
  totalAmount: number
  percentageSum: number
  isPercentageValid: boolean
  // 見積表示
  quoteGenerated: boolean
  hallQuotes: HallQuote[]
}

export const LotteryQuoteConfig = ({
  totalQuoteItems,
  posterPrintQuantity,
  posterPrintUnitPrice,
  dmOrderCount,
  dmMailing,
  onTotalQuoteItemChange,
  onPosterPrintQuantityChange,
  onPosterPrintUnitPriceChange,
  onDmOrderCountChange,
  proportionMode,
  halls,
  hallPercentages,
  companyPercentages,
  onProportionModeChange,
  onHallPercentageChange,
  onCompanyPercentageChange,
  onDistributeEvenly,
  totalAmount,
  percentageSum,
  isPercentageValid,
  quoteGenerated,
  hallQuotes,
}: LotteryQuoteConfigProps) => {
  const validHalls = halls.filter((h) => h.hallName.trim())
  const uniqueCompanies = [...new Map(
    halls.filter((h) => h.companyId).map((h) => [h.companyId, { id: h.companyId, name: h.companyName }])
  ).values()]

  return (
    <div className="space-y-6">
      {/* 項目ごとの金額 */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">項目ごとの金額（円）</Label>
        <p className="text-xs text-slate-500">各項目の全体金額を入力してください。各ホールの金額は割合で自動計算されます。</p>

        <div className="space-y-4">
          <LotteryQuoteItemRow
            itemName="ポスターデザイン"
            amount={totalQuoteItems[1] || ""}
            onAmountChange={(v) => onTotalQuoteItemChange(1, v)}
          />

          <LotteryQuoteItemRow
            itemName="ポスター印刷"
            isPostPrint
            posterPrintQuantity={posterPrintQuantity}
            posterPrintUnitPrice={posterPrintUnitPrice}
            onPosterPrintQuantityChange={onPosterPrintQuantityChange}
            onPosterPrintUnitPriceChange={onPosterPrintUnitPriceChange}
            amount=""
            onAmountChange={() => {}}
          />

          {dmMailing === "yes" && (
            <LotteryQuoteItemRow
              itemName="DM発送代行"
              isDmDispatch
              dmOrderCount={dmOrderCount}
              onDmOrderCountChange={onDmOrderCountChange}
              amount={totalQuoteItems[3] || ""}
              onAmountChange={(v) => onTotalQuoteItemChange(3, v)}
            />
          )}

          <LotteryQuoteItemRow
            itemName="抽選システム利用料"
            amount={totalQuoteItems[4] || ""}
            onAmountChange={(v) => onTotalQuoteItemChange(4, v)}
          />
        </div>
      </div>

      {/* 割合設定 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">割合設定</Label>
          <div className="flex items-center gap-3">
            <RadioGroup
              value={proportionMode}
              onValueChange={(v) => onProportionModeChange(v as "hall" | "company")}
              className="flex gap-3"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="hall" id="mode-hall" className="h-3.5 w-3.5" />
                <Label htmlFor="mode-hall" className="text-xs">ホールごと</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="company" id="mode-company" className="h-3.5 w-3.5" />
                <Label htmlFor="mode-company" className="text-xs">法人ごと</Label>
              </div>
            </RadioGroup>
            <Button variant="outline" size="sm" onClick={onDistributeEvenly} className="text-xs gap-1">
              <Equal className="h-3.5 w-3.5" />
              均等に分配
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {proportionMode === "hall"
            ? validHalls.map((hall) => (
                <LotteryProportionInput
                  key={hall.hallName}
                  label={hall.hallName}
                  percentage={hallPercentages[hall.hallName] || 0}
                  calculatedAmount={Math.floor((totalAmount * (hallPercentages[hall.hallName] || 0)) / 100)}
                  onPercentageChange={(v) => onHallPercentageChange(hall.hallName, v)}
                />
              ))
            : uniqueCompanies.map((company) => (
                <LotteryProportionInput
                  key={company.id}
                  label={company.name}
                  percentage={companyPercentages[company.id] || 0}
                  calculatedAmount={Math.floor((totalAmount * (companyPercentages[company.id] || 0)) / 100)}
                  onPercentageChange={(v) => onCompanyPercentageChange(company.id, v)}
                />
              ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">割合の合計</span>
          <span className={`font-semibold ${isPercentageValid ? "text-green-600" : "text-red-600"}`}>
            {percentageSum.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* ホール別見積もり */}
      {quoteGenerated && hallQuotes.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">ホール別見積もり</h3>
          <div className="space-y-4">
            {hallQuotes.map((hq) => (
              <LotteryHallQuoteCard
                key={hq.hallName}
                hallQuote={hq}
                dmMailing={dmMailing}
                onPdfExport={() => {}}
                onNotifyCustomer={() => {}}
              />
            ))}
            {hallQuotes.length > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-sm font-semibold text-slate-700">全ホール合計金額（割合ベース）</span>
                <span className="text-lg font-bold text-slate-900">
                  ¥{hallQuotes.reduce((sum, hq) => sum + (hq.calculatedAmount || 0), 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
