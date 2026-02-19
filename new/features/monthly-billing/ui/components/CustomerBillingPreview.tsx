import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CustomerBillingRow } from "../../hooks/useMonthlyBilling"

interface CustomerBillingPreviewProps {
  rows: CustomerBillingRow[]
}

export const CustomerBillingPreview = ({ rows }: CustomerBillingPreviewProps) => {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        「データ抽出」を押して請求データを生成してください
      </div>
    )
  }

  // Group by projectNumber + hallName for subtotals
  const hallTotals = new Map<string, number>()
  for (const row of rows) {
    const key = `${row.projectNumber}:${row.hallName}`
    if (!hallTotals.has(key)) {
      hallTotals.set(key, row.hallTotal)
    }
  }
  const grandTotal = [...hallTotals.values()].reduce((sum, v) => sum + v, 0)

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">顧客請求データ一覧</h3>
        <span className="text-sm text-muted-foreground">{rows.length} 件</span>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>案件番号</TableHead>
              <TableHead>商材名</TableHead>
              <TableHead>法人名</TableHead>
              <TableHead>ホール名</TableHead>
              <TableHead>項目名</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead className="text-right">単価</TableHead>
              <TableHead className="text-right">小計</TableHead>
              <TableHead className="text-right">ホール請求合計</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-xs font-mono">{row.projectNumber}</TableCell>
                <TableCell className="text-sm">{row.productName}</TableCell>
                <TableCell className="text-sm">{row.companyName}</TableCell>
                <TableCell className="text-sm">{row.hallName}</TableCell>
                <TableCell className="text-sm">{row.itemName}</TableCell>
                <TableCell className="text-right">{row.quantity}</TableCell>
                <TableCell className="text-right">¥{row.unitPrice.toLocaleString()}</TableCell>
                <TableCell className="text-right">¥{row.subtotal.toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium">¥{row.hallTotal.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end p-3 border-t bg-muted/30">
          <span className="text-sm font-bold">総合計: ¥{grandTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
