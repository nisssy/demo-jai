import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MonthlyBilling, Company, Hall, HallQuote, Employee, PaymentCheckStatus } from "@/new/api/types"
import type { BillingMode, UndeliveredItem } from "../hooks/useMonthlyBilling"
import type { BillingFilterState } from "./components/BillingFilters"
import type { PaymentFilterState } from "./components/PaymentFilters"
import type { InvoiceRow } from "./components/BillingInvoiceTab"
import type { PaymentRow } from "./components/BillingPaymentTab"
import { BillingInvoiceTab } from "./components/BillingInvoiceTab"
import { BillingPaymentTab } from "./components/BillingPaymentTab"
import { InvoiceDetailView } from "./components/InvoiceDetailView"
import { BulkInvoiceConfirmView } from "./components/BulkInvoiceConfirmView"
import { PaymentDetailView } from "./components/PaymentDetailView"

export interface MonthlyBillingViewProps {
  billingMode: BillingMode
  onChangeBillingMode: (mode: BillingMode) => void
  selectedMonth: string
  onChangeMonth: (month: string) => void
  // Payment mode props
  billings: MonthlyBilling[]
  selectedBillingId: string | null
  onSelectBilling: (id: string) => void
  selectedBilling: MonthlyBilling | null
  onExtractBillings: () => void
  onSendToVendor: () => void
  onResendToVendor: () => void
  onSendAgreement: () => void
  chatText: string
  onChatTextChange: (text: string) => void
  onSendChat: () => void
  allAcknowledged: boolean
  closingReported: boolean
  onReportClosing: () => void
  onDownloadCsv: () => void
  // Carry-over
  pendingCarryOver: UndeliveredItem[] | null
  onConfirmCarryOver: () => void
  onCancelCarryOver: () => void
  carriedOverItems: UndeliveredItem[]
  // 請求タブ
  invoiceFilters: BillingFilterState
  onInvoiceFiltersChange: (f: BillingFilterState) => void
  invoiceRows: InvoiceRow[]
  selectedInvoiceRow: InvoiceRow | null
  onSelectInvoiceRow: (row: InvoiceRow | null) => void
  invoiceHallQuote: HallQuote | null
  onConfirmQuote: (quoteId: string) => void
  confirmedQuoteIds: Set<string>
  bulkConfirmRows: InvoiceRow[] | null
  onBulkConfirm: (rows: InvoiceRow[]) => void
  onCancelBulkConfirm: () => void
  getInvoiceHallQuote: (productId: number, hallIndex: number) => HallQuote | null
  // 支払いタブ
  paymentFilters: PaymentFilterState
  onPaymentFiltersChange: (f: PaymentFilterState) => void
  paymentRows: PaymentRow[]
  selectedPaymentRow: PaymentRow | null
  onSelectPaymentRow: (row: PaymentRow | null) => void
  onPaymentRowClick: (row: PaymentRow) => void
  selectedPaymentBilling: MonthlyBilling | null
  getPaymentCheckStatus: (billingId: string) => PaymentCheckStatus
  onSendPaymentToVendor: (billingId: string) => void
  onConfirmPayment: (billingId: string) => void
  paymentVendors: { vendorId: string; vendorName: string }[]
  // master data
  companies: Company[]
  halls: Hall[]
  employees: Employee[]
}

const MODE_TABS: { mode: BillingMode; label: string }[] = [
  { mode: "invoice", label: "請求" },
  { mode: "payment", label: "支払い" },
]

