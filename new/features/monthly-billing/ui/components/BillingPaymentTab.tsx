import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Company, Hall } from "@/new/api/types"
import { BillingFilters, type BillingFilterState } from "./BillingFilters"

export type PaymentRow = {
  vendorId: string
  vendorName: string
  paymentAmount: number
  status: "支払い前" | "支払い中" | "支払い完了"
  billingId: string
}

type BillingPaymentTabProps = {
  filters: BillingFilterState
  onFiltersChange: (filters: BillingFilterState) => void
  rows: PaymentRow[]
  onClickRow: (row: PaymentRow) => void
  companies: Company[]
  halls: Hall[]
}

const statusColor = (s: PaymentRow["status"]) => {
  switch (s) {
    case "支払い前": return "bg-slate-100 text-slate-700"
    case "支払い中": return "bg-amber-100 text-amber-800"
    case "支払い完了": return "bg-green-100 text-green-800"
  }
}

export const BillingPaymentTab = ({ filters, onFiltersChange, rows, onClickRow, companies, halls }: BillingPaymentTabProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 shrink-0">
        <BillingFilters filters={filters} onFiltersChange={onFiltersChange} companies={companies} halls={halls} />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {rows.length === 0 ? (
          <div className="text-center py-12 text-slate-500">該当する支払いデータがありません</div>
        ) : (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <div className="text-sm text-slate-600">{rows.length}件のレコード</div>
              <div className="text-sm font-medium text-slate-700">
                合計: ¥{rows.reduce((s, r) => s + r.paymentAmount, 0).toLocaleString()}
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">業者</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">支払い金額</TableHead>
                    <TableHead className="font-semibold text-slate-700">ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.vendorId}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      onClick={() => onClickRow(row)}
                    >
                      <TableCell className="text-sm text-slate-900">{row.vendorName}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-slate-900">¥{row.paymentAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs px-2 py-0.5 ${statusColor(row.status)}`}>{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
