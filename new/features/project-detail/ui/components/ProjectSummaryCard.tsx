import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Package, Banknote } from "lucide-react"
import type { ProductSummary } from "@/new/features/project-detail/model/types"

type ProjectSummaryCardProps = {
  products: ProductSummary[]
  onCreateQuote: () => void
}

export const ProjectSummaryCard = ({ products, onCreateQuote }: ProjectSummaryCardProps) => {
  const totalAmount = products.reduce((sum, p) => sum + (p.estimatedBillingAmount ?? 0), 0)
  const eventCount = products.filter((p) => p.category === "イベント").length
  const lotteryCount = products.filter((p) => p.category === "ポイント").length

  return (
    <Card className="border-slate-200">
      <CardContent className="p-5 space-y-4">
        {/* 合計金額 */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Banknote className="h-3.5 w-3.5" />
            合計見積金額
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ¥{totalAmount.toLocaleString()}
          </div>
        </div>

        <Separator />

        {/* 商材数 */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Package className="h-3.5 w-3.5" />
            商材数
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-900">{products.length}件</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {eventCount > 0 && (
              <Badge variant="outline" className="text-xs">イベント {eventCount}</Badge>
            )}
            {lotteryCount > 0 && (
              <Badge variant="outline" className="text-xs">ポイント {lotteryCount}</Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* アクション */}
        <Button onClick={onCreateQuote} className="w-full gap-2">
          <FileText className="h-4 w-4" />
          見積作成
        </Button>
      </CardContent>
    </Card>
  )
}
