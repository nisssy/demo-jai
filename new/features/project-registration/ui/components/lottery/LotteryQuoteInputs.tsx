import { Label } from "@/components/ui/label"
import { LotteryQuoteItemRow } from "./LotteryQuoteItemRow"

type LotteryQuoteInputsProps = {
  totalQuoteItems: Record<number, string>
  posterPrintQuantity: string
  posterPrintUnitPrice: string
  dmOrderCount: string
  dmMailing: "yes" | "no"
  onTotalQuoteItemChange: (itemId: number, value: string) => void
  onPosterPrintQuantityChange: (value: string) => void
  onPosterPrintUnitPriceChange: (value: string) => void
  onDmOrderCountChange: (value: string) => void
}

export const LotteryQuoteInputs = ({
  totalQuoteItems,
  posterPrintQuantity,
  posterPrintUnitPrice,
  dmOrderCount,
  dmMailing,
  onTotalQuoteItemChange,
  onPosterPrintQuantityChange,
  onPosterPrintUnitPriceChange,
  onDmOrderCountChange,
}: LotteryQuoteInputsProps) => {
  return (
    <div className="space-y-6">
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
    </div>
  )
}
