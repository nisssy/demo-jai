import { Checkbox } from "@/components/ui/checkbox"
import type { Product } from "@/new/api/types"
import type { ProductQuoteSummary } from "@/new/features/project-quote/model/types"

type ProductSelectorProps = {
  products: Product[]
  selectedIds: Set<number>
  summaries: ProductQuoteSummary[]
  projectNumber: string
  onToggle: (productId: number) => void
}

export const ProductSelector = ({
  products,
  selectedIds,
  summaries,
  projectNumber,
  onToggle,
}: ProductSelectorProps) => {
  const summaryMap = new Map(summaries.map((s) => [s.id, s]))

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500 mb-2">
        案件No: {projectNumber}
      </div>
      <p className="text-sm text-slate-600 mb-4">
        見積に含める商材を選択してください。
      </p>
      <div className="space-y-2">
        {products.map((product) => {
          const summary = summaryMap.get(product.id)
          const checked = selectedIds.has(product.id)
          const productName = product.eventProductName || product.eventType
          return (
            <label
              key={product.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                checked ? "border-blue-300 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => onToggle(product.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-slate-900">{productName}</div>
                <div className="text-xs text-slate-500">
                  実施日: {product.eventDate} | 見積金額: ¥{(summary?.subtotal ?? product.estimatedBillingAmount).toLocaleString()}
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
