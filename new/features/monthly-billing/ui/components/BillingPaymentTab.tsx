import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { PaymentCheckStatus } from "@/new/api/types"
import { PAYMENT_CHECK_STATUS_LABELS } from "@/new/api/display"
import { PaymentFilters, type PaymentFilterState } from "./PaymentFilters"

export type PaymentRow = {
  vendorId: string
  vendorName: string
  purchaseAmountExTax: number
  purchaseAmountIncTax: number
  checkStatus: PaymentCheckStatus
  billingId: string
}

type VendorOption = {
  vendorId: string
  vendorName: string
}

type BillingPaymentTabProps = {
  filters: PaymentFilterState
  onFiltersChange: (filters: PaymentFilterState) => void
  rows: PaymentRow[]
  onClickRow: (row: PaymentRow) => void
  vendors: VendorOption[]
}

const checkStatusColor = (s: PaymentCheckStatus) => {
  switch (s) {
    case "unconfirmed": return "bg-slate-100 text-slate-700"
    case "confirming": return "bg-amber-100 text-amber-800"
    case "confirmed": return "bg-green-100 text-green-800"
  }
}

export const BillingPaymentTab = ({ filters, onFiltersChange, rows, onClickRow, vendors }: BillingPaymentTabProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 shrink-0">
        <PaymentFilters filters={filters} onFiltersChange={onFiltersChange} vendors={vendors} />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {rows.length === 0 ? (
          <div className="text-center py-12 text-slate-500">該当する支払いデータがありません</div>
        ) : (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <div className="text-sm text-slate-600">{rows.length}件のレコード</div>
              <div className="text-sm font-medium text-slate-700">
                合計（税込）: ¥{rows.reduce((s, r) => s + r.purchaseAmountIncTax, 0).toLocaleString()}
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">発注先ID</TableHead>
                    <TableHead className="font-semibold text-slate-700">発注先名</TableHead>
                    <TableHead className="font-semibold text-slate-700">ステータス</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">仕入金額（税抜）</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">仕入金額（税込）</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.vendorId}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      onClick={() => onClickRow(row)}
                    >
                      <TableCell className="text-sm font-mono text-slate-600">{row.vendorId}</TableCell>
                      <TableCell className="text-sm text-slate-900">{row.vendorName}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs px-2 py-0.5 ${checkStatusColor(row.checkStatus)}`}>
                          {PAYMENT_CHECK_STATUS_LABELS[row.checkStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-slate-900">¥{row.purchaseAmountExTax.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-slate-900">¥{row.purchaseAmountIncTax.toLocaleString()}</TableCell>
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
