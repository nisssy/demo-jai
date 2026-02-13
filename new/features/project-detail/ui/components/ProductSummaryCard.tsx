import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Calendar } from "lucide-react"
import type { ProductSummary } from "@/new/features/project-detail/model/types"

type ProductSummaryCardProps = {
  product: ProductSummary
  onEdit: () => void
}

export const ProductSummaryCard = ({ product, onEdit }: ProductSummaryCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onEdit}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{product.category}</Badge>
              <Badge variant="outline">{product.eventType}</Badge>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-slate-900">
                {product.eventProductName || "商材名未設定"}
              </p>
              {product.eventDate && (
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  実施日: {product.eventDate}
                </p>
              )}
              {product.estimatedBillingAmount != null && (
                <p className="text-sm text-slate-600">
                  請求予定: ¥{product.estimatedBillingAmount.toLocaleString()}
                </p>
              )}
            </div>

            {product.proposalStatus && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                {product.proposalStatus}
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
