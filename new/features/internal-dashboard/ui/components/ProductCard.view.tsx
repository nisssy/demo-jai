import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PROPOSAL_STATUS_LABELS, EXECUTION_STATUS_LABELS } from "@/new/api/display"
import { CastSection } from "./CastSection"
import type { Product, ProposalStatus, ExecutionStatus } from "@/new/api/types"

const proposalStatusColor: Record<ProposalStatus, string> = {
  "before-proposal": "bg-slate-100 text-slate-800",
  "proposing": "bg-blue-100 text-blue-800",
  "order-received": "bg-green-100 text-green-800",
}

const executionStatusColor: Record<ExecutionStatus, string> = {
  "実施前": "bg-slate-100 text-slate-800",
  "実施中": "bg-amber-100 text-amber-800",
  "終了": "bg-green-100 text-green-800",
}

export type ProductCardViewProps = {
  product: Product
  projectName?: string
  showProposalStatus?: boolean
  showExecutionStatus?: boolean
  actions: React.ReactNode
}

export function ProductCardView({
  product,
  projectName,
  showProposalStatus,
  showExecutionStatus,
  actions,
}: ProductCardViewProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{product.projectNumber}</p>
            <p className="font-semibold">{product.eventProductName}</p>
            {projectName && (
              <p className="text-sm text-muted-foreground">{projectName}</p>
            )}
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm text-muted-foreground">実施日</p>
            <p className="font-medium">{product.eventDate || "未定"}</p>
            {product.startTime && product.endTime && (
              <p className="text-xs text-muted-foreground">
                {product.startTime} - {product.endTime}
              </p>
            )}
          </div>
        </div>

        {/* Status badges */}
        <div className="flex gap-2">
          {showProposalStatus && (
            <Badge className={proposalStatusColor[product.proposalStatus]}>
              {PROPOSAL_STATUS_LABELS[product.proposalStatus]}
            </Badge>
          )}
          {showExecutionStatus && product.executionStatus && (
            <Badge className={executionStatusColor[product.executionStatus]}>
              {EXECUTION_STATUS_LABELS[product.executionStatus]}
            </Badge>
          )}
        </div>

        {/* Comments */}
        {product.comments && product.comments.length > 0 && (
          <div className="rounded-md bg-orange-50 border border-orange-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-orange-800">コメント</p>
            {product.comments.map((c, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-orange-800">{c.author}</span>
                <span className="text-orange-400 text-xs ml-2">{new Date(c.timestamp).toLocaleString("ja-JP")}</span>
                <p className="text-orange-900">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Cast sections */}
        <CastSection
          label="コンパニオン"
          names={product.selectedCompanions}
          bookingStatus={product.companionBookingStatus}
        />
        <CastSection
          label="ディレクター"
          names={product.selectedDirectors}
          bookingStatus={product.directorBookingStatus}
        />
        <CastSection
          label="MC"
          names={product.selectedMcs}
          bookingStatus={product.mcBookingStatus}
        />

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {actions}
        </div>
      </CardContent>
    </Card>
  )
}
