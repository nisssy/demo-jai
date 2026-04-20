import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import type { Company, Hall, Product, ProductComment, ManagementConfirmationStatus, Employee } from "@/new/api/types"
import type { Role } from "@/new/types/role"
import type { RegistrationMode, ProjectFormState, ProductFormState, FormErrors } from "@/new/features/project-registration/model/types"
import type { UseLotteryFormReturn } from "@/new/features/project-registration/hooks/useLotteryForm"
import type { UseCastCalendarReturn } from "@/new/features/project-registration/hooks/useCastCalendar"
import type { ProductContentProps } from "./components/ProductContent"
import { BasicInfoSection } from "./components/BasicInfoSection"
import { ProductSection } from "./components/ProductSection"
import { ProductContent } from "./components/ProductContent"
import { ProductBasicFields } from "./components/ProductBasicFields"
import { ThreeSetSection } from "./components/ThreeSetSection"
import { ActionButtons } from "./components/ActionButtons"
import { ConfirmationStatusBar } from "./components/ConfirmationStatusBar"
import { ProductDetailStepper } from "./components/ProductDetailStepper"
import { ProductEditHeader } from "./components/ProductEditHeader"
import { CastCalendarModal } from "./components/CastCalendarModal"

const MODE_TITLES: Record<RegistrationMode, string> = {
  new: "新規案件作成",
  edit: "案件編集",
  "project-edit": "案件情報編集",
  "product-add": "商材追加",
  "product-edit": "商材詳細",
}

export type ProjectRegistrationViewProps = {
  mode: RegistrationMode
  form: ProjectFormState
  errors: FormErrors
  comments?: ProductComment[]
  // 法人検索
  companySearchOpen: boolean
  setCompanySearchOpen: (open: boolean) => void
  companySearchQuery: string
  setCompanySearchQuery: (query: string) => void
  filteredCompanies: Company[]
  handleSelectCompany: (company: Company) => void
  // ホール検索
  hallSearchOpen: boolean
  setHallSearchOpen: (open: boolean) => void
  hallSearchQuery: string
  setHallSearchQuery: (query: string) => void
  filteredHalls: Hall[]
  handleSelectHall: (hall: Hall) => void
  // イベント区分
  eventTypeSearchOpen: Record<number, boolean>
  handleEventTypeSearchOpenChange: (index: number, open: boolean) => void
  handleSelectEventType: (index: number, eventType: string) => void
  handleCategoryChange: (index: number, category: string) => void
  getEventTypesForProduct: (category: string) => string[]
  // フォーム操作
  updateForm: <K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) => void
  updateProduct: (index: number, field: keyof ProductFormState, value: string | boolean) => void
  handleProjectNameChange: (value: string) => void
  handleAddProduct: () => void
  handleRemoveProduct: (index: number) => void
  handleToggleProductOpen: (index: number) => void
  handleThreeSetModeChange: (index: number, isThreeSet: boolean) => void
  threeSetActiveTabs: Record<number, string>
  handleThreeSetTabChange: (groupIndex: number, tab: string) => void
  calculateDuration: (startTime: string, endTime: string) => string
  // 請求予定金額
  hallAddress: string
  // キャスティング
  handleCastCountChange: (index: number, role: "companion" | "director", count: string) => void
  handleToggleCast: (index: number, role: "companion" | "director", name: string) => void
  handleToggleNomination: (index: number, role: "companion" | "director", name: string) => void
  handleCastHoldTypeChange: (index: number, role: "companion" | "director", name: string, holdType: "tentative" | "confirmed" | "availability-check") => void
  // マネジメント部確認
  managementConfirmationStatus: ManagementConfirmationStatus
  handleRequestConfirmation: () => void
  // エンティティ（ステータス参照用）
  productEntity?: Product
  // アクション
  handleSubmit: () => void
  handleBack: () => void
  // 合同抽選会
  lotteryForm: UseLotteryFormReturn
  // キャストカレンダー
  castCalendar: UseCastCalendarReturn
  // ロール
  role?: Role
  allEmployees?: Employee[]
}

