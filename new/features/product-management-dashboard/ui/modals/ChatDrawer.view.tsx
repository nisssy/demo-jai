import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ProductChat } from "@/new/features/product-chat/ui/product-chat"

export type ChatDrawerViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: number | null
  productName: string
}

export function ChatDrawerView({ open, onOpenChange, productId, productName }: ChatDrawerViewProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-3 border-b">
          <SheetTitle className="text-base">{productName}</SheetTitle>
          <SheetDescription className="text-xs">外注業者とのチャット</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          {productId && (
            <ProductChat productId={productId} author="商材管理課" departments={["商材管理課"]} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
