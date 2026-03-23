import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Check, FileText } from "lucide-react"
import { PROPOSAL_STATUS_LABELS, EXECUTION_STATUS_LABELS } from "@/new/api/display"
import type { ProposalStatus, ExecutionStatus } from "@/new/api/types"

type ProductDetailStepperProps = {
  proposalStatus: string
  executionStatus: string
  eventProductName: string
  eventDate: string
  category: string
  eventType: string
  estimatedBillingAmount: number
  hallName?: string
  companyName?: string
  salesPersonName?: string
  // コンテンツステッパー
  currentStep: number
  onStepChange: (step: number) => void
}

const CONTENT_STEPS = [
  { id: 1, label: "基本情報" },
  { id: 2, label: "キャスティング" },
  { id: 3, label: "請求予定金額" },
]

function getStatusColor(proposalStatus: string, executionStatus: string): string {
  if (executionStatus === "終了") return "bg-green-600 text-white"
  if (executionStatus === "実施中") return "bg-amber-600 text-white"
  if (proposalStatus === "order-received") return "bg-blue-600 text-white"
  if (proposalStatus === "proposing") return "bg-purple-600 text-white"
  return "bg-slate-500 text-white"
}

function getStatusLabel(proposalStatus: string, executionStatus: string): string {
  if (executionStatus === "終了") return "完了"
  if (executionStatus === "実施中") return "実施中"
  if (proposalStatus === "order-received") return "受注済み"
  if (proposalStatus === "proposing") return "提案中"
  return "提案前"
}

export const ProductDetailStepper = ({
  proposalStatus,
  executionStatus,
  eventProductName,
  eventDate,
  category,
  eventType,
  estimatedBillingAmount,
  hallName,
  companyName,
  salesPersonName,
  currentStep,
  onStepChange,
}: ProductDetailStepperProps) => {
  const statusColor = getStatusColor(proposalStatus, executionStatus)
  const statusLabel = getStatusLabel(proposalStatus, executionStatus)
  const isOrdered = proposalStatus === "order-received"

  return (
    <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4">
        {/* 上段: ステータスバッジ + 申し込み情報ボタン */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${statusColor} text-sm px-4 py-1.5`}>
            {statusLabel}
          </Badge>

          {isOrdered && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  申し込み情報
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>申し込み情報</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">商材区分</div>
                      <div className="text-sm font-medium">{category}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">イベント区分</div>
                      <div className="text-sm font-medium">{eventType}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">商材名</div>
                    <div className="text-sm font-medium">{eventProductName || "-"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">実施日</div>
                      <div className="text-sm font-medium">{eventDate || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">見積金額</div>
                      <div className="text-sm font-medium">¥{estimatedBillingAmount.toLocaleString()}</div>
                    </div>
                  </div>
                  {companyName && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">法人</div>
                      <div className="text-sm font-medium">{companyName}</div>
                    </div>
                  )}
                  {hallName && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">ホール</div>
                      <div className="text-sm font-medium">{hallName}</div>
                    </div>
                  )}
                  {salesPersonName && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">担当営業</div>
                      <div className="text-sm font-medium">{salesPersonName}</div>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="text-xs text-slate-500 mb-1">ステータス</div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor}>
                        {PROPOSAL_STATUS_LABELS[proposalStatus as ProposalStatus] ?? proposalStatus}
                      </Badge>
                      {executionStatus && (
                        <Badge className="bg-slate-100 text-slate-700">
                          {EXECUTION_STATUS_LABELS[executionStatus as ExecutionStatus] ?? executionStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* 下段: コンテンツステッパー */}
        <div className="flex items-center justify-center gap-0">
          {CONTENT_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => onStepChange(step.id)}
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${currentStep === step.id
                      ? "bg-white text-green-600 border-2 border-green-500 shadow-sm"
                      : currentStep > step.id
                      ? "bg-green-500 text-white"
                      : "bg-white text-slate-400 border-2 border-slate-300"
                    }
                  `}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap ${
                    currentStep === step.id
                      ? "text-green-600"
                      : currentStep > step.id
                      ? "text-slate-700"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < CONTENT_STEPS.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-3 ${
                    currentStep > step.id ? "bg-green-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
