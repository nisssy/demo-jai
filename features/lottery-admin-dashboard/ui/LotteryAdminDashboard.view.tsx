import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Award, FileUp, Palette, Gift, Calendar, MapPin, CheckCircle, Clock } from "lucide-react"
import type { DesignRequest, PrizeOrderDocument } from "@/types/lottery"

type LotteryProduct = {
  id: number
  projectNumber?: string
  projectName?: string
  hallNames?: string[]
  eventStartDate?: string
  eventEndDate?: string
  area?: string
  prizeInfo?: any[]
  winnerListUploadedAt?: string
  prizeOrdersByVendor?: PrizeOrderDocument[]
}

type DesignVendor = {
  id: number
  name: string
  email?: string
}

export type LotteryAdminDashboardViewProps = {
  activeTab: "projects" | "designs" | "prizes"
  onActiveTabChange: (tab: "projects" | "designs" | "prizes") => void

  // データ
  lotteryProducts: LotteryProduct[]
  selectedProduct: LotteryProduct | null
  selectedProductId: number | null
  allDesignRequests: DesignRequest[]
  designVendors: DesignVendor[]
  onSelectProduct: (product: LotteryProduct) => void

  // 当選者リストモーダル
  showWinnerListModal: boolean
  winnerListFile: string
  onWinnerListFileChange: (value: string) => void
  onOpenWinnerListModal: (product: LotteryProduct) => void
  onUploadWinnerList: () => void
  onCloseWinnerListModal: () => void

  // デザイン依頼モーダル
  showDesignRequestModal: boolean
  designRequestType: DesignRequest["requestType"]
  designVendorId: string
  onDesignRequestTypeChange: (value: DesignRequest["requestType"]) => void
  onDesignVendorIdChange: (value: string) => void
  onOpenDesignRequestModal: (product: LotteryProduct) => void
  onCreateDesignRequest: () => void
  onCloseDesignRequestModal: () => void

  // 景品発注モーダル
  showPrizeOrderModal: boolean
  onOpenPrizeOrderModal: (product: LotteryProduct) => void
  onGeneratePrizeOrder: () => void
  onClosePrizeOrderModal: () => void
}

const getRequestTypeLabel = (type: DesignRequest["requestType"]) => {
  switch (type) {
    case "poster":
      return "ポスター"
    case "dm":
      return "DM"
    case "winner-list":
      return "当選通知書"
    default:
      return type
  }
}