export const MonthlyBillingView = (props: MonthlyBillingViewProps) => {
  const { billingMode, onChangeBillingMode } = props

  // Determine if we're in a drilldown view
  const isDrilledDown = Boolean(props.selectedInvoiceRow) || Boolean(props.selectedPaymentRow) || Boolean(props.bulkConfirmRows)

  return (
    <div className="flex flex-col h-full">
      {/* Mode tabs - only show when not drilled down */}
      {!isDrilledDown && (
        <div className="flex border-b shrink-0">
          {MODE_TABS.map((tab) => (
            <button
              key={tab.mode}
              onClick={() => onChangeBillingMode(tab.mode)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                billingMode === tab.mode
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {/* Bulk confirm drilldown */}
        {props.bulkConfirmRows ? (
          <BulkInvoiceConfirmView
            rows={props.bulkConfirmRows}
            getHallQuote={props.getInvoiceHallQuote}
            confirmedIds={props.confirmedQuoteIds}
            onConfirm={props.onConfirmQuote}
            onBack={props.onCancelBulkConfirm}
          />
        ) : props.selectedInvoiceRow && props.invoiceHallQuote ? (
          /* Invoice detail drilldown */
          <InvoiceDetailView
            quoteId={props.selectedInvoiceRow.quoteId}
            projectNumber={props.selectedInvoiceRow.projectNumber}
            productName={props.selectedInvoiceRow.productName}
            companyName={props.selectedInvoiceRow.companyName}
            hallQuote={props.invoiceHallQuote}
            status={props.selectedInvoiceRow.status}
            onBack={() => props.onSelectInvoiceRow(null)}
            onConfirm={props.onConfirmQuote}
            confirmed={props.confirmedQuoteIds.has(props.selectedInvoiceRow.quoteId)}
          />
        ) : props.selectedPaymentRow && props.selectedPaymentBilling ? (
          /* Payment detail drilldown */
          <PaymentDetailView
            billing={props.selectedPaymentBilling}
            checkStatus={props.getPaymentCheckStatus(props.selectedPaymentBilling.id)}
            chatText={props.chatText}
            onChatTextChange={props.onChatTextChange}
            onSendChat={props.onSendChat}
            onSendToVendor={() => props.onSendPaymentToVendor(props.selectedPaymentBilling!.id)}
            onConfirm={() => props.onConfirmPayment(props.selectedPaymentBilling!.id)}
            onBack={() => props.onSelectPaymentRow(null)}
          />
        ) : billingMode === "invoice" ? (
          <BillingInvoiceTab
            filters={props.invoiceFilters}
            onFiltersChange={props.onInvoiceFiltersChange}
            rows={props.invoiceRows}
            onClickRow={(row) => props.onSelectInvoiceRow(row)}
            onBulkConfirm={props.onBulkConfirm}
            onBulkDetail={props.onBulkConfirm}
            companies={props.companies}
            halls={props.halls}
            employees={props.employees}
          />
        ) : (
          <div className="flex flex-col h-full">
            {/* Month selector + extract */}
            <div className="p-3 border-b flex items-center gap-3 shrink-0">
              <Input
                type="month"
                value={props.selectedMonth}
                onChange={(e) => props.onChangeMonth(e.target.value)}
                className="text-sm w-[200px]"
              />
              <Button onClick={props.onExtractBillings} size="sm">
                データ抽出
              </Button>
              {props.billings.length > 0 && (
                <Button onClick={props.onDownloadCsv} size="sm" variant="outline">
                  支払データCSVダウンロード
                </Button>
              )}
              {props.allAcknowledged && !props.closingReported && (
                <Button onClick={props.onReportClosing} size="sm">
                  請求チームへ確認完了を報告
                </Button>
              )}
              {props.closingReported && (
                <Badge className="bg-green-100 text-green-800 py-1 px-3">報告済み</Badge>
              )}
            </div>

            {/* Payment tab */}
            <BillingPaymentTab
              filters={props.paymentFilters}
              onFiltersChange={props.onPaymentFiltersChange}
              rows={props.paymentRows}
              onClickRow={(row) => {
                props.onPaymentRowClick(row)
                props.onSelectPaymentRow(row)
              }}
              vendors={props.paymentVendors}
            />

            {/* Carry-over dialog */}
            <CarryOverDialog
              pendingCarryOver={props.pendingCarryOver}
              onConfirm={props.onConfirmCarryOver}
              onCancel={props.onCancelCarryOver}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/* ---- Carry-over confirmation dialog ---- */

const CarryOverDialog = ({
  pendingCarryOver,
  onConfirm,
  onCancel,
}: {
  pendingCarryOver: UndeliveredItem[] | null
  onConfirm: () => void
  onCancel: () => void
}) => {
  const isOpen = pendingCarryOver !== null && pendingCarryOver.length > 0
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>発送未完了の景品があります</DialogTitle>
          <DialogDescription>
            以下の景品は発送完了日が未入力のため、翌月に繰り越されます。
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>業者名</TableHead>
                <TableHead>景品名</TableHead>
                <TableHead>当選者名</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pendingCarryOver ?? []).map((item) => (
                <TableRow key={`${item.vendorId}-${item.winnerId}`}>
                  <TableCell className="text-sm">{item.vendorName}</TableCell>
                  <TableCell className="text-sm">{item.prizeName}</TableCell>
                  <TableCell className="text-sm">{item.winnerName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button onClick={onConfirm}>繰り越して抽出</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
