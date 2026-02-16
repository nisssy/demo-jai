import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/new/api/types"

export type StatusHistoryModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  clientName: string
}

export function StatusHistoryModalView({
  open,
  onOpenChange,
  product,
  clientName,
}: StatusHistoryModalViewProps) {
  const history = product?.statusHistory ?? []
  const hasHistory = history.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ステータス変更履歴</DialogTitle>
          <DialogDescription>{product?.eventProductName} のステータス変更履歴</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {product && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">案件情報</div>
              <div className="text-sm text-slate-600 space-y-1">
                <div>案件No: {product.projectNumber}</div>
                <div>クライアント: {clientName}</div>
                <div>実施日: {product.eventDate || "未定"}</div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">変更履歴</div>
            {hasHistory ? (
              <div className="space-y-3">
                {[...history].reverse().map((entry, index) => (
                  <div key={index} className="border-l-2 border-slate-200 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.status}
                          </Badge>
                          <span className="text-sm text-slate-600">
                            {new Date(entry.timestamp).toLocaleString("ja-JP", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {entry.changedBy && (
                          <div className="text-xs text-slate-500 mb-1">変更者: {entry.changedBy}</div>
                        )}
                        {entry.note && <div className="text-sm text-slate-700 mt-1">{entry.note}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-4 text-center">履歴がありません</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
