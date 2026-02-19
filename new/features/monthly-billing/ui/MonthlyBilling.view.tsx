import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MonthlyBilling } from "@/new/api/types"
import type { BillingMode, CustomerBillingRow, UndeliveredItem } from "../hooks/useMonthlyBilling"
import { VendorBillingList } from "./components/VendorBillingList"
import { BillingDetail } from "./components/BillingDetail"
import { CustomerBillingPreview } from "./components/CustomerBillingPreview"

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
  // Carry-over dialog props
  pendingCarryOver: UndeliveredItem[] | null
  onConfirmCarryOver: () => void
  onCancelCarryOver: () => void
  carriedOverItems: UndeliveredItem[]
  // Invoice mode props
  customerBillingRows: CustomerBillingRow[]
  onExtractCustomerBillings: () => void
  onDownloadCustomerBillingCsv: () => void
}

const MODE_TABS: { mode: BillingMode; label: string }[] = [
  { mode: "payment", label: "支払データ" },
  { mode: "invoice", label: "請求データ" },
]

export const MonthlyBillingView = ({
  billingMode,
  onChangeBillingMode,
  selectedMonth,
  onChangeMonth,
  billings,
  selectedBillingId,
  onSelectBilling,
  selectedBilling,
  onExtractBillings,
  onSendToVendor,
  onResendToVendor,
  onSendAgreement,
  chatText,
  onChatTextChange,
  onSendChat,
  allAcknowledged,
  closingReported,
  onReportClosing,
  onDownloadCsv,
  pendingCarryOver,
  onConfirmCarryOver,
  onCancelCarryOver,
  carriedOverItems,
  customerBillingRows,
  onExtractCustomerBillings,
  onDownloadCustomerBillingCsv,
}: MonthlyBillingViewProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Mode tabs */}
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

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {billingMode === "payment" ? (
          <PaymentModeContent
            selectedMonth={selectedMonth}
            onChangeMonth={onChangeMonth}
            billings={billings}
            selectedBillingId={selectedBillingId}
            onSelectBilling={onSelectBilling}
            selectedBilling={selectedBilling}
            onExtractBillings={onExtractBillings}
            onSendToVendor={onSendToVendor}
            onResendToVendor={onResendToVendor}
            onSendAgreement={onSendAgreement}
            chatText={chatText}
            onChatTextChange={onChatTextChange}
            onSendChat={onSendChat}
            allAcknowledged={allAcknowledged}
            closingReported={closingReported}
            onReportClosing={onReportClosing}
            onDownloadCsv={onDownloadCsv}
            pendingCarryOver={pendingCarryOver}
            onConfirmCarryOver={onConfirmCarryOver}
            onCancelCarryOver={onCancelCarryOver}
            carriedOverItems={carriedOverItems}
          />
        ) : (
          <InvoiceModeContent
            selectedMonth={selectedMonth}
            onChangeMonth={onChangeMonth}
            customerBillingRows={customerBillingRows}
            onExtractCustomerBillings={onExtractCustomerBillings}
            onDownloadCustomerBillingCsv={onDownloadCustomerBillingCsv}
          />
        )}
      </div>
    </div>
  )
}

/* ---- Payment mode (existing layout) ---- */

