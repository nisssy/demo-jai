import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Plus } from "lucide-react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { BookingStatus } from "@/new/api/types"
import type { ProjectInfo, ProductSummary, DepartmentActivitySummary } from "@/new/features/project-detail/model/types"
import { EXECUTION_STATUS_LABELS } from "@/new/api/display"
import { ProjectInfoCard } from "./components/ProjectInfoCard"
import { ProjectSummaryCard } from "./components/ProjectSummaryCard"
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
  onUpdateCastBookingStatus: (productId: number, castName: string, castType: string, targetStatus: BookingStatus) => void
}

/** 案件全体のステータスを算出 */
function getProjectStatus(products: ProductSummary[]): { label: string; color: string } {
  if (products.length === 0) return { label: "提案中", color: "bg-blue-100 text-blue-800" }

  const allCompleted = products.every((p) => p.executionStatus === "終了")
  if (allCompleted) return { label: "完了", color: "bg-green-100 text-green-800" }

  const hasInProgress = products.some((p) => p.executionStatus === "実施中" || p.proposalStatusRaw === "order-received")
  if (hasInProgress) return { label: "進行中", color: "bg-amber-100 text-amber-800" }

  return { label: "提案中", color: "bg-blue-100 text-blue-800" }
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
  onUpdateCastBookingStatus,
}: ProjectDetailViewProps) => {
  const router = useAppRouter()

  if (!projectInfo) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-600">案件が見つかりません</p>
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            レコード一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  const projectStatus = getProjectStatus(products)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">
            {projectInfo.projectName || "案件詳細"}
          </h1>
          {/* ステータスバッジ */}
          <Badge className={`${projectStatus.color} text-sm px-3 py-1`}>
            {projectStatus.label}
          </Badge>
        </div>
      </div>
      <p className="text-sm text-slate-600 ml-14">案件No: {projectInfo.projectNumber}</p>

      {/* 2カラムレイアウト: 左=案件情報+サマリ / 右=商材一覧テーブル */}
      <div className="flex gap-6 items-start">
        {/* 左カラム: 案件情報 + サマリ（sticky） */}
        <div className="w-72 shrink-0 sticky top-24 space-y-4">
          <ProjectInfoCard projectInfo={projectInfo} onEdit={onUpdateProjectInfo} />
          {products.length > 0 && (
            <ProjectSummaryCard products={products} onCreateQuote={onCreateQuote} />
          )}
          <DepartmentActivityCard activity={departmentActivity} />
        </div>

        {/* 右カラム: 商材一覧テーブル */}
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold text-slate-700 w-[80px]">ID</TableHead>
                        <TableHead className="font-semibold text-slate-700">商材区分</TableHead>
                        <TableHead className="font-semibold text-slate-700">商材名</TableHead>
                        <TableHead className="font-semibold text-slate-700">実施日</TableHead>
                        <TableHead className="font-semibold text-slate-700">提案</TableHead>
                        <TableHead className="font-semibold text-slate-700">実施</TableHead>
                        <TableHead className="font-semibold text-slate-700">キャスト</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">見積金額</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => {
                        const isLottery = product.category === "ポイント" && product.eventType === "合同抽選会"
                        const castCount = product.casts.length + product.undecidedCasts.reduce((s, u) => s + u.count, 0)

                        return (
                          <TableRow
                            key={product.id}
                            className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                            onClick={() => router.push(`/new/project/${product.id}?role=Sales`)}
                          >
                            <TableCell>
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                                onClick={(e) => { e.stopPropagation(); router.push(`/new/project/${product.id}?role=Sales`) }}
                              >
                                {product.id}
                              </button>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Badge className="bg-slate-700 text-white text-xs">{product.category}</Badge>
                                <Badge variant="outline" className="text-xs">{product.eventType}</Badge>
                                {product.threeSetPlan && (
                                  <Badge className="bg-amber-100 text-amber-800 text-xs">3点</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-900 font-medium">
                              {product.eventProductName || "-"}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {product.eventDate || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs px-2 py-0.5 ${
                                product.proposalStatusRaw === "order-received" ? "bg-green-100 text-green-800" :
                                product.proposalStatusRaw === "proposing" ? "bg-blue-100 text-blue-800" :
                                "bg-slate-100 text-slate-600"
                              }`}>
                                {product.proposalStatus ?? "-"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5">
                                {product.executionStatus ? EXECUTION_STATUS_LABELS[product.executionStatus] : "-"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {!isLottery && castCount > 0 ? `${castCount}名` : "-"}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium text-slate-900">
                              ¥{(product.estimatedBillingAmount ?? 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
