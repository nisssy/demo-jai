import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MonthlyBilling, Company, Hall, HallQuote } from "@/new/api/types"
import type { BillingMode, UndeliveredItem } from "../hooks/useMonthlyBilling"
import type { BillingFilterState } from "./components/BillingFilters"
import type { InvoiceRow } from "./components/BillingInvoiceTab"
import type { PaymentRow } from "./components/BillingPaymentTab"
import { BillingInvoiceTab } from "./components/BillingInvoiceTab"
import { BillingPaymentTab } from "./components/BillingPaymentTab"
import { InvoiceDetailView } from "./components/InvoiceDetailView"
import { BillingDetail } from "./components/BillingDetail"
import { VendorBillingList } from "./components/VendorBillingList"

export interface MonthlyBillingViewProps {
  billingMode: BillingMode
  onChangeBillingMode: (mode: BillingMode) => void
  selectedMonth: string
  onChangeMonth: (month: string) => void
  // Payment mode props (vendor detail)
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
  // Carry-over dialog props
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
  // 支払いタブ
  paymentFilters: BillingFilterState
  onPaymentFiltersChange: (f: BillingFilterState) => void
  paymentRows: PaymentRow[]
  selectedPaymentRow: PaymentRow | null
  onSelectPaymentRow: (row: PaymentRow | null) => void
  onPaymentRowClick: (row: PaymentRow) => void
  // master data
  companies: Company[]
  halls: Hall[]
}

const MODE_TABS: { mode: BillingMode; label: string }[] = [
  { mode: "invoice", label: "請求" },
  { mode: "payment", label: "支払い" },
]

export const MonthlyBillingView = (props: MonthlyBillingViewProps) => {
  const { billingMode, onChangeBillingMode } = props

  return (
    <div className="flex flex-col h-full">
      {/* Mode tabs - only show when not drilled down */}
      {!props.selectedInvoiceRow && !props.selectedPaymentRow && (
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
        {/* Invoice detail drilldown */}
        {props.selectedInvoiceRow && props.invoiceHallQuote ? (
          <InvoiceDetailView
            quoteId={props.selectedInvoiceRow.quoteId}
            projectNumber={props.selectedInvoiceRow.projectNumber}
            productName={props.selectedInvoiceRow.productName}
            companyName={props.selectedInvoiceRow.companyName}
            hallQuote={props.invoiceHallQuote}
            status={props.selectedInvoiceRow.status}
            onBack={() => props.onSelectInvoiceRow(null)}
          />
        ) : props.selectedPaymentRow && props.selectedBilling ? (
          /* Payment detail drilldown - vendor billing detail */
          <div className="flex flex-col h-full">
            <div className="p-3 border-b shrink-0">
              <Button variant="ghost" size="sm" onClick={() => props.onSelectPaymentRow(null)} className="text-xs">
                ← 支払い一覧に戻る
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <BillingDetail
                billing={props.selectedBilling}
                chatText={props.chatText}
                onChatTextChange={props.onChatTextChange}
                onSendChat={props.onSendChat}
                onSendToVendor={props.onSendToVendor}
                onResendToVendor={props.onResendToVendor}
                onSendAgreement={props.onSendAgreement}
              />
            </div>
          </div>
        ) : billingMode === "invoice" ? (
          <BillingInvoiceTab
            filters={props.invoiceFilters}
            onFiltersChange={props.onInvoiceFiltersChange}
            rows={props.invoiceRows}
            onClickRow={(row) => props.onSelectInvoiceRow(row)}
            companies={props.companies}
            halls={props.halls}
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

            {/* Payment tab: search filters + table */}
            <BillingPaymentTab
              filters={props.paymentFilters}
              onFiltersChange={props.onPaymentFiltersChange}
              rows={props.paymentRows}
              onClickRow={(row) => {
                props.onPaymentRowClick(row)
                props.onSelectPaymentRow(row)
              }}
              companies={props.companies}
              halls={props.halls}
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
