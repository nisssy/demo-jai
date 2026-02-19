import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MonthlyBilling, BillingStatus } from "@/new/api/types"
import { BILLING_STATUS_LABELS } from "@/new/api/display"
import { BillingConfirmationDetail } from "./components/BillingConfirmationDetail"

const STATUS_BADGE_STYLES: Record<BillingStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  "correction-requested": "bg-orange-100 text-orange-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  "invoice-received": "bg-purple-100 text-purple-800",
  agreed: "bg-indigo-100 text-indigo-800",
  acknowledged: "bg-green-100 text-green-800",
}

export interface PrizeVendorBillingViewProps {
  vendors: { id: string; name: string }[]
  selectedVendorId: string
  onSelectVendor: (id: string) => void
  selectedVendorName: string
  billings: MonthlyBilling[]
  selectedBillingId: string | null
  onSelectBilling: (id: string) => void
  selectedBilling: MonthlyBilling | null
  chatText: string
  onChatTextChange: (text: string) => void
  onSendChat: () => void
  onRequestCorrection: () => void
  onConfirm: () => void
  onSubmitInvoice: () => void
  onAcknowledge: () => void
}

export const PrizeVendorBillingView = ({
  vendors,
  selectedVendorId,
  onSelectVendor,
  selectedVendorName,
  billings,
  selectedBillingId,
  onSelectBilling,
  selectedBilling,
  chatText,
  onChatTextChange,
  onSendChat,
  onRequestCorrection,
  onConfirm,
  onSubmitInvoice,
  onAcknowledge,
}: PrizeVendorBillingViewProps) => {
  return (
    <div className="flex h-full">
      {/* Left panel: vendor selector + billing list */}
      <div className="w-[300px] border-r flex flex-col shrink-0">
        <div className="p-3 border-b">
          <Select value={selectedVendorId} onValueChange={onSelectVendor}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="業者を選択" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 overflow-y-auto divide-y">
          {billings.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
              計上データはありません
            </div>
          ) : (
            billings.map((billing) => (
              <button
                key={billing.id}
                onClick={() => onSelectBilling(billing.id)}
                className={`w-full text-left p-3 hover:bg-accent/50 transition-colors ${
                  selectedBillingId === billing.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    {billing.billingMonth.replace("-", "年")}月
                  </span>
                  <Badge className={`text-[10px] ${STATUS_BADGE_STYLES[billing.status]}`}>
                    {BILLING_STATUS_LABELS[billing.status]}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  ¥{billing.totalAmount.toLocaleString()} | {billing.lineItems.length}品目
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel: detail */}
      <div className="flex-1 overflow-y-auto">
        {!selectedBilling ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            左のリストから計上データを選択してください
          </div>
        ) : (
          <BillingConfirmationDetail
            billing={selectedBilling}
            vendorName={selectedVendorName}
            chatText={chatText}
            onChatTextChange={onChatTextChange}
            onSendChat={onSendChat}
            onRequestCorrection={onRequestCorrection}
            onConfirm={onConfirm}
            onSubmitInvoice={onSubmitInvoice}
            onAcknowledge={onAcknowledge}
          />
        )}
      </div>
    </div>
  )
}
