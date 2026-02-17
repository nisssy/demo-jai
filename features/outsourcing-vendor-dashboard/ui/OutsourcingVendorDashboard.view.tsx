import { Card, CardContent } from "@/components/ui/card"
import { OutsourcingVendorRequestListView } from "@/features/outsourcing-vendor-dashboard/ui/sections/OutsourcingVendorRequestList.view"
import { OutsourcingVendorProductDetailView } from "@/features/outsourcing-vendor-dashboard/ui/sections/OutsourcingVendorProductDetail.view"
import type { DemoProject } from "@/lib/demo-db/types"
import type { ProductProgressStatus } from "@/features/outsourcing-vendor-dashboard/hooks/useOutsourcingVendorDashboard"

export type ProductGroupByStatus = {
  status: ProductProgressStatus
  label: string
  products: DemoProject[]
}

export type OutsourcingVendorDashboardViewProps = {
  productsGroupedByStatus: ProductGroupByStatus[]
  selectedProductId: number | null
  onSelectProduct: (product: DemoProject) => void
  selectedProduct: DemoProject | null
  onCloseDetail: () => void
  onReportUpload: (productId: number, note: string) => void
  onPachitownLink: (productId: number) => void
  onPostEventDataSave: (productId: number, data: { transactionResult?: string; machineData?: string }) => void
  postEventTransactionResult: string
  postEventMachineData: string
  onPostEventTransactionResultChange: (value: string) => void
  onPostEventMachineDataChange: (value: string) => void
}

export const OutsourcingVendorDashboardView = ({
  productsGroupedByStatus,
  selectedProductId,
  onSelectProduct,
  selectedProduct,
  onCloseDetail,
  onReportUpload,
  onPachitownLink,
  onPostEventDataSave,
  postEventTransactionResult,
  postEventMachineData,
  onPostEventTransactionResultChange,
  onPostEventMachineDataChange,
}: OutsourcingVendorDashboardViewProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">外注業者 ダッシュボード</h1>
        <p className="text-slate-600 mt-1">
          イベント終了後のアンケート・写真参照、レポート作成・アップロード・パチタウン連携、事後データ入力を行います
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <OutsourcingVendorRequestListView
            productsGroupedByStatus={productsGroupedByStatus}
            selectedProductId={selectedProductId}
            onSelectProduct={onSelectProduct}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedProduct ? (
            <OutsourcingVendorProductDetailView
              product={selectedProduct}
              onClose={onCloseDetail}
              onReportUpload={onReportUpload}
              onPachitownLink={onPachitownLink}
              onPostEventDataSave={onPostEventDataSave}
              postEventTransactionResult={postEventTransactionResult}
              postEventMachineData={postEventMachineData}
              onPostEventTransactionResultChange={onPostEventTransactionResultChange}
              onPostEventMachineDataChange={onPostEventMachineDataChange}
            />
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-slate-500 text-center">
                  左の依頼一覧から商材を選択すると、アンケート結果・写真・レポート・事後データの画面が表示されます。
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
