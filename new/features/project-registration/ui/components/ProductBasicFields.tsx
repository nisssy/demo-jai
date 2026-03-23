import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, ChevronsUpDown, AlertTriangle } from "lucide-react"
import type { ProductFormState, FormErrors } from "@/new/features/project-registration/model/types"

type ProductBasicFieldsProps = {
  index: number
  product: ProductFormState
  errors: FormErrors
  // イベント区分
  eventTypeSearchOpen: boolean
  onEventTypeSearchOpenChange: (open: boolean) => void
  eventTypes: string[]
  onSelectEventType: (eventType: string) => void
  onCategoryChange: (category: string) => void
  // フィールド更新
  onFieldChange: (field: keyof ProductFormState, value: string) => void
  // 時間計算
  calculateDuration: (startTime: string, endTime: string) => string
  // 3点セット
  hideHeader?: boolean
  isThreeSetMode?: boolean
  onThreeSetModeChange?: (isThreeSet: boolean) => void
  canSwitchToThreeSet?: boolean
  // 新規作成モード: 商材区分+商材名のみ表示
  newModeMinimal?: boolean
}

export const ProductBasicFields = ({
  index,
  product,
  errors,
  eventTypeSearchOpen,
  onEventTypeSearchOpenChange,
  eventTypes,
  onSelectEventType,
  onCategoryChange,
  onFieldChange,
  calculateDuration,
  hideHeader,
  isThreeSetMode,
  onThreeSetModeChange,
  canSwitchToThreeSet,
  newModeMinimal,
}: ProductBasicFieldsProps) => {
  const isLottery = product.category === "ポイント"
  const isSloCele = product.eventType === "スロセレ"
  const hasEventType = !!product.eventType.trim()
  const duration = calculateDuration(product.startTime, product.endTime)

  return (
    <div className="space-y-4">
      {/* ヘッダー（商材区分/商材名/登録タイプ） */}
      {!hideHeader && (
        <>
          <div className="border-b border-slate-200 pb-4">
            <h4 className="text-sm font-semibold text-slate-600 mb-3">基本情報</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* 商材区分 */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">商材区分</Label>
                <Select
                  value={product.category || "placeholder"}
                  onValueChange={(v) => {
                    if (v === "placeholder") return
                    onCategoryChange(v)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="商材区分を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>商材区分を選択</SelectItem>
                    <SelectItem value="イベント">イベント</SelectItem>
                    <SelectItem value="オプション">オプション</SelectItem>
                    <SelectItem value="ポイント">ポイント</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 商材名 */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">商材名</Label>
                <Popover open={eventTypeSearchOpen} onOpenChange={onEventTypeSearchOpenChange}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={eventTypeSearchOpen}
                      className={`w-full justify-between ${errors[`product_${index}_eventType`] ? "border-red-500" : ""}`}
                    >
                      {product.eventType || "商材名を選択..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="商材名を検索..." />
                      <CommandList>
                        <CommandEmpty>商材名が見つかりませんでした</CommandEmpty>
                        <CommandGroup>
                          {eventTypes.map((et) => (
                            <CommandItem key={et} value={et} onSelect={() => onSelectEventType(et)}>
                              <Check className={`mr-2 h-4 w-4 ${product.eventType === et ? "opacity-100" : "opacity-0"}`} />
                              {et}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors[`product_${index}_eventType`] && (
                  <p className="text-xs text-red-500">{errors[`product_${index}_eventType`]}</p>
                )}
              </div>

              {/* 3点セット登録タイプ（スロセレのみ、新規作成モードでは非表示） */}
              {!newModeMinimal && isSloCele && onThreeSetModeChange && (
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-semibold">登録タイプ</Label>
                  <RadioGroup
                    value={isThreeSetMode ? "three-set" : "normal"}
                    onValueChange={(v) => onThreeSetModeChange(v === "three-set")}
                    className="flex items-center gap-6"
                    disabled={!canSwitchToThreeSet && !isThreeSetMode}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="normal" id={`reg-type-normal-${index}`} />
                      <Label htmlFor={`reg-type-normal-${index}`} className="text-sm cursor-pointer">通常登録</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="three-set"
                        id={`reg-type-three-set-${index}`}
                        disabled={!canSwitchToThreeSet && !isThreeSetMode}
                      />
                      <Label htmlFor={`reg-type-three-set-${index}`} className="text-sm cursor-pointer">
                        3点セット登録
                      </Label>
                      {!canSwitchToThreeSet && !isThreeSetMode && (
                        <span className="text-xs text-slate-400">（商材枠が不足）</span>
                      )}
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </div>

          {/* 商材名未選択時のメッセージ（新規作成モードでは非表示） */}
          {!newModeMinimal && !hasEventType && (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
              <AlertTriangle className="h-4 w-4" />
              まず「商材名」を選択してください...
            </div>
          )}
        </>
      )}

      {/* イベント系の詳細フィールド（新規作成モードでは非表示） */}
      {!newModeMinimal && hasEventType && !isLottery && (
        <div className="grid grid-cols-2 gap-4">
          {/* イベント商材名 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">イベント商材名</Label>
            <Input
              placeholder="例: 新台入替イベント"
              value={product.eventProductName}
              onChange={(e) => onFieldChange("eventProductName", e.target.value)}
              className={errors[`product_${index}_eventProductName`] ? "border-red-500" : ""}
            />
            {errors[`product_${index}_eventProductName`] && (
              <p className="text-xs text-red-500">{errors[`product_${index}_eventProductName`]}</p>
            )}
          </div>

          {/* 実施日 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">実施日</Label>
            <Input
              type="date"
              value={product.eventDate}
              onChange={(e) => onFieldChange("eventDate", e.target.value)}
              className={errors[`product_${index}_eventDate`] ? "border-red-500" : ""}
            />
            {errors[`product_${index}_eventDate`] && (
              <p className="text-xs text-red-500">{errors[`product_${index}_eventDate`]}</p>
            )}
          </div>

          {/* 開始時間 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">開始時間</Label>
            <Input
              type="time"
              value={product.startTime}
              onChange={(e) => onFieldChange("startTime", e.target.value)}
            />
          </div>

          {/* 終了時間 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">終了時間</Label>
            <Input
              type="time"
              value={product.endTime}
              onChange={(e) => onFieldChange("endTime", e.target.value)}
            />
          </div>

          {/* 開催時間数 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">開催時間数</Label>
            <Input value={duration} disabled className="bg-slate-50" />
          </div>

          {/* 必見フラグ（スロセレ以外） */}
          {!isSloCele && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">必見フラグ</Label>
                <Select
                  value={product.mustSeeFlag}
                  onValueChange={(v) => {
                    onFieldChange("mustSeeFlag", v)
                    onFieldChange("mustSeePublication", v === "1" ? "要" : "不要")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">必見掲載</Label>
                <Select
                  value={product.mustSeePublication}
                  onValueChange={(v) => onFieldChange("mustSeePublication", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="要">要</SelectItem>
                    <SelectItem value="不要">不要</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">必見掲載日</Label>
                <Input
                  type="date"
                  value={product.publicationDate}
                  onChange={(e) => onFieldChange("publicationDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">必見掲載時刻</Label>
                <Input
                  type="time"
                  value={product.publicationTime}
                  onChange={(e) => onFieldChange("publicationTime", e.target.value)}
                />
              </div>
            </>
          )}

          {/* レポート要否 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">レポート要否</Label>
            <Select
              value={product.reportRequired}
              onValueChange={(v) => onFieldChange("reportRequired", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="要">要</SelectItem>
                <SelectItem value="不要">不要</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
