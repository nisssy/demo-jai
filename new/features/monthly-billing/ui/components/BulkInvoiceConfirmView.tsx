import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import type { HallQuote } from "@/new/api/types"
import type { InvoiceRow } from "./BillingInvoiceTab"

type BulkInvoiceConfirmViewProps = {
  rows: InvoiceRow[]
  getHallQuote: (productId: number, hallIndex: number) => HallQuote | null
  confirmedIds: Set<string>
  onConfirm: (quoteId: string) => void
  onBack: () => void
}

const statusColor = (s: string) => {
  switch (s) {
    case "請求前": return "bg-slate-100 text-slate-700"
    case "請求中": return "bg-amber-100 text-amber-800"
    case "請求完了": return "bg-green-100 text-green-800"
    default: return "bg-slate-100 text-slate-700"
  }
}

export const BulkInvoiceConfirmView = ({ rows, getHallQuote, confirmedIds, onConfirm, onBack }: BulkInvoiceConfirmViewProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-base font-bold">一括確定</h2>
            <p className="text-xs text-muted-foreground">{rows.length}件の見積書</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {rows.map((row) => {
          const hq = getHallQuote(row.productId, row.hallIndex)
          if (!hq) return null
          const isConfirmed = confirmedIds.has(row.quoteId)
          const items = hq.quoteItems
          const purchaseTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
          const salesTotal = items.reduce((sum, item) => sum + item.quantity * (item.salesUnitPrice || item.unitPrice), 0)

          return (
            <div key={row.quoteId} className="border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-slate-50 border-b flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{row.quoteId}</span>
                    <Badge className={`text-[10px] ${statusColor(row.status)}`}>{row.status}</Badge>
                    {isConfirmed && <Badge className="bg-green-100 text-green-800 text-[10px]">確定済み</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {row.projectNumber} | {row.productName} | {row.companyName} | {hq.hallName}
                  </p>
                </div>
                {!isConfirmed && (
                  <Button size="sm" className="gap-1.5" onClick={() => onConfirm(row.quoteId)}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    確定
                  </Button>
                )}
              </div>

              {/* Compact table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-500 text-white">
                      <th className="font-medium px-2 py-1.5 text-center border-r border-slate-400">明細番号</th>
                      <th className="font-medium px-2 py-1.5 text-left border-r border-slate-400">商品名</th>
                      <th className="font-medium px-2 py-1.5 text-right border-r border-slate-400">数量</th>
                      <th className="font-medium px-2 py-1.5 text-right border-r border-slate-400">仕入単価</th>
                      <th className="font-medium px-2 py-1.5 text-right border-r border-slate-400">仕入金額</th>
                      <th className="font-medium px-2 py-1.5 text-right border-r border-slate-400">販売単価</th>
                      <th className="font-medium px-2 py-1.5 text-right">販売金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const salesPrice = item.salesUnitPrice || item.unitPrice
                      return (
                        <tr key={item.id} className="border-t border-slate-200">
                          <td className="px-2 py-1 text-center text-slate-600 font-mono border-r border-slate-100">H{String(item.id).padStart(4, "0")}</td>
                          <td className="px-2 py-1 text-slate-900 border-r border-slate-100">{item.name}</td>
                          <td className="px-2 py-1 text-right text-slate-900 border-r border-slate-100">{item.quantity}</td>
                          <td className="px-2 py-1 text-right text-slate-900 border-r border-slate-100">¥{item.unitPrice.toLocaleString()}</td>
                          <td className="px-2 py-1 text-right font-medium text-slate-900 border-r border-slate-100">¥{(item.quantity * item.unitPrice).toLocaleString()}</td>
                          <td className="px-2 py-1 text-right text-slate-900 border-r border-slate-100">¥{salesPrice.toLocaleString()}</td>
                          <td className="px-2 py-1 text-right font-medium text-slate-900">¥{(item.quantity * salesPrice).toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center p-3 border-t bg-muted/30 text-xs">
                <span className="font-semibold">合計</span>
                <div className="flex gap-6">
                  <span>仕入: <strong>¥{purchaseTotal.toLocaleString()}</strong></span>
                  <span>販売: <strong>¥{salesTotal.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
