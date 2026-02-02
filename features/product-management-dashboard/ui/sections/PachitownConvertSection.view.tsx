import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Link2 } from "lucide-react"

export type ConvertRow = {
  productId: number
  projectNumber?: string
  projectName: string
  eventProductName?: string
  targetMachineNames: string[]
  pachitownMachineNames: string[]
  similarResults: Array<{ input: string; pachitownName: string; score: number } | null>
  pachitownLinked?: boolean
  pachitownLinkedDate?: string
}

export type PachitownConvertSectionViewProps = {
  rows: ConvertRow[]
  onConvert: (productId: number) => void
}

export const PachitownConvertSectionView = ({ rows, onConvert }: PachitownConvertSectionViewProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-600" />
            <CardTitle>パチタウン変換</CardTitle>
          </div>
          <CardDescription>
            機種マスタを使って、顧客入力の機種名から類似機種を検出し、パチタウン用名称に変換します。変換するとパチタウンに自動連携されます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-slate-500 text-sm">対象機種が登録されている案件がありません。</p>
          ) : (
            <ul className="space-y-6">
              {rows.map((r) => (
                <li key={r.productId} className="rounded-lg border bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-slate-500 mr-2">案件No: {r.projectNumber ?? "-"}</span>
                      <span className="font-medium text-slate-900">{r.projectName || r.eventProductName || "無題"}</span>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => onConvert(r.productId)}>
                      <RefreshCw className="h-3.5 w-3.5" />
                      変換
                    </Button>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">対象機種（顧客入力）: </span>
                      <span className="text-slate-800">{r.targetMachineNames.join(" / ") || "未入力"}</span>
                    </div>
                    {r.similarResults.some((s) => s != null) && (
                      <div>
                        <span className="text-slate-500">類似検出 → パチタウン用: </span>
                        {r.similarResults.map((s, i) =>
                          s ? (
                            <span key={i} className="mr-2 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                              {s.input} → {s.pachitownName}（一致度: {s.score}）
                            </span>
                          ) : null
                        )}
                      </div>
                    )}
                    {r.pachitownMachineNames.length > 0 && (
                      <div>
                        <span className="text-slate-500">変換結果: </span>
                        <span className="font-medium text-slate-900">{r.pachitownMachineNames.join(" / ")}</span>
                      </div>
                    )}
                    {r.pachitownLinked && (
                      <div className="mt-2">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          パチタウン連携済み
                          {r.pachitownLinkedDate ? `（${r.pachitownLinkedDate}）` : ""}
                        </Badge>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
