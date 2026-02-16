import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COSTUME_OPTIONS } from "@/new/api/display"
import type { Product } from "@/new/api/types"

export type CostumeArrangementModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  companionSizes: Record<string, string>
  costumes: Record<string, string>
  onCostumeChange: (companionName: string, costumeValue: string) => void
  onSave: () => void
}

export function CostumeArrangementModalView({
  open,
  onOpenChange,
  product,
  companionSizes,
  costumes,
  onCostumeChange,
  onSave,
}: CostumeArrangementModalViewProps) {
  if (!product) return null

  const companions = product.selectedCompanions.filter(n => n !== "未定")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>衣装手配</DialogTitle>
          <DialogDescription>コンパニオンのサイズに合った衣装を選択してください</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-600">案件名</Label>
                <p className="font-medium">{product.eventProductName}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">案件No</Label>
                <p className="font-medium">{product.projectNumber}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">実施日</Label>
                <p className="font-medium">{product.eventDate || "未定"}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">コンパニオン数</Label>
                <p className="font-medium">{companions.length}名</p>
              </div>
            </div>
          </div>

          {companions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">選択済みのコンパニオンがいません</div>
          ) : (
            <div className="space-y-3">
              {companions.map((name) => {
                const size = companionSizes[name]
                return (
                  <div key={name} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{name}</span>
                        {size && (
                          <Badge variant="outline" className="text-xs">
                            サイズ: {size}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`costume-${name}`} className="text-sm text-slate-600">衣装選択</Label>
                      <Select
                        value={costumes[name] || undefined}
                        onValueChange={(value) => onCostumeChange(name, value)}
                      >
                        <SelectTrigger id={`costume-${name}`}>
                          <SelectValue placeholder="衣装を選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {COSTUME_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={onSave} disabled={companions.length === 0}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
