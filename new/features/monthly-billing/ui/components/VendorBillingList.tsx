import { Badge } from "@/components/ui/badge"
import type { MonthlyBilling, BillingStatus } from "@/new/api/types"
import { BILLING_STATUS_LABELS } from "@/new/api/display"

const STATUS_BADGE_STYLES: Record<BillingStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  "correction-requested": "bg-orange-100 text-orange-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  "invoice-received": "bg-purple-100 text-purple-800",
  agreed: "bg-indigo-100 text-indigo-800",
  acknowledged: "bg-green-100 text-green-800",
}

const VENDOR_TYPE_LABELS: Record<string, string> = {
  prize: "景品業者",
  design: "デザイン業者",
}

interface VendorBillingListProps {
  billings: MonthlyBilling[]
  selectedBillingId: string | null
  onSelectBilling: (id: string) => void
}

export const VendorBillingList = ({
  billings,
  selectedBillingId,
  onSelectBilling,
}: VendorBillingListProps) => {
  if (billings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
        この月の計上データはありません
      </div>
    )
  }

  return (
    <div className="divide-y">
      {billings.map((billing) => (
        <button
          key={billing.id}
          onClick={() => onSelectBilling(billing.id)}
          className={`w-full text-left p-3 hover:bg-accent/50 transition-colors ${
            selectedBillingId === billing.id ? "bg-accent" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm truncate">{billing.vendorName}</span>
            <Badge className={`text-[10px] shrink-0 ${STATUS_BADGE_STYLES[billing.status]}`}>
              {BILLING_STATUS_LABELS[billing.status]}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{VENDOR_TYPE_LABELS[billing.vendorType] ?? billing.vendorType}</span>
            <span>¥{billing.totalAmount.toLocaleString()}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
