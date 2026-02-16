import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, Trash2 } from "lucide-react"
import type { ProductFormState, FormErrors } from "@/new/features/project-registration/model/types"
import type { UseLotteryFormReturn } from "@/new/features/project-registration/hooks/useLotteryForm"
import type { AvailabilityStatus } from "@/new/features/project-registration/hooks/useCastCalendar"
import { ProductBasicFields } from "./ProductBasicFields"
import { CastingSection } from "./CastingSection"
import { BillingSection } from "./BillingSection"
import { LotteryTabs } from "./lottery/LotteryTabs"
import { LotteryStatus } from "./lottery/LotteryStatus"
import type { OrderStatus, ExecutionStatus } from "@/new/features/project-registration/model/lottery-types"

const PRODUCT_LABELS = ["①", "②", "③", "④", "⑤"]

type ProductSectionProps = {
  index: number
  product: ProductFormState
  errors: FormErrors
  canDelete: boolean
  onToggleOpen: () => void
  onRemove: () => void
  // イベント区分
  eventTypeSearchOpen: boolean
  onEventTypeSearchOpenChange: (open: boolean) => void
  eventTypes: string[]
  onSelectEventType: (eventType: string) => void
  onCategoryChange: (category: string) => void
  // フィールド更新
  onFieldChange: (field: keyof ProductFormState, value: string) => void
  calculateDuration: (startTime: string, endTime: string) => string
  // 請求予定金額
  hallAddress: string
  // キャスティング
  onCastCountChange: (role: "companion" | "director", count: string) => void
  onToggleCast: (role: "companion" | "director", name: string) => void
  onToggleNomination: (role: "companion" | "director", name: string) => void
  checkAvailability?: (name: string, role: "companion" | "director") => AvailabilityStatus
  onOpenCalendar?: (name: string, status: AvailabilityStatus, type: "companion" | "director") => void
  onCastHoldTypeChange: (role: "companion" | "director", name: string, holdType: "tentative" | "confirmed") => void
  // ステータス
  onStatusChange: (status: OrderStatus) => void
  onReadingCertaintyChange: (value: "A" | "B" | "C" | "") => void
  onExecutionStatusChange: (status: ExecutionStatus) => void
  onConfirmOrder: () => void
  // 合同抽選会
  lotteryForm?: UseLotteryFormReturn
}

export const ProductSection = ({
  index,
  product,
  errors,
  canDelete,
  onToggleOpen,
  onRemove,
  eventTypeSearchOpen,
  onEventTypeSearchOpenChange,
  eventTypes,
  onSelectEventType,
  onCategoryChange,
  onFieldChange,
  calculateDuration,
  hallAddress,
  onCastCountChange,
  onToggleCast,
  onToggleNomination,
  checkAvailability,
  onOpenCalendar,
  onCastHoldTypeChange,
  onStatusChange,
  onReadingCertaintyChange,
  onExecutionStatusChange,
  onConfirmOrder,
  lotteryForm,
}: ProductSectionProps) => {
  const isLottery = product.category === "ポイント" && !!product.eventType.trim()
  const showCastingAndBilling = !!product.eventType && product.category !== "ポイント"

  const basicFields = (
    <ProductBasicFields
      index={index}
      product={product}
      errors={errors}
      eventTypeSearchOpen={eventTypeSearchOpen}
      onEventTypeSearchOpenChange={onEventTypeSearchOpenChange}
      eventTypes={eventTypes}
      onSelectEventType={onSelectEventType}
      onCategoryChange={onCategoryChange}
      onFieldChange={onFieldChange}
      calculateDuration={calculateDuration}
    />
  )

  return (
    <Card>
      <Collapsible open={product.isOpen} onOpenChange={onToggleOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                <CardTitle className="text-lg">商材情報{PRODUCT_LABELS[index]}</CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${product.isOpen ? "rotate-180" : ""}`} />
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
            {isLottery && lotteryForm ? (
              <div className="space-y-4">
                {basicFields}
                <LotteryTabs lotteryForm={lotteryForm} />
              </div>
            ) : showCastingAndBilling ? (
              <Tabs defaultValue="basic">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="basic" className="text-xs">① 基本情報</TabsTrigger>
                  <TabsTrigger value="casting" className="text-xs">② キャスティング</TabsTrigger>
                  <TabsTrigger value="billing" className="text-xs">③ 請求予定金額</TabsTrigger>
                  <TabsTrigger value="status" className="text-xs">④ ステータス</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="mt-4">
                  {basicFields}
                </TabsContent>
                <TabsContent value="casting" className="mt-4">
                  <CastingSection
                    product={product}
                    checkAvailability={checkAvailability}
                    onCastCountChange={onCastCountChange}
                    onToggleCast={onToggleCast}
                    onToggleNomination={onToggleNomination}
                    onOpenCalendar={onOpenCalendar}
                    onCastHoldTypeChange={onCastHoldTypeChange}
                  />
                </TabsContent>
                <TabsContent value="billing" className="mt-4">
                  <BillingSection
                    product={product}
                    hallAddress={hallAddress}
                    onFieldChange={onFieldChange}
                  />
                </TabsContent>
                <TabsContent value="status" className="mt-4">
                  <LotteryStatus
                    proposalStatus={product.proposalStatus}
                    readingCertainty={product.readingCertainty}
                    executionStatus={product.executionStatus}
                    onStatusChange={onStatusChange}
                    onReadingCertaintyChange={onReadingCertaintyChange}
                    onExecutionStatusChange={onExecutionStatusChange}
                    onConfirmOrder={onConfirmOrder}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              basicFields
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
