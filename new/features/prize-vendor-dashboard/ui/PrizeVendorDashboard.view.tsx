import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { OrderEntry, DeliveryFormRow, SelectedKey } from "../hooks/usePrizeVendorDashboard"

// ─── Sub-components ───

type OrderCardProps = {
  entry: OrderEntry
  isSelected: boolean
  onSelect: (productId: number, vendorId: string) => void
}

const OrderCard = ({ entry, isSelected, onSelect }: OrderCardProps) => {
  const { product, order } = entry
  const itemCount = order.prizeItems.reduce(
    (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
    0
  )

  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "hover:border-gray-400"
      }`}
      onClick={() => onSelect(product.id, order.vendorId)}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{product.projectNumber}</span>
          <Badge variant="secondary">{itemCount}点</Badge>
        </div>
        <p className="text-sm font-medium truncate">{product.eventProductName}</p>
        <p className="text-sm text-gray-600">{order.vendorName}</p>
        <p className="text-xs text-gray-400">
          発注日: {order.requestedAt}
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Order detail: prize items + winner info ───

type OrderPreviewSectionProps = {
  entry: OrderEntry
  deliveryForm: DeliveryFormRow[]
}

const OrderPreviewSection = ({ entry, deliveryForm }: OrderPreviewSectionProps) => {
  const { order } = entry
  const totalQuantity = order.prizeItems.reduce(
    (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
    0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">発注書</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order info */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-gray-500">業者名: </span>
            <span className="font-medium">{order.vendorName}</span>
          </div>
          <div>
            <span className="text-gray-500">発注日: </span>
            <span>{order.requestedAt}</span>
          </div>
          {order.desiredDeliveryDate && (
            <div>
              <span className="text-gray-500">納品希望日: </span>
              <span className="font-medium text-orange-600">{order.desiredDeliveryDate}</span>
            </div>
          )}
        </div>

        {/* Prize items table */}
        <div>
          <h4 className="text-sm font-semibold mb-2">景品一覧</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">等級</TableHead>
                <TableHead>景品名</TableHead>
                <TableHead className="w-[80px] text-right">数量</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.prizeItems.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.rank}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-gray-50">
                <TableCell colSpan={2}>合計</TableCell>
                <TableCell className="text-right">{totalQuantity}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Winner / recipient list */}
        {deliveryForm.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">配送先一覧</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>当選者名</TableHead>
                  <TableHead>景品</TableHead>
                  <TableHead>住所</TableHead>
                  <TableHead>電話番号</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryForm.map((row) => (
                  <TableRow key={row.winnerId}>
                    <TableCell className="font-medium">{row.winnerName}</TableCell>
                    <TableCell className="text-sm text-gray-600">{row.prize}</TableCell>
                    <TableCell className="text-sm">{row.winnerAddress || "-"}</TableCell>
                    <TableCell className="text-sm">{row.winnerPhone || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Unified delivery form section ───

type DeliveryFormSectionProps = {
  deliveryForm: DeliveryFormRow[]
  onUpdateRow: (index: number, field: keyof DeliveryFormRow, value: string) => void
  onSave: () => void
}

const DeliveryFormSection = ({ deliveryForm, onUpdateRow, onSave }: DeliveryFormSectionProps) => {
  if (deliveryForm.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">配送情報</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            対象の当選者がいません。当選者リストがアップロードされていないか、この業者の景品に該当する当選者がありません。
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">配送情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {deliveryForm.map((row, idx) => (
            <div key={row.winnerId} className="border rounded-lg p-3 space-y-2">
              {/* Winner info (read-only) */}
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium">{row.winnerName}</span>
                <Badge variant="outline" className="text-xs">{row.prize}</Badge>
              </div>
              <p className="text-xs text-gray-500">{row.winnerAddress || "住所未登録"}</p>

              {/* Editable delivery fields */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">配送業者</label>
                  <Input
                    value={row.carrierName}
                    onChange={(e) => onUpdateRow(idx, "carrierName", e.target.value)}
                    placeholder="例: ヤマト運輸"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">追跡番号</label>
                  <Input
                    value={row.trackingNumber}
                    onChange={(e) => onUpdateRow(idx, "trackingNumber", e.target.value)}
                    placeholder="追跡番号"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">発送日</label>
                  <Input
                    type="date"
                    value={row.shippedAt}
                    onChange={(e) => onUpdateRow(idx, "shippedAt", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">発送完了日</label>
                  <Input
                    type="date"
                    value={row.deliveredAt}
                    onChange={(e) => onUpdateRow(idx, "deliveredAt", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={onSave}>配送情報を保存</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main View ───

export type PrizeVendorDashboardViewProps = {
  orderEntries: OrderEntry[]
  selectedKey: SelectedKey
  selectedEntry: OrderEntry | null
  deliveryForm: DeliveryFormRow[]
  onSelect: (productId: number, vendorId: string) => void
  onUpdateDeliveryRow: (index: number, field: keyof DeliveryFormRow, value: string) => void
  onSaveDelivery: () => void
  billingTab: ReactNode
}

export const PrizeVendorDashboardView = ({
  orderEntries,
  selectedKey,
  selectedEntry,
  deliveryForm,
  onSelect,
  onUpdateDeliveryRow,
  onSaveDelivery,
  billingTab,
}: PrizeVendorDashboardViewProps) => {
  return (
    <Tabs defaultValue="orders" className="h-full flex flex-col">
      <TabsList className="mx-4 mt-4 w-fit">
        <TabsTrigger value="orders">発注・配送</TabsTrigger>
        <TabsTrigger value="billing">請求確認</TabsTrigger>
      </TabsList>

      <TabsContent value="orders" className="flex-1 overflow-hidden">
        <div className="flex h-full gap-4 p-4">
          {/* Left: Order list */}
          <div className="w-[350px] flex-shrink-0 space-y-3 overflow-y-auto">
            <h2 className="text-lg font-bold mb-2">景品発注一覧</h2>
            {orderEntries.length === 0 ? (
              <p className="text-sm text-gray-500 p-4">発注書がありません。</p>
            ) : (
              orderEntries.map((entry) => {
                const isSelected =
                  selectedKey !== null &&
                  selectedKey.productId === entry.productId &&
                  selectedKey.vendorId === entry.order.vendorId
                return (
                  <OrderCard
                    key={`${entry.productId}-${entry.order.vendorId}`}
                    entry={entry}
                    isSelected={isSelected}
                    onSelect={onSelect}
                  />
                )
              })
            )}
          </div>

          {/* Right: Selected order detail */}
          <div className="flex-1 space-y-4 overflow-y-auto">
            {!selectedEntry ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>左のリストから発注書を選択してください</p>
              </div>
            ) : (
              <>
                <OrderPreviewSection entry={selectedEntry} deliveryForm={deliveryForm} />
                <DeliveryFormSection
                  deliveryForm={deliveryForm}
                  onUpdateRow={onUpdateDeliveryRow}
                  onSave={onSaveDelivery}
                />
              </>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="billing" className="flex-1 overflow-hidden">
        {billingTab}
      </TabsContent>
    </Tabs>
  )
}
