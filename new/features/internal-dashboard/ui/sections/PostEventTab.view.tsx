import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText } from "lucide-react"
import type { Product, Project } from "@/new/api/types"

export type PostEventTabViewProps = {
  products: Product[]
  getProjectForProduct: (product: Product) => Project | undefined
  onOpenSurveyResult: (product: Product) => void
  onOpenCostInput: (product: Product) => void
  onOpenCostExport: () => void
}

export function PostEventTabView({
  products,
  getProjectForProduct,
  onOpenSurveyResult,
  onOpenCostInput,
  onOpenCostExport,
}: PostEventTabViewProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">イベント終了処理中</CardTitle>
          <CardDescription className="text-slate-600">実施日の翌日以降のイベントのコスト入力を行ってください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">イベント終了処理中の案件はありません</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">イベント終了処理中</CardTitle>
        <CardDescription className="text-slate-600">実施日の翌日以降のイベントのコスト入力を行ってください</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="relative">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white z-10">商材名</TableHead>
                  <TableHead>案件No</TableHead>
                  <TableHead>実施日</TableHead>
                  <TableHead>イベント区分</TableHead>
                  <TableHead>アンケート状況</TableHead>
                  <TableHead className="sticky right-0 bg-white z-10">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const hasSurveyResult = product.surveyResult &&
                    (product.surveyResult.satisfaction || product.surveyResult.comment || product.surveyResult.nextEventDesired)

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium sticky left-0 bg-white z-10">{product.eventProductName}</TableCell>
                      <TableCell>{product.projectNumber}</TableCell>
                      <TableCell>{product.eventDate || "未定"}</TableCell>
                      <TableCell>{product.eventType}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={hasSurveyResult ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"}
                        >
                          {hasSurveyResult ? "アンケート回答受領済み" : "アンケート送付済み"}
                        </Badge>
                      </TableCell>
                      <TableCell className="sticky right-0 bg-white z-10">
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={() => onOpenCostInput(product)} className="gap-2">
                            コスト入力
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onOpenSurveyResult(product)} className="gap-2">
                            <FileText className="h-4 w-4" />
                            アンケート結果
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
