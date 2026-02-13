import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  COMPANION_HOURLY_RATES,
  DIRECTOR_HOURLY_RATES,
  getDurationInHours,
  getAverageCompanionRate,
  getAverageDirectorRate,
  getEventBaseFee,
} from "@/new/api/cast-data"
import type { ProductFormState } from "@/new/features/project-registration/model/types"

type BillingSectionProps = {
  product: ProductFormState
  onFieldChange: (field: keyof ProductFormState, value: string) => void
}

export const BillingSection = ({ product, onFieldChange }: BillingSectionProps) => {
  const durationHours = getDurationInHours(product.startTime, product.endTime)

  // ─── コンパニオンコスト ───
  const companionSelectedNames = product.selectedCompanions.filter((n) => n !== "未定")
  const companionCount = parseInt(product.companionCount, 10) || 0
  const companionSelectedCost = companionSelectedNames.reduce(
    (total, name) => total + (COMPANION_HOURLY_RATES[name] ?? 0) * durationHours,
    0
  )
  const companionUndecidedCount = Math.max(0, companionCount - companionSelectedNames.length)
  const companionUndecidedCost = companionUndecidedCount * getAverageCompanionRate() * durationHours
  const companionCost = Math.round(companionSelectedCost + companionUndecidedCost)

  // ─── ディレクターコスト ───
  const directorSelectedNames = product.selectedDirectors.filter((n) => n !== "未定")
  const directorCount = parseInt(product.directorCount, 10) || 0
  const directorSelectedCost = directorSelectedNames.reduce(
    (total, name) => total + (DIRECTOR_HOURLY_RATES[name] ?? 0) * durationHours,
    0
  )
  const directorUndecidedCount = Math.max(0, directorCount - directorSelectedNames.length)
  const directorUndecidedCost = directorUndecidedCount * getAverageDirectorRate() * durationHours
  const directorCost = Math.round(directorSelectedCost + directorUndecidedCost)

  // ─── 合計計算 ───
  const totalPerformanceCost = companionCost + directorCost
  const performanceDiscount = parseInt(product.performanceFeeDiscount, 10) || 0
  const performanceAfterDiscount = Math.round(Math.max(0, totalPerformanceCost - performanceDiscount))

  const totalCastCount = companionCount + directorCount
  const accommodationPerPerson = parseInt(product.accommodationFeePerPerson, 10) || 0
  const totalAccommodation = Math.round(accommodationPerPerson * totalCastCount)

  const eventBaseFee = getEventBaseFee(product.eventType)
  const eventDiscount = parseInt(product.eventBaseFeeDiscount, 10) || 0
  const eventFeeAfterDiscount = Math.round(Math.max(0, eventBaseFee - eventDiscount))

  const totalBilling = performanceAfterDiscount + totalAccommodation + eventFeeAfterDiscount

  return (
    <div className="space-y-4 pt-2">
      {/* 出演料 */}
      <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-slate-900">出演料</Label>
            <div className="text-xl font-bold text-slate-900">¥{totalPerformanceCost.toLocaleString()}</div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200">
            {/* コンパニオン内訳 */}
            {companionCount > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">コンパニオン</span>
                  <span className="font-medium text-slate-900">¥{companionCost.toLocaleString()}</span>
                </div>
                <div className="pl-4 space-y-1 text-xs">
                  <div className="text-slate-500 mb-1">稼働時間: {durationHours.toFixed(1)}時間</div>
                  {companionSelectedNames.length > 0 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>選択済み ({companionSelectedNames.length}人)</span>
                      <span>¥{Math.round(companionSelectedCost).toLocaleString()}</span>
                    </div>
                  )}
                  {companionUndecidedCount > 0 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>未確定 ({companionUndecidedCount}人)</span>
                      <span>¥{Math.round(companionUndecidedCost).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ディレクター内訳 */}
            {directorCount > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">ディレクター</span>
                  <span className="font-medium text-slate-900">¥{directorCost.toLocaleString()}</span>
                </div>
                <div className="pl-4 space-y-1 text-xs">
                  <div className="text-slate-500 mb-1">稼働時間: {durationHours.toFixed(1)}時間</div>
                  {directorSelectedNames.length > 0 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>選択済み ({directorSelectedNames.length}人)</span>
                      <span>¥{Math.round(directorSelectedCost).toLocaleString()}</span>
                    </div>
                  )}
                  {directorUndecidedCount > 0 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>未確定 ({directorUndecidedCount}人)</span>
                      <span>¥{Math.round(directorUndecidedCost).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 割引 */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <div className="flex-1">
              <Label className="text-sm text-slate-600">割引</Label>
              <Input
                type="number"
                value={product.performanceFeeDiscount}
                onChange={(e) => onFieldChange("performanceFeeDiscount", e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 mb-1">割引後</div>
              <div className="text-xl font-bold text-slate-900">¥{performanceAfterDiscount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 交通費（合計） */}
      <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold text-slate-900">交通費（合計）</Label>
          <div className="text-right">
            <div className="text-xl font-bold text-slate-900">¥0</div>
            <div className="text-xs text-slate-500 mt-1">（自動計算は今後対応）</div>
          </div>
        </div>
      </div>

      {/* 宿泊費（合計） */}
      <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-slate-900">宿泊費（合計）</Label>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-900">¥{totalAccommodation.toLocaleString()}</div>
              {totalCastCount > 0 && accommodationPerPerson > 0 && (
                <div className="text-xs text-slate-500 mt-1">
                  （{totalCastCount}名 × ¥{accommodationPerPerson.toLocaleString()}）
                </div>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <Label className="text-sm text-slate-600">1人あたり宿泊費</Label>
            <Input
              type="number"
              value={product.accommodationFeePerPerson}
              onChange={(e) => onFieldChange("accommodationFeePerPerson", e.target.value)}
              placeholder="0"
              className="mt-1 w-40"
            />
          </div>
        </div>
      </div>

      {/* イベント基本料金 */}
      <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-slate-900">イベント基本料金</Label>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-900">¥{eventBaseFee.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">（{product.eventType}）</div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <div className="flex-1">
              <Label className="text-sm text-slate-600">追加割引</Label>
              <Input
                type="number"
                value={product.eventBaseFeeDiscount}
                onChange={(e) => onFieldChange("eventBaseFeeDiscount", e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 mb-1">割引後</div>
              <div className="text-xl font-bold text-slate-900">¥{eventFeeAfterDiscount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 小計 */}
      <div className="bg-blue-50/50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-slate-900">小計</Label>
          <div className="text-2xl font-bold text-slate-900">¥{totalBilling.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
