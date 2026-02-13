import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import type { Company, Hall } from "@/new/api/types"
import type { RegistrationMode, ProjectFormState, ProductFormState, FormErrors } from "@/new/features/project-registration/model/types"
import type { UseLotteryFormReturn } from "@/new/features/project-registration/hooks/useLotteryForm"
import type { UseCastCalendarReturn } from "@/new/features/project-registration/hooks/useCastCalendar"
import { BasicInfoSection } from "./components/BasicInfoSection"
import { ProductSection } from "./components/ProductSection"
import { ActionButtons } from "./components/ActionButtons"
import { CastCalendarModal } from "./components/CastCalendarModal"

const MODE_TITLES: Record<RegistrationMode, string> = {
  new: "新規案件作成",
  edit: "案件編集",
  "product-add": "商材追加",
  "product-edit": "商材編集",
}

export type ProjectRegistrationViewProps = {
  mode: RegistrationMode
  form: ProjectFormState
  errors: FormErrors
  correctionRequest?: string
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
  calculateDuration: (startTime: string, endTime: string) => string
  // 請求予定金額
  hallAddress: string
  // キャスティング
  handleCastCountChange: (index: number, role: "companion" | "director", count: string) => void
  handleToggleCast: (index: number, role: "companion" | "director", name: string) => void
  handleToggleNomination: (index: number, role: "companion" | "director", name: string) => void
  // アクション
  handleSubmit: () => void
  handleBack: () => void
  // 合同抽選会
  lotteryForm: UseLotteryFormReturn
  // キャストカレンダー
  castCalendar: UseCastCalendarReturn
}

export const ProjectRegistrationView = ({
  mode,
  form,
  errors,
  correctionRequest,
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
  calculateDuration,
  hallAddress,
  handleCastCountChange,
  handleToggleCast,
  handleToggleNomination,
  handleSubmit,
  handleBack,
  lotteryForm,
  castCalendar,
}: ProjectRegistrationViewProps) => {
  const isProductMode = mode === "product-add" || mode === "product-edit"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          戻る
        </Button>
        <h1 className="text-2xl font-bold">{MODE_TITLES[mode]}</h1>
      </div>

      {/* 修正依頼 */}
      {mode === "product-edit" && correctionRequest && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-orange-800">修正依頼</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">{correctionRequest}</p>
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
      {form.products.map((product, index) => (
        <ProductSection
          key={index}
          index={index}
          product={product}
          errors={errors}
          canDelete={!isProductMode && form.products.length > 1}
          onToggleOpen={() => handleToggleProductOpen(index)}
          onRemove={() => handleRemoveProduct(index)}
          eventTypeSearchOpen={eventTypeSearchOpen[index] ?? false}
          onEventTypeSearchOpenChange={(open) => handleEventTypeSearchOpenChange(index, open)}
          eventTypes={getEventTypesForProduct(product.category)}
          onSelectEventType={(eventType) => handleSelectEventType(index, eventType)}
          onCategoryChange={(category) => handleCategoryChange(index, category)}
          onFieldChange={(field, value) => updateProduct(index, field, value)}
          calculateDuration={calculateDuration}
          hallAddress={hallAddress}
          onCastCountChange={(role, count) => handleCastCountChange(index, role, count)}
          onToggleCast={(role, name) => handleToggleCast(index, role, name)}
          onToggleNomination={(role, name) => handleToggleNomination(index, role, name)}
          checkAvailability={castCalendar.checkAvailability}
          onOpenCalendar={(name, status, type) => castCalendar.openModal(name, status, type)}
          lotteryForm={product.category === "ポイント" ? lotteryForm : undefined}
        />
      ))}

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
  )
}
