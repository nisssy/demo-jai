import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Product } from "@/new/api/types"
import type { SeedCastMember } from "@/new/api/seed-data"

export type CastAssignmentModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  projectName: string
  availableCompanions: SeedCastMember[]
  selectedCompanions: string[]
  maxCompanions: number
  onToggleCompanion: (name: string) => void
  showCompanionSection: boolean
  availableDirectors: SeedCastMember[]
  selectedDirectors: string[]
  maxDirectors: number
  onToggleDirector: (name: string) => void
  showDirectorSection: boolean
  productionNames: Record<number, string>
  onSubmit: () => void
}

function CastList({
  title,
  casts,
  selected,
  max,
  onToggle,
  productionNames,
  showSize,
}: {
  title: string
  casts: SeedCastMember[]
  selected: string[]
  max: number
  onToggle: (name: string) => void
  productionNames: Record<number, string>
  showSize?: boolean
}) {
  const remaining = max - selected.length
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
          残り{remaining}名
        </Badge>
        {selected.length > 0 && (
          <Badge className="bg-blue-100 text-blue-700 text-xs">
            {selected.length}名選択中
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        {casts.map((cast) => {
          const isChecked = selected.includes(cast.name)
          const isDisabled = !isChecked && remaining <= 0
          return (
            <label
              key={cast.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                isChecked
                  ? "border-blue-300 bg-blue-50"
                  : isDisabled
                    ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Checkbox
                checked={isChecked}
                disabled={isDisabled}
                onCheckedChange={() => onToggle(cast.name)}
              />
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{cast.name}</span>
                {cast.productionId && productionNames[cast.productionId] && (
                  <span className="text-xs text-slate-500">{productionNames[cast.productionId]}</span>
                )}
                {showSize && cast.size && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{cast.size}</Badge>
                )}
              </div>
              <span className="text-xs text-slate-400">¥{cast.hourlyRate.toLocaleString()}/h</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export function CastAssignmentModalView({
  open,
  onOpenChange,
  product,
  projectName,
  availableCompanions,
  selectedCompanions,
  maxCompanions,
  onToggleCompanion,
  showCompanionSection,
  availableDirectors,
  selectedDirectors,
  maxDirectors,
  onToggleDirector,
  showDirectorSection,
  productionNames,
  onSubmit,
}: CastAssignmentModalViewProps) {
  if (!product) return null

  const totalSelected = selectedCompanions.length + selectedDirectors.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>キャスト割り当て</DialogTitle>
          <DialogDescription>未定のキャストを選択して割り当ててください</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500">商材名:</span>
                <span className="ml-1 font-medium">{product.eventProductName}</span>
              </div>
              <div>
                <span className="text-slate-500">案件名:</span>
                <span className="ml-1 font-medium">{projectName}</span>
              </div>
              <div>
                <span className="text-slate-500">実施日:</span>
                <span className="ml-1 font-medium">{product.eventDate || "未定"}</span>
              </div>
              <div>
                <span className="text-slate-500">イベント区分:</span>
                <span className="ml-1 font-medium">{product.eventType}</span>
              </div>
            </div>
          </div>

          {showCompanionSection && (
            <CastList
              title="コンパニオン"
              casts={availableCompanions}
              selected={selectedCompanions}
              max={maxCompanions}
              onToggle={onToggleCompanion}
              productionNames={productionNames}
              showSize
            />
          )}

          {showDirectorSection && (
            <CastList
              title="ディレクター"
              casts={availableDirectors}
              selected={selectedDirectors}
              max={maxDirectors}
              onToggle={onToggleDirector}
              productionNames={productionNames}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={onSubmit} disabled={totalSelected === 0}>
            割り当て（{totalSelected}名）
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