export const ProjectRegistrationView = ({
  mode,
  form,
  errors,
  comments,
  companySearchOpen,
  setCompanySearchOpen,
  companySearchQuery,
  setCompanySearchQuery,
  filteredCompanies,
  handleSelectCompany,
  hallSearchOpen,
  setHallSearchOpen,
  hallSearchQuery,
  setHallSearchQuery,
  filteredHalls,
  handleSelectHall,
  eventTypeSearchOpen,
  handleEventTypeSearchOpenChange,
  handleSelectEventType,
  handleCategoryChange,
  getEventTypesForProduct,
  updateForm,
  updateProduct,
  handleProjectNameChange,
  handleAddProduct,
  handleRemoveProduct,
  handleToggleProductOpen,
  handleThreeSetModeChange,
  threeSetActiveTabs,
  handleThreeSetTabChange,
  calculateDuration,
  hallAddress,
  handleCastCountChange,
  handleToggleCast,
  handleToggleNomination,
  handleCastHoldTypeChange,
  managementConfirmationStatus,
  handleRequestConfirmation,
  productEntity,
  handleSubmit,
  handleBack,
  lotteryForm,
  castCalendar,
  role = "Sales",
  allEmployees = [],
}: ProjectRegistrationViewProps) => {
  const isProductMode = mode === "product-add" || mode === "product-edit"
  const isProjectEditMode = mode === "project-edit"
  const [currentStep, setCurrentStep] = useState(1)

  const buildContentProps = (index: number, product: ProductFormState): ProductContentProps => ({
    index,
    product,
    errors,
    eventTypeSearchOpen: eventTypeSearchOpen[index] ?? false,
    onEventTypeSearchOpenChange: (open: boolean) => handleEventTypeSearchOpenChange(index, open),
    eventTypes: getEventTypesForProduct(product.category),
    onSelectEventType: (eventType: string) => handleSelectEventType(index, eventType),
    onCategoryChange: (category: string) => handleCategoryChange(index, category),
    onFieldChange: (field: keyof ProductFormState, value: string) => updateProduct(index, field, value),
    calculateDuration,
    hallAddress,
    onCastCountChange: (role: "companion" | "director", count: string) => handleCastCountChange(index, role, count),
    onToggleCast: (role: "companion" | "director", name: string) => handleToggleCast(index, role, name),
    onToggleNomination: (role: "companion" | "director", name: string) => handleToggleNomination(index, role, name),
    onCastHoldTypeChange: (role: "companion" | "director", name: string, ht: "tentative" | "confirmed" | "availability-check") => handleCastHoldTypeChange(index, role, name, ht),
    checkAvailability: castCalendar.checkAvailability,
    onOpenCalendar: (name: string, status: Parameters<typeof castCalendar.openModal>[1], type: "companion" | "director") => castCalendar.openModal(name, status, type),
    onStatusChange: (status: Parameters<typeof updateProduct>[2] & string) => updateProduct(index, "proposalStatus", status),
    onReadingCertaintyChange: (value: "A" | "B" | "C" | "") => updateProduct(index, "readingCertainty", value),
    onExecutionStatusChange: (status: string) => updateProduct(index, "executionStatus", status),
    onConfirmOrder: () => {
      updateProduct(index, "proposalStatus", "order-received")
      updateProduct(index, "readingCertainty", "")
    },
    isThreeSetMode: product.threeSetPlan,
    onThreeSetModeChange: (isThreeSet: boolean) => handleThreeSetModeChange(index, isThreeSet),
    canSwitchToThreeSet: (5 - form.products.length) >= 2,
    lotteryForm: product.category === "ポイント" ? lotteryForm : undefined,
    stepperMode: mode === "product-edit",
    currentStep: mode === "product-edit" ? currentStep : undefined,
  })

  const renderProducts = () => {
    if (isProjectEditMode) return null

    // 新規作成モード: 商材区分＋商材名のみ（合同抽選会ならサービス名も表示）
    if (mode === "new") {
      return form.products.map((product, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">商材情報{idx + 1}</CardTitle>
              {form.products.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => handleRemoveProduct(idx)} className="text-red-500 hover:text-red-700">
                  <span className="text-xs">削除</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ProductBasicFields
              index={idx}
              product={product}
              errors={errors}
              eventTypeSearchOpen={eventTypeSearchOpen[idx] ?? false}
              onEventTypeSearchOpenChange={(open: boolean) => handleEventTypeSearchOpenChange(idx, open)}
              eventTypes={getEventTypesForProduct(product.category)}
              onSelectEventType={(eventType: string) => handleSelectEventType(idx, eventType)}
              onCategoryChange={(category: string) => handleCategoryChange(idx, category)}
              onFieldChange={(field: keyof ProductFormState, value: string) => updateProduct(idx, field, value)}
              calculateDuration={calculateDuration}
              hideHeader={false}
              isThreeSetMode={false}
              onThreeSetModeChange={() => {}}
              canSwitchToThreeSet={false}
              newModeMinimal
              serviceName={lotteryForm.serviceName}
              onServiceNameChange={lotteryForm.setServiceName}
            />
          </CardContent>
        </Card>
      ))
    }

    const elements: React.ReactElement[] = []
    let i = 0

    while (i < form.products.length) {
      const idx = i // クロージャ用にループ変数を固定
      const product = form.products[idx]

      // 3点セットグループ検出: 3つ連続で threeSetPlan が true
      if (
        product.threeSetPlan &&
        form.products[idx + 1]?.threeSetPlan &&
        form.products[idx + 2]?.threeSetPlan
      ) {
        const cp0 = buildContentProps(idx, form.products[idx])
        const cp1 = buildContentProps(idx + 1, form.products[idx + 1])
        const cp2 = buildContentProps(idx + 2, form.products[idx + 2])

        if (mode === "product-edit") {
          // product-edit モードでは3つそれぞれを表示（通常は発生しないが安全策）
          for (let j = 0; j < 3; j++) {
            const cp = buildContentProps(idx + j, form.products[idx + j])
            elements.push(
              <Card key={idx + j}>
                <CardContent className="pt-6">
                  <ConfirmationStatusBar
                    status={managementConfirmationStatus}
                    onRequestConfirmation={handleRequestConfirmation}
                  />
                  <ProductContent {...cp} />
                </CardContent>
              </Card>
            )
          }
        } else {
          elements.push(
            <ThreeSetSection
              key={idx}
              contentProps={[cp0, cp1, cp2]}
              isOpen={product.isOpen}
              canDelete={!isProductMode && form.products.length > 3}
              activeTab={threeSetActiveTabs[idx] ?? "event-0"}
              onTabChange={(tab) => handleThreeSetTabChange(idx, tab)}
              onToggleOpen={() => handleToggleProductOpen(idx)}
              onRemove={() => handleRemoveProduct(idx)}
              onThreeSetModeChange={(isThreeSet) => handleThreeSetModeChange(idx, isThreeSet)}
              hallAddress={hallAddress}
            />
          )
        }
        i += 3
        continue
      }

      // 通常の商材
      const contentProps = buildContentProps(idx, product)

      if (mode === "product-edit") {
        elements.push(
          <div key={idx} className="space-y-6">
            {product.category !== "ポイント" && (
              <ConfirmationStatusBar
                status={managementConfirmationStatus}
                onRequestConfirmation={handleRequestConfirmation}
              />
            )}
            <ProductContent {...contentProps} />
          </div>
        )
      } else {
        elements.push(
          <ProductSection
            key={idx}
            {...contentProps}
            canDelete={!isProductMode && form.products.length > 1}
            onToggleOpen={() => handleToggleProductOpen(idx)}
            onRemove={() => handleRemoveProduct(idx)}
          />
        )
      }
      i += 1
    }

    return elements
  }

  const firstProduct = form.products[0]
  const isProductEdit = mode === "product-edit"

  return (
    <div className="space-y-0">
      {isProductEdit && firstProduct && (
        <ProductEditHeader
          proposalStatus={firstProduct.proposalStatus}
          executionStatus={firstProduct.executionStatus ?? undefined}
          managementConfirmationStatus={managementConfirmationStatus}
          productEntity={productEntity}
          form={form}
          product={firstProduct}
          onStatusChange={(status) => updateProduct(0, "proposalStatus", status)}
          onReadingCertaintyChange={(value) => updateProduct(0, "readingCertainty", value)}
          onExecutionStatusChange={(status) => updateProduct(0, "executionStatus", status)}
          onConfirmOrder={() => { updateProduct(0, "proposalStatus", "order-received"); updateProduct(0, "readingCertainty", "") }}
          role={role}
          allEmployees={allEmployees}
        />
      )}

    <div className="max-w-5xl mx-auto space-y-6 pt-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          戻る
        </Button>
        <h1 className="text-2xl font-bold">{MODE_TITLES[mode]}</h1>
      </div>

      {/* コメント履歴 */}
      {mode === "product-edit" && comments && comments.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-orange-800">コメント</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {comments.map((c, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-orange-800">{c.author}</span>
                <span className="text-orange-400 text-xs ml-2">{new Date(c.timestamp).toLocaleString("ja-JP")}</span>
                <p className="text-orange-700 mt-0.5">{c.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 基本情報 */}
      {!isProductMode && (
        <BasicInfoSection
          companyId={form.companyId}
          companyName={form.companyName}
          hallId={form.hallId}
          hallName={form.hallName}
          projectName={form.projectName}
          salesPersonName={form.salesPersonName}
          insightPersonName={form.insightPersonName}
          requestDate={form.requestDate}
          errors={errors}
          companySearchOpen={companySearchOpen}
          onCompanySearchOpenChange={setCompanySearchOpen}
          companySearchQuery={companySearchQuery}
          onCompanySearchQueryChange={setCompanySearchQuery}
          filteredCompanies={filteredCompanies}
          onSelectCompany={handleSelectCompany}
          hallSearchOpen={hallSearchOpen}
          onHallSearchOpenChange={setHallSearchOpen}
          hallSearchQuery={hallSearchQuery}
          onHallSearchQueryChange={setHallSearchQuery}
          filteredHalls={filteredHalls}
          onSelectHall={handleSelectHall}
          onProjectNameChange={handleProjectNameChange}
          onSalesPersonNameChange={(value) => updateForm("salesPersonName", value)}
          onRequestDateChange={(value) => updateForm("requestDate", value)}
        />
      )}

      {/* 商材情報 */}
      {renderProducts()}

      {/* アクションボタン */}
      <ActionButtons
        mode={mode}
        productCount={form.products.length}
        onAddProduct={handleAddProduct}
        onSubmit={handleSubmit}
      />

      {/* キャストカレンダーモーダル */}
      <CastCalendarModal
        isOpen={castCalendar.modal.isOpen}
        personName={castCalendar.modal.personName}
        personStatus={castCalendar.modal.personStatus}
        weekDays={castCalendar.weekDays}
        timeSlots={castCalendar.timeSlots}
        weekRangeText={castCalendar.weekRangeText}
        getCellInfo={castCalendar.getCellInfo}
        onClose={castCalendar.closeModal}
        onPreviousWeek={castCalendar.goToPreviousWeek}
        onNextWeek={castCalendar.goToNextWeek}
      />
    </div>
    </div>
  )
}