const PaymentModeContent = ({
  selectedMonth,
  onChangeMonth,
  billings,
  selectedBillingId,
  onSelectBilling,
  selectedBilling,
  onExtractBillings,
  onSendToVendor,
  onResendToVendor,
  onSendAgreement,
  chatText,
  onChatTextChange,
  onSendChat,
  allAcknowledged,
  closingReported,
  onReportClosing,
  onDownloadCsv,
  pendingCarryOver,
  onConfirmCarryOver,
  onCancelCarryOver,
  carriedOverItems,
}: {
  selectedMonth: string
  onChangeMonth: (month: string) => void
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
  pendingCarryOver: UndeliveredItem[] | null
  onConfirmCarryOver: () => void
  onCancelCarryOver: () => void
  carriedOverItems: UndeliveredItem[]
}) => {
  return (
    <div className="flex h-full">
      {/* Left panel: month selector + vendor list */}
      <div className="w-[320px] border-r flex flex-col shrink-0">
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => onChangeMonth(e.target.value)}
              className="text-sm"
            />
          </div>
          <Button onClick={onExtractBillings} size="sm" className="w-full">
            データ抽出
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <VendorBillingList
            billings={billings}
            selectedBillingId={selectedBillingId}
            onSelectBilling={onSelectBilling}
          />
        </div>

        {/* Closing section */}
        {billings.length > 0 && (
          <div className="p-3 border-t space-y-2">
            {allAcknowledged && !closingReported && (
              <Button onClick={onReportClosing} size="sm" className="w-full">
                請求チームへ確認完了を報告
              </Button>
            )}
            {closingReported && (
              <Badge className="w-full justify-center bg-green-100 text-green-800 py-1">
                請求チームへ報告済み
              </Badge>
            )}
            {!allAcknowledged && billings.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                全業者の了承完了後に締め処理が可能です
              </p>
            )}
            <Button onClick={onDownloadCsv} size="sm" variant="outline" className="w-full">
              支払データCSVダウンロード
            </Button>
          </div>
        )}
      </div>

      {/* Right panel: detail + carried-over notice */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Carried-over items notice */}
        {carriedOverItems.length > 0 && (
          <CarriedOverNotice items={carriedOverItems} />
        )}

        <div className="flex-1 overflow-y-auto">
          {!selectedBilling ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              左のリストから業者を選択してください
            </div>
          ) : (
            <BillingDetail
              billing={selectedBilling}
              chatText={chatText}
              onChatTextChange={onChatTextChange}
              onSendChat={onSendChat}
              onSendToVendor={onSendToVendor}
              onResendToVendor={onResendToVendor}
              onSendAgreement={onSendAgreement}
            />
          )}
        </div>
      </div>

      {/* Carry-over confirmation dialog */}
      <CarryOverDialog
        pendingCarryOver={pendingCarryOver}
        onConfirm={onConfirmCarryOver}
        onCancel={onCancelCarryOver}
      />
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
            以下の景品は発送完了日が未入力のため、翌月に繰り越されます。完了済みの景品のみで支払データを作成します。
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
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={onConfirm}>
            繰り越して抽出
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---- Carried-over items notice ---- */

const CarriedOverNotice = ({ items }: { items: UndeliveredItem[] }) => {
  return (
    <div className="border-b bg-amber-50 p-3 shrink-0">
      <p className="text-sm font-medium text-amber-800 mb-2">
        翌月繰越: {items.length}件の景品が未発送のため繰り越されました
      </p>
      <div className="border rounded-md bg-white overflow-auto max-h-[200px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">業者名</TableHead>
              <TableHead className="text-xs">景品名</TableHead>
              <TableHead className="text-xs">当選者名</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={`${item.vendorId}-${item.winnerId}`}>
                <TableCell className="text-xs py-1">{item.vendorName}</TableCell>
                <TableCell className="text-xs py-1">{item.prizeName}</TableCell>
                <TableCell className="text-xs py-1">{item.winnerName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ---- Invoice mode ---- */

const InvoiceModeContent = ({
  selectedMonth,
  onChangeMonth,
  customerBillingRows,
  onExtractCustomerBillings,
  onDownloadCustomerBillingCsv,
}: {
  selectedMonth: string
  onChangeMonth: (month: string) => void
  customerBillingRows: CustomerBillingRow[]
  onExtractCustomerBillings: () => void
  onDownloadCustomerBillingCsv: () => void
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Top bar: month selector + actions */}
      <div className="p-3 border-b flex items-center gap-3 shrink-0">
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => onChangeMonth(e.target.value)}
          className="text-sm w-[200px]"
        />
        <Button onClick={onExtractCustomerBillings} size="sm">
          データ抽出
        </Button>
        {customerBillingRows.length > 0 && (
          <Button onClick={onDownloadCustomerBillingCsv} size="sm" variant="outline">
            請求データCSVダウンロード
          </Button>
        )}
      </div>

      {/* Preview table */}
      <div className="flex-1 overflow-y-auto">
        <CustomerBillingPreview rows={customerBillingRows} />
      </div>
    </div>
  )
}
