import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MessageCircle } from "lucide-react"
import type { Product, Project } from "@/new/api/types"

type ProductConfirmationTabViewProps = {
  products: Product[]
  getProjectForProduct: (product: Product) => Project | undefined
  onOpenDetail: (product: Product) => void
  onOpenChat: (product: Product) => void
  onClickProduct: (productId: number) => void
}

export function ProductConfirmationTabView({
  products,
  getProjectForProduct,
  onOpenDetail,
  onOpenChat,
  onClickProduct,
}: ProductConfirmationTabViewProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">商材確認</CardTitle>
          <CardDescription className="text-slate-600">営業から確認依頼が届いた商材を確認してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">確認待ちの商材はありません</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">商材確認</CardTitle>
        <CardDescription className="text-slate-600">営業から確認依頼が届いた商材を確認してください</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">商材名</TableHead>
              <TableHead>案件名</TableHead>
              <TableHead className="w-[100px]">案件No</TableHead>
              <TableHead className="w-[100px]">カテゴリ</TableHead>
              <TableHead className="w-[120px]">イベント区分</TableHead>
              <TableHead className="w-[120px]">実施日</TableHead>
              <TableHead className="w-[100px] text-right">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const project = getProjectForProduct(product)
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <button type="button" className="text-blue-600 hover:text-blue-800 hover:underline" onClick={() => onClickProduct(product.id)}>
                      {product.eventProductName || product.eventType}
                    </button>
                  </TableCell>
                  <TableCell>{project?.projectName ?? "-"}</TableCell>
                  <TableCell>{product.projectNumber}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.eventType}</TableCell>
                  <TableCell>{product.eventDate || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" className="text-slate-500 hover:text-blue-600" onClick={() => onOpenChat(product)}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onOpenDetail(product)}>
                        確認する
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
