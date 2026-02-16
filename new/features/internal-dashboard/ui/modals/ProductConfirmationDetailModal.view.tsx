import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ProductContent } from "@/new/features/project-registration/ui/components/ProductContent"
import type { ProductFormState } from "@/new/features/project-registration/model/types"
import type { UseLotteryFormReturn } from "@/new/features/project-registration/hooks/useLotteryForm"

type ProductConfirmationDetailModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productForm: ProductFormState | null
  projectName: string
  clientName: string
  hallAddress: string
  lotteryForm: UseLotteryFormReturn
  comment: string
  onCommentChange: (value: string) => void
  onApprove: () => void
  onRequestRevision: () => void
}

const noop = () => {}

function calculateDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return ""
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  if (endMin <= startMin) return ""
  const diff = endMin - startMin
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`
}

export function ProductConfirmationDetailModalView({
  open,
  onOpenChange,
  productForm,
  projectName,
  clientName,
  hallAddress,
  lotteryForm,
  comment,
  onCommentChange,
  onApprove,
  onRequestRevision,
}: ProductConfirmationDetailModalViewProps) {
  if (!productForm) return null

  const isLottery = productForm.category === "ポイント" && !!productForm.eventType.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            商材確認: {productForm.eventProductName || productForm.eventType}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{projectName}</span>
            {clientName && (
              <>
                <span>|</span>
                <span>{clientName}</span>
              </>
            )}
          </div>
        </DialogHeader>

        {/* 営業の商材詳細と同じ見た目（参照のみ） */}
        <div className="pointer-events-none [&_[role=tablist]]:pointer-events-auto [&_[role=tab]]:pointer-events-auto opacity-90">
          <ProductContent
            index={0}
            product={productForm}
            errors={{}}
            eventTypeSearchOpen={false}
            onEventTypeSearchOpenChange={noop}
            eventTypes={[]}
            onSelectEventType={noop}
            onCategoryChange={noop}
            onFieldChange={noop}
            calculateDuration={calculateDuration}
            hallAddress={hallAddress}
            onCastCountChange={noop}
            onToggleCast={noop}
            onToggleNomination={noop}
            onCastHoldTypeChange={noop}
            onStatusChange={noop}
            onReadingCertaintyChange={noop}
            onExecutionStatusChange={noop}
            onConfirmOrder={noop}
            lotteryForm={isLottery ? lotteryForm : undefined}
          />
        </div>

        {/* アクションエリア */}
        <div className="border-t pt-4 mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">修正依頼コメント</label>
            <Textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="修正が必要な場合はコメントを入力してください"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
              onClick={onRequestRevision}
              disabled={!comment.trim()}
            >
              修正依頼
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={onApprove}
            >
              承認
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
