import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MonthlyBilling } from "@/new/api/types"
import type { BillingMode, CustomerBillingRow } from "../hooks/useMonthlyBilling"
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

      {/* Right panel: detail */}
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
