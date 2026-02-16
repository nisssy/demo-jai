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
import type { OrderEntry, DeliveryFormRow, SelectedKey } from "../hooks/usePrizeVendorDashboard"
import type { DeliveryInfo } from "@/new/api/types"

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

// ─── Order detail: prize items table ───

type OrderPreviewSectionProps = {
  entry: OrderEntry
}

const OrderPreviewSection = ({ entry }: OrderPreviewSectionProps) => {
  const { order } = entry
  const totalQuantity = order.prizeItems.reduce(
    (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
    0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">発注書プレビュー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">業者名:</span>
          <span className="font-medium">{order.vendorName}</span>
          <span className="text-gray-500 ml-4">発注日:</span>
          <span>{order.requestedAt}</span>
        </div>
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
      </CardContent>
    </Card>
  )
}

// ─── Delivery form section ───

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
          <CardTitle className="text-base">配送情報入力</CardTitle>
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
        <CardTitle className="text-base">配送情報入力</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">当選者名</TableHead>
              <TableHead className="w-[120px]">景品</TableHead>
              <TableHead className="w-[140px]">配送業者</TableHead>
              <TableHead className="w-[160px]">追跡番号</TableHead>
              <TableHead className="w-[140px]">発送日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveryForm.map((row, idx) => (
              <TableRow key={row.winnerId}>
                <TableCell className="font-medium">{row.winnerName}</TableCell>
                <TableCell className="text-sm text-gray-600">{row.prize}</TableCell>
                <TableCell>
                  <Input
                    value={row.carrierName}
                    onChange={(e) => onUpdateRow(idx, "carrierName", e.target.value)}
                    placeholder="例: ヤマト運輸"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.trackingNumber}
                    onChange={(e) => onUpdateRow(idx, "trackingNumber", e.target.value)}
                    placeholder="追跡番号"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={row.shippedAt}
                    onChange={(e) => onUpdateRow(idx, "shippedAt", e.target.value)}
                    className="h-8 text-sm"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end">
          <Button onClick={onSave}>配送情報を保存</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Existing deliveries section ───

type ExistingDeliveriesSectionProps = {
  deliveries: DeliveryInfo[]
}

const ExistingDeliveriesSection = ({ deliveries }: ExistingDeliveriesSectionProps) => {
  if (deliveries.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">既存配送情報</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>当選者名</TableHead>
              <TableHead>配送業者</TableHead>
              <TableHead>追跡番号</TableHead>
              <TableHead>発送日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((d) => (
              <TableRow key={d.winnerId}>
                <TableCell className="font-medium">{d.winnerName}</TableCell>
                <TableCell>{d.carrierName ?? "-"}</TableCell>
                <TableCell>{d.trackingNumber ?? "-"}</TableCell>
                <TableCell>{d.shippedAt ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ─── Main View ───

export type PrizeVendorDashboardViewProps = {
  orderEntries: OrderEntry[]
  selectedKey: SelectedKey
  selectedEntry: OrderEntry | null
  existingDeliveries: DeliveryInfo[]
  deliveryForm: DeliveryFormRow[]
  onSelect: (productId: number, vendorId: string) => void
  onUpdateDeliveryRow: (index: number, field: keyof DeliveryFormRow, value: string) => void
  onSaveDelivery: () => void
}

export const PrizeVendorDashboardView = ({
  orderEntries,
  selectedKey,
  selectedEntry,
  existingDeliveries,
  deliveryForm,
  onSelect,
  onUpdateDeliveryRow,
  onSaveDelivery,
}: PrizeVendorDashboardViewProps) => {
  return (
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
            <OrderPreviewSection entry={selectedEntry} />
            <DeliveryFormSection
              deliveryForm={deliveryForm}
              onUpdateRow={onUpdateDeliveryRow}
              onSave={onSaveDelivery}
            />
            <ExistingDeliveriesSection deliveries={existingDeliveries} />
          </>
        )}
      </div>
    </div>
  )
}
