import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send } from "lucide-react"
import type { ManagementConfirmationStatus } from "@/new/api/types"
import { MANAGEMENT_CONFIRMATION_STATUS_LABELS } from "@/new/api/display"

type ConfirmationStatusBarProps = {
  status: ManagementConfirmationStatus
  onRequestConfirmation: () => void
}

const STATUS_STYLES: Record<ManagementConfirmationStatus, string> = {
  unconfirmed: "bg-slate-100 border-slate-200",
  "under-review": "bg-blue-50 border-blue-200",
  "revision-requested": "bg-orange-50 border-orange-200",
  approved: "bg-green-50 border-green-200",
}

const BADGE_STYLES: Record<ManagementConfirmationStatus, string> = {
  unconfirmed: "bg-slate-200 text-slate-700",
  "under-review": "bg-blue-100 text-blue-700",
  "revision-requested": "bg-orange-100 text-orange-700",
  approved: "bg-green-100 text-green-700",
}

export const ConfirmationStatusBar = ({ status, onRequestConfirmation }: ConfirmationStatusBarProps) => {
  const canRequest = status === "unconfirmed" || status === "revision-requested"

  return (
    <div className={`flex items-center justify-between rounded-lg border p-3 mb-4 ${STATUS_STYLES[status]}`}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600">マネジメント部確認:</span>
        <Badge className={BADGE_STYLES[status]}>
          {MANAGEMENT_CONFIRMATION_STATUS_LABELS[status]}
        </Badge>
      </div>
      {canRequest && (
        <Button size="sm" onClick={onRequestConfirmation} className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          確認依頼
        </Button>
      )}
    </div>
  )
}
