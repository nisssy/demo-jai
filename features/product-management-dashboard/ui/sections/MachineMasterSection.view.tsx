import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, Trash2 } from "lucide-react"
import type { MachineMaster } from "@/features/product-management-dashboard/model/types"

export type MachineMasterSectionViewProps = {
  machineMasters: MachineMaster[]
  newName: string
  newPachitownName: string
  onNewNameChange: (v: string) => void
  onNewPachitownNameChange: (v: string) => void
  onAdd: () => void
  onRemove: (id: number) => void
  addDisabled: boolean
}

export const MachineMasterSectionView = ({
  machineMasters,
  newName,
  newPachitownName,
  onNewNameChange,
  onNewPachitownNameChange,
  onAdd,
  onRemove,
  addDisabled,
}: MachineMasterSectionViewProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-600" />
            <CardTitle>機種マスタ（スロット機種名）</CardTitle>
          </div>
          <CardDescription>
            機種名とパチタウン用名称の対応を管理・保持します。類似機種の検出とパチタウン変換に使用されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-machine-name">機種名</Label>
              <Input
                id="new-machine-name"
                value={newName}
                onChange={(e) => onNewNameChange(e.target.value)}
                placeholder="例: 北斗の拳 転生"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pachitown-name">パチタウン用名称</Label>
              <Input
                id="new-pachitown-name"
                value={newPachitownName}
                onChange={(e) => onNewPachitownNameChange(e.target.value)}
                placeholder="例: 北斗の拳 転生"
              />
            </div>
          </div>
          <Button onClick={onAdd} disabled={addDisabled} className="gap-2">
            <Package className="h-4 w-4" />
            追加
          </Button>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">登録一覧（{machineMasters.length}件）</h3>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {machineMasters.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg border bg-slate-50/50 px-3 py-2 text-sm"
                >
                  <span className="flex-1 font-medium text-slate-900">{m.name}</span>
                  <span className="text-slate-500">→</span>
                  <span className="flex-1 text-slate-700">{m.pachitownName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-red-600"
                    onClick={() => onRemove(m.id)}
                    aria-label="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
