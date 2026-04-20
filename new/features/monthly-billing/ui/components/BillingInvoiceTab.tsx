import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2 } from "lucide-react"
import type { Company, Hall, Employee } from "@/new/api/types"
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
  // project list compatible fields
  eventDate: string
  proposalStatus: string
  proposalStatusLabel: string
  executionStatus: string
  designOrdered: boolean
  prizeOrdered: boolean
  listConfirmed: boolean
  salesPersonName: string
  estimatedBillingAmount: number
  // navigation
  productId: number
  hallIndex: number
  // filtering helpers
  serviceName?: string
  adminPersonId?: number
}

type BillingInvoiceTabProps = {
  filters: BillingFilterState
  onFiltersChange: (filters: BillingFilterState) => void
  rows: InvoiceRow[]
  onClickRow: (row: InvoiceRow) => void
  onBulkConfirm: (rows: InvoiceRow[]) => void
  onBulkDetail: (rows: InvoiceRow[]) => void
  companies: Company[]
  halls: Hall[]
  employees: Employee[]
}

const quoteStatusColor = (s: InvoiceRow["status"]) => {
  switch (s) {
    case "請求前": return "bg-slate-100 text-slate-700"
    case "請求中": return "bg-amber-100 text-amber-800"
    case "請求完了": return "bg-green-100 text-green-800"
  }
}

function getProposalBadgeClass(status: string): string {
  if (status === "order-received") return "bg-green-100 text-green-800"
  if (status === "proposing") return "bg-blue-100 text-blue-800"
  return "bg-slate-100 text-slate-600"
}

export const BillingInvoiceTab = ({ filters, onFiltersChange, rows, onClickRow, onBulkConfirm, onBulkDetail, companies, halls, employees }: BillingInvoiceTabProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelection = (quoteId: string) => {
    setSelectedIds((prev) => prev.includes(quoteId) ? prev.filter((id) => id !== quoteId) : [...prev, quoteId])
  }

  const toggleAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(rows.map((r) => r.quoteId))
    }
  }

  const selectedRows = rows.filter((r) => selectedIds.includes(r.quoteId))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 shrink-0">
        <BillingFilters filters={filters} onFiltersChange={onFiltersChange} companies={companies} halls={halls} employees={employees} showInvoiceFilters />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {rows.length === 0 ? (
          <div className="text-center py-12 text-slate-500">該当する請求データがありません</div>
        ) : (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <div className="text-sm text-slate-600">
                {rows.length}件のレコード
                {selectedIds.length > 0 && (
                  <span className="ml-2 text-blue-700 font-medium">（{selectedIds.length}件選択中）</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { onBulkDetail(selectedRows) }}>
                      詳細へ
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={() => { onBulkConfirm(selectedRows); setSelectedIds([]) }}>
                      <CheckCircle2 className="h-4 w-4" />
                      一括確定
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.length === rows.length && rows.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">見積書ID</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">見積もり金額</TableHead>
                    <TableHead className="font-semibold text-slate-700">見積ステータス</TableHead>
                    <TableHead className="font-semibold text-slate-700">案件番号</TableHead>
                    <TableHead className="font-semibold text-slate-700">レコード番号</TableHead>
                    <TableHead className="font-semibold text-slate-700">ステータス</TableHead>
                    <TableHead className="font-semibold text-slate-700">商材区分</TableHead>
                    <TableHead className="font-semibold text-slate-700">商材名</TableHead>
                    <TableHead className="font-semibold text-slate-700">法人</TableHead>
                    <TableHead className="font-semibold text-slate-700">ホール</TableHead>
                    <TableHead className="font-semibold text-slate-700">実施日</TableHead>
                    <TableHead className="font-semibold text-slate-700">実施ステータス</TableHead>
                    <TableHead className="font-semibold text-slate-700">当選デザイン依頼</TableHead>
                    <TableHead className="font-semibold text-slate-700">景品発注依頼</TableHead>
                    <TableHead className="font-semibold text-slate-700">リスト確認</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">見積金額</TableHead>
                    <TableHead className="font-semibold text-slate-700">担当営業</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.quoteId}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      onClick={() => onClickRow(row)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(row.quoteId)}
                          onCheckedChange={() => toggleSelection(row.quoteId)}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-medium text-blue-600">{row.quoteId}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-slate-900">¥{row.quoteAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs px-2 py-0.5 ${quoteStatusColor(row.status)}`}>{row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{row.projectNumber}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.recordNumber}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs px-2 py-0.5 ${getProposalBadgeClass(row.proposalStatus)}`}>{row.proposalStatusLabel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-slate-700 text-white text-xs">{row.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">{row.productName}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.companyName}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.hallName}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.eventDate || "-"}</TableCell>
                      <TableCell>
                        <Badge className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5">{row.executionStatus || "-"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs px-2 py-0.5 ${row.designOrdered ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                          {row.designOrdered ? "実施済み" : "未実施"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs px-2 py-0.5 ${row.prizeOrdered ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                          {row.prizeOrdered ? "実施済み" : "未実施"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs px-2 py-0.5 ${row.listConfirmed ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                          {row.listConfirmed ? "確認済" : "確認前"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-slate-900">
                        ¥{row.estimatedBillingAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{row.salesPersonName}</TableCell>
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
