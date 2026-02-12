import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROPOSAL_STATUS_LABELS, READING_CERTAINTY_OPTIONS } from "../../constants"
import { CheckCircle } from "lucide-react"
import type { OrderStatus, ExecutionStatus } from "../../types"

const EXECUTION_STATUS_OPTIONS: ExecutionStatus[] = [
  "実施前",
  "実施中",
  "終了",
]

export type StatusSectionViewProps = {
  proposalStatus: OrderStatus
  readingCertainty: "A" | "B" | "C" | ""
  executionStatus: ExecutionStatus | null
  onStatusChange: (status: OrderStatus) => void
  onReadingCertaintyChange: (value: "A" | "B" | "C" | "") => void
  onExecutionStatusChange: (status: ExecutionStatus) => void
  onConfirmOrder: () => void
}

export function StatusSectionView({
  proposalStatus,
  readingCertainty,
  executionStatus,
  onStatusChange,
  onReadingCertaintyChange,
  onExecutionStatusChange,
  onConfirmOrder,
}: StatusSectionViewProps) {
  return (
    <div className="space-y-6">
      {/* 受注ステータス */}
      <div className="space-y-4 border-b pb-5">
        <h3 className="text-sm font-bold text-slate-700">受注ステータス</h3>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">案件ステータス</Label>
          <Select
            value={proposalStatus}
            onValueChange={(v) => onStatusChange(v as OrderStatus)}
          >
            <SelectTrigger className="w-48 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROPOSAL_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ヨミ（受注時は非表示） */}
        {proposalStatus !== "order-received" && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ヨミ</Label>
            <Select
              value={readingCertainty || "none"}
              onValueChange={(v) => onReadingCertaintyChange(v === "none" ? "" : v as "A" | "B" | "C")}
            >
              <SelectTrigger className="w-32 h-9 text-xs">
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">未設定</SelectItem>
                {READING_CERTAINTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 受注ボタン */}
        {proposalStatus !== "order-received" && (
          <div className="pt-3">
            <Button onClick={onConfirmOrder} className="gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4" />
              受注にする
            </Button>
          </div>
        )}

        {proposalStatus === "order-received" && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">この案件は受注済みです</span>
            </div>
          </div>
        )}

        {/* 実施ステータス（受注済みのみ） */}
        {proposalStatus === "order-received" && (
          <div className="space-y-2 pt-3 border-t">
            <Label className="text-sm font-semibold">実施ステータス</Label>
            <Select
              value={executionStatus || "実施前"}
              onValueChange={(v) => onExecutionStatusChange(v as ExecutionStatus)}
            >
              <SelectTrigger className="w-48 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXECUTION_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status} className="text-xs">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
