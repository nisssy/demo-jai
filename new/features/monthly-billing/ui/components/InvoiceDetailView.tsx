import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, CheckCircle2 } from "lucide-react"
import type { HallQuote } from "@/new/api/types"

type InvoiceDetailViewProps = {
  quoteId: string
  projectNumber: string
  productName: string
  companyName: string
  hallQuote: HallQuote
  status: "請求前" | "請求中" | "請求完了"
  onBack: () => void
  onConfirm: (quoteId: string) => void
  confirmed: boolean
}

const statusColor = (s: string) => {
  switch (s) {
    case "請求前": return "bg-slate-100 text-slate-700"
    case "請求中": return "bg-amber-100 text-amber-800"
    case "請求完了": return "bg-green-100 text-green-800"
    default: return "bg-slate-100 text-slate-700"
  }
}

export const InvoiceDetailView = ({
  quoteId,
  projectNumber,
  productName,
  companyName,
  hallQuote,
  status,
  onBack,
  onConfirm,
  confirmed,
}: InvoiceDetailViewProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const items = hallQuote.quoteItems
  const purchaseTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const salesTotal = items.reduce((sum, item) => sum + item.quantity * (item.salesUnitPrice || item.unitPrice), 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b shrink-0 space-y-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">見積書詳細</h2>
              <Badge className={`text-[10px] ${statusColor(status)}`}>{status}</Badge>
              {confirmed && <Badge className="bg-green-100 text-green-800 text-[10px]">確定済み</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {quoteId} | {projectNumber} | {productName} | {companyName}
            </p>
          </div>
          {!confirmed && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsEditing(!isEditing)}>
              <Pencil className="h-3.5 w-3.5" />
              {isEditing ? "編集終了" : "編集"}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">{hallQuote.hallName}</span>
          {hallQuote.percentage !== undefined && (
            <span className="text-xs text-muted-foreground">割合: {hallQuote.percentage}%</span>
          )}
        </div>
      </div>

      {/* Quote table - stacked 2-row layout matching LotteryQuoteConfig */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                {/* Row 1 */}
                <tr className="bg-slate-500 text-white">
                  <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-center">明細<br />番号</th>
                  <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-left">商品名</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-left">イベント区分</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-left">型番</th>
                  <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-right">数量<br />人数</th>
                  <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-center">仕入<br />軽減税</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-right">仕入単価</th>
                  <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-center">販売<br />軽減税</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-right">販売単価</th>
                  <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-left">発注先名</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-center">納品予定日</th>
                  <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-center">発注<br />期限</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-center">発注書ID</th>
                  <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap align-middle text-center">備配</th>
                </tr>
                {/* Row 2 */}
                <tr className="bg-slate-500 text-white">
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-left">イベント科目</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-left">貸品等級</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-right">仕入金額</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-right">販売金額</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-center">仕入計上日</th>
                  <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-center">発注日</th>
                </tr>
              </thead>
              {items.map((item) => {
                const purchaseAmount = item.quantity * item.unitPrice
                const salesPrice = item.salesUnitPrice || item.unitPrice
                const salesAmount = item.quantity * salesPrice
                return (
                  <tbody key={item.id}>
                    {/* Data row 1 */}
                    <tr className="border-t border-slate-200 hover:bg-slate-50">
                      <td rowSpan={2} className="px-2 py-1 text-center text-slate-600 border-r border-slate-100 align-middle font-mono">
                        H{String(item.id).padStart(4, "0")}
                      </td>
                      <td rowSpan={2} className="px-2 py-1 text-slate-900 border-r border-slate-100 align-middle">
                        {item.name}
                      </td>
                      <td className="px-2 py-1 text-slate-600 border-r border-slate-100">{item.category || "-"}</td>
                      <td className="px-2 py-1 text-slate-600 border-r border-slate-100">{item.modelNumber || "-"}</td>
                      <td rowSpan={2} className="px-2 py-1 text-right text-slate-900 border-r border-slate-100 align-middle">{item.quantity}</td>
                      <td rowSpan={2} className="px-2 py-1 text-center border-r border-slate-100 align-middle">
                        {item.purchaseReducedTax === "対象" ? "✓" : "-"}
                      </td>
                      <td className="px-2 py-1 text-right text-slate-900 border-r border-slate-100">¥{item.unitPrice.toLocaleString()}</td>
                      <td rowSpan={2} className="px-2 py-1 text-center border-r border-slate-100 align-middle">
                        {item.salesReducedTax === "対象" ? "✓" : "-"}
                      </td>
                      <td className="px-2 py-1 text-right text-slate-900 border-r border-slate-100">¥{salesPrice.toLocaleString()}</td>
                      <td rowSpan={2} className="px-2 py-1 text-slate-600 border-r border-slate-100 align-middle">{item.orderVendorName || "-"}</td>
                      <td className="px-2 py-1 text-center text-slate-600 border-r border-slate-100">{item.deliveryDate || "-"}</td>
                      <td rowSpan={2} className="px-2 py-1 text-center text-slate-600 border-r border-slate-100 align-middle">{item.orderDeadline || "-"}</td>
                      <td className="px-2 py-1 text-center text-slate-600 border-r border-slate-100">{item.orderId || "-"}</td>
                      <td rowSpan={2} className="px-2 py-1 text-center text-slate-600 align-middle">{item.note || "-"}</td>
                    </tr>
                    {/* Data row 2 */}
                    <tr className="hover:bg-slate-50">
                      <td className="px-2 py-1 text-slate-600 border-r border-slate-100 border-t border-slate-100">{item.eventSubject || "-"}</td>
                      <td className="px-2 py-1 text-slate-600 border-r border-slate-100 border-t border-slate-100">{item.rentalGrade || "-"}</td>
                      <td className="px-2 py-1 text-right font-medium text-slate-900 border-r border-slate-100 border-t border-slate-100">¥{purchaseAmount.toLocaleString()}</td>
                      <td className="px-2 py-1 text-right font-medium text-slate-900 border-r border-slate-100 border-t border-slate-100">¥{salesAmount.toLocaleString()}</td>
                      <td className="px-2 py-1 text-center text-slate-600 border-r border-slate-100 border-t border-slate-100">{item.purchaseRecordDate || "-"}</td>
                      <td className="px-2 py-1 text-center text-slate-600 border-r border-slate-100 border-t border-slate-100">{item.orderDate || "-"}</td>
                    </tr>
                  </tbody>
                )
              })}
            </table>
          </div>
          <div className="flex justify-between items-center p-3 border-t bg-muted/30">
            <span className="text-xs font-semibold">合計</span>
            <div className="flex gap-6 text-xs">
              <span>仕入金額: <strong>¥{purchaseTotal.toLocaleString()}</strong></span>
              <span>販売金額: <strong>¥{salesTotal.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Confirm button */}
        {!confirmed && (
          <div className="mt-4 flex justify-end">
            <Button onClick={() => onConfirm(quoteId)} className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              確定
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
