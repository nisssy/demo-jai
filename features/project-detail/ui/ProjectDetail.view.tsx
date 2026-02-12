import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Plus, Edit2, Calendar, Building2, User, MapPin } from "lucide-react"
import type { ProjectDetailViewProps, ProductSummary } from "../model/types"

// 商材サマリカードコンポーネント
function ProductSummaryCard({
  product,
  onEdit,
}: {
  product: ProductSummary
  onEdit: () => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onEdit}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{product.category}</Badge>
              <Badge variant="outline">{product.eventType}</Badge>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-slate-900">
                {product.eventProductName || "商材名未設定"}
              </p>
              {product.eventDate && (
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  実施日: {product.eventDate}
                </p>
              )}
              {product.estimatedBillingAmount && (
                <p className="text-sm text-slate-600">
                  請求予定: ¥{product.estimatedBillingAmount.toLocaleString()}
                </p>
              )}
            </div>

            {product.projectStatus && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                {product.projectStatus}
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// メインビュー
export const ProjectDetailView = ({
  projectInfo,
  products,
  isLoading,
  onUpdateProjectInfo,
  onAddProduct,
  onEditProduct,
  onBack,
}: ProjectDetailViewProps) => {
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-600">読み込み中...</p>
      </div>
    )
  }

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>案件情報</CardTitle>
          <Button variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            編集
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">法人:</span>
              <span className="font-medium text-slate-900">
                {projectInfo.companyName || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">ホール:</span>
              <span className="font-medium text-slate-900">
                {projectInfo.hallName || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">担当営業:</span>
              <span className="font-medium text-slate-900">
                {projectInfo.salesPersonName || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">依頼日:</span>
              <span className="font-medium text-slate-900">
                {projectInfo.requestDate || "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

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