export const LotteryAdminDashboardView = ({
  activeTab,
  onActiveTabChange,
  lotteryProducts,
  selectedProduct,
  selectedProductId,
  allDesignRequests,
  designVendors,
  onSelectProduct,
  showWinnerListModal,
  winnerListFile,
  onWinnerListFileChange,
  onOpenWinnerListModal,
  onUploadWinnerList,
  onCloseWinnerListModal,
  showDesignRequestModal,
  designRequestType,
  designVendorId,
  onDesignRequestTypeChange,
  onDesignVendorIdChange,
  onOpenDesignRequestModal,
  onCreateDesignRequest,
  onCloseDesignRequestModal,
  showPrizeOrderModal,
  onOpenPrizeOrderModal,
  onGeneratePrizeOrder,
  onClosePrizeOrderModal,
}: LotteryAdminDashboardViewProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <Award className="h-7 w-7 text-rose-600" />
          事務管理課（抽選管理）ダッシュボード
        </h1>
        <p className="text-slate-600 mt-1">合同抽選会の管理、当選者リスト、デザイン依頼、景品発注</p>
      </div>

      {/* タブ */}
      <Tabs value={activeTab} onValueChange={(value) => onActiveTabChange(value as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="projects" className="gap-2">
            <Award className="h-4 w-4" />
            案件管理
          </TabsTrigger>
          <TabsTrigger value="designs" className="gap-2">
            <Palette className="h-4 w-4" />
            デザイン依頼管理
          </TabsTrigger>
          <TabsTrigger value="prizes" className="gap-2">
            <Gift className="h-4 w-4" />
            景品発注・配送管理
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: 案件管理 */}
        <TabsContent value="projects" className="space-y-6 mt-6">
          {lotteryProducts.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  <Award className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p>合同抽選会の案件はありません</p>
                </div>
              </CardContent>
            </Card>
          )}

          {lotteryProducts.length > 0 && (
            <div className="grid gap-4">
              {lotteryProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {product.projectName || `案件 ${product.projectNumber}`}
                          {product.winnerListUploadedAt && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              当選者リスト登録済み
                            </Badge>
                          )}
                          {product.prizeOrdersByVendor && product.prizeOrdersByVendor.length > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              <Gift className="h-3 w-3 mr-1" />
                              発注書生成済み
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">案件番号: {product.projectNumber}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 案件情報 */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-slate-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          期間
                        </Label>
                        <p className="font-medium">
                          {product.eventStartDate} 〜 {product.eventEndDate}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          エリア
                        </Label>
                        <p className="font-medium">{product.area || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">対象ホール数</Label>
                        <p className="font-medium">{product.hallNames?.length || 0}店舗</p>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => onOpenWinnerListModal(product)}>
                        <FileUp className="h-4 w-4" />
                        {product.winnerListUploadedAt ? "当選者リストを更新" : "当選者リストをアップロード"}
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => onOpenDesignRequestModal(product)}>
                        <Palette className="h-4 w-4" />
                        デザイン依頼を作成
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => onOpenPrizeOrderModal(product)}
                        disabled={!product.prizeInfo || product.prizeInfo.length === 0}
                      >
                        <Gift className="h-4 w-4" />
                        景品発注書を生成
                      </Button>
                    </div>

                    {/* 景品情報 */}
                    {product.prizeInfo && product.prizeInfo.length > 0 && (
                      <div className="border-t pt-4">
                        <Label className="text-xs text-slate-600 mb-2 block">景品一覧</Label>
                        <div className="flex flex-wrap gap-2">
                          {product.prizeInfo.map((prize: any, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {prize.rank}: {prize.name} ({prize.quantity})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: デザイン依頼管理 */}
        <TabsContent value="designs" className="space-y-6 mt-6">
          {allDesignRequests.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  <Palette className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p>デザイン依頼はありません</p>
                </div>
              </CardContent>
            </Card>
          )}

          {allDesignRequests.length > 0 && (
            <div className="grid gap-4">
              {allDesignRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getRequestTypeLabel(request.requestType)}デザイン依頼
                          <Badge className={request.status === "uploaded" ? "bg-green-600" : "bg-amber-600"}>
                            {request.status === "uploaded" ? "完了" : "依頼中"}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          案件: {request.projectName || request.projectNumber} / 業者: {request.vendorName}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-slate-600">依頼日時</Label>
                        <p className="font-medium">{new Date(request.requestedAt).toLocaleString("ja-JP")}</p>
                      </div>
                      {request.uploadedAt && (
                        <div>
                          <Label className="text-xs text-slate-600">アップロード日時</Label>
                          <p className="font-medium">{new Date(request.uploadedAt).toLocaleString("ja-JP")}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: 景品発注・配送管理 */}
        <TabsContent value="prizes" className="space-y-6 mt-6">
          {lotteryProducts.filter((p) => p.prizeOrdersByVendor && p.prizeOrdersByVendor.length > 0).length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  <Gift className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p>景品発注はありません</p>
                </div>
              </CardContent>
            </Card>
          )}

          {lotteryProducts
            .filter((p) => p.prizeOrdersByVendor && p.prizeOrdersByVendor.length > 0)
            .map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.projectName || `案件 ${product.projectNumber}`}</CardTitle>
                  <CardDescription>景品発注書: {product.prizeOrdersByVendor?.length || 0}業者</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.prizeOrdersByVendor?.map((order, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{order.vendorName}</span>
                          <Badge variant="secondary">{order.prizeItems.length}品目</Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          発注日: {new Date(order.requestedAt).toLocaleDateString("ja-JP")}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* 当選者リストアップロードモーダル */}
      <Dialog open={showWinnerListModal} onOpenChange={onCloseWinnerListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>当選者リストをアップロード</DialogTitle>
            <DialogDescription>当選者リストのCSVファイル名を入力してください（デモ用）</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="winner-list-file">ファイル名</Label>
              <Input
                id="winner-list-file"
                placeholder="例: winner_list_2025.csv"
                value={winnerListFile}
                onChange={(e) => onWinnerListFileChange(e.target.value)}
              />
              <p className="text-xs text-slate-500">※デモ用に3名の当選者データが自動登録されます</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseWinnerListModal}>
              キャンセル
            </Button>
            <Button onClick={onUploadWinnerList} disabled={!winnerListFile.trim()}>
              アップロード
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* デザイン依頼作成モーダル */}
      <Dialog open={showDesignRequestModal} onOpenChange={onCloseDesignRequestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>デザイン依頼を作成</DialogTitle>
            <DialogDescription>デザインの種類と依頼先を選択してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="design-type">デザインの種類</Label>
              <Select value={designRequestType} onValueChange={(value) => onDesignRequestTypeChange(value as DesignRequest["requestType"])}>
                <SelectTrigger id="design-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poster">ポスター</SelectItem>
                  <SelectItem value="dm">DM</SelectItem>
                  <SelectItem value="winner-list">当選通知書</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="design-vendor">デザイン業者</Label>
              <Select value={designVendorId} onValueChange={onDesignVendorIdChange}>
                <SelectTrigger id="design-vendor">
                  <SelectValue placeholder="業者を選択..." />
                </SelectTrigger>
                <SelectContent>
                  {designVendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDesignRequestModal}>
              キャンセル
            </Button>
            <Button onClick={onCreateDesignRequest} disabled={!designVendorId}>
              依頼を作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 景品発注書生成モーダル */}
      <Dialog open={showPrizeOrderModal} onOpenChange={onClosePrizeOrderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>景品発注書を生成</DialogTitle>
            <DialogDescription>登録された景品情報から業者別の発注書を自動生成します</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-700">
              景品情報を業者ごとにグループ化し、発注書を生成します。生成後は景品業者画面から確認・配送情報入力が可能になります。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClosePrizeOrderModal}>
              キャンセル
            </Button>
            <Button onClick={onGeneratePrizeOrder}>発注書を生成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
