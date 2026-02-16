import { Card, CardContent } from "@/components/ui/card"
import type { ProductListItem } from "../hooks/useLotteryAdminDashboard"

export interface ProductListPanelViewProps {
  products: ProductListItem[]
  selectedProductId: number | null
  onSelectProduct: (id: number) => void
}

export const ProductListPanelView = ({
  products,
  selectedProductId,
  onSelectProduct,
}: ProductListPanelViewProps) => {
  return (
    <div className="w-[350px] shrink-0 border-r overflow-y-auto h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">合同抽選会 商材一覧</h2>
        <p className="text-sm text-muted-foreground mt-1">{products.length}件</p>
      </div>
      <div className="p-2 space-y-2">
        {products.map((product) => (
          <Card
            key={product.id}
            className={`cursor-pointer transition-colors hover:bg-accent/50 ${
              selectedProductId === product.id ? "border-primary bg-accent" : ""
            }`}
            onClick={() => onSelectProduct(product.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">
                  {product.projectNumber}
                </span>
              </div>
              <p className="font-medium text-sm">{product.eventProductName}</p>
              {product.hallNames.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {product.hallNames.join("、")}
                </p>
              )}
              {product.eventStartDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {product.eventStartDate}
                  {product.eventEndDate ? ` 〜 ${product.eventEndDate}` : ""}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <div className="text-center text-muted-foreground py-8 text-sm">
            対象の商材がありません
          </div>
        )}
      </div>
    </div>
  )
}
