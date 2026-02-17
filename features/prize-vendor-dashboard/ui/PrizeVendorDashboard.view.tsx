import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gift, ChevronRight, X, Truck, Calendar, Building2, MapPin } from "lucide-react"
import type { PrizeOrderDocument, PrizeDeliveryInfoByVendor } from "@/types/lottery"

type ProductWithOrder = {
  id: number
  projectName?: string
  projectNumber?: string
  eventDate?: string
  hallNames?: string[]
  order: PrizeOrderDocument
}

export type PrizeVendorDashboardViewProps = {
  ordersGroupedByStatus: {
    pending: { label: string; orders: ProductWithOrder[] }
    shipped: { label: string; orders: ProductWithOrder[] }
  }
  selectedProductId: number | null
  selectedOrder: ProductWithOrder | null
  onSelectOrder: (item: ProductWithOrder) => void
  onCloseDetail: () => void
  getDeliveryInfo: (productId: number, vendorId: string) => PrizeDeliveryInfoByVendor | null

  // 配送情報モーダル
  showDeliveryModal: boolean
  carrierName: string
  trackingNumber: string
  shippedAt: string
  onCarrierNameChange: (value: string) => void
  onTrackingNumberChange: (value: string) => void
  onShippedAtChange: (value: string) => void
  onOpenDeliveryModal: (item: ProductWithOrder) => void
  onSaveDelivery: () => void
  onCloseDeliveryModal: () => void
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: "bg-amber-600 text-white",
  shipped: "bg-green-600 text-white",
}

