import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { BOOKING_STATUS_LABELS } from "@/new/api/display"
import type { BookingStatus, Product } from "@/new/api/types"

const bookingStatusOptions: BookingStatus[] = [
  "tentative_requesting", "tentative_failed", "tentative_completed",
  "confirmed_requesting", "confirmed_failed", "confirmed_completed",
]

export type CastingInfoModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  draftBookingStatus: Record<string, BookingStatus>
  onStatusChange: (name: string, status: BookingStatus) => void
  onSave: () => void
}

export function CastingInfoModalView({
  open, onOpenChange, product, draftBookingStatus, onStatusChange, onSave,
}: CastingInfoModalViewProps) {
  if (!product) return null
  const allCasts = [
    ...product.selectedCompanions.filter(n => n !== "未定").map(n => ({ name: n, role: "コンパニオン" })),
    ...product.selectedDirectors.filter(n => n !== "未定").map(n => ({ name: n, role: "ディレクター" })),
    ...product.selectedMcs.filter(n => n !== "未定").map(n => ({ name: n, role: "MC" })),
  ]
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>キャスト状態変更</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mb-4">
          <p className="text-sm text-muted-foreground">{product.projectNumber}</p>
          <p className="font-medium">{product.eventProductName}</p>
          <p className="text-sm text-muted-foreground">
            実施日: {product.eventDate || "未定"}
            {product.startTime && product.endTime && ` / ${product.startTime} - ${product.endTime}`}
          </p>
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {allCasts.map(cast => (
            <div key={cast.name} className="flex items-center justify-between gap-4 p-3 rounded-md border">
              <div>
                <p className="font-medium">{cast.name}</p>
                <p className="text-xs text-muted-foreground">{cast.role}</p>
              </div>
              <Select
                value={draftBookingStatus[cast.name] ?? "tentative_requesting"}
                onValueChange={(val) => onStatusChange(cast.name, val as BookingStatus)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bookingStatusOptions.map(s => (
                    <SelectItem key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={onSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
