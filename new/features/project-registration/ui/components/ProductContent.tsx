import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProductFormState, FormErrors } from "@/new/features/project-registration/model/types"
import type { UseLotteryFormReturn } from "@/new/features/project-registration/hooks/useLotteryForm"
import type { AvailabilityStatus } from "@/new/features/project-registration/hooks/useCastCalendar"
import { ProductBasicFields } from "./ProductBasicFields"
import { CastingSection } from "./CastingSection"
import { BillingSection } from "./BillingSection"
import { LotteryTabs } from "./lottery/LotteryTabs"
import { LotteryStatus } from "./lottery/LotteryStatus"
import type { OrderStatus, ExecutionStatus } from "@/new/features/project-registration/model/lottery-types"

export type ProductContentProps = {
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
  calculateDuration: (startTime: string, endTime: string) => string
  // 請求予定金額
  hallAddress: string
  // キャスティング
  onCastCountChange: (role: "companion" | "director", count: string) => void
  onToggleCast: (role: "companion" | "director", name: string) => void
  onToggleNomination: (role: "companion" | "director", name: string) => void
  checkAvailability?: (name: string, role: "companion" | "director") => AvailabilityStatus
  onOpenCalendar?: (name: string, status: AvailabilityStatus, type: "companion" | "director") => void
  onCastHoldTypeChange: (role: "companion" | "director", name: string, holdType: "tentative" | "confirmed" | "availability-check") => void
  // ステータス
  onStatusChange: (status: OrderStatus) => void
  onReadingCertaintyChange: (value: "A" | "B" | "C" | "") => void
  onExecutionStatusChange: (status: ExecutionStatus) => void
  onConfirmOrder: () => void
  // 3点セット
  hideBasicHeader?: boolean
  isThreeSetMode?: boolean
  onThreeSetModeChange?: (isThreeSet: boolean) => void
  canSwitchToThreeSet?: boolean
  // 合同抽選会
  lotteryForm?: UseLotteryFormReturn
  // ステッパーモード（product-edit用）
  stepperMode?: boolean
  currentStep?: number
}

export const ProductContent = ({
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
  hideBasicHeader,
  isThreeSetMode,
  onThreeSetModeChange,
  canSwitchToThreeSet,
  lotteryForm,
  stepperMode,
  currentStep,
}: ProductContentProps) => {
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
      hideHeader={hideBasicHeader}
      isThreeSetMode={isThreeSetMode}
      onThreeSetModeChange={onThreeSetModeChange}
      canSwitchToThreeSet={canSwitchToThreeSet}
    />
  )

  // ステッパーモード（product-edit時）
  if (stepperMode) {
    const step = currentStep ?? 1

    if (step === 1) {
      // Step 1: 基本情報登録 — 全セクションをまとめて表示
      return (
        <div className="space-y-6">
          {basicFields}
          {showCastingAndBilling && (
            <>
              <CastingSection
                product={product}
                checkAvailability={checkAvailability}
                onCastCountChange={onCastCountChange}
                onToggleCast={onToggleCast}
                onToggleNomination={onToggleNomination}
                onOpenCalendar={onOpenCalendar}
                onCastHoldTypeChange={onCastHoldTypeChange}
              />
              <BillingSection
                product={product}
                hallAddress={hallAddress}
                onFieldChange={onFieldChange}
              />
              <LotteryStatus
                proposalStatus={product.proposalStatus}
                readingCertainty={product.readingCertainty}
                executionStatus={product.executionStatus}
                onStatusChange={onStatusChange}
                onReadingCertaintyChange={onReadingCertaintyChange}
                onExecutionStatusChange={onExecutionStatusChange}
                onConfirmOrder={onConfirmOrder}
              />
            </>
          )}
          {isLottery && lotteryForm && (
            <LotteryTabs lotteryForm={lotteryForm} />
          )}
        </div>
      )
    }

    if (step === 2) {
      // Step 2: LINE広告アカウント登録
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">LINE広告アカウント登録</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center py-12 text-slate-400">
                <div className="text-5xl mb-4">📱</div>
                <p className="text-lg font-medium text-slate-600 mb-2">LINE広告アカウント情報</p>
                <p className="text-sm text-slate-400">LINE広告アカウントの登録・設定を行います</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">広告アカウントID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="アカウントIDを入力"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">アカウント名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="アカウント名を入力"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">連携ステータス</label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    未連携
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (step === 3) {
      // Step 3: 配信レポート作成
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">配信レポート作成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center py-12 text-slate-400">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-lg font-medium text-slate-600 mb-2">配信レポート</p>
                <p className="text-sm text-slate-400">配信結果のレポートを作成・確認します</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-xs text-slate-500 mb-1">インプレッション</div>
                  <div className="text-2xl font-bold text-slate-900">-</div>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-xs text-slate-500 mb-1">クリック数</div>
                  <div className="text-2xl font-bold text-slate-900">-</div>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-xs text-slate-500 mb-1">コンバージョン</div>
                  <div className="text-2xl font-bold text-slate-900">-</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return basicFields
  }

  if (isLottery && lotteryForm) {
    return (
      <div className="space-y-4">
        {basicFields}
        <LotteryTabs lotteryForm={lotteryForm} />
      </div>
    )
  }

  if (showCastingAndBilling) {
    return (
      <Tabs defaultValue="basic">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="basic" className="text-xs">基本情報</TabsTrigger>
          <TabsTrigger value="casting" className="text-xs">キャスティング</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs">請求予定金額</TabsTrigger>
          <TabsTrigger value="status" className="text-xs">ステータス</TabsTrigger>
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
    )
  }

  return basicFields
}
