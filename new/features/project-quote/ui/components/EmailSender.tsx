import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, CheckCircle2, Loader2 } from "lucide-react"
import type { EmailSettings, EmailTemplate } from "@/new/features/project-quote/model/types"
import type { Employee } from "@/new/api/types"

type EmailSenderProps = {
  settings: EmailSettings
  template: EmailTemplate
  employees: Employee[]
  sent: boolean
  isSending: boolean
  onTemplateChange: (t: EmailTemplate) => void
  onUpdateBody: (body: string) => void
  onSend: () => void
}

function employeeEmail(emp: Employee): string {
  return `${emp.name.replace(/\s+/g, ".")}@example.com`
}

const EMAIL_TEMPLATE_OPTIONS: { value: EmailTemplate; label: string; description: string }[] = [
  { value: "standard", label: "標準", description: "一般的なビジネスメール" },
  { value: "polite", label: "丁寧", description: "よりフォーマルな文面" },
  { value: "concise", label: "簡潔", description: "短く要点のみ" },
]

export const EmailSender = ({
  settings,
  template,
  employees,
  sent,
  isSending,
  onTemplateChange,
  onUpdateBody,
  onSend,
}: EmailSenderProps) => {
  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h3 className="text-xl font-semibold text-slate-900">送信完了</h3>
        <p className="text-sm text-slate-600">
          見積書メールが送信されました。
        </p>
      </div>
    )
  }

  const fromEmployee = settings.fromEmployeeId
    ? employees.find((e) => e.id === settings.fromEmployeeId)
    : null

  const ccEmployees = settings.ccEmployeeIds
    .map((id) => employees.find((e) => e.id === id))
    .filter(Boolean) as Employee[]

  const bccEmployees = settings.bccEmployeeIds
    .map((id) => employees.find((e) => e.id === id))
    .filter(Boolean) as Employee[]

  return (
    <div className="space-y-6">
      {/* メール宛先サマリ */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-1 text-sm">
        <div className="flex gap-2">
          <span className="text-slate-500 w-12">To:</span>
          <span className="text-slate-900">{settings.toEmails.join(", ") || "（未設定）"}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500 w-12">From:</span>
          <span className="text-slate-900">
            {fromEmployee ? `${fromEmployee.name} <${employeeEmail(fromEmployee)}>` : settings.fromEmail || "（未設定）"}
          </span>
        </div>
        {ccEmployees.length > 0 && (
          <div className="flex gap-2">
            <span className="text-slate-500 w-12">CC:</span>
            <span className="text-slate-900">
              {ccEmployees.map((e) => `${e.name} <${employeeEmail(e)}>`).join(", ")}
            </span>
          </div>
        )}
        {bccEmployees.length > 0 && (
          <div className="flex gap-2">
            <span className="text-slate-500 w-12">BCC:</span>
            <span className="text-slate-900">
              {bccEmployees.map((e) => `${e.name} <${employeeEmail(e)}>`).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* メールテンプレート選択 */}
      <div>
        <Label className="text-sm font-medium text-slate-700">メールテンプレート</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {EMAIL_TEMPLATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onTemplateChange(opt.value)}
              className={`text-left p-3 rounded-lg border-2 transition-colors ${
                template === opt.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="font-medium text-sm text-slate-900">{opt.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* メール本文 */}
      <div>
        <Label className="text-sm font-medium text-slate-700">メール本文</Label>
        <Textarea
          value={settings.body}
          onChange={(e) => onUpdateBody(e.target.value)}
          rows={16}
          className="mt-2 font-mono text-sm"
        />
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={onSend}
          disabled={isSending || settings.toEmails.length === 0}
          className="px-8"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              見積書送付
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
