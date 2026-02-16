import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import type { Company, Hall, ProductComment, ManagementConfirmationStatus } from "@/new/api/types"
import type { RegistrationMode, ProjectFormState, ProductFormState, FormErrors } from "@/new/features/project-registration/model/types"
import type { UseLotteryFormReturn } from "@/new/features/project-registration/hooks/useLotteryForm"
import type { UseCastCalendarReturn } from "@/new/features/project-registration/hooks/useCastCalendar"
import { BasicInfoSection } from "./components/BasicInfoSection"
import { ProductSection } from "./components/ProductSection"
import { ProductContent } from "./components/ProductContent"
import { ActionButtons } from "./components/ActionButtons"
import { ConfirmationStatusBar } from "./components/ConfirmationStatusBar"
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
  calculateDuration: (startTime: string, endTime: string) => string
  // 請求予定金額
  hallAddress: string
  // キャスティング
  handleCastCountChange: (index: number, role: "companion" | "director", count: string) => void
  handleToggleCast: (index: number, role: "companion" | "director", name: string) => void
  handleToggleNomination: (index: number, role: "companion" | "director", name: string) => void
  handleCastHoldTypeChange: (index: number, role: "companion" | "director", name: string, holdType: "tentative" | "confirmed") => void
  // マネジメント部確認
  managementConfirmationStatus: ManagementConfirmationStatus
  handleRequestConfirmation: () => void
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
  calculateDuration,
  hallAddress,
  handleCastCountChange,
  handleToggleCast,
  handleToggleNomination,
  handleCastHoldTypeChange,
  managementConfirmationStatus,
  handleRequestConfirmation,
  handleSubmit,
  handleBack,
  lotteryForm,
  castCalendar,
}: ProjectRegistrationViewProps) => {
  const isProductMode = mode === "product-add" || mode === "product-edit"
  const isProjectEditMode = mode === "project-edit"

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
      {!isProjectEditMode && form.products.map((product, index) => {
        const contentProps = {
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
          onCastHoldTypeChange: (role: "companion" | "director", name: string, ht: "tentative" | "confirmed") => handleCastHoldTypeChange(index, role, name, ht),
          checkAvailability: castCalendar.checkAvailability,
          onOpenCalendar: (name: string, status: Parameters<typeof castCalendar.openModal>[1], type: "companion" | "director") => castCalendar.openModal(name, status, type),
          onStatusChange: (status: Parameters<typeof updateProduct>[2] & string) => updateProduct(index, "proposalStatus", status),
          onReadingCertaintyChange: (value: "A" | "B" | "C" | "") => updateProduct(index, "readingCertainty", value),
          onExecutionStatusChange: (status: string) => updateProduct(index, "executionStatus", status),
          onConfirmOrder: () => {
            updateProduct(index, "proposalStatus", "order-received")
            updateProduct(index, "readingCertainty", "")
          },
          lotteryForm: product.category === "ポイント" ? lotteryForm : undefined,
        }

        if (mode === "product-edit") {
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <ConfirmationStatusBar
                  status={managementConfirmationStatus}
                  onRequestConfirmation={handleRequestConfirmation}
                />
                <ProductContent {...contentProps} />
              </CardContent>
            </Card>
          )
        }

        return (
          <ProductSection
            key={index}
            {...contentProps}
            canDelete={!isProductMode && form.products.length > 1}
            onToggleOpen={() => handleToggleProductOpen(index)}
            onRemove={() => handleRemoveProduct(index)}
          />
        )
      })}

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
