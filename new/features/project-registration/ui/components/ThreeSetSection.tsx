import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronDown, Trash2 } from "lucide-react"
import { ProductContent } from "./ProductContent"
import type { ProductContentProps } from "./ProductContent"
import { computeEstimatedBilling, THREE_SET_BASE_FEE_PER_EVENT } from "@/new/api/cast-data"

type ThreeSetSectionProps = {
  contentProps: [ProductContentProps, ProductContentProps, ProductContentProps]
  isOpen: boolean
  canDelete: boolean
  activeTab: string
  onTabChange: (tab: string) => void
  onToggleOpen: () => void
  onRemove: () => void
  onThreeSetModeChange: (isThreeSet: boolean) => void
  hallAddress: string
}

const EVENT_LABELS = ["第1回", "第2回", "第3回"] as const

export const ThreeSetSection = ({
  contentProps,
  isOpen,
  canDelete,
  activeTab,
  onTabChange,
  onToggleOpen,
  onRemove,
  onThreeSetModeChange,
  hallAddress,
}: ThreeSetSectionProps) => {
  // 各回の請求予定金額を計算
  const billings = contentProps.map((cp) => {
    const p = cp.product
    if (!p.eventType) return 0
    return computeEstimatedBilling({
      startTime: p.startTime,
      endTime: p.endTime,
      companionCount: p.companionCount,
      directorCount: p.directorCount,
      selectedCompanions: p.selectedCompanions,
      selectedDirectors: p.selectedDirectors,
      performanceFeeDiscount: p.performanceFeeDiscount,
      accommodationFeePerPerson: p.accommodationFeePerPerson,
      eventBaseFeeDiscount: p.eventBaseFeeDiscount,
      eventType: p.eventType,
      hallAddress,
      eventBaseFeeOverride: THREE_SET_BASE_FEE_PER_EVENT,
    })
  })
  const totalBilling = billings.reduce((sum, b) => sum + b, 0)

  return (
    <Card className="border-amber-200">
      <Collapsible open={isOpen} onOpenChange={onToggleOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                <CardTitle className="text-lg">スロセレ 3点セット</CardTitle>
                <Badge className="bg-amber-100 text-amber-800 text-xs">3回分</Badge>
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
          <CardContent className="space-y-4">
            {/* カテゴリ/イベント区分/登録タイプ（固定表示 + ラジオ切替） */}
            <div className="border-b border-slate-200 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-slate-500">カテゴリ</Label>
                  <div className="text-sm font-medium text-slate-900">イベント</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-slate-500">イベント区分</Label>
                  <div className="text-sm font-medium text-slate-900">スロセレ</div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-semibold">登録タイプ</Label>
                  <RadioGroup
                    value="three-set"
                    onValueChange={(v) => onThreeSetModeChange(v === "three-set")}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="normal" id="three-set-section-normal" />
                      <Label htmlFor="three-set-section-normal" className="text-sm cursor-pointer">通常登録</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="three-set" id="three-set-section-three-set" />
                      <Label htmlFor="three-set-section-three-set" className="text-sm cursor-pointer">3点セット登録</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* 3回分のタブ */}
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList className="w-full grid grid-cols-3">
                {EVENT_LABELS.map((label, i) => (
                  <TabsTrigger key={i} value={`event-${i}`} className="text-xs">
                    {label}
                    {contentProps[i].product.eventDate && (
                      <span className="ml-1 text-slate-400">({contentProps[i].product.eventDate})</span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              {EVENT_LABELS.map((_, i) => (
                <TabsContent key={i} value={`event-${i}`} className="mt-4">
                  <ProductContent
                    {...contentProps[i]}
                    hideBasicHeader={true}
                  />
                </TabsContent>
              ))}
            </Tabs>

            {/* 合計請求予定金額 */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="space-y-2">
                {EVENT_LABELS.map((label, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{label}{contentProps[i].product.eventDate ? ` (${contentProps[i].product.eventDate})` : ""}</span>
                    <span className="font-medium text-slate-900">¥{billings[i].toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-amber-300 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-slate-900">合計</span>
                      <Badge className="bg-amber-100 text-amber-800 text-xs">3点セット割引適用</Badge>
                    </div>
                    <span className="text-2xl font-bold text-amber-700">¥{totalBilling.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    イベント基本料金: ¥{THREE_SET_BASE_FEE_PER_EVENT.toLocaleString()} × 3回 = ¥{(THREE_SET_BASE_FEE_PER_EVENT * 3).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