export const PrizeVendorDashboardView = ({
  ordersGroupedByStatus,
  selectedProductId,
  selectedOrder,
  onSelectOrder,
  onCloseDetail,
  getDeliveryInfo,
  showDeliveryModal,
  carrierName,
  trackingNumber,
  shippedAt,
  onCarrierNameChange,
  onTrackingNumberChange,
  onShippedAtChange,
  onOpenDeliveryModal,
  onSaveDelivery,
  onCloseDeliveryModal,
}: PrizeVendorDashboardViewProps) => {
  const hasAnyOrders = ordersGroupedByStatus.pending.orders.length > 0 || ordersGroupedByStatus.shipped.orders.length > 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">景品業者 ダッシュボード</h1>
        <p className="text-slate-600 mt-1">景品発注依頼の確認と配送情報の入力</p>
      </div>

      {/* メインコンテンツ: 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左パネル: 発注一覧 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-emerald-600" />
                景品発注依頼一覧
              </CardTitle>
              <CardDescription>発注依頼と配送済みの一覧</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasAnyOrders && (
                <div className="text-center py-8 text-slate-500">
                  <Gift className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>景品発注依頼はありません</p>
                </div>
              )}

              {/* 配送情報未入力 */}
              {ordersGroupedByStatus.pending.orders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">
                    {ordersGroupedByStatus.pending.label}
                    <span className="ml-1.5 text-slate-400">({ordersGroupedByStatus.pending.orders.length})</span>
                  </h3>
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {ordersGroupedByStatus.pending.orders.map((item) => (
                      <li key={`${item.id}-${item.order.vendorId}`}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-between h-auto py-3 px-4 ${
                            item.id === selectedProductId ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""
                          }`}
                          onClick={() => onSelectOrder(item)}
                        >
                          <div className="flex flex-col items-start gap-1.5 text-left flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={STATUS_BADGE_CLASS.pending}>未配送</Badge>
                              <span className="font-medium text-slate-900">{item.order.vendorName}</span>
                            </div>
                            <span className="text-xs text-slate-500">案件: {item.projectName || item.projectNumber}</span>
                            <span className="text-xs text-slate-500">
                              発注日: {new Date(item.order.requestedAt).toLocaleDateString("ja-JP")}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 ml-2" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 配送済み */}
              {ordersGroupedByStatus.shipped.orders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">
                    {ordersGroupedByStatus.shipped.label}
                    <span className="ml-1.5 text-slate-400">({ordersGroupedByStatus.shipped.orders.length})</span>
                  </h3>
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {ordersGroupedByStatus.shipped.orders.map((item) => (
                      <li key={`${item.id}-${item.order.vendorId}`}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-between h-auto py-3 px-4 ${
                            item.id === selectedProductId ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""
                          }`}
                          onClick={() => onSelectOrder(item)}
                        >
                          <div className="flex flex-col items-start gap-1.5 text-left flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={STATUS_BADGE_CLASS.shipped}>完了</Badge>
                              <span className="font-medium text-slate-900">{item.order.vendorName}</span>
                            </div>
                            <span className="text-xs text-slate-500">案件: {item.projectName || item.projectNumber}</span>
                            {(() => {
                              const delivery = getDeliveryInfo(item.id, item.order.vendorId)
                              return delivery?.shippedAt ? (
                                <span className="text-xs text-slate-500">配送日: {delivery.shippedAt}</span>
                              ) : null
                            })()}
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 ml-2" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右パネル: 発注詳細 */}
        <div className="lg:col-span-2">
          {!selectedOrder && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  <Gift className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p>左の一覧から景品発注依頼を選択してください</p>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedOrder && (
            <div className="space-y-6">
              {/* 発注詳細カード */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        景品発注依頼
                        {(() => {
                          const delivery = getDeliveryInfo(selectedOrder.id, selectedOrder.order.vendorId)
                          return delivery?.shippedAt ? (
                            <Badge className={STATUS_BADGE_CLASS.shipped}>配送済み</Badge>
                          ) : (
                            <Badge className={STATUS_BADGE_CLASS.pending}>未配送</Badge>
                          )
                        })()}
                      </CardTitle>
                      <CardDescription className="mt-1">業者: {selectedOrder.order.vendorName}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onCloseDetail}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 案件情報 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-slate-600">案件番号</Label>
                      <p className="font-medium">{selectedOrder.projectNumber || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">案件名</Label>
                      <p className="font-medium">{selectedOrder.projectName || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">イベント日</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {selectedOrder.eventDate || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">発注日</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(selectedOrder.order.requestedAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>

                  {/* ホール情報 */}
                  {selectedOrder.hallNames && selectedOrder.hallNames.length > 0 && (
                    <div>
                      <Label className="text-sm text-slate-600 mb-2 block flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        対象ホール
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedOrder.hallNames.map((hall, idx) => (
                          <Badge key={idx} variant="secondary">
                            {hall}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 発注景品一覧 */}
                  <div>
                    <Label className="text-sm text-slate-600 mb-2 block flex items-center gap-1">
                      <Gift className="h-4 w-4" />
                      発注景品
                    </Label>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left">順位</th>
                            <th className="px-3 py-2 text-left">景品名</th>
                            <th className="px-3 py-2 text-left">数量</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedOrder.order.prizeItems.map((prize, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2">{prize.rank}</td>
                              <td className="px-3 py-2">{prize.name}</td>
                              <td className="px-3 py-2">{prize.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 配送情報 */}
                  {(() => {
                    const delivery = getDeliveryInfo(selectedOrder.id, selectedOrder.order.vendorId)
                    if (delivery && delivery.shippedAt) {
                      return (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                          <Label className="text-sm text-green-700 mb-1 block flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            配送情報
                          </Label>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-green-600 font-medium">配送業者:</span>
                              <span className="ml-2">{delivery.carrierName}</span>
                            </div>
                            <div>
                              <span className="text-green-600 font-medium">追跡番号:</span>
                              <span className="ml-2">{delivery.trackingNumber}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-green-600 font-medium">配送日時:</span>
                              <span className="ml-2">{delivery.shippedAt}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}
                </CardContent>
              </Card>

              {/* アクションボタン */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">アクション</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full gap-2" onClick={() => onOpenDeliveryModal(selectedOrder)}>
                    <Truck className="h-4 w-4" />
                    {getDeliveryInfo(selectedOrder.id, selectedOrder.order.vendorId)?.shippedAt
                      ? "配送情報を編集"
                      : "配送情報を入力"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* 配送情報入力モーダル */}
      <Dialog open={showDeliveryModal} onOpenChange={onCloseDeliveryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配送情報を入力</DialogTitle>
            <DialogDescription>景品の配送情報を入力してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="carrier-name">配送業者</Label>
              <Input
                id="carrier-name"
                placeholder="例: ヤマト運輸"
                value={carrierName}
                onChange={(e) => onCarrierNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking-number">追跡番号</Label>
              <Input
                id="tracking-number"
                placeholder="例: 1234567890"
                value={trackingNumber}
                onChange={(e) => onTrackingNumberChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipped-at">配送日時</Label>
              <Input
                id="shipped-at"
                type="datetime-local"
                value={shippedAt}
                onChange={(e) => onShippedAtChange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDeliveryModal}>
              キャンセル
            </Button>
            <Button onClick={onSaveDelivery} disabled={!carrierName.trim() || !trackingNumber.trim() || !shippedAt.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
