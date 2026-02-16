import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Plus } from "lucide-react"
import type { ProjectInfo, ProductSummary, DepartmentActivitySummary } from "@/new/features/project-detail/model/types"
import { ProjectInfoCard } from "./components/ProjectInfoCard"
import { ProjectSummaryCard } from "./components/ProjectSummaryCard"
import { ProductSummaryCard } from "./components/ProductSummaryCard"
import { DepartmentActivityCard } from "./components/DepartmentActivityCard"

export type ProjectDetailViewProps = {
  projectInfo: ProjectInfo | null
  products: ProductSummary[]
  departmentActivity: DepartmentActivitySummary
  // ナビゲーション
  onUpdateProjectInfo: () => void
  onAddProduct: () => void
  onEditProduct: (productId: number) => void
  onCreateQuote: () => void
  onBack: () => void
}

export const ProjectDetailView = ({
  projectInfo,
  products,
  departmentActivity,
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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

      {/* 2カラムレイアウト: 左=案件情報+サマリ / 右=商材一覧 */}
      <div className="flex gap-6 items-start">
        {/* 左カラム: 案件情報 + サマリ（sticky） */}
        <div className="w-72 shrink-0 sticky top-24 space-y-4">
          <ProjectInfoCard projectInfo={projectInfo} onEdit={onUpdateProjectInfo} />
          {products.length > 0 && (
            <ProjectSummaryCard products={products} onCreateQuote={onCreateQuote} />
          )}
          <DepartmentActivityCard activity={departmentActivity} />
        </div>

        {/* 右カラム: 商材一覧 */}
        <div className="flex-1 min-w-0">
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
                <div className="space-y-4">
                  {products.map((product) => (
                    <ProductSummaryCard
                      key={product.id}
                      product={product}
                      salesPersonName={projectInfo.salesPersonName}
                      onEdit={() => onEditProduct(product.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
