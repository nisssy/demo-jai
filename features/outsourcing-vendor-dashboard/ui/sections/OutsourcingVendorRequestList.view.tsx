import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ChevronRight } from "lucide-react"
import type { DemoProject } from "@/lib/demo-db/types"
import type { ProductProgressStatus } from "@/features/outsourcing-vendor-dashboard/hooks/useOutsourcingVendorDashboard"

export type ProductGroupByStatus = {
  status: ProductProgressStatus
  label: string
  products: DemoProject[]
}

export type OutsourcingVendorRequestListViewProps = {
  productsGroupedByStatus: ProductGroupByStatus[]
  selectedProductId: number | null
  onSelectProduct: (product: DemoProject) => void
}

const STATUS_BADGE_VARIANT: Record<ProductProgressStatus, "secondary" | "default" | "outline"> = {
  not_started: "outline",
  report_uploaded: "secondary",
  pachitown_linked: "default",
  post_event_done: "default",
}

const STATUS_BADGE_CLASS: Record<ProductProgressStatus, string> = {
  not_started: "bg-slate-100 text-slate-700 border-slate-200",
  report_uploaded: "bg-violet-100 text-violet-700 border-0",
  pachitown_linked: "bg-violet-200 text-violet-800 border-0",
  post_event_done: "bg-green-100 text-green-800 border-0",
}

export const OutsourcingVendorRequestListView = ({
  productsGroupedByStatus,
  selectedProductId,
  onSelectProduct,
}: OutsourcingVendorRequestListViewProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-violet-600" />
          <CardTitle>依頼一覧</CardTitle>
        </div>
        <CardDescription>
          スロセレの案件のうち、ステータスが「イベント終了処理中」のもののみ表示しています。進捗状況ごとにまとめており、商材を選択するとアンケート・写真・レポート・事後データの画面が開きます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {productsGroupedByStatus.every((g) => g.products.length === 0) ? (
          <p className="text-slate-500 text-sm">イベント終了処理中のスロセレ依頼はありません。</p>
        ) : (
          productsGroupedByStatus.map((group) =>
            group.products.length === 0 ? null : (
              <div key={group.status}>
                <h3 className="text-sm font-medium text-slate-600 mb-2">
                  {group.label}
                  <span className="ml-1.5 text-slate-400 font-normal">({group.products.length})</span>
                </h3>
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 overflow-hidden">
                  {group.products.map((p) => {
                    const eventName = (p as any).eventProductName ?? (p as any).projectName ?? "イベント"
                    const eventDate = (p as any).eventDate ?? (p as any).date ?? "-"
                    const hallName = (p as any).hallName ?? (p as any).clientName ?? "-"
                    const status = group.status
                    const isSelected = p.id === selectedProductId
                    return (
                      <li key={p.id}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-between h-auto py-3 px-3 rounded-none border-0 ${isSelected ? "bg-violet-50 border-l-4 border-l-violet-500" : "hover:bg-slate-50"}`}
                          onClick={() => onSelectProduct(p)}
                        >
                          <div className="flex flex-col items-start gap-1.5 text-left flex-1 min-w-0">
                            <div className="flex items-center gap-2 w-full">
                              <Badge
                                variant={STATUS_BADGE_VARIANT[status]}
                                className={`text-[10px] shrink-0 ${STATUS_BADGE_CLASS[status]}`}
                              >
                                {group.label}
                              </Badge>
                              <span className="font-medium text-slate-900 truncate">{eventName}</span>
                            </div>
                            <span className="text-xs text-slate-500">
                              開催日: {eventDate}　ホール: {hallName}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 ml-2" />
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          )
        )}
      </CardContent>
    </Card>
  )
}
