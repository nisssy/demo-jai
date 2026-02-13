import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { UseProjectQuoteReturn } from "@/new/features/project-quote/hooks/useProjectQuote"
import type { QuoteStep } from "@/new/features/project-quote/model/types"
import { ProductSelector } from "./components/ProductSelector"
import { RecipientSelector } from "./components/RecipientSelector"
import { TemplateAndEditor } from "./components/TemplateAndEditor"
import { QuotePreview } from "./components/QuotePreview"
import { EmailSettingsEditor } from "./components/EmailSettingsEditor"
import { EmailSender } from "./components/EmailSender"

const STEP_TITLES: Record<QuoteStep, string> = {
  select: "① 商材選択",
  recipient: "② 宛先選択",
  template: "③ 見積作成",
  quote: "④ プレビュー",
  "email-settings": "⑤ 送信先設定",
  email: "⑥ メール送付",
}

const STEP_KEYS: QuoteStep[] = ["select", "recipient", "template", "quote", "email-settings", "email"]

type ProjectQuoteViewProps = UseProjectQuoteReturn & {
  onClose: () => void
}

export const ProjectQuoteView = (props: ProjectQuoteViewProps) => {
  const { step, onClose } = props

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          案件詳細に戻る
        </Button>
        <h1 className="text-2xl font-bold">見積作成</h1>
      </div>

      {/* ステップインジケーター */}
      <div className="flex items-center gap-2">
        {STEP_KEYS.map((key, i) => (
          <div
            key={key}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
              step === key
                ? "bg-blue-100 text-blue-800 font-semibold"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {STEP_TITLES[key]}
            {i < STEP_KEYS.length - 1 && <ChevronRight className="h-3 w-3 ml-1 text-slate-400" />}
          </div>
        ))}
      </div>

      {/* メインコンテンツ */}
      <Card>
        <CardHeader>
          <CardTitle>{STEP_TITLES[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "select" && (
            <ProductSelector
              products={props.allProducts}
              selectedIds={props.selectedProductIds}
              summaries={props.productSummaries}
              projectNumber={props.project?.projectNumber ?? ""}
              onToggle={props.toggleProduct}
            />
          )}
          {step === "recipient" && (
            <RecipientSelector
              projectNumber={props.project?.projectNumber ?? ""}
              recipient={props.recipient}
              hallName={props.project?.hallName ?? ""}
              companyName={props.project?.companyName ?? ""}
              onSelect={props.setRecipient}
            />
          )}
          {step === "template" && (
            <TemplateAndEditor
              templates={props.templates}
              selectedTemplateId={props.selectedTemplateId}
              quoteItems={props.quoteItems}
              isEditing={props.isEditingItems}
              totalAmount={props.totalAmount}
              onApplyTemplate={props.applyTemplate}
              onStartEditing={props.startEditing}
              onCancelEditing={props.cancelEditing}
              onSaveEditing={props.saveEditing}
              onUpdateItemName={props.updateItemName}
              onUpdateItemAmount={props.updateItemAmount}
              onToggleItemVisible={props.toggleItemVisible}
              onRemoveItem={props.removeItem}
              onAddItem={props.addItem}
              onUpdateSubitemName={props.updateSubitemName}
              onUpdateSubitemAmount={props.updateSubitemAmount}
              onToggleSubitemVisible={props.toggleSubitemVisible}
              onRemoveSubitem={props.removeSubitem}
              onAddSubitem={props.addSubitem}
            />
          )}
          {step === "quote" && props.quoteDocument && (
            <QuotePreview document={props.quoteDocument} />
          )}
          {step === "email-settings" && (
            <EmailSettingsEditor
              settings={props.emailSettings}
              employees={props.employees}
              onAddToEmail={props.addToEmail}
              onRemoveToEmail={props.removeToEmail}
              onUpdateToEmail={props.updateToEmail}
              onSetFromEmployee={props.setFromEmployee}
              onSetFromEmail={props.setFromEmail}
              onAddCcEmployee={props.addCcEmployee}
              onRemoveCcEmployee={props.removeCcEmployee}
              onAddBccEmployee={props.addBccEmployee}
              onRemoveBccEmployee={props.removeBccEmployee}
            />
          )}
          {step === "email" && (
            <EmailSender
              settings={props.emailSettings}
              template={props.emailTemplate}
              employees={props.employees}
              sent={props.emailSent}
              isSending={props.isSending}
              onTemplateChange={(t) => {
                props.setEmailTemplate(t)
                props.generateEmail()
              }}
              onUpdateBody={props.updateEmailBody}
              onSend={props.sendEmail}
            />
          )}
        </CardContent>
      </Card>

      {/* ナビゲーションボタン */}
      {!props.emailSent && (
        <div className="flex justify-between">
          <div>
            {step !== "select" && (
              <Button variant="outline" onClick={props.goBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                戻る
              </Button>
            )}
          </div>
          <div>
            {step === "select" && (
              <Button onClick={props.goToRecipient} disabled={props.selectedProductIds.size === 0}>
                次へ: 宛先選択
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === "recipient" && (
              <Button onClick={props.goToTemplate}>
                次へ: 見積作成
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === "template" && (
              <Button
                onClick={props.goToQuote}
                disabled={props.quoteItems.filter((i) => i.visible).length === 0}
              >
                次へ: プレビュー
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === "quote" && (
              <Button onClick={props.goToEmailSettings}>
                次へ: 送信先設定
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === "email-settings" && (
              <Button
                onClick={props.goToEmailSend}
                disabled={
                  props.emailSettings.toEmails.length === 0 || !props.emailSettings.fromEmployeeId
                }
              >
                次へ: メール送付
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
