import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { PROPOSAL_STATUS_LABELS, READING_CERTAINTY_OPTIONS } from "../../constants"
import { CheckCircle, Plus, Trash2 } from "lucide-react"
import type { CastAssignment, OrderStatus, CastingStatus, CastType, ExecutionStatus } from "../../types"

const CASTING_STATUS_OPTIONS: CastingStatus[] = [
  "未依頼",
  "仮押さえ依頼",
  "本押さえ依頼",
  "仮押さえ済み",
  "本押さえ済み",
]

const CAST_TYPE_OPTIONS: CastType[] = [
  "トリニティガール",
  "スロセレ",
  "その他",
]

const EXECUTION_STATUS_OPTIONS: ExecutionStatus[] = [
  "実施前",
  "実施中",
  "終了",
]

export type StatusSectionViewProps = {
  proposalStatus: OrderStatus
  readingCertainty: "A" | "B" | "C" | ""
  executionStatus: ExecutionStatus | null
  castAssignments: CastAssignment[]
  onStatusChange: (status: OrderStatus) => void
  onReadingCertaintyChange: (value: "A" | "B" | "C" | "") => void
  onExecutionStatusChange: (status: ExecutionStatus) => void
  onConfirmOrder: () => void
  onAddCast: () => void
  onRemoveCast: (id: string) => void
  onUpdateCast: (id: string, updates: Partial<CastAssignment>) => void
}

export function StatusSectionView({
  proposalStatus,
  readingCertainty,
  executionStatus,
  castAssignments,
  onStatusChange,
  onReadingCertaintyChange,
  onExecutionStatusChange,
  onConfirmOrder,
  onAddCast,
  onRemoveCast,
  onUpdateCast,
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

      {/* キャスティングステータス */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">キャスティングステータス</h3>
          <Button
            onClick={onAddCast}
            size="sm"
            variant="outline"
            className="text-xs gap-1 h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            キャスト追加
          </Button>
        </div>

        {castAssignments.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">キャストの割り当てはありません</p>
        ) : (
          <div className="space-y-3">
            {castAssignments.map((cast) => (
              <div key={cast.id} className="border border-slate-200 rounded-lg p-3 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {/* キャストタイプ */}
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">タイプ</Label>
                      <Select
                        value={cast.castType}
                        onValueChange={(v) => onUpdateCast(cast.id, { castType: v as CastType })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CAST_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type} value={type} className="text-xs">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* キャスト名 */}
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">キャスト名</Label>
                      <Input
                        value={cast.castName}
                        onChange={(e) => onUpdateCast(cast.id, { castName: e.target.value })}
                        placeholder="名前を入力"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* 削除ボタン */}
                  <Button
                    onClick={() => onRemoveCast(cast.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                </div>

                {/* ステータス */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">ステータス</Label>
                  <Select
                    value={cast.status}
                    onValueChange={(v) => onUpdateCast(cast.id, { status: v as CastingStatus })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CASTING_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status} className="text-xs">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 備考 */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">備考</Label>
                  <Input
                    value={cast.notes || ""}
                    onChange={(e) => onUpdateCast(cast.id, { notes: e.target.value })}
                    placeholder="メモや依頼日時など"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
