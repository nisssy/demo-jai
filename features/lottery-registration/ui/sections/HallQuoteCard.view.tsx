import type { HallQuote } from "@/types/lottery"
import { Button } from "@/components/ui/button"
import { FileDown, Bell } from "lucide-react"

export type HallQuoteCardViewProps = {
  hallQuote: HallQuote
  dmMailing: "yes" | "no"
  onPdfExport: () => void
  onNotifyCustomer: () => void
}

export function HallQuoteCardView({
  hallQuote,
  dmMailing,
  onPdfExport,
  onNotifyCustomer,
}: HallQuoteCardViewProps) {
  const itemTotal = hallQuote.quoteItems
    .filter((item) => dmMailing === "yes" || item.id !== 3)
    .reduce((sum, item) => {
      if (item.id === 2) return sum + item.quantity * item.unitPrice
      return sum + item.unitPrice
    }, 0)

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{hallQuote.hallName}</h4>
          {hallQuote.percentage !== undefined && (
            <span className="text-xs text-slate-500">割合: {hallQuote.percentage}%</span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">見積金額</div>
          <div className="text-sm font-semibold text-slate-900">
            ¥{(hallQuote.calculatedAmount || itemTotal).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500">
              <th className="text-left font-medium py-1">項目</th>
              <th className="text-right font-medium py-1">数量</th>
              <th className="text-right font-medium py-1">単価</th>
              <th className="text-right font-medium py-1">金額</th>
            </tr>
          </thead>
          <tbody>
            {hallQuote.quoteItems
              .filter((item) => dmMailing === "yes" || item.id !== 3)
              .map((item) => (
                <tr key={item.id} className="border-t border-slate-50">
                  <td className="py-1 text-slate-700">{item.name}</td>
                  <td className="py-1 text-right text-slate-600">
                    {item.id === 2 ? item.quantity : "-"}
                  </td>
                  <td className="py-1 text-right text-slate-600">
                    ¥{item.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-1 text-right font-medium text-slate-900">
                    ¥{(item.id === 2 ? item.quantity * item.unitPrice : item.unitPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={3} className="py-1 font-medium text-slate-700">合計</td>
              <td className="py-1 text-right font-semibold text-slate-900">
                ¥{itemTotal.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="outline" size="sm" onClick={onPdfExport} className="text-xs gap-1.5">
          <FileDown className="h-3.5 w-3.5" />
          PDF出力
        </Button>
        <Button variant="outline" size="sm" onClick={onNotifyCustomer} className="text-xs gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          顧客へ通知
        </Button>
      </div>
    </div>
  )
}
