import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Plus, FileText } from "lucide-react"
import type { ProjectInfo, ProductSummary } from "@/new/features/project-detail/model/types"
import { ProjectInfoCard } from "./components/ProjectInfoCard"
import { ProductSummaryCard } from "./components/ProductSummaryCard"

export type ProjectDetailViewProps = {
  projectInfo: ProjectInfo | null
  products: ProductSummary[]
  onUpdateProjectInfo: () => void
  onAddProduct: () => void
  onEditProduct: (productId: number) => void
  onCreateQuote: () => void
  onBack: () => void
}

export const ProjectDetailView = ({
  projectInfo,
  products,
  onUpdateProjectInfo,
  onAddProduct,
  onEditProduct,
  onCreateQuote,
  onBack,
}: ProjectDetailViewProps) => {
  if (!projectInfo) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-600">案件が見つかりません</p>
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            案件一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {projectInfo.projectName || "案件詳細"}
          </h1>
          <p className="text-sm text-slate-600">案件No: {projectInfo.projectNumber}</p>
        </div>
      </div>

      {/* 案件情報カード */}
      <ProjectInfoCard projectInfo={projectInfo} onEdit={onUpdateProjectInfo} />

      {/* 見積作成ボタン */}
      {products.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">見積書</p>
                <p className="text-xs text-slate-500">商材を選択して見積書を作成・送付します</p>
              </div>
              <Button onClick={onCreateQuote} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <FileText className="h-4 w-4 mr-2" />
                見積作成
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 商材一覧カード */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            商材一覧
            <Badge variant="outline">{products.length}件</Badge>
          </CardTitle>
          <Button onClick={onAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            商材を追加
          </Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-4">商材が登録されていません</p>
              <Button variant="outline" onClick={onAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                最初の商材を追加
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <ProductSummaryCard
                  key={product.id}
                  product={product}
                  onEdit={() => onEditProduct(product.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
