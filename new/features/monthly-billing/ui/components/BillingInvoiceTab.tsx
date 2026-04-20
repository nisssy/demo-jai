import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Company, Hall } from "@/new/api/types"
import { BillingFilters, type BillingFilterState } from "./BillingFilters"

export type InvoiceRow = {
  quoteId: string
  quoteAmount: number
  status: "請求前" | "請求中" | "請求完了"
  projectNumber: string
  recordNumber: string
  category: string
  productName: string
  companyName: string
  hallName: string
  // navigation
  productId: number
  hallIndex: number
}

type BillingInvoiceTabProps = {
  filters: BillingFilterState
  onFiltersChange: (filters: BillingFilterState) => void
  rows: InvoiceRow[]
  onClickRow: (row: InvoiceRow) => void
  companies: Company[]
  halls: Hall[]
}

const statusColor = (s: InvoiceRow["status"]) => {
  switch (s) {
    case "請求前": return "bg-slate-100 text-slate-700"
    case "請求中": return "bg-amber-100 text-amber-800"
    case "請求完了": return "bg-green-100 text-green-800"
  }
}

export const BillingInvoiceTab = ({ filters, onFiltersChange, rows, onClickRow, companies, halls }: BillingInvoiceTabProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 shrink-0">
        <BillingFilters filters={filters} onFiltersChange={onFiltersChange} companies={companies} halls={halls} />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {rows.length === 0 ? (
          <div className="text-center py-12 text-slate-500">該当する請求データがありません</div>
        ) : (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <div className="text-sm text-slate-600">{rows.length}件のレコード</div>
              <div className="text-sm font-medium text-slate-700">
                合計: ¥{rows.reduce((s, r) => s + r.quoteAmount, 0).toLocaleString()}
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">見積書ID</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">見積もり金額</TableHead>
                    <TableHead className="font-semibold text-slate-700">ステータス</TableHead>
                    <TableHead className="font-semibold text-slate-700">案件番号</TableHead>
                    <TableHead className="font-semibold text-slate-700">レコード番号</TableHead>
                    <TableHead className="font-semibold text-slate-700">商材区分</TableHead>
                    <TableHead className="font-semibold text-slate-700">商材名</TableHead>
                    <TableHead className="font-semibold text-slate-700">法人</TableHead>
                    <TableHead className="font-semibold text-slate-700">ホール</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.quoteId}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      onClick={() => onClickRow(row)}
                    >
                      <TableCell className="text-sm font-medium text-blue-600">{row.quoteId}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-slate-900">¥{row.quoteAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs px-2 py-0.5 ${statusColor(row.status)}`}>{row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{row.projectNumber}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.recordNumber}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.category}</TableCell>
                      <TableCell className="text-sm text-slate-900">{row.productName}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.companyName}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.hallName}</TableCell>
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
