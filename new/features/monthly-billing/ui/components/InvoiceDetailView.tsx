import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import type { HallQuote } from "@/new/api/types"

type InvoiceDetailViewProps = {
  quoteId: string
  projectNumber: string
  productName: string
  companyName: string
  hallQuote: HallQuote
  status: "請求前" | "請求中" | "請求完了"
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

export const InvoiceDetailView = ({
  quoteId,
  projectNumber,
  productName,
  companyName,
  hallQuote,
  status,
  onBack,
}: InvoiceDetailViewProps) => {
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
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {quoteId} | {projectNumber} | {productName} | {companyName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">{hallQuote.hallName}</span>
          {hallQuote.percentage !== undefined && (
            <span className="text-xs text-muted-foreground">割合: {hallQuote.percentage}%</span>
          )}
        </div>
      </div>

      {/* Quote table */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-500">
                <TableHead className="text-white text-xs font-medium">明細番号</TableHead>
                <TableHead className="text-white text-xs font-medium">商品名</TableHead>
                <TableHead className="text-white text-xs font-medium">イベント区分</TableHead>
                <TableHead className="text-white text-xs font-medium">イベント科目</TableHead>
                <TableHead className="text-white text-xs font-medium">型番</TableHead>
                <TableHead className="text-white text-xs font-medium">貸品等級</TableHead>
                <TableHead className="text-white text-xs font-medium text-right">数量</TableHead>
                <TableHead className="text-white text-xs font-medium text-right">仕入単価</TableHead>
                <TableHead className="text-white text-xs font-medium text-right">仕入金額</TableHead>
                <TableHead className="text-white text-xs font-medium text-center">仕入軽減税</TableHead>
                <TableHead className="text-white text-xs font-medium text-right">販売単価</TableHead>
                <TableHead className="text-white text-xs font-medium text-right">販売金額</TableHead>
                <TableHead className="text-white text-xs font-medium text-center">販売軽減税</TableHead>
                <TableHead className="text-white text-xs font-medium">発注先名</TableHead>
                <TableHead className="text-white text-xs font-medium text-center">納品予定日</TableHead>
                <TableHead className="text-white text-xs font-medium text-center">仕入計上日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const purchaseAmount = item.quantity * item.unitPrice
                const salesPrice = item.salesUnitPrice || item.unitPrice
                const salesAmount = item.quantity * salesPrice
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs font-mono">H{String(item.id).padStart(4, "0")}</TableCell>
                    <TableCell className="text-xs">{item.name}</TableCell>
                    <TableCell className="text-xs">{item.category || "-"}</TableCell>
                    <TableCell className="text-xs">{item.eventSubject || "-"}</TableCell>
                    <TableCell className="text-xs">{item.modelNumber || "-"}</TableCell>
                    <TableCell className="text-xs">{item.rentalGrade || "-"}</TableCell>
                    <TableCell className="text-xs text-right">{item.quantity}</TableCell>
                    <TableCell className="text-xs text-right">¥{item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right font-medium">¥{purchaseAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-center">{item.purchaseReducedTax === "対象" ? "✓" : "-"}</TableCell>
                    <TableCell className="text-xs text-right">¥{salesPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right font-medium">¥{salesAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-center">{item.salesReducedTax === "対象" ? "✓" : "-"}</TableCell>
                    <TableCell className="text-xs">{item.orderVendorName || "-"}</TableCell>
                    <TableCell className="text-xs text-center">{item.deliveryDate || "-"}</TableCell>
                    <TableCell className="text-xs text-center">{item.purchaseRecordDate || "-"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center p-3 border-t bg-muted/30">
            <span className="text-xs font-semibold">合計</span>
            <div className="flex gap-6 text-xs">
              <span>仕入金額: <strong>¥{purchaseTotal.toLocaleString()}</strong></span>
              <span>販売金額: <strong>¥{salesTotal.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
