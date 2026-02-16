import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ProductSummary } from "@/new/features/project-detail/model/types"
import type { TentativeCompletedCast } from "@/new/features/project-detail/hooks/useProjectDetail"

type OrderReceivedConfirmModalProps = {
  open: boolean
  product?: ProductSummary
  tentativeCompletedCasts: TentativeCompletedCast[]
  onConfirm: () => void
  onCancel: () => void
}

export const OrderReceivedConfirmModal = ({
  open,
  product,
  tentativeCompletedCasts,
  onConfirm,
  onCancel,
}: OrderReceivedConfirmModalProps) => {
  const hasTentativeCasts = tentativeCompletedCasts.length > 0

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>受注確認</DialogTitle>
          <DialogDescription>
            この商材を受注済みに更新します。
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="space-y-4">
            {/* 対象商材 */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant="outline">{product.eventType}</Badge>
              </div>
              <p className="font-medium text-slate-900">
                {product.eventProductName || "商材名未設定"}
              </p>
            </div>

            {/* 仮押さえ完了キャストの本押さえ依頼 */}
            {hasTentativeCasts && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-amber-800">
                  以下のキャストに本押さえ依頼を出します
                </p>
                <div className="space-y-1">
                  {tentativeCompletedCasts.map((cast) => (
                    <div key={`${cast.role}-${cast.name}`} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {cast.roleLabel}
                      </Badge>
                      <span className="text-amber-900">{cast.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasTentativeCasts && (
              <p className="text-sm text-slate-500">
                仮押さえ完了のキャストはいません。提案ステータスのみ更新されます。
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={onConfirm}>
            はい
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
