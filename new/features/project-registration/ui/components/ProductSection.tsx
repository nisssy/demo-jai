import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Trash2 } from "lucide-react"
import { ProductContent } from "./ProductContent"
import type { ProductContentProps } from "./ProductContent"

const PRODUCT_LABELS = ["1", "2", "3", "4", "5"]

type ProductSectionProps = ProductContentProps & {
  canDelete: boolean
  onToggleOpen: () => void
  onRemove: () => void
}

export const ProductSection = ({
  canDelete,
  onToggleOpen,
  onRemove,
  ...contentProps
}: ProductSectionProps) => {
  return (
    <Card>
      <Collapsible open={contentProps.product.isOpen} onOpenChange={onToggleOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                <CardTitle className="text-lg">商材情報{PRODUCT_LABELS[contentProps.index]}</CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${contentProps.product.isOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            {canDelete && (
              <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <ProductContent {...contentProps} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
