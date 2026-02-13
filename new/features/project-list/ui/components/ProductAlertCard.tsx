import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, AlertTriangle, Pencil } from "lucide-react"
import type { ProductViewModel } from "@/new/features/project-list/hooks/useProjectList"

type ProductAlertCardProps = {
  product: ProductViewModel
  alertTitle: string
  alertText: string
  actionLabel: string
  onAction: (productId: number) => void
}

export const ProductAlertCard = ({
  product,
  alertTitle,
  alertText,
  actionLabel,
  onAction,
}: ProductAlertCardProps) => {
  return (
    <div className="border rounded-lg p-4 bg-white border-orange-200">
      <div className="space-y-3">
        {/* ヘッダー */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-700 text-white text-xs">{product.category}</Badge>
              <Badge variant="outline" className="text-xs">{product.eventType}</Badge>
            </div>
            <h4 className="font-medium text-slate-900">
              {product.eventProductName}
            </h4>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {product.eventDate}
          </span>
          <span>見積金額: ¥{product.estimatedBillingAmount.toLocaleString()}</span>
        </div>

        {/* アラートエリア */}
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium text-orange-800">{alertTitle}</div>
              <div className="text-sm text-orange-700 mt-1">{alertText}</div>
            </div>
          </div>
        </div>

        {/* アクション */}
        <div className="flex justify-end">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => onAction(product.id)}
          >
            <Pencil className="h-3.5 w-3.5" />
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
