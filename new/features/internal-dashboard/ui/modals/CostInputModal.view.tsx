import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sparkles } from "lucide-react"
import type { Product } from "@/new/api/types"

export type CostItem = { item: string; amount: string }

type CostInputModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  projectName: string
  clientName: string
  estimatedAmount: number
  costs: CostItem[]
  onCostsChange: (costs: CostItem[]) => void
  onAutoFill: () => void
  autoFilled: boolean
  onSave: () => void
}

export function CostInputModalView({
  open,
  onOpenChange,
  product,
  projectName,
  clientName,
  estimatedAmount,
  costs,
  onCostsChange,
  onAutoFill,
  autoFilled,
  onSave,
}: CostInputModalViewProps) {
  if (!product) return null

  const total = costs.reduce((sum, c) => sum + (Number.parseInt(c.amount) || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>コスト管理</DialogTitle>
          <DialogDescription>{product.eventProductName} のコスト情報を入力してください</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm text-slate-900 mb-2">案件サマリー</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-600">案件名:</span>
                <span className="ml-2 font-medium">{projectName}</span>
              </div>
              <div>
                <span className="text-slate-600">顧客:</span>
                <span className="ml-2 font-medium">{clientName}</span>
              </div>
              <div>
                <span className="text-slate-600">見積金額:</span>
                <span className="ml-2 font-medium text-blue-600 text-lg">¥{estimatedAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={onAutoFill} variant="outline" className="border-purple-300 bg-transparent gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              マスタ参照（自動入力）
            </Button>
            {autoFilled && <Badge className="bg-green-100 text-green-700">入力完了</Badge>}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 font-semibold">項目</th>
                  <th className="text-right p-3 font-semibold">金額（円）</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {costs.map((cost, idx) => (
                  <tr key={idx}>
                    <td className="p-3">{cost.item}</td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={cost.amount}
                        onChange={(e) => {
                          const newCosts = [...costs]
                          newCosts[idx] = { ...newCosts[idx], amount: e.target.value }
                          onCostsChange(newCosts)
                        }}
                        className="text-right"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="p-3 font-bold">合計</td>
                  <td className="p-3 text-right font-bold text-lg">¥{total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button
            onClick={() => {
              onSave()
              onOpenChange(false)
            }}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
