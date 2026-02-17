import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type QuoteItemRowViewProps = {
  itemId: number
  itemName: string
  /** ポスター印刷(id=2)の場合: quantity, unitPrice を別途表示 */
  isPostPrint?: boolean
  posterPrintQuantity?: string
  posterPrintUnitPrice?: string
  onPosterPrintQuantityChange?: (value: string) => void
  onPosterPrintUnitPriceChange?: (value: string) => void
  /** DM発送代行(id=3)の場合: dmOrderCount を別途表示 */
  isDmDispatch?: boolean
  dmOrderCount?: string
  onDmOrderCountChange?: (value: string) => void
  /** 金額 */
  amount: string
  onAmountChange: (value: string) => void
  /** 自動計算の場合はreadOnly */
  isAmountReadOnly?: boolean
}

export function QuoteItemRowView({
  itemId,
  itemName,
  isPostPrint,
  posterPrintQuantity,
  posterPrintUnitPrice,
  onPosterPrintQuantityChange,
  onPosterPrintUnitPriceChange,
  isDmDispatch,
  dmOrderCount,
  onDmOrderCountChange,
  amount,
  onAmountChange,
  isAmountReadOnly,
}: QuoteItemRowViewProps) {
  if (isPostPrint) {
    const qty = parseFloat(posterPrintQuantity || "0") || 0
    const price = parseFloat(posterPrintUnitPrice || "0") || 0
    const calculatedAmount = qty * price

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">{itemName}</Label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="text-xs text-slate-500 mb-1">枚数</div>
            <Input
              type="number"
              min="0"
              value={posterPrintQuantity || ""}
              onChange={(e) => onPosterPrintQuantityChange?.(e.target.value)}
              className="text-xs h-8"
            />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">単価（円）</div>
            <Input
              type="number"
              min="0"
              value={posterPrintUnitPrice || ""}
              onChange={(e) => onPosterPrintUnitPriceChange?.(e.target.value)}
              className="text-xs h-8"
            />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">合計金額</div>
            <Input
              value={`¥${calculatedAmount.toLocaleString()}`}
              readOnly
              className="text-xs h-8 bg-slate-50"
            />
          </div>
        </div>
      </div>
    )
  }

  if (isDmDispatch) {
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">{itemName}</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-slate-500 mb-1">発注枚数</div>
            <Input
              type="number"
              min="0"
              value={dmOrderCount || ""}
              onChange={(e) => onDmOrderCountChange?.(e.target.value)}
              className="text-xs h-8"
            />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">金額（円）</div>
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="text-xs h-8"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{itemName}</Label>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">¥</span>
        <Input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          readOnly={isAmountReadOnly}
          className={`text-xs h-8 pl-5 ${isAmountReadOnly ? "bg-slate-50" : ""}`}
        />
      </div>
    </div>
  )
}
