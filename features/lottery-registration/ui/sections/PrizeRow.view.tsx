import type { PrizeInfo } from "@/types/lottery"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export type PrizeRowViewProps = {
  index: number
  prize: PrizeInfo
  onUpdate: (updates: Partial<PrizeInfo>) => void
  onRemove: () => void
}

export function PrizeRowView({ index, prize, onUpdate, onRemove }: PrizeRowViewProps) {
  return (
    <div className="grid grid-cols-[80px_1fr_80px_120px_32px] gap-2 items-center">
      <Input
        value={prize.rank}
        onChange={(e) => onUpdate({ rank: e.target.value })}
        placeholder="賞"
        className="text-xs h-8"
      />
      <Input
        value={prize.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="景品名"
        className="text-xs h-8"
      />
      <Input
        type="number"
        min="0"
        value={prize.quantity}
        onChange={(e) => onUpdate({ quantity: e.target.value })}
        placeholder="数量"
        className="text-xs h-8"
      />
      <Input
        value={prize.vendorName || "-"}
        readOnly
        className="text-xs h-8 bg-slate-50"
      />
      <Button variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0">
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
