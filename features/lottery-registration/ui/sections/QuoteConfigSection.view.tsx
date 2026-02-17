import type { LotteryHallEntry } from "../../types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { QuoteItemRowView } from "./QuoteItemRow.view"
import { ProportionInputView } from "./ProportionInput.view"
import { Equal } from "lucide-react"

export type QuoteConfigSectionViewProps = {
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
  posterPrintTotal: number
}

export function QuoteConfigSectionView({
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
}: QuoteConfigSectionViewProps) {
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
          {/* ポスターデザイン (id=1) */}
          <QuoteItemRowView
            itemId={1}
            itemName="ポスターデザイン"
            amount={totalQuoteItems[1] || ""}
            onAmountChange={(v) => onTotalQuoteItemChange(1, v)}
          />

          {/* ポスター印刷 (id=2) */}
          <QuoteItemRowView
            itemId={2}
            itemName="ポスター印刷"
            isPostPrint
            posterPrintQuantity={posterPrintQuantity}
            posterPrintUnitPrice={posterPrintUnitPrice}
            onPosterPrintQuantityChange={onPosterPrintQuantityChange}
            onPosterPrintUnitPriceChange={onPosterPrintUnitPriceChange}
            amount=""
            onAmountChange={() => {}}
          />

          {/* DM発送代行 (id=3) - DM有の場合のみ */}
          {dmMailing === "yes" && (
            <QuoteItemRowView
              itemId={3}
              itemName="DM発送代行"
              isDmDispatch
              dmOrderCount={dmOrderCount}
              onDmOrderCountChange={onDmOrderCountChange}
              amount={totalQuoteItems[3] || ""}
              onAmountChange={(v) => onTotalQuoteItemChange(3, v)}
            />
          )}

          {/* 抽選システム利用料 (id=4) */}
          <QuoteItemRowView
            itemId={4}
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
                <ProportionInputView
                  key={hall.hallName}
                  label={hall.hallName}
                  percentage={hallPercentages[hall.hallName] || 0}
                  calculatedAmount={Math.floor((totalAmount * (hallPercentages[hall.hallName] || 0)) / 100)}
                  onPercentageChange={(v) => onHallPercentageChange(hall.hallName, v)}
                />
              ))
            : uniqueCompanies.map((company) => (
                <ProportionInputView
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

    </div>
  )
}
